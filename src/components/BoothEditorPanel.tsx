import React, { useRef } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowLeftRight,
  ImagePlus,
  Layers,
  MousePointerClick,
  RotateCcw,
  Trash2,
  Type,
  AlignCenter,
  AlignStartVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignEndHorizontal,
} from 'lucide-react';
import { Booth, DisplayMode, LogoAlign } from '../types';
import { ZONES } from '../data/booths';

export type SwapMode = null | 'brand' | 'position';

interface BoothEditorPanelProps {
  booth: Booth | null;
  swapMode: SwapMode;
  onStartSwap: (mode: 'brand' | 'position') => void;
  onCancelSwap: () => void;
  onUpdateBooth: (id: string, patch: Partial<Booth>) => void;
  onResetBooth: (id: string) => void;
}

export const BoothEditorPanel: React.FC<BoothEditorPanelProps> = ({
  booth,
  swapMode,
  onStartSwap,
  onCancelSwap,
  onUpdateBooth,
  onResetBooth,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!booth) {
    return (
      <aside className="flex w-full shrink-0 flex-col items-center justify-center border-b border-slate-200 bg-white p-6 text-center lg:w-88 lg:border-b-0 lg:border-l">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <MousePointerClick className="h-6 w-6" />
        </div>
        <h2 className="text-sm font-bold text-slate-900">اختر جناحاً للتعديل</h2>
        <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-slate-500">
          انقر على أي جناح في المخطط لإضافة اسم العارض، رفع شعار PNG شفاف، تعديل
          الحجم والموقع، أو تبديل الأجنحة.
        </p>
      </aside>
    );
  }

  const zone = ZONES[booth.zone];
  const isReserved =
    booth.exhibitorName.trim() !== '' || booth.logoDataUrl !== null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateBooth(booth.id, { logoDataUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const nudge = (dx: number, dy: number) => {
    onUpdateBooth(booth.id, {
      x: Math.max(0, Math.round(booth.x + dx)),
      y: Math.max(0, Math.round(booth.y + dy)),
    });
  };

  const displayModes: { id: DisplayMode; label: string }[] = [
    { id: 'both', label: 'شعار + اسم' },
    { id: 'logo', label: 'الشعار فقط' },
    { id: 'name', label: 'الاسم فقط' },
  ];

  const alignOptions: {
    id: LogoAlign;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'top', label: 'أعلى', icon: <AlignStartHorizontal className="h-3.5 w-3.5" /> },
    { id: 'center', label: 'وسط', icon: <AlignCenter className="h-3.5 w-3.5" /> },
    { id: 'bottom', label: 'أسفل', icon: <AlignEndHorizontal className="h-3.5 w-3.5" /> },
    { id: 'right', label: 'يمين', icon: <AlignStartVertical className="h-3.5 w-3.5" /> },
    { id: 'left', label: 'يسار', icon: <AlignEndVertical className="h-3.5 w-3.5" /> },
  ];

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:h-full lg:w-88 lg:overflow-y-auto lg:border-b-0 lg:border-l">
      {/* Booth Header */}
      <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 min-w-[44px] items-center justify-center rounded-lg px-2 text-sm font-extrabold shadow-xs ring-1 ring-black/10"
              style={{ backgroundColor: booth.color, color: booth.textColor }}
            >
              {booth.code}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">
                  جناح {booth.code}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isReserved
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isReserved ? 'محجوز' : 'غير محجوز'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                الفئة: {zone.nameAr} • {booth.areaLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onResetBooth(booth.id)}
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            title="إعادة ضبط هذا الجناح"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-5 p-4">
        {/* Section 1: Exhibitor Name & Logo */}
        <section className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Type className="h-3.5 w-3.5 text-sky-600" />
            <span>بيانات العارض والشعار</span>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
              اسم العارض (عربي أو إنجليزي)
            </label>
            <input
              type="text"
              value={booth.exhibitorName}
              onChange={(e) =>
                onUpdateBooth(booth.id, { exhibitorName: e.target.value })
              }
              placeholder="مثال: شركة الجمال / Beauty Co"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/15"
            />
          </div>

          {/* PNG Logo Upload */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
              شعار العارض (PNG شفاف)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/webp,image/svg+xml"
              onChange={handleLogoUpload}
              className="hidden"
            />

            {booth.logoDataUrl ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded border border-slate-200 bg-white p-1">
                  <img
                    src={booth.logoDataUrl}
                    alt="شعار العارض"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    تغيير الشعار
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateBooth(booth.id, { logoDataUrl: null })}
                    className="inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>حذف الشعار</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-3 py-3 text-xs font-semibold text-slate-600 transition hover:border-sky-400 hover:bg-sky-50/50 hover:text-sky-700"
              >
                <ImagePlus className="h-4 w-4" />
                <span>رفع شعار PNG شفاف</span>
              </button>
            )}
          </div>

          {/* Display Mode */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">
              وضع العرض داخل الجناح
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
              {displayModes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onUpdateBooth(booth.id, { displayMode: m.id })}
                  className={`rounded-md py-1.5 text-[11px] font-semibold transition ${
                    booth.displayMode === m.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hide Booth Code Label */}
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs">
            <span className="font-semibold text-slate-700">
              إخفاء رمز الجناح ({booth.code})
            </span>
            <input
              type="checkbox"
              checked={Boolean(booth.hideCode)}
              onChange={(e) =>
                onUpdateBooth(booth.id, { hideCode: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-sky-600 accent-sky-600"
            />
          </label>

          {/* Logo Scale & Alignment */}
          {booth.logoDataUrl && (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-600">حجم الشعار</span>
                  <span className="font-bold text-slate-800">
                    {Math.round(booth.logoScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={1.5}
                  step={0.05}
                  value={booth.logoScale}
                  onChange={(e) =>
                    onUpdateBooth(booth.id, {
                      logoScale: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                  محاذاة الشعار
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {alignOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        onUpdateBooth(booth.id, { logoAlign: opt.id })
                      }
                      title={opt.label}
                      className={`flex flex-col items-center gap-0.5 rounded-md border py-1.5 text-[10px] font-semibold transition ${
                        booth.logoAlign === opt.id
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt.icon}
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <hr className="border-slate-200" />

        {/* Section 2: Position, Size & Fine-Tuning Nudge */}
        <section className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Layers className="h-3.5 w-3.5 text-sky-600" />
            <span>الموقع والأبعاد (تحريك دقيق)</span>
          </div>

          {/* Nudge Pad */}
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <span className="text-[11px] font-semibold text-slate-600">
              تحريك دقيق:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => nudge(1, 0)}
                className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-100"
                title="يمين 1px"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => nudge(0, -1)}
                className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-100"
                title="أعلى 1px"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => nudge(0, 1)}
                className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-100"
                title="أسفل 1px"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => nudge(-1, 0)}
                className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-100"
                title="يسار 1px"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Numeric Coordinates & Dimensions */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-[10px] font-semibold text-slate-500">
                الموضع الأفقي (X)
              </label>
              <input
                type="number"
                value={Math.round(booth.x)}
                onChange={(e) =>
                  onUpdateBooth(booth.id, { x: Number(e.target.value) || 0 })
                }
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-[10px] font-semibold text-slate-500">
                الموضع العمودي (Y)
              </label>
              <input
                type="number"
                value={Math.round(booth.y)}
                onChange={(e) =>
                  onUpdateBooth(booth.id, { y: Number(e.target.value) || 0 })
                }
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-[10px] font-semibold text-slate-500">
                العرض (W)
              </label>
              <input
                type="number"
                min={14}
                value={Math.round(booth.w)}
                onChange={(e) =>
                  onUpdateBooth(booth.id, {
                    w: Math.max(14, Number(e.target.value) || 14),
                  })
                }
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-[10px] font-semibold text-slate-500">
                الارتفاع (H)
              </label>
              <input
                type="number"
                min={14}
                value={Math.round(booth.h)}
                onChange={(e) =>
                  onUpdateBooth(booth.id, {
                    h: Math.max(14, Number(e.target.value) || 14),
                  })
                }
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Section 3: Swap Booths */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <ArrowLeftRight className="h-3.5 w-3.5 text-sky-600" />
            <span>تبديل الجناح مع جناح آخر</span>
          </div>

          {swapMode ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs">
              <p className="font-semibold text-amber-900">
                {swapMode === 'brand'
                  ? 'انقر الآن على الجناح المستهدف لتبديل بيانات العارض والشعار معه.'
                  : 'انقر الآن على الجناح المستهدف لتبديل الموقع والأبعاد معه.'}
              </p>
              <button
                type="button"
                onClick={onCancelSwap}
                className="mt-2 w-full rounded-md border border-amber-300 bg-white py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-100"
              >
                إلغاء التبديل
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => onStartSwap('brand')}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                <span>تبديل العارض والشعار فقط</span>
              </button>
              <button
                type="button"
                onClick={() => onStartSwap('position')}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                <span>تبديل الموقع على المخطط</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </aside>
  );
};
