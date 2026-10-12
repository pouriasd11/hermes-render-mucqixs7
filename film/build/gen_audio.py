#!/usr/bin/env python3
"""Generate per-scene Persian narration with the Aoede voice, rotating keys/models."""
import base64, json, os, struct, sys, time, wave
sys.path.insert(0, '/workspace')
import tts
from script_final2 import SCENES

OUT = '/workspace/film/audio'
os.makedirs(OUT, exist_ok=True)
MODELS = ['gemini-3.1-flash-tts-preview']
VOICE = 'Aoede'


def dur_of(path):
    with wave.open(path) as w:
        return w.getnframes() / w.getframerate()


def gen(scene_id, text):
    out = os.path.join(OUT, scene_id + '.wav')
    if os.path.exists(out) and dur_of(out) > 1:
        return dur_of(out), 'cached'
    last = None
    for attempt in range(10):
        model = MODELS[attempt % len(MODELS)]
        tts._key_i = attempt + 1
        body = {
            "contents": [{"parts": [{"text": text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}}},
        }
        try:
            d = tts._post(model, body, tries=1)
            parts = [p for p in d['candidates'][0]['content']['parts'] if 'inlineData' in p]
            if not parts:
                raise RuntimeError('no audio part: ' + json.dumps(d)[:300])
            pcm = base64.b64decode(parts[0]['inlineData']['data'])
            tts.write_wav(out, pcm)
            return dur_of(out), model
        except Exception as e:
            last = e
            msg = str(e)[:200]
            print(f'  {scene_id} attempt {attempt+1} ({model}) failed: {msg}', flush=True)
            time.sleep(3)
    raise RuntimeError(f'{scene_id}: {last}')


if __name__ == '__main__':
    manifest = []
    for sid, title, text in SCENES:
        print(f'--- {sid} {title} ({len(text)} chars)', flush=True)
        t0 = time.time()
        d, model = gen(sid, text)
        expect = len(text) / 13.8
        print(f'    {d:.1f}s (expected ~{expect:.1f}s) via {model} in {time.time()-t0:.0f}s', flush=True)
        manifest.append({'id': sid, 'title': title, 'text': text, 'wav': f'audio/{sid}.wav',
                         'dur': round(d, 3), 'chars': len(text), 'model': model})
        json.dump(manifest, open('/workspace/film/audio/manifest.json', 'w'), ensure_ascii=False, indent=1)
    total = sum(m['dur'] for m in manifest)
    print(f'TOTAL speech {total:.1f}s', flush=True)
