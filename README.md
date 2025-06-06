# RateRefresher

RateRefresher is a demo application built with **Next.js** and
**Firebase Studio**. It displays current and historical exchange rates using the
[Frankfurter API](https://www.frankfurter.app/). The app highlights threshold
bands, shows a historical chart and provides a short AI‑generated analysis of
the selected currency pair.

## Features

- Real-time rate display with manual refresh
- Threshold indicator for buy/sell ranges
- Historical trend chart
- AI generated trend and distribution summary

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Genkit flows used for AI analysis can be started in a second terminal with:

```bash
npm run genkit:dev
```

## Deployment

The project is configured for Firebase Hosting. Build the static site and
deploy with:

```bash
npm run build
firebase deploy
```

See `.github/workflows/deploy.yml` for the GitHub Action that performs this
automatically.

## Disclaimer

This tool is for informational purposes only and does not constitute financial
advice. Exchange rate predictions are inherently uncertain; use at your own
risk.

For more background information see `docs/blueprint.md`.
