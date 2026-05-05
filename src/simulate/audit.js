import os from 'node:os'
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

function getSelfIp () {
  const interfaces = os.networkInterfaces()
  for (const iface of Object.values(interfaces)) {
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address
      }
    }
  }
  return '127.0.0.1'
}

export async function simulateMessages ({ scenario, repetitions }) {
  const scenarios = getScenarios(scenario)
  let totalEvents = 0

  for (let i = 0; i < repetitions; i++) {
    for (const s of scenarios) {
      for (const event of s) {
        totalEvents++

        await publishAuditEvent(
          event, { snsClient, sns: { topicArn: sns.topicArn }, generateCorrelationId: true, ip: getSelfIp() }
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
