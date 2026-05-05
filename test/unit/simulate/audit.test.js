import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('@defra/fcp-audit-publisher', () => ({
  publishAuditEvent: vi.fn().mockResolvedValue({ messageId: 'test-message-id' })
}))

vi.mock('../../../src/config.js', () => ({
  config: {
    get: vi.fn().mockReturnValue({
      sns: { topicArn: 'arn:aws:sns:eu-west-2:000000000000:fcp_audit' },
      region: 'eu-west-2',
      endpoint: null,
      accessKeyId: 'test',
      secretAccessKey: 'test'
    })
  }
}))

vi.mock('@aws-sdk/client-sns', () => ({
  SNSClient: vi.fn()
}))

const { publishAuditEvent } = await import('@defra/fcp-audit-publisher')
const { simulateMessages } = await import('../../../src/simulate/audit.js')

describe('simulateMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('publishes all scenarios when no scenario is specified', async () => {
    await simulateMessages({ scenario: undefined, repetitions: 1 })

    // 3 single events: event, auditEvent, socEvent
    expect(publishAuditEvent).toHaveBeenCalledTimes(3)
  })

  test('publishes only the specified scenario', async () => {
    await simulateMessages({ scenario: 'single.auditEvent', repetitions: 1 })

    expect(publishAuditEvent).toHaveBeenCalledTimes(1)
  })

  test('multiplies publish calls by repetitions', async () => {
    await simulateMessages({ scenario: 'single.auditEvent', repetitions: 3 })

    expect(publishAuditEvent).toHaveBeenCalledTimes(3)
  })

  test('returns correct summary for a single scenario with one repetition', async () => {
    const result = await simulateMessages({ scenario: 'single.auditEvent', repetitions: 1 })

    expect(result).toEqual({ scenarios: 1, events: 1, repetitions: 1 })
  })

  test('returns correct summary for all scenarios with multiple repetitions', async () => {
    const result = await simulateMessages({ scenario: undefined, repetitions: 2 })

    // 3 scenarios, each with 1 event, repeated 2 times = 6 events total
    expect(result).toEqual({ scenarios: 3, events: 6, repetitions: 2 })
  })

  test('calls publishAuditEvent with snsClient, topicArn and generateCorrelationId', async () => {
    await simulateMessages({ scenario: 'single.auditEvent', repetitions: 1 })

    expect(publishAuditEvent).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        sns: { topicArn: 'arn:aws:sns:eu-west-2:000000000000:fcp_audit' },
        generateCorrelationId: true,
        ip: expect.any(String)
      })
    )
  })

  test('strips correlationid from event before publishing', async () => {
    await simulateMessages({ scenario: 'single.auditEvent', repetitions: 1 })

    const [eventArg] = publishAuditEvent.mock.calls[0]
    expect(eventArg).not.toHaveProperty('correlationid')
  })

  test('throws when scenario is not found', async () => {
    await expect(
      simulateMessages({ scenario: 'single.unknown', repetitions: 1 })
    ).rejects.toThrow('Scenario not found: single.unknown')
  })
})
