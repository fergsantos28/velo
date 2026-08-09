import { test, expect } from '../support/fixtures';

test.describe('Checkout - validações', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/order');
        await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible();
    });


    test.describe('Validações de campos obrigatórios', () => {
        test('deve validar obrigatoriedade de todos os campos em branco', async ({ page, app }) => {
            const nameAlert = page.getByTestId('error-name')
            const surnameAlert = page.getByTestId('error-lastname');
            const emailAlert = page.getByTestId('error-email');
            const phoneAlert = page.getByTestId('error-phone');
            const cpfAlert = page.getByTestId('error-document');
            const storeAlert = page.getByTestId('error-store');
            const termsAlert = page.getByTestId('error-terms');

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

});
