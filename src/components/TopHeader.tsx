import React, { useState } from 'react';
import { Download, FileText, RotateCcw, Map, Loader2 } from 'lucide-react';
import { LayoutId } from '../types';
import { FLOOR_PLAN_LAYOUTS, FloorPlanLayoutConfig } from '../data/layouts';

interface TopHeaderProps {
  activeLayout: FloorPlanLayoutConfig;
  onSwitchLayout: (id: LayoutId) => void;
  totalCount: number;
  reservedCount: number;
  availableCount: number;
  isExporting: boolean;
  onExportPng: () => void;
  onExportPdf: () => void;
  onResetAll: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeLayout,
  onSwitchLayout,
  totalCount,
  reservedCount,
  availableCount,
  isExporting,
  onExportPng,
  onExportPdf,
  onResetAll,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const layoutTabs: FloorPlanLayoutConfig[] = [
    FLOOR_PLAN_LAYOUTS.beauty27,
    FLOOR_PLAN_LAYOUTS.ramadan59,
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 lg:px-6">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-200/80">
            <Map className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 sm:text-lg">
              {activeLayout.titleAr}
            </h1>
            <p className="text-xs text-slate-500">{activeLayout.subtitleAr}</p>
          </div>
        </div>

        {/* Layout Switcher Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
          {layoutTabs.map((tab) => {
            const isActive = activeLayout.id === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setConfirmReset(false);
                  onSwitchLayout(tab.id);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  isActive
                    ? 'bg-white text-sky-700 shadow-xs ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                {tab.tabLabelAr}
              </button>
            );
          })}
        </div>

        {/* Live Counters */}
        <div className="hidden items-center gap-2 xl:flex">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
            <span className="text-slate-500">إجمالي الأجنحة:</span>
            <span className="font-bold text-slate-900">{totalCount}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-800">محجوز:</span>
            <span className="font-bold text-emerald-900">{reservedCount}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="text-slate-600">غير محجوز:</span>
            <span className="font-bold text-slate-900">{availableCount}</span>
          </div>
        </div>

        {/* Actions: Reset + PNG Export + PDF Export ONLY */}
        <div className="flex items-center gap-2">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              title="استعادة المخطط الافتراضي"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">استعادة الافتراضي</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5">
              <span className="text-xs font-medium text-rose-800">تأكيد المسح؟</span>
              <button
                type="button"
                onClick={() => {
                  onResetAll();
                  setConfirmReset(false);
                }}
                className="rounded bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                نعم
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded bg-white px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                إلغاء
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onExportPng}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 text-sky-600" />
            )}
            <span>تصدير كصورة (PNG)</span>
          </button>

          <button
            type="button"
            onClick={onExportPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            <span>تصدير كملف PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
