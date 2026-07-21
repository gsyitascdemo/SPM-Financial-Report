/**
 * Number formatting utilities for financial data.
 */

/**
 * Formats a number as compact currency (K for thousands, M for millions).
 */
export function formatCompact(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—'
    const abs = Math.abs(value)
    const sign = value < 0 ? '-' : ''
    if (abs >= 1_000_000) {
        return `${sign}€${(abs / 1_000_000).toFixed(1)}M`
    }
    if (abs >= 1_000) {
        return `${sign}€${(abs / 1_000).toFixed(1)}K`
    }
    return `${sign}€${abs.toFixed(0)}`
}

/**
 * Formats a number as full currency with commas.
 */
export function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—'
    return value.toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })
}

/**
 * Returns CSS class for Forecast conditional coloring based on comparison with Budget.
 * - Forecast > Budget → 'forecast-over-budget' (red/critical: overspend alert)
 * - Forecast < Budget → 'forecast-under-budget' (yellow/warning: may need re-planning)
 * - Forecast = Budget → '' (neutral: on track)
 */
export function forecastClass(forecast: number, budget: number): string {
    if (forecast > budget) return 'forecast-over-budget'
    if (forecast < budget) return 'forecast-under-budget'
    return ''
}
