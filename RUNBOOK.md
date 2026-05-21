# GoNow Console — Runbook

> AI agent reference. Last updated: 2026-05-20.

---

## Overview

React + TypeScript single-page application (SPA) that provides the user-facing travel planning wizard. Built with Vite, React 18, React Router v6, and Leaflet for maps. Communicates with OpenAI GPT-4o either directly from the browser (default) or via the GoNow Backend Service API.

---

## Repository Layout

```
TravelPlanConsole/
├── src/
│   ├── api/
│   │   ├── config.ts            # Reads env vars; exports { apiBaseUrl, enableMocks, openAiApiKey }
│   │   ├── trips.ts             # createTrip() / getTrip() — in-memory tripStore (Map)
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
| `VITE_GONOW_API_BASE_URL` | `''` | Backend service base URL (unused in current flow) |
| `VITE_GONOW_ENABLE_MOCKS` | `'true'` | `'true'` → use mock data; `'false'` → call OpenAI |

Set these in `.env.local` (copy from `.env.example`).

---

## Data Flow

### Mock mode (`VITE_GONOW_ENABLE_MOCKS=true`)
```
TripWizardPage → createTrip() → createMockTripResult() → in-memory tripStore → getTrip()
```
No network calls. Instant results. Used for UI development.

### Live mode (`VITE_GONOW_ENABLE_MOCKS=false`)
```
TripWizardPage → createTrip() → callChatGPT() → OpenAI GPT-4o (browser fetch)
                                               → parse JSON → in-memory tripStore → getTrip()
```
The OpenAI client is instantiated with `dangerouslyAllowBrowser: true`. The API key is exposed in the browser bundle — acceptable for local/demo use, not for production.

**Note:** The backend `POST /generate` endpoint exists as an alternative that keeps the API key server-side. To switch, update `trips.ts` to call the backend instead of `callChatGPT()` directly.

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
# Edit .env.local: set VITE_OPENAI_API_KEY if running live mode
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
| "OpenAI API key not configured" / 401 error | `VITE_OPENAI_API_KEY` missing or wrong | Set correct key in `.env.local` |
| Map not rendering | Leaflet CSS not loaded | Ensure `leaflet/dist/leaflet.css` is imported in `main.tsx` or `global.css` |
| `@/` import alias not resolving | Vite alias misconfigured | Check `vite.config.ts` — alias `@` → `./src` |
| Port 3000 already in use | Another process on 3000 | Kill the process or change port in `vite.config.ts` |

---

## Known Limitations

- Trip results are stored in-memory (`Map`) — lost on page refresh
- OpenAI API key is exposed in the browser bundle (use backend `/generate` for production)
- No user authentication in the current UI flow (Cognito is backend-only)
- No error boundary around wizard steps
- `VITE_GONOW_API_BASE_URL` is read but the backend API path is not wired up in `trips.ts`
