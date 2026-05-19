export const config = {
  apiBaseUrl: import.meta.env.VITE_GONOW_API_BASE_URL ?? '',
  enableMocks: (import.meta.env.VITE_GONOW_ENABLE_MOCKS ?? 'true') === 'true',
  openAiApiKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
};
