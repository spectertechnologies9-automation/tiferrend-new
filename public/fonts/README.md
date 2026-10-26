# Client typefaces — not yet installed

The client specified two commercial typefaces (Oct 2026):

| Role | Typeface | Foundry | Licence needed |
|---|---|---|---|
| Headings, titles, editorial emphasis | **PP Editorial Old** (Regular, Italic, Ultrabold, Ultrabold Italic) | Pangram Pangram | Web licence |
| Body text, descriptions, UI | **Suisse BP International** (Regular, Medium, Bold) | Swiss Typefaces | Web licence |

No font files for either were found in the project or on the development machine. Unlicensed copies must not be used.

## To install, once the studio has the licensed web fonts

1. Put the `.woff2` files in this folder, for example `PPEditorialOld-Regular.woff2`, `PPEditorialOld-Italic.woff2`, `PPEditorialOld-Ultrabold.woff2`, `SuisseBPIntl-Regular.woff2`, `SuisseBPIntl-Medium.woff2` and `SuisseBPIntl-Bold.woff2`.
2. In `src/styles/main.css`, add a `url()` source after the `local()` ones in each `@font-face` block for these families (they sit at the top of the file), for example:
   `src: local('PP Editorial Old Regular'), url('/fonts/PPEditorialOld-Regular.woff2') format('woff2');`
3. Build with `SITE_BASE=/tifferend/` and confirm in the browser (DevTools → Network, font requests) that the files load under the GitHub Pages sub-path as well as at the domain root. If they don't, move the files next to the stylesheet and use a relative `url()`.

Until then the font stacks fall back to Lora (headings) and Inter (body). Both are self-hosted, and the type scale was tuned to suit the final faces.
