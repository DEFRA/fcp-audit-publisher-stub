import { constants as httpConstants } from 'node:http2'
import { describe, test, beforeEach, afterEach, vi, expect } from 'vitest'

const { HTTP_STATUS_ACCEPTED, HTTP_STATUS_BAD_REQUEST } = httpConstants

vi.mock('@defra/fcp-audit-publisher', () => ({
  publishAuditEvent: vi.fn().mockResolvedValue({ messageId: 'test-message-id' })
}))

vi.mock('@aws-sdk/client-sns', () => ({
  SNSClient: vi.fn()
}))

const { createServer } = await import('../../../../src/server.js')

let server

describe('audit routes', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('POST /api/v1/simulate/audit returns 202', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/audit'
    })

    expect(response.statusCode).toBe(HTTP_STATUS_ACCEPTED)
  })

  test('POST /api/v1/simulate/audit returns ok status', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/audit'
    })

    expect(JSON.parse(response.payload)).toMatchObject({ status: 'ok' })
  })

  test('POST /api/v1/simulate/audit?scenario=single.event returns 202', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/audit?scenario=single.event'
    })

    expect(response.statusCode).toBe(HTTP_STATUS_ACCEPTED)
  })

  test('POST /api/v1/simulate/audit?repetitions=0 returns 400', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/audit?repetitions=0'
    })

    expect(response.statusCode).toBe(HTTP_STATUS_BAD_REQUEST)
  })
})
