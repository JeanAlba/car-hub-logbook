# Prompt para o agente: backend car-hub (MVP, 1ª entrega)

## 1. Contexto e objetivo

Você vai desenvolver o backend do **car-hub**, um logbook de carros: o usuário registra os **serviços** feitos no carro (manutenções, reparos, preparações) e acompanha quanto gastou. Este é um trabalho de faculdade, e a **1ª entrega** exige uma API em Node.js + Express + TypeScript com MongoDB. O mesmo projeto será usado na 2ª entrega.

**Escopo (MVP):**

- Cadastro de usuário e login simples (sem token).
- **Carros** do usuário (CRUD completo).
- **Registros de serviço** de cada carro (CRUD completo), com **garantia opcional em meses**: o backend recebe os meses e devolve a data de expiração calculada. Este é o **recurso principal** do sistema.
- Um **resumo de gastos e métricas por carro** (`GET /cars/:id/summary`), com o total gasto no carro.
- Docker para o MongoDB, Swagger, testes automatizados e README.

**Fora do escopo (NÃO implementar):** itens/peças do serviço (ficam para a 2ª entrega), lembretes e notificações de garantia, JWT/token ou qualquer sessão, perfis e permissões, refresh token, recuperação de senha, upload, e-mail, frontend, deploy, CI, paginação e filtros avançados.

**Decisão consciente:** sem token, o cliente informa o `userId` nas requisições. Isso é aceito para o MVP, e a autenticação por token poderá ser avaliada na 2ª entrega.

**Projeto de referência:** a pasta `./referencia/` (somente leitura; se ela não existir nesse caminho, pergunte onde está) é um backend funcional feito em aula. Use-o como modelo de **arquitetura, configuração e estilo**. Não copie o domínio dele (funcionários, viagens, fornecedores etc.).

**Estado atual:** o repositório de trabalho já tem uma estrutura copiada da referência, com os arquivos de domínio removidos. Você **não deve recriar do zero**: primeiro inspecione o que existe (Etapa 0).

## 2. Regras de trabalho

1. Execute **uma etapa por vez**, na ordem. Ao terminar, rode as verificações da etapa, **pare** e envie um relatório curto com: (a) arquivos criados e alterados, (b) resultado dos comandos de verificação, (c) decisões que você tomou e dúvidas. Só avance quando eu autorizar.
2. Não instale dependências fora das listadas na Etapa 2 sem pedir antes.
3. Não crie funcionalidades, rotas ou campos fora desta especificação.
4. Ao fim de cada etapa (exceto a Etapa 0, que só reporta), devem passar: `npm run lint`, `npm run format:check`, `npm run build` e `npm test` (quando já houver testes). Se algo falhar, corrija antes de reportar.
5. Faça um commit git ao final de cada etapa (exceto a Etapa 0), com mensagem curta no imperativo, em inglês (ex.: `add car CRUD`).
6. Nunca commite `.env`, `node_modules`, `dist` ou `coverage`. Nunca coloque credenciais reais em arquivos versionados.
7. **Ordem de prioridade em caso de conflito:** a especificação (seção 7) vence; depois, as convenções da referência (seções 5 e 5.1); só então a sua decisão. Se algo continuar ambíguo, **pergunte** em vez de assumir.
8. Sem `any`, sem comentários óbvios, sem código morto ou interfaces não usadas.

## 3. Idioma e nomenclatura

- **Todo o código em inglês**, em camelCase: identificadores, nomes de arquivos, pastas, rotas, campos JSON, variáveis de ambiente, mensagens de erro, descrições do Swagger e nomes dos testes.
- Arquivos de exemplo: `carRoutes.ts`, `carController.ts`, `carService.ts`, `carRepository.ts`, `carModel.ts`, `validateCarData.ts`.
- Renomeie o que veio da referência em português: `servidor.ts` → `server.ts`, `configuracoes/` → `config/`, `PORTA` → `PORT`, `/documentacao` → `/docs`, e assim por diante. Atualize os scripts do `package.json` conforme.
- Cuidado com a ambiguidade de "service": a pasta `services/` é a camada de regra de negócio, e o recurso do domínio se chama **`ServiceRecord`** (arquivos `serviceRecordService.ts`, `serviceRecordRepository.ts` etc., rota `/service-records`).
- **README.md** em português (é para a faculdade). Seus relatórios e respostas para mim também são em português; código, commits e mensagens da API são em inglês.

## 4. Stack

- Node.js, Express 5, TypeScript 5 (CommonJS: **não** adicionar `"type": "module"`), Mongoose 9.
- Testes: Jest 30 com `@swc/jest` (mesma configuração da referência) e Supertest.
- Qualidade: ESLint + Prettier, com as configurações da referência.
- Desenvolvimento com `tsx`. MongoDB via Docker Compose.

Para dependências que já existem na referência, use as mesmas versões do `package.json` dela. Para as novas, a versão estável mais recente.

## 5. Convenções da referência (SEGUIR)

- **Camadas:** `routes` → `controllers` → `services` → `repositories` → `models`, mais `types/`, `middlewares/` e `config/`.
- **Tipos:** `CarData` (campos de entrada) e `Car extends CarData` com `id: string`.
- **Models:** `versionKey: false` e `toJSON` transformando `_id` em `id`.
- **`app.ts` exporta o `app`** (testável com Supertest). `server.ts` conecta ao banco e sobe o servidor.
- **Validação** por middlewares manuais (`validateXData`, `validateXId`). ID inválido responde 400 com `Invalid identifier` (regex de 24 caracteres hexadecimais).
- **Erros** no formato `{ "message": "..." }`. Códigos: 201 criação, 200 leitura/atualização, 204 exclusão, 400, 404, 409, 500. O texto exato de cada mensagem está na seção 7.5.
- **Controllers finos:** só traduzem HTTP; a regra fica no service. Express 5 já trata erros de funções `async`.
- **Campos desconhecidos no body são ignorados:** só os campos da especificação são persistidos. O service monta o objeto de criação e de atualização apenas com os campos permitidos (assim `userId`, `carId` e `warrantyExpiresAt` enviados em um `PUT` não alteram nada).
- **Testes:** em `tests/services/` e `tests/middlewares/`, com `jest.mock` no repository e objetos falsos de `req`/`res` nos middlewares.
- **Scripts:** `dev`, `build`, `start`, `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `test:coverage`.

## 5.1 Padrão de requisições do CRUD (idêntico à referência)

Todas as ações dos recursos (`/cars`, `/service-records`) devem usar **exatamente** o mesmo padrão HTTP da referência, sem variações. Em especial: **atualização é `PUT` com o recurso completo no body, nunca `PATCH`**; o ID vai **sempre na URL**, nunca no body; os dados vão em **JSON no body**.

| Ação | Método e rota | Body | Sucesso | Se não existir |
|---|---|---|---|---|
| Criar | `POST /recurso` | JSON com os dados | **201** + recurso criado (com `id`) | |
| Listar | `GET /recurso` | | **200** + array (vazio se não houver itens) | |
| Buscar por ID | `GET /recurso/:id` | | **200** + recurso | **404** (mensagens na seção 7.5) |
| Atualizar | `PUT /recurso/:id` | JSON completo (mesmos campos obrigatórios do `POST`) | **200** + recurso atualizado | **404** |
| Excluir | `DELETE /recurso/:id` | | **204**, sem corpo | **404** |

**Como isso se traduz no código (mesmos padrões da referência):**

- **Routes** (um `Router` por recurso, montado no `router.ts` com `routes.use('/cars', carRoutes)`):

  ```ts
  carRoutes.post('/', validateCarData, controller.create);
  carRoutes.get('/', controller.list);
  carRoutes.get('/:id', validateCarId, controller.getById);
  carRoutes.put('/:id', validateCarId, validateCarData, controller.update);
  carRoutes.delete('/:id', validateCarId, controller.remove);
  ```

- **Nomes das funções** (equivalentes em inglês das funções da referência): controller e repository usam `create`, `list`, `getById` (no repository, `findById`), `update` e `remove`. O service usa nomes com o recurso, como `createCar`, `listCars`, `getCarById`, `updateCar` e `deleteCar`.
- **Controller:** `create` responde `201` com o objeto criado; `list` responde `200` com o array; `getById` e `update` respondem `404` quando o service devolve `null`; `remove` responde `404` quando o service devolve `false` e `204` sem corpo quando exclui.
- **Repository:** usa `Model.create`, `Model.find`, `Model.findById`, `Model.findByIdAndUpdate(id, data, { new: true, runValidators: true })` e `Model.findByIdAndDelete`, devolvendo `toJSON()` ou `null`/`boolean`, como na referência.
- **Login:** `POST /login`, declarado diretamente no `router.ts`, como na referência.

**Únicos desvios permitidos em relação ao padrão (já previstos na especificação):**

- `GET /cars` exige `?userId=` e `GET /service-records` exige `?carId=`. Sem o parâmetro, respondem 400.
- `PUT` não altera `userId` (carro) nem `carId` (serviço), e o body do `PUT` não precisa repeti-los.
- `GET /cars/:id/summary` (rota de consulta extra) e `GET /health`.

## 6. Problemas da referência (NÃO REPLICAR)

- Senha em texto puro e login com `findOne({ email, senha })`. Aqui: **hash com bcryptjs** (é pouco código).
- Respostas que devolvem o campo de senha. Aqui: **nenhuma resposta HTTP pode conter senha ou hash**.
- `any` no controller de login, interface `DadosLogin` não usada e arquivos fora do Prettier.
- Falta de `docker-compose.yml`, `.env.example` e `README.md`. Aqui, são obrigatórios.
- Não há testes de login nem de rotas. Aqui, são obrigatórios.
- `.env` e `dist/` dentro do projeto entregue. Aqui, ficam fora do repositório.
- Conflitos (e-mail ou placa repetidos) não são tratados. Aqui, respondem **409**.

## 7. Especificação do MVP

### 7.1 User

| Campo | Regra |
|---|---|
| `name` | texto obrigatório, não vazio |
| `email` | texto obrigatório, formato de e-mail válido, **único** (normalizado em minúsculas) |
| `password` | texto obrigatório, mínimo 6 caracteres, salva apenas como hash |

A resposta de um usuário traz apenas `id`, `name` e `email`. O model usa `select: false` na senha (ou equivalente), e o repository expõe `findByEmail`, que devolve também o hash **apenas para uso interno do service** no login.

### 7.2 Car

| Campo | Regra |
|---|---|
| `userId` | obrigatório no `POST`; id válido (24 hexadecimais, senão 400) de um usuário existente (senão 404); **não pode ser alterado** no `PUT` (se enviado, é ignorado) |
| `brand` | texto obrigatório |
| `model` | texto obrigatório |
| `year` | inteiro obrigatório, entre 1900 e (ano atual + 1) |
| `plate` | texto obrigatório; normalizar para maiúsculas, sem espaços e sem hífen; 7 caracteres alfanuméricos; **única por usuário** |
| `mileage` | número obrigatório, ≥ 0 (quilometragem atual) |
| `nickname` | texto opcional |

- Excluir um carro **exclui também os registros de serviço dele** (sem registros órfãos).
- `PUT` substitui os campos editáveis: exige os mesmos campos obrigatórios do `POST`, exceto `userId`. Campo opcional omitido no `PUT` (`nickname`) é **removido** do documento (use `$unset` ou equivalente), não mantido.

### 7.3 ServiceRecord (recurso principal)

| Campo | Regra |
|---|---|
| `carId` | obrigatório no `POST`; id válido (24 hexadecimais, senão 400) de um carro existente (senão 404); **não pode ser alterado** no `PUT` (se enviado, é ignorado) |
| `type` | obrigatório, um de `MAINTENANCE`, `REPAIR`, `MODIFICATION`, `OTHER` (`MODIFICATION` = preparações/upgrades) |
| `description` | texto obrigatório |
| `cost` | número obrigatório, ≥ 0 |
| `date` | obrigatório, string `YYYY-MM-DD` que seja uma data real do calendário (rejeitar `2026-02-30`), salva como `Date` em UTC |
| `mileage` | número obrigatório, ≥ 0 (km do carro na data do serviço) |
| `warrantyMonths` | inteiro opcional, entre 1 e 120; ausente significa sem garantia |
| `warrantyExpiresAt` | **calculado pelo backend, nunca aceito no body**; presente na resposta apenas quando há `warrantyMonths` |

**Regras da garantia:**

- `warrantyExpiresAt` = `date` + `warrantyMonths` meses, calculado no **service** (função pequena e pura, fácil de testar), em UTC, para evitar deslocamento de fuso.
- Se o dia não existir no mês de destino, usar o **último dia do mês** (ex.: 31/01 + 1 mês = 28/02, ou 29/02 em ano bissexto).
- Calcular e salvar no `POST` e **recalcular no `PUT`** (que substitui o recurso: se `warrantyMonths` for omitido, a garantia é removida, inclusive `warrantyExpiresAt`, com `$unset` ou equivalente).
- Nas respostas, `date` e `warrantyExpiresAt` são strings `YYYY-MM-DD` (transformar no `toJSON` do model).
- Não criar endpoints, filtros ou lembretes de garantia nesta entrega.

### 7.4 Endpoints

| Método e rota | Sucesso | Erros |
|---|---|---|
| `POST /users` | 201 usuário | 400, 409 |
| `POST /login` (body: `email`, `password`) | 200 usuário | 400, 401 |
| `POST /cars` | 201 carro | 400, 404 (usuário), 409 |
| `GET /cars?userId=` (`userId` obrigatório) | 200 lista | 400 |
| `GET /cars/:id` | 200 carro | 400, 404 |
| `PUT /cars/:id` | 200 carro | 400, 404, 409 |
| `DELETE /cars/:id` | 204 | 400, 404 |
| `POST /service-records` | 201 registro | 400, 404 (carro) |
| `GET /service-records?carId=` (`carId` obrigatório) | 200 lista, mais recente primeiro | 400 |
| `GET /service-records/:id` | 200 registro | 400, 404 |
| `PUT /service-records/:id` | 200 registro | 400, 404 |
| `DELETE /service-records/:id` | 204 | 400, 404 |
| `GET /cars/:id/summary` | 200 resumo | 400, 404 |
| `GET /health` | 200 `{ "status": "ok" }` | |

Notas:

- Login com e-mail inexistente **ou** senha errada responde **401** com a mesma mensagem (`Invalid credentials`), sem revelar qual falhou.
- Em `GET /cars` e `GET /service-records`, o parâmetro de consulta ausente ou malformado responde **400** (`Invalid identifier`). Se o `userId`/`carId` for válido mas não existir, a resposta é **200 com lista vazia** (sem checar existência).
- `GET /service-records` ordena por `date` decrescente.

**Resumo do carro:** `{ totalSpent, recordsCount, lastServiceDate, spentByType: { MAINTENANCE, REPAIR, MODIFICATION, OTHER } }`, calculado no service a partir dos registros do carro. Sem registros: `totalSpent` e `recordsCount` iguais a 0, `lastServiceDate` nulo e todos os tipos em 0. `totalSpent` é a soma dos `cost`, arredondada a 2 casas decimais; `spentByType` soma o custo por `type`; `lastServiceDate` é a maior `date`, no formato `YYYY-MM-DD`.

**Variáveis de ambiente:** `PORT`, `MONGODB_URL`.

### 7.5 Mensagens de erro (texto exato, usar nos testes e no Swagger)

Formato sempre `{ "message": "<texto>" }`.

| Situação | Status | `message` |
|---|---|---|
| Body de usuário inválido | 400 | `Invalid user data` |
| Body de login inválido | 400 | `Invalid login data` |
| Body de carro inválido | 400 | `Invalid car data` |
| Body de serviço inválido | 400 | `Invalid service record data` |
| ID na URL, `userId` ou `carId` malformado ou ausente | 400 | `Invalid identifier` |
| JSON malformado | 400 | `Invalid request` |
| Corpo grande demais | 413 | `Request body too large` |
| Credenciais erradas | 401 | `Invalid credentials` |
| Usuário não encontrado | 404 | `User not found` |
| Carro não encontrado | 404 | `Car not found` |
| Serviço não encontrado | 404 | `Service record not found` |
| Rota inexistente | 404 | `Route not found` |
| E-mail já cadastrado | 409 | `Email already registered` |
| Placa já cadastrada para o usuário | 409 | `Plate already registered for this user` |
| Erro inesperado | 500 | `Internal server error` |

## 8. Etapas

### Etapa 0: Auditoria (não altere nada)

- Liste a árvore de pastas do repositório e compare com `./referencia/`.
- Reporte: o que já existe (configs, `app`, `server`, `banco`, scripts, dependências, `.env`, `.gitignore`), o que falta, o que ainda está em português e o que sobrou de domínio antigo.
- Rode `npm install`, `npm run lint`, `npm run build` e `npm test` e reporte o resultado.

**Pronto quando:** eu receber o relatório. Nenhum arquivo é modificado nesta etapa.

### Etapa 1: Docker e variáveis de ambiente

- `docker-compose.yml` apenas com o MongoDB (`mongo:7`), `container_name: car-hub-mongo`, porta 27017, **volume nomeado** em `/data/db` e `restart: unless-stopped`.
- `.env.example` com `PORT=3000` e `MONGODB_URL=mongodb://localhost:27017/car-hub`, e um `.env` local copiado dele.
- `.gitignore` (`node_modules`, `dist`, `coverage`, `.env`).

**Pronto quando:** `docker compose up -d` sobe o MongoDB e `docker compose ps` o mostra em execução.

### Etapa 2: Ajuste do esqueleto

Com base na auditoria, complete **apenas o que falta** ou está errado:

- Renomeações para inglês (seção 3) e scripts do `package.json` atualizados.
- Dependências: adicionar `bcryptjs`, `supertest` e `@types/supertest`; mover `@types/swagger-ui-express` para desenvolvimento; instalar qualquer dependência da referência que esteja faltando.
- `src/errors/appError.ts`: classe com `status` e `message`. O handler de erros do `app.ts` responde `{ message }` com o status dela, mantendo o tratamento de JSON malformado (400), corpo grande (413) e erro inesperado (500), com as mensagens da seção 7.5.
- `GET /health` no router.

**Pronto quando:** `npm run dev` imprime a conexão com o MongoDB, `GET /health` responde 200, e lint, format e build passam.

### Etapa 3: User e login

- `userModel` (índice único em `email`, `toJSON` sem a senha), `userRepository`, `userService`, `userController`, `validateUserData` e `validateLoginData`, `userRoutes` e a rota `/login`.
- Cadastro: normaliza o e-mail, recusa e-mail repetido com `AppError` 409 e salva o hash da senha (custo 10). Além de checar antes, trate também o erro de chave duplicada do MongoDB (código 11000) como 409.
- Login: compara a senha com `bcryptjs.compare` e devolve o usuário sem senha.
- Testes: cadastro (hash diferente da senha original, e-mail duplicado), login com sucesso, senha errada, e-mail inexistente, e validação de entrada de cadastro e login.

**Pronto quando:** é possível cadastrar e logar via cliente HTTP, nenhuma resposta contém senha, e os testes da etapa passam.

### Etapa 4: Car (CRUD)

- Todas as camadas, `validateCarData` e `validateCarId`, e as rotas de `/cars`.
- O service confere que o usuário existe, trata placa duplicada (409, inclusive o erro 11000 do MongoDB) e, ao excluir o carro, remove seus registros de serviço (a função do repository de registros é criada aqui, mínima).
- Testes: service (cada operação, usuário inexistente, placa duplicada, exclusão em cascata, `userId` ignorado no `PUT`, `nickname` removido quando omitido no `PUT`) e middleware (cada campo inválido, placa normalizada, ID malformado, `userId` ausente ou malformado na listagem e no `POST`).

**Pronto quando:** o CRUD completo funciona, os dados **persistem após `docker compose restart` e reinício da API**, e os testes passam.

### Etapa 5: ServiceRecord (CRUD)

- Todas as camadas, `validateServiceRecordData` e `validateServiceRecordId`, e as rotas de `/service-records`.
- O service confere que o carro existe e calcula a garantia (seção 7.3). A listagem exige `carId` e ordena por data decrescente.
- Testes: service (cada operação, carro inexistente, `carId` imutável no `PUT`; garantia: com meses calcula a data, sem meses não devolve expiração, ajuste de fim de mês, bissexto, recálculo no `PUT` ao mudar `date` ou `warrantyMonths`, remoção da garantia ao omitir os meses) e middleware (cada campo inválido, `type` fora do enum, data inválida, custo negativo, `warrantyMonths` zero, negativo, decimal ou acima de 120, `warrantyExpiresAt` enviado no body é ignorado, `date` inexistente no calendário, `carId` ausente ou malformado na listagem e no `POST`, ID malformado).

**Pronto quando:** o CRUD funciona e os dados persistem após reiniciar a API.

### Etapa 6: Resumo de gastos e métricas do carro

- `GET /cars/:id/summary` conforme a seção 7.4, com `validateCarId` e a lógica de cálculo no service (agregação dos registros do carro, por exemplo com `aggregate` no repository ou cálculo em memória, o que for mais simples e legível).
- Testes: carro sem registros, com vários registros e tipos, `lastServiceDate` correto, carro inexistente (404) e ID malformado (400).

**Pronto quando:** o resumo bate com os registros cadastrados e os testes passam.

### Etapa 7: Swagger

- Documentar em `/docs` **todas** as rotas das etapas 3 a 6 (e `/health`), com parâmetros, corpo de entrada, respostas de sucesso, **todos os erros possíveis** e exemplos.
- Dividir a configuração em arquivos pequenos (por exemplo, `schemas`, `paths` e `index` em `config/swagger/`), em vez de um único arquivo gigante.

**Pronto quando:** pelo Swagger é possível cadastrar, logar, criar carro, criar e listar serviços, consultar o resumo do carro e excluir, tudo sem ferramenta externa.

### Etapa 8: Testes de integração das rotas

- Supertest sobre o `app`, **sem banco real** (repositories mockados com `jest.mock`).
- `POST /login`: 200, 400, 401. `POST /users`: 201, 400, 409.
- `GET /cars/:id/summary`: 200, 404 e 400.
- `/cars` e `/service-records`: fluxo feliz do CRUD, 404 para ID inexistente, 400 para ID malformado e para body inválido, 404 quando `userId`/`carId` não existem, 409 para placa duplicada.
- Incluir `src/controllers` e `src/routes` no `collectCoverageFrom` e revisar a cobertura.

**Pronto quando:** `npm test` passa do zero, **sem o Docker rodando**.

### Etapa 9: README e revisão final

- `README.md` (em português) com: descrição do sistema e do recurso escolhido para o CRUD (**ServiceRecord**, com Car e User de apoio), tecnologias, instruções de configuração e execução (incluindo `docker compose up -d`), variáveis de ambiente (referência ao `.env.example`), endereço do Swagger (`http://localhost:3000/docs`) e comando dos testes (`npm test`).
- Rodar o checklist abaixo e corrigir o que faltar.

**Pronto quando:** outra pessoa consegue clonar, seguir só o README e ter a API rodando e testada.

## 9. Checklist final (enunciado)

- [ ] CRUD completo do recurso principal (ServiceRecord), com validação dos dados recebidos
- [ ] MongoDB + Mongoose, dados persistem após reiniciar a aplicação
- [ ] `docker-compose.yml` com volume e instruções no README
- [ ] Swagger com CRUD e login, parâmetros, entradas, respostas e erros, permitindo testar
- [ ] Testes com Jest cobrindo sucesso e erro do CRUD e a validação do login
- [ ] `.env.example` sem credenciais reais; `.env` fora do repositório
- [ ] Código limpo e organizado; lint, format, build e testes passando
- [ ] README completo com todos os itens exigidos