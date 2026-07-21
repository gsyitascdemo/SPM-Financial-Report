import React, { useCallback } from 'react';
import { TypeaheadMulti, TypeaheadMultiSelectedItem, TypeaheadMultiSelectedItemsSet } from '@servicenow/react-components/TypeaheadMulti';
import { Button } from '@servicenow/react-components/Button';
import './FilterBar.css';

interface FilterBarProps {
  portfolios: Array<{ id: string; label: string }>;
  fiscalYears: Array<{ id: string; label: string }>;
  selectedPortfolios: TypeaheadMultiSelectedItem[];
  selectedFiscalYears: TypeaheadMultiSelectedItem[];
  onPortfolioChange: (items: TypeaheadMultiSelectedItem[]) => void;
  onFiscalYearChange: (items: TypeaheadMultiSelectedItem[]) => void;
  onApply: () => void;
  loading?: boolean;
}

const MAX_PORTFOLIOS = 10;
const MAX_FISCAL_YEARS = 5;

export default function FilterBar(props: FilterBarProps) {
  const {
    portfolios, fiscalYears,
    selectedPortfolios, selectedFiscalYears,
    onPortfolioChange, onFiscalYearChange,
    onApply, loading
  } = props;

  const handlePortfolios = useCallback<TypeaheadMultiSelectedItemsSet>(e => {
    const items = e.detail.payload.value;
    if (items.length <= MAX_PORTFOLIOS) {
      onPortfolioChange(items);
    }
  }, [onPortfolioChange]);

  const handleFiscalYears = useCallback<TypeaheadMultiSelectedItemsSet>(e => {
    const items = e.detail.payload.value;
    if (items.length <= MAX_FISCAL_YEARS) {
      onFiscalYearChange(items);
    }
  }, [onFiscalYearChange]);

  const portfolioMessages = selectedPortfolios.length >= MAX_PORTFOLIOS
    ? [{ status: 'warning' as const, icon: 'circle-exclamation-outline', content: `Max ${MAX_PORTFOLIOS} portfolios` }]
    : [];

  const fyMessages = selectedFiscalYears.length >= MAX_FISCAL_YEARS
    ? [{ status: 'warning' as const, icon: 'circle-exclamation-outline', content: `Max ${MAX_FISCAL_YEARS} fiscal years` }]
    : [];

  return (
    <div className="filter-bar">
      <div className="filter-bar__group filter-bar__group--multi">
        <TypeaheadMulti
          label="Portfolio"
          items={portfolios}
          selectedItems={selectedPortfolios}
          onSelectedItemsSet={handlePortfolios}
          search="contains"
          size="sm"
          manageSelectedItems
          messages={portfolioMessages}
        />
      </div>
      <div className="filter-bar__group filter-bar__group--multi">
        <TypeaheadMulti
          label="Fiscal Year"
          items={fiscalYears}
          selectedItems={selectedFiscalYears}
          onSelectedItemsSet={handleFiscalYears}
          search="contains"
          size="sm"
          manageSelectedItems
          messages={fyMessages}
        />
      </div>
      <div className="filter-bar__action">
        <Button
          label="Apply Filters"
          variant="primary"
          size="sm"
          disabled={loading || selectedPortfolios.length === 0 || selectedFiscalYears.length === 0}
          onClicked={onApply}
        />
      </div>
    </div>
  );
}
