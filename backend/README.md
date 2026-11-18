# car-hub API

Backend do **car-hub**, um diário de bordo automotivo (project car / manutenção) para registrar intervenções realizadas em veículos, acompanhar custos e controlar prazos de garantia.

Trabalho prático da disciplina de Tópicos Especiais em Programação II (1ª entrega).

---

## Recursos e Escopo

- **Recurso Principal (CRUD completo):** `ServiceRecord` (`/service-records`) — registros de intervenção nos veículos (`MAINTENANCE`, `REPAIR`, `MODIFICATION`, `OTHER`), com data, custo, quilometragem e cálculo automático de expiração de garantia (`warrantyMonths` -> `warrantyExpiresAt`). Lançar ou editar um serviço com quilometragem maior atualiza o odômetro do carro automaticamente.
- **Recursos de Apoio (CRUD completo):**
  - `User` (`/users`, `/login`, `/logout`, `/me`) — cadastro com hash de senha (`bcryptjs`) e autenticação por JWT em cookie `httpOnly`.
  - `Car` (`/cars`) — veículos associados ao usuário, com validação de placa única por usuário e exclusão em cascata dos registros de serviço.
- **Métricas e Resumo:**
  - `GET /cars/:id/summary` — total gasto no carro, contagem de serviços, data do último serviço, custo por km (`costPerKm`), gastos por categoria e gastos dos últimos 12 meses (`spentByMonth`).
  - `GET /dashboard` — visão consolidada da garagem (totais, últimos 30 dias, gastos por veículo, alertas de garantia e últimos 5 serviços).
- **Documentação Interativa:** Swagger UI com OpenAPI 3.0 em `/docs`.

### Autenticação

`POST /login` valida as credenciais e grava o cookie `token` (JWT, 7 dias, `httpOnly`, `SameSite=Lax`). Todas as rotas de `/cars`, `/service-records`, `/dashboard` e `/me` exigem esse cookie (`401 Unauthorized` sem ele). O dono vem do token: carros e serviços de outros usuários respondem `404`. `POST /logout` limpa o cookie.

---

## Tecnologias

- **Linguagem & Runtime:** Node.js + TypeScript 5
- **Framework Web:** Express 5
- **Banco de Dados:** MongoDB 7 com Mongoose 9
- **Segurança:** bcryptjs para hash de senhas, jsonwebtoken (JWT em cookie httpOnly), cookie-parser e cors
- **Documentação:** Swagger UI Express
- **Testes:** Jest 30 com `@swc/jest` e Supertest
- **Padronização & Qualidade:** ESLint 9 + Prettier

---

## Variáveis de Ambiente

As configurações são lidas a partir do arquivo `.env` na raiz do projeto. Um modelo de referência está disponível em `.env.example`:

| Variável      | Descrição                    | Exemplo                             |
| ------------- | ---------------------------- | ----------------------------------- |
| `PORT`        | Porta HTTP da aplicação      | `3000`                              |
| `MONGODB_URL` | URI de conexão com o MongoDB | `mongodb://localhost:27017/car-hub` |
| `JWT_SECRET`  | Segredo usado para assinar o JWT | `change-me-to-a-long-random-string` |
| `CORS_ORIGIN` | Origem do frontend liberada no CORS | `http://localhost:5173` |

Para inicializar a configuração local:

```bash
cp .env.example .env
```

---

## Como Executar

### 1. Pré-requisitos

- Node.js (versão 20 ou superior recomendada)
- Docker e Docker Compose

### 2. Instalação das dependências

```bash
npm install
```

### 3. Iniciar o Banco de Dados (MongoDB)

O banco roda em container isolado via Docker com volume persistente:

```bash
docker compose up -d
```

### 4. Executar a API em Desenvolvimento

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`.

### 5. Documentação da API (Swagger)

Acesse a documentação interativa para visualizar esquemas e testar endpoints diretamente pelo navegador:

```
http://localhost:3000/docs
```

---

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor em modo watch via `tsx`.
- `npm run seed`: Cria o usuário de demonstração (`demo@car-hub.dev` / `demo1234`) com 2 carros e 12 serviços (com o backend rodando).
- `npm run build`: Compila o código TypeScript para JavaScript na pasta `dist/`.
- `npm start`: Executa o código compilado em produção.
- `npm test`: Executa a suíte de testes automatizados com Jest.
- `npm run test:watch`: Executa os testes em modo interativo/observador.
- `npm run test:coverage`: Gera o relatório de cobertura de código.
- `npm run lint`: Analisa o código com ESLint.
- `npm run lint:fix`: Corrige problemas de lint automaticamente.
- `npm run format`: Formata os arquivos com Prettier.
- `npm run format:check`: Verifica se o código atende às regras de formatação.
