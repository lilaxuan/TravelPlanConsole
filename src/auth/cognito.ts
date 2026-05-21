import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { config } from '@/api/config';

let pool: CognitoUserPool | null = null;

export function getUserPool(): CognitoUserPool {
  if (pool) return pool;
  if (!config.cognitoUserPoolId || !config.cognitoClientId) {
    throw new Error(
      'Cognito is not configured. Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID in .env.local.',
    );
  }
  pool = new CognitoUserPool({
    UserPoolId: config.cognitoUserPoolId,
    ClientId: config.cognitoClientId,
  });
  return pool;
}
