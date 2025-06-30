export interface User {
  id: string;
  roles: string[];
  [key: string]: any;
}

export interface CaslMixinOptions {
  action: string;
  resource: string;
}
