# Irfan Ansari — Portfolio

Personal portfolio site. Static HTML + Tailwind CSS (compiled) + vanilla JavaScript.

**Live:** _add your deployed URL here_

## Structure

```
index.html          markup
src/input.css       Tailwind source + custom CSS  →  built into assets/styles.css
assets/styles.css   compiled stylesheet (committed, so the site works with no build step)
assets/main.js      all page behaviour
assets/profile.jpg  profile photo
```

## Local development

```bash
npm install
npm run dev      # rebuilds assets/styles.css on every change
```

Then open `index.html` in a browser.

To produce the minified stylesheet before committing:

```bash
npm run build
```

> **Important:** any Tailwind class added to `index.html` needs a rebuild, or it
> will be missing from `assets/styles.css`. Classes that only ever appear inside
> `assets/main.js` (toggled at runtime) must also be listed in the `safelist`
> array in `tailwind.config.js`, otherwise the build strips them.

## Still to do

- [ ] Add `assets/Irfan-Ansari-Resume.pdf` — the hero Resume button links to it
- [ ] Replace the placeholder domain in the `og:`/`canonical`/JSON-LD tags in `index.html`
- [ ] Add project screenshots to the two project cards
- [ ] Set `FORM_ENDPOINT` at the top of `assets/main.js` for real inbox delivery
