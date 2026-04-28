export interface Environment {
  production: boolean;
  baseUri: string;
  apiVersion: string;
  features: {
    enableLogging: boolean;
    enableAnalytics: boolean;
    enableSentry: boolean;
  };
  api: {
    timeout: number;
    retryAttempts: number;
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
  };
}
