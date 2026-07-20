# Presentation Scoring

## Run it locally

1. Install Node.js from https://nodejs.org (LTS version) if you haven't already.
2. Open a terminal in this folder and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open the URL it prints (usually http://localhost:5173) in your browser.

Your saved assessments are stored in the browser's `localStorage`, so they'll
persist between visits on the same device/browser.

## Build for hosting

```bash
npm run build
```

This creates a `dist/` folder containing the finished static site.

## Hosting options (free)

- **Netlify** or **Vercel**: drag-and-drop the `dist` folder onto their
  dashboard, or connect this folder as a GitHub repo for automatic
  redeploys whenever you push changes.
- **GitHub Pages**: push this repo to GitHub, then deploy the `dist`
  folder using GitHub Pages (needs a small `base` path tweak in
  `vite.config.js` if hosted at a sub-path like
  `username.github.io/repo-name`).

## Notes

- Data is stored per-browser, per-device (`localStorage`). If you want data
  shared across multiple teachers/devices, you'd need a real backend/database
  later — ask me when you're ready to scale that far.
