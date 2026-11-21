import React from 'react';
import { Eye, EyeOff, Search, X } from 'lucide-react';
import { Booth, FilterStatus } from '../types';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: FilterStatus;
  onFilterStatusChange: (status: FilterStatus) => void;
  showBoothLabels: boolean;
  onToggleBoothLabels: () => void;
  totalCount: number;
  reservedCount: number;
  availableCount: number;
  matchingBooths: Booth[];
  selectedBoothId: string | null;
  onSelectBooth: (id: string) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  showBoothLabels,
  onToggleBoothLabels,
  totalCount,
  reservedCount,
  availableCount,
  matchingBooths,
  selectedBoothId,
  onSelectBooth,
}) => {
  const tabs: { id: FilterStatus; label: string; count: number }[] = [
    { id: 'all', label: 'الكل', count: totalCount },
    { id: 'reserved', label: 'محجوز', count: reservedCount },
    { id: 'available', label: 'غير محجوز', count: availableCount },
  ];

  return (
    <div className="border-b border-slate-200 bg-white px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث برمز الجناح (مثل A03، B12، Q1) أو اسم العارض..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-9 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/15"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              title="مسح البحث"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs & Labels Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleBoothLabels}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
              !showBoothLabels
                ? 'border-sky-500 bg-sky-50 text-sky-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            title="إظهار أو إخفاء رموز الأجنحة مثل B12 و A02"
          >
            {showBoothLabels ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                <span>إخفاء رموز الأجنحة</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-sky-600" />
                <span>إظهار رموز الأجنحة</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/80 p-1">
            {tabs.map((tab) => {
              const active = filterStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onFilterStatusChange(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                      active
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Search Matches */}
      {searchQuery.trim() !== '' && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500">
            نتائج البحث ({matchingBooths.length}):
          </span>
          {matchingBooths.length === 0 ? (
            <span className="text-[11px] text-slate-400">
              لا توجد أجنحة مطابقة
            </span>
          ) : (
            matchingBooths.slice(0, 12).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBooth(b.id)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold transition ${
                  selectedBoothId === b.id
                    ? 'border-sky-500 bg-sky-50 text-sky-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: b.color }}
                />
                <span>{b.code}</span>
                {b.exhibitorName && (
                  <span className="max-w-[90px] truncate text-slate-500 font-normal">
                    — {b.exhibitorName}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
