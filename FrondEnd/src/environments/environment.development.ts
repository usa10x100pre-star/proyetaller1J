export interface Environment {
  production: boolean;
  apiURL: string;
}

export const environment: Environment = {
  production: false,
  apiURL: 'http://localhost:9090'
};
