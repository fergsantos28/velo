import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {
    return {
        async goToFinishi() {
            await page.getByTestId('checkout-button').click()
        },

        async expectCheckoutPrice(price: string) {
            const priceElement = page.getByTestId('summary-total-price')
            await expect(priceElement).toHaveText(price)
        },
    }
}
