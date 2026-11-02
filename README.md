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
