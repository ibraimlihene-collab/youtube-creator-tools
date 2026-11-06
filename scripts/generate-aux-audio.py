"""Generate public story audio locally; see docs/AUX-CHAMPS-SOURCES.md."""
import argparse
import datetime
import json
import pathlib
import subprocess
import tempfile
import wave

from piper import PiperVoice

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--input', required=True, type=pathlib.Path)
parser.add_argument('--model', required=True, type=pathlib.Path)
parser.add_argument('--output', required=True, type=pathlib.Path)
parser.add_argument('--ffmpeg', default='ffmpeg')
parser.add_argument('--force', action='store_true')
args = parser.parse_args()
sections = json.loads(args.input.read_text(encoding='utf8'))
if len(sections) != 7 or not all(isinstance(s.get('translation'), str) and s['translation'].strip() for s in sections):
    parser.error('Expected seven nonempty translation records')
args.output.mkdir(parents=True, exist_ok=True)
outputs = [args.output / f'scene-{i + 1}.mp3' for i in range(7)] + [args.output / 'complete-ar.mp3', args.output / 'audio-metadata.json']
if not args.force and any(p.exists() for p in outputs):
    parser.error('Audio already exists; review the input and use --force to replace it')
voice = PiperVoice.load(str(args.model))
metadata = {'engine': 'Piper 1.3.0', 'voice': args.model.stem, 'generated': datetime.date.today().isoformat(), 'synthetic': True, 'sections': []}
with tempfile.TemporaryDirectory(prefix='uko-audio-') as temporary:
    temporary = pathlib.Path(temporary)
    wavs = []
    for index, section in enumerate(sections):
        wav_path = temporary / f'scene-{index + 1}.wav'
        with wave.open(str(wav_path), 'wb') as audio:
            voice.synthesize_wav(section['translation'], audio)
        with wave.open(str(wav_path), 'rb') as audio:
            duration = audio.getnframes() / audio.getframerate()
        mp3 = outputs[index]
        subprocess.run([args.ffmpeg, '-v', 'error', '-y', '-i', str(wav_path), '-codec:a', 'libmp3lame', '-b:a', '64k', '-ac', '1', str(mp3)], check=True)
        metadata['sections'].append({'scene': index + 1, 'duration': round(duration, 2), 'bytes': mp3.stat().st_size})
        wavs.append(wav_path)
        print(f'Scene {index + 1}: {duration:.2f} s', flush=True)
    listing = temporary / 'concat.txt'
    listing.write_text(''.join(f"file '{p}'\n" for p in wavs), encoding='utf8')
    subprocess.run([args.ffmpeg, '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(listing), '-codec:a', 'libmp3lame', '-b:a', '64k', '-ac', '1', str(outputs[-2])], check=True)
outputs[-1].write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf8')
