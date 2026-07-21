import '@servicenow/sdk/global';
import { UiPage } from '@servicenow/sdk/core';
import page from '../../client/index.html';

export const spm_financial_report = UiPage({
  $id: Now.ID['spm-financial-report-page'],
  endpoint: 'x_snc_spm_financia_report.do',
  html: page,
  direct: true
});
