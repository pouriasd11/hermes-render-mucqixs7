#!/usr/bin/env python3
"""Gemini TTS helper: synthesize Persian narration to WAV files."""
import base64, json, os, struct, sys, time, urllib.request

def _load_keys():
    """API keys come from the environment, or from a .env file beside this script.
    Never commit keys: .env is git-ignored."""
    env = os.environ.get('GEMINI_API_KEYS')
    if not env:
        for cand in (os.path.join(os.path.dirname(__file__), '.env'),
                     os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')):
            if os.path.exists(cand):
                for line in open(cand, encoding='utf-8'):
                    if line.strip().startswith('GEMINI_API_KEYS'):
                        env = line.split("=", 1)[1].strip().strip(chr(34) + chr(39))
                        break
    if not env:
        raise SystemExit('Set GEMINI_API_KEYS (comma separated) or put it in .env')
    return [k.strip() for k in env.split(',') if k.strip()]


KEYS = _load_keys()
_key_i = 0
URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


def _post(model, payload, tries=6):
    global _key_i
    last = None
    for attempt in range(tries):
        key = KEYS[_key_i % len(KEYS)]
        req = urllib.request.Request(
            URL.format(model=model),
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json", "x-goog-api-key": key},
        )
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.loads(r.read())
        except Exception as e:
            last = e
            body = ""
            if hasattr(e, "read"):
                try:
                    body = e.read().decode()[:400]
                except Exception:
                    pass
            print(f"  [retry {attempt+1}] {e} {body}", file=sys.stderr)
            _key_i += 1
            time.sleep(2 + 3 * attempt)
    raise RuntimeError(f"TTS failed: {last}")


def synth(text, out_wav, model="gemini-2.5-pro-preview-tts", voice="Aoede", style=None, seed=None):
    prompt = f"{style}\n\n{text}" if style else text
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
        },
    }
    if seed is not None:
        payload["generationConfig"]["seed"] = seed
    data = _post(model, payload)
    parts = data["candidates"][0]["content"]["parts"]
    pcm = None
    for p in parts:
        if "inlineData" in p:
            pcm = base64.b64decode(p["inlineData"]["data"])
    if pcm is None:
        raise RuntimeError("no audio in response: " + json.dumps(data)[:400])
    write_wav(out_wav, pcm)
    return out_wav


def write_wav(path, pcm, rate=24000, channels=1, width=2):
    n = len(pcm)
    hdr = b"RIFF" + struct.pack("<I", 36 + n) + b"WAVEfmt " + struct.pack(
        "<IHHIIHH", 16, 1, channels, rate, rate * channels * width, channels * width, width * 8
    ) + b"data" + struct.pack("<I", n)
    with open(path, "wb") as f:
        f.write(hdr + pcm)


if __name__ == "__main__":
    text = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else "/workspace/tmp/tts.wav"
    model = sys.argv[3] if len(sys.argv) > 3 else "gemini-2.5-pro-preview-tts"
    synth(text, out, model=model)
    print(out, os.path.getsize(out))
