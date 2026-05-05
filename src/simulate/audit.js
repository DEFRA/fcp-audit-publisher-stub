import { SNSClient } from '@aws-sdk/client-sns'
import { publishAuditEvent } from '@defra/fcp-audit-publisher'
import { config } from '../config.js'
import { getScenario, listScenarios } from './scenarios.js'

const { sns, region, endpoint, accessKeyId, secretAccessKey } = config.get('aws')

const snsClient = new SNSClient({
  region,
  ...(endpoint && {
    endpoint,
    credentials: { accessKeyId, secretAccessKey }
  })
})

export async function simulateMessages ({ scenario, repetitions }) {
  const scenarios = getScenarios(scenario)
  let totalEvents = 0

  for (let i = 0; i < repetitions; i++) {
    for (const s of scenarios) {
      for (const event of s) {
        totalEvents++

        const { correlationid: _correlationid, ...eventPayload } = event
        await publishAuditEvent(
          eventPayload,
          { snsClient, sns: { topicArn: sns.topicArn }, generateCorrelationId: true }
        )
      }
    }
  }

  return { scenarios: scenarios.length, events: totalEvents, repetitions }
}

function getScenarios (scenario) {
  const wrap = x => Array.isArray(x) ? x : [x]
  if (scenario) {
    return [wrap(getScenario(scenario))]
  }
  return listScenarios().map(s => wrap(getScenario(s.path)))
}
