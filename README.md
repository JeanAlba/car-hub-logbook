# car-hub API

Backend do **car-hub**, um diário de bordo automotivo (project car / manutenção) para registrar intervenções realizadas em veículos, acompanhar custos e controlar prazos de garantia.

Trabalho prático da disciplina de Tópicos Especiais em Programação II (1ª entrega).

---

## Recursos e Escopo

- **Recurso Principal (CRUD completo):** `ServiceRecord` (`/service-records`) — registros de intervenção nos veículos (`MAINTENANCE`, `REPAIR`, `MODIFICATION`, `OTHER`), com data, custo, quilometragem e cálculo automático de expiração de garantia (`warrantyMonths` -> `warrantyExpiresAt`).
- **Recursos de Apoio (CRUD completo):**
  - `User` (`/users`, `/login`) — cadastro com hash de senha (`bcryptjs`) e autenticação simples sem token.
  - `Car` (`/cars`) — veículos associados ao usuário, com validação de placa única por usuário e exclusão em cascata dos registros de serviço.
- **Métricas e Resumo:** `GET /cars/:id/summary` — total gasto no carro, contagem de serviços, data do último serviço e gastos agrupados por categoria.
- **Documentação Interativa:** Swagger UI com OpenAPI 3.0 em `/docs`.

---

## Tecnologias

- **Linguagem & Runtime:** Node.js + TypeScript 5
- **Framework Web:** Express 5
- **Banco de Dados:** MongoDB 7 com Mongoose 9
- **Segurança:** bcryptjs para hash de senhas
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
- `npm run build`: Compila o código TypeScript para JavaScript na pasta `dist/`.
- `npm start`: Executa o código compilado em produção.
- `npm test`: Executa a suíte de testes automatizados com Jest.
- `npm run test:watch`: Executa os testes em modo interativo/observador.
- `npm run test:coverage`: Gera o relatório de cobertura de código.
- `npm run lint`: Analisa o código com ESLint.
- `npm run lint:fix`: Corrige problemas de lint automaticamente.
- `npm run format`: Formata os arquivos com Prettier.
- `npm run format:check`: Verifica se o código atende às regras de formatação.
