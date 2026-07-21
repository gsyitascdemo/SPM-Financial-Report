import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    '1e06fa3793d90f94e538fd731103d6a4': {
                        table: 'sys_scope_privilege'
                        id: '1e06fa3793d90f94e538fd731103d6a4'
                    }
                    '25bdd57893a9c318e538fd731103d69d': {
                        table: 'sys_scope_privilege'
                        id: '25bdd57893a9c318e538fd731103d69d'
                    }
                    '322d667f93d50f94e538fd731103d699': {
                        table: 'sys_scope_privilege'
                        id: '322d667f93d50f94e538fd731103d699'
                    }
                    '362d6a7f93d50f94e538fd731103d610': {
                        table: 'sys_scope_privilege'
                        id: '362d6a7f93d50f94e538fd731103d610'
                    }
                    '5e063ef393d90f94e538fd731103d638': {
                        table: 'sys_scope_privilege'
                        id: '5e063ef393d90f94e538fd731103d638'
                    }
                    '722d2a7f93d50f94e538fd731103d6da': {
                        table: 'sys_scope_privilege'
                        id: '722d2a7f93d50f94e538fd731103d6da'
                    }
                    '9a06fa3793d90f94e538fd731103d693': {
                        table: 'sys_scope_privilege'
                        id: '9a06fa3793d90f94e538fd731103d693'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: 'e27fb168cf23439d9c1f22f67c064d62'
                    }
                    de06fa3793d90f94e538fd731103d68d: {
                        table: 'sys_scope_privilege'
                        id: 'de06fa3793d90f94e538fd731103d68d'
                    }
                    'detail-route': {
                        table: 'sys_ws_operation'
                        id: '5cb8bb7c899b4f0184889af786f52665'
                    }
                    f1c8b4b493694f94abe326b877373c65: {
                        table: 'sys_scope_privilege'
                        id: 'f1c8b4b493694f94abe326b877373c65'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '777666acfb9147e99c0eed2fbbddf145'
                    }
                    'param-expense-type': {
                        table: 'sys_ws_query_parameter'
                        id: '79c6116d9f8147759579298658998a2c'
                    }
                    'param-fiscal-year-id': {
                        table: 'sys_ws_query_parameter'
                        id: '469f1a2439274ca7ae9e8b2418c342c4'
                    }
                    'param-fiscal-years': {
                        table: 'sys_ws_query_parameter'
                        id: 'fbadea9d4a3f4573a3a025ff94586414'
                    }
                    'param-portfolio-id': {
                        table: 'sys_ws_query_parameter'
                        id: '5f27260b82fb4533bec97eccfb1f9e94'
                    }
                    'param-project-id': {
                        table: 'sys_ws_query_parameter'
                        id: 'c2d7114507974b949f319ea0440dd44c'
                    }
                    'param-project-state': {
                        table: 'sys_ws_query_parameter'
                        id: 'bdb2cb62aea4483cb7b0beb0c2577d9d'
                    }
                    'pivot-route': {
                        table: 'sys_ws_operation'
                        id: 'f30eb644665240c8934d3e62d44f47d9'
                    }
                    'rest-api-execute-acl': {
                        table: 'sys_security_acl'
                        id: 'c33d675c74c44b7ea462dbb0a2134878'
                    }
                    'spm-financial-report-api': {
                        table: 'sys_ws_definition'
                        id: '2ec12009e6704f0fadb127a6a75e4308'
                    }
                    SPMFinancialAggregator: {
                        table: 'sys_script_include'
                        id: 'ee940e150b9640c58e06e24dd1968781'
                    }
                    'src_server_rest-handlers_detail-handler_js': {
                        table: 'sys_module'
                        id: '5801fdb13e934fbe943ea20af4c72190'
                    }
                    'src_server_rest-handlers_pivot-handler_js': {
                        table: 'sys_module'
                        id: 'bde3b199cddb4b66b8d9c203c6000768'
                    }
                    src_server_SPMFinancialAggregator_js: {
                        table: 'sys_module'
                        id: 'ed2c6f90f40a471f9c2d868eb5377e3d'
                    }
                    'ui-page-read-acl': {
                        table: 'sys_security_acl'
                        id: '440ec988ee624afeb26fab5ee1146344'
                    }
                }
                composite: [
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '0c478e1b0154436f9d5de85e2ee6d517'
                        key: {
                            web_service_operation: 'f30eb644665240c8934d3e62d44f47d9'
                            web_service_query_parameter: '79c6116d9f8147759579298658998a2c'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '16fcd38342124a6cb0d6a8d548468e1b'
                        key: {
                            web_service_operation: 'f30eb644665240c8934d3e62d44f47d9'
                            web_service_query_parameter: 'fbadea9d4a3f4573a3a025ff94586414'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '174390b3542d47de896b256ac428c1d4'
                        key: {
                            name: 'x_snc_spm_financia/main.js.map'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '221338e572284b49b27e918164c7b7b3'
                        key: {
                            web_service_operation: 'f30eb644665240c8934d3e62d44f47d9'
                            web_service_query_parameter: 'bdb2cb62aea4483cb7b0beb0c2577d9d'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '32f153961287485c86c6fff04f711361'
                        key: {
                            name: 'x_snc_spm_financia/main'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: '3fadb64fae7b40cdb6ce5b060d2ed386'
                        key: {
                            name: 'x_snc_spm_financia_report.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '55f1d7826c064beb92481f81876f1202'
                        key: {
                            web_service_operation: 'f30eb644665240c8934d3e62d44f47d9'
                            web_service_query_parameter: '5f27260b82fb4533bec97eccfb1f9e94'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '6dbecae1cf564a87837517b9034c2a27'
                        key: {
                            sys_security_acl: '440ec988ee624afeb26fab5ee1146344'
                            sys_user_role: {
                                id: 'c9c950f31d514acf932c1fd303a29184'
                                key: {
                                    name: 'x_snc_spm_financia.viewer'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: '73e6b7367c0746518bc452e51c9f5113'
                        key: {
                            web_service_operation: '5cb8bb7c899b4f0184889af786f52665'
                            web_service_query_parameter: 'c2d7114507974b949f319ea0440dd44c'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '7f5de59b13844d21842c7efd47fb1714'
                        key: {
                            application_file: '32f153961287485c86c6fff04f711361'
                            source_artifact: '3fadb64fae7b40cdb6ce5b060d2ed386'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '8f287ef14e1b4b4c8413efe8303df16f'
                        key: {
                            endpoint: 'x_snc_spm_financia_report.do'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'a32132687c6e40bc9778590c96ee0ce6'
                        key: {
                            application_file: '174390b3542d47de896b256ac428c1d4'
                            source_artifact: '3fadb64fae7b40cdb6ce5b060d2ed386'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'ab4c256b970d4dfe8df84a530590ad13'
                        key: {
                            sys_security_acl: 'c33d675c74c44b7ea462dbb0a2134878'
                            sys_user_role: {
                                id: 'c9c950f31d514acf932c1fd303a29184'
                                key: {
                                    name: 'x_snc_spm_financia.viewer'
                                }
                            }
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'ab5452bf96da4e0ba67bc00725b6fa96'
                        key: {
                            application_file: '8f287ef14e1b4b4c8413efe8303df16f'
                            source_artifact: '3fadb64fae7b40cdb6ce5b060d2ed386'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: 'c9c950f31d514acf932c1fd303a29184'
                        key: {
                            name: 'x_snc_spm_financia.viewer'
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: 'e2a256b686454a5c8bc7156a15700987'
                        key: {
                            web_service_operation: '5cb8bb7c899b4f0184889af786f52665'
                            web_service_query_parameter: '469f1a2439274ca7ae9e8b2418c342c4'
                        }
                    },
                ]
            }
        }
    }
}
