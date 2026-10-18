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
