import * as events from './events.js'

export const singleEvents = {
  event: [events.event],
  auditEvent: [events.auditEvent],
  socEvent: [events.socEvent]
}

export const completeStreams = {}

export const scenarios = {
  single: singleEvents,
  streams: completeStreams
}

export function getScenario (path) {
  const parts = path.split('.')
  let current = scenarios

  for (const part of parts) {
    if (current[part]) {
      current = current[part]
    } else {
      throw new Error(`Scenario not found: ${path}`)
    }
  }

  return current
}

export function listScenarios () {
  const list = []

  function traverse (obj, path = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key
      if (Array.isArray(value)) {
        list.push({
          path: currentPath,
          count: value.length
        })
      } else if (typeof value === 'object') {
        traverse(value, currentPath)
      } else {
        list.push({
          path: currentPath,
          count: 1
        })
      }
    }
  }

  traverse(scenarios)
  return list
}
