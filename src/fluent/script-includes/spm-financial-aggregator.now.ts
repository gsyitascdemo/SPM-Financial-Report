import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['SPMFinancialAggregator'],
    name: 'SPMFinancialAggregator',
    script: Now.include('../../server/SPMFinancialAggregator.js'),
    description:
        'Server-side aggregation logic for SPM financial reporting. Provides pivot data (budget, planned, actual, committed, residual) across projects and fiscal years using optimized GlideAggregate queries.',
    accessibleFrom: 'public',
    clientCallable: false,
    active: true,
    apiName: 'x_snc_spm_financia.SPMFinancialAggregator',
    mobileCallable: false,
    sandboxCallable: false,
})
