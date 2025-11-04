export const example = {
  eventType: 'BANK_DETAILS_AUDIT',
  timestamp: new Date().toISOString(),
  userId: 'farmer.john@example.com',
  sourceIp: '10.44.122.15',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  correlationId: '123e4567-e89b-12d3-a456-426614174000',
  security: {
    action: 'LOGIN_SUCCESS',
    location: 'Norwich, UK',
    details: {
      authenticatedMethod: 'Portal DB',
      role: 'FARMER_USER'
    }
  },
  audit: {
    action: 'UPDATE_BANK_DETAILS',
    entity: 'BankDetails',
    entityId: 'BNK-76439210',
    status: 'SUCCESS',
    details: {
      caseId: 'CRM-09384721'
    }
  }
}
