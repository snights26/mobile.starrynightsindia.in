# Public Web and Mobile Parity Audit

**Scope:** staging public-user functionality only. The public Vite application
is the behavioural reference; desktop-only presentation is not copied when a
native pattern is clearer. Admin, careers recruitment, and delivery-provider
operations are outside the customer mobile scope.

**Evidence:** source inspection of the new public Vite project and Expo app,
read-only staging API checks, and browser inspection of the staging Public
site on 2026-09-27. `FULL` means the customer capability and its navigation
are present, not that the markup looks identical.

## Summary

| Status | Count |
| --- | ---: |
| FULL | 25 |
| PARTIAL | 7 |
| MISSING | 1 |
| BROKEN | 0 |
| INTENTIONALLY DIFFERENT | 3 |
| NOT APPLICABLE | 2 |

## Parity matrix

| Area | Web feature | Web source/component | Web API/data | Mobile source/screen | Mobile status | Runtime status | Gap | Recommended mobile equivalent | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home | Hero slides and readable image-first copy | `Header/HeroSlider.jsx` | `/hero-sliders/public` | `app/(tabs)/index.tsx` | FULL | API verified; native carousel static-verified | Mobile intentionally omits the hero CTA button | Native paged carousel with indicators | High |
| Home | Category discovery rail | `Common/DynamicRow.jsx`, category content | `/categories` | `CategoryRail.tsx`, Home | FULL | API/tree contents verified | Added a native horizontal rail; tap enters the category tree | Horizontal native rail | High |
| Home | Global Explorer / Click to Explore | `Pages/Click2Explore/*` | `/categories/tree`, `/packages?regionCode=` and public GeoJSON | `app/global-explorer.tsx`, `ExplorerMap.tsx` | FULL | Static-verified; corrected same-geometry SVG path taps pending device acceptance | The web's 37 India regions and 180 world countries are touch SVG paths, with rails as a fallback | Native segmented map and rail | High |
| Home | World clock entry and time-zone package discovery | `Header/LiveIstClock.jsx`, `Pages/TimeZones/TimeZones.jsx` | category tree; client `Intl` | `app/time-zones.tsx`, Home action | FULL | Browser page verified; native route static-verified | None | Five native analog/digital clocks and time-zone list | High |
| Home | Featured home rows | `Rows/DynamicRowsContainer.jsx` | `/featured-rows/public?visibleOn=home` | Home `FeaturedRowRail` | FULL | Live API metadata verified; device test pending | Mobile filters on exact `visibleOn=home`, preserves `sequence`, and uses row identity for View all | Horizontal package/category lists | High |
| Home | Trending discovery page | `Rows/Trending.jsx` | `/featured-rows/public?visibleOn=trending` | `app/trending.tsx`, discovery shortcuts | FULL | Live API metadata verified; device test pending | Mobile filters on exact `visibleOn=trending`, preserves `sequence`, and includes category rows | Native list by row | High |
| About | Homepage statistics | `Pages/AboutUs/Stats.jsx` | `/homepage-statistics/public` | `app/about.tsx` | FULL | Live API verified; device layout pending | Deliberately moved off the crowded Home surface | Compact statistics card | Medium |
| Home | Occasion popup | `OccasionPopup.jsx` | `/occasion-popups/current` | Home occasion card | PARTIAL | API verified | Mobile displays content but not campaign image or per-campaign dismissal | Native dismissible image/card | Medium |
| Home | Search entry | header/home search | `/packages` | Home and Explore search entries; `app/search.tsx` | FULL | API verified | None | Dedicated native search screen | High |
| Home | ATLAS chatbot entry | `Chatbot/Chatbot.jsx` | `/chatbot/query` | `app/chatbot.tsx`, discovery shortcuts | INTENTIONALLY DIFFERENT | Validation verified; no persistent chat was created | Web floating widget becomes a discoverable native screen | Dedicated screen rather than draggable widget | Medium |
| Home | Light/dark theme control | `theme/ThemeToggle.jsx` | local preference | Theme provider and Settings | FULL | Build verified | Persists Light, Dark or System immediately through AsyncStorage | System/native theme setting | Low |
| Catalogue | All-package catalogue and client-side filtering | `Pages/AllPackages/*` | `/packages` | Explore, Search | PARTIAL | API verified | Mobile lacks web's brand and featured-row query views/pagination controls | Add server-filtered browse entry if brand discovery is prioritised | Medium |
| Catalogue | Brand-specific collections | `config/brands.js`, `/brands/:brandSlug` | `/packages?brand=` | no dedicated route | MISSING | Source verified | Brand is displayed but cannot be browsed as a collection | Product/design decision: branded collection screen or filters | Low |
| Packages | Package cards, price, duration, image, save | `Common/PackageCard.jsx` | `/packages` | `PackageCard.tsx` | FULL | API verified | None | Native cards | High |
| Packages | Detail, gallery, itinerary, inclusions, exclusions, related, share/enquire | `Common/DetailPage.jsx` | `/packages/:code`, `/package-views` | `app/package/[code].tsx` | FULL | Detail API verified; paged gallery static-verified | Horizontal paging, indicators and full-screen viewer replace web lightbox behavior | Accordions and native Share | High |
| Categories | Root categories and child drill-down | `Pages/AllCategories/*` | `/categories/tree` | `app/category/[code].tsx`, Explore, CategoryRail | FULL | Tree API verified; route static-verified | Added child drill-down | Two-column child grid then packages | High |
| Gallery | Public grid, modal viewer, progressive loading | `Pages/Gallery/*` | `/gallery/public` | `app/gallery.tsx` | FULL | Gallery API verified | Compact native grid and full-screen viewer replace web load-more presentation | Keep native viewer; add paging only if API pagination is introduced | Low |
| Updates | Public notification list/filter/document view | `Pages/Notifications/*` | `/notifications/public` | `app/notifications.tsx` | FULL | API verified; route static-verified | Added dynamic type filters | Chips and platform document opening | Medium |
| Navigation | Header navigation: home, trending, gallery, updates, about, contact, enquire | `Header/Header.jsx`, `Footer.jsx` | routes above | Tabs + Home actions + stack routes | FULL | Static-verified | Visible `What's New` is intentionally removed; valid Notifications remains in Profile | Tabs plus focused shortcut list | High |
| Contact | Phone/email/maps and contact form | `Pages/Contact/Contact.jsx` | `/contact` | `app/contact.tsx` | FULL | Source/build verified | Platform call/mail/map intents are the appropriate native equivalent of embedded desktop contact controls | Keep external map/call/mail native | Low |
| Enquiry | Travel form, validation, success/error | `Pages/Enquiry/NewEnquiry.jsx` | `/enquiries` | `app/enquiry.tsx` | FULL | Invalid-payload API contract verified | Added web's `Other` purpose and lead-source choices | Native selectors/date input | High |
| About | Full company narrative/timeline/team | `Pages/AboutUs/AboutUs.jsx` | static assets | `app/about.tsx` | PARTIAL | Source/build verified | Compact summary omits desktop narrative/team imagery | Product decision: expand native story or link to public page | Low |
| Legal | Privacy, terms, booking/cancellation/payment/delivery policies | `Pages/LegalPolicies/*`, Footer | static web content | Settings links | INTENTIONALLY DIFFERENT | Build verified | Mobile opens maintained public policy pages rather than duplicating large legal HTML | Safe external public-page links | Low |
| Auth | Google login, API-issued sessions, refresh/logout | `AuthContext.jsx`, `Login.jsx` | `/auth/google`, `/auth/refresh`, `/auth/logout`, `/users/me` | `AuthProvider.tsx`, `login.tsx` | FULL | Web live verified; Android native flow owner-verified and persistence ADB-verified | Platform-specific Google UI is correct | GIS on web; Credential Manager on Android | High |
| Auth | Email/password, registration, reset password | public routes reviewed | none in current customer flow | none | NOT APPLICABLE | Source verified | No equivalent supported public login contract | Do not invent one | — |
| Profile | Profile display, completion/edit, logout | `Dashboard*`, completion guard | `/users/me`, completion/update | Profile, `profile-edit.tsx` | FULL | Authenticated profile UI/persistence ADB-verified | None | Native account screen | High |
| Dashboard | Account summary shortcuts | `Dashboard.jsx`, side panel | user, tours, payments, notifications, views | Profile menu + tabs | PARTIAL | Source/build verified | Mobile gives direct screens but not the aggregate dashboard card/table | Optional summary dashboard | Low |
| Bucket | Saved package list, remove, package navigation, search | `MyBucketList.jsx` | `/users/me/bucket-list` | Bucket tab | PARTIAL | API-level staging verified | No saved-list text search | Add only if large customer buckets demand it | Low |
| Recently viewed | List, removal/clear, package navigation | `RecentlyViewedPackages.jsx` | `/package-views`, `/package-views/me` | `recently-viewed.tsx` | PARTIAL | API-level staging verified | No web search/image treatment | Existing native list is functionally sufficient | Low |
| Notifications | Personal account notifications | dashboard side panel | `/notifications/me` | Notifications screen | FULL | API-level staging verified | No web unread state exists to port | Native filtered list | Medium |
| Trips | Tours, dates, accommodation, payment summary | `Dashboard/MyTours.jsx` | `/mytours`, tour detail | Trips tab, `trip/[tourId].tsx` | PARTIAL | API-level staging verified | Web transport slip, driver and vehicle details are not exposed in mobile | Add a customer-safe transport-slip view if API payload is confirmed | Medium |
| Payments | Payment history and hosted link return refresh | `Dashboard/MyPayments.jsx` | `/my-payments` | `payments.tsx` | FULL | API-level staging verified; no payment opened | None | System browser then authoritative refetch | High |
| Invoice | Invoice display/download | `Common/invoice.jsx` | `/payments/invoice/:tourId` | `invoice/[tourId].tsx` | PARTIAL | API-level staging verified | Summary/share exists; document download requires an actual server-issued file fixture | Preserve private/signed download design | Medium |
| Travel photos | Customer gallery, upload/read/delete | `Common/MyFeed.jsx` (not public-nav routed) | photo routes | `my-photos.tsx` | INTENTIONALLY DIFFERENT | API-level staging lifecycle verified | Mobile has a discoverable, direct-private-Blob flow, stronger than the dormant web component | Native picker and scoped upload | Medium |
| Private documents | Signed private download authorization | API capability | private Blob auth | no generic document-download screen | MISSING | Server lifecycle verified | No generic owned signed-download control is surfaced beyond photo consumption | Add after a safe owned staging fixture confirms the exact API response | Medium |
| Careers | Resume submission | `Pages/Career/Career.jsx` | careers upload | none | NOT APPLICABLE | Source verified | Recruitment is not a customer travel capability | Keep outside customer app | — |
| Footer utilities | WhatsApp/social, external links, footer navigation | `Footer.jsx` | external URLs | Contact/Settings + platform Linking | PARTIAL | Source/build verified | Some social destinations are not surfaced | Product decision: add social links or keep support-focused mobile navigation | Low |

## API coverage

### Public endpoints used by both applications

- `GET /packages` (mobile also supports `category`, `brand`, `rowId`, and
  `regionCode` query forwarding)
- `GET /packages/:code`
- `GET /categories`, `GET /categories/tree`, `GET /categories/:code/packages`
- `GET /hero-sliders/public`
- `GET /featured-rows/public?visibleOn=home|trending`
- `GET /homepage-statistics/public`
- `GET /occasion-popups/current`
- `GET /gallery/public`
- `GET /notifications/public`
- `POST /enquiries`, `POST /contact`, `POST /chatbot/query`
- Google/session endpoints and the authenticated user, bucket, package-view,
  tour, payment, invoice, notification and travel-photo routes.

### Web-only API usage

- `GET /public-cache/manifest`: Vite IndexedDB/browser-cache coordination.
  Mobile intentionally relies on the server's CDN headers and TanStack Query
  session cache instead of copying IndexedDB.
- `GET /packages?brand=` is exposed by the mobile service but has no dedicated
  branded browse route yet.

### Mobile-only API usage

- Scoped direct private-Blob travel-photo sequence:
  `POST /upload-photo/authorize`, provider PUT from the native picker, and
  `POST /upload-photo/finalize`. The public web's routed UI does not expose
  this modern flow.

### Available but not yet surfaced as a dedicated mobile capability

- Brand package collections (`/packages?brand=`).
- Customer-safe transport-slip detail if its payload/API ownership contract is
  confirmed for mobile.
- An invoice/private-document download control once a safe owned staging
  fixture provides a signed document URL.

## Changes made from this audit

1. Added the home category rail and category-tree drill-down.
2. Added the Global Explorer route with touch SVG maps sourced from the same
   public India/world GeoJSON assets as Web, plus domestic/international rails.
3. Added five real analog/digital `Intl` clocks and time-zone package discovery.
4. Made Trending primary navigation and added focused Home actions for
   Trending, Click to Explore, World Time and Chat with ATLAS.
5. Made all row `View all` actions collection-specific, with `/packages?rowId=`
   for package collections and an explicit server-row category collection screen
   keyed by `rowId` and `visibleOn` for compact featured categories.
6. Reworked the mobile hero, statistics, package image gallery, bucket access,
   Profile trip access and persistent theme selector. Removed visible
   `What's New`, About and Contact from the Home discovery surface.

## Product decisions still needed

- **Brand collections:** either add a branded-journey entry to Explore or
  explicitly keep brands as web-only marketing navigation.
- **Long-form About/social content:** choose between a richer native story and
  maintained public-page links.
- **Transport slips/private invoice download:** first confirm which fields and
  documents are safe for a customer mobile view, then add owned/signed access.

## Verification limits

- No customer enquiry, payment, email, photo mutation, or private document
  download was created during this audit.
- The current device-feedback corrections are JavaScript-only. They passed
  typecheck, lint and Android export; the next internal Preview APK must be
  installed before visual/device-only functionality is marked verified.
- Google account selection, backend audience acceptance, refresh and logout
  were manually observed by the owner on the current Preview build. Automated
  ADB verification independently confirmed the installed app process remains
  alive, has no old font crash, renders an authenticated profile, and restores
  that state after force-stop/relaunch.
