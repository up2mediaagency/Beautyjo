import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Booth, FilterStatus } from './types';
import { createInitialBooths } from './data/booths';
import { TopHeader } from './components/TopHeader';
import { SearchFilterBar } from './components/SearchFilterBar';
import { BoothEditorPanel, SwapMode } from './components/BoothEditorPanel';
import { FloorPlanCanvas } from './components/FloorPlanCanvas';
import {
  downloadFloorPlanPdf,
  downloadFloorPlanPng,
} from './utils/exportFloorPlan';

const STORAGE_KEY = 'beauty-jordan-27-booths-v2';
const LEGACY_STORAGE_KEY = 'beauty-jordan-27-booths-v1';
const LABELS_STORAGE_KEY = 'beauty-jordan-27-show-labels-v1';

function loadSavedBooths(): Booth[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Booth[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Migrate exhibitor data from v1 onto updated 791x1024 coordinates if present
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw) as Booth[];
      if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
        const legacyById = new Map(legacyParsed.map((b) => [b.id, b]));
        return createInitialBooths().map((fresh) => {
          const old = legacyById.get(fresh.id);
          if (!old) return fresh;
          return {
            ...fresh,
            exhibitorName: old.exhibitorName || '',
            logoDataUrl: old.logoDataUrl ?? null,
            logoScale: old.logoScale ?? fresh.logoScale,
            logoAlign: old.logoAlign ?? fresh.logoAlign,
            displayMode: old.displayMode ?? fresh.displayMode,
            hideCode: old.hideCode ?? false,
          };
        });
      }
    }
    return createInitialBooths();
  } catch {
    return createInitialBooths();
  }
}

function loadSavedShowLabels(): boolean {
  try {
    const raw = localStorage.getItem(LABELS_STORAGE_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export function App() {
  const [booths, setBooths] = useState<Booth[]>(loadSavedBooths);
  const [showBoothLabels, setShowBoothLabels] = useState<boolean>(
    loadSavedShowLabels
  );
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null);
  const [swapMode, setSwapMode] = useState<SwapMode>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const exportRef = useRef<HTMLDivElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(booths));
    } catch {
      // Ignore storage quota errors
    }
  }, [booths]);

  useEffect(() => {
    try {
      localStorage.setItem(LABELS_STORAGE_KEY, String(showBoothLabels));
    } catch {
      // Ignore
    }
  }, [showBoothLabels]);

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
        const matchName = b.exhibitorName.toLowerCase().includes(q);
        return matchCode || matchName;
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

  const handleUpdateBooth = useCallback((id: string, patch: Partial<Booth>) => {
    setBooths((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  }, []);

  const handleResetBooth = useCallback((id: string) => {
    const defaults = createInitialBooths();
    const def = defaults.find((b) => b.id === id);
    if (!def) return;
    setBooths((prev) => prev.map((b) => (b.id === id ? def : b)));
  }, []);

  const handleResetAll = useCallback(() => {
    const fresh = createInitialBooths();
    setBooths(fresh);
    setShowBoothLabels(true);
    setSelectedBoothId(null);
    setSwapMode(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LABELS_STORAGE_KEY);
  }, []);

  const handleSelectBooth = useCallback(
    (targetId: string | null) => {
      if (!targetId) {
        setSelectedBoothId(null);
        setSwapMode(null);
        return;
      }

      if (swapMode && selectedBoothId && targetId !== selectedBoothId) {
        setBooths((prev) => {
          const source = prev.find((b) => b.id === selectedBoothId);
          const target = prev.find((b) => b.id === targetId);
          if (!source || !target) return prev;

          return prev.map((b) => {
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
        });

        setSwapMode(null);
        setSelectedBoothId(targetId);
        return;
      }

      setSelectedBoothId(targetId);
    },
    [swapMode, selectedBoothId]
  );

  const handleExportPng = async () => {
    setIsExporting(true);
    try {
      await downloadFloorPlanPng(booths, showBoothLabels);
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
      await downloadFloorPlanPdf(booths, showBoothLabels);
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
            onToggleBoothLabels={() => setShowBoothLabels((v) => !v)}
            totalCount={booths.length}
            reservedCount={reservedCount}
            availableCount={availableCount}
            matchingBooths={matchingBooths}
            selectedBoothId={selectedBoothId}
            onSelectBooth={(id) => handleSelectBooth(id)}
          />

          <FloorPlanCanvas
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
