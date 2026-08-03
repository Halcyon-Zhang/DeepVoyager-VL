# DeepVoyager-VL project page

This directory contains a statically exportable Next.js project page, following
the same deployment structure as the OmniaBench website.

## Local development

Node.js 22 or newer is recommended.

```bash
cd webpage
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Next.js will refresh the
page as files in `app/` are edited.

To use another port:

```bash
npm run dev -- --port 3001
```

## Production build

```bash
npm run build
```

The static site is generated in `out/`.

For GitHub Pages, build with the repository base path:

```bash
NEXT_PUBLIC_BASE_PATH=/DeepVoyager-VL npm run build:pages
```
