# Daily goals and weekly skill practice

Open `/knowledge/planner` on the existing Vite/Netlify application. This feature runs locally without Gemini, Composio, server credentials or a new database. It uses the existing IndexedDB snapshot, validation, JSON backup and revision-checked save pipeline. See [the application guide](./KNOWLEDGE-OS.md) for running and deploying the site.

## إعداد الأسبوع / Préparer la semaine

1. افتح **المخطّط**. اختر «استخدام اقتراحات من دروسي» لربط المواد والدروس المحفوظة ومشروع الفيديو، أو أضف مهارة بنفسك. الاقتراحات أهداف قابلة للتعديل، وليست حقائق عن مستواك.
2. حدّد اسم المهارة، نشاطًا محدّدًا، النتيجة المتوقعة، مدة الجلسة من 5 إلى 180 دقيقة، وعدد جلسات أسبوعي من 1 إلى 7. يمكن ربطها بدروس أو أهداف أو مشاريع. تظل لغة هذا المحتوى مستقلة عن لغة الواجهة.
3. راجع أيام الأسبوع في المعاينة. الجلسات الحالية المرتبطة بنفس المصدر تغطي أهدافك بالفعل. لا حاجة لإعادة إنشائها. تظهر أهداف جديدة بخط متقطع قبل الحفظ، وتظهر الفجوات عندما لا يكفي الوقت.
4. راجع ميزانية الوقت في الإعدادات وطاقتك والالتزامات التي لم تدخلها. احفظ الأهداف المقترحة عند ملاءمتها. تظهر الجلسات المحفوظة أيضًا في التقويم، وأهداف اليوم في لوحة البداية.
5. بعد التنفيذ اضغط «تسجيل النتيجة». اكتب ما أنجزته أو فهمته وما يحتاج إلى مراجعة، وأدخل الدقائق الفعلية واختر مكتملة أو جزئية. يمكن تعديل الموعد من تفاصيل الجلسة.
6. في نهاية الأسبوع اضغط «بدء مراجعة الأسبوع». النموذج مرتبط بمهارات الأسبوع. اكتب ما تعلّمته والعوائق والتعديل المناسب للأسبوع المقبل، ثم احفظ المراجعة بعنوان تختاره.

En français : ouvrez **Planificateur**, choisissez vos leçons comme propositions ou ajoutez une compétence. Définissez une activité, un résultat observable, une durée et une fréquence. Vérifiez la répartition avant de l’enregistrer. Après chaque séance, saisissez son résultat et ses minutes réelles. Le bilan hebdomadaire reste une réflexion personnelle, pas une note de maîtrise automatique.

## Allocation rules

- Weeks run Monday to Sunday in the browser's calendar timezone, consistent with the existing planner. The independent daily assistant has its own configured timezone.
- Only today and future days of the selected week can receive new goals. A partial current week can leave targets uncovered.
- Active skill paths supply their explicit frequency. School priorities consume available capacity before optional priorities. Within each group, one round per skill precedes another round. A skill receives at most one new session per day.
- Dated tasks, sessions, homework, exams and milestones reserve time. Completed work still counts as time spent. Missing durations reserve 25 minutes. A 10-minute gap is reserved between blocks. The feature never changes fixed deadlines.
- Optional skill practice waits until after the last unfinished exam within the planning horizon. This can leave an optional target uncovered for the week.
- The allocator first prefers days with fewer generated goals, then lower existing load. It leaves goals unallocated when they exceed capacity. It never silently increases the time budget or reduces the requested duration.
- New goals are untimed. This is a daily budget proposal, not a full timetable or an assessment of energy. Assign real times in the session editor when appropriate. Meals, commute, sleep and responsibilities must be reflected in the budget and saved commitments.
- Existing sessions linked to the skill or its selected source count toward coverage. They are displayed without modifying their titles, dates, contents or outcomes. Paused/blocked/waiting sessions reserve time conservatively but do not satisfy new target allocation.
- Regeneration preserves records. Each generated session has a stable origin slot per skill, week and occurrence. Moving it, editing its title, completing it or archiving it does not create a replacement for that slot. An explicit deletion can make that slot available again. A moved session in another week also counts toward that week's coverage.
- A week with too few targets can have days without skill practice. Those days remain available for rest or other commitments. The site does not invent filler work or promise that every possible skill improves every week.

## Records and backup

Skills are ordinary `path` records with the `weekly-skill` tag. `objective` stores the action, `metric` the expected evidence, `duration` the block length and `weekly-target:N` the weekly frequency. `weekly-academic` or a subject identifies school priorities. Links point to actual saved source records. These are goals, not proficiency assessments.

Generated goals are ordinary `session` records linked to their skill and selected source. They carry `weekly-daily-goal` and `weekly-slot:YYYY-MM-DD:N` tags. Existing school sessions require no new tags or migrations. New weekly records do not contain secrets or trigger network requests.

The dedicated editor checks required action/evidence and bounded integer duration/frequency. A generic learning-path edit can invalidate reserved tags or fields. Such a path produces a visible configuration warning rather than invented goals. Archiving a skill requires confirmation and preserves existing sessions and results; restore its active status in **Goals** to resume planning.

Use Settings → JSON export regularly. Import validates the whole snapshot and uses the existing non-destructive merge. Identical records are not added again. Conflicting records become distinct copies, and copied links follow copied identities. Inspect copies after a conflict import before planning further. Preferences and profile restoration remain a separate explicit step.

Browser storage is device/profile/origin specific and can be cleared by the browser. There is no automatic cross-device synchronization or backup. Store the exported file somewhere you control.

## What the numbers mean

The weekly view shows the requested frequency, saved sessions and completed sessions with a nonempty outcome. A partial session retains its actual result but is not counted as a completed session. The existing analytics counts actual minutes only for completed sessions with recorded outcomes. No skill level, grade, streak, mastery or improvement score is inferred.

Outcome entry requires actual integer minutes, a written result and a session date no later than today. Existing notes about uncertainty or future practice belong in the result or linked review. The application does not independently verify the truth of a self-reported outcome.

## Limits and verification

The user explicitly saves each week's proposal. This feature does not run a closed-browser job or autonomously create new weeks. Existing daily-assistant rescheduling remains a separate optional workflow. It can move dated sessions according to its own explicit rules without changing their origin-slot tags.

Tests in `src/knowledge/weekly.test.mjs` exercise allocation, school-session reuse, capacity and breaks, exam protection, stable regeneration, moved sessions, malformed skills, actual outcomes, IndexedDB persistence, backup/merge and bilingual dictionary parity. Server-side preview captures verify real controls, Arabic RTL, French LTR, mobile/dark layout and reload persistence. Native archive confirmations and browser file import/export dialogs are inspected and unit-tested where applicable, not certified end to end. See [the test report](./KNOWLEDGE-OS-TEST-REPORT.md).
