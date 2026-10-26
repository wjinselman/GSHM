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

## Nearby-community visitor guides

Ten town guides and nearby-communities.html are generated from regional entries in content.json. They have individual titles/descriptions and origin-specific map links. Only the community hub appears in the footer. No travel-time promises, unverified ZIP lists or town-based museum branches are claimed. Preview noindex remains in place until approved production launch; these pages are not yet intended to rank.
