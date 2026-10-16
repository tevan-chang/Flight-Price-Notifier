# Flight Price Notifier

Vite + React + React Router single-page app (client-side only). Auth via Supabase.

## Routes

`/` landing · `/app` dashboard (requires sign-in) · `/sign-in` · `/sign-up` (`/auth` is kept as an alias for sign-in)

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # type-check + static build to dist/
npm run preview  # serve dist/ locally
npm test
```

## Deploy (Vercel)

Static SPA: build command `npm run build`, output directory `dist`. `vercel.json` rewrites every path to
`index.html` so deep links such as `/app` resolve client-side.
