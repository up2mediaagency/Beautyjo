import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { AlignmentGuide, Booth } from '../types';
import { FloorPlanLayoutConfig } from '../data/layouts';
import { SwapMode } from './BoothEditorPanel';

const L_SHAPE_CLIP =
  'polygon(0% 0%, 39% 0%, 39% 59%, 100% 59%, 100% 100%, 0% 100%)';

interface AutoFitTextProps {
  text: string;
  maxFontSize?: number;
  minFontSize?: number;
  boxW: number;
  boxH: number;
  className?: string;
}

const AutoFitText: React.FC<AutoFitTextProps> = ({
  text,
  maxFontSize = 11,
  minFontSize = 4,
  boxW,
  boxH,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<number>(maxFontSize);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const el = textRef.current;
    if (!container || !el) return;

    let size = maxFontSize;
    el.style.fontSize = `${size}px`;

    while (
      size > minFontSize &&
      (el.scrollHeight > container.clientHeight + 1 ||
        el.scrollWidth > container.clientWidth + 1)
    ) {
      size = Number((size - 0.5).toFixed(1));
      el.style.fontSize = `${size}px`;
    }
    setFontSize(size);
  }, [text, maxFontSize, minFontSize, boxW, boxH]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden px-0.5"
    >
      <span
        ref={textRef}
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.12 }}
        className={`w-full whitespace-normal break-words text-center font-bold ${className}`}
      >
        {text}
      </span>
    </div>
  );
};

interface FloorPlanCanvasProps {
  layout: FloorPlanLayoutConfig;
  booths: Booth[];
  selectedBoothId: string | null;
  swapMode: SwapMode;
  matchingIds: Set<string>;
  isFilterActive: boolean;
  showBoothLabels: boolean;
  isExporting: boolean;
  exportRef: React.RefObject<HTMLDivElement>;
  onSelectBooth: (id: string | null) => void;
  onUpdateBooth: (id: string, patch: Partial<Booth>) => void;
}

type DragState =
  | {
      mode: 'move';
      boothId: string;
      startClientX: number;
      startClientY: number;
      origX: number;
      origY: number;
      hasMoved: boolean;
    }
  | {
      mode: 'resize';
      boothId: string;
      handle: 'nw' | 'ne' | 'sw' | 'se';
      startClientX: number;
      startClientY: number;
      origX: number;
      origY: number;
      origW: number;
      origH: number;
    };

export const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  layout,
  booths,
  selectedBoothId,
  swapMode,
  matchingIds,
  isFilterActive,
  showBoothLabels,
  isExporting,
  exportRef,
  onSelectBooth,
  onUpdateBooth,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.78);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [guides, setGuides] = useState<AlignmentGuide[]>([]);

  const fitToScreen = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const pad = 40;
    const scaleX = (el.clientWidth - pad) / layout.width;
    const scaleY = (el.clientHeight - pad) / layout.height;
    const next = Math.min(scaleX, scaleY, 1.15);
    setZoom(Math.max(0.35, Number(next.toFixed(2))));
  }, [layout.width, layout.height]);

  useEffect(() => {
    fitToScreen();
    window.addEventListener('resize', fitToScreen);
    return () => window.removeEventListener('resize', fitToScreen);
  }, [fitToScreen]);

  // Keyboard zoom controls (Ctrl/Cmd + Plus, Minus, 0) & Ctrl + Mouse Wheel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;

      if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
        e.preventDefault();
        setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))));
      } else if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        setZoom((z) => Math.max(0.35, Number((z - 0.1).toFixed(2))));
      } else if (e.key === '0' || e.code === 'Numpad0') {
        e.preventDefault();
        fitToScreen();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom((z) =>
        Math.min(3, Math.max(0.35, Number((z + delta).toFixed(2))))
      );
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [fitToScreen]);

  // Pointer drag / resize handling
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      const dx = (e.clientX - dragState.startClientX) / zoom;
      const dy = (e.clientY - dragState.startClientY) / zoom;

      if (dragState.mode === 'move') {
        if (!dragState.hasMoved && Math.hypot(dx, dy) < 3) return;

        const targetBooth = booths.find((b) => b.id === dragState.boothId);
        if (!targetBooth) return;

        let nextX = Math.max(
          0,
          Math.min(layout.width - targetBooth.w, dragState.origX + dx)
        );
        let nextY = Math.max(
          0,
          Math.min(layout.height - targetBooth.h, dragState.origY + dy)
        );

        // Snap & alignment guides against other booths
        const SNAP = 4;
        const activeGuides: AlignmentGuide[] = [];
        const myCx = nextX + targetBooth.w / 2;
        const myCy = nextY + targetBooth.h / 2;

        for (const other of booths) {
          if (other.id === targetBooth.id) continue;
          const oCx = other.x + other.w / 2;
          const oCy = other.y + other.h / 2;

          if (Math.abs(nextX - other.x) <= SNAP) {
            nextX = other.x;
            activeGuides.push({ type: 'vertical', pos: other.x });
          } else if (Math.abs(myCx - oCx) <= SNAP) {
            nextX = oCx - targetBooth.w / 2;
            activeGuides.push({ type: 'vertical', pos: oCx });
          } else if (Math.abs(nextX + targetBooth.w - (other.x + other.w)) <= SNAP) {
            nextX = other.x + other.w - targetBooth.w;
            activeGuides.push({ type: 'vertical', pos: other.x + other.w });
          }

          if (Math.abs(nextY - other.y) <= SNAP) {
            nextY = other.y;
            activeGuides.push({ type: 'horizontal', pos: other.y });
          } else if (Math.abs(myCy - oCy) <= SNAP) {
            nextY = oCy - targetBooth.h / 2;
            activeGuides.push({ type: 'horizontal', pos: oCy });
          } else if (Math.abs(nextY + targetBooth.h - (other.y + other.h)) <= SNAP) {
            nextY = other.y + other.h - targetBooth.h;
            activeGuides.push({ type: 'horizontal', pos: other.y + other.h });
          }
        }

        setGuides(activeGuides);
        setDragState((prev) =>
          prev && prev.mode === 'move' ? { ...prev, hasMoved: true } : prev
        );
        onUpdateBooth(dragState.boothId, {
          x: Math.round(nextX),
          y: Math.round(nextY),
        });
      } else if (dragState.mode === 'resize') {
        const MIN_SIZE = 14;
        let { origX: x, origY: y, origW: w, origH: h } = dragState;

        if (dragState.handle.includes('e')) {
          w = Math.max(MIN_SIZE, dragState.origW + dx);
        }
        if (dragState.handle.includes('s')) {
          h = Math.max(MIN_SIZE, dragState.origH + dy);
        }
        if (dragState.handle.includes('w')) {
          const newW = Math.max(MIN_SIZE, dragState.origW - dx);
          x = dragState.origX + (dragState.origW - newW);
          w = newW;
        }
        if (dragState.handle.includes('n')) {
          const newH = Math.max(MIN_SIZE, dragState.origH - dy);
          y = dragState.origY + (dragState.origH - newH);
          h = newH;
        }

        onUpdateBooth(dragState.boothId, {
          x: Math.round(x),
          y: Math.round(y),
          w: Math.round(w),
          h: Math.round(h),
        });
      }
    };

    const handlePointerUp = () => {
      setDragState(null);
      setGuides([]);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, zoom, booths, onUpdateBooth, layout.width, layout.height]);

  const getLogoFlexAlign = (align: Booth['logoAlign']) => {
    switch (align) {
      case 'top':
        return 'items-center justify-start';
      case 'bottom':
        return 'items-center justify-end';
      case 'right':
        return 'items-end justify-center';
      case 'left':
        return 'items-start justify-center';
      default:
        return 'items-center justify-center';
    }
  };

  return (
    <div
      ref={viewportRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onSelectBooth(null);
        }
      }}
      className="relative flex-1 overflow-auto bg-slate-100/90 p-5"
    >
      {/* Swap Mode Banner */}
      {swapMode && !isExporting && (
        <div className="sticky top-2 z-20 mx-auto mb-3 flex w-fit items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-900 shadow-sm">
          <span>
            وضع التبديل نشط: انقر على الجناح المستهدف لإتمام عملية التبديل
          </span>
        </div>
      )}

      {/* Centered Zoomed Stage */}
      <div
        className="mx-auto flex items-start justify-center"
        style={{
          width: layout.width * zoom,
          height: layout.height * zoom,
        }}
      >
        <div
          style={{
            width: layout.width,
            height: layout.height,
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
          }}
          className="shrink-0"
        >
          {/* Exportable Floor Plan Stage */}
          <div
            ref={exportRef}
            id="floorplan-export-stage"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onSelectBooth(null);
              }
            }}
            style={{
              width: layout.width,
              height: layout.height,
              backgroundColor: layout.floorFillColor,
            }}
            className="relative overflow-hidden shadow-md ring-1 ring-slate-200"
          >
            {/* Locked Built-in Floor Plan Background */}
            <img
              src={layout.imageSrc}
              alt={layout.titleAr}
              draggable={false}
              className="pointer-events-none block h-full w-full select-none"
            />

            {/* Layer 1: Cover original booth spots with floor fill when moved or resized */}
            {booths.map((booth) => {
              const hasMovedOrResized =
                booth.x !== booth.defaultX ||
                booth.y !== booth.defaultY ||
                booth.w !== booth.defaultW ||
                booth.h !== booth.defaultH;

              if (!hasMovedOrResized) return null;

              return (
                <div
                  key={`cover-${booth.id}`}
                  className="pointer-events-none absolute"
                  style={{
                    left: booth.defaultX - 1,
                    top: booth.defaultY - 1,
                    width: booth.defaultW + 2,
                    height: booth.defaultH + 2,
                    backgroundColor: layout.floorFillColor,
                    clipPath:
                      booth.shape === 'l-shape' ? L_SHAPE_CLIP : undefined,
                  }}
                />
              );
            })}

            {/* Layer 2: Interactive Booths */}
            {booths.map((booth) => {
              const isSelected = selectedBoothId === booth.id;
              const hasBrand =
                booth.exhibitorName.trim() !== '' || booth.logoDataUrl !== null;
              const hasMovedOrResized =
                booth.x !== booth.defaultX ||
                booth.y !== booth.defaultY ||
                booth.w !== booth.defaultW ||
                booth.h !== booth.defaultH;
              const shouldHideCode =
                !showBoothLabels || Boolean(booth.hideCode);
              const isModified =
                hasBrand || hasMovedOrResized || shouldHideCode;

              const isMatch = matchingIds.has(booth.id);
              const isDimmed = !isExporting && isFilterActive && !isMatch;

              const isCompact = booth.w < 38 || booth.h < 30;
              const showCode =
                !shouldHideCode &&
                !(booth.displayMode === 'logo' && booth.logoDataUrl);
              const showLogo =
                booth.logoDataUrl &&
                (booth.displayMode === 'both' || booth.displayMode === 'logo');
              const showName =
                booth.exhibitorName.trim() !== '' &&
                (booth.displayMode === 'both' || booth.displayMode === 'name');

              const contentBoxW = booth.w;
              const contentBoxH =
                booth.shape === 'l-shape' ? booth.h * 0.41 : booth.h;

              return (
                <div
                  key={booth.id}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (swapMode) {
                      onSelectBooth(booth.id);
                      return;
                    }
                    onSelectBooth(booth.id);
                    setDragState({
                      mode: 'move',
                      boothId: booth.id,
                      startClientX: e.clientX,
                      startClientY: e.clientY,
                      origX: booth.x,
                      origY: booth.y,
                      hasMoved: false,
                    });
                  }}
                  style={{
                    left: isModified ? booth.x - 1 : booth.x,
                    top: isModified ? booth.y - 1 : booth.y,
                    width: isModified ? booth.w + 2 : booth.w,
                    height: isModified ? booth.h + 2 : booth.h,
                    backgroundColor: isModified ? booth.color : 'transparent',
                    color: booth.textColor,
                    border:
                      isModified && layout.id === 'ramadan59'
                        ? '1px solid #9c8248'
                        : undefined,
                    clipPath:
                      booth.shape === 'l-shape' ? L_SHAPE_CLIP : undefined,
                    opacity: isDimmed ? 0.22 : 1,
                    zIndex: isSelected ? 20 : isModified ? 10 : 5,
                  }}
                  className={`group absolute flex cursor-pointer select-none flex-col overflow-hidden transition-opacity ${
                    !isExporting && isSelected
                      ? 'ring-2 ring-sky-600 ring-offset-1'
                      : !isExporting && isFilterActive && isMatch
                        ? 'ring-2 ring-sky-500'
                        : !isExporting
                          ? 'hover:ring-2 hover:ring-sky-500/70'
                          : ''
                  }`}
                  title={`${booth.code}${
                    booth.exhibitorName ? ` — ${booth.exhibitorName}` : ''
                  }`}
                >
                  {/* Booth Content (for Q1 L-shape, anchor inside bottom horizontal arm so notch never clips text/logo) */}
                  {isModified && (
                    <div
                      style={
                        booth.shape === 'l-shape'
                          ? {
                              position: 'absolute',
                              top: '59%',
                              left: 0,
                              right: 0,
                              height: '41%',
                            }
                          : undefined
                      }
                      className={`relative flex h-full w-full flex-col p-0.5 ${getLogoFlexAlign(
                        booth.logoAlign
                      )}`}
                    >
                      {/* Small code badge */}
                      {showCode && (
                        <span
                          className="shrink-0 text-center font-extrabold leading-none"
                          style={{
                            fontSize: isCompact ? '6.5px' : '8.5px',
                          }}
                        >
                          {booth.code}
                        </span>
                      )}

                      {/* Logo */}
                      {showLogo && (
                        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-0.5">
                          <img
                            src={booth.logoDataUrl!}
                            alt={booth.exhibitorName || booth.code}
                            draggable={false}
                            style={{
                              transform: `scale(${booth.logoScale})`,
                            }}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}

                      {/* Auto-fitted Exhibitor Name (never truncated with ...) */}
                      {showName && (
                        <AutoFitText
                          text={booth.exhibitorName}
                          boxW={contentBoxW}
                          boxH={contentBoxH}
                          maxFontSize={isCompact ? 9 : 11}
                          minFontSize={4}
                        />
                      )}

                      {/* Fallback code if Logo-Only selected without logo & code not hidden */}
                      {!shouldHideCode &&
                        booth.displayMode === 'logo' &&
                        !booth.logoDataUrl && (
                          <span
                            className="font-extrabold leading-none"
                            style={{ fontSize: isCompact ? '6.5px' : '8.5px' }}
                          >
                            {booth.code}
                          </span>
                        )}
                    </div>
                  )}

                  {/* Resize Handles (hidden during export) */}
                  {!isExporting && isSelected && !swapMode && (
                    <>
                      {(
                        [
                          { h: 'nw', cls: '-top-1 -left-1 cursor-nwse-resize' },
                          { h: 'ne', cls: '-top-1 -right-1 cursor-nesw-resize' },
                          { h: 'sw', cls: '-bottom-1 -left-1 cursor-nesw-resize' },
                          { h: 'se', cls: '-bottom-1 -right-1 cursor-nwse-resize' },
                        ] as const
                      ).map((item) => (
                        <div
                          key={item.h}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setDragState({
                              mode: 'resize',
                              boothId: booth.id,
                              handle: item.h,
                              startClientX: e.clientX,
                              startClientY: e.clientY,
                              origX: booth.x,
                              origY: booth.y,
                              origW: booth.w,
                              origH: booth.h,
                            });
                          }}
                          className={`absolute z-30 h-2.5 w-2.5 rounded-xs border border-sky-700 bg-white shadow-xs ${item.cls}`}
                        />
                      ))}
                    </>
                  )}
                </div>
              );
            })}

            {/* Layer 3: Alignment Guides (hidden during export) */}
            {!isExporting &&
              guides.map((g, idx) =>
                g.type === 'vertical' ? (
                  <div
                    key={`gv-${idx}`}
                    className="pointer-events-none absolute top-0 bottom-0 z-30 w-px border-l border-dashed border-sky-500"
                    style={{ left: g.pos }}
                  />
                ) : (
                  <div
                    key={`gh-${idx}`}
                    className="pointer-events-none absolute right-0 left-0 z-30 h-px border-t border-dashed border-sky-500"
                    style={{ top: g.pos }}
                  />
                )
              )}
          </div>
        </div>
      </div>

      {/* Floating Zoom Controls */}
      <div className="fixed bottom-4 left-4 z-20 flex items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-md backdrop-blur-xs">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
          className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-100"
          title="تكبير (Ctrl +)"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <span className="min-w-[44px] text-center text-xs font-bold text-slate-700">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.35, Number((z - 0.1).toFixed(2))))}
          className="rounded-lg p-1.5 text-slate-700 hover:bg-slate-100"
          title="تصغير (Ctrl -)"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <div className="mx-0.5 h-4 w-px bg-slate-200" />
        <button
          type="button"
          onClick={fitToScreen}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
          title="ملاءمة للشاشة (Ctrl 0)"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span>ملاءمة</span>
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
          title="الحجم الفعلي 100%"
        >
          <RotateCcw className="h-3 w-3" />
          <span>100%</span>
        </button>
      </div>
    </div>
  );
};
