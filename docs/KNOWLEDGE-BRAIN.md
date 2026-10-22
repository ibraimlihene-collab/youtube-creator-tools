# Daily assistant / المساعد اليومي

The assistant at `/knowledge/assistant` has two real operating modes. It does not depend on the coding agent or a Lightsprint session after deployment.

## Use now, in this browser

1. Choose your daily review hour and timezone (default Africa/Casablanca).
2. Enable daily review and save. Keep the app open; the controller checks once a minute and when records change, after the selected hour. There is one local report per calendar day. “Review now” also works without enabling the timer.
3. Read the report and apply suggestions, or explicitly opt into automatic moves before saving. A persistent link to the latest report appears on other pages.
4. Set daily available minutes in settings. Only overdue tasks and sessions move. Academic work is considered first; homework/examination deadlines never move. Timed work keeps its hour, protects 07:00–22:00 and 10-minute gaps. Work without a time has no invented time assigned. A seven-day horizon and a three-postponement limit prevent endless backlog rollover. Review blocked/waiting/paused work manually.
5. Record actual outcomes yourself. An unchecked task means completion is unrecorded; a report does not prove failure or create study minutes.

Local mode uses deterministic scheduling rules, not Gemini. It cannot run with the browser closed. Reports/config are ordinary portable workspace records included in JSON export. Editing an internal report into invalid JSON hides that report from the assistant without deleting its record.

## Secure server setup

Deploy the whole repository to Netlify with Node 22 and the committed `netlify.toml`. A manually uploaded `dist/` folder alone does not install functions/schedules. Run production builds in CI or a separate checkout, never over an active Vite preview. Dependencies install with `npm ci`.

Set these **server-only** environment variables in the Netlify site settings (Functions scope); for a Lightsprint preview, use its masked environment-variable interface and persist there too. Never use a `VITE_` prefix, paste a key into chat, or save credentials as notes:

| Variable | Value/purpose |
| --- | --- |
| `GEMINI_API_KEY` | Google AI Studio server key with access to `gemini-3.5-flash-lite` |
| `KNOWLEDGE_OWNER_EMAIL` | The Google account address supplied by the owner; must match both authorized Google services |
| `KNOWLEDGE_OWNER_PASSWORD` | A unique random password of at least 20 characters; also derives the encrypted-state key |
| `COMPOSIO_API_KEY` | Your own Composio project key, not this coding session's temporary connector credentials |
| `COMPOSIO_USER_ID` | Optional exact user/entity ID that already owns your Composio connections; do not infer it from your email |
| `COMPOSIO_DRIVE_CONNECTED_ACCOUNT_ID` | Optional exact existing Drive connection, especially when more than one is active |
| `COMPOSIO_GMAIL_CONNECTED_ACCOUNT_ID` | Optional exact existing Gmail connection |
| `COMPOSIO_NOTION_CONNECTED_ACCOUNT_ID` | Optional exact existing Notion connection |
| `COMPOSIO_DRIVE_AUTH_CONFIG_ID` | Optional Drive auth configuration, needed only to create a **new** OAuth link |
| `COMPOSIO_GMAIL_AUTH_CONFIG_ID` | Optional Gmail auth configuration for new links |
| `COMPOSIO_NOTION_AUTH_CONFIG_ID` | Optional Notion auth configuration for new links |

Netlify supplies `NETLIFY`, `URL` and its Blobs runtime context automatically. Do not copy a sandbox host into `URL`. Provision/enable Netlify Blobs for the site. Local Vite exposes the real status/login/provider endpoint through a server middleware; it does **not** simulate cloud storage, deployment or scheduled jobs.

Use Google OAuth auth configurations with **read-only scopes**: `https://www.googleapis.com/auth/drive.readonly` and `https://www.googleapis.com/auth/gmail.readonly`. Composio owns the documented OAuth callback; the generated link returns to `/knowledge/assistant`. Configure Google's consent screen/test users and Composio's allowed redirect origins for the deployed domain.

### Reuse connections you already have

You do **not** need to authorize every service again. Use your own Composio project key and set `COMPOSIO_USER_ID` to the **exact existing user/entity ID** shown for your connections in that project. This is not necessarily your Google email. Set each optional `*_CONNECTED_ACCOUNT_ID` when you have multiple accounts for a service. The API query always scopes by user, toolkit and ACTIVE status; a pinned account cannot escape that scope. Disabled/auth-disabled connections, wrong users and ambiguous/paginated results fail closed. No arbitrary account is selected and existing connections are never deleted.

Open the assistant, log in with the owner password and choose **Check existing connection** separately for Drive, Gmail and Notion. It performs a real provider request; status badges do not infer success from the key or an OAuth return. Google must match `KNOWLEDGE_OWNER_EMAIL`. Notion checks its token bot identity and displays its accessible workspace; a Notion workspace may have a different owner email from Google. Grant only the intended pages to this Notion integration, with Read content capability. All content scanning remains separately opt-in, even for an existing connection.

Without `COMPOSIO_USER_ID`, the application retains its original stable SHA-256-derived user ID so existing app installations keep working. New OAuth links use that same selected user. Only configure `*_AUTH_CONFIG_ID` and choose **Create new authorization** if a connection is absent/expired or needs new permissions. These fields are not required for existing connections. Connection and model tests do not require cloud Blobs; cloud sync/reviews still do.

**Session tools versus your independent site:** a connector visible to this coding conversation is usable by this agent, but its temporary project credentials are not transferable to a deployed personal app. A live identity-only Notion connector request succeeded in this session; the app server still needs a valid project key and valid owner configuration. We did not copy temporary connector credentials, send private Notion page content to Gemini, or claim that the independent site inherited that connection. Other Composio toolkits are not enabled automatically: only Drive, Gmail and Notion have implemented read adapters.

Test Gemini using its button. A key-present badge is not a successful generation claim. The model is fixed to `gemini-3.5-flash-lite`, with no silent fallback.

## Activate independent operation

1. Log in and pull any pending server reports.
2. Enable server mode, read the data-sharing disclosure, choose Drive/Gmail/Notion permissions, enable daily review, and save. This sends a minimal snapshot of task/session/homework/exam titles, states, dates, times, subjects, priorities and durations. Journal, profile, note bodies and exercise attempts are excluded.
3. “Review now” synchronizes then queues a background job. Accepted means queued, not successfully analyzed; pull/refresh reports afterward.
4. Netlify's hourly scheduled function dispatches a signed background function. The selected local hour/timezone gates the daily review; provider work runs in the background rather than the short scheduler invocation. It needs no open browser or coding-agent process. Deploy schedules to the production site and verify them in Netlify logs.
5. Reopen the app and log in to retrieve reports. Automatic moves are applied only when the local record date, update timestamp and active status still match the proposal; newer edits/completions are preserved. The UI also rejects stale snapshot writes. Snapshots synchronize while the authenticated app is open; offline changes cannot be known by the server until the browser syncs again.

Cloud state is encrypted with AES-256-GCM and a scrypt-derived key in the site-scoped `knowledge-daily-brain` Blobs store. Strong-consistency reads and conditional writes reject concurrent revisions. Auth uses a one-day HttpOnly/Secure/SameSite=Strict cookie; private POSTs require the same origin. Login limits are per warm function instance (5 attempts/15 minutes); enable a platform firewall for durable/global abuse control. This is a single-owner implementation, not multiuser cloud sync or an audit-certified vault.

## What is actually inspected

- Drive lists **three files per batch**, newest first, remembers the real page token and continues hourly while pages remain. It can traverse the accessible listing; it cannot promise that every file is analyzed daily. Ordering changes during traversal and very large Drives may cause gaps/duplicates; no full change-index/deduplication database exists yet.
- Supported: PDF, PNG/JPEG/WebP, plain text/CSV, and Docs/Slides/Sheets exported to PDF. Up to **4 MB per file**; long text is limited to 20,000 characters. Unsupported/oversized/failed files are listed explicitly. Shortcuts, arbitrary websites, videos/audio, DOCX/XLSX/ZIP, OCR accuracy and large-document completeness are not guaranteed. Vision-capable Gemini sees only successful image/PDF inputs.
- Notion lists **three accessible pages per batch**, newest edited first, using read-only search (a POST by the Notion API convention). It retains the real search cursor for hourly continuation. Each page reads at most 100 top-level blocks and 20,000 text characters. Nested blocks, attachments, linked pages/databases, embeds and additional block pages are not traversed; truncation/omissions are marked partial. Search only covers pages shared with the integration, can lag indexing and is not an exhaustive workspace inventory. The daily scanner performs no Notion writes, external link downloads or full database-row query. A separate user-confirmed append command is documented below. Completed service listings are not restarted during another service’s same-day automatic continuation; a manual run can restart them.
- Gmail reads up to five recent messages (last day), subject and snippet only; extra pages are marked partial. It does not read attachments or whole conversations, and does not send email.
- Sources are untrusted data. Model output is plain text without tools or executable actions. Only deterministic code proposes/moves dates. Summaries cite supplied IDs; they remain model suggestions, not verified facts. The provider can reject/rate-limit; the report lists failures and never claims a successful model call in that case.
- Latest **30 cloud batch reports** are retained; retrieve/export regularly. Hour-slot claim keys prevent duplicate jobs and currently accumulate one small encrypted key per active hour (no automatic retention cleanup). A failed run claims its slot; retry next hour. No automatic email/push/SMS delivery exists: reports appear in-app when opened.

## Pause, revoke, back up, recover

To stop the cloud worker, log in, disable server mode or daily review, and **save while online**. The remote opt-out is written before local settings. Automatic old-browser synchronization cannot re-enable it. Merely closing the page, logging out, or disabling a browser-local switch without a successful server save does not stop an already configured server. Revoke Google consent, Notion page access or Composio connections to remove read access; disable the Netlify schedule as a deployment-level emergency stop.

Downloaded JSON includes private local records and imported reports; protect it. Server credentials never enter that backup. It is not a complete cloud-state backup: before server maintenance, pull the latest reports and export browser data. Do not rotate the owner password blindly: it encrypts existing Blobs data as well as sessions. Export/migrate state using the old key first; an undecryptable state returns an error and is never silently reset. Site-level state deletion/reset needs explicit owner confirmation and a backup; this UI does not provide a destructive cloud reset.

## Verification and activation boundary

During implementation the actual model-list API and a small generation request succeeded with `gemini-3.5-flash-lite` using the existing server runtime key, without private documents. The session Notion connector identity request also succeeded, but this does not authenticate the independent app. A subsequent live request with the configured server Composio key returned HTTP 401; owner email validation and the 20-character password minimum also failed. These values must be corrected through masked environment settings. No secret values are logged or included here. Netlify Blobs runtime and production deployment remain unavailable. Real application Drive/Gmail/Notion reads, new OAuth, vision on private files, encrypted production persistence and scheduled production invocation remain **unverified and inactive**, despite implemented paths and mocked boundary tests. See [the test report](./KNOWLEDGE-OS-TEST-REPORT.md).

API references used: [Google models](https://ai.google.dev/gemini-api/docs/models), [Composio proxy](https://docs.composio.dev/reference/api-reference/tools/postToolsExecuteProxy), [Composio connection links](https://docs.composio.dev/reference/api-reference/connected-accounts/postConnectedAccountsLink), [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/).

Notion references: [search](https://developers.notion.com/reference/post-search), [bot identity](https://developers.notion.com/reference/get-self), [block children](https://developers.notion.com/reference/get-blocks-children). Notion requests pin `Notion-Version: 2022-06-28`; the adapter reads pages, not the newer data-source model.

## Commands inside the website

Use the assistant’s command entry for selected-content → optional Gemini draft → real Notion page lookup → immutable server preview → explicit append confirmation. This path requires Notion Insert content and a durable encrypted operation ledger; it is separate from daily read-only sharing. See [command use, activation and interrupted-request recovery](./KNOWLEDGE-COMMANDS.md).
