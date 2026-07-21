import { test, expect } from '@playwright/test';
import {generateOrderCode} from '../support/helpers'


test.describe('Consulta de Pedido', () => {

  test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:5173/');      
     await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');

     await page.getByRole('link', { name: 'Consultar Pedido' }).click();
     await expect(page.getByRole('heading')).toContainText('Consultar Pedido');
  })
  

  test('deve consultar um pedido aprovado', async ({ page }) => {
    
    const order = 'VLO-J8FJRX'  
          
  //Act
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order);
     // await page.locator('//label[text()="Número do Pedido"]').fill(order);   
    await page.getByRole('button', { name: 'Buscar Pedido' }).click();
   // await page.locator('//button[text()="Buscar Pedido"]').click();
  
  //Assert
   await expect(page.getByText(order)).toBeVisible({ timeout: 6000 });   
   await expect(page.getByText('APROVADO')).toBeVisible(); 
    });
  
  
  test('deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {
  
    const order = generateOrderCode() 
    
  
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order);  
    await page.getByRole('button', { name: 'Buscar Pedido' }).click();
  
   /* const title = page.getByRole('heading', {name: 'Pedido não encontrado'}) 
   await expect(title).toBeVisible()  
   const message = page.locator('p', {hasText:'Verifique o número do pedido e tente novamente' })
   await expect(message).toBeVisible() */
  
    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
      `);
  });

})


