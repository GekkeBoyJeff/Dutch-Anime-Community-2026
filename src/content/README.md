# Let op: dit is de terugvaloptie, niet de live inhoud

De bestanden in deze map zien eruit als de inhoud van de site. Dat zijn ze meestal niet.

Zodra `SUPABASE_SERVICE_ROLE_KEY` in de omgeving staat — en dat is zo bij elke build en elke deploy —
lezen de accessors in `src/lib/content/` de pagina's en de site-chrome uit **Supabase**. Deze
bestanden zijn dan alleen nog de terugval voor een lokale sessie zonder die sleutel. Zie
`pages.ts:34-48` en `structures.ts:23-35`.

- Iets hier wijzigen verandert de live site niet. Dat gaat via `/builder` of via de database.
- De twee kunnen uit elkaar lopen, en dat is al gebeurd.
- `npm run seed` schrijft déze bestanden over de database heen, en gooit weg wat via de editor is
  gewijzigd. Draai hem alleen als je dat bedoelt.

## Werk je in deze map, bouw dan met een lege sleutel

```bash
SUPABASE_SERVICE_ROLE_KEY= npm run build:plain
```

Anders prerendert de build de database en niet jouw bestanden: je ziet groen, terwijl een nieuwe
pagina hier niet eens in de routelijst staat. De build valideert alleen de bron die op dat moment
actief is, en iedereen die kan deployen heeft die sleutel in `.env.local`. Zelfde reden voor
`npm run dev`.
