# Mahmoud Hamdy Hashim — Portfolio

A one-page site divided into 6 tabs: Home, Research, Publications, Projects, Education, Contact.
Each tab has its own link (for example `index.html#research`), so you can send someone straight to a tab, and the browser Back button works.

## Files
- `index.html` — all content. Each tab is a `<section class="panel" data-panel="...">`.
- `assets/css/styles.css` — all styling. Colors are the variables at the top (`--bg`, `--accent`, ...).
- `assets/js/main.js` — tab switching, animations, filters, CV viewer.
- `assets/docs/Mahmoud_Hamdy_Hashim_CV.pdf` — CV.
- `assets/images/mahmoud.jpeg` — profile photo.

## Animations and interactions
- Switching tabs: the old tab fades out, the headline rises word by word, and content appears in order.
- A sliding underline follows the active tab (main tabs, research sub-tabs, filters).
- Home: photo reveal, numbers count up, live Edmonton time.
- Research: two sub-tabs (Screening model / Aesthetic evaluation). The line figures draw themselves, and the screening figure has a scanning line. The 4 screening steps light up in order (hover or click to pick one).
- Publications: filter by Podium / Poster; click an entry to open its author list.
- Projects: filter by topic; rows highlight on hover.
- Contact: copy-email button; CV opens in a viewer (on phones it opens the PDF directly).
- Arrow keys (← →) move between the main tabs.

## Light / dark theme
- The button next to "CV" switches between the navy dark theme and the light theme. The site remembers each visitor's choice.
- Theme colors are at the top of `styles.css`: `:root` = dark, `[data-theme="light"]` = light.

## Event photos (Publications tab)
- Put photos in `assets/images/events/` with these names: `wcb-2026-1.jpg` … `wcb-2026-6.jpg`, `sosort-2026-1.jpg` … `sosort-2026-6.jpg`, `abbme-2025-1.jpg` … `abbme-2025-6.jpg`.
- Photo `-1` is shown largest. The layout adjusts to 1–6 photos. Missing photos and empty events are hidden.
- Clicking a photo opens a full-screen viewer (← → keys to browse, Esc to close).
- To add a new event, copy one `<div class="event-photos">` block in `index.html` and change the names.

## Common edits
- **Add a project:** copy one `<article class="proj rv" ...>` block. Set `data-cat` to any of `medical cv ml signal`, and update the counts in the filter buttons.
- **Add a publication:** copy one `<article class="pub rv" ...>` block. Set `data-type` to `podium` or `poster`.
- **Use your own research figures:** inside each `<figure class="figure">`, replace the `<svg>...</svg>` with `<img src="assets/images/your-figure.png" alt="...">`.
