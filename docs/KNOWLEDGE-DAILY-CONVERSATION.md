# Three questions and Android reminders

Open `/knowledge/assistant`, then **ثلاثة أسئلة ليومي / Trois questions pour ma journée**, or open `/knowledge/assistant?today=1`. This is a local planning conversation. It works without Gemini, Composio or a phone number. It does not infer your identity, inspect your phone, or understand arbitrary instructions.

## Each morning

1. Enter or dictate the time available **after** sleep, school, travel, meals and responsibilities. Review the numeric minutes. Common Arabic/French durations are recognized. Ambiguous durations require a correction.
2. Choose an actual saved priority or describe a concrete new task. Science titles and saved content keep their language.
3. Select your energy and optionally describe an obstacle. The obstacle remains a note for your review. The planner does not interpret it automatically.

Each Continue saves the answer to IndexedDB. Reloading resumes the next question. The preview needs a separate **Save today's plan** action. It includes existing unfinished dated commitments before proposing more work. It never marks learning or tasks complete. Record the actual outcome through the planner afterward.

The proposal has at most three displayed actions, with additional commitments counted separately. It uses the lower of declared time and the saved daily budget, reserves all dated commitments (including completed time), allows ten-minute gaps, and caps low-energy proposals at 30 minutes. It preserves the requested duration of saved skills. A custom priority comes first outside an imminent exam period. Other suggestions favor academic and less-scheduled weekly skills. An exam within seven days prevents new optional activities. Existing deadlines and sessions are never moved by this conversation. Overload needs manual review.

Saving twice does not duplicate the plan. Editing answers after applying a plan preserves its existing tasks; change those tasks in the planner. Archived/moved generated source slots are not silently regenerated. This daily proposal complements the existing explicitly configured overdue-review algorithm and weekly planner.

## Optional voice input

The microphone button starts the browser's SpeechRecognition implementation only after a click. It transcribes one answer, in Arabic or French. Read and edit the text before saving. Energy remains required if the transcript does not clearly identify it. The app stores text, not audio. The browser may send audio to its recognition provider, as disclosed beside the button. Unsupported browsers offer text input. Actual microphone recognition and phone permissions were not exercised in sandbox QA. This is optional dictation, not an always-listening or fully hands-free assistant.

## Android reminders when the page is closed

The implementation uses standard Web Push: an hourly Netlify scheduled function, encrypted server subscription, VAPID authentication, and a push-only service worker. It operates independently of Gemini/Composio and the coding agent. A generic notification opens the three questions. **Production deployment and a real phone subscription are required. Nothing in the preview proves phone delivery.**

### Server setup

Use the [existing owner setup](./KNOWLEDGE-BRAIN.md) and deploy the repository through a Netlify Git build. Manual static uploads alone do not deploy scheduled functions. Netlify must supply its production `URL`, `NETLIFY` and site-scoped Blobs context. Require HTTPS and a valid owner email plus a unique owner password of at least 20 characters. Cloud review and Google sharing can remain disabled.

Generate a VAPID pair with the installed package on a trusted administrator machine:

```sh
npx web-push generate-vapid-keys
```

Save the generated values directly in Netlify's server Functions environment:

- `KNOWLEDGE_PUSH_PUBLIC_KEY`: generated public key.
- `KNOWLEDGE_PUSH_PRIVATE_KEY`: generated private key. Never put it in a `VITE_` variable, frontend storage, a note, chat, screenshot or Git.

The owner API returns only the public key. Redeploy after configuration. The hourly function tries at or after the chosen local hour, between 07:00 and 21:59. This is an hourly reminder, not minute-precise delivery. Netlify and the browser push service must be reachable.

### Phone setup

1. On the intended Android phone, open the deployed HTTPS site in a browser that supports Push, such as Chrome. Sign in as the owner in assistant settings.
2. Open the three-question page. Set the reminder hour (7–21) and IANA timezone (default `Africa/Casablanca`). Click **Enable this phone**, then grant the browser's notification permission.
3. Wait for confirmation that the subscription and schedule were saved on the server. Click **Send a test reminder** and check the phone itself. Provider acceptance alone does not prove display or a sound.
4. Check the production scheduled-function logs and the last-attempt status the following day, including a run with the page closed. Do not declare deployment verified before doing this.

Only one active browser subscription is supported. A different active subscription is never silently replaced. Disable the previous subscription before transferring it. Desktop activation targets that desktop browser, not a phone discovered from your account. No phone number is requested.

Android, power saving, network outages, disabled notifications or force-stopping the browser can delay/prevent delivery. Permission prompts and a real-device receipt need user interaction. The preview currently lacks production VAPID/Blobs/owner setup, so closed-browser execution and Android receipt remain unverified.

## Privacy, stopping and recovery

- Answers and generated tasks remain browser-local. They follow the existing JSON backup/import and conflict-safe save pipeline. No migration is required. Export before clearing site data or moving devices. Local state does not synchronize automatically.
- Push sends only a generic reminder, day and interface language. It never sends answers, goals, document contents or microphone audio to Gemini or the push service. The service worker ignores supplied titles/URLs and opens only the site's fixed daily route. It does not cache the app or intercept API traffic.
- The subscription endpoint and encryption keys are encrypted with AES-GCM in the existing `knowledge-daily-brain` Blobs store, under `push-device`. Owner-authenticated, same-origin requests configure it. This is a single-owner service, not multiuser device management. The existing owner-password encryption/rotation and operator-backup limits apply.
- The server claims a calendar day **before** sending. Automatic delivery is at most one attempt per local day, not a guaranteed once-per-day receipt. Failed or unknown attempts are not retried that day. A final storage conflict can leave `attempting`, which is uncertain, not success. Manual tests are separate and limited to one attempt per five minutes.
- HTTP 404/410 expires and disables the remote subscription. Re-enable on the intended phone to renew it. Other HTTP failures appear as refused; network failures remain unknown. Never resend an uncertain attempt automatically.
- Click **Stop server reminders** and confirm while online. The server removes the subscription before the local browser unsubscribe. Closing the page, logging out, removing local data or disabling the separate cloud-review switch does not stop configured push. Stop push separately. A request already sent cannot be recalled.
- As an emergency stop, disable the deployed scheduled function or revoke push credentials/permission. If local unsubscribe fails after remote stop, the server remains disabled; verify its status. If registration succeeds but enrollment fails, a local orphan subscription may remain; the server is not enabled. Resolve setup and retry, or remove site permissions.
- VAPID key rotation requires stopping and renewing device subscriptions. Daily/test claim keys currently accumulate small encrypted records without automatic cleanup. Include them in an operator retention policy. Local JSON backups do not include encrypted server subscriptions or VAPID secrets.

See the [test report](./KNOWLEDGE-OS-TEST-REPORT.md) for actual verification and its limits.
