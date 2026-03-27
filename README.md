# NANO Flow Boost (Editable Local)

This project is a local editable clone of the Base44 site, prepared to run on localhost with standard frontend tooling.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Main files you will edit

- `index.html` - document meta, root container, global includes
- `assets/index-BNnXIrVO.css` - all styles
- `assets/index-DX6T6BgQ.js` - app logic (formatted to be readable/editable)

## Helpful commands

```bash
npm run format
npm run build
npm run preview
```

## Notes

- Base44 tracking and badge embed were removed to keep this independent.
- The app was delivered by Base44 as a bundled build, so the JavaScript is now formatted for easier edits, but it is still compiled output.
