# Roteiro da apresentação (5 a 7 min)

## Antes de começar (2 min)

1. `cd backend && docker compose up -d`
2. `npm run dev` no `backend/` e no `frontend/` (dois terminais).
3. Se o banco estiver vazio: `npm run seed` no `backend/`.
4. Abra `http://localhost:5173` em uma janela anônima, para entrar sem sessão.
5. Deixe `http://localhost:3000/docs` aberto em outra aba.

## Sequência

| # | O que mostrar | O que dizer |
|---|---|---|
| 1 | Abrir `/carros` sem login | A rota é protegida e leva ao login. |
| 2 | Login errado | Mensagem de erro clara, vinda da API. |
| 3 | Criar conta nova e ver a garagem vazia | Estado vazio com instrução e cadastro que já entra logado. |
| 4 | Sair e entrar com `demo@car-hub.dev` / `demo1234` | A sessão é um cookie `httpOnly` (mostrar em F12, Application, Cookies). |
| 5 | Visão geral: gastos consolidados, alertas de garantia e últimos serviços | Dados agregados no `GET /dashboard` em tempo real. |
| 6 | Garagem: placa Mercosul e odômetro | Identidade visual (painel GM anos 90) e padrão consistente. |
| 7 | Criar um carro, editar e excluir | CRUD com diálogo, validação e toast. |
| 8 | Abrir o Golf GTI: resumo, custo/km, gastos por categoria e últimos 12 meses | Os números vêm de `/cars/:id/summary`. |
| 9 | Badges de garantia: vigente, vencendo e expirada | O backend calcula `warrantyExpiresAt`. |
| 10 | Criar um serviço com km maior e ver resumo + odômetro do carro atualizarem | O backend atualiza o odômetro do carro automaticamente e invalida o cache. |
| 11 | Editar o serviço, remover a garantia e excluir | `PUT` recalcula ou remove a garantia. |
| 12 | Filtro por categoria | Navegação rápida no diário. |
| 13 | Encolher a janela (F12, modo celular) | Layout responsivo. |
| 14 | Sair | O cookie é limpo e as rotas voltam a pedir login. |

## Se der tempo

- **Isolamento:** entrar com outro usuário e mostrar que ele não vê os carros do demo (e que abrir `/carros/<id>` do outro dá "Carro não encontrado").
- **Swagger:** fazer `POST /login` em `/docs` e testar `GET /dashboard` ou `GET /cars` sem sair da página.
- **Testes:** rodar `npm test` no `backend/` (200 testes, sem precisar do Docker).

## Escolhas para explicar

- **Cookie `httpOnly` com JWT**, para o token não ficar acessível ao JavaScript.
- **Proxy do Vite**, para o cookie ficar na mesma origem do frontend.
- **O dono vem do token:** o frontend nunca envia `userId`.
- **Poucas telas, todas funcionando**, como o enunciado pede.
- **Tema escuro com destaque âmbar**, definido por uma variável CSS (trocável para verde fósforo).

## Se algo falhar ao vivo

| Sintoma | Causa provável | Ação |
|---|---|---|
| Toda chamada dá "Não foi possível falar com o servidor" | Backend parado | Rodar `npm run dev` no `backend/`. |
| Backend não sobe | MongoDB parado ou falta `JWT_SECRET` | `docker compose up -d` e conferir o `.env`. |
| Cai no login após entrar | Sessão antiga ou cookie bloqueado | Usar janela anônima e entrar de novo. |
| Garagem do demo vazia | Seed não rodou | `npm run seed` no `backend/`. |
