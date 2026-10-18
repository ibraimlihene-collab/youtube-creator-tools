export class EditorApiError extends Error {
  constructor(message, status, unavailable = false) {
    super(message); this.status = status; this.unavailable = unavailable;
  }
}

export async function readEditorResponse(response, ar = false) {
  const offline = ar
    ? 'تعذر الاتصال بخادم التعديل. أعد المحاولة بعد عودة الاتصال؛ صورتك الأصلية محفوظة.'
    : 'The editing server is temporarily unavailable. Retry when the connection returns; your original is safe.';
  let data;
  try { data = await response.json(); }
  catch { throw new EditorApiError(offline, response.status, true); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new EditorApiError(offline, response.status, true);
  if (!response.ok) {
    if (data.code === 'API_UNAVAILABLE') throw new EditorApiError(offline, response.status, true);
    const runwareMessages = {
      RUNWARE_NOT_CONFIGURED: ['Runware is not configured. The site owner must add RUNWARE_API_KEY on the server.', 'لم يتم إعداد Runware. يلزم إضافة مفتاح Runware إلى الخادم.'],
      RUNWARE_AUTH_FAILED: ['Runware rejected the API key. The site owner must check the server key.', 'رفض Runware مفتاح API. على مالك الموقع التحقق من المفتاح على الخادم.'],
      RUNWARE_CREDITS: ['Runware credits are insufficient. The site owner must check the account balance.', 'رصيد Runware غير كافٍ. على مالك الموقع مراجعة رصيد الحساب.'],
      RUNWARE_RATE_LIMITED: ['Runware is temporarily limiting requests. Wait before retrying.', 'يحد Runware الطلبات مؤقتًا. انتظر قبل إعادة المحاولة.'],
      RUNWARE_FAILED: ['Runware could not complete the image edit. Retry or check model access and account configuration.', 'تعذر إكمال التعديل عبر Runware. أعد المحاولة أو تحقق من إتاحة النموذج وإعداد الحساب.'],
      IMAGE_PROVIDER_INVALID: ['The image provider configuration is invalid. Contact the site owner.', 'إعداد مزوّد الصور غير صحيح. تواصل مع مالك الموقع.'],
    };
    if (Object.hasOwn(runwareMessages, data.code)) throw new EditorApiError(runwareMessages[data.code][ar ? 1 : 0], response.status);
    if (response.status === 503) throw new EditorApiError(ar ? 'الذكاء الاصطناعي غير مُهيّأ بعد. يلزم إضافة مفتاح Gemini إلى الخادم.' : 'AI is not configured yet. The site owner needs to add a Gemini API key.', 503);
    if (response.status === 429) {
      if (data.code === 'RATE_LIMIT') throw new EditorApiError(ar
        ? 'بلغت حد طلبات التطبيق لهذه الدقيقة. انتظر دقيقة ثم أعد المحاولة؛ لم يُرسل هذا الطلب إلى Google.'
        : 'You reached the app’s request limit for this minute. Wait one minute and retry; this request was not sent to Google.', 429);
      if (data.code === 'GEMINI_QUOTA_EXCEEDED') throw new EditorApiError(ar
        ? 'رفضت Google الطلب بسبب نفاد حصة مشروع Gemini. على مالك الموقع مراجعة حصة توليد الصور والفوترة في مشروع Google المرتبط بالمفتاح. تغيير المفتاح داخل المشروع نفسه لا يزيد الحصة.'
        : 'Google rejected the request because the Gemini project quota is exhausted. The site owner must check image-generation quota and billing in the Google project linked to the API key. Changing keys within that project does not increase its quota.', 429);
      throw new EditorApiError(ar
        ? 'تحدّ خدمة الذكاء الاصطناعي الطلبات مؤقتًا. انتظر قبل إعادة المحاولة، وإذا استمر الخطأ فتحقّق من حصة Gemini.'
        : 'The AI service is temporarily limiting requests. Wait before retrying; if this continues, check the Gemini quota.', 429);
    }
    throw new EditorApiError(typeof data.error === 'string' ? data.error : ar ? 'فشل الطلب. حاول مرة أخرى.' : 'Request failed. Please try again.', response.status);
  }
  return data;
}
