# Universal Knowledge OS — first functional version

Arabic-first, French-alternative personal knowledge, learning and creation workspace. This delivery implements the local foundation and connected manual workflows from phases 1–5. It is **not completion of the entire master roadmap**: autonomous tutoring and scientific verification remain follow-up work. The daily assistant now has a local rules engine and a secure optional Gemini/Composio server implementation; real Google authorization and deployed cloud operation require setup. See [daily assistant setup](./KNOWLEDGE-BRAIN.md).

## Run and deploy

Requirements: Node 22+, npm; Bun to run the focused tests. No server, account, database URL or API key is required for Knowledge OS.

```sh
npm ci
npm run dev:app -- --host 0.0.0.0 --port 5173
# Open http://localhost:5173/knowledge
bun run check
bun run test:changed
npm run lint
```

`/` redirects to `/knowledge`. Existing creator tools stay at `/app`, `/dashboard`, `/tools/*` and `/articles`; the former creator landing page is at `/creator`. The separate AMKSA game is unchanged. Existing creator-tool browser data is untouched: Knowledge OS uses its own IndexedDB database.

Production, **after stopping the development server**:

```sh
npm run build
npm run preview -- --host 0.0.0.0
```

Deploy `dist` to a static HTTPS host. Existing `netlify.toml` provides SPA fallback to `index.html`. On another host, rewrite all non-file paths to `index.html`, preserving static assets; deploy at the origin root (no base path is configured). HTTPS or localhost is required for `crypto.randomUUID`. Production build is documented but was deliberately not run over the active Vite preview; see the test report.

The existing creator AI functions remain separate and optional; their `.env.example` / `SECURITY.md` instructions are separate from the Knowledge OS daily assistant. See its dedicated setup guide. No Knowledge OS API keys belong in Vite environment variables or browser storage.

## Source structure

| File | Responsibility |
| --- | --- |
| `src/App.tsx` | Isolated, lazy-loaded `/knowledge/*` workspace and retained creator routes |
| `src/knowledge/KnowledgeApp.tsx` | Shell, routing, persistence orchestration, language/theme, capture and dialogs |
| `src/knowledge/model.ts` | Versioned schema, validation, links, search normalization, backups, calendar and review algorithm |
| `src/knowledge/storage.ts` | IndexedDB transactions and revision checks |
| `src/knowledge/i18n.ts` | Complete Arabic/French dictionary and 31 domain definitions |
| `src/knowledge/config.ts` | Record kinds, editor fields and workspace filters |
| `src/knowledge/context.ts` | Typed shared operations |
| `src/knowledge/Dashboard.tsx` | Dashboard, real metrics, actions and focus timer |
| `src/knowledge/Editor.tsx` | Validated editor, detail view, backlinks and manual lesson practice |
| `src/knowledge/Pages.tsx` | Collections, filters, domains/graph, planner, cards and analytics |
| `src/knowledge/Settings.tsx` | Profile, real preferences, JSON backup, privacy and honest service availability |
| `src/knowledge/knowledge.css` | Scoped design tokens, RTL/LTR, light/dark and responsive styling |
| `src/knowledge/*.test.mjs` | Data integrity, localization and transactional persistence tests |
| `public/knowledge-icon.svg` | Code-native application icon |

## Implemented workflows

- Arabic by default; French alternative. Changing language preserves route, editor draft and original record text. Both `html` and application direction change. Language and theme survive refresh. Dates use Arabic/French Moroccan locales. Content supports Arabic, French, English or another language.
- Responsive shell, scrollable desktop navigation with persistent language controls, mobile drawer, keyboard search shortcut (Ctrl/Cmd K), labelled inputs, focus indicators, native modal focus management, Escape dismissal with unsaved-draft confirmation, reduced-motion support.
- Dashboard with no fake progress; the requested first-week plan is installed once. Counts come from saved records. Actions create tasks, ideas, notes and sessions. Seven-day action selection, upcoming homework/exams, recent knowledge, focus timer and weekly review entry. Dashboard notes/domains sections can be hidden.
- 21 record types: notes, knowledge, resources, custom subjects, lessons, tasks, homework, exams, study sessions, mistakes, flashcards, goals, projects, milestones, learning paths, research questions, journal entries, ideas, vocabulary, weekly reviews and custom domains.
- Create, edit, archive and confirmed permanent deletion; title, content, language, status, tags and typed optional fields. Shared fields include provenance, dates, evidence classification, content nature, subjective confidence, outcomes, risks and next actions. Record links are selected explicitly; detail views show incoming and outgoing references. Deleting a record removes its references without deleting linked records.
- Global search across title, body, tags and metadata; French accent folding and Arabic diacritic/alef normalization. Filters for type, state, language, domain, subject, evidence, tags and creation date; newest/deadline sorting.
- Domain explorer with 31 requested fields, real stored counts and user-defined domains. Each domain shows its knowledge/questions/resources and can create a related entry. Knowledge graph shows up to 20 connected records with keyboard/click access to details; isolated records remain accessible in the list.
- Resource library with creator/source/URL/status, claims and reflection prompts. User-provided sources and explicitly attributed study-text sources are displayed. No fabricated books, URLs or quotations.
- Education context defaults only to the supplied TCS / option française. Subject definitions are organizational defaults, **not a verified syllabus**. The supplied first-week lesson titles are installed once; further lessons can be entered by the user. Mathematics, Physics, Chemistry and SVT default to French content; separate Arabic/French explanation fields remain available. Lesson titles are not automatically translated. Custom subjects have their own content/explanation language.
- Manual learning workflow: objectives/prerequisites, saved definitions/formulas/examples, exercise, progressive user-authored hints, independent attempt, explicit submission, reveal of a saved correction with its source disclosure, linked mistake/card creation, and scheduled review-session creation. Examination mode hides hints and correction until submission. Correction is never labelled official or machine-verified. Missing answer keys are disclosed.
- Day/week/month planner with manual dates/times, academic deadline priority, completed states, undated records and over-capacity warnings. Capacity is configurable. Optional daily-assistant rules can suggest or, with explicit opt-in, move overdue tasks/sessions within capacity limits.
- Study sessions record actual date, duration, objective and outcome. A completed session cannot be saved without a nonempty outcome and valid duration. Seven-day analytics exclude future sessions, planned sessions and sessions lacking outcomes. Completing a task does not claim mastery.
- Goals/projects/paths connect to tasks, milestones and other records; list and status board views. Detail views derive completed/total counts from linked work. Dependencies, success criteria and risks are manual fields. Ideas convert to projects only on explicit action, preserving identity and links.
- Vocabulary with sentence/context, target language, answer, pronunciation notes and review schedule. No audio analysis or pronunciation evaluation is claimed.
- Spaced repetition: reveal only on action, then self-rate again/hard/good. Again = 1 day; hard = max(1, round(previous interval × 1.2)); good = max(configured first interval, round(previous × 2.2)), capped at 3,650 days. Record history includes actual rating/time/interval. Due dates and review history persist. Among cards with the same due date, repeated forgotten cards come first. No unsolicited conversion of notes into cards.
- Private local journal and research records; evidence, supporting/contradicting observations, uncertainty and source fields. Saved personal content is rendered as text, never raw HTML.
- Weekly review records capture accomplishment, understanding, remaining uncertainty, changes and next action; linked actions can be created explicitly.
- Editable optional profile, explicit profile clearing, learning-time preferences, explanation language and review interval. Supplied school context is the only prefilled personal fact.
- Daily assistant with portable reports, local scheduling, guarded moves, honest server/provider checks and optional server-only Gemini/Composio configuration. Google access requires OAuth and per-service sharing consent. No frontend API-key input. The previous global analytics script has been removed.

## Daily guide / دليل يومي / Guide quotidien

1. Open the dashboard. Choose one realistic task; use capture for ideas you do not want to organize yet.
2. In Education, select a subject and enter the exact lesson title from your notebook or teacher. Add objective, prerequisite and source. For science use French terminology and whichever explanation language helps.
3. If you have an exercise and reliable correction, save them with optional hints. In the detail view attempt the exercise before revealing the correction. Record unresolved errors instead of pretending an answer has been validated.
4. Plan a session at a real date/time. Preserve meals, sleep, commuting and family obligations; reduce the plan if the daily capacity warning appears. Move postponed work manually.
5. Use the timer if useful. It runs only while the dashboard remains mounted and does not save a session automatically. At the end, record actual minutes and what you understood. Mark the session completed only when its actual result is known.
6. Add cards manually from a lesson/note link action. Try recall first, reveal and self-rate. Check difficult cards on their next due date.
7. Save resources with a source, questions and an application. Link related knowledge, goal, project or task rather than duplicating text everywhere.

## Weekly guide / مراجعة أسبوعية / Bilan hebdomadaire

1. Open Progrès et bilan / التقدّم والمراجعة. Review only recorded outcomes and time; they are activity evidence, not mastery scores.
2. Create a weekly review: what you accomplished, understood, still find unclear, and want to change.
3. Check exams and homework before scheduling optional projects. Adjust time to your real energy and constraints.
4. Archive inactive commitments, review goal success metrics, and keep one clear next action on each active project.
5. Review the inbox; explicitly turn an idea into a project only if it deserves a commitment.
6. Export a JSON backup, including your profile, preferences and review history.

## Storage, privacy and recovery

Database: `universal-knowledge-os`, version 1; object store `workspace`, key `current`. A snapshot has schema version, monotonic revision, records, profile and settings. No migration setup is needed on first use. Future schema versions need explicit migrations; unsupported imported versions are rejected.

Writes use a read/write transaction, compare the stored revision, then commit atomically. The UI only reports success after transaction completion. Quota/permission errors leave editor drafts open. A second stale tab cannot overwrite another tab's save: reload after the warning. Loading corrupt data does not replace it with empty data. There is no edit-history log or automatic historical snapshot retention.

Browser data is **not encrypted, synchronized or an account**. Anyone with access to this browser profile or other scripts on the same origin may access it. Use a dedicated private device/profile and a trusted deployment. Do not store passwords, API keys or highly sensitive material. External font loading remains in the existing document; no record contents are included in those requests. Journal records have no public URL or automatic sharing. Exported JSON includes private journal/profile data: protect the file.

Backup procedure:

1. Settings → Export JSON. Keep dated copies outside browser storage; verify the file exists in Downloads.
2. To transfer devices, open the same app on the other device, choose Import JSON, select the backup and confirm the merge.
3. Only valid version-1 snapshots are accepted (15 MB maximum). Titles, types, statuses, languages, safe URLs, dates, durations and review histories are checked. Duplicate IDs and unknown field keys are rejected.
4. Import merges records without overwriting. Identical records are skipped. Conflicting IDs get new UUIDs; links between imported records follow their copied identities. Importing the same conflicted backup repeatedly can create additional copies; inspect before repeating.
5. Profile/settings are preserved during record merge. To restore them too, use the explicit button shown after import; confirm replacement separately. Export current data first.
6. If loading fails, do not clear site data. Keep your backup and original browser profile. The app surfaces the problem rather than silently resetting records. On a fresh browser/profile, import your last valid backup. If you have no backup, recovery from a corrupt or cleared browser database is not guaranteed.
7. Deletion is permanent after confirmation. Restore from backup by merging; deleted records can return as imports. Clearing browser site data removes local records. Switching interface language does not.

## External services and next implementation steps

| Capability | Current status | Next step |
| --- | --- | --- |
| General AI tutor, writing correction and note summaries | Not implemented; daily review has a separate tested Gemini adapter | Authenticated backend with server-held secret, provider validation/health check, rate limits, explicit per-document consent and provenance-labelled output |
| Notion | Not configured | Supported OAuth flow, selected-page scopes, server token storage, revocation and tested import/sync conflict handling |
| Google Drive / Gmail | Read-only Composio adapter implemented; credentials/OAuth not configured | Follow [daily assistant setup](./KNOWLEDGE-BRAIN.md); authorize the owner account and test real reads after deployment |
| Calendar sync | Not configured | OAuth read/write scopes, event mapping and tested two-way conflict rules |
| Multiuser accounts and general cloud sync | Unavailable; optional daily-assistant snapshots have a separate single-owner backend | Auth/authorization, per-user database records, migrations, backup policy and multi-device conflict resolution |
| Local uploads and general document parsing | Not implemented; daily assistant supports bounded Drive PDF/image/text inputs | Validated attachments with size/type checks, durable storage and parser/OCR pipeline; links and pasted text work now |
| Official curriculum, teacher material ingestion | User-authored only | Verified official source/version/date and import/attachment UI; never infer a syllabus from defaults |
| Speech, listening and pronunciation scoring | Unavailable | Audio capture/playback permissions and actual evaluated audio pipeline |
| Intelligent timetable/energy scheduling | Manual planner with capacity warnings | Explicit availability/commitments model and academic-priority scheduling with protected breaks/sleep |
| Automated answer checking, targeted exercises | Manual self-review using saved corrections | Verified answer representation or tested tutor service, confidence/disclaimer policy and pedagogical validation |
| Formula typography/diagrams | Unicode/plain text fields | Mathematical renderer and accessible scientific diagram attachments |
| Notifications | No push or background reminders | Permission-based reminder scheduler and browser/service-worker integration |

Other limits: no multiuser access, fine-grained private/public publishing, drag-and-drop board, full project timeline, budget calculations, dependency enforcement, full progress history, course-file storage, knowledge prerequisite inference, dashboard reordering, offline app-shell caching, or automatic weekly recommendations. Resource/domain-specific displays share a generic record editor. Large workspaces use snapshot writes and linear search; move to indexed per-record queries before very large libraries. Date fields use local calendar days; there is no multi-timezone calendar sync.

## Verification

See [KNOWLEDGE-OS-TEST-REPORT.md](./KNOWLEDGE-OS-TEST-REPORT.md) for the checks actually run, visible evidence, dependency warnings and unverified items.


## Your first week / دروسك هذا الأسبوع / Première semaine

Open `/knowledge/school`. The nine scientific topics supplied in your message and the Aux champs overview are the ten main lessons. Each scientific sheet has French terminology, an Arabic explanation, an example, an exercise and a non-official correction. Compare with the teacher's course. Seven reading scenes are separate linked lessons. [Content provenance and audio instructions](./AUX-CHAMPS-SOURCES.md) document the edition and attribution.

Open `/knowledge/reading` for the complete French story and Arabic translation. Choose parallel, French or Arabic reading independently of the interface language. Numbered scenes preserve their URL (`?scene=1` … `7`). Play the real synthetic Arabic MP3, change speed or download the complete recording and texts. The revision guide opens the editable book overview. “My answer and notes” opens the saved lesson: submit a French practice answer or edit fields. Marking a scene read is self-report; it adds neither study minutes nor mastery. Audio/reference downloads stay fixed when saved content is edited.

The plan proposes nine 25-minute scientific sessions and seven 15-minute reading sessions over seven days from installation. Dates are suggestions, not school or exam dates. Set the start of the remaining plan or edit sessions individually. Moving the plan preserves completed/archived sessions and each remaining session's spacing, time and duration. It does not change unrelated records or the goal deadline, reserve calendar slots or assess energy. Check real commitments first.

The academic goal links to lessons. A second goal/project supports video creation: evaluate a Moroccan-politics video's sources, outline, record/edit and publish manually. **One video per week is a changeable assumption** because no answer arrived to the cadence clarification, not a confirmed preference. Edit the goal to change it. Create later weekly projects explicitly; duplicate project dates are blocked. They reuse saved original task templates, so deliberately deleted templates stay omitted. No video is selected, watched, published or marked completed automatically.

The pack adds requested content once, preserving existing records/profile/preferences. Optional version-1 `installedPacks` metadata survives export/import and prevents deleted lessons from reappearing. Import remains a merge: conflicts preserve both versions with remapped links. A clean browser has no personal results, grades or exam dates. There is no full-year syllabus beyond the supplied lessons; add the next topics progressively.

## Daily assistant

See [KNOWLEDGE-BRAIN.md](./KNOWLEDGE-BRAIN.md) for browser-open review, independent scheduled deployment, Google permissions, actual inspection limits, consent, pause/revocation and encrypted-state backup precautions. Runtime integration paths are implemented; credentials/OAuth/deployment are required before their status can become connected.
