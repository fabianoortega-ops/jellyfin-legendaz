/**
 * Legendaz — Jellyfin Subtitle Search
 * Adiciona um botão de busca diretamente no menu de legendas do player.
 * Servido via GitHub Pages — git push = atualização sem reiniciar o Jellyfin.
 */
(function () {
    'use strict';

    var BTN_ID    = 'lgz-search-btn';
    var PANEL_ID  = 'lgz-panel';
    var _itemId   = null;
    var _lang     = null;

    // ── Helpers de API ────────────────────────────────────────────────────────
    function getToken() {
        try {
            var ac = window.ApiClient;
            return (typeof ac.accessToken === 'function' ? ac.accessToken() : ac.accessToken) || '';
        } catch(e) { return ''; }
    }
    function getUserId() {
        try {
            var ac = window.ApiClient;
            return (typeof ac.getCurrentUserId === 'function' ? ac.getCurrentUserId() : ac.currentUserId) || '';
        } catch(e) { return ''; }
    }
    function api(method, path, body) {
        return fetch(window.location.origin + '/' + path, {
            method: method,
            headers: {
                'Authorization': 'MediaBrowser Token="' + getToken() + '"',
                'Content-Type':  'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        }).then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        });
    }

    // ── Obtém item atual via Sessions API ────────────────────────────────────
    function getCurrentItem() {
        return api('GET', 'Sessions?activeWithinSeconds=30')
            .then(function(sessions) {
                var mine = sessions.find(function(s) {
                    return s.DeviceId === (window.ApiClient.deviceId ? window.ApiClient.deviceId() : null);
                }) || sessions.find(function(s) { return s.NowPlayingItem; });
                if (!mine || !mine.NowPlayingItem) throw new Error('Nenhum item em reprodução.');
                return mine.NowPlayingItem;
            });
    }

    // ── Obtém idioma de legenda preferido do perfil do usuário ────────────────
    function getUserSubtitleLang() {
        var uid = getUserId();
        if (!uid) return Promise.resolve('pt');
        return api('GET', 'Users/' + uid)
            .then(function(user) {
                // SubtitleLanguagePreference ex: "por", "pt", "pt-BR"
                var pref = user.Configuration && user.Configuration.SubtitleLanguagePreference;
                if (pref && pref.length > 0) return pref;
                // Fallback: idioma do browser
                return (navigator.language || 'pt').split('-')[0];
            })
            .catch(function() {
                return (navigator.language || 'pt').split('-')[0];
            });
    }

    // ── Painel de busca ──────────────────────────────────────────────────────
    function removePanel() {
        var p = document.getElementById(PANEL_ID);
        if (p) p.remove();
    }

    function showPanel(itemId, lang) {
        removePanel();

        var panel = document.createElement('div');
        panel.id = PANEL_ID;
        panel.style.cssText = [
            'position:fixed', 'bottom:80px', 'right:24px',
            'width:340px', 'max-height:480px',
            'background:#1a1a1a', 'border:1px solid #333', 'border-radius:10px',
            'box-shadow:0 8px 32px rgba(0,0,0,.6)',
            'z-index:99999', 'overflow:hidden',
            'display:flex', 'flex-direction:column',
            'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'
        ].join(';');

        panel.innerHTML = [
            '<div style="padding:14px 16px;border-bottom:1px solid #333;display:flex;align-items:center;justify-content:space-between">',
            '  <span style="font-weight:600;color:#e0e0e0;font-size:.95rem">🔍 Legendaz</span>',
            '  <button id="lgz-close" style="background:none;border:none;color:#888;font-size:18px;cursor:pointer;line-height:1">✕</button>',
            '</div>',
            '<div style="padding:12px 16px;border-bottom:1px solid #333;display:flex;gap:8px">',
            '  <input id="lgz-lang" value="' + lang + '" placeholder="Idioma (ex: pt, en)"',
            '    style="flex:1;background:#0d0d0d;border:1px solid #444;border-radius:6px;',
            '           color:#e0e0e0;padding:7px 10px;font-size:.85rem">',
            '  <button id="lgz-go"',
            '    style="background:#00a4dc;color:#000;border:none;border-radius:6px;',
            '           padding:7px 14px;font-weight:600;font-size:.85rem;cursor:pointer">',
            '    Buscar',
            '  </button>',
            '</div>',
            '<div id="lgz-results" style="flex:1;overflow-y:auto;padding:8px 0">',
            '  <p style="color:#666;font-size:.85rem;text-align:center;padding:20px">',
            '    Digite o idioma e clique em Buscar.',
            '  </p>',
            '</div>'
        ].join('');

        document.body.appendChild(panel);

        document.getElementById('lgz-close').addEventListener('click', removePanel);

        document.getElementById('lgz-go').addEventListener('click', function() {
            var searchLang = document.getElementById('lgz-lang').value.trim() || lang;
            doSearch(itemId, searchLang);
        });
    }

    function renderResults(itemId, results) {
        var container = document.getElementById('lgz-results');
        if (!container) return;

        if (!results || results.length === 0) {
            container.innerHTML = '<p style="color:#666;font-size:.85rem;text-align:center;padding:20px">Nenhuma legenda encontrada.</p>';
            return;
        }

        container.innerHTML = '';
        results.slice(0, 20).forEach(function(sub) {
            var row = document.createElement('div');
            row.style.cssText = 'padding:10px 16px;border-bottom:1px solid #222;cursor:pointer;transition:background .15s';
            row.innerHTML = [
                '<div style="color:#e0e0e0;font-size:.85rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">',
                    escHtml(sub.Name || sub.Id),
                '</div>',
                '<div style="color:#666;font-size:.75rem;margin-top:2px">',
                    escHtml(sub.ProviderName || '') + ' · ' + escHtml(sub.Format || '') +
                    (sub.IsHearingImpaired ? ' · HI' : '') +
                    (sub.IsForced ? ' · Forced' : ''),
                '</div>'
            ].join('');

            row.addEventListener('mouseover',  function() { row.style.background = '#252525'; });
            row.addEventListener('mouseout',   function() { row.style.background = ''; });
            row.addEventListener('click', function() { downloadSub(itemId, sub); });

            container.appendChild(row);
        });
    }

    function doSearch(itemId, lang) {
        var container = document.getElementById('lgz-results');
        if (!container) return;
        container.innerHTML = '<p style="color:#888;font-size:.85rem;text-align:center;padding:20px">⏳ Buscando… (pode levar alguns minutos)</p>';

        api('GET', 'Items/' + itemId + '/RemoteSearch/Subtitles/' + encodeURIComponent(lang))
            .then(function(results) { renderResults(itemId, results); })
            .catch(function(err) {
                if (!container) return;
                container.innerHTML = '<p style="color:#f66;font-size:.85rem;text-align:center;padding:20px">Erro: ' + escHtml(err.message) + '</p>';
            });
    }

    function downloadSub(itemId, sub) {
        var container = document.getElementById('lgz-results');
        if (container) {
            container.innerHTML = '<p style="color:#888;font-size:.85rem;text-align:center;padding:20px">⬇️ Baixando legenda…</p>';
        }

        // POST /Items/{id}/RemoteSearch/Subtitles/{providerName}/{subtitleId}
        api('POST', 'Items/' + itemId + '/RemoteSearch/Subtitles/' +
            encodeURIComponent(sub.ProviderName) + '/' + encodeURIComponent(sub.Id))
            .then(function() {
                if (container) {
                    container.innerHTML = '<p style="color:#4c4;font-size:.9rem;text-align:center;padding:20px">✓ Legenda baixada com sucesso!</p>';
                }
                setTimeout(removePanel, 2000);
            })
            .catch(function(err) {
                if (container) {
                    container.innerHTML = '<p style="color:#f66;font-size:.85rem;text-align:center;padding:20px">Erro ao baixar: ' + escHtml(err.message) + '</p>';
                }
            });
    }

    function escHtml(str) {
        return String(str || '')
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ── Injeção do botão no menu de legendas ──────────────────────────────────
    // TODO: Ajustar seletor após inspecionar o DOM do menu de legendas ao vivo.
    // Candidatos prováveis: '.trackList', '.subtitleTrackMenu', '.popupMenu'
    var SUBTITLE_MENU_SELECTOR = '.trackList, .popupMenu, .subtitlesMenu';

    function injectButton() {
        if (document.getElementById(BTN_ID)) return;

        var menu = document.querySelector(SUBTITLE_MENU_SELECTOR);
        if (!menu) return;

        // Verificar se é o menu de legendas (contém itens de legenda)
        var hasSubtitleItems = menu.textContent.includes('ASS') ||
                               menu.textContent.includes('SRT') ||
                               menu.textContent.includes('Desligado') ||
                               menu.textContent.includes('Off');
        if (!hasSubtitleItems) return;

        var btn = document.createElement('div');
        btn.id = BTN_ID;
        btn.style.cssText = [
            'padding:10px 20px', 'cursor:pointer',
            'color:#00a4dc', 'font-size:.9rem', 'font-weight:600',
            'border-top:1px solid #333', 'margin-top:4px',
            'display:flex', 'align-items:center', 'gap:8px'
        ].join(';');
        btn.innerHTML = '<span>🔍</span><span>Buscar Legendas (Legendaz)</span>';

        btn.addEventListener('mouseover',  function() { btn.style.background = '#1a2a3a'; });
        btn.addEventListener('mouseout',   function() { btn.style.background = ''; });

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            Promise.all([getCurrentItem(), getUserSubtitleLang()])
                .then(function(results) {
                    _itemId = results[0].Id;
                    _lang   = results[1];
                    showPanel(_itemId, _lang);
                })
                .catch(function(err) {
                    console.error('[Legendaz] Erro ao obter item/idioma:', err);
                    showPanel('', (navigator.language || 'pt').split('-')[0]);
                });
        });

        menu.appendChild(btn);
        console.log('[Legendaz] Botão injetado no menu de legendas.');
    }

    // ── Observers ─────────────────────────────────────────────────────────────
    var _t = null;
    document.addEventListener('mousemove', function() {
        clearTimeout(_t);
        _t = setTimeout(injectButton, 60);
    }, { passive: true });

    document.addEventListener('play', function(e) {
        if (!e.target || e.target.tagName !== 'VIDEO') return;
        var tries = 0;
        var retry = setInterval(function() {
            injectButton();
            if (document.getElementById(BTN_ID) || ++tries > 30) clearInterval(retry);
        }, 100);
    }, true);

    setInterval(injectButton, 4000);

    // Fecha painel ao clicar fora
    document.addEventListener('click', function(e) {
        var panel = document.getElementById(PANEL_ID);
        if (panel && !panel.contains(e.target) && e.target.id !== BTN_ID) {
            removePanel();
        }
    });

    console.log('[Legendaz] Script carregado.');
}());
