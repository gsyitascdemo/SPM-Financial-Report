import React, { useState } from 'react';
import { formatCompact, forecastClass } from '../utils/formatters';
import DrillDown from './DrillDown';
import './PivotTable.css';

type Category = 'total' | 'opex' | 'capex';

interface Metrics {
  budget: number;
  planned: number;
  actual: number;
  committed: number;
  forecast: number;
}

interface ProjectRow {
  sys_id: string;
  number: string;
  short_description: string;
  state: string;
  total: Metrics;
  opex: Metrics;
  capex: Metrics;
}

interface Totals {
  total: Metrics;
  opex: Metrics;
  capex: Metrics;
}

interface PivotTableProps {
  projects: ProjectRow[];
  totals: Totals | null;
  fiscalYears: string[];
  visibleCategories: Set<Category>;
}

const METRIC_KEYS: (keyof Metrics)[] = ['budget', 'planned', 'actual', 'committed', 'forecast'];
const METRIC_LABELS: Record<keyof Metrics, string> = {
  budget: 'Budget',
  planned: 'Planned',
  actual: 'Actual',
  committed: 'Committed',
  forecast: 'Forecast'
};

const CATEGORY_LABELS: Record<Category, string> = {
  total: 'Total',
  opex: 'OpEx',
  capex: 'CapEx'
};

const CATEGORY_ORDER: Category[] = ['total', 'opex', 'capex'];

export default function PivotTable({ projects, totals, fiscalYears, visibleCategories }: PivotTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (projectId: string) => {
    setExpandedRow(expandedRow === projectId ? null : projectId);
  };

  if (!projects || projects.length === 0) {
    return null;
  }

  const activeCategories = CATEGORY_ORDER.filter(c => visibleCategories.has(c));
  const totalDataCols = activeCategories.length * METRIC_KEYS.length;
  const drillDownColSpan = 1 + totalDataCols; // project col + all data cols

  return (
    <div className="pivot-wrapper">
      <div className="pivot-scroll">
        <table className="pivot-table">
          <thead>
            {/* Category group header row */}
            <tr>
              <th className="pivot-sticky-col pivot-corner-cell" rowSpan={2}>Project</th>
              {activeCategories.map(cat => (
                <th
                  key={cat}
                  className={`pivot-category-header pivot-category-header--${cat}`}
                  colSpan={METRIC_KEYS.length}
                >
                  {CATEGORY_LABELS[cat]}
                </th>
              ))}
            </tr>
            {/* Metric sub-header row */}
            <tr>
              {activeCategories.map(cat =>
                METRIC_KEYS.map(metric => (
                  <th key={`${cat}-${metric}`} className="pivot-metric-header">
                    {METRIC_LABELS[metric]}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {projects.map(proj => (
              <React.Fragment key={proj.sys_id}>
                <tr
                  className={`pivot-row ${expandedRow === proj.sys_id ? 'expanded' : ''}`}
                  onClick={() => toggleRow(proj.sys_id)}
                >
                  <td className="pivot-sticky-col pivot-project-name">
                    <span className="pivot-expand-icon">
                      {expandedRow === proj.sys_id ? '▼' : '▶'}
                    </span>
                    {proj.short_description || proj.number}
                  </td>
                  {activeCategories.map(cat =>
                    METRIC_KEYS.map(metric => (
                      <td
                        key={`${cat}-${metric}`}
                        className={`pivot-cell ${metric === 'forecast' ? forecastClass(proj[cat].forecast, proj[cat].budget) : ''}`}
                      >
                        {formatCompact(proj[cat][metric])}
                      </td>
                    ))
                  )}
                </tr>
                {expandedRow === proj.sys_id && (
                  <tr className="pivot-drilldown-row">
                    <td colSpan={drillDownColSpan} className="pivot-drilldown-cell">
                      <DrillDown projectId={proj.sys_id} fiscalYearId={fiscalYears[0] || ''} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
          {totals && (
            <tfoot>
              <tr className="pivot-totals-row">
                <td className="pivot-sticky-col pivot-totals-label">Totals</td>
                {activeCategories.map(cat =>
                  METRIC_KEYS.map(metric => (
                    <td
                      key={`total-${cat}-${metric}`}
                      className={`pivot-cell pivot-total ${metric === 'forecast' ? forecastClass(totals[cat].forecast, totals[cat].budget) : ''}`}
                    >
                      {formatCompact(totals[cat][metric])}
                    </td>
                  ))
                )}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
