# مقایسهٔ عملی «موشن‌گرافیک با کد» → ویدیو

این پوشه نتیجهٔ نصب و اجرای ۸ موتور مختلف برای ساخت موشن‌گرافیک با کد و گرفتن خروجی ویدیو است.
هر نمونه یک صحنهٔ کوتاه و مشابه (تیتر + انیمیشن شکل‌ها) می‌سازد تا مقایسه منصفانه باشد.

## خروجی‌ها

همه در `outputs/` هستند (به‌همراه `outputs/previews/*.png` به‌عنوان فریم نمونه):

| # | فایل | موتور | رزولوشن | فریم | مدت | حجم |
|---|------|-------|----------|------|-----|-----|
| 1 | `01-remotion.mp4` | Remotion | 1280×720 | 150 | 5.0s | 828K |
| 2 | `02-motion-canvas.mp4` | Motion Canvas | 1280×720 | 103 | 3.4s | 48K |
| 3 | `03-revideo.mp4` | Revideo | 1920×1080 | 103 | 3.4s | 128K |
| 4 | `04-manim.mp4` | Manim Community | 1280×720 | 276 | 9.2s | 268K |
| 5 | `05-p5js.mp4` | p5.js | 1280×720 | 150 | 5.0s | 412K |
| 6 | `06-gsap.mp4` | GSAP | 1280×720 | 150 | 5.0s | 92K |
| 7 | `07-threejs.mp4` | three.js | 1280×720 | 150 | 5.0s | 708K |
| 8 | `08-lottie.mp4` | lottie-web | 1280×720 | 150 | 5.0s | 320K |

## ساختار پوشه

```
motion-compare/
├── env.sh                # متغیرهای محیطی مشترک (ffmpeg، libs، فونت، کروم)
├── render-all.sh         # رندر مجدد همهٔ ۸ نمونه
├── setup-toolchain.sh    # نحوهٔ بوت‌استرپ محیط (بدون root)
├── remotion/             # پروژهٔ Remotion (React)
├── motion-canvas/        # پروژهٔ Motion Canvas + هارنس رندر headless سفارشی
├── revideo/              # پروژهٔ Revideo + اسکریپت رندر برنامه‌ای
├── manim/                # صحنهٔ Manim (conda env در ../manim-env)
├── web/                  # p5.js / GSAP / three.js / Lottie + هارنس فریم‌گرفتن
├── outputs/              # ویدیوهای خروجی
├── fonts/                # فونت‌های TTF برای رندر متن
└── fontconfig/           # fonts.conf برای کروم
```

## اجرای مجدد

```bash
bash motion-compare/render-all.sh
```

## جدول مقایسه

| موتور | زبان | نصب | رندر headless | خروجی | مناسب برای |
|-------|------|-----|----------------|--------|-------------|
| **Remotion** | TypeScript/React | `npm i` ساده | ✅ رسمی، یک‌دستوری | MP4/WebM با صدا | تیزر، محتوای داده‌محور، ادغام با وب |
| **Motion Canvas** | TypeScript | ساده | ⚠️ رسمی ندارد (ادیتور)؛ با هارنس سفارشی شد | PNG sequence → MP4 | انیمیشن کدنویسانه با ادیتور بصری |
| **Revideo** | TypeScript | ساده | ✅ رسمی (`@revideo/renderer`) | MP4 با صدا | فورک headless همان Motion Canvas |
| **Manim Community** | Python | متوسط (سیستم‌لیب cairo/pango) | ✅ رسمی | MP4 | ویدیوهای توضیحی ریاضی/علمی |
| **p5.js** | JavaScript | ساده | ⚠️ نیاز به فریم‌گرفتن دستی | PNG → MP4 | آرت خلاقانه، ویژوال صوتی |
| **GSAP** | JavaScript | ساده | ⚠️ نیاز به فریم‌گرفتن دستی | PNG → MP4 | تایپوگرافی/انیمیشن DOM و SVG |
| **three.js** | JavaScript | ساده | ⚠️ نیاز به فریم‌گرفتن + WebGL (SwiftShader) | PNG → MP4 | موشن سه‌بعدی |
| **lottie-web** | JavaScript | ساده | ⚠️ نیاز به فریم‌گرفتن (رندرر canvas) | PNG → MP4 | پخش انیمیشن‌های After Effects |

## جمع‌بندی و توصیه

- **برای «کد → MP4» سریع و بدون دردسر:** **Remotion** بهترین گزینه است (رندر رسمی، صدا، فونت، کروم و ffmpeg را خودش مدیریت می‌کند).
- **اگر سبک TypeScript + ادیتور بصری می‌خواهی:** **Motion Canvas** برای کار در ادیتور، و **Revideo** برای رندر headless همان کد.
- **برای ویدیوی ریاضی/علمی:** **Manim Community**.
- **p5.js / GSAP / three.js / Lottie** کتابخانه‌اند، نه پایپ‌لاین؛ باید خودت فریم بگیری. هارنس `web/harness.mjs` این کار را برای همه‌شان انجام می‌دهد (Playwright + FFmpeg).

## یادداشت‌های محیطی (مهم)

این سندباکس **بدون root** است و نه ffmpeg داشت، نه فونت، نه کروم. همه‌چیز در فضای کاربر نصب شد:

- **FFmpeg/FFprobe:** از بسته‌های npm `ffmpeg-static` و `@ffprobe-installer/ffprobe`.
- **Chromium:** Remotion یک `chrome-headless-shell` دانلود می‌کند؛ همان باینری در هارنس‌های دیگر با `executablePath` استفاده می‌شود (لینک‌های سیستمی ندارد، پس کتابخانه‌های `libnss3/libnspr4/libglib` از فایل‌های `.deb` دبیان استخراج و در `sysroot/` قرار گرفتند).
- **فونت:** تصویر هیچ فونتی نداشت و همهٔ متن‌ها نامرئی رندر می‌شدند؛ با ساخت `fonts.conf` و یک پوشهٔ فونت حل شد (بدون این کار Remotion و p5 و GSAP و Motion Canvas متن نشان نمی‌دادند).
- **Manim:** چون pycairo/manimpango ویل باینری ندارند و سیستم‌لیب هم نبود، با `micromamba` از conda-forge نصب شد. LaTeX این env خراب است، بنابراین نمونه از `Text` به‌جای `MathTex` استفاده می‌کند.
- **Lottie:** رندرر SVG در این کروم هندسه نمی‌سازد؛ رندرر `canvas` استفاده شد. همچنین کی‌فریم `scale` رندر نشد، پس نمونه فقط با کی‌فریم `rotation` انیمیت می‌شود.
- **Revideo:** چند نکته: `outFile` باید فقط نام فایل باشد (نه مسیر) و پوشه با `outDir` داده شود؛ نام صحنه باید صریح به `makeScene2D(name, fn)` داده شود (ترنسفورم `?scene` در مسیر رندر اعمال نمی‌شود).
- **Motion Canvas:** CLI رندر رسمی ندارد؛ `motion-canvas/render-entry.ts` با API عمومی `Renderer` و یک `Exporter` سفارشی، فریم‌ها را از طریق `window.__capture` به هارنس Playwright می‌دهد.

## نمونهٔ آموزشی یکسان (قضیهٔ فیثاغورس)

یک سناریوی آموزشی یکسان در هر ۸ موتور پیاده و رندر شده است؛ خروجی‌ها در `edu/` و مقایسهٔ کامل + برنده در [`edu/README.md`](./edu/README.md).
اجرای مجدد: `bash motion-compare/render-edu.sh`
