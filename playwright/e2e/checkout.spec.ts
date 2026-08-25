import { test, expect } from '../support/fixtures'
import { deleteOrderCheckout } from '../support/databse/orderRepository'

test.describe('Checkout - validações', () => {
  test.describe('Validações de campos obrigatórios', () => {
    test.beforeEach(async ({ page, app }) => {
      await page.goto('/order')
      await app.checkout.expectLoaded()
    })

    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
      const alerts = app.checkout.elements.alerts

      await app.checkout.submit()

      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ page, app }) => {
      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'teste@teste.com',
        document: '00000014141',
        phone: '(11) 99999-9999',
      }

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      await expect(page.getByTestId('error-name')).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(page.getByTestId('error-lastname')).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ page, app }) => {
      const customer = {
        name: 'Fernando',
        lastname: 'Teste',
        email: 'test@.com',
        document: '00000014141',
        phone: '(11) 99999-9999',
      }

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      await expect(page.getByTestId('error-email')).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ page, app }) => {
      const customer = {
        name: 'Fernando',
        lastname: 'Teste',
        email: 'teste@teste.com',
        document: '000000199999',
        phone: '(11) 99999-9999',
      }

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      await expect(page.getByTestId('error-document')).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ page, app }) => {
      const customer = {
        name: 'Fernando',
        lastname: 'Teste',
        email: 'teste@teste.com',
        document: '00000014141',
        phone: '(11) 99999-9999',
      }

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')

      await expect(app.checkout.elements.terms).not.toBeChecked()

      await app.checkout.submit()

      await expect(page.getByTestId('error-terms')).toHaveText('Aceite os termos')
    })
  })

  test.describe('Pagamento e Confirmação', () => {
    test('deve criar um pedido com sucesso para pagamento à vista', async ({ app }) => {
      const customer = {
        name: 'Fernando',
        lastname: 'Silva',
        email: 'MelhorQA@teste.com',
        document: '05366127068',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'À Vista',
        totalPrice: 'R$ 40.000,00',
      }

      await deleteOrderCheckout(customer.email, customer.document)

      await app.checkout.startPurchaseFromHome()
      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.expectSummaryTotal(customer.totalPrice)
      await app.checkout.acceptTerms()

      await app.checkout.submit()
      await app.checkout.expectResult('Pedido Aprovado!')
    })

    test('Deve aprovar automaticamente o financiamento quando o score do CPF for maior que 700.', async ({ app }) => {
      const customer = {
        name: 'Nome sujo',
        lastname: 'silva',
        email: 'teste@teste.com',
        document: '39428928046',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
      }

      await deleteOrderCheckout(customer.email, customer.document)

      await app.checkout.mockCreditAnalysis(710)

      await app.checkout.startPurchaseFromHome()
      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()
      await app.checkout.expectResult('Pedido Aprovado!')
    })

    test('deve deixar o pedido em análise quando o score do CPF estiver entre 501 e 700', async ({ app }) => {
      const customer = {
        name: 'Fernando',
        lastname: 'Analise',
        email: 'ct07.analise@teste.com',
        document: '39428928046',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
      }

      await deleteOrderCheckout(customer.email, customer.document)

      await app.checkout.mockCreditAnalysis(600)

      await app.checkout.startPurchaseFromHome(/Configure Agora/i)
      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()
      await app.checkout.expectResult('Pedido em Análise!')
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento sem entrada', async ({ app }) => {
      const customer = {
        name: 'Rogerio',
        lastname: 'Garcia',
        email: 'rogerinho@dailyplanet.com',
        document: '52998224725',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
      }

      await deleteOrderCheckout(customer.email, customer.document)

      await app.checkout.mockCreditAnalysis(500)
      await app.checkout.startPurchaseFromHome(/Configure Agora/i)
      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()
      await app.checkout.expectResult(/Pedido Reprovado/i)
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada menor que 50%', async ({ app }) => {
      const customer = {
        name: 'Diana',
        lastname: 'Prince',
        email: 'diana@themiscira.com',
        document: '11144477735',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '10000',
      }

      await deleteOrderCheckout(customer.email, customer.document)

      await app.checkout.mockCreditAnalysis(500)
      await app.checkout.startPurchaseFromHome(/Configure Agora/i)
      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()
      await app.checkout.expectResult(/Pedido Reprovado/i)
    })

    test('deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada igual que 50%', async ({ app }) => {
      const customer = {
        name: 'Gabriel',
        lastname: 'silva',
        email: 'diana@themiscira.com',
        document: '11144477735',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '20000',
      }

      await deleteOrderCheckout(customer.email, customer.document)

      await app.checkout.mockCreditAnalysis(450)
      await app.checkout.startPurchaseFromHome(/Configure Agora/i)
      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()
      await app.checkout.expectResult(/Pedido Aprovado/i)
    })

    test('deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada maior que 50%', async ({ app }) => {
      const customer = {
        name: 'Fernandinho',
        lastname: 'silva',
        email: 'fernandihno@themiscira.com',
        document: '34037363003',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '30000',
      }

      await deleteOrderCheckout(customer.email, customer.document)

      await app.checkout.mockCreditAnalysis(300)
      await app.checkout.startPurchaseFromHome(/Configure Agora/i)
      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()
      await app.checkout.expectResult(/Pedido Aprovado/i)
    })
  })
})
