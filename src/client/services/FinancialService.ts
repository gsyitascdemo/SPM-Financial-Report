/**
 * Financial Report API service.
 * All calls include X-UserToken for authentication.
 */

const headers = (): Record<string, string> => ({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-UserToken': (window as any).g_ck,
})

export interface PivotParams {
    portfolio_id?: string
    fiscal_years?: string
    program_ids?: string
    project_state?: string
}

export interface DetailParams {
    project_id: string
    fiscal_year_id: string
}

export async function fetchPivotData(params: PivotParams): Promise<any> {
    const qs = new URLSearchParams()
    if (params.portfolio_id) qs.set('portfolio_id', params.portfolio_id)
    if (params.fiscal_years) qs.set('fiscal_years', params.fiscal_years)
    if (params.program_ids) qs.set('program_ids', params.program_ids)
    if (params.project_state) qs.set('project_state', params.project_state)

    const url = `/api/x_snc_spm_financia/financial_report/pivot?${qs.toString()}`
    const resp = await fetch(url, { headers: headers() })
    if (!resp.ok) throw new Error(`Pivot API error: ${resp.status}`)
    const json = await resp.json()
    return json.result
}

export async function fetchDetailData(params: DetailParams): Promise<any> {
    const qs = new URLSearchParams()
    qs.set('project_id', params.project_id)
    qs.set('fiscal_year_id', params.fiscal_year_id)

    const url = `/api/x_snc_spm_financia/financial_report/detail?${qs.toString()}`
    const resp = await fetch(url, { headers: headers() })
    if (!resp.ok) throw new Error(`Detail API error: ${resp.status}`)
    const json = await resp.json()
    return json.result
}

export async function fetchPortfolios(): Promise<any[]> {
    const url =
        '/api/now/table/pm_portfolio?sysparm_display_value=all' +
        '&sysparm_fields=sys_id,name&sysparm_query=active=1&sysparm_limit=100'
    const resp = await fetch(url, { headers: headers() })
    if (!resp.ok) throw new Error(`Portfolio API error: ${resp.status}`)
    const json = await resp.json()
    return json.result || []
}

export async function fetchFiscalYears(): Promise<any[]> {
    const url =
        '/api/now/table/fiscal_period?sysparm_display_value=all' +
        '&sysparm_query=fiscal_type=year^ORDERBYDESCname&sysparm_fields=sys_id,name&sysparm_limit=20'
    const resp = await fetch(url, { headers: headers() })
    if (!resp.ok) throw new Error(`Fiscal Year API error: ${resp.status}`)
    const json = await resp.json()
    return json.result || []
}

export async function fetchPrograms(): Promise<any[]> {
    const url =
        '/api/now/table/pm_program?sysparm_display_value=all' +
        '&sysparm_fields=sys_id,name&sysparm_query=active=1&sysparm_limit=100'
    const resp = await fetch(url, { headers: headers() })
    if (!resp.ok) throw new Error(`Program API error: ${resp.status}`)
    const json = await resp.json()
    return json.result || []
}
