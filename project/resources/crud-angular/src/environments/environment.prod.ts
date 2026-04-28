import {Environment} from '../app/core/models/environment.interface';

export const environment: Environment = {
  production: true,
  baseUri: 'http://localhost:8741',
  apiVersion: 'v1',
  features: {
    enableLogging: false,
    enableAnalytics: true,
    enableSentry: true
  },
  api: {
    timeout: 30000,
    retryAttempts: 3
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token'
  }
};
