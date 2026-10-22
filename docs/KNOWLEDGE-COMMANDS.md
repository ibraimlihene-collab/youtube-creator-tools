# Commands inside the site / الأوامر داخل الموقع

Open `/knowledge/assistant`, choose **أعطِ المساعد أمرًا / Donner un ordre à l’assistant**, or open `/knowledge/assistant?commands=1` directly. The current command capability appends plain text to an **existing Notion page**. This is a user-confirmed command, separate from the read-only daily scanner. It does not expose an MCP server to ChatGPT, execute arbitrary Composio tools, delete or replace content, send messages, create pages, or synchronize every service.

## Use it now locally

1. Write your request, for example: «لخّص هذا النص بالفرنسية لإضافته إلى صفحة مراجعة الفيزياء في Notion».
2. Select a note, knowledge entry, lesson, resource or research record, or paste the source yourself. Only its visible main text is copied. Journal, profile and internal command/report records are excluded from the picker. Sources over 8,000 characters are rejected rather than silently truncated; select an excerpt yourself.
3. **Use the text as is** copies your source into the proposed output without a model call and saves it locally. You can edit the output and save again. The source, request and output survive reload and are included in JSON export. Saving is explicit; use **Save draft locally** before leaving.
4. No API key is needed for these local steps. Changing the interface language preserves the content. Nothing is sent to a provider by selecting, editing or locally saving text.

## Activate Gemini and Notion

Follow [server configuration](./KNOWLEDGE-BRAIN.md): use your own valid Composio project key, the exact existing Composio user/entity ID, optional pinned Notion account ID, a valid owner email and a strong owner password. Log in on the assistant configuration page. Keep all keys server-only, never in browser storage or a `VITE_` variable. The temporary connectors available to a coding conversation are not the independent site's credentials.

For Notion, share only the intended pages with the connection. **Read content** is needed for page lookup; **Insert content** is also required for this append feature. A read-only daily scanner can retain its narrower grant. Changing an integration capability can require updating/re-authorizing its existing connection. Search covers shared/indexed pages and paginates ten results at a time; it is not a complete inventory of unshared pages.

Deploy the complete app/functions to Netlify and enable site-scoped Netlify Blobs. The ledger requires strong reads and ETag conditional writes. Vite can perform real model and identity checks with valid runtime configuration, but does not simulate a durable cloud ledger. No server preview or external write is allowed if that ledger is unavailable.

## Prepare, inspect, confirm

1. Optionally authorize sending **only the displayed request and source** to Gemini, then generate a draft. The fixed `gemini-3.5-flash-lite` model has no tools; its structured response supplies editable proposed text and a page-title search term. Unsupported requests or incomplete/invalid responses stop with an error. The model cannot choose a page ID or execute the addition.
2. Review/edit the output. Search for an actual accessible Notion page, or paste its Notion URL/UUID. Only canonical Notion page links are returned; pasted URLs are parsed as IDs, never fetched as arbitrary URLs. Page titles go through the app/Composio/Notion for lookup, not back to Gemini.
3. Authorize page verification and storing the operation on your server. **Prepare** verifies the actual scoped account and page, then stores an encrypted immutable copy of the page ID and exact output, valid for 15 minutes.
4. Inspect that server preview and choose **Confirm addition to Notion**. The endpoint accepts only the operation ID and explicit confirmation. It rechecks account/page access and executes the stored text/target. Changing browser fields or model output cannot substitute a different payload.
5. Success requires a valid Notion block acknowledgement and a saved server receipt. Repeating the same successful operation returns its original receipt without another append. A restored/imported local preview is labelled unverified; first use **Check result** to retrieve the authoritative server preview. Local backup status never proves a provider action happened.

## Interrupted requests and recovery

The server conditionally locks the operation as `sending` **before** writing to Notion. Concurrent confirmations cannot both acquire it. Large text is split into Unicode-safe plain paragraphs within Notion limits. The existing page is not replaced.

A timeout, provider error, malformed acknowledgement or receipt-storage error can follow a committed external write. The operation stays `unknown` or `sending` and cannot be automatically retried. Use **Check result**, then inspect the actual Notion page. Do not create another command with the same text until you have checked for a previous addition. A crashed request that had not yet written may also stay locked; this deliberately favors avoiding duplicate writes over automatic recovery. There is no provider-wide exactly-once guarantee across newly created operations.

Starting a new command asks for confirmation and archives the old draft locally. It does not cancel an already sent request. Local JSON export includes drafts, receipts and command archives, so keep it private; it excludes API secrets and does not restore the server ledger. Existing records are preserved during normal backup merge. A restored operation whose server record is missing cannot execute.

Server previews and receipts use encrypted `commands/<uuid>` keys in `knowledge-daily-brain`, with the same owner-password-derived encryption as daily state. The 15-minute expiry prevents execution of old prepared previews; it is **not automatic deletion**. Ledger entries currently have no automatic cleanup or app deletion UI. Include this store in secure operator backups and retain the owner password securely. Password rotation makes existing encrypted records unreadable unless migrated; keep a recovery copy before changing it.

## What was verified and what remains

Automated tests use mocked Composio/Notion transport for search, immutable preparation, consent, expiry/account/page checks, Unicode limits, concurrency, receipts and uncertain errors. Real browser captures verify Arabic/French/RTL/LTR, mobile/dark layouts, entry navigation, exact-text use and local save/reload. These do not certify an actual Notion write.

The configured app Composio key returned HTTP 401 in the earlier identity check; owner configuration also needs correction. This workspace role cannot persist sandbox configuration (403). Production Blobs/deployment are unavailable. This follow-up sends no private content and makes no actual Notion write. Live end-to-end activation must verify search → prepare → confirm once in a disposable page owned by the user after configuration is fixed. A synthetic live Gemini draft request timed out at the existing 25-second bound; do not infer successful draft generation from the earlier general model test. See the [test report](./KNOWLEDGE-OS-TEST-REPORT.md) for final results.
