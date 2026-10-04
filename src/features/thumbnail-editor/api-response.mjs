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
    if (response.status === 429) throw new EditorApiError(ar ? 'بلغت طلبات الذكاء الاصطناعي الحد المسموح أو نفدت حصة Gemini. حاول لاحقًا أو تحقّق من الحصة.' : 'The AI request limit or Gemini quota has been reached. Try later or check the quota.', 429);
    throw new EditorApiError(typeof data.error === 'string' ? data.error : ar ? 'فشل الطلب. حاول مرة أخرى.' : 'Request failed. Please try again.', response.status);
  }
  return data;
}
