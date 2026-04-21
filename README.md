# GoNow Console

React + TypeScript console package for the GoNow travel planning product.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run test
```

## Expected environment variables

Create a `.env.local` file:

```bash
VITE_GONOW_API_BASE_URL=https://example.execute-api.us-west-2.amazonaws.com/prod
VITE_GONOW_ENABLE_MOCKS=true
```

## Deployment notes

The package outputs a static build in `dist/`. That keeps it compatible with standard React artifact hosting and easy to adapt for TangerineBox packaging.
