(function () {
    'use strict';

    var BTN_ID   = 'lgz-search-btn';
    var PANEL_ID = 'lgz-panel';
    var _itemId     = null;
    var _lang       = null;
    var _searchLang = null;

    function getToken() {
        try {
            var ac = window.ApiClient;
            if (!ac) return '';
            return typeof ac.accessToken === 'function' ? ac.accessToken() : (ac.accessToken || ac._accessToken || '');
        } catch(e) { return ''; }
    }

    function getUserId() {
        try {
            var ac = window.ApiClient;
            if (!ac) return '';
            return typeof ac.getCurrentUserId === 'function' ? ac.getCurrentUserId() : (ac.currentUserId || ac._currentUserId || '');
        } catch(e) { return ''; }
    }

    function api(method, path, body) {
        return fetch(window.location.origin + '/' + path, {
            method: method,
            headers: {
                'Authorization': 'MediaBrowser Token="' + getToken() + '"',
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        }).then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            if (r.status === 204) return null;
            return r.json().catch(function() { return null; });
        });
    }

    function getCurrentItem() {
        return api('GET', 'Sessions?activeWithinSeconds=30')
            .then(function(sessions) {
                var uid = getUserId();
                var s = (sessions || []).find(function(s) {
                    return s.UserId === uid && s.NowPlayingItem;
                }) || (sessions || []).find(function(s) { return s.NowPlayingItem; });
                if (!s || !s.NowPlayingItem) throw new Error('Nenhum item em reprodução');
                return s.NowPlayingItem;
            });
    }

    function getUserSubtitleLang() {
        var uid = getUserId();
        if (!uid) return Promise.resolve('pt');
        return api('GET', 'Users/' + uid)
            .then(function(u) {
                var p = u && u.Configuration && u.Configuration.SubtitleLanguagePreference;
                return (p && p.length) ? p : (navigator.language || 'pt').split('-')[0];
            })
            .catch(function() { return (navigator.language || 'pt').split('-')[0]; });
    }

    function removePanel() {
        var p = document.getElementById(PANEL_ID);
        if (p) p.remove();
    }

    function showToast(msg, isError) {
        var id = 'lgz-toast';
        var old = document.getElementById(id);
        if (old) old.remove();
        var t = document.createElement('div');
        t.id = id;
        t.style.cssText = [
            'position:fixed', 'bottom:100px', 'left:50%', 'transform:translateX(-50%)',
            'background:' + (isError ? '#8b0000' : '#1a3a1a'),
            'border:1px solid ' + (isError ? '#f66' : '#4c4'),
            'color:' + (isError ? '#f99' : '#8f8'),
            'padding:12px 20px', 'border-radius:8px', 'font-size:.9rem', 'font-weight:600',
            'z-index:2147483647', 'box-shadow:0 4px 16px rgba(0,0,0,.5)',
            'pointer-events:none', 'transition:opacity .4s'
        ].join(';');
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function() {
            t.style.opacity = '0';
            setTimeout(function() { t.remove(); }, 400);
        }, 3500);
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
            '  <input id="lgz-lang" value="' + escHtml(lang) + '" placeholder="Language (e.g. pt, en)"',
            '    style="flex:1;background:#0d0d0d;border:1px solid #444;border-radius:6px;color:#e0e0e0;padding:7px 10px;font-size:.85rem">',
            '  <button id="lgz-go" style="background:#00a4dc;color:#000;border:none;border-radius:6px;padding:7px 14px;font-weight:600;font-size:.85rem;cursor:pointer">Search</button>',
            '</div>',
            '<div id="lgz-results" style="flex:1;overflow-y:auto;padding:8px 0">',
            '  <p style="color:#666;font-size:.85rem;text-align:center;padding:20px">Enter language and click Search.</p>',
            '</div>'
        ].join('');
        document.body.appendChild(panel);
        document.getElementById('lgz-close').addEventListener('click', removePanel);
        document.getElementById('lgz-go').addEventListener('click', function() {
            var sl = document.getElementById('lgz-lang').value.trim() || lang;
            _searchLang = sl;
            doSearch(itemId, sl);
        });
    }

    function renderResults(itemId, results) {
        var c = document.getElementById('lgz-results');
        if (!c) return;
        if (!results || !results.length) {
            c.innerHTML = '<p style="color:#666;font-size:.85rem;text-align:center;padding:20px">No subtitles found.</p>';
            return;
        }
        c.innerHTML = '';
        results.slice(0, 20).forEach(function(sub) {
            var row = document.createElement('div');
            row.style.cssText = 'padding:10px 16px;border-bottom:1px solid #222;cursor:pointer;transition:background .15s';
            row.innerHTML = [
                '<div style="color:#e0e0e0;font-size:.85rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(sub.Name || sub.Id) + '</div>',
                '<div style="color:#666;font-size:.75rem;margin-top:2px">' +
                    escHtml(sub.ProviderName || '') + ' · ' + escHtml(sub.Format || '') +
                    (sub.IsHearingImpaired ? ' · HI' : '') + (sub.IsForced ? ' · Forced' : '') +
                '</div>'
            ].join('');
            row.addEventListener('mouseover', function() { row.style.background = '#252525'; });
            row.addEventListener('mouseout',  function() { row.style.background = ''; });
            row.addEventListener('click', function() { downloadSub(itemId, sub); });
            c.appendChild(row);
        });
    }

    function doSearch(itemId, lang) {
        var c = document.getElementById('lgz-results');
        if (c) c.innerHTML = '<p style="color:#888;font-size:.85rem;text-align:center;padding:20px">⏳ Searching… (may take a few minutes)</p>';
        api('GET', 'Items/' + itemId + '/RemoteSearch/Subtitles/' + encodeURIComponent(lang))
            .then(function(r) { renderResults(itemId, r); })
            .catch(function(e) {
                var c2 = document.getElementById('lgz-results');
                if (c2) c2.innerHTML = '<p style="color:#f66;font-size:.85rem;text-align:center;padding:20px">Error: ' + escHtml(e.message) + '</p>';
            });
    }

    var LANG_ALIASES = {
        'pob': ['por','pt','pt-br'], 'por': ['pob','pt','pt-br'], 'pt': ['pob','por','pt-br'],
        'eng': ['en'], 'en': ['eng'], 'spa': ['es'], 'es': ['spa'],
        'fra': ['fr'], 'fr': ['fra'], 'deu': ['de','ger'], 'de': ['deu','ger'], 'ger': ['de','deu'],
        'jpn': ['ja'], 'ja': ['jpn'], 'kor': ['ko'], 'ko': ['kor'],
        'zho': ['zh','chi'], 'chi': ['zh','zho'], 'rus': ['ru'], 'ru': ['rus'],
        'ita': ['it'], 'it': ['ita'], 'nld': ['nl'], 'nl': ['nld'],
        'pol': ['pl'], 'pl': ['pol']
    };

    function langsMatch(a, b) {
        if (!a || !b) return false;
        a = a.toLowerCase(); b = b.toLowerCase();
        if (a === b) return true;
        return (LANG_ALIASES[a] || []).indexOf(b) !== -1;
    }

    function activateSubtitle(itemId, beforeIndices) {
        console.log('[Legendaz] activateSubtitle start, beforeIndices:', beforeIndices);
        return new Promise(function(r) { setTimeout(r, 3000); })
            .then(function() {
                return api('GET', 'Items/' + itemId + '?fields=MediaStreams');
            })
            .then(function(item) {
                var subs = (item.MediaStreams || []).filter(function(s) { return s.Type === 'Subtitle'; });
                console.log('[Legendaz] Streams after refresh:', subs.map(function(s) {
                    return s.Index + '/' + s.Language + '/' + s.Codec + '/ext=' + s.IsExternal;
                }));

                var newSub = subs.find(function(s) { return beforeIndices.indexOf(s.Index) === -1; });
                if (!newSub) {
                    console.log('[Legendaz] Nenhuma nova stream detectada');
                    return false;
                }
                console.log('[Legendaz] Nova legenda: idx=' + newSub.Index + ' lang=' + newSub.Language + ' codec=' + newSub.Codec);

                var pm = window.playbackManager;
                var player = pm && pm._currentPlayer;
                console.log('[Legendaz] pm:', !!pm, ' player:', !!player);

                if (!pm || !player) return false;

                var embeddedSub = subs.find(function(s) { return !s.IsExternal && beforeIndices.indexOf(s.Index) !== -1; });
                console.log('[Legendaz] Legenda embedded para trigger:', embeddedSub ? embeddedSub.Index : 'nenhuma');

                if (embeddedSub) {
                    console.log('[Legendaz] Chamando setSubtitleStreamIndex(' + embeddedSub.Index + ', player) para forçar reload PlaybackInfo');
                    pm.setSubtitleStreamIndex(embeddedSub.Index, player);
                    return new Promise(function(resolve) { setTimeout(resolve, 4000); })
                        .then(function() {
                            console.log('[Legendaz] Ativando nova legenda: idx=' + newSub.Index);
                            pm.setSubtitleStreamIndex(newSub.Index, player);
                            return true;
                        });
                }

                console.log('[Legendaz] Sem embedded — ativando diretamente: idx=' + newSub.Index);
                pm.setSubtitleStreamIndex(newSub.Index, player);
                return true;
            })
            .catch(function(e) {
                console.log('[Legendaz] activateSubtitle erro:', e);
                return false;
            });
    }

    function downloadSub(itemId, sub) {
        var c = document.getElementById('lgz-results');
        if (c) c.innerHTML = '<p style="color:#888;font-size:.85rem;text-align:center;padding:20px">⬇️ Downloading subtitle…</p>';

        var beforeIndices = [];
        api('GET', 'Items/' + itemId + '?fields=MediaStreams')
            .then(function(item) {
                beforeIndices = (item.MediaStreams || [])
                    .filter(function(s) { return s.Type === 'Subtitle'; })
                    .map(function(s) { return s.Index; });
                console.log('[Legendaz] Índices antes do download:', beforeIndices);
                return api('POST', 'Items/' + itemId + '/RemoteSearch/Subtitles/' + encodeURIComponent(sub.Id));
            })
            .then(function() {
                return api('POST', 'Items/' + itemId + '/Refresh?MetadataRefreshMode=None&ImageRefreshMode=None&ReplaceAllMetadata=false&ReplaceAllImages=false');
            })
            .then(function() {
                removePanel();
                showToast('✅ ' + escHtml(sub.Name || 'Legenda') + ' downloaded!');
                activateSubtitle(itemId, beforeIndices)
                    .then(function(ok) {
                        if (ok) {
                            showToast('▶ Subtitle activated!');
                        } else {
                            showToast('⚠ Could not activate automatically. Select it in the CC menu.', true);
                        }
                    })
                    .catch(function(e) {
                        showToast('❌ Activation error: ' + escHtml(e.message || ''), true);
                    });
            })
            .catch(function(err) {
                removePanel();
                showToast('❌ Download error: ' + escHtml(err.message || ''), true);
            });
    }

    function escHtml(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function injectButton() {
        if (document.getElementById(BTN_ID)) return;
        var ref = document.querySelector('.btnAudio') ||
                  document.querySelector('.btnVideoOsdSettings') ||
                  document.querySelector('.btnFullscreen');
        if (!ref) return;
        var btn = document.createElement('button');
        btn.id = BTN_ID;
        btn.type = 'button';
        btn.className = 'paper-icon-button-light';
        btn.title = 'Search Subtitles';
        btn.style.cssText = 'vertical-align:middle;margin:0 2px;padding:0;background:none;border:none;cursor:pointer;color:inherit;';
        btn.innerHTML = '<span class="material-icons" style="font-size:22px">subtitles</span>';
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (document.getElementById(PANEL_ID)) { removePanel(); return; }
            Promise.all([getCurrentItem(), getUserSubtitleLang()])
                .then(function(r) {
                    _itemId = r[0].Id;
                    _lang   = r[1];
                    _searchLang = _lang;
                    showPanel(_itemId, _lang);
                })
                .catch(function() {
                    showPanel('', (navigator.language || 'pt').split('-')[0]);
                });
        });
        ref.parentNode.insertBefore(btn, ref);
        console.log('[Legendaz] Botão injetado.');
    }

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

    document.addEventListener('click', function(e) {
        var p = document.getElementById(PANEL_ID);
        if (p && !p.contains(e.target) && e.target.id !== BTN_ID) removePanel();
    });

    console.log('[Legendaz] Script carregado.');
}());

