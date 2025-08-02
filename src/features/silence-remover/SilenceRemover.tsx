import React, { useMemo, useRef, useState } from 'react';
import { FaCut, FaCloudUploadAlt, FaDownload, FaMagic, FaInfoCircle } from 'react-icons/fa';
import ar from '../../locales/ar.json';
import en from '../../locales/en.json';
import { decodeAudio, detectSilentIntervals, removeSilentIntervals, exportToWav } from '../../lib/audioProcessor';
import { extractAudioFromVideo, replaceAudioInVideo } from '../../lib/videoProcessor';
import AudioTimeline from './AudioTimeline';

type SilenceSettings = {
  minSilenceDurationMs: number; // الحد الأدنى لمدة الصمت بالمللي ثانية
  silenceThresholdDb: number;   // العتبة بالديسيبل لاعتبار المقطع صامتاً
  paddingMs: number;            // حواف قبل/بعد القطع لإبقاء سياق بسيط
  autoMode: boolean;            // وضع تلقائي أم مخصص
};

const defaultSettings: SilenceSettings = {
  minSilenceDurationMs: 400,
  silenceThresholdDb: -40,
  paddingMs: 60,
  autoMode: true,
};

const fileAccept = 'audio/*,video/*';

const SilenceRemover: React.FC = () => {
  const lang = useMemo(() => (document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'ar') as 'ar' | 'en', []);
  const t = useMemo(() => (lang === 'ar' ? ar.silenceRemover : en.silenceRemover), [lang]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<SilenceSettings>(defaultSettings);
  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [silentIntervals, setSilentIntervals] = useState<[number, number][]>([]);

  const pushLog = (message: string) => setLog(prev => [...prev, message]);

  const onPickFile = () => {
    inputRef.current?.click();
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    setResultBlob(null);
    setPreviewUrl(null);
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      setAudioBuffer(null);
      setSilentIntervals([]);
      pushLog(`Selected: ${f.name} (${Math.round(f.size / 1024)} KB)`);
    }
  };

  const onReset = () => {
    setFile(null);
    setResultBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSettings(defaultSettings);
    setLog([]);
    setAudioBuffer(null);
    setSilentIntervals([]);
  };

  const onProcess = async () => {
    if (!file) return;
    setProcessing(true);
    pushLog('Starting processing...');
    
    try {
      pushLog('Loading file...');
      const arrayBuffer = await file.arrayBuffer();
      
      let audioBuffer: AudioBuffer;
      let isVideo = file.type.startsWith('video/');
      
      if (isVideo) {
        pushLog('Extracting audio from video...');
        audioBuffer = await extractAudioFromVideo(arrayBuffer);
      } else {
        audioBuffer = await decodeAudio(arrayBuffer);
      }
      
      // Store audio buffer for timeline visualization
      setAudioBuffer(audioBuffer);
      
      pushLog(`Detecting silence with: minSilence=${settings.minSilenceDurationMs}ms, threshold=${settings.silenceThresholdDb}dB, pad=${settings.paddingMs}ms`);
      const silentIntervals = detectSilentIntervals(audioBuffer, {
        minSilenceDuration: settings.minSilenceDurationMs / 1000,
        silenceThreshold: settings.silenceThresholdDb,
        frameDuration: 0.1,
        padding: settings.paddingMs / 1000
      });
      
      pushLog(`Found ${silentIntervals.length} silent interval(s)`);
      setSilentIntervals(silentIntervals);
      
      pushLog('Removing silent segments...');
      
      const processedBuffer = await removeSilentIntervals(audioBuffer, silentIntervals);
      
      pushLog('Exporting to WAV...');
      const wavBuffer = await exportToWav(processedBuffer);
      
      if (isVideo) {
        pushLog('Replacing audio in video...');
        const videoBuffer = await replaceAudioInVideo(arrayBuffer, wavBuffer);
        const blob = new Blob([videoBuffer], { type: file.type });
        setResultBlob(blob);
        pushLog('Done. Ready to download.');
      } else {
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        setResultBlob(blob);
        pushLog('Done. Ready to download.');
      }
    } catch (e) {
      console.error(e);
      pushLog(`Processing failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultBlob) return;
    const a = document.createElement('a');
    const url = URL.createObjectURL(resultBlob);
    a.href = url;
    const ext = file?.name.split('.').pop();
    const base = (file?.name || 'output').replace(/\.[^/.]+$/, '');
    // Set appropriate file extension based on file type
    let fileExt = 'wav';
    if (file?.type.startsWith('video/')) {
      fileExt = ext || 'mp4';
    }
    
    a.download = `${base}_nosilence.${fileExt}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const SettingNumber = ({
    label,
    value,
    min,
    max,
    step,
    onChange,
    unit,
    disabled
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    disabled?: boolean;
    onChange: (n: number) => void;
  }) => (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{label} {unit ? `(${unit})` : ''}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range range-primary"
      />
      <div className="mt-2 flex justify-between items-center">
        <span className="text-sm opacity-70">{min}</span>
        <span className="badge badge-primary badge-sm">{value}{unit ? unit : ''}</span>
        <span className="text-sm opacity-70">{max}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <FaCut />
          </span>
          {t.title}
        </h1>
        <div className="tooltip tooltip-left" data-tip="Runs 100% in your browser - no server needed">
          <FaInfoCircle className="opacity-70" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="lg:col-span-2 space-y-4">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body gap-4">
              <div className="flex flex-wrap gap-2">
                <input
                  ref={inputRef}
                  type="file"
                  accept={fileAccept}
                  className="hidden"
                  onChange={onFileChange}
                />
                <button className="btn btn-outline btn-primary gap-2" onClick={onPickFile}>
                  <FaCloudUploadAlt /> {t.chooseFile}
                </button>
                <button className="btn btn-secondary gap-2" onClick={onProcess} disabled={!file || processing}>
                  <FaMagic /> {t.process}
                </button>
                <button className="btn" onClick={onReset} disabled={processing}>
                  {t.reset}
                </button>
                <button className="btn btn-success gap-2" onClick={download} disabled={!resultBlob}>
                  <FaDownload /> {t.download}
                </button>
              </div>

              {previewUrl && (
                <div className="mt-4 space-y-4">
                  {file?.type.startsWith('audio/') ? (
                    <audio className="w-full" controls src={previewUrl} />
                  ) : (
                    <video className="w-full" controls src={previewUrl} />
                  )}
                  
                  {audioBuffer && (
                    <div className="card bg-base-100 shadow-md">
                      <div className="card-body">
                        <h3 className="card-title text-lg">Audio Timeline</h3>
                        <p className="text-sm opacity-70 mb-2">
                          Silent intervals are highlighted in red. Click on them to see details.
                        </p>
                        <AudioTimeline
                          audioBuffer={audioBuffer}
                          silentIntervals={silentIntervals}
                          onIntervalClick={(start, end) => {
                            pushLog(`Silent interval: ${start.toFixed(2)}s - ${end.toFixed(2)}s (${(end - start).toFixed(2)}s)`);
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs opacity-70 mt-1">{t.previewNote}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">{t.settings}</h2>

              <div className="form-control w-fit">
                <label className="label cursor-pointer">
                  <span className="label-text">{t.autoMode}</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={settings.autoMode}
                    onChange={(e) => setSettings(s => ({ ...s, autoMode: e.target.checked }))}
                  />
                </label>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <SettingNumber
                  label={t.silenceDuration}
                  unit={t.unitMs}
                  min={100}
                  max={2000}
                  step={50}
                  value={settings.minSilenceDurationMs}
                  disabled={settings.autoMode}
                  onChange={(n) => setSettings(s => ({ ...s, minSilenceDurationMs: n }))}
                />
                <SettingNumber
                  label={t.silenceThreshold}
                  unit={t.unitDb}
                  min={-80}
                  max={-10}
                  step={1}
                  value={settings.silenceThresholdDb}
                  disabled={settings.autoMode}
                  onChange={(n) => setSettings(s => ({ ...s, silenceThresholdDb: n }))}
                />
                <SettingNumber
                  label={t.padding}
                  unit={t.unitMs}
                  min={0}
                  max={500}
                  step={10}
                  value={settings.paddingMs}
                  disabled={settings.autoMode}
                  onChange={(n) => setSettings(s => ({ ...s, paddingMs: n }))}
                />
              </div>

              <div className="alert alert-info mt-4">
                <span>{t.autoMode}</span>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">{t.log}</h2>
              <div className="prose max-w-none">
                <ul className="list-disc ms-6">
                  {log.map((l, i) => (<li key={i} className="text-sm opacity-80">{l}</li>))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">Tips</h2>
              <ul className="list-disc ms-6 text-sm opacity-80 space-y-1">
                <li>{t.tip1}</li>
                <li>{t.tip2}</li>
                <li>{t.tip3}</li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">{t.fileStatus}</h2>
              <div className="text-sm opacity-80">
                {file ? (
                  <div>
                    <div>Name: {file.name}</div>
                    <div>Size: {Math.round(file.size / 1024)} KB</div>
                    <div>Type: {file.type || 'Unknown'}</div>
                  </div>
                ) : (
                  <div>{t.noFile}</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SilenceRemover;