
Excelente escolha! Fazer um projeto sobre algo que você realmente gosta (carros e preparação) muda completamente a experiência. Você vai ter muito mais motivação para programar e o resultado final costuma ser infinitamente superior.

Já que você curte **preparação (tuning/upgrades)** além da manutenção básica, nós podemos enriquecer esse CRUD. Em vez de ser apenas "troquei o óleo", o sistema pode ser um **"Diário de Projeto Automotivo"** (Project Car Logbook).

Aqui está a estrutura perfeita para você gabaritar essa primeira entrega (Backend) focando nesse tema:

### O Recurso Principal (CRUD): `RegistroAutomotivo`

Este recurso vai armazenar qualquer intervenção feita no carro, seja consertar algo que quebrou, fazer revisão ou instalar um upgrade de performance (turbina, remap, suspensão, etc).

#### Sugestão de Campos para o seu Model (Mongoose):

* `veiculo`: String (Ex: "Golf GTI 2018" ou a Placa).
* `titulo_servico`: String (Ex: "Instalação de Downpipe", "Troca de Óleo Motul").
* `categoria`: Enum (Opções: `'Manutencao_Preventiva'`, `'Manutencao_Corretiva'`, `'Preparacao_Upgrade'`).
* `quilometragem_atual`: Number (Ex: 45000).
* `data_servico`: Date.
* `custo_total`: Number.
* `oficina_responsavel`: String (Opcional).
* `ganho_potencia_estimado_cv`: Number (Opcional - Usado apenas para "Preparação").
* `proxima_revisao_km`: Number (Opcional - Usado para "Manutenção").

---

### 🧪 Regras de Negócio (O Ouro para os seus Testes no Jest/Vitest)

Os professores avaliam testes automatizados vendo se você pensou nas regras de negócio. Aqui estão regras perfeitas para você implementar no Controller/Service e testar:

1. **Regra da Categoria:** Se a requisição chegar com a categoria `'Preparacao_Upgrade'`, o sistema deve zerar (ou ignorar) o campo `proxima_revisao_km`. Mas se for `'Manutencao_Preventiva'`, o backend pode calcular automaticamente a `proxima_revisao_km` somando 10.000 km à quilometragem atual (caso o usuário não envie esse dado).
2. **Validação de KM:** Impedir o cadastro de um registro se a `quilometragem_atual` for um número negativo (Deve retornar Status `400 Bad Request`).
3. **A Máquina do Tempo:** A `data_servico` não pode ser uma data no futuro. Você não pode registrar hoje uma troca de turbina que vai acontecer mês que vem. (Retorna `400 Bad Request`).
4. **Custo Lógico:** O `custo_total` não pode ser negativo.

*No seu arquivo de testes (`registro.test.ts`), você criará cenários exatamente para isso: "Deve retornar erro 400 ao tentar salvar km negativa", "Deve salvar com sucesso um upgrade e registrar o ganho de cavalaria", etc.*

---

### 🖥️ Visão de Frontend (Para te animar para a Entrega 2)

Na segunda parte do semestre, você vai poder criar um painel (dashboard) muito legal:

* **Modo Dark** com uma interface bem "garagem/oficina" ou estilo painel de injeção programável (FuelTech/Hondata).
* Um **Gráfico de Linha** mostrando os gastos do carro ao longo dos meses.
* Um **Card de Performance** somando todos os `ganho_potencia_estimado_cv` dos seus upgrades para mostrar quantos cavalos o seu "Project Car" ganhou desde que você comprou.
* Uma **Timeline** (linha do tempo) vertical detalhando a história do carro.

---

### 📝 Checklist para o seu Backend em Node + TypeScript:

Para garantir a nota máxima com base no seu enunciado, seu plano de ataque deve ser:

1. **Setup Inicial:** Iniciar o projeto com `npm init`, instalar Express, TypeScript, Mongoose e Jest. Configurar o `tsconfig.json`.
2. **Docker:** Criar um arquivo `docker-compose.yml` que sobe apenas uma imagem do MongoDB (com um volume mapeado para não perder os dados dos carros quando o container reiniciar).
3. **CRUD:** Criar as rotas (POST, GET, GET por ID, PUT, DELETE) para o `RegistroAutomotivo`.
4. **Swagger:** Instalar o `swagger-ui-express`. Criar a documentação das rotas. Lembre-se de documentar que o campo `categoria` só aceita as 3 opções específicas.
5. **Testes:** Escrever os testes batendo nas rotas com o pacote `supertest` para validar as regras que listei acima.

O que achou dessa adaptação puxando pro lado da preparação? Dá pra fazer um sistema de respeito e totalmente dentro das regras do trabalho!

Essa é **a junção perfeita**. Você acabou de transformar um CRUD simples em uma aplicação de nicho extremamente útil (e comercializável). Qualquer dono de carro de projeto, de frota pequena ou entusiasta pagaria por um "Hub" organizado que consolidasse o histórico do carro, as notas fiscais, garantias e os custos totais.

Para fazer isso no seu backend em **Node.js, Express e MongoDB**, vamos precisar de algumas adaptações técnicas bem interessantes que vão elevar muito o nível do seu trabalho.

Aqui está como estruturar essa "Super API" de Gestão Automotiva:

### 1. O Novo Modelo de Dados (Mongoose)

Vamos expandir o schema para abraçar as garantias, descrições longas e as fotos das Ordens de Serviço (OS) e Notas Fiscais (NF).

* `titulo`: String (Ex: "Turbina ZR .50 e Coletor").
* `categoria`: Enum (`'Manutencao'`, `'Preparacao'`, `'Estetica'`).
* `descricao_detalhada`: String (Texto longo explicando o que foi feito).
* `custo_pecas`: Number.
* `custo_mao_de_obra`: Number.
* `data_servico`: Date.
* `meses_garantia`: Number (Ex: 3, 6, 12. Se for 0, não tem garantia).
* `fotos_urls`: Array de Strings (Ex: `["/uploads/os-123.jpg", "/uploads/nf-123.pdf"]`).

### 2. Como lidar com as Fotos/Notas Fiscais no Backend?

Salvar imagens direto no banco de dados (MongoDB) deixa o sistema pesado. O padrão de mercado que os professores adoram ver é o seguinte:

* Você vai usar uma biblioteca chamada **Multer** no Express.
* O front envia o arquivo da foto da OS/Nota Fiscal. O Multer salva esse arquivo fisicamente em uma pasta no seu projeto (ex: `./uploads`).
* No MongoDB, você salva apenas o **caminho (URL)** de onde a foto está guardada.
* *Atenção ao Docker:* No seu `docker-compose.yml`, você pode criar um volume específico para a pasta de `uploads`, assim, se o container reiniciar, as fotos das notas fiscais não são apagadas!

### 3. O "Hub Financeiro e de Garantias" (Endpoints Especiais)

Além do CRUD básico (Criar, Listar, Atualizar, Deletar), você vai criar dois endpoints extras que vão ser o coração do seu projeto:

**A) Rota de Resumo Financeiro (`GET /api/carros/:placa/estatisticas`)**
Em vez de trazer todos os registros, essa rota usa o MongoDB (através do método `aggregate` ou somando no próprio código) para retornar um cálculo:

```json
{
  "total_gasto": 15400.00,
  "gasto_com_preparacao": 12000.00,
  "gasto_com_manutencao": 3400.00,
  "pecas_na_garantia_ativas": 3
}

```

**B) Rota de Alertas de Garantia (`GET /api/carros/:placa/garantias`)**
Uma rota que lista apenas as peças que ainda estão na garantia. O backend pega a `data_servico`, soma os `meses_garantia` e compara com a data de hoje.

### 4. 🧪 Regras de Negócio para brilhar nos Testes (Jest/Vitest)

Aqui estão os cenários de teste automatizado perfeitos para essa nova estrutura:

* **Teste de Soma Financeira:** "Ao cadastrar um serviço com custo de peças 500 e mão de obra 300, a rota de estatísticas deve somar e refletir o total de 800".
* **Teste de Validade da Garantia (A Máquina do Tempo no Jest):** "Se um serviço foi feito há 4 meses e tinha 3 meses de garantia, o backend deve retornar `status_garantia: 'Expirada'` ao listar o item".
* **Teste de Garantia Ativa:** "Se o serviço foi feito ontem e tem 12 meses de garantia, o status deve ser `'Ativa'`".

* **Teste de Upload (Avançado):** "Deve retornar erro 400 se o usuário tentar fazer upload de um arquivo que não seja `.jpg`, `.png` ou `.pdf` para a nota fiscal".

### 5. Documentação no Swagger

No Swagger, além do JSON tradicional, você vai poder documentar o endpoint de criação como `multipart/form-data` (que é o formato usado para enviar arquivos + texto na mesma requisição). Isso mostra domínio de APIs avançadas.

---

**Resumo da Ópera:**
Ao juntar essas ideias, você entrega exatamente o que o professor pediu (CRUD completo em Node/TS, Mongoose, Docker, Swagger e Testes), mas sai de um projeto amador para um **SaaS automotivo completo**. Na próxima entrega (Frontend), a tela principal do carro pode ser um dashboard mostrando o valor total investido, as fotos das notas fiscais em formato de galeria, e tags verdes piscando nas peças que ainda estão na garantia da oficina!




enunciado: 

Nesta primeira entrega, você deverá desenvolver uma API em Node.js com Express, utilizando TypeScript. O tema do sistema é livre: gerenciamento de tarefas, livros, eventos, reservas ou outro domínio de sua escolha. Escolha um problema com escopo viável, pois o mesmo projeto será utilizado na segunda entrega.

O objetivo é entregar um backend funcional, com persistência em banco de dados, documentação e testes automatizados.

Requisitos obrigatórios
CRUD completo
Implemente as operações de cadastrar, listar, consultar por identificador, atualizar e excluir registros do recurso principal do sistema. Defina os campos necessários e valide os dados recebidos.
Conexão com banco de dados
Utilize MongoDB com Mongoose para armazenar os registros. As operações do CRUD devem acessar o banco, preservando os dados após reiniciar a aplicação.
Docker
Utilize Docker para executar o MongoDB. Entregue a configuração utilizada, incluindo volume para persistência dos dados e instruções para iniciar o ambiente.
Documentação com Swagger
Documente as rotas do CRUD e de login, informando parâmetros, dados de entrada, respostas e possíveis erros. A documentação deve permitir testar os endpoints.
Testes automatizados
Utilize Jest ou Vitest para verificar comportamentos relevantes do backend. Inclua cenários de sucesso e de erro, contemplando regras do CRUD e a validação do login. Testar manualmente pelo Swagger complementa, mas não substitui, os testes automatizados.
O que entregar
Entregue o código-fonte do backend com codigo limpo e organizado, a configuração do Docker, os testes e um arquivo README.md contendo:

descrição do sistema e do recurso escolhido para o CRUD;
tecnologias utilizadas;
instruções para configurar e executar o projeto;
variáveis de ambiente necessárias, acompanhadas de um .env.example sem credenciais reais;
endereço de acesso ao Swagger;
comando para executar os testes;