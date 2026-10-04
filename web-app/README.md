# CO2 Monitor web app

The canonical dashboard for this project lives in this folder. It displays environmental metrics from Notehub using Next.js and Chart.js.

## Local development

Use Node.js 22 or newer, then run:

```sh
cd web-app
npm ci
cp .env.example .env
npm run dev
```

Configure these server-side variables in `.env`:

- `NOTEHUB_PROJECT_UID`: the Notehub project UID.
- `NOTEHUB_PERSONAL_ACCESS_TOKEN`: the personal access token used by the dashboard.

The page renders a static dashboard shell immediately. Charts and events load in the browser in parallel. `/api/events?range=24h` fetches only the selected captured-time window (also supports `3d`, `7d`, `14d`, and `30d`), makes one Notehub request for up to 5,000 of the latest events in that window, and returns only chart fields. There is no pagination. Upstream responses and successful API responses are cached for 60 seconds; the time window is rounded to the minute. Switching back to a recently loaded range also reuses a 60-second browser memory cache. Failed requests show a retry button instead of appearing as empty data.

Keep real credentials out of Git. The `.env` file is ignored.

Open <http://localhost:3000>. Run `npm run lint` to lint and `npm run build` to verify the production build.

## Netlify deployment

The production site is <https://co2monitor.netlify.app/>. Connect that existing site to `tjvantoll/CO2-Home-Monitor`, using the `main` production branch.

The repository-root `netlify.toml` sets:

- Base directory: `web-app`
- Build command: `npm run build`
- Publish directory: `.next` (relative to `web-app`)
- Node.js version: `22`

The configuration explicitly enables Netlify’s Next.js adapter to support server rendering and API routes from this subdirectory. Keep the Notehub environment variables configured in Netlify for the production site; local `.env` files are not deployed from Git. The dashboard needs `NOTEHUB_PROJECT_UID` and `NOTEHUB_PERSONAL_ACCESS_TOKEN` available to Netlify Functions.

Push changes to this repository's `main` branch to deploy. Firmware and configuration scripts live outside this folder.
