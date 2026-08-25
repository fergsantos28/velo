import { test, expect } from '../support/fixtures';
import { deleteOrderCheckout } from '../support/databse/orderRepository';

test.describe('Checkout - validações', () => {


    test.describe('Validações de campos obrigatórios', () => {

        let alerts: any

        test.beforeEach(async ({ page, app }) => {
            await page.goto('/order')
            await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()

            alerts = app.checkout.elements.alerts
        })


        test('deve validar obrigatoriedade de todos os campos em branco', async ({ page, app }) => {

            // Act
            await app.checkout.submit();

            // Assert
            await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres');
            await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres');
            await expect(alerts.email).toHaveText('Email inválido');
            await expect(alerts.phone).toHaveText('Telefone inválido');
            await expect(alerts.document).toHaveText('CPF inválido');
            await expect(alerts.store).toHaveText('Selecione uma loja');
            await expect(alerts.terms).toHaveText('Aceite os termos')
        });

        test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ page, app }) => {

            const nameAlert = page.getByTestId('error-name');
            const surnameAlert = page.getByTestId('error-lastname');

            const customer = {
                name: 'A',
                lastname: 'B',
                email: 'teste@teste.com',
                document: '00000014141',
                phone: '(11) 99999-9999'
            }

            // Arrange
            await app.checkout.fillCustomerlData(customer);
            await app.checkout.selectStore('Velô Paulista')
            await app.checkout.acceptTerms()

            // Act
            await app.checkout.submit()

            // Assert
            await expect(nameAlert).toHaveText('Nome deve ter pelo menos 2 caracteres');
            await expect(surnameAlert).toHaveText('Sobrenome deve ter pelo menos 2 caracteres');
        });

        test('deve exibir erro para e-mail com formato inválido', async ({ page, app }) => {
            const emailAlert = page.getByTestId('error-email');


            // Arrange
            const customer = {
                name: 'Fernando',
                lastname: 'Teste',
                email: 'test@.com',
                document: '00000014141',
                phone: '(11) 99999-9999'
            }

            // Arrange
            await app.checkout.fillCustomerlData(customer);
            await app.checkout.selectStore('Velô Paulista');
            await app.checkout.acceptTerms();

            // Act
            await app.checkout.submit();

            // Assert
            await expect(emailAlert).toHaveText('Email inválido');
        });

        test('deve exibir erro para CPF inválido', async ({ page, app }) => {
            const cpfAlert = page.getByTestId('error-document');

            // Arrange
            const customer = {
                name: 'Fernando',
                lastname: 'Teste',
                email: 'teste@teste.com',
                document: '000000199999',
                phone: '(11) 99999-9999'
            }

            // Arrange
            await app.checkout.fillCustomerlData(customer);
            await app.checkout.selectStore('Velô Paulista');
            await app.checkout.acceptTerms();

            // Act
            await app.checkout.submit();

            // Assert
            await expect(cpfAlert).toHaveText('CPF inválido');
        });

        test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ page, app }) => {
            const termsAlert = page.getByTestId('error-terms');

            // Arrange
            const customer = {
                name: 'Fernando',
                lastname: 'Teste',
                email: 'teste@teste.com',
                document: '00000014141',
                phone: '(11) 99999-9999'
            }

            // Arrange
            await app.checkout.fillCustomerlData(customer);
            await app.checkout.selectStore('Velô Paulista');

            await expect(app.checkout.elements.terms).not.toBeChecked();

            // Act
            await app.checkout.submit();

            // Assert
            await expect(termsAlert).toHaveText('Aceite os termos');
        });
    });


    test.describe('Pagamento e Confirmação', () => {

        test('deve criar um pedido com sucesso para pagamento à vista', async ({ page, app }) => {
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

            // 1. Inicia na página inicial e navega para o configurador
            await page.goto('/');
            await page.getByRole('link', { name: /Configure o Seu/i }).first().click();

            // 2. Configuração (mantém a opção padrão e avança)
            await app.configurator.expectPrice('R$ 40.000,00');
            await app.configurator.finishConfigurator();

            // 3. Checkout
            await app.checkout.expectLoaded();
            await app.checkout.fillCustomerlData(customer);
            await app.checkout.selectStore('Velô Paulista');
            await app.checkout.selectPaymentMethod('À Vista');
            await app.checkout.expectSummaryTotal('R$ 40.000,00');
            await app.checkout.acceptTerms();

            // Finaliza o pedido
            await app.checkout.submit();

            // 4. Validação de sucesso
            await expect(page).toHaveURL(/\/success/);
            await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible();


        })

        test('Deve aprovar automaticamente o financiamento quando o score do CPF for maior que 700.', async ({ page, app }) => {
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


            await page.route('**/functions/v1/credit-analysis', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'Done',
                        score: 710,
                    }),
                });
            });


            // 1. Inicia na página inicial e navega para o configurador
            await page.goto('/');
            await page.getByRole('link', { name: /Configure o Seu/i }).first().click();

            // 2. Configuração (mantém a opção padrão e avança)
            await app.configurator.expectPrice(customer.totalPrice);
            await app.configurator.finishConfigurator();

            // 3. Checkout
            await app.checkout.expectLoaded();
            await app.checkout.fillCustomerlData(customer);
            await app.checkout.selectStore(customer.store);
            await app.checkout.selectPaymentMethod(customer.paymentMethod);
            // await app.checkout.expectSummaryTotal(customer.totalPrice);
            await app.checkout.acceptTerms();

            // Finaliza o pedido
            await app.checkout.submit();

            // 4. Validação de sucesso
            await expect(page).toHaveURL(/\/success/);
            await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible();
        })

        test('CT07 - deve deixar o pedido em análise quando o score do CPF estiver entre 501 e 700', async ({ page, app }) => {
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

            await page.route('**/functions/v1/credit-analysis', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'Done',
                        score: 600,
                    }),
                })
            })

            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            // Act
            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            // Assert
            await expect(page).toHaveURL(/\/success/)
            await expect(page.getByRole('heading', { name: 'Pedido em Análise!' })).toBeVisible()
        })

        test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento sem entrada', async ({ page, app }) => {

            const customer = {
                name: 'Rogerio',
                lastname: 'Garcia',
                email: 'rogerinho@dailyplanet.com',
                document: '52998224725',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderCheckout(customer.email, customer.document)

            await page.route('**/functions/v1/credit-analysis', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'Done',
                        score: 500
                    }),
                })
            })

            // Arrange
            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            // Act
            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            // Assert
            await expect(page).toHaveURL(/\/success/)
            await expect(page.getByRole('heading', { name: /Crédito Reprovado/i })).toBeVisible()
        })

        test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada menor que 50%', async ({ page, app }) => {

            const customer = {
                name: 'Diana',
                lastname: 'Prince',
                email: 'diana@themiscira.com',
                document: '11144477735',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00',
                downPayment: '10000'
            }

            await deleteOrderCheckout(customer.email, customer.document)

            await page.route('**/functions/v1/credit-analysis', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'Done',
                        score: 500,
                    }),
                })
            })

            // Arrange
            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice(customer.totalPrice)
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()

            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            // Act
            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.fillDownPayment(customer.downPayment)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            // Assert
            await expect(page).toHaveURL(/\/success/)
            await expect(page.getByRole('heading', { name: /Crédito Reprovado/i })).toBeVisible()
        })


    })
})
