export interface UserData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserCredentials extends User {
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}
