#!/usr/bin/env python3
"""Prepare the narration: trim silence, set the pace, place each scene on the timeline,
add a quiet music bed and write durations.js for the film."""
import json, math, os, subprocess, sys, wave
import numpy as np

FFMPEG = '/workspace/tools/node_modules/@ffmpeg-installer/linux-x64/ffmpeg'
FILM = '/workspace/film'
AUD = os.path.join(FILM, 'audio')
OUT = os.path.join(FILM, 'out')
os.makedirs(OUT, exist_ok=True)

TARGET_TOTAL = 300.0     # five minutes
GAP = 0.55               # breathing room after each scene
TAIL = 0.7               # room after the last word
SR = 48000


def read_wav(path):
    with wave.open(path) as w:
        assert w.getsampwidth() == 2, path
        n = w.getnframes()
        data = np.frombuffer(w.readframes(n), dtype='<i2').astype(np.float32) / 32768.0
        if w.getnchannels() == 2:
            data = data.reshape(-1, 2).mean(axis=1)
        return data, w.getframerate()


def trim_silence(x, sr, thresh=0.006, pad=0.08):
    a = np.abs(x)
    idx = np.where(a > thresh)[0]
    if len(idx) == 0:
        return x
    s = max(0, idx[0] - int(pad * sr))
    e = min(len(x), idx[-1] + int(pad * sr))
    return x[s:e]


def atempo(x, sr, factor):
    """Time-stretch with ffmpeg's atempo (keeps pitch)."""
    tmp_in = '/tmp/_at_in.wav'
    tmp_out = '/tmp/_at_out.wav'
    with wave.open(tmp_in, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
    filters = []
    f = factor
    while f > 2.0:
        filters.append('atempo=2.0'); f /= 2.0
    while f < 0.5:
        filters.append('atempo=0.5'); f /= 0.5
    filters.append(f'atempo={f:.6f}'); filters.append('aresample=48000')
    subprocess.run([FFMPEG, '-v', 'error', '-y', '-i', tmp_in, '-filter:a', ','.join(filters), tmp_out], check=True)
    y, sr2 = read_wav(tmp_out)
    return y, sr2


def music_bed(n, sr):
    """A very quiet, slow pad: four soft chords, gentle swells, no rhythm."""
    t = np.arange(n) / sr
    chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66], [164.81, 207.65, 246.94]]
    out = np.zeros(n, dtype=np.float32)
    bar = 8.0
    for k in range(int(np.ceil(n / sr / bar)) + 1):
        t0 = k * bar
        i0, i1 = int(t0 * sr), min(n, int((t0 + bar * 1.6) * sr))
        if i0 >= n:
            break
        seg = t[i0:i1] - t0
        env = np.clip(seg / 2.6, 0, 1) * np.exp(-np.maximum(seg - 3.2, 0) / 3.0)
        for f in chords[k % 4]:
            for mult, amp in ((1, 1.0), (2, 0.22), (3, 0.08)):
                out[i0:i1] += (amp * 0.05) * np.sin(2 * math.pi * f * mult * seg + k) * env
    out += 0.004 * np.random.default_rng(3).standard_normal(n)
    return out.astype(np.float32)


def main():
    manifest = json.load(open(os.path.join(AUD, 'manifest.json')))
    raw = {}
    for m in manifest:
        x, sr = read_wav(os.path.join(FILM, m['wav']))
        raw[m['id']] = trim_silence(x, sr)
    total_speech = sum(len(v) / 24000 for v in raw.values())
    factor = min(1.20, total_speech / (TARGET_TOTAL - GAP * (len(manifest) - 1) - TAIL))
    print(f'speech {total_speech:.1f}s  tempo x{factor:.3f}')
    scenes = []
    for m in manifest:
        y, sr = atempo(raw[m['id']], 24000, factor)
        scenes.append({'id': m['id'], 'title': m['title'], 'wav': y, 'dur': len(y) / sr})
    # place them on the timeline
    durs, cursor = {}, 0.0
    total = sum(s['dur'] + GAP for s in scenes) + (TAIL - GAP)
    n = int(total * SR) + SR
    track = np.zeros(n, dtype=np.float32)
    for s in scenes:
        d = s['dur'] + GAP
        durs[s['id']] = round(d, 4)
        i0 = int(cursor * SR)
        track[i0:i0 + len(s['wav'])] += s['wav']
        cursor += d
    print('film duration %.1fs' % cursor)
    bed = music_bed(len(track), SR) * 0.5
    # duck the music a little under the voice
    voice_env = np.abs(track)
    k = int(0.15 * SR)
    kern = np.ones(k) / k
    env = np.convolve(voice_env, kern, mode='same')
    duck = 1.0 - 0.55 * np.clip(env * 26, 0, 1)
    mix = track + bed * duck
    peak = np.max(np.abs(mix)) or 1.0
    mix = mix / peak * 0.94
    stereo = np.repeat(mix[:, None], 2, axis=1)
    out_wav = os.path.join(OUT, 'narration.wav')
    with wave.open(out_wav, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(stereo, -1, 1) * 32767).astype('<i2').tobytes())
    print('wrote', out_wav, os.path.getsize(out_wav))
    js = 'const DURS = {' + ', '.join(f"{k}: {v}" for k, v in durs.items()) + '};\n'
    js += f'const TOTAL = {cursor:.4f};\n'
    open(os.path.join(FILM, 'durations.js'), 'w').write(js)
    print(js)
    json.dump({'factor': factor, 'durs': durs, 'total': cursor}, open(os.path.join(OUT, 'timing.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
