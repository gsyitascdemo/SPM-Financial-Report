// @ts-nocheck
/**
 * SPMFinancialAggregator — v5.0 (Fixed Currency + Current Month + Period Hierarchy)
 *
 * Key alignment with the product's FinancialsDataProviderImpl:
 *   - Uses breakdown_type='task' filter (critical fix from v2)
 *   - Queries by 'task' field (which references pm_project.sys_id directly)
 *   - Properly segregates past/future periods for Actual vs Planned
 *
 * v5 Fixes:
 *   - FIX #1: Current month gap — changed _getPastPeriods to use fiscal_start_date_time <= today
 *     so the current month is included in "past" (its actuals are counted).
 *   - FIX #2: Currency consistency — actual field is in system currency; now converts to
 *     functional currency using exchange_rate field on each breakdown record.
 *   - FIX #3: Period hierarchy over-counting — filters _getPeriodsForFiscalYears to only
 *     return month-level periods (fiscal_type='month'), preventing double/triple counting
 *     from quarter and year rollup records.
 *
 * Business Metrics (all in FUNCTIONAL currency after conversion):
 *   Budget    = SUM(budget / exchange_rate) from breakdown_type='task' across all FY monthly periods
 *   Actual    = SUM(actual / exchange_rate) from breakdown_type='task' for PAST periods (started)
 *   Committed = SUM(actual / exchange_rate) from breakdown_type='task' for FUTURE periods (actual > 0)
 *   Planned   = SUM(cost_default_currency) from breakdown_type='task' for FUTURE periods WHERE actual = 0
 *   Forecast  = Planned + Actual + Committed (total predicted spend for the fiscal year)
 */
var SPMFinancialAggregator = Class.create();
SPMFinancialAggregator.prototype = {
    initialize: function() {},

    /**
     * Gets pivot data for the financial report with expense_type breakdown.
     *
     * @param {string[]} portfolioIds - Array of portfolio sys_ids
     * @param {string[]} fiscalYearIds - Array of fiscal year sys_ids
     * @param {string[]} programIds - Array of program sys_ids (optional filter)
     * @param {string[]} projectStates - Array of project state values
     * @returns {object} Pivot data with projects array and totals (each with total/opex/capex)
     */
    getPivotData: function(portfolioIds, fiscalYearIds, programIds, projectStates) {
        var emptyMetrics = { budget: 0, planned: 0, actual: 0, committed: 0, forecast: 0 };
        var result = {
            metadata: {
                portfolioIds: portfolioIds,
                fiscalYearIds: fiscalYearIds,
                programIds: programIds || [],
                generatedAt: new GlideDateTime().getDisplayValue()
            },
            projects: [],
            totals: {
                total: { budget: 0, planned: 0, actual: 0, committed: 0, forecast: 0 },
                opex: { budget: 0, planned: 0, actual: 0, committed: 0, forecast: 0 },
                capex: { budget: 0, planned: 0, actual: 0, committed: 0, forecast: 0 }
            }
        };

        // Step 1: Get projects from all selected portfolios (capped at 200)
        var projects = this._getProjects(portfolioIds, projectStates, programIds);
        if (projects.length === 0) {
            return result;
        }

        var projectIds = [];
        var projectMap = {};
        for (var i = 0; i < projects.length; i++) {
            projectIds.push(projects[i].sys_id);
            projectMap[projects[i].sys_id] = projects[i];
            projectMap[projects[i].sys_id].total = { budget: 0, planned: 0, actual: 0, committed: 0, forecast: 0 };
            projectMap[projects[i].sys_id].opex = { budget: 0, planned: 0, actual: 0, committed: 0, forecast: 0 };
            projectMap[projects[i].sys_id].capex = { budget: 0, planned: 0, actual: 0, committed: 0, forecast: 0 };
        }

        // Step 2: Get MONTHLY fiscal period IDs for the selected fiscal years (FIX #3)
        var monthlyPeriodIds = this._getPeriodsForFiscalYears(fiscalYearIds);

        // Step 3: Determine which periods are FUTURE vs PAST (FIX #1: current month → past)
        var futurePeriodIds = this._getFuturePeriods(monthlyPeriodIds);
        var pastPeriodIds = this._getPastPeriods(monthlyPeriodIds);

        // Step 4: Aggregate Budget (all monthly periods, with currency conversion) (FIX #2 + #3)
        this._aggregateBudget(projectIds, monthlyPeriodIds, projectMap);

        // Step 5: Aggregate Actual (PAST periods only, with currency conversion) (FIX #1 + #2)
        this._aggregateActual(projectIds, pastPeriodIds, projectMap);

        // Step 6: Aggregate Committed (FUTURE periods where actual > 0, with currency conversion) (FIX #2)
        this._aggregateCommitted(projectIds, futurePeriodIds, projectMap);

        // Step 7: Aggregate Planned (FUTURE periods where actual = 0, already in functional currency)
        this._aggregatePlanned(projectIds, futurePeriodIds, projectMap);

        // Step 8: Calculate Forecast and build output
        for (var j = 0; j < projectIds.length; j++) {
            var id = projectIds[j];
            var proj = projectMap[id];

            // Calculate forecast for each category: Forecast = Planned + Actual + Committed
            proj.total.forecast = proj.total.planned + proj.total.actual + proj.total.committed;
            proj.opex.forecast = proj.opex.planned + proj.opex.actual + proj.opex.committed;
            proj.capex.forecast = proj.capex.planned + proj.capex.actual + proj.capex.committed;

            // Accumulate totals
            var categories = ['total', 'opex', 'capex'];
            var metrics = ['budget', 'planned', 'actual', 'committed', 'forecast'];
            for (var c = 0; c < categories.length; c++) {
                var cat = categories[c];
                for (var m = 0; m < metrics.length; m++) {
                    var met = metrics[m];
                    result.totals[cat][met] += proj[cat][met];
                }
            }

            result.projects.push({
                sys_id: proj.sys_id,
                number: proj.number,
                short_description: proj.short_description,
                state: proj.state,
                total: {
                    budget: proj.total.budget,
                    planned: proj.total.planned,
                    actual: proj.total.actual,
                    committed: proj.total.committed,
                    forecast: proj.total.forecast
                },
                opex: {
                    budget: proj.opex.budget,
                    planned: proj.opex.planned,
                    actual: proj.opex.actual,
                    committed: proj.opex.committed,
                    forecast: proj.opex.forecast
                },
                capex: {
                    budget: proj.capex.budget,
                    planned: proj.capex.planned,
                    actual: proj.capex.actual,
                    committed: proj.capex.committed,
                    forecast: proj.capex.forecast
                }
            });
        }

        return result;
    },

    /**
     * Gets detail data for a specific project and fiscal year.
     */
    getDetailData: function(projectId, fiscalYearId) {
        var result = {
            cost_plans: [],
            committed_lines: []
        };

        // Get cost_plan records for the project
        var cpGr = new GlideRecord('cost_plan');
        cpGr.addQuery('task', projectId);
        cpGr.query();
        while (cpGr.next()) {
            result.cost_plans.push({
                sys_id: cpGr.getUniqueValue(),
                name: cpGr.getValue('name') || '',
                type: cpGr.getValue('expense_type') || '',
                amount: parseFloat(cpGr.getValue('cost_default_currency')) || 0,
                period: cpGr.getDisplayValue('start_fiscal_period') + ' → ' + cpGr.getDisplayValue('end_fiscal_period')
            });
        }

        // Get committed breakdown lines (future periods with actual > 0, breakdown_type='task')
        var futurePeriodIds = this._getFuturePeriodsForFiscalYear(fiscalYearId);
        if (futurePeriodIds.length > 0) {
            var elGr = new GlideRecord('cost_plan_breakdown');
            elGr.addQuery('task', projectId);
            elGr.addQuery('fiscal_period', 'IN', futurePeriodIds.join(','));
            elGr.addQuery('breakdown_type', 'task');
            elGr.addQuery('actual', '>', 0);
            elGr.query();
            while (elGr.next()) {
                var actual = parseFloat(elGr.getValue('actual')) || 0;
                var rate = parseFloat(elGr.getValue('exchange_rate')) || 1;
                // FIX #2: Convert from system currency to functional currency
                var convertedAmount = (rate > 0) ? actual / rate : actual;
                result.committed_lines.push({
                    sys_id: elGr.getUniqueValue(),
                    description: elGr.getValue('expense_type') || 'Committed',
                    amount: convertedAmount,
                    period: elGr.getDisplayValue('fiscal_period') || ''
                });
            }
        }

        return result;
    },

    /**
     * Distributes a value into the correct category bucket on a project map entry.
     * @private
     */
    _distribute: function(projectMap, taskId, expType, metric, value) {
        if (!projectMap[taskId]) return;
        var cat = (expType === 'opex' || expType === 'capex') ? expType : 'opex';
        // Add to specific category
        projectMap[taskId][cat][metric] += value;
        // Always add to total
        projectMap[taskId].total[metric] += value;
    },

    /**
     * Converts a system-currency amount to functional currency using the exchange rate.
     * If exchange_rate is missing or zero, returns the original value (assumes 1:1).
     * @private
     */
    _convertToFunctional: function(amount, exchangeRate) {
        if (exchangeRate && exchangeRate > 0 && exchangeRate !== 1) {
            return amount / exchangeRate;
        }
        return amount;
    },

    /**
     * Aggregates Budget from cost_plan_breakdown for ALL monthly periods.
     * Uses GlideRecord to convert each record's budget from system to functional currency.
     * @private
     */
    _aggregateBudget: function(projectIds, periodIds, projectMap) {
        if (periodIds.length === 0) return;

        var gr = new GlideRecord('cost_plan_breakdown');
        gr.addQuery('task', 'IN', projectIds.join(','));
        gr.addQuery('fiscal_period', 'IN', periodIds.join(','));
        gr.addQuery('breakdown_type', 'task');
        gr.query();

        while (gr.next()) {
            var taskId = gr.getValue('task');
            var expType = gr.getValue('expense_type') || '';
            var budget = parseFloat(gr.getValue('budget')) || 0;
            var rate = parseFloat(gr.getValue('exchange_rate')) || 1;
            var val = this._convertToFunctional(budget, rate);
            this._distribute(projectMap, taskId, expType, 'budget', val);
        }
    },

    /**
     * Aggregates Actual from cost_plan_breakdown for PAST periods (periods that have started).
     * Converts from system currency to functional currency using exchange_rate.
     * FIX #1: Now includes current month since _getPastPeriods uses fiscal_start_date_time <= today.
     * FIX #2: Converts actual / exchange_rate for correct currency.
     * @private
     */
    _aggregateActual: function(projectIds, pastPeriodIds, projectMap) {
        if (pastPeriodIds.length === 0) return;

        var gr = new GlideRecord('cost_plan_breakdown');
        gr.addQuery('task', 'IN', projectIds.join(','));
        gr.addQuery('fiscal_period', 'IN', pastPeriodIds.join(','));
        gr.addQuery('breakdown_type', 'task');
        gr.query();

        while (gr.next()) {
            var taskId = gr.getValue('task');
            var expType = gr.getValue('expense_type') || '';
            var actual = parseFloat(gr.getValue('actual')) || 0;
            var rate = parseFloat(gr.getValue('exchange_rate')) || 1;
            var val = this._convertToFunctional(actual, rate);
            this._distribute(projectMap, taskId, expType, 'actual', val);
        }
    },

    /**
     * Committed = SUM(actual / exchange_rate) from cost_plan_breakdown for FUTURE periods where actual > 0.
     * FIX #2: Converts from system currency to functional currency.
     * @private
     */
    _aggregateCommitted: function(projectIds, futurePeriodIds, projectMap) {
        if (futurePeriodIds.length === 0) return;

        var gr = new GlideRecord('cost_plan_breakdown');
        gr.addQuery('task', 'IN', projectIds.join(','));
        gr.addQuery('fiscal_period', 'IN', futurePeriodIds.join(','));
        gr.addQuery('breakdown_type', 'task');
        gr.addQuery('actual', '>', 0);
        gr.query();

        while (gr.next()) {
            var taskId = gr.getValue('task');
            var expType = gr.getValue('expense_type') || '';
            var actual = parseFloat(gr.getValue('actual')) || 0;
            var rate = parseFloat(gr.getValue('exchange_rate')) || 1;
            var val = this._convertToFunctional(actual, rate);
            this._distribute(projectMap, taskId, expType, 'committed', val);
        }
    },

    /**
     * Planned = SUM(cost_default_currency) from cost_plan_breakdown for FUTURE periods
     * WHERE actual = 0 (costs planned but not yet realized).
     * NOTE: cost_default_currency is already in functional currency — no conversion needed.
     * Groups by task + expense_type via GlideAggregate for performance.
     * @private
     */
    _aggregatePlanned: function(projectIds, futurePeriodIds, projectMap) {
        if (futurePeriodIds.length === 0) return;

        var ga = new GlideAggregate('cost_plan_breakdown');
        ga.addQuery('task', 'IN', projectIds.join(','));
        ga.addQuery('fiscal_period', 'IN', futurePeriodIds.join(','));
        ga.addQuery('breakdown_type', 'task');
        ga.addQuery('actual', '=', 0);
        ga.groupBy('task');
        ga.groupBy('expense_type');
        ga.addAggregate('SUM', 'cost_default_currency');
        ga.query();

        while (ga.next()) {
            var taskId = ga.getValue('task');
            var expType = ga.getValue('expense_type') || '';
            var val = parseFloat(ga.getAggregate('SUM', 'cost_default_currency')) || 0;
            this._distribute(projectMap, taskId, expType, 'planned', val);
        }
    },

    /**
     * Gets projects for one or more portfolios filtered by state and optionally by program.
     * Performance: capped at 200 projects max.
     * @private
     */
    _getProjects: function(portfolioIds, projectStates, programIds) {
        var projects = [];
        var gr = new GlideRecord('pm_project');
        gr.addQuery('primary_portfolio', 'IN', portfolioIds.join(','));
        gr.addQuery('active', true);
        if (projectStates && projectStates.length > 0) {
            gr.addQuery('state', 'IN', projectStates.join(','));
        }
        if (programIds && programIds.length > 0) {
            gr.addQuery('primary_program', 'IN', programIds.join(','));
        }
        gr.setLimit(200);
        gr.query();
        while (gr.next()) {
            projects.push({
                sys_id: gr.getUniqueValue(),
                number: gr.getValue('number') || '',
                short_description: gr.getValue('short_description') || '',
                state: gr.getValue('state') || ''
            });
        }
        return projects;
    },

    /**
     * Gets MONTHLY fiscal period sys_ids belonging to the given fiscal year IDs.
     * FIX #3: Only returns month-level periods (fiscal_type='month') to prevent
     * double-counting from quarter and year rollup records in cost_plan_breakdown.
     * @private
     */
    _getPeriodsForFiscalYears: function(fiscalYearIds) {
        var periodIds = [];
        var gr = new GlideRecord('fiscal_period');
        gr.addQuery('fiscal_year', 'IN', fiscalYearIds.join(','));
        gr.addQuery('fiscal_type', 'month');
        gr.query();
        while (gr.next()) {
            periodIds.push(gr.getUniqueValue());
        }
        return periodIds;
    },

    /**
     * From a list of period IDs, returns those whose fiscal_start_date_time <= today.
     * FIX #1: Changed from fiscal_end_date_time <= today to fiscal_start_date_time <= today.
     * This ensures the CURRENT month is included (it has started, so actuals may exist).
     * @private
     */
    _getPastPeriods: function(periodIds) {
        if (periodIds.length === 0) return [];

        var today = new GlideDateTime();
        var pastPeriods = [];

        var gr = new GlideRecord('fiscal_period');
        gr.addQuery('sys_id', 'IN', periodIds.join(','));
        gr.addQuery('fiscal_start_date_time', '<=', today);
        gr.query();
        while (gr.next()) {
            pastPeriods.push(gr.getUniqueValue());
        }
        return pastPeriods;
    },

    /**
     * From a list of period IDs, returns only those whose fiscal_start_date_time > today (FUTURE).
     * These are periods that have NOT YET STARTED.
     * @private
     */
    _getFuturePeriods: function(periodIds) {
        if (periodIds.length === 0) return [];

        var today = new GlideDateTime();
        var futurePeriods = [];

        var gr = new GlideRecord('fiscal_period');
        gr.addQuery('sys_id', 'IN', periodIds.join(','));
        gr.addQuery('fiscal_start_date_time', '>', today);
        gr.query();
        while (gr.next()) {
            futurePeriods.push(gr.getUniqueValue());
        }
        return futurePeriods;
    },

    /**
     * Gets future MONTHLY period IDs for a single fiscal year (used by getDetailData).
     * FIX #3: Only returns month-level periods.
     * @private
     */
    _getFuturePeriodsForFiscalYear: function(fiscalYearId) {
        var allPeriods = this._getPeriodsForFiscalYears([fiscalYearId]);
        return this._getFuturePeriods(allPeriods);
    },

    type: 'SPMFinancialAggregator'
};
