import { RESTAPIRequest, RESTAPIResponse } from "@servicenow/glide/sn_ws_int";
import { SPMFinancialAggregator } from "@servicenow/glide/x_snc_spm_financia";

/**
 * REST handler for GET /pivot endpoint.
 * Returns aggregated financial pivot data for one or more portfolios across fiscal years.
 * Supports optional program_ids filter (comma-separated).
 *
 * @param {RESTAPIRequest} request
 * @param {RESTAPIResponse} response
 */
export function process(request, response) {
    // queryParams values are arrays in ServiceNow REST API
    var portfolioParam = request.queryParams.portfolio_id ? request.queryParams.portfolio_id.toString() : '';
    var fiscalYearsParam = request.queryParams.fiscal_years ? request.queryParams.fiscal_years.toString() : '';
    var programIdsParam = request.queryParams.program_ids ? request.queryParams.program_ids.toString() : '';
    var projectStateParam = request.queryParams.project_state ? request.queryParams.project_state.toString() : '';

    // Validate required params
    if (!portfolioParam || !fiscalYearsParam) {
        response.setStatus(400);
        response.setBody({
            error: 'Missing required parameters: portfolio_id and fiscal_years are required'
        });
        return;
    }

    // Parse comma-separated values
    var portfolioIds = portfolioParam.split(',');
    var fiscalYearIds = fiscalYearsParam.split(',');
    var programIds = programIdsParam ? programIdsParam.split(',') : [];
    var projectStates = projectStateParam ? projectStateParam.split(',') : [];

    // Performance guard: limit selections
    if (portfolioIds.length > 10) {
        response.setStatus(400);
        response.setBody({
            error: 'Too many portfolios selected. Maximum is 10.'
        });
        return;
    }
    if (fiscalYearIds.length > 5) {
        response.setStatus(400);
        response.setBody({
            error: 'Too many fiscal years selected. Maximum is 5.'
        });
        return;
    }

    try {
        // Instantiate the aggregator and get pivot data
        var aggregator = new SPMFinancialAggregator();
        var result = aggregator.getPivotData(portfolioIds, fiscalYearIds, programIds, projectStates);

        response.setStatus(200);
        response.setBody(result);
    } catch (e) {
        response.setStatus(500);
        response.setBody({
            error: 'Internal error: ' + e.message
        });
    }
}
