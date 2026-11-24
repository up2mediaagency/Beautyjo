import { jsPDF } from 'jspdf';
import { Booth } from '../types';
import { FloorPlanLayoutConfig } from '../data/layouts';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function traceLShapePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * 0.39, y);
  ctx.lineTo(x + w * 0.39, y + h * 0.59);
  ctx.lineTo(x + w, y + h * 0.59);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      // If a single word is wider than maxWidth, break it by characters
      if (ctx.measureText(word).width > maxWidth) {
        let chunk = '';
        for (const ch of word) {
          if (ctx.measureText(chunk + ch).width <= maxWidth) {
            chunk += ch;
          } else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawAutoFitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  maxW: number,
  maxH: number,
  color: string,
  startFontSize = 11,
  minFontSize = 4
) {
  if (!text.trim() || maxW <= 2 || maxH <= 2) return;

  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let fontSize = startFontSize;
  let lines: string[] = [text];
  let lineHeight = fontSize * 1.15;

  while (fontSize >= minFontSize) {
    ctx.font = `700 ${fontSize}px Cairo, Arial, sans-serif`;
    lines = wrapTextLines(ctx, text, maxW);
    lineHeight = fontSize * 1.15;
    const totalH = lines.length * lineHeight;
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width), 0);
    if (totalH <= maxH && widest <= maxW) {
      break;
    }
    fontSize -= 0.5;
  }

  const totalH = lines.length * lineHeight;
  let y = cy - totalH / 2 + lineHeight / 2;
  for (const line of lines) {
    ctx.fillText(line, cx, y);
    y += lineHeight;
  }
  ctx.restore();
}

export async function renderFloorPlanToCanvas(
  layout: FloorPlanLayoutConfig,
  booths: Booth[],
  showBoothLabels: boolean
): Promise<HTMLCanvasElement> {
  // Wait for custom Arabic fonts (Cairo) to be ready for crisp text rendering
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready;
  }

  // 6x scale for ultra-sharp ~600 DPI on A4 & crystal-clear PNG
  const SCALE = 6;
  const canvas = document.createElement('canvas');
  canvas.width = layout.width * SCALE;
  canvas.height = layout.height * SCALE;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize 2D canvas context');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = layout.floorFillColor;
  ctx.fillRect(0, 0, layout.width, layout.height);

  // 1. Draw locked background image (original full-res image)
  const bg = await loadImage(layout.imageSrc);
  ctx.drawImage(bg, 0, 0, layout.width, layout.height);

  // 2. Cover original booth spots with floor fill when moved or resized
  for (const booth of booths) {
    const hasMovedOrResized =
      booth.x !== booth.defaultX ||
      booth.y !== booth.defaultY ||
      booth.w !== booth.defaultW ||
      booth.h !== booth.defaultH;

    if (!hasMovedOrResized) continue;

    ctx.save();
    ctx.fillStyle = layout.floorFillColor;
    if (booth.shape === 'l-shape') {
      traceLShapePath(
        ctx,
        booth.defaultX - 1,
        booth.defaultY - 1,
        booth.defaultW + 2,
        booth.defaultH + 2
      );
      ctx.fill();
    } else {
      ctx.fillRect(
        booth.defaultX - 1,
        booth.defaultY - 1,
        booth.defaultW + 2,
        booth.defaultH + 2
      );
    }
    ctx.restore();
  }

  // 3. Preload all booth logos
  const logoMap = new Map<string, HTMLImageElement>();
  await Promise.all(
    booths.map(async (b) => {
      if (b.logoDataUrl) {
        try {
          const img = await loadImage(b.logoDataUrl);
          logoMap.set(b.id, img);
        } catch {
          // Ignore broken logo
        }
      }
    })
  );

  // 4. Draw booths that are modified OR have labels hidden
  for (const booth of booths) {
    const hasBrand =
      booth.exhibitorName.trim() !== '' || booth.logoDataUrl !== null;
    const hasMovedOrResized =
      booth.x !== booth.defaultX ||
      booth.y !== booth.defaultY ||
      booth.w !== booth.defaultW ||
      booth.h !== booth.defaultH;
    const shouldHideCode = !showBoothLabels || Boolean(booth.hideCode);
    const isModified = hasBrand || hasMovedOrResized || shouldHideCode;

    if (!isModified) continue;

    const bx = booth.x - 1;
    const by = booth.y - 1;
    const bw = booth.w + 2;
    const bh = booth.h + 2;

    ctx.save();
    if (booth.shape === 'l-shape') {
      traceLShapePath(ctx, bx, by, bw, bh);
      ctx.fillStyle = booth.color;
      ctx.fill();
      ctx.clip();
    } else {
      ctx.fillStyle = booth.color;
      ctx.fillRect(bx, by, bw, bh);
      if (layout.id === 'ramadan59') {
        ctx.strokeStyle = '#9c8248';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      }
    }

    // Content area: for Q1 L-shape, use the bottom horizontal arm (59%..100% height)
    const contentX = bx + 2;
    const contentY =
      booth.shape === 'l-shape' ? by + bh * 0.59 + 1 : by + 2;
    const contentW = bw - 4;
    const contentH =
      booth.shape === 'l-shape' ? bh * 0.41 - 3 : bh - 4;

    const showCode =
      !shouldHideCode && !(booth.displayMode === 'logo' && booth.logoDataUrl);
    const showLogo =
      Boolean(booth.logoDataUrl && logoMap.has(booth.id)) &&
      (booth.displayMode === 'both' || booth.displayMode === 'logo');
    const showName =
      booth.exhibitorName.trim() !== '' &&
      (booth.displayMode === 'both' || booth.displayMode === 'name');

    let cursorY = contentY;
    let remainingH = contentH;

    if (showCode) {
      const codeFontSize = Math.min(9, Math.max(5.5, Math.min(contentW, contentH) * 0.24));
      const codeH = codeFontSize + 2;
      ctx.fillStyle = booth.textColor;
      ctx.font = `800 ${codeFontSize}px Cairo, Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(booth.code, contentX + contentW / 2, cursorY);
      cursorY += codeH;
      remainingH = Math.max(4, remainingH - codeH);
    }

    if (showLogo && showName) {
      const logoAreaH = remainingH * 0.55;
      const nameAreaH = remainingH * 0.45;
      const img = logoMap.get(booth.id)!;
      const ratio = Math.min(
        (contentW * booth.logoScale) / img.width,
        (logoAreaH * booth.logoScale) / img.height
      );
      const drawW = img.width * ratio;
      const drawH = img.height * ratio;
      ctx.drawImage(
        img,
        contentX + (contentW - drawW) / 2,
        cursorY + (logoAreaH - drawH) / 2,
        drawW,
        drawH
      );

      drawAutoFitText(
        ctx,
        booth.exhibitorName,
        contentX + contentW / 2,
        cursorY + logoAreaH + nameAreaH / 2,
        contentW,
        nameAreaH,
        booth.textColor,
        9,
        4
      );
    } else if (showLogo) {
      const img = logoMap.get(booth.id)!;
      const ratio = Math.min(
        (contentW * booth.logoScale) / img.width,
        (remainingH * booth.logoScale) / img.height
      );
      const drawW = img.width * ratio;
      const drawH = img.height * ratio;
      let lx = contentX + (contentW - drawW) / 2;
      let ly = cursorY + (remainingH - drawH) / 2;
      if (booth.logoAlign === 'top') ly = cursorY;
      if (booth.logoAlign === 'bottom') ly = cursorY + remainingH - drawH;
      if (booth.logoAlign === 'left') lx = contentX;
      if (booth.logoAlign === 'right') lx = contentX + contentW - drawW;
      ctx.drawImage(img, lx, ly, drawW, drawH);
    } else if (showName) {
      drawAutoFitText(
        ctx,
        booth.exhibitorName,
        contentX + contentW / 2,
        cursorY + remainingH / 2,
        contentW,
        remainingH,
        booth.textColor,
        10.5,
        4
      );
    }

    ctx.restore();
  }

  return canvas;
}

export async function downloadFloorPlanPng(
  layout: FloorPlanLayoutConfig,
  booths: Booth[],
  showBoothLabels: boolean
) {
  const canvas = await renderFloorPlanToCanvas(layout, booths, showBoothLabels);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png', 1.0)
  );
  if (!blob) {
    throw new Error('Failed to generate PNG blob');
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${layout.exportFilePrefix}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadFloorPlanPdf(
  layout: FloorPlanLayoutConfig,
  booths: Booth[],
  showBoothLabels: boolean
) {
  const canvas = await renderFloorPlanToCanvas(layout, booths, showBoothLabels);
  const imgData = canvas.toDataURL('image/png', 1.0);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;

  const ratio = Math.min(maxW / layout.width, maxH / layout.height);
  const drawW = layout.width * ratio;
  const drawH = layout.height * ratio;
  const offsetX = (pageW - drawW) / 2;
  const offsetY = (pageH - drawH) / 2;

  pdf.addImage(imgData, 'PNG', offsetX, offsetY, drawW, drawH, undefined, 'NONE');
  pdf.save(`${layout.exportFilePrefix}.pdf`);
}
