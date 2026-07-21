import '@servicenow/sdk/global'
import { Role, Acl } from '@servicenow/sdk/core'

// Role for users who can access the SPM Financial Report
export const spm_financial_viewer = Role({
    name: 'x_snc_spm_financia.viewer',
    description: 'Grants access to the SPM Financial Report UI Page and REST API endpoints'
})

// ACL to protect the REST API endpoint
export const rest_api_acl = Acl({
    $id: Now.ID['rest-api-execute-acl'],
    type: 'rest_endpoint',
    name: 'x_snc_spm_financia/financial_report',
    operation: 'execute',
    roles: [spm_financial_viewer],
    description: 'Restricts access to the SPM Financial Report REST API to authorized users',
    active: true,
    adminOverrides: true
})

// ACL to protect the UI Page
export const ui_page_acl = Acl({
    $id: Now.ID['ui-page-read-acl'],
    type: 'ui_page',
    name: 'x_snc_spm_financia_report',
    operation: 'execute',
    roles: [spm_financial_viewer],
    description: 'Restricts access to the SPM Financial Report UI Page to authorized users',
    active: true,
    adminOverrides: true
})
