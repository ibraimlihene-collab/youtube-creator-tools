import { addDays, makeEntry, today, type Entry, type Workspace } from './model';
import { bookSource, bookRevisionFr, bookRevisionAr, readingSections } from './auxChampsContent';

export const schoolPackId = 'school-first-week-2026-10-20-v1';
export const studyGoalId = 'school-week-goal';
export const videoGoalId = 'school-video-goal';
export const bookLessonId = 'school-aux-champs';
export const videoProjectId = 'school-video-project';
export const lessonSheets = [
  {
    id: 'gravitation',
    subject: 'physics',
    title: 'La gravitation universelle',
    objective:
      'Décrire l’attraction entre deux corps et utiliser la loi de Newton dans un cas simple.',
    definition:
      'Deux corps de masses m₁ et m₂ s’attirent. Dans le modèle de corps ponctuels, F = G m₁ m₂ / d², où d est la distance entre leurs centres.',
    formula: 'F = G × m₁ × m₂ / d² ; F en N, masses en kg, d en m ; G ≈ 6,67 × 10⁻¹¹ N·m²·kg⁻².',
    ar: 'التجاذب الكوني قوة جذب متبادلة بين جسمين لهما كتلة. تزيد القوة بزيادة إحدى الكتلتين، وتقل كلما زادت المسافة بين مركزيهما. هذا النموذج لا يجعل القوة الكهربائية أو المغناطيسية نوعًا من الجاذبية.',
    example:
      'À masses constantes, si la distance entre les centres est doublée, la force devient F/4.',
    exercise:
      'La force entre deux corps vaut 12 N. Que devient-elle si leur distance est triplée, à masses constantes ?',
    solution: 'F′ = F/3² = 12/9 ≈ 1,33 N. Le facteur porte sur la distance au carré.',
    hints: 'Comparer les distances avant et après.\nLa force est inversement proportionnelle à d².',
  },
  {
    id: 'actions',
    subject: 'physics',
    title: 'Exemples d’actions mécaniques',
    objective: 'Identifier le système étudié, l’acteur et les effets d’une action mécanique.',
    definition:
      'Une action mécanique peut modifier le mouvement d’un système ou le déformer. On distingue notamment les actions de contact et les actions à distance.',
    formula:
      'Une force se représente par un vecteur : point d’application, direction, sens, intensité en newtons (N).',
    ar: 'ابدأ بتحديد الجسم الذي تدرسه، ثم الجسم الذي يؤثر عليه. لمس اليد للكرة تأثير بالتماس، أما جذب الأرض للكرة فتأثير عن بُعد. لا يعني سكون الجسم غياب القوى؛ فقد تتوازن تأثيراتها.',
    example:
      'Système : un livre immobile sur une table. La Terre exerce son poids à distance ; la table exerce une action de contact.',
    exercise:
      'Pour un ballon frappé par le pied, préciser le système, l’acteur, le type d’action et un effet possible.',
    solution:
      'Système : ballon ; acteur : pied ; action de contact ; modification de la vitesse et/ou de la direction, avec une déformation possible.',
    hints: 'Le système est le corps dont on décrit le mouvement.\nLe pied touche-t-il le ballon ?',
  },
  {
    id: 'especes',
    subject: 'chemistry',
    title: 'Les espèces chimiques',
    objective: 'Distinguer espèce chimique, corps pur et mélange.',
    definition:
      'Une espèce chimique est un ensemble d’entités chimiques identiques (atomes, molécules, ions…). Un corps pur contient une seule espèce chimique ; un mélange en contient plusieurs.',
    formula: 'Exemples : eau H₂O ; dioxygène O₂ ; ion sodium Na⁺.',
    ar: 'النوع الكيميائي مجموعة من الكيانات الكيميائية المتماثلة. الماء النقي نوع واحد، أما ماء البحر فخليط يضم الماء وأملاحًا مذابة. لا تكفي شفافية مادة للحكم بأنها نقية.',
    example:
      'L’eau distillée est modélisée comme un corps pur ; de l’eau sucrée est un mélange homogène.',
    exercise: 'Classer le dioxygène pur, l’air et l’eau salée : corps purs ou mélanges. Justifier.',
    solution:
      'Dioxygène pur : une seule espèce, corps pur. Air : plusieurs espèces gazeuses, mélange. Eau salée : eau et espèces dissoutes, mélange.',
    hints:
      'Compter les espèces chimiques, pas les états physiques.\nUn mélange peut être transparent et homogène.',
  },
  {
    id: 'extraction',
    subject: 'chemistry',
    title: 'Extraction et identification des espèces chimiques',
    objective: 'Distinguer isoler une espèce d’un mélange et identifier une espèce.',
    definition:
      'Une extraction sépare une espèce d’un mélange en utilisant une propriété physique. Une identification compare des propriétés ou des résultats de tests à des références dans des conditions précisées.',
    formula:
      'Extraction : solubilité, filtration, distillation selon le mélange. Identification : tests adaptés, températures caractéristiques ou chromatographie avec témoins.',
    ar: 'الاستخراج يهدف إلى فصل مادة، والتعرّف يهدف إلى تحديد هويتها اعتمادًا على دلائل. في الاستشراب تُقارَن بقع العينة بمواد مرجعية في الشروط نفسها؛ تشابه بقعة واحدة قرينة لا يثبت نقاء العينة وحده. لا تنفّذ تجارب بمذيبات دون إشراف ووسائل حماية.',
    example:
      'On extrait des composés colorés d’une feuille avec un solvant adapté, puis on compare leur chromatogramme à des témoins. Cet exemple est théorique, pas une observation réalisée.',
    exercise:
      'Pourquoi une filtration seule ne permet-elle pas de séparer du sel dissous dans l’eau ?',
    solution:
      'Le sel dissous traverse le filtre avec l’eau. La filtration retient des particules solides non dissoutes ; une autre technique adaptée est nécessaire.',
    hints:
      'Dissous ne signifie pas déposé au fond.\nQuel type de particules le filtre retient-il ?',
  },
  {
    id: 'synthese',
    subject: 'chemistry',
    title: 'Synthèse d’une espèce chimique',
    objective:
      'Distinguer synthèse, extraction et identification ; reconnaître réactifs et produits.',
    definition:
      'Une synthèse chimique produit une espèce chimique à partir de réactifs par transformation chimique. Le produit obtenu doit ensuite être séparé, éventuellement purifié et identifié.',
    formula:
      'Réactifs → produits ; l’équation respecte la conservation des éléments et de la charge.',
    ar: 'في التركيب الكيميائي نحصل على نوع كيميائي عبر تفاعل مواد أولية. يختلف ذلك عن استخراج مادة موجودة أصلًا في خليط. لا تعني كلمة «اصطناعي» وحدها أن المادة ضارة، ولا تعني كلمة «طبيعي» أنها آمنة.',
    example:
      'Une préparation d’un arôme par réaction chimique est une synthèse ; isoler une substance déjà présente dans une plante est une extraction. Exemple conceptuel sans protocole à réaliser.',
    exercise:
      'Un produit est obtenu par réaction puis filtré. La filtration prouve-t-elle son identité et sa pureté ? Expliquer.',
    solution:
      'Non. La filtration est une séparation. L’identité et la pureté nécessitent des contrôles adaptés, comparés à des références.',
    hints: 'Séparer une substance et déterminer son identité sont deux opérations distinctes.',
  },
  {
    id: 'arithmetique',
    subject: 'math',
    title: 'Ensemble des nombres entiers naturels et notions en arithmétique',
    objective:
      'Reconnaître les entiers naturels ; utiliser divisibilité, multiples et nombres premiers.',
    definition:
      'Avec la convention utilisée ici, ℕ = {0, 1, 2, 3, …}. Un entier a divise b s’il existe un entier naturel k tel que b = a × k. Un nombre premier est un entier ≥ 2 qui possède exactement deux diviseurs positifs.',
    formula: 'b = a × k ; 1 n’est pas premier ; 2 est le seul nombre premier pair.',
    ar: 'الأعداد الطبيعية هنا تشمل الصفر؛ راجع اصطلاح أستاذك. العدد ٣ يقسم ١٢ لأن ١٢ = ٣ × ٤. العدد الأولي أكبر من ١ وله قاسمان موجبان فقط: ١ ونفسه. العدد ١ ليس أوليًا.',
    example: '18 = 2 × 3². Ses diviseurs positifs sont 1, 2, 3, 6, 9, 18.',
    exercise: 'Décomposer 60 en facteurs premiers, puis déterminer le PGCD de 18 et 60.',
    solution:
      '60 = 2² × 3 × 5 et 18 = 2 × 3². Facteurs communs avec exposants minimaux : PGCD(18, 60) = 2 × 3 = 6.',
    hints:
      'Commencer la décomposition de 60 par 2.\nPour le PGCD, prendre les facteurs communs avec le plus petit exposant.',
  },
  {
    id: 'vecteurs',
    subject: 'math',
    title: 'Calcul vectoriel dans le plan',
    objective: 'Utiliser les coordonnées, la relation de Chasles et la somme de vecteurs.',
    definition:
      'Un vecteur est caractérisé par sa direction, son sens et sa norme. Dans un repère, si A(xA ; yA) et B(xB ; yB), les coordonnées du vecteur AB sont (xB − xA ; yB − yA).',
    formula: 'AB⃗ + BC⃗ = AC⃗ ; (a ; b) + (c ; d) = (a + c ; b + d).',
    ar: 'المتجه يصف انتقالًا وله اتجاه ومنحى وطول. لحساب المتجه من أ إلى ب نطرح إحداثيات نقطة البداية من إحداثيات نقطة النهاية. في علاقة شال، الانتقال من أ إلى ب ثم من ب إلى ج يساوي الانتقال من أ إلى ج.',
    example: 'A(1 ; 2), B(4 ; 6) : AB⃗ = (3 ; 4). Le vecteur BA⃗ = (−3 ; −4).',
    exercise: 'A(−1 ; 2), B(3 ; 5), C(2 ; −1). Calculer AB⃗, BC⃗ puis vérifier Chasles.',
    solution:
      'AB⃗ = (4 ; 3), BC⃗ = (−1 ; −6), donc AB⃗ + BC⃗ = (3 ; −3). Or AC⃗ = (2 − (−1) ; −1 − 2) = (3 ; −3).',
    hints:
      'Coordonnées de l’arrivée moins coordonnées du départ.\nAdditionner séparément les deux composantes.',
  },
  {
    id: 'ecologie',
    subject: 'svt',
    title: 'Écologie : science de l’environnement',
    objective:
      'Définir écosystème, biotope, biocénose et distinguer observation et interprétation.',
    definition:
      'L’écologie étudie les relations des êtres vivants entre eux et avec leur environnement. Un écosystème comprend un milieu (biotope), les êtres vivants qui l’occupent (biocénose) et leurs interactions.',
    formula: 'Écosystème : biotope + biocénose + interactions.',
    ar: 'علم البيئة يدرس علاقات الكائنات الحية بعضها ببعض وعلاقاتها بالوسط. في بركة مثلًا، الماء والحرارة من مكوّنات الوسط، والنباتات والحيوانات من الكائنات الحية. ملاحظة وجود نبات في تربة رطبة لا تثبت وحدها أن الرطوبة هي السبب الوحيد لوجوده.',
    example:
      'Observation : davantage de mousses dans une zone ombragée. Hypothèses : humidité, lumière ou autres facteurs ; il faut les distinguer et les tester.',
    exercise:
      'Dans une mare, classer eau, température, algues et grenouilles entre biotope et biocénose.',
    solution:
      'Biotope : eau et température. Biocénose : algues et grenouilles. L’eau a aussi une composition chimique et le milieu comprend d’autres facteurs.',
    hints:
      'Le biotope décrit le milieu et ses facteurs abiotiques.\nLa biocénose regroupe les êtres vivants.',
  },
  {
    id: 'sol',
    subject: 'svt',
    title: 'Les facteurs édaphiques et leurs relations avec les êtres vivants',
    objective: 'Identifier des propriétés du sol et discuter leur relation avec les êtres vivants.',
    definition:
      'Les facteurs édaphiques sont les caractéristiques du sol qui influencent les êtres vivants : texture, structure, eau, aération, pH, sels minéraux et matière organique, notamment.',
    formula: 'Identifier → Observer → Décrire → Interpréter → Conclure.',
    ar: 'العوامل الترابية هي خصائص التربة المؤثرة في الأحياء. حجم الحبيبات يؤثر في احتفاظ التربة بالماء وتهويتها؛ كما تؤثر الحموضة والمادة العضوية. وتغيّر الكائنات الحية التربة بدورها، مثل دور المحللات وديدان الأرض. العلاقة متبادلة وليست في اتجاه واحد.',
    example:
      'Deux plantes sont comparées dans des sols différents. On décrit les résultats avant de proposer un rôle du pH ; les autres facteurs doivent être contrôlés.',
    exercise:
      'Deux lots reçoivent la même lumière mais des quantités d’eau différentes et des sols de pH différents. Peut-on attribuer une différence de croissance au seul pH ?',
    solution:
      'Non : eau et pH changent à la fois. Il faut contrôler les autres paramètres et faire varier le facteur étudié pour mieux étayer la conclusion.',
    hints:
      'Combien de facteurs changent simultanément ?\nUne association observée ne suffit pas à isoler une cause.',
  },
];

export const primaryLessonIds = [...lessonSheets.map((s) => `school-lesson-${s.id}`), bookLessonId];

function record(
  id: string,
  kind: Entry['kind'],
  title: string,
  fields: Entry['fields'],
  content = '',
  language = 'fr',
): Entry {
  return {
    ...makeEntry(kind, language),
    id,
    title,
    content,
    fields,
    tags: ['دروسي', 'Première semaine'],
    status: 'next',
  };
}

export function buildSchoolRecords(start = today()): Entry[] {
  const records: Entry[] = lessonSheets.map((s) => ({
    ...record(
      `school-lesson-${s.id}`,
      'lesson',
      s.title,
      {
        subject: s.subject,
        objective: s.objective,
        definition: s.definition,
        formula: s.formula,
        explanationAr: s.ar,
        explanationFr: s.definition,
        explanationLanguage: 'ar',
        example: s.example,
        exercise: s.exercise,
        solution: s.solution,
        hints: s.hints,
        source:
          'Titres communiqués par vous ; fiche pédagogique préparée pour cette application, à vérifier avec votre cours. Pas un programme officiel ni une correction officielle.',
        nextAction: 'Lire le cours du professeur, tenter l’exercice puis comparer la démarche.',
      },
      s.definition,
    ),
    links: [studyGoalId],
  }));
  records.push({
    ...record(
      bookLessonId,
      'lesson',
      'Aux champs — Guy de Maupassant',
      {
        subject: 'french',
        author: 'Guy de Maupassant',
        url: bookSource,
        objective:
          'Lire la nouvelle scène par scène, comprendre les choix des familles et justifier une interprétation en français.',
        definition:
          'Une nouvelle réaliste, et non un roman. Texte publié en 1882, repris dans Contes de la bécasse (1883).',
        explanationAr: bookRevisionAr,
        explanationLanguage: 'ar',
        source:
          'Texte intégral : Project Gutenberg, eBook 11714 ; recoupé sur maupassant.free.fr le 20 octobre 2026. Traduction et questions pédagogiques préparées pour cette application, non officielles.',
        nextAction: 'Ouvrir la lecture bilingue, lire la scène 1, puis répondre en français.',
      },
      bookRevisionFr,
    ),
    links: [studyGoalId, ...readingSections.map((s) => s.id)],
  });
  for (const section of readingSections)
    records.push({
      ...record(
        section.id,
        'lesson',
        `Aux champs — ${section.titleFr}`,
        {
          subject: 'french',
          chapter: 'Aux champs',
          author: 'Guy de Maupassant',
          explanationAr: section.translation,
          explanationLanguage: 'ar',
          url: bookSource,
          exercise: section.questionFr,
          objective: section.questionFr,
          source:
            'Texte intégral du domaine public ; traduction arabe pédagogique préparée pour l’application. Découpage en scènes non original.',
        },
        section.original,
      ),
      links: [bookLessonId],
    });
  records.push({
    ...record(
      studyGoalId,
      'goal',
      'دراسة الدروس الأولى لهذا الأسبوع',
      {
        why: 'هذه الدروس أرسلتها بوصفها أولويات هذا الأسبوع، مع التحضير لفهم Aux champs قبل الامتحان دون اختراع موعد له.',
        metric:
          'فهم الدروس العشرة الأساسية، محاولة التمارين، وتدوين ما بقي غامضًا. إكمال القراءة لا يعني الإتقان.',
        date: addDays(start, 6),
        priority: 'high',
        nextAction: 'ابدأ بجلسة واحدة وعدّل المدة حسب وقتك الحقيقي.',
        source: 'الأولويات من طلبك؛ التواريخ والمدد مقترحات قابلة للتعديل وليست مواعيد امتحانات.',
      },
      '',
      'ar',
    ),
    links: primaryLessonIds,
  });
  const order = [0, 5, 2, 6, 1, 7, 3, 8, 4];
  for (let i = 0; i < order.length; i++) {
    const s = lessonSheets[order[i]];
    records.push({
      ...record(`school-session-${s.id}`, 'session', s.title, {
        subject: s.subject,
        date: addDays(start, Math.floor(i / 2)),
        duration: '25',
        objective: s.objective,
        priority: 'high',
        procedure: 'Comprendre → exemple → tentative personnelle → correction → question à revoir.',
        source: 'Créneau proposé à partir de la demande ; horaire non fixé, à adapter.',
      }),
      links: [`school-lesson-${s.id}`, studyGoalId],
    });
  }
  for (let i = 0; i < readingSections.length; i++) {
    const section = readingSections[i];
    records.push({
      ...record(`school-session-reading-${i + 1}`, 'session', `Aux champs — ${section.titleFr}`, {
        subject: 'french',
        date: addDays(start, i),
        duration: '15',
        priority: 'high',
        objective: section.questionFr,
        procedure:
          'Lire en français, comparer la traduction arabe, écouter si utile, puis formuler une réponse personnelle en français.',
        source:
          'Proposition de lecture quotidienne ; ne constitue pas une échéance scolaire confirmée.',
      }),
      links: [section.id, studyGoalId],
    });
  }
  records.push({
    ...record(
      videoGoalId,
      'goal',
      'نشر فيديو واحد كل أسبوع',
      {
        metric: 'فيديو واحد منشور كل أسبوع؛ الوتيرة قابلة للتعديل.',
        why: 'تطوير صناعة المحتوى مع الحفاظ على أولوية الدراسة.',
        priority: 'normal',
        nextAction: 'اختيار فكرة قابلة للتنفيذ في الوقت المتاح بعد الدراسة.',
        source:
          'طلبك يتضمن وتيرة غير واضحة؛ استُخدم افتراض فيديو واحد أسبوعيًا لعدم ورود جواب عن سؤال التوضيح.',
      },
      '',
      'ar',
    ),
    links: [videoProjectId],
  });
  records.push({
    ...record(
      videoProjectId,
      'project',
      'فيديو هذا الأسبوع',
      {
        date: start,
        scope: 'فيديو واحد قصير بخطوات واضحة، مع إمكانية تأجيله إذا تزاحمت الدراسة.',
        deliverable: 'رابط الفيديو المنشور فعليًا، دون نشر آلي من التطبيق.',
        nextAction: 'اختيار موضوع ثم كتابة مخطط موجز.',
      },
      '',
      'ar',
    ),
    links: [videoGoalId],
  });
  const videoSteps = [
    [
      'watch',
      'مشاهدة فيديو عن سياسة المغرب وتقييم مصادره',
      'تدوين عنوان الفيديو ورابطه وصاحبه وتاريخه؛ فصل الوقائع عن الآراء والادعاءات. لا يوجد فيديو مختار أو مصدر مزعوم مسبقًا.',
    ],
    [
      'outline',
      'اختيار الفكرة وكتابة مخطط الفيديو',
      'حدّد سؤالًا واحدًا وجمهورًا واضحًا، وتحقق من المعلومات قبل كتابة النص.',
    ],
    ['produce', 'تسجيل الفيديو ومونتاجه', 'أنجز نسخة مناسبة لوقتك دون التضحية بواجباتك ونومك.'],
    [
      'publish',
      'مراجعة الفيديو ونشره',
      'راجع الحقوق والمعلومات ثم انشر بنفسك وسجّل الرابط. لا يُسجّل إنجاز قبل النشر الفعلي.',
    ],
  ];
  for (const [slug, title, content] of videoSteps)
    records.push({
      ...record(
        `school-video-${slug}`,
        'task',
        title,
        { priority: 'low', nextAction: content },
        content,
        'ar',
      ),
      links: [videoProjectId, videoGoalId],
    });
  return records;
}

export function installSchoolPack(workspace: Workspace, start = today()): Workspace {
  if (workspace.installedPacks?.includes(schoolPackId)) return workspace;
  // Import only missing identities; never overwrite edited records or refill deleted lessons.
  const existing = new Set(workspace.records.map((entry) => entry.id));
  return {
    ...workspace,
    records: [
      ...workspace.records,
      ...buildSchoolRecords(start).filter((entry) => !existing.has(entry.id)),
    ],
    installedPacks: [...(workspace.installedPacks || []), schoolPackId],
  };
}

const movableSession = (entry: Entry) =>
  entry.kind === 'session' &&
  entry.id.startsWith('school-session-') &&
  !!entry.fields.date &&
  !['completed', 'archived'].includes(entry.status);

export function schoolPlanStart(records: Entry[]): string {
  return (
    records
      .filter(movableSession)
      .map((entry) => entry.fields.date)
      .sort()[0] || ''
  );
}

export function shiftSchoolPlan(workspace: Workspace, start: string): Workspace {
  const anchor = schoolPlanStart(workspace.records);
  if (
    !anchor ||
    !/^\d{4}-\d{2}-\d{2}$/.test(start) ||
    !Number.isFinite(Date.parse(`${start}T12:00:00Z`))
  )
    return workspace;
  const offset = Math.round(
    (Date.parse(`${start}T12:00:00Z`) - Date.parse(`${anchor}T12:00:00Z`)) / 86400000,
  );
  if (!offset) return workspace;
  return {
    ...workspace,
    records: workspace.records.map((entry) =>
      movableSession(entry)
        ? {
            ...entry,
            fields: { ...entry.fields, date: addDays(entry.fields.date, offset) },
            updatedAt: new Date().toISOString(),
          }
        : entry,
    ),
  };
}
