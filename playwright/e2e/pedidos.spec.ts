import { test, expect } from '@playwright/test';

test('deve consultar um pedido aprovado', async ({ page }) => {
  await page.goto('http://localhost:5173/');  

  // Checkpoint 
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
  //a[text()='Consultar Pedido']
  //a[href='/lookup'] - selector usa no inspector do navegador
  await page.getByRole('link', { name: 'Consultar Pedido' }).click();
  // Checkpoint
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido');

//Act
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-J8FJRX');
   // await page.locator('//label[text()="Número do Pedido"]').fill('VLO-J8FJRX');  
  //await page.getByTestId('search-order-button').click();
  await page.getByRole('button', { name: 'Buscar Pedido' }).click();
 // await page.locator('//button[text()="Buscar Pedido"]').click();

//Assert
 // await expect(page.getByTestId('order-result-id')).toBeVisible({timeout: 10000});//deixar o toBeVisible para ter certeza que o elemento está visível
 // await expect(page.getByTestId('order-result-id')).toContainText('VLO-J8FJRX');
 await expect(page.getByText('VLO-J8FJRX')).toBeVisible({ timeout: 6000 });
  
  //await expect(page.getByTestId('order-result-status')).toBeVisible();
  //await expect(page.getByTestId('order-result-status')).toContainText('APROVADO');
  await expect(page.getByText('APROVADO')).toBeVisible();

  
  
});