# Velô Sprint

> Configurador e fluxo de compra de um veículo elétrico, com análise de crédito, acompanhamento de pedidos e pipeline de entrega contínua com ambientes isolados.

## Acesse a Aplicação

- [Produção](https://velo-htw3nbcuo-fergsantos28s-projects.vercel.app/)
- [Preview](https://velo-41hhra21x-fergsantos28s-projects.vercel.app/)

> O ambiente de Preview é destinado a validações automatizadas e pode conter dados de teste.

---

## Sobre o Projeto

Uma SPA (Single Page Application) que simula a jornada de compra do **Velô Sprint**: da personalização do veículo à confirmação do pedido.

**Especificações do veículo:** 450 km de autonomia | 0–100 km/h em 3,2 s | 500 cv

### Funcionalidades

- Personalização de cor, rodas e opcionais
- Cálculo de preço em tempo real
- Checkout com pagamento à vista ou financiamento
- Análise de crédito por Edge Function
- Consulta do status de pedidos
- Validações de formulário e feedbacks de interface

---



## Stack Tecnológica


| Categoria         | Tecnologias                                         |
| ----------------- | --------------------------------------------------- |
| **Frontend**      | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Estado**        | Zustand (global), React Hook Form (formulários)     |
| **Validação**     | Zod                                                 |
| **Data Fetching** | TanStack Query                                      |
| **Backend**       | Supabase (PostgreSQL + Edge Functions)              |


---



## Executar Localmente

```bash
# Instalar dependências
yarn install

# Rodar em desenvolvimento
yarn dev
```

Acesse: `http://localhost:5173`

---



## Arquitetura e Qualidade

```text
React + Vite → Supabase (PostgreSQL) → Edge Function de análise de crédito
                    ↑
           Playwright E2E / CI-CD na Vercel
```



### Entrega Contínua

O pipeline executa o seguinte fluxo:

1. Testes unitários
2. Build e deploy Preview na Vercel
3. Testes E2E do Playwright contra a URL Preview
4. Novo build e deploy de Production somente após a aprovação dos E2E

Os ambientes utilizam projetos Supabase separados. Assim, os testes criam e removem dados somente no banco Preview, sem afetar a produção.

---



## Estrutura Principal

```
src/
├── pages/           # Páginas da aplicação
├── components/      # Componentes React
│   ├── configurator/   # Configurador do carro
│   ├── landing/        # Landing page
│   └── ui/             # Componentes shadcn/ui
├── store/           # Estado global (Zustand)
├── hooks/           # Hooks customizados
└── integrations/    # Cliente Supabase
```

---



## Rotas


| Rota         | Descrição               |
| ------------ | ----------------------- |
| `/`          | Landing page            |
| `/configure` | Configurador do veículo |
| `/order`     | Checkout/Pedido         |
| `/success`   | Confirmação do pedido   |
| `/lookup`    | Consulta de pedidos     |


---



## Modelo de Preços

- **Preço base:** R$ 40.000
- **Rodas Sport:** +R$ 2.000
- **Precision Park:** +R$ 5.500
- **Flux Capacitor:** +R$ 5.000
- **Financiamento:** 12x com juros de 2% a.m.

---



## Banco de Dados

**Tabela** `orders` — campos principais:

- `order_number` — Formato: VLO-XXXXXX
- `color`, `wheel_type`, `optionals` — Configuração
- `customer_name`, `customer_email`, `customer_cpf` — Cliente
- `payment_method`, `total_price` — Pagamento
- `status` — pending, approved, rejected, analysis

---



## Análise de Crédito


| Score   | Resultado  |
| ------- | ---------- |
| > 700   | Aprovado   |
| 501-700 | Em análise |
| ≤ 500   | Reprovado  |


*Se entrada ≥ 50% do total, aprova mesmo com score < 700*

---



## Fluxo Principal

```
Landing → Configurador → Checkout → Análise de Crédito → Confirmação
```

---



## Scripts

```bash
yarn dev         # Desenvolvimento
yarn build       # Build de produção
yarn test        # Testes unitários
yarn lint        # Verificar código
```

