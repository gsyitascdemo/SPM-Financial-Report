/**
 * Type declarations for the x_snc_spm_financia scope's Script Includes.
 * These are auto-available at runtime when imported from @servicenow/glide/x_snc_spm_financia.
 */

interface MetricsBlock {
    budget: number;
    planned: number;
    actual: number;
    committed: number;
    forecast: number;
}

declare module '@servicenow/glide/x_snc_spm_financia' {
    export class SPMFinancialAggregator {
        constructor();
        initialize(): void;
        getPivotData(
            portfolioIds: string[],
            fiscalYearIds: string[],
            programIds: string[],
            projectStates: string[]
        ): {
            metadata: {
                portfolioIds: string[];
                fiscalYearIds: string[];
                programIds: string[];
                generatedAt: string;
            };
            projects: Array<{
                sys_id: string;
                number: string;
                short_description: string;
                state: string;
                total: MetricsBlock;
                opex: MetricsBlock;
                capex: MetricsBlock;
            }>;
            totals: {
                total: MetricsBlock;
                opex: MetricsBlock;
                capex: MetricsBlock;
            };
        };
        getDetailData(
            projectId: string,
            fiscalYearId: string
        ): {
            cost_plans: Array<{
                sys_id: string;
                name: string;
                type: string;
                amount: number;
                period: string;
            }>;
            committed_lines: Array<{
                sys_id: string;
                description: string;
                amount: number;
                period: string;
            }>;
        };
        type: string;
    }
}
