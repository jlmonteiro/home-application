import { beforeEach, afterEach } from 'playwright/test'
import { setupWorker } from 'msw/browser'
import { e2eHandlers } from '../src/test/e2e/mocks/handlers'

// Start MSW worker when E2E_MOCK is set
const worker = setupWorker(...e2eHandlers)

beforeEach(async () => {
  if (process.env.E2E_MOCK) {
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
})

afterEach(async () => {
  if (process.env.E2E_MOCK) {
    await worker.stop()
  }
})