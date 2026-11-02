# Greater Southwest Historical Museum website

Review-stage museum website prepared by Inselman Digital. This repository does not deploy to gshm.org.

## Local preview

Requires Node.js 22 or newer. No dependency installation is required.

```sh
npm run build
npm test
npm start
```

Open http://127.0.0.1:4175/index.html. The server binds to this computer only.

## Browser checks

With the local server running, run `npm ci`, `npx playwright install chromium`, then
`npm run test:browser`. This checks all 18 pages at 320, 390, 810, 1024 and 1440
pixels wide, including navigation, photo dialogs, focus restoration, slideshow
controls, images, fragment links and overflow. Desktop and phone runs also scan
WCAG A/AA rules with axe. Results and screenshots go to `work/qa/` (ignored by Git),
or the folder specified by `QA_OUTPUT`. Automated checks do not replace testing
with real devices and assistive technology.

## Museum polish preview

The `preview/museum-polish` branch preserves the current design and assets, removes
the duplicate homepage mission and repeated top-bar/sidebar hours, and exposes
Membership and Give directly in navigation. Closed photo dialogs are explicitly
hidden; opening focuses Close, and closing restores focus to the photograph.
The generator also retains the corrected logo heading markup on rebuild.

Review this branch before merging into the branch configured as the GitHub Pages
source. This branch does not create a separate hosted preview or change Pages
settings. After merging, wait for the Pages deployment and check the staging URL.

## Editing

- content.json: central content, contacts, board order, photographs, palettes and per-page header framing.
- build.cjs: generates HTML and appearance.css.
- styles.css: shared layout and responsive styling.
- site.js: accessible menus, slideshow and photo enlargement.
- assets/: museum images and original oak logo.

Rebuild after content changes; generated HTML is committed for easy review. Add photos to a page's photos array with src, alt and caption. headingPhoto, headingPhotoPosition and headingPhotoFit control its banner.

## Review status

Heritage Green is the main direction. The existing copper and navy concepts still contain layout differences; the requested color-only variants are pending. Content and replacement photography still need museum approval. Pages remain noindex. The private developer dashboard, internal edit register, review questions, logs and screenshots are intentionally excluded.

## Publishing

No deployment workflow or GitHub Pages configuration is included. Before launch, resolve museum content approvals, prepare a public-only build, remove review concepts and source files from the hosting package, configure redirects from original URLs, and review indexing and hosting security headers. A public source repository is not a production deployment.

## Assets

Existing museum images, map and logo were sourced from gshm.org for this museum project. No open-source license is granted for museum branding or photography.

## Adding museum photographs later

Keep image files in `assets/`, using short filenames such as `gallery-tools.jpg`.
You can replace an existing file with the same name to update every place using it,
or add a new file and change only the relevant `src`/photo field in `content.json`.
The homepage uses `hero.src`, `home.slideshow.slides`, `home.cards` (image filename
at index 3), `home.storyPhoto.src`, and `home.programs[].photo`. Each interior page
has a `photos` list: add `{ "src": "assets/gallery-tools.jpg", "alt": "Describe the
actual photograph", "caption": "Optional visible caption" }` to add a framed,
enlargeable photograph automatically. Update alt text whenever an image changes.
For interior banners use `headingPhoto`, `headingPhotoPosition`, and
`headingPhotoFit`. Run `npm run build` and `npm test`, then check desktop and phone
previews before publishing. No layout rewrite is needed to add or swap images.

Gallery additions automatically receive the shared frame, soft shadow, caption
styling, and photo viewer. Their 3:2 viewing areas show the complete photograph
without stretching or cropping, including portrait images. Homepage feature cards
and banners remain editorial crops; choose landscape images with the subject away
from the edges and review both screen sizes. Use a distinct file per subject when
replacing repeated photos. Keep captions concise and describe each image in its alt
text. Resize and compress new photographs for web use before adding large batches;
keep full-resolution originals separately. Gallery images load lazily and reserve
space so adding more photos does not require loading them all at the top of a page.

## Automatic seasonal decorations

The October, November and December decorations repeat every year. October runs
October 1–31, November runs November 1–30, and December runs December 1–31.
January through September use the regular design. Dates follow Ardmore's local
clock (`America/Chicago`), including daylight saving time, rather than each
visitor's time zone. The browser uses the visitor device's clock to determine the
current instant. A page opened across midnight updates at the minute boundary;
returning from a suspended/background tab refreshes immediately.

No monthly deployment or paid scheduler is needed. `seasonal.js` contains a single
`settings.mode` switch: `auto` (default), `none` (disable), or `october`, `november`,
`december` (manual override). Publish changes to that setting normally. Original
museum photos and text remain unchanged. Decorations are static, noninteractive,
hidden from assistive technology and print, and smaller on phones. New photo
entries do not require any seasonal configuration. With JavaScript disabled the
normal museum design remains available.

Run `npm test` for calendar-boundary checks and, with the local server running,
`npm run test:seasons` for seasonal desktop/mobile checks and midnight transitions.

### Presentation links

Use `?season=october`, `?season=november`, or `?season=december` on the homepage
URL to preview a seasonal treatment at any time. Use `?season=none` for the normal
design. The selection follows internal page links in that preview, but is never
stored or applied to other visitors. Opening the normal site URL restores the
automatic schedule; invalid preview values also fall back to automatic selection.
