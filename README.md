# Trading Dashboard

Statyczny dashboard TradingView oparty o:

- Vanilla JS
- JSON config
- Bootstrap 5
- GitHub Pages
- GitHub Actions

## Deployment

1. Wrzuć repo na GitHub
2. Włącz GitHub Pages:
   - Settings
   - Pages
   - Source: GitHub Actions

## Edycja widgetów

Modyfikuj:

dashboard.json

Po pushu GitHub Action automatycznie opublikuje nową wersję.

npm i playwright
npx playwright install



node tv_export.js
npm run build:stockdata

## Local run (without GitHub Pages)

Project can run locally as static site.

1. Install dependencies:
   - `npm install`
2. Generate local dashboard data:
   - `npm run build:data`
3. Start local server:
   - `npm run serve`
4. Open:
   - `http://localhost:4173`

Quick one-command start:

- `npm run start:local`

Notes:

- In CI (`.github/workflows/deploy.yml`) `generated/dashboard.json` is created during deploy.
- Locally, if `FINNHUB_API_KEY` is missing, `build:data` still works using fallback titles (symbol names).
