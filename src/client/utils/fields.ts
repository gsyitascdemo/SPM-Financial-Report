/**
 * Utility helpers for extracting display/value from ServiceNow API responses
 * that use sysparm_display_value=all format.
 */

export function displayValue(field: any): string {
    if (field === null || field === undefined) return ''
    if (typeof field === 'object' && 'display_value' in field) {
        return field.display_value ?? ''
    }
    return String(field)
}

export function sysIdValue(field: any): string {
    if (field === null || field === undefined) return ''
    if (typeof field === 'object' && 'value' in field) {
        return field.value ?? ''
    }
    return String(field)
}
