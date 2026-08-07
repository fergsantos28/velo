import { test, expect } from '../support/fixtures';

test.describe('Checkout - validações', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/order');
        await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible();
    });


    test.describe('Validações de campos obrigatórios', () => {
        test('deve validar obrigatoriedade de todos os campos em branco', async ({ page, app }) => {
            const submit = page.getByRole('button', { name: 'Confirmar Pedido' });

            const nameAlert = page.locator('//label[normalize-space(.)="Nome"]/..//p');
            const surnameAlert = page.locator('//label[normalize-space(.)="Sobrenome"]/..//p');
            const emailAlert = page.locator('//label[normalize-space(.)="Email"]/..//p');
            const phoneAlert = page.locator('//label[normalize-space(.)="Telefone"]/..//p');
            const cpfAlert = page.locator('//label[normalize-space(.)="CPF"]/..//p');
            const storeAlert = page.locator('//label[normalize-space(.)="Loja para Retirada"]/..//p');
            const termsAlert = page.locator('//label[@for="terms"]/following-sibling::p');

            // Act
            await app.checkout.submit();

            // Assert
            await expect(nameAlert).toHaveText('Nome deve ter pelo menos 2 caracteres');
            await expect(surnameAlert).toHaveText('Sobrenome deve ter pelo menos 2 caracteres');
            await expect(emailAlert).toHaveText('Email inválido');
            await expect(phoneAlert).toHaveText('Telefone inválido');
            await expect(cpfAlert).toHaveText('CPF inválido');
            await expect(storeAlert).toHaveText('Selecione uma loja');
            await expect(termsAlert).toHaveText('Aceite os termos');
        });

        test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ page, app }) => {

            const nameAlert = page.locator('//label[normalize-space(.)="Nome"]/..//p');
            const surnameAlert = page.locator('//label[normalize-space(.)="Sobrenome"]/..//p');

            const customer = {
                name: 'A',
                lastname: 'B',
                email: 'teste@teste.com',
                document: '00000014141',
                phone: '(11) 99999-9999'
            }

            // Arrange
            await app.checkout.fillCustumerlData(customer);
            await app.checkout.selectStore('Velô Paulista')
            await app.checkout.acceptTerms()

            // Act
            await app.checkout.submit()

            // Assert
            await expect(nameAlert).toHaveText('Nome deve ter pelo menos 2 caracteres');
            await expect(surnameAlert).toHaveText('Sobrenome deve ter pelo menos 2 caracteres');
        });

        test('deve exibir erro para e-mail com formato inválido', async ({ page, app }) => {
            const emailAlert = page.locator('//label[normalize-space(.)="Email"]/..//p');


            // Arrange
            const customer = {
                name: 'Fernando',
                lastname: 'Teste',
                email: 'test@.com',
                document: '00000014141',
                phone: '(11) 99999-9999'
            }

            // Arrange
            await app.checkout.fillCustumerlData(customer);
            await app.checkout.selectStore('Velô Paulista');
            await app.checkout.acceptTerms();

            // Act
            await app.checkout.submit();

            // Assert
            await expect(emailAlert).toHaveText('Email inválido');
        });

        test('deve exibir erro para CPF inválido', async ({ page, app }) => {
            const cpfAlert = page.locator('//label[normalize-space(.)="CPF"]/..//p');

            // Arrange
            const customer = {
                name: 'Fernando',
                lastname: 'Teste',
                email: 'teste@teste.com',
                document: '000000199999',
                phone: '(11) 99999-9999'
            }

            // Arrange
            await app.checkout.fillCustumerlData(customer);
            await app.checkout.selectStore('Velô Paulista');
            await app.checkout.acceptTerms();

            // Act
            await app.checkout.submit();

            // Assert
            await expect(cpfAlert).toHaveText('CPF inválido');
        });

        test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ page, app }) => {
            const termsAlert = page.locator('//label[@for="terms"]/following-sibling::p');

            // Arrange
            const customer = {
                name: 'Fernando',
                lastname: 'Teste',
                email: 'teste@teste.com',
                document: '00000014141',
                phone: '(11) 99999-9999'
            }

            // Arrange
            await app.checkout.fillCustumerlData(customer);
            await app.checkout.selectStore('Velô Paulista');

            await expect(app.checkout.elements.terms).not.toBeChecked();

            // Act
            await app.checkout.submit();

            // Assert
            await expect(termsAlert).toHaveText('Aceite os termos');
        });

    });

});
