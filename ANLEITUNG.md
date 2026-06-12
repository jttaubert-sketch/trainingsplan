# Trainings-App aufs iPhone bringen (~10 Minuten)

## Was du bekommst
Eine eigenständige Web-App: eigenes Icon auf dem Homescreen, startet im Vollbild,
funktioniert offline, Häkchen werden lokal auf dem iPhone gespeichert.

## Weg A — GitHub Pages (empfohlen, dauerhaft kostenlos)

1. **Konto:** Auf github.com kostenloses Konto anlegen (falls noch keines vorhanden).
2. **Repository:** Oben rechts „+" → „New repository" → Name z. B. `training` →
   „Public" → „Create repository".
3. **Dateien hochladen:** Im neuen Repository „uploading an existing file" anklicken
   und diese 5 Dateien aus dem ZIP hineinziehen:
   `index.html`, `sw.js`, `manifest.webmanifest`, `icon-180.png`, `icon-512.png`
   → unten „Commit changes".
4. **Pages aktivieren:** Settings → Pages → unter „Branch" `main` auswählen → Save.
   Nach 1–2 Minuten steht oben die URL, z. B.
   `https://DEINNAME.github.io/training/`
5. **Aufs iPhone:** Die URL in **Safari** öffnen → Teilen-Symbol →
   **„Zum Home-Bildschirm"** → Hinzufügen. Fertig.

## Weg B — Netlify (Drag & Drop, noch schneller)

1. Konto auf netlify.com anlegen → „Add new site" → „Deploy manually".
2. Den entpackten Ordner mit allen 5 Dateien ins Browserfenster ziehen.
3. Die erzeugte URL in Safari öffnen → „Zum Home-Bildschirm".

## Updates einspielen

Wenn Claude den Plan aktualisiert (z. B. August-Dienstplan), bekommst du eine neue
`index.html`. Die ersetzt du einfach im GitHub-Repository („Add file" → Upload,
gleiche Datei überschreibt die alte) bzw. ziehst den Ordner bei Netlify neu rein.
**Deine Häkchen bleiben erhalten** — sie liegen lokal auf dem iPhone, nicht in der Datei.

## Wichtig

- Die App speichert nur auf DEINEM Gerät. Anderes Gerät = eigener Fortschritt.
- Beim allerersten Öffnen einmal mit Internet laden — danach geht's auch offline.
- iOS löscht lokale Daten von Web-Apps, wenn man sie **monatelang** gar nicht
  öffnet. Bei regelmäßiger Nutzung (dein Fall) passiert das nicht.
