# THE INDIA GAME

Learn India's 28 states and 8 union territories, their locations, and their
capitals. Three modes: identify a highlighted region on the map, recall
capitals, or sprint through all 36 against a clock.

A TypeScript port of [the-us-game](https://github.com/abishekvenkat/the-us-game)
by Abishek Venkat, whose design and styles it reuses.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # node --test, requires Node 25+
npm run typecheck
npm run build      # tsc --noEmit && vite build
```

Tests run on Node's native TypeScript type-stripping, so there is no test
framework and no build step for them. That is also why all pure game logic
lives in `src/game.ts` rather than in components — Node cannot strip JSX.

## Map data

State and union territory boundaries are from the **Survey of India**, obtained
via [india-geodata](https://github.com/yashveeeeeeer/india-geodata) and used
under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The data has
been simplified and converted to TopoJSON; see `scripts/build-map.mjs`.
Regenerate with `npm run build:map` — the output is committed, so this is not
needed for a normal build.

The source carries 40 features: the 36 entities plus 4 inter-state disputed
slivers, which are dropped by `State_LGD === 0`. Features are joined to the
roster on the numeric LGD code rather than by name, which sidesteps the
source's scholarly transliteration (`ARUNĀCHAL PRADESH`) and a typo
(`CHHAtTĪSGARH`).

## Codes

The Field Guide shows two code systems per entity:

- **ISO 3166-2:IN**, current as of the 23 Nov 2023 revision.
- **LGD codes** from the Local Government Directory, Ministry of Panchayati Raj.

Since the 2023 ISO revision the two agree with the vehicle registration codes
on number plates for 35 of the 36. The exception is Dadra & Nagar Haveli and
Daman & Diu, which is `DH` in ISO but appears as `DD` on plates.

Codes are display-only. Neither is accepted as a typed answer, because
recognising a plate code is not the skill this game teaches.

## Roster

28 states and 8 union territories, current as of the January 2020
reorganisation: Jammu & Kashmir was split into the J&K and Ladakh union
territories in August 2019, and Dadra & Nagar Haveli merged with Daman & Diu in
January 2020.

Several states have more than one capital. One is canonical, and the
alternates are accepted as correct — Nagpur for Maharashtra, Dharamshala for
Himachal Pradesh, Gairsain for Uttarakhand, Jammu for J&K, Kargil for Ladakh.
Renamed places are accepted both ways: Bengaluru/Bangalore, Kolkata/Calcutta,
Thiruvananthapuram/Trivandrum, Odisha/Orissa.

## Licence

Code follows the reference project. Map data is CC BY 4.0, Survey of India.
