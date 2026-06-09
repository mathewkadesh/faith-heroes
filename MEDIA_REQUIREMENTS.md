# Faith Heroes — Media Requirements

All placeholder media found by code analysis. Grouped by priority.

---

## BRAND ASSETS (needed before any launch)

| # | Asset | File | Spec | Used In |
|---|-------|------|------|---------|
| 1 | **Brand Logo** | `public/favicon.ico` | 32×32 ICO | Browser tab |
| 2 | **App Icon (small)** | `public/logo192.png` | 192×192 PNG | PWA / home screen |
| 3 | **App Icon (large)** | `public/logo512.png` | 512×512 PNG | PWA splash screen |
| 4 | **OG / Social Preview** | `public/og-image.png` | 1200×630 PNG | Social share cards |

> Currently using default React logo for all 4. Replace before publishing.

---

## LANDING PAGE (`/`)

### Hero Section
| # | Asset | Spec | Notes |
|---|-------|------|-------|
| 5 | **Hero background video** | MP4, 1920×1080, <8 MB, loop | Code has TODO comment: *"Replace gradient with hero video when ready"*. Currently shows dark red gradient only. |
| 6 | **Hero background still** (fallback) | JPG, 1920×1080 | Poster frame for the video — shown while video loads |

### "Meet the Heroes of Faith" section — Character Cards
Each character needs **3 product images** uploaded via the Admin dashboard or directly in Supabase (`characters` table):

| Field | What to photograph | Spec |
|-------|--------------------|------|
| `figure_image_url` | The chibi vinyl figure on a clean background | PNG, transparent bg preferred, min 800×800 |
| `lid_image_url` | Gift box lid — top-down or angled product shot | JPG/PNG, min 800×800 |
| `box_image_url` | Full gift box, closed or open styled shot | JPG/PNG, min 800×800 |

> Currently showing `<BookOpen>` icon placeholder when no image URL is in the DB.
> Upload images via Admin → Characters → edit a character.

### "Chibi 3D Vinyl Figure" Showcase (bento card)
| # | Asset | Spec | Notes |
|---|-------|------|-------|
| 7 | **3D model per character** | `.glb` or `.gltf`, <5 MB each | Goes in `characters.model_3d_url`. Currently shows floating Package icon and text *"3D Figure placeholder"*. Viewer is already wired up via Three.js. |

### "See It Come to Life" — Video Strip
3 video slots, currently showing PlayCircle icon + *"Video coming soon"*:

| # | Video title | Label tag | Suggested length |
|---|-------------|-----------|-----------------|
| 8 | Noah's Ark Collection | Unboxing | 60–90 sec |
| 9 | David & Goliath Box | Character Story | 60–90 sec |
| 10 | Handcrafted with Love | Behind the Scenes | 60–90 sec |

> Host on YouTube or Vimeo and embed the URL — or store an MP4 and display with `<video>`.

---

## SHOP PAGE (`/shop`)

Character product cards fall back to a Crown icon when no image exists.
Same images as above (`figure_image_url`, `lid_image_url`, `box_image_url`) fix this automatically once added to the DB.

---

## ABOUT PAGE (`/about`)

Three `<ImageSlot>` placeholder cards are hardcoded:

| # | Slot title | Note in code | Spec |
|---|-----------|--------------|------|
| 11 | **Founder photo** | *"Replace with: founder portrait or team photo"* — tall format | JPG, portrait orientation, min 600×900 |
| 12 | **Workshop / crafting photo** | *"Upload workshop or product crafting image"* | JPG, landscape or square, min 800×600 |
| 13 | **Gift box beauty shot** | *"Upload finished gift box product photo"* | JPG, square or landscape, min 800×800 |

### Team section
3 team members currently display **initial-only avatars** (letter in a circle):

| Slot | Role | Needs |
|------|------|-------|
| 14 | Founder & CEO | Headshot, square crop, min 400×400 |
| 15 | Lead Designer / Creative Director | Headshot, square crop, min 400×400 |
| 16 | Community Lead | Headshot, square crop, min 400×400 |

### Founder story
Code has a `TODO` comment:
> *"Replace placeholder story with your real founder story - how did you start this? What was the moment of inspiration? Add 2–3 personal paragraphs here."*
This is text, not an image, but it's blocking the About page from being real content.

---

## SUMMARY COUNT

| Category | Items | Status |
|----------|-------|--------|
| Brand / icons | 4 | ❌ Placeholder (React defaults) |
| Hero video + still | 2 | ❌ CSS gradient only |
| Character product images (per character × 3) | 3× N | ❌ Icon fallback |
| 3D models (per character) | 1× N | ❌ Package icon |
| Videos (landing strip) | 3 | ❌ "Coming soon" |
| About page slots | 3 | ❌ ImageSlot component |
| Team headshots | 3 | ❌ Letter avatars |
| **Minimum to look real at launch** | **Brand icons + 1 character's 3 images + About founder photo** | |

---

## HOW TO ADD CHARACTER IMAGES

1. Go to `/admin` → Characters → edit a character
2. Upload or paste URLs into `figure_image_url`, `lid_image_url`, `box_image_url`
3. For 3D models: upload a `.glb` file and paste the URL into `model_3d_url`

All images are pulled live from Supabase — no rebuild needed.
