# Legendaz — Jellyfin Subtitle Search

> ⚠️ **Em desenvolvimento** — plugin em fase inicial.

Adiciona um botão **🔍 Buscar Legendas** diretamente no menu de legendas do player Jellyfin, integrado com o [Bazarr](https://www.bazarr.media/).

**Compatível com Jellyfin 10.11.x**  
**Requer:** [JavaScript Injector](https://github.com/n00bcodr/Jellyfin-JavaScript-Injector) + [Bazarr plugin](https://github.com/enoch85/bazarr-jellyfin)

---

## Como funciona

1. Abre o player e clica no botão de legendas (CC)
2. O botão **🔍 Buscar Legendas** aparece no final da lista
3. Clica → painel abre com seletor de idioma (pré-selecionado do seu perfil)
4. Busca → Jellyfin consulta Bazarr → resultados aparecem
5. Clica em um resultado → legenda baixada automaticamente

---

## Instalação (quando disponível)

**Requer o [JavaScript Injector](https://github.com/n00bcodr/Jellyfin-JavaScript-Injector) e o [Bazarr plugin](https://github.com/enoch85/bazarr-jellyfin) instalados.**

```
https://fabianoortega-ops.github.io/jellyfin-legendaz/manifest.json
```

---

## Licença

MIT
