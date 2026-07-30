<div align="center">

<img src="../banner.svg" alt="Legendaz" width="100%">

<br/><br/>

[![Jellyfin](https://img.shields.io/badge/Jellyfin-10.11.x-00a4dc?style=flat-square&logo=jellyfin&logoColor=white)](https://jellyfin.org)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../LICENSE)
[![Languages](https://img.shields.io/badge/languages-25-brightgreen?style=flat-square)](#supported-languages)

<br/>

**[🌐 サイト](https://fabianoortega-ops.github.io/jellyfin-legendaz) · [📦 インストール](#installation) · [🌍 言語](#supported-languages) · [🐛 問題](https://github.com/fabianoortega-ops/jellyfin-legendaz/issues)**

<br/>

---

### 🌍 翻訳
[🇬🇧 English](../README.md) · [🇧🇷 Português](README.pt.md) · [🇩🇪 Deutsch](README.de.md) · [🇫🇷 Français](README.fr.md) · [🇪🇸 Español](README.es.md) · [🇮🇹 Italiano](README.it.md) · [🇷🇺 Русский](README.ru.md) · [🇨🇳 中文](README.zh.md) · [🇰🇷 한국어](README.ko.md) · [🇵🇱 Polski](README.pl.md)
*言語を追加しますか？ [PRを開いてください！](https://github.com/fabianoortega-ops/jellyfin-legendaz/pulls)*

---

</div>

## 🎯 機能

LegendazはJellyfinビデオプレーヤーのOSDに**🔍ボタン**を追加します。クリックで検索パネルが開き、言語で検索して結果を選ぶと字幕が自動でダウンロード・選択されます。

```
  ♥  🔁  CC  🔍  🎵  ─────────  ⚙  ⛶
              ↑
         Legendaz
```

---

## ✨ 機能

| 機能 | 説明 |
|---|---|
| 🔍 **In-Player Search** | Search button in the OSD — no leaving the player |
| ⬇️ **One-Click Download** | Pick a result and the subtitle downloads automatically |
| 🎯 **Auto-Select** | Downloaded subtitle is activated without manual steps |
| 🌍 **25 Languages** | Auto-detects browser or Jellyfin profile language |
| 🔗 **Bazarr Integration** | Searches all your configured Bazarr providers |

---

## 📦 Installation

### Step 1 — Install JavaScript Injector (required)

Go to **Dashboard → Plugins → Repositories → +** and add:

```
https://raw.githubusercontent.com/n00bcodr/jellyfin-plugins/main/10.11/manifest.json
```

Go to **Catalog**, find **JavaScript Injector** and click **Install**. Restart Jellyfin.

> **Docker / TrueNAS:** if you see a permission error, also install [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) (v2.2.1.0+).

---

### Step 2 — Install Bazarr plugin (required)

Install the [Bazarr Jellyfin plugin](https://github.com/enoch85/bazarr-jellyfin) and configure it with your Bazarr URL and API key.

---

### Step 3 — Install Legendaz

```
https://fabianoortega-ops.github.io/jellyfin-legendaz/manifest.json
```

Go to **Catalog → Subtitles**, find **Legendaz** and click **Install**.

---

### Step 4 — Restart Jellyfin

Restart once. The 🔍 button appears in the player OSD next to the subtitle button.

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
| 🟠 Reddit | [r/jellyfin](https://www.reddit.com/r/jellyfin) |

---

## 🔗 Related

- [JavaScript Injector](https://github.com/n00bcodr/Jellyfin-JavaScript-Injector) — Required dependency.
- [File Transformation](https://github.com/IAmParadox27/jellyfin-plugin-file-transformation) — Resolves Docker/TrueNAS permission issues.
- [Bazarr Jellyfin plugin](https://github.com/enoch85/bazarr-jellyfin) — Required dependency.
- [AutoPlay Toggle](https://github.com/fabianoortega-ops/jellyfin-autoplay-toggle) — Toggle next episode autoplay from the player.
- [awesome-jellyfin](https://github.com/awesome-jellyfin/awesome-jellyfin) — Curated Jellyfin plugins list.

---

## 🤝 Contributing

- 🌍 **Translate** — add a `README.xx.md` for your language
- 🐛 **Report bugs** — [open an issue](https://github.com/fabianoortega-ops/jellyfin-legendaz/issues)
- ⭐ **Star the repo** — helps others discover it

---

<div align="center">

Made with ♥ for the [Jellyfin](https://jellyfin.org) community

[MIT License](../LICENSE) · [サイト](https://fabianoortega-ops.github.io/jellyfin-legendaz) · [Releases](https://github.com/fabianoortega-ops/jellyfin-legendaz/releases)

</div>
