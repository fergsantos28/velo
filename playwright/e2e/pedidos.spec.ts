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
    const order = {
      number: 'VLO-J8FJRX',
      status: 'APROVADO',
      color: 'Glacier Blue',
      wheels: 'sport Wheels',
      customer: {
        name: 'dad dadadd',
        email: 'daad@gmail.com',
      },
      payment: 'À Vista'
    }  
    
  //Act
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number);
     // await page.locator('//label[text()="Número do Pedido"]').fill(order);   
    await page.getByRole('button', { name: 'Buscar Pedido' }).click();
   // await page.locator('//button[text()="Buscar Pedido"]').click();  
  //Assert
  /*  await expect(page.getByText(order.number)).toBeVisible({ timeout: 6000 });   
   await expect(page.getByText('APROVADO')).toBeVisible();  */
            
    //Act
      await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number);          
      await page.getByRole('button', { name: 'Buscar Pedido' }).click();
   


     await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
          - img
          - paragraph: Pedido
          - paragraph: ${order.number}
          - img
          - text: ${order.status}
          - img "Velô Sprint"
          - paragraph: Modelo
          - paragraph: Velô Sprint
          - paragraph: Cor
          - paragraph: ${order.color}
          - paragraph: Interior
          - paragraph: cream
          - paragraph: Rodas
          - paragraph: ${order.wheels} 
          - heading "Dados do Cliente" [level=4]
          - paragraph: Nome
          - paragraph: ${order.customer.name} 
          - paragraph: Email
          - paragraph: ${order.customer.email}
          - paragraph: Loja de Retirada
          - paragraph
          - paragraph: Data do Pedido
          - paragraph: /\\d+\\/\\d+\\/\\d+/
          - heading "Pagamento" [level=4]
          - paragraph: ${order.payment}
          - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `);
       
    });

  
   test('deve consultar um pedido reprovado', async ({ page }) => {
    
      const order = {
        number: 'VLO-UEDZBY',
        status: 'REPROVADO',
        color: 'Glacier Blue',
        wheels: 'aero Wheels',
        customer: {
          name: 'rodolfo silva',
          email: 'tete@gmail.com',
        },
        payment: 'À Vista'
      }  
              
      //Act
        await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number);          
        await page.getByRole('button', { name: 'Buscar Pedido' }).click();
     


       await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order.number}
            - img
            - text: ${order.status}
            - img "Velô Sprint"
            - paragraph: Modelo
            - paragraph: Velô Sprint
            - paragraph: Cor
            - paragraph: ${order.color}
            - paragraph: Interior
            - paragraph: cream
            - paragraph: Rodas
            - paragraph: ${order.wheels} 
            - heading "Dados do Cliente" [level=4]
            - paragraph: Nome
            - paragraph: ${order.customer.name} 
            - paragraph: Email
            - paragraph: ${order.customer.email}
            - paragraph: Loja de Retirada
            - paragraph
            - paragraph: Data do Pedido
            - paragraph: /\\d+\\/\\d+\\/\\d+/
            - heading "Pagamento" [level=4]
            - paragraph: ${order.payment}
            - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
        `); 
        
       
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

});


