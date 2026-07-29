/**
 * Legendaz — Jellyfin Subtitle Search v2
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
            // 204 No Content — sem body (download, refresh, etc.)
            if (r.status === 204 || r.headers.get('content-length') === '0') return null;
            return r.json().catch(function() { return null; });
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
            'z-index:2147483647', 'overflow:hidden',
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

    function activateSubtitle(itemId, downloadedSub) {
        // Espera mais para o refresh propagar antes de buscar as streams
        return new Promise(function(resolve) { setTimeout(resolve, 3000); })
            .then(function() {
                return api('GET', 'Items/' + itemId + '?fields=MediaStreams');
            })
            .then(function(item) {
                var streams = (item.MediaStreams || []).filter(function(s) {
                    return s.Type === 'Subtitle';
                });
                if (!streams.length) return;

                // Tenta encontrar a legenda baixada pelo idioma/formato
                var targetLang = (downloadedSub.Language || '').toLowerCase();
                var targetFmt  = (downloadedSub.Format  || '').toLowerCase();
                var newSub = streams.find(function(s) {
                    var sLang = (s.Language || '').toLowerCase();
                    var sFmt  = (s.Codec    || '').toLowerCase();
                    return (targetLang && sLang === targetLang) ||
                           (targetFmt  && sFmt  === targetFmt);
                }) || streams[streams.length - 1];

                var idx = newSub.Index;
                console.log('[Legendaz] Ativando index=' + idx +
                    ' lang=' + newSub.Language + ' codec=' + newSub.Codec);

                var pm = window.playbackManager;
                if (!pm) return;

                // Posição atual em ms → ticks (1ms = 10.000 ticks)
                var ms = 0;
                try { ms = typeof pm.currentTime === 'function' ? pm.currentTime() : 0; } catch(e) {}
                var ticks = Math.floor(ms * 10000);

                // Tenta ativar diretamente
                try { pm.setSubtitleStreamIndex(idx); } catch(e) {}

                // Seek forçado + retry após 1.5s
                setTimeout(function() {
                    try { pm.seek(ticks); } catch(e) {}
                    setTimeout(function() {
                        try { pm.setSubtitleStreamIndex(idx); } catch(e) {}
                    }, 1000);
                }, 300);
            })
            .catch(function(e) { console.warn('[Legendaz] activateSubtitle:', e); });
    }

    function downloadSub(itemId, sub) {
        var container = document.getElementById('lgz-results');
        if (container) {
            container.innerHTML = '<p style="color:#888;font-size:.85rem;text-align:center;padding:20px">⬇️ Baixando legenda…</p>';
        }

        api('POST', 'Items/' + itemId + '/RemoteSearch/Subtitles/' + encodeURIComponent(sub.Id))
            .then(function() {
                // Avisar o Jellyfin que o item tem conteúdo novo
                return api('POST', 'Items/' + itemId + '/Refresh?MetadataRefreshMode=None&ImageRefreshMode=None&ReplaceAllMetadata=false&ReplaceAllImages=false');
            })
            .then(function() {
                // Aguarda refresh propagar e tenta ativar automaticamente
                return new Promise(function(resolve) { setTimeout(resolve, 1500); });
            })
            .then(function() {
                return activateSubtitle(itemId, sub);
            })
            .then(function() {
                removePanel();
                showToast('✅ ' + escHtml(sub.Name || 'Legenda') + ' baixada!');
            })
            .catch(function(err) {
                removePanel();
                showToast('❌ Erro: ' + err.message, true);
                console.error('[Legendaz] Erro no download:', err);
            });
    }

    function escHtml(str) {
        return String(str || '')
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ── Toast de notificação ──────────────────────────────────────────────────
    function showToast(msg, isError) {
        var id = 'lgz-toast';
        var old = document.getElementById(id);
        if (old) old.remove();

        var toast = document.createElement('div');
        toast.id = id;
        toast.style.cssText = [
            'position:fixed', 'bottom:100px', 'left:50%',
            'transform:translateX(-50%)',
            'background:' + (isError ? '#8b0000' : '#1a3a1a'),
            'border:1px solid ' + (isError ? '#f66' : '#4c4'),
            'color:' + (isError ? '#f99' : '#8f8'),
            'padding:12px 20px', 'border-radius:8px',
            'font-size:.9rem', 'font-weight:600',
            'z-index:2147483647',
            'box-shadow:0 4px 16px rgba(0,0,0,.5)',
            'pointer-events:none',
            'transition:opacity .4s'
        ].join(';');
        toast.textContent = msg;
        document.body.appendChild(toast);

        setTimeout(function() {
            toast.style.opacity = '0';
            setTimeout(function() { toast.remove(); }, 400);
        }, 3500);
    }

    // ── Força o player a recarregar source e selecionar legenda ─────────────
    function reloadSubtitleList() {
        // Nada — reload real é feito dentro de activateSubtitle
    }

    // ── Injeção do botão no OSD do player ───────────────────────────────────
    // Mesmo padrão do AutoPlay Toggle — ícone fixo na barra de controles.
    // Posicionado logo após o botão de legendas (.btnSubtitles).

    function injectButton() {
        if (document.getElementById(BTN_ID)) return;

        // Inserir após .btnSubtitles, antes de .btnAudio
        var ref = document.querySelector('.btnAudio') ||
                  document.querySelector('.btnVideoOsdSettings') ||
                  document.querySelector('.btnFullscreen');
        if (!ref) return;

        var btn = document.createElement('button');
        btn.id        = BTN_ID;
        btn.type      = 'button';
        btn.className = 'paper-icon-button-light';
        btn.title     = 'Buscar Legendas';
        btn.style.cssText = 'vertical-align:middle;margin:0 2px;padding:0;background:none;border:none;cursor:pointer;color:inherit;';
        btn.innerHTML = '<span class="material-icons" style="font-size:22px">subtitles</span>';

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (document.getElementById(PANEL_ID)) { removePanel(); return; }
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

        ref.parentNode.insertBefore(btn, ref);
        console.log('[Legendaz] Botão injetado no OSD.');
    }

    // ── Observers (mesmo padrão do AutoPlay Toggle) ───────────────────────────
    document.addEventListener('play', function(e) {
        if (!e.target || e.target.tagName !== 'VIDEO') return;
        var tries = 0;
        var retry = setInterval(function() {
            injectButton();
            if (document.getElementById(BTN_ID) || ++tries > 30) clearInterval(retry);
        }, 100);
    }, true);

    var _t = null;
    document.addEventListener('mousemove', function() {
        clearTimeout(_t);
        _t = setTimeout(injectButton, 60);
    }, { passive: true });

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
