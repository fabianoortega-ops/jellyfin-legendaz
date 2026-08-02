<div align="center">

<img src="banner.svg" alt="Legendaz — Jellyfin Subtitle Search" width="100%">

<br/>
<br/>

[![Jellyfin](https://img.shields.io/badge/Jellyfin-10.11.x-00a4dc?style=flat-square&logo=jellyfin&logoColor=white)](https://jellyfin.org)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Languages](https://img.shields.io/badge/languages-25-brightgreen?style=flat-square)](#-supported-languages)
[![JavaScript Injector](https://img.shields.io/badge/requires-JavaScript%20Injector-orange?style=flat-square)](https://github.com/n00bcodr/Jellyfin-JavaScript-Injector)
[![Bazarr](https://img.shields.io/badge/requires-Bazarr-purple?style=flat-square)](https://github.com/enoch85/bazarr-jellyfin)

<br/>

**[🌐 Website](https://fabianoortega-ops.github.io/jellyfin-legendaz) · [📦 Install](#-installation) · [🌍 Languages](#-supported-languages) · [🐛 Issues](https://github.com/fabianoortega-ops/jellyfin-legendaz/issues)**

<br/>

---

### 🌍 Translations
[🇧🇷 Português](translations/README.pt.md) · [🇩🇪 Deutsch](translations/README.de.md) · [🇫🇷 Français](translations/README.fr.md) · [🇪🇸 Español](translations/README.es.md) · [🇮🇹 Italiano](translations/README.it.md) · [🇷🇺 Русский](translations/README.ru.md) · [🇨🇳 中文](translations/README.zh.md) · [🇯🇵 日本語](translations/README.ja.md) · [🇰🇷 한국어](translations/README.ko.md) · [🇵🇱 Polski](translations/README.pl.md)
[🇸🇪 Svenska](translations/README.sv.md) · [🇳🇴 Norsk](translations/README.nb.md) · [🇩🇰 Dansk](translations/README.da.md) · [🇫🇮 Suomi](translations/README.fi.md) · [🇨🇿 Čeština](translations/README.cs.md) · [🇸🇰 Slovenčina](translations/README.sk.md) · [🇭🇺 Magyar](translations/README.hu.md) · [🇷🇴 Română](translations/README.ro.md) · [🇹🇷 Türkçe](translations/README.tr.md) · [🇸🇦 العربية](translations/README.ar.md) · [🇺🇦 Українська](translations/README.uk.md) · [🇬🇷 Ελληνικά](translations/README.el.md) · [🇪🇸 Català](translations/README.ca.md)
*Want to add your language? [Open a PR!](https://github.com/fabianoortega-ops/jellyfin-legendaz/pulls)*

---

</div>

## 🎯 What it does

Legendaz adds a **🔍 button** in the Jellyfin video player OSD. One click opens a search panel — search by language, pick a result, and the subtitle is downloaded, the library updated, and the track automatically selected.

```
  ♥  🔁  CC  🔍  🎵  ─────────  ⚙  ⛶
              ↑
         Legendaz
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **In-Player Search** | Search button in the OSD — no leaving the player |
| ⬇️ **One-Click Download** | Pick a result and the subtitle downloads automatically |
| 🎯 **Auto-Select** | Downloaded subtitle is activated without any manual steps |
| 🌍 **25 Languages** | Auto-detects your browser or Jellyfin profile language |
| 🔗 **Bazarr Integration** | Searches all your configured Bazarr providers |

---

## 📦 Installation

### Step 1 — Install JavaScript Injector (required)

Go to **Dashboard → Plugins → Repositories → +** and add:

```
https://raw.githubusercontent.com/n00bcodr/jellyfin-plugins/main/10.11/manifest.json
```

> For Jellyfin 10.10.x use: `https://raw.githubusercontent.com/n00bcodr/jellyfin-plugins/main/10.10/manifest.json`

Go to **Catalog**, find **JavaScript Injector** and click **Install**. Restart Jellyfin.

> **Docker / TrueNAS users:** if you see `Access to the path '/usr/share/jellyfin/web/index.html' is denied`, also install [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) (v2.2.1.0+).

---

### Step 2 — Install Bazarr plugin (required)

Install the [Bazarr Jellyfin plugin](https://github.com/enoch85/bazarr-jellyfin) and configure it with your Bazarr URL and API key.

---

### Step 3 — Install Legendaz

Go to **Dashboard → Plugins → Repositories → +** and add:

```
https://fabianoortega-ops.github.io/jellyfin-legendaz/manifest.json
```

Go to **Catalog → Subtitles**, find **Legendaz** and click **Install**.

---

### Step 4 — Restart Jellyfin

Restart once to load all plugins. The 🔍 button will appear in the player OSD next to the subtitle button.

---

## 🌍 Supported Languages

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
| 🟠 Reddit | [r/jellyfin](https://www.reddit.com/r/jellyfin) · [r/JellyfinCommunity](https://www.reddit.com/r/JellyfinCommunity) |

---

## 🔗 Related

- [JavaScript Injector](https://github.com/n00bcodr/Jellyfin-JavaScript-Injector) — Required dependency. Injects custom JavaScript into the Jellyfin interface.
- [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) — Resolves permission issues on Docker/TrueNAS installs.
- [Bazarr Jellyfin plugin](https://github.com/enoch85/bazarr-jellyfin) — Required dependency. Connects Jellyfin to your Bazarr instance.
- [AutoPlay Toggle](https://github.com/fabianoortega-ops/jellyfin-autoplay-toggle) — Toggle next episode autoplay directly from the player.
- [awesome-jellyfin](https://github.com/awesome-jellyfin/awesome-jellyfin) — A curated list of Jellyfin plugins and tools.

---

## 🤝 Contributing

- 🌍 **Translate** — add a `README.xx.md` for your language
- 🐛 **Report bugs** — [open an issue](https://github.com/fabianoortega-ops/jellyfin-legendaz/issues)
- 💡 **Suggest features** — ideas are welcome
- ⭐ **Star the repo** — helps others discover it

---

<div align="center">

Made with ♥ for the [Jellyfin](https://jellyfin.org) community

[MIT License](LICENSE) · [Website](https://fabianoortega-ops.github.io/jellyfin-legendaz) · [Releases](https://github.com/fabianoortega-ops/jellyfin-legendaz/releases)

</div>

