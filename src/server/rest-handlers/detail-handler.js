import { RESTAPIRequest, RESTAPIResponse } from "@servicenow/glide/sn_ws_int";
import { SPMFinancialAggregator } from "@servicenow/glide/x_snc_spm_financia";

/**
 * REST handler for GET /detail endpoint.
 * Returns detailed cost plan and committed expense data for a single project/FY.
 *
 * @param {RESTAPIRequest} request
 * @param {RESTAPIResponse} response
 */
export function process(request, response) {
    // queryParams values are arrays in ServiceNow REST API
    var projectId = request.queryParams.project_id ? request.queryParams.project_id.toString() : '';
    var fiscalYearId = request.queryParams.fiscal_year_id ? request.queryParams.fiscal_year_id.toString() : '';

    // Validate required params
    if (!projectId || !fiscalYearId) {
        response.setStatus(400);
        response.setBody({
            error: 'Missing required parameters: project_id and fiscal_year_id are required'
        });
        return;
    }

    try {
        // Instantiate the aggregator and get detail data
        var aggregator = new SPMFinancialAggregator();
        var result = aggregator.getDetailData(projectId, fiscalYearId);

        response.setStatus(200);
        response.setBody(result);
    } catch (e) {
        response.setStatus(500);
        response.setBody({
            error: 'Internal error: ' + e.message
        });
    }
}
