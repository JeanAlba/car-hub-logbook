import axios, { AxiosError } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
})

const API_MESSAGES: Record<string, string> = {
  'Invalid credentials': 'E-mail ou senha incorretos.',
  'Email already registered': 'Este e-mail já está cadastrado.',
  'Plate already registered for this user': 'Você já cadastrou um carro com essa placa.',
  'Car not found': 'Carro não encontrado.',
  'Service record not found': 'Serviço não encontrado.',
  'Invalid user data': 'Confira os dados informados.',
  'Invalid login data': 'Informe e-mail e senha.',
  'Invalid car data': 'Confira os dados do carro.',
  'Invalid service record data': 'Confira os dados do serviço.',
  'Invalid identifier': 'Identificador inválido.',
  Unauthorized: 'Sua sessão expirou. Entre novamente.',
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return 'Não foi possível falar com o servidor.'
    }
    const message = (error.response.data as { message?: string } | undefined)?.message
    if (message && API_MESSAGES[message]) {
      return API_MESSAGES[message]
    }
  }
  return 'Algo deu errado. Tente novamente.'
}

type UnauthorizedHandler = () => void

let onUnauthorized: UnauthorizedHandler = () => {}

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler
}

const SESSION_ENDPOINTS = ['/login', '/me', '/logout']

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      error instanceof AxiosError &&
      error.response?.status === 401 &&
      !SESSION_ENDPOINTS.includes(error.config?.url ?? '')
    ) {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)
