# The Wellbeing Club

**Move and Connect.**

A The Wellbeing Club hivatalos weboldalának forráskódja – prémium, szlovák nyelvű wellbeing és lifestyle weboldal.

> A projekt jelenleg a technikai alapozás fázisában van. A felület a később elkészülő Figma-terv alapján kerül megvalósításra.

## Technológiák

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [GSAP](https://gsap.com/) + ScrollTrigger (`@gsap/react`)
- [Three.js](https://threejs.org/) – későbbi részecskeanimációkhoz
- Reszponzív, mobil-first megközelítés

## Követelmények

- Node.js 22 (lásd `.nvmrc`)
- npm

## Telepítés és futtatás

```bash
npm install
```

```bash
npm run dev
```

## Parancsok

| Parancs             | Leírás                                   |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Fejlesztői szerver indítása              |
| `npm run build`     | Típusellenőrzés + production build       |
| `npm run preview`   | A production build helyi előnézete       |
| `npm run lint`      | ESLint futtatása                         |
| `npm run typecheck` | TypeScript típusellenőrzés               |

## Projektstruktúra

```
├── public/            # Statikus fájlok (változatlanul másolódnak)
├── src/
│   ├── assets/        # Importált képek, fontok, médiafájlok
│   ├── components/    # Újrahasznosítható UI-komponensek
│   ├── hooks/         # Egyedi React hookok
│   ├── lib/           # Segédmodulok (pl. központi GSAP-beállítás)
│   ├── sections/      # Oldalszekciók (a Figma-terv alapján)
│   ├── styles/        # Globális stílusok
│   ├── three/         # Three.js jelenetek, részecskerendszerek
│   ├── App.tsx
│   └── main.tsx
├── index.html
└── vite.config.ts
```

## Git munkafolyamat

- A fejlesztés kizárólag a `dev` ágon történik.
- A `main` ágba csak Pull Requesten keresztül, jóváhagyás után kerülhet kód.

Részletes szabályok: [CLAUDE.md](./CLAUDE.md).
