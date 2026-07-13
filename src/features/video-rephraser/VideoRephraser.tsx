import { useState, useCallback } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useAI } from '../../lib/useAI';
import ApiKeyInput from '../../components/ApiKeyInput';
import CopyButton from '../../components/CopyButton';
import OtherTools from '../../components/shared/OtherTools';
import ToolFooter from '../../components/shared/ToolFooter';

interface VideoRephraserProps {
  t?: Record<string, any>;
}

const isYouTubeUrl = (url: string) =>
  /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url);

const VideoRephraser = ({ t }: VideoRephraserProps) => {
  const [apiKey, setApiKey] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [scriptInput, setScriptInput] = useState('');
  const [mode, setMode] = useState<'url' | 'text'>('text');
  const [originalScript, setOriginalScript] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const { data: rephrasedScript, isLoading, error, generate, reset } = useAI<string>();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleProcess = useCallback(async () => {
    setLocalError(null);
    reset();

    if (!apiKey) {
      setLocalError(t?.videoRephraser?.missingFields || 'Please provide an API key.');
      return;
    }

    if (mode === 'text') {
      if (!scriptInput.trim()) {
        setLocalError(t?.videoRephraser?.missingScript || 'Paste a script to rephrase.');
        return;
      }
      setOriginalScript(scriptInput);
      setStatus(t?.videoRephraser?.rephrasing || 'Rephrasing…');
      await generate(
        apiKey,
        `Rephrase the following YouTube script. Keep the core meaning, improve clarity and engagement, keep a spoken YouTube style.\n\n${scriptInput}`,
        'gemini-2.5-flash',
        (text) => text
      );
      setStatus(null);
      return;
    }

    if (!videoUrl || !isYouTubeUrl(videoUrl)) {
      setLocalError(t?.videoRephraser?.invalidUrl || 'Please provide a valid YouTube URL.');
      return;
    }

    setOriginalScript('');
    setStatus(t?.videoRephraser?.transcribing || 'Transcribing video…');

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const transcribeResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { fileData: { fileUri: videoUrl } },
              {
                text: 'Transcribe the speech in this YouTube video. Return only the transcript text.',
              },
            ],
          },
        ],
      });

      const transcription =
        transcribeResp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (!transcription) {
        throw new Error(
          t?.videoRephraser?.transcribeFailed ||
            'Failed to transcribe video. The video may not be publicly accessible.'
        );
      }

      setOriginalScript(transcription);
      setStatus(t?.videoRephraser?.rephrasing || 'Rephrasing…');

      await generate(
        apiKey,
        `Rephrase the following transcript. Keep the core meaning but change wording and structure for a fresh YouTube script.\n\n${transcription}`,
        'gemini-2.5-flash',
        (text) => text
      );
    } catch (e: any) {
      setLocalError(e?.message || 'Something went wrong.');
    } finally {
      setStatus(null);
    }
  }, [apiKey, videoUrl, scriptInput, mode, generate, reset, t]);

  const busy = isLoading || !!status;
  const errMsg = localError || error?.message;

  return (
    <div className="space-y-5">
      <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} t={t} />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`btn btn-sm ${mode === 'text' ? 'btn-brand' : 'btn-soft'}`}
          onClick={() => setMode('text')}
        >
          {t?.videoRephraser?.textMode || 'Paste script'}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${mode === 'url' ? 'btn-brand' : 'btn-soft'}`}
          onClick={() => setMode('url')}
        >
          {t?.videoRephraser?.urlMode || 'YouTube URL'}
        </button>
      </div>

      {mode === 'url' ? (
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-medium">
              {t?.videoRephraser?.urlLabel || 'YouTube Video URL'}
            </span>
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={
              t?.videoRephraser?.urlPlaceholder ||
              'Enter YouTube Video URL (public/unlisted)'
            }
            className="input-modern"
          />
          <p className="text-xs text-base-content/50 mt-1">
            {t?.videoRephraser?.urlHint ||
              'Works best with public videos. If transcription fails, switch to Paste script.'}
          </p>
        </div>
      ) : (
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-medium">
              {t?.videoRephraser?.scriptLabel || 'Original script'}
            </span>
          </label>
          <textarea
            value={scriptInput}
            onChange={(e) => setScriptInput(e.target.value)}
            placeholder={
              t?.videoRephraser?.scriptPlaceholder ||
              'Paste your video script or transcript here…'
            }
            className="textarea-modern min-h-[160px]"
          />
        </div>
      )}

      <button
        className="btn-brand gap-2"
        onClick={handleProcess}
        disabled={
          busy ||
          !apiKey ||
          (mode === 'url' ? !videoUrl : !scriptInput.trim())
        }
      >
        {busy ? (
          <>
            <span className="loading loading-spinner loading-sm" />
            {status || t?.videoRephraser?.processing || 'Processing...'}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {t?.videoRephraser?.process || 'Rephrase'}
          </>
        )}
      </button>

      {errMsg && (
        <div className="alert alert-error text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errMsg}</span>
        </div>
      )}

      {(originalScript || rephrasedScript) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="surface-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {t?.videoRephraser?.original || 'Original'}
              </h3>
              {originalScript && (
                <CopyButton
                  text={originalScript}
                  label={t?.common?.copy || 'Copy'}
                  copiedLabel={t?.common?.copied || 'Copied!'}
                />
              )}
            </div>
            <textarea
              value={originalScript}
              readOnly
              className="textarea-modern w-full min-h-[220px] text-sm"
              placeholder="Original script will appear here…"
            />
          </div>
          <div className="surface-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {t?.videoRephraser?.rephrased || 'Rephrased'}
              </h3>
              {rephrasedScript && (
                <CopyButton
                  text={rephrasedScript}
                  label={t?.common?.copy || 'Copy'}
                  copiedLabel={t?.common?.copied || 'Copied!'}
                  variant="brand"
                />
              )}
            </div>
            <textarea
              value={rephrasedScript || ''}
              readOnly
              className="textarea-modern w-full min-h-[220px] text-sm"
              placeholder="Rephrased script will appear here…"
            />
          </div>
        </div>
      )}

      <OtherTools currentTool="videoRephraser" t={t} />
      <ToolFooter t={t} />
    </div>
  );
};

export default VideoRephraser;
