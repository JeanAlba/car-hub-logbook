// const dadosUsuario = {
//   type: 'object',
//   required: ['nome', 'email', 'senha', 'perfil', 'ativo'],
//   properties: {
//     nome: { type: 'string', example: 'Mariana Costa' },
//     email: { type: 'string', example: 'mariana.costa@empresa.com' },
//     senha: { type: 'string', example: 'senhaInicial123' },
//     perfil: {
//       type: 'string',
//       enum: ['FUNCIONARIO', 'FINANCEIRO'],
//       example: 'FINANCEIRO',
//     },
//     ativo: { type: 'boolean', example: true },
//   },
// };

// const usuario = {
//   ...dadosUsuario,
//   required: ['id', ...dadosUsuario.required],
//   properties: {
//     id: { type: 'string', example: '66c47aa12ea87f8123456701' },
//     ...dadosUsuario.properties,
//   },
// };

// const parametroId = {
//   name: 'id',
//   in: 'path',
//   required: true,
//   schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
// };

// const dadosFuncionario = {
//   type: 'object',
//   required: ['nome', 'cpf', 'email', 'cargo', 'departamento', 'ativo'],
//   properties: {
//     nome: { type: 'string', example: 'Carlos Souza' },
//     cpf: { type: 'string', example: '123.456.789-00' },
//     email: { type: 'string', example: 'carlos.souza@empresa.com' },
//     cargo: { type: 'string', example: 'Consultor comercial' },
//     departamento: { type: 'string', example: 'Comercial' },
//     ativo: { type: 'boolean', example: true },
//   },
// };
// const funcionario = {
//   ...dadosFuncionario,
//   required: ['id', ...dadosFuncionario.required],
//   properties: {
//     id: { type: 'string', example: '66c47aa12ea87f8123456702' },
//     ...dadosFuncionario.properties,
//   },
// };
// const propriedadesBasicasPrestacao = {
//   descricao: { type: 'string', example: 'Hospedagem durante viagem' },
//   valor: { type: 'number', example: 480 },
//   data: { type: 'string', example: '2026-08-19' },
//   funcionario: { type: 'string', example: 'João da Silva' },
//   categoria: { type: 'string', example: 'Hospedagem' },
//   formaPagamento: { type: 'string', example: 'Cartão corporativo' },
// };
// const dadosCriacaoPrestacao = {
//   type: 'object',
//   required: ['descricao', 'valor', 'data', 'funcionario', 'categoria', 'formaPagamento'],
//   properties: propriedadesBasicasPrestacao,
// };
// const dadosPrestacao = {
//   ...dadosCriacaoPrestacao,
//   required: [...dadosCriacaoPrestacao.required, 'status'],
//   properties: {
//     ...propriedadesBasicasPrestacao,
//     status: {
//       type: 'string',
//       enum: ['PENDENTE', 'APROVADA', 'REJEITADA'],
//       example: 'PENDENTE',
//     },
//   },
// };
// const prestacao = {
//   ...dadosPrestacao,
//   required: ['id', ...dadosPrestacao.required],
//   properties: {
//     id: { type: 'string', example: '66c47aa12ea87f8123456703' },
//     ...dadosPrestacao.properties,
//   },
// };
// const dadosCategoria = {
//   type: 'object',
//   required: ['nome', 'descricao', 'ativo'],
//   properties: {
//     nome: { type: 'string', example: 'Alimentação' },
//     descricao: {
//       type: 'string',
//       example: 'Refeições durante atividades profissionais',
//     },
//     ativo: { type: 'boolean', example: true },
//   },
// };
// const categoria = {
//   ...dadosCategoria,
//   required: ['id', ...dadosCategoria.required],
//   properties: {
//     id: { type: 'string', example: '66c47aa12ea87f8123456704' },
//     ...dadosCategoria.properties,
//   },
// };
// const dadosForma = {
//   type: 'object',
//   required: ['nome', 'descricao', 'ativo'],
//   properties: {
//     nome: { type: 'string', example: 'Cartão corporativo' },
//     descricao: { type: 'string', example: 'Cartão fornecido pela empresa' },
//     ativo: { type: 'boolean', example: true },
//   },
// };
// const forma = {
//   ...dadosForma,
//   required: ['id', ...dadosForma.required],
//   properties: { id: { type: 'string' }, ...dadosForma.properties },
// };
// const dadosFornecedor = {
//   type: 'object',
//   required: ['nome', 'cnpj', 'email', 'telefone', 'ativo'],
//   properties: {
//     nome: { type: 'string', example: 'Hotel Central Ltda.' },
//     cnpj: { type: 'string', example: '12.345.678/0001-90' },
//     email: { type: 'string', example: 'contato@hotelcentral.com.br' },
//     telefone: { type: 'string', example: '(54) 3333-4455' },
//     ativo: { type: 'boolean', example: true },
//   },
// };
// const fornecedor = {
//   ...dadosFornecedor,
//   required: ['id', ...dadosFornecedor.required],
//   properties: { id: { type: 'string' }, ...dadosFornecedor.properties },
// };
// const dadosViagem = {
//   type: 'object',
//   required: ['destino', 'dataInicio', 'dataFim', 'motivo', 'funcionario', 'status'],
//   properties: {
//     destino: { type: 'string', example: 'Porto Alegre - RS' },
//     dataInicio: { type: 'string', example: '2026-09-10' },
//     dataFim: { type: 'string', example: '2026-09-12' },
//     motivo: { type: 'string', example: 'Visita ao cliente' },
//     funcionario: { type: 'string', example: 'Ana Ribeiro' },
//     status: {
//       type: 'string',
//       enum: ['PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA'],
//       example: 'PLANEJADA',
//     },
//   },
// };
// const viagem = {
//   ...dadosViagem,
//   required: ['id', ...dadosViagem.required],
//   properties: {
//     id: { type: 'string', example: '66c47aa12ea87f8123456707' },
//     ...dadosViagem.properties,
//   },
// };
// const dadosEstruturaOrganizacional = {
//   type: 'object',
//   required: ['departamento', 'cargo', 'responsavel', 'ativo'],
//   properties: {
//     departamento: { type: 'string', example: 'Tecnologia' },
//     cargo: { type: 'string', example: 'Desenvolvedor' },
//     responsavel: { type: 'string', example: 'Maria Oliveira' },
//     ativo: { type: 'boolean', example: true },
//   },
// };
// const estruturaOrganizacional = {
//   ...dadosEstruturaOrganizacional,
//   required: ['id', ...dadosEstruturaOrganizacional.required],
//   properties: {
//     id: { type: 'string', example: '66c47aa12ea87f8123456708' },
//     ...dadosEstruturaOrganizacional.properties,
//   },
// };

// export const documentacaoSwagger = {
//   openapi: '3.0.3',
//   info: { title: 'API de prestação de contas', version: '1.0.0' },
//   servers: [{ url: 'http://localhost:3000' }],
//   paths: {
//     '/usuarios': {
//       post: {
//         summary: 'Cadastra um usuário',
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosUsuario } },
//         },
//         responses: {
//           '201': {
//             description: 'Usuário cadastrado',
//             content: { 'application/json': { schema: usuario } },
//           },
//           '400': { description: 'Dados inválidos' },
//         },
//       },
//       get: {
//         summary: 'Lista os usuários',
//         responses: {
//           '200': {
//             description: 'Lista retornada com sucesso',
//             content: {
//               'application/json': { schema: { type: 'array', items: usuario } },
//             },
//           },
//         },
//       },
//     },
//     '/usuarios/{id}': {
//       get: {
//         summary: 'Consulta um usuário pelo identificador',
//         parameters: [parametroId],
//         responses: {
//           '200': {
//             description: 'Usuário encontrado',
//             content: { 'application/json': { schema: usuario } },
//           },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Usuário não encontrado' },
//         },
//       },
//       put: {
//         summary: 'Atualiza um usuário',
//         parameters: [parametroId],
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosUsuario } },
//         },
//         responses: {
//           '200': {
//             description: 'Usuário atualizado',
//             content: { 'application/json': { schema: usuario } },
//           },
//           '400': { description: 'Identificador ou dados inválidos' },
//           '404': { description: 'Usuário não encontrado' },
//         },
//       },
//       delete: {
//         summary: 'Exclui um usuário',
//         parameters: [parametroId],
//         responses: {
//           '204': { description: 'Usuário excluído' },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Usuário não encontrado' },
//         },
//       },
//     },
//     '/funcionarios': {
//       post: {
//         summary: 'Cadastra um funcionário',
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosFuncionario } },
//         },
//         responses: {
//           '201': {
//             description: 'Funcionário cadastrado',
//             content: { 'application/json': { schema: funcionario } },
//           },
//           '400': { description: 'Dados inválidos' },
//         },
//       },
//       get: {
//         summary: 'Lista os funcionários',
//         responses: {
//           '200': {
//             description: 'Lista retornada com sucesso',
//             content: {
//               'application/json': {
//                 schema: { type: 'array', items: funcionario },
//               },
//             },
//           },
//         },
//       },
//     },
//     '/funcionarios/{id}': {
//       get: {
//         summary: 'Consulta um funcionário pelo identificador',
//         parameters: [parametroId],
//         responses: {
//           '200': {
//             description: 'Funcionário encontrado',
//             content: { 'application/json': { schema: funcionario } },
//           },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Funcionário não encontrado' },
//         },
//       },
//       put: {
//         summary: 'Atualiza um funcionário',
//         parameters: [parametroId],
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosFuncionario } },
//         },
//         responses: {
//           '200': {
//             description: 'Funcionário atualizado',
//             content: { 'application/json': { schema: funcionario } },
//           },
//           '400': { description: 'Identificador ou dados inválidos' },
//           '404': { description: 'Funcionário não encontrado' },
//         },
//       },
//       delete: {
//         summary: 'Exclui um funcionário',
//         parameters: [parametroId],
//         responses: {
//           '204': { description: 'Funcionário excluído' },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Funcionário não encontrado' },
//         },
//       },
//     },
//     '/prestacoes-contas': {
//       post: {
//         summary: 'Cadastra uma prestação de contas',
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosCriacaoPrestacao } },
//         },
//         responses: {
//           '201': {
//             description: 'Prestação cadastrada',
//             content: { 'application/json': { schema: prestacao } },
//           },
//           '400': { description: 'Dados inválidos' },
//         },
//       },
//       get: {
//         summary: 'Lista as prestações de contas',
//         responses: {
//           '200': {
//             description: 'Lista retornada com sucesso',
//             content: {
//               'application/json': {
//                 schema: { type: 'array', items: prestacao },
//               },
//             },
//           },
//         },
//       },
//     },
//     '/prestacoes-contas/{id}': {
//       get: {
//         summary: 'Consulta uma prestação pelo identificador',
//         parameters: [parametroId],
//         responses: {
//           '200': {
//             description: 'Prestação encontrada',
//             content: { 'application/json': { schema: prestacao } },
//           },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Prestação não encontrada' },
//         },
//       },
//       put: {
//         summary: 'Atualiza uma prestação de contas',
//         parameters: [parametroId],
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosPrestacao } },
//         },
//         responses: {
//           '200': {
//             description: 'Prestação atualizada',
//             content: { 'application/json': { schema: prestacao } },
//           },
//           '400': { description: 'Identificador ou dados inválidos' },
//           '404': { description: 'Prestação não encontrada' },
//         },
//       },
//       delete: {
//         summary: 'Exclui uma prestação de contas',
//         parameters: [parametroId],
//         responses: {
//           '204': { description: 'Prestação excluída' },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Prestação não encontrada' },
//         },
//       },
//     },
//     '/categorias-despesa': {
//       post: {
//         summary: 'Cadastra uma categoria de despesa',
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosCategoria } },
//         },
//         responses: {
//           '201': {
//             description: 'Categoria cadastrada',
//             content: { 'application/json': { schema: categoria } },
//           },
//           '400': { description: 'Dados inválidos' },
//         },
//       },
//       get: {
//         summary: 'Lista as categorias de despesa',
//         responses: {
//           '200': {
//             description: 'Lista retornada com sucesso',
//             content: {
//               'application/json': {
//                 schema: { type: 'array', items: categoria },
//               },
//             },
//           },
//         },
//       },
//     },
//     '/categorias-despesa/{id}': {
//       get: {
//         summary: 'Consulta uma categoria pelo identificador',
//         parameters: [parametroId],
//         responses: {
//           '200': {
//             description: 'Categoria encontrada',
//             content: { 'application/json': { schema: categoria } },
//           },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Categoria não encontrada' },
//         },
//       },
//       put: {
//         summary: 'Atualiza uma categoria de despesa',
//         parameters: [parametroId],
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosCategoria } },
//         },
//         responses: {
//           '200': {
//             description: 'Categoria atualizada',
//             content: { 'application/json': { schema: categoria } },
//           },
//           '400': { description: 'Identificador ou dados inválidos' },
//           '404': { description: 'Categoria não encontrada' },
//         },
//       },
//       delete: {
//         summary: 'Exclui uma categoria de despesa',
//         parameters: [parametroId],
//         responses: {
//           '204': { description: 'Categoria excluída' },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Categoria não encontrada' },
//         },
//       },
//     },
//     '/formas-pagamento': {
//       post: {
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosForma } },
//         },
//         responses: {
//           '201': {
//             description: 'Criada',
//             content: { 'application/json': { schema: forma } },
//           },
//           '400': { description: 'Dados inválidos' },
//         },
//       },
//       get: {
//         responses: {
//           '200': {
//             description: 'Lista',
//             content: {
//               'application/json': { schema: { type: 'array', items: forma } },
//             },
//           },
//         },
//       },
//     },
//     '/formas-pagamento/{id}': {
//       get: {
//         summary: 'Consulta uma forma de pagamento pelo identificador',
//         parameters: [parametroId],
//         responses: {
//           '200': {
//             description: 'Forma de pagamento encontrada',
//             content: { 'application/json': { schema: forma } },
//           },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Forma de pagamento não encontrada' },
//         },
//       },
//       put: {
//         summary: 'Atualiza uma forma de pagamento',
//         parameters: [parametroId],
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosForma } },
//         },
//         responses: {
//           '200': {
//             description: 'Forma de pagamento atualizada',
//             content: { 'application/json': { schema: forma } },
//           },
//           '400': { description: 'Identificador ou dados inválidos' },
//           '404': { description: 'Forma de pagamento não encontrada' },
//         },
//       },
//       delete: {
//         summary: 'Exclui uma forma de pagamento',
//         parameters: [parametroId],
//         responses: {
//           '204': { description: 'Forma de pagamento excluída' },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Forma de pagamento não encontrada' },
//         },
//       },
//     },
//     '/fornecedores': {
//       post: {
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosFornecedor } },
//         },
//         responses: {
//           '201': {
//             description: 'Criado',
//             content: { 'application/json': { schema: fornecedor } },
//           },
//           '400': { description: 'Dados inválidos' },
//         },
//       },
//       get: {
//         responses: {
//           '200': {
//             description: 'Lista',
//             content: {
//               'application/json': {
//                 schema: { type: 'array', items: fornecedor },
//               },
//             },
//           },
//         },
//       },
//     },
//     '/fornecedores/{id}': {
//       get: {
//         summary: 'Consulta um fornecedor pelo identificador',
//         parameters: [parametroId],
//         responses: {
//           '200': {
//             description: 'Fornecedor encontrado',
//             content: { 'application/json': { schema: fornecedor } },
//           },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Fornecedor não encontrado' },
//         },
//       },
//       put: {
//         summary: 'Atualiza um fornecedor',
//         parameters: [parametroId],
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosFornecedor } },
//         },
//         responses: {
//           '200': {
//             description: 'Fornecedor atualizado',
//             content: { 'application/json': { schema: fornecedor } },
//           },
//           '400': { description: 'Identificador ou dados inválidos' },
//           '404': { description: 'Fornecedor não encontrado' },
//         },
//       },
//       delete: {
//         summary: 'Exclui um fornecedor',
//         parameters: [parametroId],
//         responses: {
//           '204': { description: 'Fornecedor excluído' },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Fornecedor não encontrado' },
//         },
//       },
//     },
//     '/viagens': {
//       post: {
//         summary: 'Cadastra uma viagem',
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosViagem } },
//         },
//         responses: {
//           '201': {
//             description: 'Viagem cadastrada',
//             content: { 'application/json': { schema: viagem } },
//           },
//           '400': { description: 'Dados inválidos' },
//         },
//       },
//       get: {
//         summary: 'Lista as viagens',
//         responses: {
//           '200': {
//             description: 'Lista retornada com sucesso',
//             content: {
//               'application/json': { schema: { type: 'array', items: viagem } },
//             },
//           },
//         },
//       },
//     },
//     '/viagens/{id}': {
//       get: {
//         summary: 'Consulta uma viagem pelo identificador',
//         parameters: [parametroId],
//         responses: {
//           '200': {
//             description: 'Viagem encontrada',
//             content: { 'application/json': { schema: viagem } },
//           },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Viagem não encontrada' },
//         },
//       },
//       put: {
//         summary: 'Atualiza uma viagem',
//         parameters: [parametroId],
//         requestBody: {
//           required: true,
//           content: { 'application/json': { schema: dadosViagem } },
//         },
//         responses: {
//           '200': {
//             description: 'Viagem atualizada',
//             content: { 'application/json': { schema: viagem } },
//           },
//           '400': { description: 'Identificador ou dados inválidos' },
//           '404': { description: 'Viagem não encontrada' },
//         },
//       },
//       delete: {
//         summary: 'Exclui uma viagem',
//         parameters: [parametroId],
//         responses: {
//           '204': { description: 'Viagem excluída' },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Viagem não encontrada' },
//         },
//       },
//     },
//     '/estruturas-organizacionais': {
//       post: {
//         summary: 'Cadastra uma estrutura organizacional',
//         requestBody: {
//           required: true,
//           content: {
//             'application/json': { schema: dadosEstruturaOrganizacional },
//           },
//         },
//         responses: {
//           '201': {
//             description: 'Estrutura organizacional cadastrada',
//             content: {
//               'application/json': { schema: estruturaOrganizacional },
//             },
//           },
//           '400': { description: 'Dados inválidos' },
//         },
//       },
//       get: {
//         summary: 'Lista as estruturas organizacionais',
//         responses: {
//           '200': {
//             description: 'Lista retornada com sucesso',
//             content: {
//               'application/json': {
//                 schema: { type: 'array', items: estruturaOrganizacional },
//               },
//             },
//           },
//         },
//       },
//     },
//     '/estruturas-organizacionais/{id}': {
//       get: {
//         summary: 'Consulta uma estrutura organizacional pelo identificador',
//         parameters: [parametroId],
//         responses: {
//           '200': {
//             description: 'Estrutura organizacional encontrada',
//             content: {
//               'application/json': { schema: estruturaOrganizacional },
//             },
//           },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Estrutura organizacional não encontrada' },
//         },
//       },
//       put: {
//         summary: 'Atualiza uma estrutura organizacional',
//         parameters: [parametroId],
//         requestBody: {
//           required: true,
//           content: {
//             'application/json': { schema: dadosEstruturaOrganizacional },
//           },
//         },
//         responses: {
//           '200': {
//             description: 'Estrutura organizacional atualizada',
//             content: {
//               'application/json': { schema: estruturaOrganizacional },
//             },
//           },
//           '400': { description: 'Identificador ou dados inválidos' },
//           '404': { description: 'Estrutura organizacional não encontrada' },
//         },
//       },
//       delete: {
//         summary: 'Exclui uma estrutura organizacional',
//         parameters: [parametroId],
//         responses: {
//           '204': { description: 'Estrutura organizacional excluída' },
//           '400': { description: 'Identificador inválido' },
//           '404': { description: 'Estrutura organizacional não encontrada' },
//         },
//       },
//     },
//   },
// };
