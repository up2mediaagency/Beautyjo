import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Booth, FilterStatus, LayoutId } from './types';
import { FLOOR_PLAN_LAYOUTS } from './data/layouts';
import { TopHeader } from './components/TopHeader';
import { SearchFilterBar } from './components/SearchFilterBar';
import { BoothEditorPanel, SwapMode } from './components/BoothEditorPanel';
import { FloorPlanCanvas } from './components/FloorPlanCanvas';
import {
  downloadFloorPlanPdf,
  downloadFloorPlanPng,
} from './utils/exportFloorPlan';

const ACTIVE_LAYOUT_KEY = 'beautyjo-active-layout-v1';

function loadSavedLayoutId(): LayoutId {
  try {
    const raw = localStorage.getItem(ACTIVE_LAYOUT_KEY);
    return raw === 'ramadan59' ? 'ramadan59' : 'beauty27';
  } catch {
    return 'beauty27';
  }
}

function loadSavedBooths(layoutId: LayoutId): Booth[] {
  const layout = FLOOR_PLAN_LAYOUTS[layoutId];
  try {
    const raw = localStorage.getItem(layout.storageKey);
    if (!raw) return layout.createInitialBooths();
    const parsed = JSON.parse(raw) as Booth[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return layout.createInitialBooths();
    }
    return parsed;
  } catch {
    return layout.createInitialBooths();
  }
}

function loadSavedShowLabels(layoutId: LayoutId): boolean {
  const layout = FLOOR_PLAN_LAYOUTS[layoutId];
  try {
    const raw = localStorage.getItem(layout.labelsStorageKey);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export function App() {
  const [activeLayoutId, setActiveLayoutId] = useState<LayoutId>(loadSavedLayoutId);

  const [boothsByLayout, setBoothsByLayout] = useState<Record<LayoutId, Booth[]>>(() => ({
    beauty27: loadSavedBooths('beauty27'),
    ramadan59: loadSavedBooths('ramadan59'),
  }));

  const [showLabelsByLayout, setShowLabelsByLayout] = useState<Record<LayoutId, boolean>>(() => ({
    beauty27: loadSavedShowLabels('beauty27'),
    ramadan59: loadSavedShowLabels('ramadan59'),
  }));

  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null);
  const [swapMode, setSwapMode] = useState<SwapMode>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const exportRef = useRef<HTMLDivElement>(null);

  const activeLayout = FLOOR_PLAN_LAYOUTS[activeLayoutId];
  const booths = boothsByLayout[activeLayoutId];
  const showBoothLabels = showLabelsByLayout[activeLayoutId];

  // Auto-save active layout ID
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_LAYOUT_KEY, activeLayoutId);
    } catch {
      // Ignore
    }
  }, [activeLayoutId]);

  // Auto-save booths independently per layout
  useEffect(() => {
    try {
      localStorage.setItem(
        FLOOR_PLAN_LAYOUTS.beauty27.storageKey,
        JSON.stringify(boothsByLayout.beauty27)
      );
      localStorage.setItem(
        FLOOR_PLAN_LAYOUTS.ramadan59.storageKey,
        JSON.stringify(boothsByLayout.ramadan59)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [boothsByLayout]);

  // Auto-save label visibility independently per layout
  useEffect(() => {
    try {
      localStorage.setItem(
        FLOOR_PLAN_LAYOUTS.beauty27.labelsStorageKey,
        String(showLabelsByLayout.beauty27)
      );
      localStorage.setItem(
        FLOOR_PLAN_LAYOUTS.ramadan59.labelsStorageKey,
        String(showLabelsByLayout.ramadan59)
      );
    } catch {
      // Ignore
    }
  }, [showLabelsByLayout]);

  const handleSwitchLayout = useCallback((nextId: LayoutId) => {
    setActiveLayoutId(nextId);
    setSelectedBoothId(null);
    setSwapMode(null);
    setSearchQuery('');
    setFilterStatus('all');
  }, []);

  const isBoothReserved = useCallback(
    (b: Booth) => b.exhibitorName.trim() !== '' || b.logoDataUrl !== null,
    []
  );

  const { reservedCount, availableCount } = useMemo(() => {
    let reserved = 0;
    for (const b of booths) {
      if (isBoothReserved(b)) reserved++;
    }
    return {
      reservedCount: reserved,
      availableCount: booths.length - reserved,
    };
  }, [booths, isBoothReserved]);

  const matchingBooths = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return booths.filter((b) => {
      const reserved = isBoothReserved(b);
      if (filterStatus === 'reserved' && !reserved) return false;
      if (filterStatus === 'available' && reserved) return false;
      if (q) {
        const matchCode = b.code.toLowerCase().includes(q);
        const matchId = b.id.toLowerCase().includes(q);
        const matchName = b.exhibitorName.toLowerCase().includes(q);
        return matchCode || matchId || matchName;
      }
      return true;
    });
  }, [booths, filterStatus, searchQuery, isBoothReserved]);

  const matchingIds = useMemo(
    () => new Set(matchingBooths.map((b) => b.id)),
    [matchingBooths]
  );

  const isFilterActive =
    filterStatus !== 'all' || searchQuery.trim() !== '';

  const selectedBooth = useMemo(
    () => booths.find((b) => b.id === selectedBoothId) ?? null,
    [booths, selectedBoothId]
  );

  const handleUpdateBooth = useCallback(
    (id: string, patch: Partial<Booth>) => {
      setBoothsByLayout((prev) => ({
        ...prev,
        [activeLayoutId]: prev[activeLayoutId].map((b) =>
          b.id === id ? { ...b, ...patch } : b
        ),
      }));
    },
    [activeLayoutId]
  );

  const handleResetBooth = useCallback(
    (id: string) => {
      const defaults = activeLayout.createInitialBooths();
      const def = defaults.find((b) => b.id === id);
      if (!def) return;
      setBoothsByLayout((prev) => ({
        ...prev,
        [activeLayoutId]: prev[activeLayoutId].map((b) =>
          b.id === id ? def : b
        ),
      }));
    },
    [activeLayoutId, activeLayout]
  );

  const handleResetAll = useCallback(() => {
    const fresh = activeLayout.createInitialBooths();
    setBoothsByLayout((prev) => ({
      ...prev,
      [activeLayoutId]: fresh,
    }));
    setShowLabelsByLayout((prev) => ({
      ...prev,
      [activeLayoutId]: true,
    }));
    setSelectedBoothId(null);
    setSwapMode(null);
    localStorage.removeItem(activeLayout.storageKey);
    localStorage.removeItem(activeLayout.labelsStorageKey);
  }, [activeLayoutId, activeLayout]);

  const handleSelectBooth = useCallback(
    (targetId: string | null) => {
      if (!targetId) {
        setSelectedBoothId(null);
        setSwapMode(null);
        return;
      }

      if (swapMode && selectedBoothId && targetId !== selectedBoothId) {
        setBoothsByLayout((prev) => {
          const list = prev[activeLayoutId];
          const source = list.find((b) => b.id === selectedBoothId);
          const target = list.find((b) => b.id === targetId);
          if (!source || !target) return prev;

          const updated = list.map((b) => {
            if (b.id === source.id) {
              if (swapMode === 'brand') {
                return {
                  ...b,
                  exhibitorName: target.exhibitorName,
                  logoDataUrl: target.logoDataUrl,
                  logoScale: target.logoScale,
                  logoAlign: target.logoAlign,
                  displayMode: target.displayMode,
                };
              }
              return {
                ...b,
                x: target.x,
                y: target.y,
                w: target.w,
                h: target.h,
              };
            }
            if (b.id === target.id) {
              if (swapMode === 'brand') {
                return {
                  ...b,
                  exhibitorName: source.exhibitorName,
                  logoDataUrl: source.logoDataUrl,
                  logoScale: source.logoScale,
                  logoAlign: source.logoAlign,
                  displayMode: source.displayMode,
                };
              }
              return {
                ...b,
                x: source.x,
                y: source.y,
                w: source.w,
                h: source.h,
              };
            }
            return b;
          });

          return {
            ...prev,
            [activeLayoutId]: updated,
          };
        });

        setSwapMode(null);
        setSelectedBoothId(targetId);
        return;
      }

      setSelectedBoothId(targetId);
    },
    [swapMode, selectedBoothId, activeLayoutId]
  );

  const handleExportPng = async () => {
    setIsExporting(true);
    try {
      await downloadFloorPlanPng(activeLayout, booths, showBoothLabels);
    } catch (err) {
      console.error('PNG Export error:', err);
      alert('حدث خطأ أثناء تصدير الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await downloadFloorPlanPdf(activeLayout, booths, showBoothLabels);
    } catch (err) {
      console.error('PDF Export error:', err);
      alert('حدث خطأ أثناء تصدير ملف PDF. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <TopHeader
        activeLayout={activeLayout}
        onSwitchLayout={handleSwitchLayout}
        totalCount={booths.length}
        reservedCount={reservedCount}
        availableCount={availableCount}
        isExporting={isExporting}
        onExportPng={handleExportPng}
        onExportPdf={handleExportPdf}
        onResetAll={handleResetAll}
      />

      {/* Main RTL Workspace: Right-hand Editing Panel + Left/Center Floor Plan */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Right-hand Editing Panel (first child in RTL flex-row) */}
        <BoothEditorPanel
          booth={selectedBooth}
          swapMode={swapMode}
          onStartSwap={(mode) => setSwapMode(mode)}
          onCancelSwap={() => setSwapMode(null)}
          onUpdateBooth={handleUpdateBooth}
          onResetBooth={handleResetBooth}
        />

        {/* Center/Left Floor Plan Area */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            showBoothLabels={showBoothLabels}
            onToggleBoothLabels={() =>
              setShowLabelsByLayout((prev) => ({
                ...prev,
                [activeLayoutId]: !prev[activeLayoutId],
              }))
            }
            totalCount={booths.length}
            reservedCount={reservedCount}
            availableCount={availableCount}
            matchingBooths={matchingBooths}
            selectedBoothId={selectedBoothId}
            onSelectBooth={(id) => handleSelectBooth(id)}
          />

          <FloorPlanCanvas
            layout={activeLayout}
            booths={booths}
            selectedBoothId={selectedBoothId}
            swapMode={swapMode}
            matchingIds={matchingIds}
            isFilterActive={isFilterActive}
            showBoothLabels={showBoothLabels}
            isExporting={isExporting}
            exportRef={exportRef}
            onSelectBooth={handleSelectBooth}
            onUpdateBooth={handleUpdateBooth}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
