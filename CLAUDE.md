# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🔴 CRITICAL RULES - READ FIRST

### MANDATORY: Always Use Worktree + PR Workflow

**NEVER push directly to master. ALWAYS create a worktree and PR for review.**

```bash
# Step 1: Create new worktree for the feature
git worktree add ../fx-alert-feature-name -b feature/feature-name

# Step 2: Work in that worktree
cd ../fx-alert-feature-name

# Step 3: Make changes and commit
git add .
git commit -m "feat: description"

# Step 4: Push branch
git push origin feature/feature-name

# Step 5: Create PR
gh pr create --title "Title" --body "Description"

# Step 6: After merge, cleanup
git worktree remove ../fx-alert-feature-name
```

**Branch naming:** `feature/short-description`, `fix/short-description`, `monetization/sprint-N`

**Why worktrees?** Multiple agents can work simultaneously without conflicts.

---

## Project Overview

FX Alert (codename: RateRefresher) is a Next.js web app that displays foreign exchange rates with historical analysis and AI-generated insights. It's deployed to Firebase Hosting and uses the free Frankfurter API for rate data.

## Development Commands

```bash
# Start dev server (runs on port 9002 with Turbopack)
npm run dev

# Start Genkit AI flows (run in second terminal for local AI features)
npm run genkit:dev

# Build for production (outputs to out/ for Firebase Hosting)
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint

# Deploy to Firebase Hosting
firebase deploy
```

## Architecture

### Data Flow
1. **Frankfurter API** (`src/lib/currency-api.ts`) fetches current and historical FX rates
2. **Dynamic Analysis** (`src/lib/dynamic-analysis.ts`) calculates statistics, trends, and threshold bands from historical data
3. **Band Classification** (`src/lib/bands.ts`) classifies rates into 5 bands: EXTREME, DEEP, OPPORTUNE, NEUTRAL, RICH
4. **Components** consume this data to display rate info, charts, and AI analysis

### Key Files
| File | Purpose |
|------|---------|
| `src/lib/currency-api.ts` | Frankfurter API client (current rate, history, currencies) |
| `src/lib/dynamic-analysis.ts` | Statistical analysis, trend generation, threshold bands |
| `src/lib/bands.ts` | Band definitions, color configs, rate classification |
| `src/ai/genkit.ts` | Genkit/Gemini AI configuration |
| `src/app/page.tsx` | Main page orchestrating all components |
| `src/components/current-rate-display.tsx` | Rate display with currency selectors |
| `src/components/history-chart-display.tsx` | Historical chart with band overlays |
| `src/components/analysis-display.tsx` | AI-generated trend and distribution summary |

### Band System
The app classifies rates into 5 bands based on historical percentiles:
- **EXTREME**: ≤ p10 (red)
- **DEEP**: p10–p25 (purple)
- **OPPORTUNE**: p25–p75 (green)
- **NEUTRAL**: p75–p90 (slate)
- **RICH**: ≥ p90 (yellow)

Each band has associated actions, probabilities, and visual styling defined in `bands.ts`.

### AI Integration
- Uses Google Genkit with Gemini 2.0 Flash model
- Flows defined in `src/ai/dev.ts` (currently minimal)
- AI analysis is referenced in footer but generated via OpenAI o3 for current implementation

### UI Components
- Built with shadcn/ui (Radix UI primitives + Tailwind CSS)
- All UI components in `src/components/ui/`
- Uses Recharts for data visualization

### Deployment
- Static export via `next build` → `out/` directory
- Deployed to Firebase Hosting via GitHub Action on push to `master`
- Project ID: `raterefresher`

## Style Guidelines
From `docs/blueprint.md`:
- Primary: light gray/white backgrounds
- Secondary: dark gray for text
- Accent: Teal (#008080) for interactive elements
- Use Lucide React icons
- Clean, centered layout with consistent spacing

## Important Notes
- Dev server runs on port 9002 (not default 3000)
- Uses Turbopack for faster dev builds
- No backend — all API calls are client-side to Frankfurter
- User preferences persisted via `useLocalStorage` hook
- All historical data calculations are client-side

## Testing Guidelines

### Current State
**No automated tests are currently set up.** Testing is done manually via:
- Chrome DevTools for console errors and network requests
- Visual inspection of UI components
- Manual verification of key user flows

### When to Add Unit Tests
Unit tests are valuable for:
- Complex business logic with multiple edge cases
- Data transformations or calculations
- Critical paths that could break the app

**Unit tests are NOT strictly required for:**
- Simple API wrappers (like `fetchFrankfurterRate`)
- UI refactors with no logic changes
- Styling or layout updates
- Documentation changes

### Recommended Approach
1. **Manual testing first** - Use Chrome DevTools to verify functionality
2. **Add tests for complex logic** - When adding calculations or data transformations
3. **Future consideration** - When the codebase grows, set up Jest + React Testing Library

### Example Test Structure (for future reference)
```typescript
// Test: fetchFrankfurterRate handles API success
test('returns rate data when API succeeds', async () => {
  const result = await fetchFrankfurterRate('USD', 'THB');
  expect(result?.rate).toBeGreaterThan(0);
  expect(result?.source).toBe('frankfurter');
});
```
