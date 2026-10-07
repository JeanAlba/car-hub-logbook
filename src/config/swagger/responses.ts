const errorContent = (messages: string[]) => ({
  'application/json': {
    schema: { $ref: '#/components/schemas/Error' },
    examples: Object.fromEntries(messages.map((message) => [message, { value: { message } }])),
  },
});

export const error = (description: string, ...messages: string[]) => ({
  description,
  content: errorContent(messages),
});

export const body = (schema: string, description = 'Success') => ({
  description,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } },
});

export const requestBody = (schema: string, example: object) => ({
  required: true,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` }, example } },
});

export const badRequest = (...messages: string[]) =>
  error('Invalid input', ...messages, 'Invalid request');

export const tooLarge = error('Request body too large', 'Request body too large');

export const serverError = error('Unexpected error', 'Internal server error');

export const idParameter = (description: string) => ({
  name: 'id',
  in: 'path',
  required: true,
  description,
  schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$', example: '66c47aa12ea87f8123456702' },
});

export const queryParameter = (name: string, description: string) => ({
  name,
  in: 'query',
  required: true,
  description,
  schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$', example: '66c47aa12ea87f8123456701' },
});
