export const event = {
  user: 'IDM/8b7c6b0a-4ea2-e911-a971-000d3a28d1a0',
  environment: 'cdp-prod',
  version: '1.0.0',
  application: 'FCP Audit',
  component: 'fcp-audit-publisher',
  security: {
    pmccode: '0706',
    priority: 0,
    details: {
      transactioncode: '2306',
      message: 'User successfully accessed audit record',
      additionalinfo: 'Audit event successfully processed'
    }
  },
  audit: {
    entities: [
      { entity: 'application', action: 'created', entityid: 'APP-79389915' }
    ],
    accounts: {
      sbi: '123456789'
    },
    status: 'success',
    details: {
      caseid: 'CRM-09384721'
    }
  }
}

export const auditEvent = {
  ...event,
  security: null
}

export const socEvent = {
  ...event,
  audit: null
}
