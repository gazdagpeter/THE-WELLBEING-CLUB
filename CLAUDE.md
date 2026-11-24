# CLAUDE.md

Irányelvek a Claude Code (és minden fejlesztő) számára a **The Wellbeing Club** projektben.

## Projekt

- **Márka:** The Wellbeing Club
- **Szlogen:** Move and Connect
- **Típus:** prémium, Awwwards-szintű wellbeing és lifestyle weboldal
- **A weboldal nyelve:** szlovák (`<html lang="sk">`); minden felhasználónak látható szöveg szlovákul készül
- **Kommunikáció a projekt tulajdonosával:** magyarul
- **Design forrása:** a később elkészülő Figma-terv. Vizuális elemeket, szekciókat, színeket, tipográfiát vagy tartalmat **ne találj ki** – csak a Figma-terv vagy kifejezett utasítás alapján valósíts meg.

## Technológiai szabályok

- **React 19** funkcionális komponensekkel és hookokkal.
- **Vite** a build eszköz.
- **TypeScript** `strict` módban – `any` használata kerülendő.
- **GSAP + ScrollTrigger:** mindig a `src/lib/gsap.ts` modulból importálj (`gsap`, `ScrollTrigger`, `useGSAP`), hogy a pluginok egyszer legyenek regisztrálva. React komponensekben a `useGSAP` hookot használd a megfelelő cleanup érdekében.
- **Three.js:** a részecskeanimációk és 3D jelenetek a `src/three/` mappába kerülnek. Ügyelj az erőforrások felszabadítására (`dispose()`), a `devicePixelRatio` korlátozására és a mobil teljesítményre.
- **Mobil-first, reszponzív:** a stílusokat a legkisebb képernyőre írd, majd `min-width` media query-kkel bővítsd.
- **Akadálymentesség:** szemantikus HTML, billentyűzetes navigáció, `prefers-reduced-motion` tiszteletben tartása az animációknál.
- **Teljesítmény:** nehéz modulok (pl. Three.js) lusta betöltése, ahol lehetséges.
- Import alias: `@/` → `src/`.

### Mappastruktúra

| Mappa             | Tartalom                                  |
| ----------------- | ----------------------------------------- |
| `src/components/` | Újrahasznosítható UI-komponensek          |
| `src/sections/`   | Oldalszekciók                             |
| `src/hooks/`      | Egyedi React hookok                       |
| `src/lib/`        | Segédmodulok, központi konfigurációk      |
| `src/three/`      | Three.js jelenetek, részecskerendszerek   |
| `src/styles/`     | Globális stílusok                         |
| `src/assets/`     | Importált média (képek, fontok)           |
| `src/content/`    | Szövegek (később HU / SK nyelvi változat) |
| `public/`         | Változatlanul kiszolgált statikus fájlok  |

### Parancsok

- `npm run dev` – fejlesztői szerver
- `npm run build` – típusellenőrzés + production build
- `npm run lint` – ESLint
- `npm run typecheck` – TypeScript ellenőrzés

- `node scripts/extract-hero-dots.mjs` – a hero pontfigura koordinátáinak újragenerálása a Figma SVG-kből (`src/three/heroDots.json`)

Minden commit előtt a `npm run lint` és a `npm run build` legyen hibamentes.

## GitHub szabályok

- Repository: `gazdagpeter/THE-WELLBEING-CLUB`
- **Kizárólag a `dev` ágon dolgozz.**
- **A `main` ágat soha ne módosítsd közvetlenül** (nincs közvetlen commit vagy push a `main`-re).
- A `main` ágba történő beolvasztás **kizárólag Pull Requesten keresztül**, a projekt tulajdonosának kifejezett engedélyével történhet. PR-t csak kérésre nyiss.
- **Minden elvégzett fejlesztési feladat után** készíts commitot, és pushold a `dev` ágra (`git push -u origin dev`).
- **Force push tilos** (`--force`, `--force-with-lease` sem). Ne írd át a már pusholt történetet.
- **Érzékeny adatot ne tölts fel:** API-kulcsok, tokenek, jelszavak, `.env` fájlok nem kerülhetnek a repóba. Környezeti változókhoz legfeljebb egy titkokat nem tartalmazó `.env.example` commitolható.
- Commit üzenetek: rövid, tárgyszerű, felszólító módú angol összefoglaló (pl. `Add hero section`).
