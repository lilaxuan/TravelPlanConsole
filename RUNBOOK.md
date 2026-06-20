# GoNow Console — Runbook

> AI agent reference. Last updated: 2026-05-20.

---

## Overview

React + TypeScript single-page application (SPA) that provides the user-facing travel planning wizard. Built with Vite, React 18, React Router v6, and Google Maps for itinerary maps. The core trip planner is Console-only: in live mode it calls OpenAI from the browser for itinerary/restaurants/tips and combines that with local static flight, hotel, and car-rental planning options.

---

## Repository Layout

```
TravelPlanConsole/
├── src/
│   ├── api/
│   │   ├── config.ts            # Reads env vars; exports { enableMocks, openAiApiKey, googleMapsApiKey, ... }
│   │   ├── trips.ts             # createTrip() / getTrip() — in-memory tripStore + exact-request cache
│   │   ├── chatgpt.ts           # callChatGPT() — calls OpenAI directly from browser
│   │   ├── buildTravelPrompt.ts # Builds the configured OpenAI prompt from TripFormValues
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
| `VITE_OPENAI_API_KEY` | `''` | OpenAI API key for browser-side OpenAI calls |
| `VITE_OPENAI_FAST_MODEL` | `'gpt-4o'` | OpenAI model used when the user selects Fast response |
| `VITE_OPENAI_PREMIUM_MODEL` | `'gpt-5.5'` | OpenAI model used when the user selects Premium recommendation |
| `VITE_GOOGLE_MAPS_API_KEY` | `''` | Google Maps JavaScript API key for itinerary map rendering |
| `VITE_GONOW_API_BASE_URL` | `''` | Optional backend HttpApi base URL for Account page → `GET /users/me` and public stats |
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
Live mode (`VITE_GONOW_ENABLE_MOCKS=false`):
```
TripWizardPage → createTrip() → request cache / in-flight dedupe
                              → callChatGPT()
                              → configured OpenAI model generates hotels/itinerary/restaurants/tips
                              → local static flight/hotel/car sections
                              → in-memory tripStore → getTrip()
```

The OpenAI client is instantiated with `dangerouslyAllowBrowser: true`. The API key and configured model are exposed in the browser bundle — acceptable for local/demo use, not for production.

### Latency Strategy
- `trips.ts` keeps an exact-request session cache so repeated searches during one browser session return instantly.
- Concurrent duplicate submissions share the same in-flight promise instead of starting duplicate model/API calls.
- Console request caching is session-local. A production hardening pass should move OpenAI calls behind an API boundary before public launch.

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
- The Console returns static flight, hotel, and car-rental planning options locally.
- OpenAI only generates itinerary, restaurant, and travel-tip content.
- Car rental options are planning/search links, not live inventory.

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
# Edit .env.local: set VITE_OPENAI_API_KEY for live itinerary generation,
# and VITE_GOOGLE_MAPS_API_KEY for the Google Maps itinerary view.
# VITE_GONOW_API_BASE_URL is optional for account/profile and stats features.
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
| `openai` v4 | OpenAI API client (browser-side) |
| `@react-google-maps/api` | Google Maps itinerary map |
| `vite` v5 | Dev server + bundler |
| `vitest` | Unit test runner |
| `@testing-library/react` | Component testing utilities |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank results / mock data always shown | `VITE_GONOW_ENABLE_MOCKS` defaults to `true` | Set `VITE_GONOW_ENABLE_MOCKS=false` in `.env.local` or use `npm run start` |
| "OpenAI API key not configured" / 401 error | Browser-side key is missing/wrong | Set correct `VITE_OPENAI_API_KEY` |
| Live mode still shows mock data | `VITE_GONOW_ENABLE_MOCKS` is still true | Set `VITE_GONOW_ENABLE_MOCKS=false` or use `npm run start` |
| Map not rendering | Google Maps key is missing or not allowed for this origin | Set `VITE_GOOGLE_MAPS_API_KEY` and allow `http://127.0.0.1:3000/*` / your deployed origin |
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
- Direct OpenAI exposes the API key in the browser bundle; move it behind an API boundary before production
- Trip wizard at `/` is still public; only `/account` is auth-gated
- No password-reset (forgot-password) flow yet
- No error boundary around wizard steps
- Console request cache is session-local only; durable reuse lives in the backend DynamoDB cache
