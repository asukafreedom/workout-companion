# Handoff: Workout Companion — visual redesign

## Overview
A visual redesign of the existing Workout Companion PWA (`asukafreedom/workout-companion`, React + Vite, styles in `src/styles.css`). Same three tabs (Today / Progress / Plan), same data model (`src/data/types.ts`), same plan (`src/data/plan.ts`), same logic (`progression.ts`, `sessions.ts`, `bodyweight.ts`). What changes: typography, color, layout density, and a motivation layer (weekly consistency strip, session progress, personal bests, deltas) computed from data the app already stores in `UserData`.

## About the Design Files
`Redesign.dc.html` and `Current UI.dc.html` are **design references built in HTML** — not production code. Recreate them in the existing React codebase using its patterns: keep `styles.css` as the single stylesheet, keep the component split (`TodayScreen`, `ExerciseDetail`, `SetLogger`, `RestTimer`, `ProgressScreen`, `PlanScreen`, `LineChart`, `Icon`). `ios-frame.jsx` is only a device bezel for presentation; ignore it.

`Current UI.dc.html` is a faithful copy of today's app for side-by-side comparison. Only `Redesign.dc.html` is the target.

## Fidelity
**High-fidelity.** Colors, type, spacing and copy are final. Recreate pixel-perfectly. Both a dark and a light theme are specified; implement via CSS custom properties switched on `prefers-color-scheme` (dark is default).

## Design Tokens

### Fonts (Google Fonts)
- Display + all numbers: `'Barlow Condensed'`, weights 600/700/800
- Body: `'Barlow'`, weights 400/500/600/700
- Fallback: `system-ui, sans-serif`. All numbers use `font-variant-numeric: tabular-nums`.

### Colors — dark (default)
- `--bg` #0c0d10
- `--surface` #15171c
- `--surface-2` #1c1f26
- `--border` rgba(255,255,255,.07) (inputs/buttons: .08; strong: .12)
- `--text` #f2f3f5
- `--text-dim` #8b909c
- `--accent` oklch(0.74 0.19 50) (≈ #ff8a3d) — "do this next"
- `--accent-soft` oklch(0.74 0.19 50 / .12) (borders .5)
- `--good` oklch(0.74 0.16 150) — done / positive delta
- `--on-accent` #0c0d10

### Colors — light
- `--bg` #f4f3f0
- `--surface` #ffffff
- `--surface-2` #f4f3f0
- `--border` rgba(0,0,0,.07) (inputs .08; strong .14)
- `--text` #14151a
- `--text-dim` #6b7080
- `--accent` oklch(0.66 0.2 50) for fills; oklch(0.6 0.2 50) for accent text
- `--accent-soft` oklch(0.6 0.2 50 / .12)
- `--good` oklch(0.62 0.16 150)
- Primary CTA in light mode is `#14151a` with white text (accent used for the arrow/icon only)

### Type scale
- Screen title: Barlow Condensed 800, 56px / 0.92, uppercase, letter-spacing −0.015em (Today); 44px / 0.95 (Progress, Plan); 40px / 0.95 (Exercise detail)
- Hero number: Barlow Condensed 800, 48px (nudge), 44px (body weight), 40px (session progress, rest timer), 30px (stat tiles, stepper values), 24px (set summary, chart deltas)
- Row index/number: Barlow Condensed 600–700, 18–22px
- Body: Barlow 600 16px (row names), 15px (list names), 13px/1.4–1.5 (notes)
- Eyebrow/label: 12px 600 letter-spacing .12em uppercase (Barlow); 11px 700 .12em; 10px 700 .12em inside tiles
- Button label: Barlow Condensed 700 13–18px, letter-spacing .06–.12em, uppercase

### Spacing / radius / shadows
- Screen padding 20px; vertical section gap 18–22px; card padding 16px; list row padding 14px 4px
- Radius: cards 16px; rows/inputs/buttons 12–14px; pills 999px; progress bars 3px
- Progress bar height 6px; tab indicator 20×3px
- CTA shadow (dark): `0 8px 24px oklch(0.74 0.19 50 / .3)`; (light) `0 8px 24px rgba(0,0,0,.18)`; light cards `0 1px 2px rgba(0,0,0,.04)`
- Min hit target 44px (steppers 44px wide, inputs 56px tall)

## Screens / Views

### 1. Today (`TodayScreen`)
Purpose: see today's session, progress within it, and the week's consistency; jump to the next exercise.
Layout (top → bottom, column, gap 22):
1. Header: eyebrow `THURSDAY · 3 SEP` (12px 600 .12em dim) left; pill right `WEEK 36 · 3/4` (Barlow Condensed 700 12px, accent text on accent-soft, padding 4px 10px, radius 999). Below: title `UPPER\nBODY B` (56px).
2. Week strip: 7-col grid, gap 6. Each cell: day letter (11px 600 dim; today 700 text color) over a 6px bar (radius 3). Bar fill: lift done → good; cardio done → good at 45% alpha; today → accent; future → surface-2 (dark) / rgba(0,0,0,.08) (light). Under it a 12px row: `Session N of 4 this week` left, `3-week streak` right in good 600.
3. Session progress card (surface, border, radius 16, padding 16): `2/8` (40px 800; `/8` dim 600) + `EXERCISES` eyebrow; right `5 of 24 sets · ~38 min left` (12px dim). 6px bar, fill = completed exercises / total in accent.
4. Exercise list (no cards; rows separated by 1px border): row = index `01` (Barlow Condensed 600 18px dim, width 26) · name (16px 600) + meta (12px dim: `3 × 8–12 · last 45 kg`) · right slot.
   - Done: opacity .55, name line-through, right = 28px good circle with dark check.
   - In progress (current): row becomes a card — margin 4px −8px, padding 14px 12px, radius 14, bg accent-soft, border 1px accent/.5 (light: white bg, 1.5px accent border, shadow). Index accent 700; right = `1/3` (22px 700 accent, `/3` dim 500).
   - Pending: right = last weight `35 KG` (Barlow Condensed 600 20px; unit 12px dim).
   - Variant slot (two exercises share a slot): show swap affordance under meta as accent 12px text `⇄ Lat Pulldown` (not shown in mock — reuse existing `variant-toggle` behavior).
5. Workout note (13px/1.5 dim).
6. Fixed bottom stack over a `linear-gradient(transparent, bg 30%)` fade: CTA `CONTINUE · CHEST-SUPPORTED ROW  →` (height 56, radius 14, accent bg, on-accent text, Barlow Condensed 700 18px .06em uppercase; opens the first incomplete exercise) then the tab bar.

### 2. Exercise detail + set logger + rest timer (`ExerciseDetail`, `SetLogger`, `RestTimer`)
Full-screen overlay, scroller padding 58px 20px 24px, gap 18.
1. Top row: 40px circular back button (surface, border) · centered eyebrow `EXERCISE 1 OF 8` · 40px spacer.
2. Title 40px + meta eyebrow `3 × 8–12 · REST 120 S · PER DUMBBELL` (loadLabel from `SetLogger`).
3. Anatomy viewer: height 190, radius 16, `flex-shrink:0`, existing three.js `Viewer` inside. Overlay bottom-left: primary muscles (Barlow Condensed 700 16px .06em uppercase accent) + `with Triceps` (12px dim). Top-right 32px collapse chevron button (rgba(bg,.6)). Collapsed state persists (`settings.viewerCollapsed`).
4. Progression nudge (only when `suggestNext().nudge` is non-null): row card, accent-soft bg, 1px accent/.5 border (light: white + 1.5px accent), radius 16, padding 14px 16px. Left: suggested weight `25` 48px 800 + `KG` 14px 700 (accent). Right: eyebrow `PROGRESSION UNLOCKED` (accent) + one sentence 13px (`You owned 3 × 12 @ 22.5 kg last session. Step up 2.5 kg today.`). For bodyweight/assisted use the existing nudge strings with the number being reps / assist kg.
5. Sets header row: `SETS` left, `BEST 22.5 × 12 · 22 AUG` right (11px 600 .12em dim). Best = max top-set weight × reps from `sessionHistory`.
6. Set rows (gap 8):
   - Done row: surface card radius 14, padding 12px 16px, min-height 60: 28px good check circle · `SET 1` (Barlow Condensed 600 13px .1em dim, width 44) · `25 KG × 10 REPS` (24px 700; units 13px dim 600) · edit pencil icon (dim). Tap → reopen (existing behavior).
   - Active row (first un-logged set): surface card with 1.5px accent border, padding 14px 16px 16px, column gap 12. Header: `SET 2 · NOW` (accent) left, `Target 8–12` right. Two stepper fields side by side (gap 10), each with 10px label `KG` / `REPS` and a 56px-tall field (bg, border, radius 12): 44px `−` (dim) · value 30px 800 centered · 44px `+`. Below: full-width `✓ LOG SET 2` button (52px, accent bg, on-accent, Barlow Condensed 700 16px .1em). Logging starts the rest timer.
   - Future rows: same as done row layout at opacity .5, empty 28px circle outline, values dim.
   - `+ ADD SET` text button (Barlow Condensed 600 13px .1em dim, 44px tall).
7. Actions row: two equal 46px buttons `FORM CUES` / `▶ FORM VIDEO` (surface, border, Barlow Condensed 600 13px .1em). Cues expand into a card below as today.
8. Rest timer (bottom, only while running): surface-2 bar, border-top, padding 14px 20px + safe area. 3px accent progress line at top scaled by remaining/total. Left: `REST` eyebrow over countdown `1:47` (40px 800 accent). Middle: `Next: Set 2 · 25 kg × 8` (12px dim). Right: pill `+30 S` (outline) and pill `SKIP` (text-color fill, bg text).

### 3. Progress (`ProgressScreen`, `LineChart`)
Padding 62px 20px 24px, gap 20.
1. Eyebrow `WEEK 36 · 31 AUG – 6 SEP` + title `PROGRESS` 44px.
2. Three stat tiles (grid 3, gap 8; surface, radius 14, padding 12px 14px): `SESSIONS 3/4`, `VOLUME 12.4 t` + `▲ 6% vs last wk` (11px good), `NEW BESTS 2` (accent number). Volume = Σ weight×reps this week; bests = exercises whose top set this week beat all prior.
3. Body-weight card (surface, radius 16, padding 16, gap 12): eyebrow `BODY WEIGHT · 7-DAY AVG`, `82.4 KG` (44px 800 / 14px), right `−1.3 kg` (18px 700 good) over `last 4 weeks`. Chart (SVG 330×140): 3 horizontal gridlines rgba(255,255,255,.06), right-aligned min/max labels 10px dim, dashed accent goal line with `GOAL 78` label (goal = new optional `settings.goalKg`), area fill accent/.12 under the average line, daily dots r2.5 dim/.4, average polyline accent 2.5px, last point r5 bg-fill with accent stroke. Below: stepper field (48px tall, `82.1 KG` 24px 800) + `LOG TODAY` button (text-color fill, bg text, Barlow Condensed 700 14px .1em).
4. Exercise section: header row `TOP SET WEIGHT` / `LAST 6 SESSIONS`. One row card per trained exercise (surface, radius 14, padding 12px 16px): name 15px 600 + loadType label 11px dim · 90×32 sparkline (accent 2px if improving, dim if held; end dot r3) · right column width 56: current top weight 24px 800 + delta 11px 600 (`+2.5` good, `−2.5` good for assisted, `held` dim).

### 4. Plan (`PlanScreen`)
Padding 62px 20px 24px, gap 20.
1. Eyebrow `4 LIFTS · 1 CARDIO · 2 REST` + title `YOUR WEEK` 44px.
2. Week list card (surface, radius 16, rows separated by 1px border, padding 12px 16px): `MON` (Barlow Condensed 700 14px .06em dim, width 34) · name 600 (rest/cardio rows 500 dim) · right tag (Barlow Condensed 600 11px .1em uppercase dim: `7 LIFTS`, `CARDIO`, `REST`). Today's row: bg accent-soft, day + tag in accent, tag reads `TODAY`, name 700. Saturday: `Lower Body B + incline walk` (suffix dim 400).
3. Effort card: eyebrow `HOW HARD`, `1–3 REPS IN RESERVE` (28px 800 uppercase), 13px dim paragraph (copy in mock).
4. Nutrition: eyebrow, 3 tiles `PROTEIN 160–180 g`, `DEFICIT 300–500 kcal`, `STEPS 8–10 k` (24px 800; unit 12px dim), then 4 bullets 13px/1.45 dim.
5. Backup card: eyebrow + `Last export 12 days ago` (from `settings.lastBackup`; >30 days → accent warning text). Buttons `EXPORT DATA` (filled text-color) / `IMPORT` (outline), 46px. Row `Rest-timer sound` with a 44×26 toggle (accent when on, 20px knob bg-colored).
6. Attribution 11px dim with dim links.

### Tab bar (all tabs)
bg, border-top rgba(255,255,255,.06), padding 10px 20px + safe area. Three items: Barlow Condensed 13px .12em uppercase; active 700 text color with a 20×3 accent bar under it (gap 6); inactive 600 dim with an empty 3px spacer.

## Interactions & Behavior
- Today row tap → open `ExerciseDetail`; CTA → open first exercise with `completedSets < sets`.
- Logging a set: row flips to done state, next row becomes active, rest timer appears (existing `onSetLogged`). Suggested transitions: 200ms ease-out on row background/border; timer bar `transform .25s linear` (existing).
- Rest timer `+30 S` extends, `SKIP` dismisses; chime/vibrate unchanged.
- Body weight `LOG TODAY` replaces today's entry (existing).
- Theme follows `prefers-color-scheme`; no in-app toggle.
- Hover is not a target (touch app); `:active` → `filter: brightness(1.1)`; focus-visible outline 2px accent.

## State Management
No new persistent state except optional `settings.goalKg` (number). All motivation figures derive from `setLogs` / `bodyWeights`:
- weekly sessions done = distinct dates with logs in the current Mon–Sun week; streak = consecutive weeks with ≥ planned lift days
- session progress = exercises with `completedSets ≥ sets` / total slots; sets done / Σ sets
- volume = Σ weightKg × reps in week; "best" = max(weightKg, reps) over `sessionHistory`
- ETA `~38 min left` = remaining sets × (avg set time + restSec)

## Assets
- Icons: existing `Icon.tsx` set (check, plus, minus, swap, chevrons, play, edit, trend, alert) — 2px stroke. New: back chevron `M15 5l-7 7 7 7`.
- Fonts: Google Fonts `Barlow` + `Barlow Condensed` (self-host for offline PWA — add to the service-worker precache).
- 3D anatomy: existing `Viewer.tsx`; unchanged.

## Files
- `Redesign.dc.html` — target design, six screens (Today, Detail/Logger, Progress, Plan in dark; Today and Logger in light)
- `Current UI.dc.html` — recreation of the current app for comparison
- `ios-frame.jsx` — presentation-only device bezel; ignore

## Phase 2 — Animated form viewer (rigged glTF + AnimationMixer)

Reference: `Form Viewer Prototype.html` (working three.js runtime, open in a browser) and screens 07/08 in `Redesign.dc.html`.

### Data changes
- `Exercise` gains `tempo: [eccentricSec, concentricSec]` (default `[2, 1]`).
- Cue strings become `{ text: string; phase?: 'eccentric' | 'concentric' }`; untyped cues stay phase-less.
- New asset `public/models/figure.glb`: one rigged low-poly écorché with one `AnimationClip` per exercise, named exactly `Exercise.id`. Muscle groups are separate materials named with the keys in `muscleMap.ts`.

### Viewer.tsx
- Load `figure.glb` once (module-level promise via `GLTFLoader` + `DRACOLoader`); reuse across mounts.
- `const action = mixer.clipAction(clips.find(c => c.name === exercise.id))`; `action.play()`; loop repeat.
- If no clip matches, fall back to the current static model + `MotionHint` arcs.
- Highlight: walk `gltf.scene` materials; primary → accent color + emissive; secondary → secondary color; others → neutral. `emissiveIntensity = concentric ? 0.2 + 0.9·sin(π·(t−ecc)/con) : 0.2` where `t = action.time % (ecc+con)`.
- Expose via ref: `play()`, `pause()`, `seek(0–1)`, `setSpeed(1 | 0.5)`, `setView('front' | 'side' | 'quarter')` (camera presets lerped over 450 ms, ease-in-out; OrbitControls remain active, pan disabled).
- Emit `onPhase(phase)` when the eccentric/concentric boundary is crossed so `ExerciseDetail` can swap the cue.
- Autoplay muted on open; pause when the viewer is collapsed or when a set is logged; resume on tap.

### UI (see screen 07)
- Viewer card: 300 px high canvas, radius 16, view chips top-left (pill group, active = text-color fill), speed pill top-right (`1×` / `½×`), muscle legend bottom-left with pulsing 10 px accent dot, phase label bottom-right.
- Control row under the canvas: 40 px accent play/pause circle; phase timeline = two segments proportional to tempo (eccentric `#2a2e37`, concentric accent/.5) with a 2 px white playhead; labels `LOWER · 2 S` / `PRESS · 1 S` — the active phase label is white/accent, the other dim. Tap on the timeline seeks and pauses.
- Cue card: `CUE n/N` eyebrow + cue text + one 16×3 dot per cue (active = accent). Advances with the phase.
- Expanded mode (screen 08): full-screen canvas, close button, view chips centered, speed top-right, phase name at 44 px accent, both cues listed with the active one highlighted, timeline + `LOOP` toggle in a blurred glass bar.

### Asset pipeline (Blender, one-time)
1. Z-Anatomy rigged écorché (CC-BY-SA 4.0) → decimate ≤ 40k tris; keep muscle-group materials named per `muscleMap.ts`.
2. Clips: Mixamo for bodyweight moves; phone mocap (Rokoko Video / Move One) for machine and cable lifts. Retarget onto the écorché armature (Rokoko Studio or Auto-Rig Pro).
3. Trim each clip to one rep, mark the eccentric/concentric split (becomes `tempo`), loop-clean first/last frames, name the action after `Exercise.id`.
4. Export a single Draco-compressed `figure.glb` (~3–6 MB); add to the service-worker precache.
