import { constants as httpConstants } from 'node:http2'
import Joi from 'joi'
import { simulateMessages } from '../simulate/audit.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const { HTTP_STATUS_ACCEPTED } = httpConstants

const logger = createLogger()

const audit = {
  method: 'POST',
  path: '/api/v1/simulate/audit',
  options: {
    description: 'Simulate audit events from FCP services',
    notes: 'Scenario and number of repetitions can be specified',
    tags: ['api', 'simulate', 'audit'],
    validate: {
      query: {
        scenario: Joi.string().allow('').description('The scenario to simulate audit events for. If not provided, all known scenarios will be used'),
        repetitions: Joi.number().integer().min(1).max(100000).default(1).description('The number of times to repeat the scenario')
      }
    }
  },
  handler: async (request, h) => {
    const { scenario, repetitions } = request.query

    simulateMessages({ scenario, repetitions })
      .then(summary => {
        logger.info(`Simulated messages summary: ${JSON.stringify(summary)}`)
      })
      .catch(err => {
        logger.error(`Simulate messages failed: ${err.message}`)
      })

    return h.response({ status: 'ok', message: 'Simulation started' }).code(HTTP_STATUS_ACCEPTED)
  }
}

export { audit }
