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
- `NOTEHUB_CLIENT_ID` and `NOTEHUB_CLIENT_SECRET`: required if using the `/api/events` route, which authenticates with OAuth client credentials.

Keep real credentials out of Git. The `.env` file is ignored.

Open <http://localhost:3000>. Run `npm run lint` to lint and `npm run build` to verify the production build.

## Netlify deployment

The production site is <https://co2monitor.netlify.app/>. Connect that existing site to `tjvantoll/CO2-Home-Monitor`, using the `main` production branch.

The repository-root `netlify.toml` sets:

- Base directory: `web-app`
- Build command: `npm run build`
- Publish directory: `.next` (relative to `web-app`)
- Node.js version: `22`

Netlify automatically installs its Next.js runtime to support server rendering and API routes. Keep the Notehub environment variables configured in Netlify for the production site; local `.env` files are not deployed from Git. The dashboard needs `NOTEHUB_PROJECT_UID` and `NOTEHUB_PERSONAL_ACCESS_TOKEN` available to Netlify Functions.

Push changes to this repository's `main` branch to deploy. Firmware and configuration scripts live outside this folder.
