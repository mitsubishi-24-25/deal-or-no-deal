# Deal or No Deal — Asset Files Checklist

All paths are relative to the project root.

## Sounds → `public/sounds/`

| Filename | Use | Status |
|---|---|---|
| `spin.mp3` | Roulette spin | Existing file is `spin.MP3` |
| `banker-call.mp3` | Banker call | Existing file is `banker-call.MP3` |
| `deal.mp3` | Deal decision | Existing file is `deal.MP3` |
| `no-deal.mp3` | No Deal decision | Existing file is `no-deal.MP3` |
| `winner.mp3` | End-game result | Optional / add if desired |
| `briefcase-open.mp3` | Briefcase opening | Optional / add if desired |
| `reveal.mp3` | Offer/explanation reveal | Optional / add if desired |
| `roulette-winner.mp3` | Roulette result | Optional / add if desired |
| `question-music.mp3` | Music while Lucky Star answers | Optional / add if desired |
| `jump.mp3` | Teacher dino game | Optional / add if desired |
| `value-5.mp3` | Value reveal for ₱5 | Optional |
| `value-8.mp3` | Value reveal for ₱8 | Optional |
| `value-12.mp3` | Value reveal for ₱12 | Optional |
| `value-18.mp3` | Value reveal for ₱18 | Optional |
| `value-25.mp3` | Value reveal for ₱25 | Optional |
| `value-35.mp3` | Value reveal for ₱35 | Optional |
| `value-45.mp3` | Value reveal for ₱45 | Optional |
| `value-high.mp3` | Shared reveal for ₱55–₱1,000,000 | Optional |

The new Lucky Star flow no longer uses group phone buzzer sounds.

## Images → `public/images/`

| Filename | Use | Status |
|---|---|---|
| `logo.png` | TV homepage logo | Existing file |
| `banner.png` | Lucky Star/Teacher login banner | Existing file |
| `ginoong-ricky.png` | Teacher dino game image | Existing file |

## Video → `public/`

| Filename | Use | Status |
|---|---|---|
| `splash.mp4` | TV splash video | Existing file |

## Discussion slides → `public/discussion/`

Add files such as `slide1.jpg`, `slide2.jpg`, and so on. They are detected automatically and controlled from the controller.

## Current app pages

```text
public/
├── controller/index.html
├── controller2/index.html
├── luckystar/index.html
├── teacher/index.html
├── tv/index.html
├── discussion/
├── images/
├── sounds/
└── splash.mp4
```

The previous `public/group/` player page has been removed because the new design has one Lucky Star answer device instead of groups.
