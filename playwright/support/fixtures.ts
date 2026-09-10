import { test as base } from '@playwright/test'

import { createOrderLookupActions } from '../support/actions/orderLookupActions'
import { createConfiguratorActions } from '../support/actions/configuratorActions'
import { createCheckoutActions } from '../support/actions/checkoutActions'

import { mockCreditAnalysis } from '../support/mock.api'

type App = {
  orderLookup: ReturnType<typeof createOrderLookupActions>
  configurator: ReturnType<typeof createConfiguratorActions>
  checkout: ReturnType<typeof createCheckoutActions>
  mock: {
    creditAnalysis: (score: number) => Promise<void>
  }
}


export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      orderLookup: createOrderLookupActions(page),
      configurator: createConfiguratorActions(page),
      checkout: createCheckoutActions(page),
      mock: {
        creditAnalysis: async (score: number) => await mockCreditAnalysis(page, score),
      }
    }
    await use(app)
  },
})

export { expect } from '@playwright/test'