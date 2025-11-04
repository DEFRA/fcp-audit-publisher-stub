import { config } from '../config.js'
import { health } from '../routes/health.js'
import { audit } from '../routes/audit.js'

const isApiEnabled = config.get('api.enabled')

const apiRoutes = isApiEnabled ? [audit] : []

const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route(
        [].concat(
          health,
          apiRoutes
        )
      )
    }
  }
}

export { router }
