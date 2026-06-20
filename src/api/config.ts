export const config = {
  apiBaseUrl: import.meta.env.VITE_GONOW_API_BASE_URL ?? '',
  enableMocks: (import.meta.env.VITE_GONOW_ENABLE_MOCKS ?? 'true') === 'true',
  openAiApiKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? '',
  cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID ?? '',
};
