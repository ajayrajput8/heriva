# Made By Her — React Frontend

This is a screenshot-matched React/Vite frontend for the Made By Her website shown in the supplied reference images.

## Included pages

- Home
- Shop / All Products
- Product Details
- Our Women
- Our Story / About
- Village Partners
- Impact
- Cart + Checkout
- My Account / Orders

## Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Backend

The starter API layer points to:

`http://localhost:8080/api`

The current Spring Boot backend uses JWT Bearer authentication.

Important: the visual pages are populated with local reference assets so the layout looks like the screenshots immediately. Replace the local images with your final Cloudinary/S3 URLs when wiring the product APIs.

## Project structure

```text
src/
  components/
  data/
  pages/
  api.js
  App.jsx
  main.jsx
  styles.css
public/
  assets/
```

The CSS is intentionally self-contained so the visual design can be tuned from one file.
