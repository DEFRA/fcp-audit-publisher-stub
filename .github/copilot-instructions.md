# FCP Audit Publisher Stub - AI Coding Agent Instructions

## Overview

Development and testing stub service for the Farming and Countryside Programme (FCP) audit ecosystem. Simulates the publishing of audit events to FCP Audit via AWS SNS, consistent with those published by real FCP services. Supports local development and performance testing without requiring the full FCP service suite.

## Architecture

### Event Flow
- Exposes a REST API to trigger simulated event publishing
- Publishes events to AWS SNS topic (`AWS_SNS_TOPIC_ARN`)
- FCP Audit subscribes to those events via SQS
- Scenarios defined in `src/simulate/scenarios.js` and `src/simulate/events.js`

### REST API
API is enabled by default in non-production environments:
- `POST /api/v1/simulate/audit` — Publish simulated audit events
- `GET /health` — Health check (no auth)
- `GET /documentation` — Swagger UI (development only)

Query parameters for simulate endpoints:
- `scenario` — specific scenario name (e.g. `single.event`); omit to run all
- `repetitions` — number of times to repeat (default: 1)

Full schema in the service's Swagger UI at `http://localhost:3005/documentation`.

### Core Technology Stack
- **Runtime:** Node.js 22+ with ES modules (`"type": "module"`)
- **Framework:** Hapi.js 21 for HTTP server
- **Messaging:** AWS SNS (Floci locally)
- **Testing:** Vitest with separate unit/integration directories
- **Linting:** Neostandard (modern ESLint config)
- **Config:** Convict for environment-based configuration

## Code Quality Standards

### Linting Requirements
**All code MUST pass neostandard linting before commit.**

Run linting:
```bash
npm run lint              # Check for errors
npm run lint:fix          # Auto-fix issues
```

**Common neostandard rules to follow:**
- ❌ No unused variables or imports
- ❌ No unnecessary whitespace or blank lines
- ✅ Use `const` for variables that don't change
- ✅ Consistent 2-space indentation
- ✅ Single quotes for strings (except when escaping)
- ✅ No semicolons (JavaScript ASI)
- ✅ Trailing commas in multiline objects/arrays

**When generating code:**
1. Follow existing code style in the file
2. Run linter after making changes
3. Fix all linting errors before completion
4. Never commit code with linting errors

## Standards & Guidelines

This service follows:
- **[GOV.UK Service Standard](https://www.gov.uk/service-manual/service-standard)**
- **[DEFRA Software Development Standards](https://defra.github.io/software-development-standards/)**

## Project Structure

```
src/
  index.js          # Entry point
  server.js         # Hapi server setup and plugin registration
  config.js         # Convict configuration schema
  common/helpers/   # Utilities (logging, tracing, metrics)
  plugins/          # Hapi plugins (router, swagger)
  routes/           # Route definitions
    audit.js        # POST /api/v1/simulate/audit
    health.js       # GET /health
  simulate/
    audit.js        # Handler: publishes events to SNS
    events.js       # Event payload definitions
    scenarios.js    # Scenario registry and lookup
```

## Development Patterns

### Adding a New Scenario
1. Add event payload(s) to `src/simulate/events.js`
2. Register in `src/simulate/scenarios.js` under `singleEvents` or `completeStreams`
3. Reference by dotted path (e.g. `single.auditEvent`)

### Adding a New Route
1. Add handler in `src/routes/`
2. Use Joi to validate query/params
3. Register in `src/plugins/router.js`
4. Add corresponding unit and integration tests

### API Enabled Flag
The API is gated by `API_ENABLED` config (defaults to `true` unless `ENVIRONMENT=prod`). Guards are in `src/plugins/router.js`.

## Development Workflow

### Local Development
```bash
npm install
npm run docker:build
npm run docker:dev           # Runs on port 3005
```

Requires Floci (local AWS SQS/SNS emulator), provided by Docker Compose alongside the sibling `fcp-audit` service.

### Testing

**Always run tests via Docker — config is only set correctly through Docker Compose:**

```bash
npm run docker:test          # Run all tests with coverage (required)
npm run docker:test:watch    # TDD mode
```

> **Do not run `npm test` directly.** Environment variables and service configuration (Floci/SNS) are only properly set when running through Docker Compose.

### Debugging
```bash
npm run dev:debug            # Debugger listening on 0.0.0.0:9229
```

## Testing Guidelines

### Unit Tests
- Test simulate handlers, route validation, config in isolation
- Mock AWS SDK (`@aws-sdk/client-sns`)
- Tests in `test/unit/**/*.test.js`

### Integration Tests
- Spin up real Floci via Docker Compose
- Test full request/response cycles via `server.inject()`
- Tests in `test/integration/**/*.test.js`

### Test Pattern
```javascript
import { describe, test, expect, vi } from 'vitest'

describe('simulateAudit', () => {
  test('publishes event to SNS topic', async () => {
    // Arrange
    // Act / Assert
  })
})
```

## CI/CD

### GitHub Actions
- `.github/workflows/publish.yml` — Main branch builds, runs `npm run docker:test` and SonarQube scan
- Deploys to CDP (Defra Cloud Platform)

### Key Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_SNS_TOPIC_ARN` | SNS topic ARN to publish events to | Yes |
| `AWS_ENDPOINT_URL` | AWS endpoint URL (for Floci) | Local only |
| `API_ENABLED` | Enable/disable API endpoints | No (default: true except prod) |

## Security Considerations

- **API is disabled in production** — controlled by `API_ENABLED` / `ENVIRONMENT` config
- **Input Validation:** Joi schema validates all query parameters
- **No authentication on API** — intended for internal/development use only; should not be exposed publicly
