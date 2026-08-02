<div align="center">

<img src="../banner.svg" alt="Legendaz" width="100%">

<br/><br/>

[![Jellyfin](https://img.shields.io/badge/Jellyfin-10.11.x-00a4dc?style=flat-square&logo=jellyfin&logoColor=white)](https://jellyfin.org)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../LICENSE)
[![Languages](https://img.shields.io/badge/languages-25-brightgreen?style=flat-square)](#supported-languages)
[![JavaScript Injector](https://img.shields.io/badge/requires-JavaScript%20Injector-orange?style=flat-square)](https://github.com/n00bcodr/Jellyfin-JavaScript-Injector)
[![Bazarr](https://img.shields.io/badge/requires-Bazarr-purple?style=flat-square)](https://github.com/enoch85/bazarr-jellyfin)

<br/>

**[🌐 Website](https://fabianoortega-ops.github.io/jellyfin-legendaz) · [📦 Installieren](#installation) · [🌍 Sprachen](#supported-languages) · [🐛 Probleme](https://github.com/fabianoortega-ops/jellyfin-legendaz/issues)**

<br/>

---

### 🌍 Übersetzungen
[🇬🇧 English](../README.md) · [🇧🇷 Português](README.pt.md) · [🇫🇷 Français](README.fr.md) · [🇪🇸 Español](README.es.md) · [🇮🇹 Italiano](README.it.md) · [🇷🇺 Русский](README.ru.md) · [🇨🇳 中文](README.zh.md) · [🇯🇵 日本語](README.ja.md) · [🇰🇷 한국어](README.ko.md) · [🇵🇱 Polski](README.pl.md)
*Möchtest du deine Sprache hinzufügen? [Öffne einen PR!](https://github.com/fabianoortega-ops/jellyfin-legendaz/pulls)*

---

</div>

## 🎯 Was es tut

Legendaz fügt eine **🔍 Schaltfläche** im Jellyfin-Player-OSD ein. Ein Klick öffnet ein Suchpanel — suche nach Sprache, wähle ein Ergebnis, und der Untertitel wird heruntergeladen, die Bibliothek aktualisiert und der Track automatisch ausgewählt.

```
  ♥  🔁  CC  🔍  🎵  ─────────  ⚙  ⛶
              ↑
         Legendaz
```

---

## ✨ Funktionen

| Funktion | Beschreibung |
|---|---|
| 🔍 **Im-Player-Suche** | Schaltfläche im OSD — ohne den Player zu verlassen |
| ⬇️ **Ein-Klick-Download** | Ergebnis wählen und der Untertitel wird automatisch heruntergeladen |
| 🎯 **Automatische Auswahl** | Heruntergeladener Untertitel wird ohne manuellen Eingriff aktiviert |
| 🌍 **25 Sprachen** | Erkennt automatisch die Browser- oder Jellyfin-Profilsprache |
| 🔗 **Bazarr-Integration** | Sucht alle konfigurierten Bazarr-Anbieter |

---

## 📦 Installation

### Schritt 1 — JavaScript Injector installieren (erforderlich)

Gehe zu **Dashboard → Plugins → Repositories → +** und füge hinzu:

```
https://raw.githubusercontent.com/n00bcodr/jellyfin-plugins/main/10.11/manifest.json
```

> Für Jellyfin 10.10.x verwende: `https://raw.githubusercontent.com/n00bcodr/jellyfin-plugins/main/10.10/manifest.json`

Gehe zu **Catalog**, finde **JavaScript Injector** und klicke **Install**. Starte Jellyfin neu.

> **Docker / TrueNAS:** Wenn du einen Berechtigungsfehler siehst, installiere auch [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) (v2.2.1.0+).

---

### Schritt 2 — Bazarr-Plugin installieren (erforderlich)

Installiere das [Bazarr Jellyfin-Plugin](https://github.com/enoch85/bazarr-jellyfin) und konfiguriere es mit deiner Bazarr-URL und API-Key.

---

### Schritt 3 — Legendaz installieren

Gehe zu **Dashboard → Plugins → Repositories → +** und füge hinzu:

```
https://fabianoortega-ops.github.io/jellyfin-legendaz/manifest.json
```

Gehe zu **Catalog → Subtitles**, finde **Legendaz** und klicke **Install**.

---

### Schritt 4 — Jellyfin neu starten

Starte einmal neu. Die 🔍 Schaltfläche erscheint im Player-OSD neben dem Untertitel-Button.

---

## 🌍 Unterstützte Sprachen

| Language | Code | | Language | Code |
|---|---|---|---|---|
| English | `en` | | Svenska | `sv` |
| Português | `pt` | | Norsk | `nb` |
| Deutsch | `de` | | Dansk | `da` |
| Français | `fr` | | Suomi | `fi` |
| Español | `es` | | Čeština | `cs` |
| Italiano | `it` | | Slovenčina | `sk` |
| Nederlands | `nl` | | Magyar | `hu` |
| Русский | `ru` | | Română | `ro` |
| 中文 | `zh` | | Türkçe | `tr` |
| 日本語 | `ja` | | العربية | `ar` |
| 한국어 | `ko` | | Українська | `uk` |
| Polski | `pl` | | Ελληνικά | `el` |
| | | | Català | `ca` |

---

## 💬 Community

| Platform | Link |
|---|---|
| 💬 Discord (Official) | [discord.gg/zHBxVSXdBV](https://discord.gg/zHBxVSXdBV) |
| 💬 Discord (Community) | [discord.gg/N3M99fNxbK](https://discord.gg/N3M99fNxbK) |
| 🌐 Forum | [forum.jellyfin.org](https://forum.jellyfin.org) |
| 🟠 Reddit | [r/jellyfin](https://www.reddit.com/r/jellyfin) |

---

## 🔗 Verwandte Projekte

- [JavaScript Injector](https://github.com/n00bcodr/Jellyfin-JavaScript-Injector) — Erforderliche Abhängigkeit.
- [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) — Behebt Berechtigungsprobleme bei Docker/TrueNAS.
- [Bazarr Jellyfin plugin](https://github.com/enoch85/bazarr-jellyfin) — Erforderliche Abhängigkeit.
- [AutoPlay Toggle](https://github.com/fabianoortega-ops/jellyfin-autoplay-toggle) — Autoplay für nächste Episode direkt im Player steuern.
- [awesome-jellyfin](https://github.com/awesome-jellyfin/awesome-jellyfin) — Kuratierte Liste von Jellyfin-Plugins und Tools.

---

## 🤝 Mitwirken

- 🌍 **Übersetzen** — füge `README.xx.md` für deine Sprache hinzu
- 🐛 **Fehler melden** — [öffne ein Issue](https://github.com/fabianoortega-ops/jellyfin-legendaz/issues)
- 💡 **Funktionen vorschlagen** — Ideen willkommen
- ⭐ **Stern geben** — hilft anderen, das Plugin zu entdecken

---

<div align="center">

Mit ♥ für die [Jellyfin](https://jellyfin.org)-Community erstellt

[MIT License](../LICENSE) · [Website](https://fabianoortega-ops.github.io/jellyfin-legendaz) · [Releases](https://github.com/fabianoortega-ops/jellyfin-legendaz/releases)

</div>

