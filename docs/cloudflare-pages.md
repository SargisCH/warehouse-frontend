# Deploy frontend using GitHub Actions

GitHub builds/tests the React app and uploads `build/` to Cloudflare Pages with
Wrangler. No Cloudflare GitHub app installation or repository connection is needed.
Pushes to `main` deploy automatically; the workflow also supports manual runs.
The old S3 workflow is manual-only.

## One-time Cloudflare setup

Create a **Pages Direct Upload** project in Workers & Pages (upload assets instead
of connecting Git). Name it, for example, `warehouse-frontend`. If the dashboard
requires an initial upload, upload a folder containing a placeholder `index.html`;
the first workflow deployment replaces it. Its production branch should be `main`.

Alternatively, create it once with Wrangler from a terminal:

```sh
npx wrangler@4 login
npx wrangler@4 pages project create warehouse-frontend --production-branch main
```

Create a Cloudflare API token with **Account → Cloudflare Pages → Edit**, limited
to the account hosting the project. Copy that account's ID from the dashboard.

## GitHub settings

In this **frontend repository**, create the `staging` environment under Settings
→ Environments. Add the following environment secrets (or repository secrets):

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Token with Pages Edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `API_URL` | HTTPS backend URL, e.g. `https://api.example.com/api/v1/` |

Add this environment variable under the same environment's **Variables**:

| Variable | Value |
| --- | --- |
| `CLOUDFLARE_PAGES_PROJECT` | Exact Pages project name, e.g. `warehouse-frontend` |

Secrets configured only in the backend repository are not available to this
repository. The API URL becomes public in the frontend bundle despite being
stored as a GitHub secret. Never add database passwords, JWT signing secrets or
Gemini keys to frontend build settings. Existing Cognito public identifiers stay
configured in `src/index.tsx`; no new authentication settings are introduced.

## First deployment

Commit the frontend changes and workflow, push to `main`, then open Actions →
Deploy frontend to Cloudflare Pages. Wrangler prints the deployment URL.
CI treats existing CRA warnings as warnings; compilation errors and failing tests
still fail deployment. Source maps are disabled in the uploaded build.

An HTTP IP-only backend cannot be used by this HTTPS frontend because browsers
block mixed content. Configure HTTPS on the backend first. Set the backend's
`FRONTEND_URL` in `/srv/warehouse-api/shared/.env` to the final Pages origin,
e.g. `https://warehouse-frontend.pages.dev`, and restart `warehouse-api` so CORS
allows it. Preview deployment URLs are different origins and are not automatically
allowed by the current backend CORS configuration.

Verify login, a database-backed request, and refreshing a nested frontend route.
Pages supplies SPA fallback when there is no top-level `404.html`; keep that
default behavior for this React app. Existing deployments stay on Pages after
the runner exits; no frontend process is needed on Kamatera.

References: [Direct Upload CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/),
[Pages API token permissions](https://developers.cloudflare.com/pages/configuration/api/).
