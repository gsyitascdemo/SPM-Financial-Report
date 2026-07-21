import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@servicenow/react-components/Button';
import { TypeaheadMultiSelectedItem } from '@servicenow/react-components/TypeaheadMulti';
import { fetchPivotData, fetchPortfolios, fetchFiscalYears } from './services/FinancialService';
import { displayValue, sysIdValue } from './utils/fields';
import { formatCurrency } from './utils/formatters';
import FilterBar from './components/FilterBar';
import SummaryCards from './components/SummaryCards';
import PivotTable from './components/PivotTable';
import './app.css';

type Category = 'total' | 'opex' | 'capex';

const CATEGORY_LABELS: Record<Category, string> = {
  total: 'Total',
  opex: 'OpEx',
  capex: 'CapEx'
};

export default function App() {
  const [portfolios, setPortfolios] = useState<Array<{ id: string; label: string }>>([]);
  const [fiscalYears, setFiscalYears] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedPortfolios, setSelectedPortfolios] = useState<TypeaheadMultiSelectedItem[]>([]);
  const [selectedFiscalYears, setSelectedFiscalYears] = useState<TypeaheadMultiSelectedItem[]>([]);
  const [visibleCategories, setVisibleCategories] = useState<Set<Category>>(new Set(['total', 'opex', 'capex']));
  const [pivotData, setPivotData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchPortfolios(), fetchFiscalYears()])
      .then(([p, fy]) => {
        const pItems = p.map((item: any) => ({
          id: sysIdValue(item.sys_id),
          label: displayValue(item.name)
        }));
        const fyItems = fy.map((item: any) => ({
          id: sysIdValue(item.sys_id),
          label: displayValue(item.name)
        }));
        setPortfolios(pItems);
        setFiscalYears(fyItems);

        // Pre-select the first available portfolio and fiscal year as defaults
        if (pItems.length > 0) {
          setSelectedPortfolios([pItems[0]]);
        }
        if (fyItems.length > 0) {
          setSelectedFiscalYears([fyItems[0]]);
        }
      })
      .catch(err => setError(err.message));
  }, []);

  const handleApply = useCallback(() => {
    if (selectedPortfolios.length === 0 || selectedFiscalYears.length === 0) {
      setError('Please select at least one Portfolio and one Fiscal Year.');
      return;
    }

    setLoading(true);
    setError('');

    const portfolioIds = selectedPortfolios.map(p => p.id).join(',');
    const fiscalYearIds = selectedFiscalYears.map(fy => fy.id).join(',');

    fetchPivotData({
      portfolio_id: portfolioIds,
      fiscal_years: fiscalYearIds
    })
      .then(result => setPivotData(result))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedPortfolios, selectedFiscalYears]);

  const toggleCategory = useCallback((cat: Category) => {
    setVisibleCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) {
        // Don't allow removing the last one
        if (next.size > 1) {
          next.delete(cat);
        }
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  const handleExportCSV = useCallback(() => {
    if (!pivotData || !pivotData.projects || pivotData.projects.length === 0) return;

    const METRIC_KEYS = ['budget', 'planned', 'actual', 'committed', 'forecast'] as const;
    const METRIC_LABELS: Record<string, string> = {
      budget: 'Budget', planned: 'Planned', actual: 'Actual', committed: 'Committed', forecast: 'Forecast'
    };
    const CATEGORY_ORDER: Category[] = ['total', 'opex', 'capex'];
    const activeCategories = CATEGORY_ORDER.filter(c => visibleCategories.has(c));

    // Build header row
    const headers: string[] = ['Project Number', 'Project Name', 'State'];
    for (const cat of activeCategories) {
      for (const met of METRIC_KEYS) {
        headers.push(`${CATEGORY_LABELS[cat]} - ${METRIC_LABELS[met]}`);
      }
    }

    // Build data rows
    const rows: string[][] = [];
    for (const proj of pivotData.projects) {
      const row: string[] = [
        proj.number || '',
        proj.short_description || '',
        proj.state || ''
      ];
      for (const cat of activeCategories) {
        for (const met of METRIC_KEYS) {
          const val = proj[cat]?.[met] ?? 0;
          row.push(val.toFixed(2));
        }
      }
      rows.push(row);
    }

    // Add totals row
    if (pivotData.totals) {
      const totalsRow: string[] = ['', 'TOTALS', ''];
      for (const cat of activeCategories) {
        for (const met of METRIC_KEYS) {
          const val = pivotData.totals[cat]?.[met] ?? 0;
          totalsRow.push(val.toFixed(2));
        }
      }
      rows.push(totalsRow);
    }

    // Encode CSV with BOM for Excel compatibility
    const escapeCsv = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    };

    const csvContent = '\uFEFF' + [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SPM_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [pivotData, visibleCategories]);

  const totals = pivotData?.totals || null;
  const projects = pivotData?.projects || [];

  return (
    <div className="spm-app">
      <header className="spm-header">
        <div className="spm-header__title-section">
          <div className="spm-header__icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 12h2v5H7v-5zm4-3h2v8h-2V9zm4-2h2v10h-2V7z" />
            </svg>
          </div>
          <h1 className="spm-header__title">Financial Pivot Report</h1>
          <span className="spm-header__subtitle">Strategic Portfolio Management</span>
        </div>
        <div className="spm-header__actions">
          <Button label="Export CSV" variant="secondary" icon="download-outline" size="sm" onClick={handleExportCSV} disabled={!pivotData || projects.length === 0} />
        </div>
      </header>

      <div className="spm-content">
        <FilterBar
          portfolios={portfolios}
          fiscalYears={fiscalYears}
          selectedPortfolios={selectedPortfolios}
          selectedFiscalYears={selectedFiscalYears}
          onPortfolioChange={setSelectedPortfolios}
          onFiscalYearChange={setSelectedFiscalYears}
          onApply={handleApply}
          loading={loading}
        />

        {error && <div className="spm-error">{error}</div>}

        {loading && <div className="spm-loading">Loading financial data…</div>}

        {!loading && !error && pivotData && (
          <>
            <div className="spm-view-toggle">
              <span className="spm-view-toggle__label">Show:</span>
              {(['total', 'opex', 'capex'] as Category[]).map(cat => {
                const isActive = visibleCategories.has(cat);
                const isLastActive = isActive && visibleCategories.size === 1;
                return (
                  <button
                    key={cat}
                    className={`spm-toggle-chip spm-toggle-chip--${cat} ${isActive ? 'spm-toggle-chip--active' : ''}`}
                    onClick={() => toggleCategory(cat)}
                    disabled={isLastActive}
                    title={isLastActive ? 'At least one category must be visible' : `Toggle ${CATEGORY_LABELS[cat]}`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                );
              })}
            </div>

            <SummaryCards totals={totals} visibleCategories={visibleCategories} />
            <PivotTable
              projects={projects}
              totals={totals}
              fiscalYears={selectedFiscalYears.map(fy => String(fy.id))}
              visibleCategories={visibleCategories}
            />
          </>
        )}

        {!loading && !error && projects.length === 0 && pivotData && (
          <div className="spm-empty">No projects found. Adjust filters and try again.</div>
        )}
      </div>
    </div>
  );
}
