# Greater Southwest Historical Museum website

This review package contains 15 visitor pages, their source, and the museum's photography. Extract the ZIP and open index.html, or use the local server below. The package keeps search indexing disabled.

## Build and preview

With Node.js 22 or newer, run:

    npm run build
    npm test
    npm start

Open http://127.0.0.1:4175/. The build uses no external packages. For browser and accessibility tests, install the development dependencies with npm ci and npx playwright install chromium, keep the preview server running, then run npm run test:browser and npm run test:seasons.

## Editing

Edit content.json, then rebuild. The location, phone, office hours, general email, visitor pages, image descriptions and photo selections feed the generated pages. Address and hours also feed the homepage's Museum structured data. The social preview links and image URLs use siteUrl. Change that setting when the final public hostname is confirmed.

Place a new museum photograph in assets and update the specific content entry. Homepage card items contain the destination, eyebrow, heading, photo, link label and descriptive alt text in that order. Image widths listed in imageWidths require the corresponding WebP files. The original map is a source master; browsers receive the smaller WebP backgrounds.

October, November and December use museum oak artwork on the homepage. The automatic switch follows America/Chicago time. The footer lets visitors show or hide the seasonal artwork. The homepage links ?season=october, ?season=november, ?season=december and ?season=none allow review at any time.

For an announcement, edit current-event.js. Provide a headline, details and an inclusive end date in YYYY-MM-DD format. Supply a local photo and description if desired. A blank headline keeps the announcement hidden.

## Museum confirmations before public launch

- Caitlin explicitly requested general group bookings from Visit. This package routes general group bookings to her throughout, with Cassandra listed separately for educational activities. Confirm who actually schedules school visits and scavenger hunts.
- Confirm the holiday calendar, car and accessible parking arrangements, accessible entrance and restroom details, and a typical self-guided visit duration. The Visit page gives the verified bus parking and scavenger-hunt accessibility and duration. That duration applies only to the hunt.
- Confirm this year's Santa booking window, program length and Holiday Forest display dates. The previous site and the staging copy disagree on the first two.
- Confirm current Business and Sustaining membership benefits, renewal materials and any approved online checkout. The GSHM application gives the mailing address and check payee. Military Memorial memberships support the separately funded west-wing museum.
- Supply the approved board roster before reintroducing a board page. Concept pages, the internal review page and the unconfirmed roster are excluded from this package.
- Confirm the production site URL before enabling indexing. Publish from a clean directory so old board, review and concept URLs do not continue serving old files. Preserve or redirect important old visitor URLs during domain cutover.
- There is no payment or contact form in this build. A normal link to a confirmed hosted checkout can be added directly. Revisit CSP and visitor data handling if a form or a remote API is introduced. Select a host or proxy that supports HTTP response headers if frame-ancestors or other server-set policies are required.

## Sources used in the review

- Caitlin Vanet's November 7, 2026 email about the preview and website photos.
- Museum membership levels: https://gshm.org/membership/
- Mailing instructions and payee: https://gshm.org/pdf/membership-form.pdf
- Military museum funding and annual/life memberships: https://gshm.org/military-museum/
- Santa's House and the published child fee: https://gshm.org/santas-house/
- Oklahoma Tourism listing (bus parking and facility amenities): https://www.travelok.com/listings/view.profile/id.3213
- Scavenger hunt accessibility: https://gshm.org/scavenger-hunt/
- The external airfield link displayed the Ardmore Army Air Field and Ardmore Air Force Base memorial history when checked November 9, 2026: https://home.brightok.net/~gsimmons/

The images and oak artwork belong to the museum project. This package grants no separate license to them.
