import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { getUserPool } from './cognito';

export interface AuthUser {
  sub: string;
  email: string;
}

function userOf(email: string): CognitoUser {
  return new CognitoUser({ Username: email, Pool: getUserPool() });
}

export function signUp(email: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const attrs = [new CognitoUserAttribute({ Name: 'email', Value: email })];
    getUserPool().signUp(email, password, attrs, [], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    userOf(email).confirmRegistration(code, true, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function resendConfirmationCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    userOf(email).resendConfirmationCode((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function signIn(email: string, password: string): Promise<AuthUser> {
  return new Promise((resolve, reject) => {
    const cognitoUser = userOf(email);
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(userFromSession(session)),
      onFailure: (err) => reject(err),
    });
  });
}

export function signOut(): void {
  const current = getUserPool().getCurrentUser();
  if (current) current.signOut();
}

export function getSession(): Promise<AuthUser | null> {
  return new Promise((resolve) => {
    const current = getUserPool().getCurrentUser();
    if (!current) {
      resolve(null);
      return;
    }
    current.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      resolve(userFromSession(session));
    });
  });
}

export function getIdToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const current = getUserPool().getCurrentUser();
    if (!current) {
      resolve(null);
      return;
    }
    current.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      resolve(session.getIdToken().getJwtToken());
    });
  });
}

function userFromSession(session: CognitoUserSession): AuthUser {
  const payload = session.getIdToken().payload as { sub: string; email: string };
  return { sub: payload.sub, email: payload.email };
}
