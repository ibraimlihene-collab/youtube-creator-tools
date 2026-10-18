import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaCut, FaCloudUploadAlt, FaDownload, FaMagic, FaInfoCircle } from 'react-icons/fa';
import ar from '../../locales/ar.json';
import en from '../../locales/en.json';
import { decodeAudio, detectSilentIntervals, removeSilentIntervals, exportToWav } from '../../lib/audioProcessor';
import { extractAudioFromVideo, replaceAudioInVideo } from '../../lib/videoProcessor';
import AudioTimeline from './AudioTimeline';
import SmartAudioPlayer from './SmartAudioPlayer';

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
  const [analyzing, setAnalyzing] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [silentIntervals, setSilentIntervals] = useState<[number, number][]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const pushLog = useCallback((message: string) => {
    setLog(prev => [...prev, message]);
  }, []);

  const onPickFile = () => {
    inputRef.current?.click();
  };

  const analyzeAudio = async (file: File) => {
    setAnalyzing(true);
    pushLog('Analyzing audio...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      let audioBuffer: AudioBuffer;
      if (file.type.startsWith('video/')) {
        pushLog('Extracting audio from video for analysis...');
        audioBuffer = await extractAudioFromVideo(arrayBuffer);
      } else {
        audioBuffer = await decodeAudio(arrayBuffer);
      }
      setAudioBuffer(audioBuffer);
      pushLog('Audio analysis complete.');
      
      // Calculate initial silent intervals with current settings
      const initialSilentIntervals = detectSilentIntervals(audioBuffer, {
        minSilenceDuration: settings.minSilenceDurationMs / 1000,
        silenceThreshold: settings.silenceThresholdDb,
        frameDuration: 0.1,
        padding: settings.paddingMs / 1000
      });
      setSilentIntervals(initialSilentIntervals);
      pushLog(`Found ${initialSilentIntervals.length} silent interval(s) for preview.`);
    } catch (e) {
      console.error(e);
      pushLog(`Audio analysis failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    setResultBlob(null);
    setPreviewUrl(null);
    setAudioBuffer(null);
    setSilentIntervals([]);
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      pushLog(`Selected: ${f.name} (${Math.round(f.size / 1024)} KB)`);
      // Start audio analysis immediately
      analyzeAudio(f);
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
    if (!file || !audioBuffer) return;
    setProcessing(true);
    pushLog('Starting processing...');
    
    try {
      // Use the already analyzed audioBuffer
      const audioBufferToProcess = audioBuffer;
      const isVideo = file.type.startsWith('video/');
      
      pushLog(`Detecting silence with: minSilence=${settings.minSilenceDurationMs}ms, threshold=${settings.silenceThresholdDb}dB, pad=${settings.paddingMs}ms`);
      const silentIntervals = detectSilentIntervals(audioBufferToProcess, {
        minSilenceDuration: settings.minSilenceDurationMs / 1000,
        silenceThreshold: settings.silenceThresholdDb,
        frameDuration: 0.1,
        padding: settings.paddingMs / 1000
      });
      
      pushLog(`Found ${silentIntervals.length} silent interval(s)`);
      // Update silentIntervals state for the final processing
      setSilentIntervals(silentIntervals);
      
      pushLog('Removing silent segments...');
      
      const processedBuffer = await removeSilentIntervals(audioBufferToProcess, silentIntervals);
      
      pushLog('Exporting to WAV...');
      const wavBuffer = await exportToWav(processedBuffer);
      
      if (isVideo) {
        pushLog('Replacing audio in video...');
        const arrayBuffer = await file.arrayBuffer();
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

  // Update silent intervals when settings change (for real-time preview)
  useEffect(() => {
    if (!audioBuffer) return;
    // Don't run this if in auto mode, as settings are not user-adjustable
    if (settings.autoMode) return;

    const updatedSilentIntervals = detectSilentIntervals(audioBuffer, {
      minSilenceDuration: settings.minSilenceDurationMs / 1000,
      silenceThreshold: settings.silenceThresholdDb,
      frameDuration: 0.1,
      padding: settings.paddingMs / 1000
    });
    setSilentIntervals(updatedSilentIntervals);
    pushLog(`Preview updated with ${updatedSilentIntervals.length} silent interval(s).`);
  }, [settings, audioBuffer, pushLog]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg">
              <FaCut className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-sm opacity-70">Remove silence from audio and video files</p>
            </div>
          </div>
          <div className="tooltip tooltip-left" data-tip="Runs 100% in your browser - no server needed">
            <FaInfoCircle className="w-5 h-5 opacity-70" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="lg:col-span-3 space-y-6">
          {/* Upload and Controls */}
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300 p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <input
                ref={inputRef}
                type="file"
                accept={fileAccept}
                className="hidden"
                onChange={onFileChange}
              />
              <button
                className="btn btn-outline btn-red-600 btn-lg flex-1 gap-2"
                onClick={onPickFile}
                disabled={analyzing || processing}
              >
                <FaCloudUploadAlt /> {t.chooseFile}
              </button>
              <button
                className="btn btn-secondary btn-lg flex-1 gap-2"
                onClick={onProcess}
                disabled={!file || processing || analyzing}
              >
                <FaMagic /> {t.process}
              </button>
              <button
                className="btn btn-outline btn-lg flex-1 gap-2"
                onClick={onReset}
                disabled={processing || analyzing}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t.reset}
              </button>
              <button
                className="btn btn-success btn-lg flex-1 gap-2"
                onClick={download}
                disabled={!resultBlob}
              >
                <FaDownload /> {t.download}
              </button>
            </div>

            {analyzing && (
              <div className="flex flex-col items-center justify-center p-12 bg-base-200/50 rounded-xl">
                <span className="loading loading-lg loading-spinner text-primary"></span>
                <p className="mt-4 text-lg font-medium">{t.analyzing}</p>
                <p className="text-sm opacity-70">Processing your file...</p>
              </div>
            )}

            {previewUrl && !analyzing && (
              <div className="space-y-6">
                {file?.type.startsWith('video/') && (
                  <div className="bg-base-200/50 rounded-xl p-4">
                    <h3 className="font-semibold mb-3">Video Preview</h3>
                    <video className="w-full max-h-96 rounded-lg" controls src={previewUrl} />
                  </div>
                )}
                
                {audioBuffer && (
                  <div className="bg-base-200/50 rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      {t.interactivePreview}
                    </h3>
                    <AudioTimeline
                      audioBuffer={audioBuffer}
                      silentIntervals={silentIntervals}
                      currentTime={currentTime}
                      onIntervalClick={(start, end) => {
                        pushLog(`Silent interval: ${start.toFixed(2)}s - ${end.toFixed(2)}s (${(end - start).toFixed(2)}s)`);
                      }}
                    />
                    <SmartAudioPlayer
                      audioBuffer={audioBuffer}
                      silentIntervals={silentIntervals}
                      onTimeUpdate={setCurrentTime}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300 p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t.settings}
            </h2>

            <div className="form-control mb-6">
              <label className="label cursor-pointer gap-3">
                <span className="label-text font-medium">{t.autoMode}</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.autoMode}
                  onChange={(e) => setSettings(s => ({ ...s, autoMode: e.target.checked }))}
                />
              </label>
            </div>

            <div className={`grid md:grid-cols-3 gap-6 ${settings.autoMode ? 'opacity-50' : ''}`}>
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

            {settings.autoMode && (
              <div className="alert alert-info mt-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t.autoModeNote}</span>
              </div>
            )}
          </div>

          {/* Processing Log */}
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t.log}
            </h2>
            <div className="bg-base-200/50 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm">
              {log.length === 0 ? (
                <div className="flex items-center justify-center h-full text-base-400">
                  <p>No processing logs yet</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {log.map((l, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span className="opacity-80">{l}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Tips
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{t.tip1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{t.tip2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{t.tip3}</span>
              </li>
            </ul>
          </div>

          {/* File Status */}
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t.fileStatus}
            </h2>
            <div className="space-y-3">
              {file ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-70">Name:</span>
                    <span className="font-medium truncate max-w-[150px]">{file.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Size:</span>
                    <span className="font-medium">{Math.round(file.size / 1024)} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Type:</span>
                    <span className="font-medium">{file.type || 'Unknown'}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-base-400">
                  {t.noFile}
                </div>
              )}
            </div>
          </div>

          {/* Processing Stats */}
          {audioBuffer && (
            <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analysis
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-70">Duration:</span>
                  <span className="font-medium">{audioBuffer.duration.toFixed(2)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Silent intervals:</span>
                  <span className="font-medium">{silentIntervals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Sample rate:</span>
                  <span className="font-medium">{audioBuffer.sampleRate} Hz</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SilenceRemover;