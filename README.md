# SEZMOO — strona

Wielostronicowa strona studia SEZMOO (z blogiem). Gotowa do hostowania na GitHub Pages.

## Strony
- `index.html` — strona główna (portfolio, usługi, studio, zespół, opinie, kontakt)
- `blog.html` — lista wpisów
- `artykul.html` — szablon pojedynczego artykułu
- `design-system.html` — wewnętrzny brand book / system (tokeny + komponenty)

## Pliki wspólne
- `styles.css` — style strony
- `ds.css` — style strony design-system
- `app.js` — interakcje (kursor, scrubber, reveal, parallax, menu, formularz)
- `assets/` — logo, loga klientów, zdjęcia portfolio i zespołu
- `uploads/` — wideo (showreel hero, trailer Audi, BTS Baltic)
- `.nojekyll` — wyłącza przetwarzanie Jekyll, pliki serwowane 1:1

## Publikacja na GitHub Pages
1. Wgraj zawartość tego folderu do repozytorium (gałąź `main`, katalog główny).
2. Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / `/ (root)`.
3. Strona pojawi się pod `https://<user>.github.io/<repo>/`.

Czcionki (Archivo, Space Mono) ładują się z Google Fonts — działają od razu, bez konfiguracji.
