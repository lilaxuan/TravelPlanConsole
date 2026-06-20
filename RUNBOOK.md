# GoNow Console — Runbook

> AI agent reference. Last updated: 2026-05-20.

---

## Overview

React + TypeScript single-page application (SPA) that provides the user-facing travel planning wizard. Built with Vite, React 18, React Router v6, and Leaflet for maps. In live mode it prefers the GoNow Backend Service `/generate` API when `VITE_GONOW_API_BASE_URL` is configured, and falls back to direct browser-side OpenAI GPT-4o calls for local demos.

---

## Repository Layout

```
TravelPlanConsole/
├── src/
│   ├── api/
│   │   ├── config.ts            # Reads env vars; exports { apiBaseUrl, enableMocks, openAiApiKey }
│   │   ├── trips.ts             # createTrip() / getTrip() — in-memory tripStore + exact-request cache
│   │   ├── chatgpt.ts           # callChatGPT() — calls OpenAI directly from browser
│   │   ├── buildTravelPrompt.ts # Builds the GPT-4o prompt from TripFormValues
│   │   ├── bookingUrls.ts       # Generates deep-link booking URLs
│   │   └── mockData.ts          # createMockTripResult() for local dev without API key
│   ├── components/
│   │   └── AppShell.tsx         # Top-level layout wrapper
│   ├── features/trip/
│   │   ├── pages/
│   │   │   ├── TripWizardPage.tsx   # Main page; orchestrates all wizard steps
│   │   │   ├── TripResultsPage.tsx  # Full results view
│   │   │   └── TripFormPage.tsx     # Standalone form page (legacy)
│   │   ├── components/
│   │   │   ├── TripForm.tsx             # Step 1: trip input form
│   │   │   ├── FlightSelectStep.tsx     # Step 2: pick a flight
│   │   │   ├── HotelSelectStep.tsx      # Step 3: pick a hotel
│   │   │   ├── CarRentalSelectStep.tsx  # Step 4: pick a car rental
│   │   │   ├── ItinerarySummaryStep.tsx # Step 5: full itinerary + map
│   │   │   ├── ItineraryMap.tsx         # Leaflet map with activity pins
│   │   │   └── TripLoadingState.tsx     # Loading spinner shown during generation
│   │   └── hooks/
│   │       ├── useTripWizard.ts  # Wizard state machine (step, selections, result)
│   │       └── useTripForm.ts    # Form field state + submit handler
│   ├── types/trip.ts            # All TypeScript types (TripResult, TripFormValues, etc.)
│   ├── styles/global.css        # Global CSS including wizard-step styles
│   ├── App.tsx                  # Router: / → TripWizardPage, * → redirect /
│   └── main.tsx                 # React DOM entry point
├── public/                      # Static assets
├── vite.config.ts               # Vite config: React plugin, @ alias → src/, port 3000
├── .env.example                 # Template: VITE_OPENAI_API_KEY=
└── .env.local                   # Local secrets (gitignored)
```

---

## Configuration (Environment Variables)

All env vars are prefixed `VITE_` and read in `src/api/config.ts`.

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_OPENAI_API_KEY` | `''` | OpenAI API key for browser-side GPT-4o calls |
| `VITE_GONOW_API_BASE_URL` | `''` | Backend HttpApi base URL (used by trip generation and Account page → `GET /users/me`) |
| `VITE_GONOW_ENABLE_MOCKS` | `'true'` | `'true'` → use mock data; `'false'` → call OpenAI |
| `VITE_COGNITO_USER_POOL_ID` | `''` | Cognito user pool ID (CDK output `UserPoolId`) |
| `VITE_COGNITO_CLIENT_ID` | `''` | Cognito web client ID (CDK output `UserPoolClientId`) |

Set these in `.env.local` (copy from `.env.example`). Pull the latest values from the deployed stack with:
```bash
aws cloudformation describe-stacks --stack-name GoNowBackendStack --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`||OutputKey==`UserPoolClientId`||OutputKey==`HttpApiUrl`]'
```

---

## Data Flow

### Mock mode (`VITE_GONOW_ENABLE_MOCKS=true`)
```
TripWizardPage → createTrip() → createMockTripResult() → in-memory tripStore → getTrip()
```
No network calls. Instant results. Used for UI development.

### Live mode (`VITE_GONOW_ENABLE_MOCKS=false`)
Preferred backend path when `VITE_GONOW_API_BASE_URL` is set:
```
TripWizardPage → createTrip() → request cache / in-flight dedupe
                              → backend POST /generate
                              → backend DynamoDB cache or parallel OpenAI section calls
                              → in-memory tripStore → getTrip()
```

Fallback path when `VITE_GONOW_API_BASE_URL` is empty:
```
TripWizardPage → createTrip() → callChatGPT() → OpenAI GPT-4o (browser fetch)
                                               → parse JSON → in-memory tripStore → getTrip()
```

The fallback OpenAI client is instantiated with `dangerouslyAllowBrowser: true`. The API key is exposed in the browser bundle — acceptable for local/demo use, not for production.

### Latency Strategy
- `trips.ts` keeps an exact-request session cache so repeated searches during one browser session return instantly.
- Concurrent duplicate submissions share the same in-flight promise instead of starting duplicate model/API calls.
- Backend `/generate` adds the durable DynamoDB cache and parallel OpenAI section prompts, so production traffic should set `VITE_GONOW_API_BASE_URL` and avoid browser-side OpenAI keys.

### UX Architecture Goal

The core product promise is to save more than 90% of planning time by turning one trip request into a guided workspace:

- **One input surface:** destination, dates, budget, travelers, style, and constraints.
- **Progressive sections:** flights, hotels, cars, itinerary, restaurants, and reminders should appear as each section is ready.
- **Truth labels:** real provider offers are shown as provider-backed inventory; empty sections remain empty rather than being filled with fake options.
- **AI recommendations:** AI should explain tradeoffs, build day plans, and personalize pacing after factual options are available.
- **Decision flow:** users choose flight, hotel, optional car, then review a schedule built around those choices.

Target interaction model:

```
TripHero form
  -> planning workspace
     -> Flights section appears first
     -> Hotels section appears when ready
     -> Cars section appears or can be skipped
     -> AI itinerary adapts to selected logistics
     -> Booking drawer opens provider links
```

Near-term implementation:
- `POST /generate` returns Amadeus-backed flight and hotel offers for the existing wizard.
- If provider credentials are missing, the backend returns a clear setup error instead of fake logistics.
- Car rental inventory may be empty until a real car provider is configured.

Long-term implementation:
- `POST /trips` starts a progressive job.
- `GET /trips/{tripId}` returns partial section statuses.
- The wizard advances as soon as the next decision section is available, without waiting for the full itinerary.

### Wizard Steps
1. **Trip details** (`TripForm`) — user fills departure, destination, dates, budget, travelers
2. **Choose flight** (`FlightSelectStep`) — select from GPT-generated options
3. **Choose hotel** (`HotelSelectStep`) — select from GPT-generated options
4. **Car rental** (`CarRentalSelectStep`) — select or skip
5. **Itinerary** (`ItinerarySummaryStep`) — day-by-day plan + Leaflet map with activity pins

State is managed in `useTripWizard` (step number, selections, tripResult). Completed steps are revisitable via the step indicator.

---

## Local Development

### Prerequisites
- Node.js ≥ 18, npm ≥ 7

### Setup
```bash
cd Console/TravelPlanConsole
npm install
cp .env.example .env.local
# Edit .env.local: set VITE_GONOW_API_BASE_URL for backend live mode,
# or VITE_OPENAI_API_KEY for direct browser fallback
```

### Run with mocks (no API key needed)
```bash
npm run local    # VITE_GONOW_ENABLE_MOCKS=true vite
```

### Run with live OpenAI calls
```bash
npm run start    # VITE_GONOW_ENABLE_MOCKS=false vite
```

Both serve at `http://localhost:3000`.

### Build for production
```bash
npm run build    # tsc -b && vite build → dist/
```

### Tests
```bash
npm test         # vitest run (single pass)
npm run test:watch
```

### Lint / Format
```bash
npm run lint
npm run format
```

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `react` / `react-dom` 18 | UI framework |
| `react-router-dom` v6 | Client-side routing |
| `openai` v4 | GPT-4o API client (browser-side) |
| `leaflet` + `react-leaflet` | Interactive map in ItineraryMap |
| `vite` v5 | Dev server + bundler |
| `vitest` | Unit test runner |
| `@testing-library/react` | Component testing utilities |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank results / mock data always shown | `VITE_GONOW_ENABLE_MOCKS` defaults to `true` | Set `VITE_GONOW_ENABLE_MOCKS=false` in `.env.local` or use `npm run start` |
| "OpenAI API key not configured" / 401 error | Backend was deployed without `OPENAI_API_KEY`, or direct fallback key is missing/wrong | Re-deploy backend with `OPENAI_API_KEY`, or set correct `VITE_OPENAI_API_KEY` for fallback |
| Live mode still calls OpenAI from browser | `VITE_GONOW_API_BASE_URL` is empty | Set backend `HttpApiUrl` in `.env.local` |
| Map not rendering | Leaflet CSS not loaded | Ensure `leaflet/dist/leaflet.css` is imported in `main.tsx` or `global.css` |
| `@/` import alias not resolving | Vite alias misconfigured | Check `vite.config.ts` — alias `@` → `./src` |
| Port 3000 already in use | Another process on 3000 | Kill the process or change port in `vite.config.ts` |

---

## Authentication

The Console uses **Cognito** (User Pool from `GoNowBackendStack`) directly from the browser via [`amazon-cognito-identity-js`](https://www.npmjs.com/package/amazon-cognito-identity-js). No backend round-trip is needed for sign-up or sign-in; the only authenticated backend call is `GET /users/me` (issued from the Account page).

### Routes
| Path | Component | Auth |
|------|-----------|------|
| `/` | `TripWizardPage` | Public |
| `/login` | `SignInPage` | Public |
| `/signup` | `SignUpPage` | Public |
| `/confirm` | `ConfirmSignUpPage` | Public |
| `/account` | `AccountPage` | **Requires session** (`RequireAuth`) |

### Flow
1. **Sign up** (`/signup`) — Cognito `signUp({ email, password })`. Cognito emails a 6-digit code.
2. **Confirm** (`/confirm?email=…`) — Cognito `confirmRegistration(code)`.
3. **Sign in** (`/login`) — Cognito `authenticateUser` (USER_SRP_AUTH). Tokens cached in localStorage by the Cognito SDK.
4. **Account** (`/account`) — fetches `GET /users/me` with `Authorization: Bearer <idToken>`. The Lambda lazily writes a `PROFILE` row to `UsersTable` on first call (key: `PK=USER#{sub}`, `SK=PROFILE`).
5. **Sign out** — clears Cognito local session, returns to `/login`.

### Source layout
```
src/auth/
├── cognito.ts        # Lazy CognitoUserPool singleton
├── authApi.ts        # signUp / confirmSignUp / signIn / signOut / getSession / getIdToken
├── AuthContext.tsx   # React context + useAuth() hook
└── RequireAuth.tsx   # Route guard → redirects to /login

src/features/auth/pages/
├── SignUpPage.tsx
├── ConfirmSignUpPage.tsx
├── SignInPage.tsx
└── AccountPage.tsx
```

---

## Known Limitations

- Trip results are stored in-memory (`Map`) — lost on page refresh
- Direct OpenAI fallback exposes the API key in the browser bundle; use backend `/generate` for production
- Trip wizard at `/` is still public; only `/account` is auth-gated
- No password-reset (forgot-password) flow yet
- No error boundary around wizard steps
- Console request cache is session-local only; durable reuse lives in the backend DynamoDB cache
