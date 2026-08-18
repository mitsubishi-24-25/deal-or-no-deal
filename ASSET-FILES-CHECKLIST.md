# 🎯 Deal or No Deal — Asset Files Checklist

Listahan ng **lahat** ng files na kailangan mong ilagay (sounds, videos, images).
Lahat ng paths ay relative sa root folder ng project (`dealornodeal/`).

> **Note about case:** The code references **lowercase** names (e.g. `buzzer.mp3`).
> Your existing files are uppercase (`.MP3`). On **Windows** this works fine (case-insensitive),
> but to be safe (and if you ever run on Linux/Mac), rename them to lowercase.
> Same rule for `public/images/` and `public/sounds/`.

---

## 🔊 1. SOUND EFFECTS → `public/sounds/`

| # | Filename (exact) | Para saan / Kailan tumutugtog | Status |
|---|---|---|---|
| 1 | `buzzer.mp3` | Group buzz (normal gameplay + buzzer test) | ✅ may `buzzer.MP3` na |
| 2 | `correct.mp3` | Tamang sagot ng group (reveal ng value) | ❌ wala pa |
| 3 | `wrong.mp3` | Maling sagot ng group (locked out) | ❌ wala pa |
| 4 | `spin.mp3` | Pag-ikot ng roulette | ✅ may `spin.MP3` na |
| 5 | `banker-call.mp3` | Pagtawag ng banker (phone ring) | ✅ may `banker-call.MP3` na |
| 6 | `deal.mp3` | Pag accept ng DEAL | ✅ may `deal.MP3` na |
| 7 | `no-deal.mp3` | Pag reject (NO DEAL) | ✅ may `no-deal.MP3` na |
| 8 | `winner.mp3` | Winner reveal sa dulo (game end) | ❌ wala pa |
| 9 | `briefcase-open.mp3` | Pagbukas ng briefcase | ❌ wala pa |
| 10 | `reveal.mp3` | Pag-reveal ng offer/lucky briefcase | ❌ wala pa |
| 11 | `roulette-winner.mp3` | Paglabas ng lucky star result | ❌ wala pa |
| 12 | `question-music.mp3` | Background music habang naka-display ang question (auto-stop kapag may unang buzz) | ❌ wala pa |
| 13 | `funny_buzzer.mp3` | 1st buzz lang ni Group 7 sa buzzer test (humour) | ❌ wala pa |
| 14 | `jump.mp3` | Jump ng dino game (teacher device) | ❌ wala pa |

---

## 🖼️ 2. IMAGES → `public/images/`

| # | Filename (exact) | Para saan | Size suggestion | Status |
|---|---|---|---|---|
| 1 | `logo.png` | Watermark sa bottom-left ng TV homepage (replaces the old "BSIT 1E DEAL OR NO DEAL" text) | ~400px wide, transparent bg | ❌ wala pa |
| 2 | `banner.png` | Banner sa login page ng **group devices** at **teacher device** (replaces the red "GAME SHOW IMAGE" box). Hindi ma-c-crop (object-fit: contain). | 16:9 or any, ~1200px wide | ❌ wala pa |
| 3 | `ginoong-ricky.png` | Mukha ni Ginoong Ricky sa loob ng dino game circle | Square image (auto-crop to circle) | ❌ wala pa |

---

## 🎬 3. VIDEO → `public/` (root)

| # | Filename (exact) | Para saan | Notes | Status |
|---|---|---|---|---|
| 1 | `splash.mp4` | Video na naka-loop sa splash/gameshow page ng TV | Auto-play, muted, loop, fullscreen cover | ❌ wala pa |

---

## 📚 4. DISCUSSION SLIDES → `public/discussion/`

| # | Filename | Para saan | Notes | Status |
|---|---|---|---|---|
| 1 | `slide1.jpg` | Unang slide ng discussion (TV → DISCUSSION page) | Any image format: `.jpg` `.jpeg` `.png` `.webp` `.gif` | ❌ wala pa |
| 2 | `slide2.jpg` | Pangalawang slide | Auto-detected & sorted by number | ❌ wala pa |
| 3 | `slide3.jpg` | ... | Walang limit sa dami | ❌ wala pa |
| … | `slideN.jpg` | … | 1920×1080 recommended | ❌ wala pa |

> Ilagay lang ang images sa folder na `public/discussion/` na naka-sunod-sunod ang pangalan
> (`slide1`, `slide2`, `slide3`, ...). Awtomatikong makikita ng system at iikot mo sila
> gamit ang **◀ PREV / NEXT ▶** sa controller (Discussion section).

---

## ✅ Quick summary ng folder structure

```
dealornodeal/
├── public/
│   ├── sounds/
│   │   ├── buzzer.mp3              ✅
│   │   ├── correct.mp3             ❌
│   │   ├── wrong.mp3               ❌
│   │   ├── spin.mp3                ✅
│   │   ├── banker-call.mp3         ✅
│   │   ├── deal.mp3                ✅
│   │   ├── no-deal.mp3             ✅
│   │   ├── winner.mp3              ❌
│   │   ├── briefcase-open.mp3      ❌
│   │   ├── reveal.mp3              ❌
│   │   ├── roulette-winner.mp3     ❌
│   │   ├── question-music.mp3      ❌
│   │   ├── funny_buzzer.mp3        ❌
│   │   └── jump.mp3                ❌
│   ├── images/
│   │   ├── logo.png                ✅
│   │   ├── banner.png              ✅
│   │   └── ginoong-ricky.png       ✅
│   ├── discussion/
│   │   ├── slide1.jpg              ❌
│   │   ├── slide2.jpg              ❌
│   │   └── ...                     ❌
│   └── splash.mp4                  ✅
└── (other files...)
```

**Legend:** ✅ = may file na (pero check lowercase/uppercase) · ❌ = kailangan mong i-add

---

*Kapag may na-miss kang file, hindi mag-e-error ang system — tahimik lang na walang
sound/gumagana ang fallback (e.g. nakatago ang logo, 👨 emoji sa dino).*
