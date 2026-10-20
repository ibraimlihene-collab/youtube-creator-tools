# Aux champs: provenance, translation and audio

Checked 20 October 2026. This is a study edition of a **short story (nouvelle)**, not a novel. The teacher determines required passages and examination expectations.

## French text

- Guy de Maupassant, *Aux champs*, first published 31 October 1882; collected in *Contes de la bécasse* (1883).
- Full transcription retrieved: [Project Gutenberg eBook 11714](https://www.gutenberg.org/ebooks/11714), [UTF-8 text](https://www.gutenberg.org/ebooks/11714.txt.utf-8). Its credits identify BnF/Gallica images. The downloadable `original-fr.txt` retains the Gutenberg licence tail. Check applicable territorial rules before redistributing an edition.
- Full story and publication date cross-checked against [maupassant.free.fr](http://maupassant.free.fr/textes/auxchamps.html), available over HTTP; HTTPS failed in the research environment. Wikisource refused access and was not used as read evidence.
- Wrapped lines are normalized. Seven contiguous scenes are an application study aid, not the author's chapters. `auxChampsOriginal.json` holds the entire story, excluding the next story in the collection.

## Translation and study material

The complete Arabic translation in `src/knowledge/auxChampsContent.ts` was prepared for this application from the French text. It is a pedagogical aid, not a certified translation, approved answer key or official examination edition. It renders period dialogue in understandable Arabic, with the original beside it. Compare difficult wording with the teacher. The source's apparently inconsistent family description is retained rather than silently changing the text.

The bilingual character guide, narrative structure, vocabulary, themes and seven comprehension questions are application-prepared exercises, not exam predictions or an official marking scheme. Scientific titles come from the user's message, corrected for spelling. The nine revision sheets are explicitly marked for comparison with the actual course. No remaining annual curriculum is invented.

## Real synthetic Arabic audio

Seven MP3 scenes and `complete-ar.mp3` were generated from the complete Arabic translation using **local Piper 1.3.0**, voice **ar_JO-kareem-medium**. The full track is about **16 minutes 17 seconds**, mono MP3 at 64 kbps. Names, pronunciation and prosody may need human correction. No human narration or pronunciation assessment is claimed.

- Engine: [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl), GPL-3.0.
- Voice: [rhasspy/piper-voices, Arabic Kareem medium](https://huggingface.co/rhasspy/piper-voices/tree/main/ar/ar_JO/kareem/medium). Its repository root declares MIT; the model card identifies the linked [Arabic training dataset](https://github.com/AliMokhammad/arabicttstrain/). A separate dataset licence was not found during this work. The application distributes generated audio, not model weights or the synthesis engine; review upstream terms before reusing or retraining the voice.
- `audio-metadata.json` records section durations, sizes, engine and voice. Synthesis was local without sending private data to a provider. Playback downloads static files only.
- Editing a saved translation changes the reader but does not regenerate reference downloads/audio, as disclosed beside the player. There is no runtime AI or TTS connection.

## Reproduce audio locally (optional development tool)

The website needs none of these Python dependencies. Download the reviewed voice `.onnx` and matching `.onnx.json` into `/tmp/uko-tts`, retaining upstream attribution there.

```sh
python3 -m venv /tmp/uko-audio-env
/tmp/uko-audio-env/bin/pip install piper-tts==1.3.0 imageio-ffmpeg
bun -e "import {readingSections} from './src/knowledge/auxChampsContent.ts'; await Bun.write('/tmp/uko-scenes.json', JSON.stringify(readingSections));"
FFMPEG_BIN=$(/tmp/uko-audio-env/bin/python -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')
/tmp/uko-audio-env/bin/python scripts/generate-aux-audio.py \
  --input /tmp/uko-scenes.json --model /tmp/uko-tts/ar_JO-kareem-medium.onnx \
  --output /tmp/uko-audio-output --ffmpeg "$FFMPEG_BIN"
```

Review generated files before replacing public assets. The script refuses an existing output unless `--force` is supplied. No model weights, scratch WAVs or environment should be committed. The reproduction entry point is syntax-checked; supplied audio was produced with the same synthesis/encoding operations and decoded end to end, but this exact clean-environment command was not rerun.
