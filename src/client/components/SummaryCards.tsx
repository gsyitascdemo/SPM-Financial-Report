import React from 'react';
import { formatCompact, forecastClass } from '../utils/formatters';
import './SummaryCards.css';

type Category = 'total' | 'opex' | 'capex';

interface Metrics {
  budget: number;
  planned: number;
  actual: number;
  committed: number;
  forecast: number;
}

interface SummaryCardsProps {
  totals: {
    total: Metrics;
    opex: Metrics;
    capex: Metrics;
  } | null;
  visibleCategories: Set<Category>;
}

interface CardDef {
  label: string;
  key: keyof Metrics;
  accent: string;
}

const CARDS: CardDef[] = [
  { label: 'Budget', key: 'budget', accent: 'var(--now-color--primary-2, 1, 119, 142)' },
  { label: 'Planned', key: 'planned', accent: 'var(--now-color--secondary-2, 99, 99, 99)' },
  { label: 'Actual', key: 'actual', accent: 'var(--now-color_text--warning, 196, 115, 0)' },
  { label: 'Committed', key: 'committed', accent: 'var(--now-color--primary-3, 0, 88, 105)' },
  { label: 'Forecast', key: 'forecast', accent: 'var(--now-color_text--positive, 38, 132, 0)' }
];

const CATEGORY_LABELS: Record<Category, string> = {
  total: 'Total',
  opex: 'OpEx',
  capex: 'CapEx'
};

// Priority order for display ordering
const CATEGORY_PRIORITY: Category[] = ['total', 'opex', 'capex'];

export default function SummaryCards({ totals, visibleCategories }: SummaryCardsProps) {
  if (!totals) return null;

  // Get all visible categories in priority order
  const activeCategories = CATEGORY_PRIORITY.filter(c => visibleCategories.has(c));

  return (
    <div className="summary-cards">
      {CARDS.map(card => (
        <div className="summary-card" key={card.key}>
          <div
            className="summary-card__accent"
            style={{ backgroundColor: `rgb(${card.accent})` }}
          />
          <div className="summary-card__content">
            <span className="summary-card__label">{card.label}</span>
            <div className="summary-card__values">
              {activeCategories.map(cat => {
                const val = totals[cat][card.key] ?? 0;
                const colorClass = card.key === 'forecast' ? forecastClass(totals[cat].forecast, totals[cat].budget) : '';
                return (
                  <div className="summary-card__row" key={cat}>
                    <span className={`summary-card__value ${colorClass}`}>
                      {formatCompact(val)}
                    </span>
                    <span className={`summary-card__category-badge summary-card__category-badge--${cat}`}>
                      {CATEGORY_LABELS[cat]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
