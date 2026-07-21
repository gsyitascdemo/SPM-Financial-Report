import React, { useEffect, useState } from 'react';
import { fetchDetailData } from '../services/FinancialService';
import { formatCurrency } from '../utils/formatters';
import './DrillDown.css';

interface DrillDownProps {
  projectId: string;
  fiscalYearId: string;
}

export default function DrillDown({ projectId, fiscalYearId }: DrillDownProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchDetailData({ project_id: projectId, fiscal_year_id: fiscalYearId })
      .then(result => { if (!cancelled) setData(result); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [projectId, fiscalYearId]);

  if (loading) return <div className="drilldown-loading">Loading details…</div>;
  if (error) return <div className="drilldown-error">{error}</div>;
  if (!data) return null;

  return (
    <div className="drilldown">
      <div className="drilldown-section">
        <h4 className="drilldown-title">Cost Plans</h4>
        {data.cost_plans?.length > 0 ? (
          <table className="drilldown-table">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Start-End Period</th>
              </tr>
            </thead>
            <tbody>
              {data.cost_plans.map((cp: any, i: number) => (
                <tr key={i}>
                  <td>{cp.name}</td>
                  <td>{cp.type}</td>
                  <td>{formatCurrency(cp.amount)}</td>
                  <td>{cp.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="drilldown-empty">No cost plans found.</p>}
      </div>
      <div className="drilldown-section">
        <h4 className="drilldown-title">Committed Lines</h4>
        {data.committed_lines?.length > 0 ? (
          <table className="drilldown-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Period</th>
              </tr>
            </thead>
            <tbody>
              {data.committed_lines.map((cl: any, i: number) => (
                <tr key={i}>
                  <td>{cl.description}</td>
                  <td>{formatCurrency(cl.amount)}</td>
                  <td>{cl.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="drilldown-empty">No committed lines found.</p>}
      </div>
    </div>
  );
}
