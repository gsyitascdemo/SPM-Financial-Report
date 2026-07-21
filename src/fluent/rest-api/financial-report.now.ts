import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { process as pivotHandler } from '../../server/rest-handlers/pivot-handler'
import { process as detailHandler } from '../../server/rest-handlers/detail-handler'

RestApi({
    $id: Now.ID['spm-financial-report-api'],
    name: 'SPM Financial Report API',
    serviceId: 'financial_report',
    active: true,
    consumes: 'application/json',
    produces: 'application/json',
    shortDescription: 'REST API for SPM financial report data - provides pivot and detail views of budg',
    routes: [
        {
            $id: Now.ID['pivot-route'],
            name: 'Get Pivot Data',
            method: 'GET',
            path: '/pivot',
            script: pivotHandler,
            shortDescription: 'Returns aggregated financial data per project across fiscal years',
            parameters: [
                {
                    $id: Now.ID['param-portfolio-id'],
                    name: 'portfolio_id',
                    required: true,
                    shortDescription: 'The sys_id of the portfolio to report on',
                },
                {
                    $id: Now.ID['param-fiscal-years'],
                    name: 'fiscal_years',
                    required: true,
                    shortDescription: 'Comma-separated list of fiscal year sys_ids',
                },
                {
                    $id: Now.ID['param-expense-type'],
                    name: 'expense_type',
                    required: false,
                    shortDescription: 'Optional expense type filter',
                },
                {
                    $id: Now.ID['param-project-state'],
                    name: 'project_state',
                    required: false,
                    shortDescription: 'Comma-separated project state values to include (e.g., 1,2,3)',
                },
            ],
            consumes: 'application/json',
            produces: 'application/json',
        },
        {
            $id: Now.ID['detail-route'],
            name: 'Get Detail Data',
            method: 'GET',
            path: '/detail',
            script: detailHandler,
            shortDescription: 'Returns detailed cost plan and committed expense data for a project/FY combinati',
            parameters: [
                {
                    $id: Now.ID['param-project-id'],
                    name: 'project_id',
                    required: true,
                    shortDescription: 'The sys_id of the project to get details for',
                },
                {
                    $id: Now.ID['param-fiscal-year-id'],
                    name: 'fiscal_year_id',
                    required: true,
                    shortDescription: 'The sys_id of the fiscal year to scope the detail view',
                },
            ],
            consumes: 'application/json',
            produces: 'application/json',
        },
    ],
})
