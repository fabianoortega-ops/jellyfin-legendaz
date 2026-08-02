(function () {
    'use strict';
    var BTN_ID    = 'lgz-search-btn';
    var PANEL_ID  = 'lgz-panel';
    var _itemId   = null;
    var _lang     = null;
    var _searchLang = null;
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
            if (r.status === 204 || r.headers.get('content-length') === '0') return null;
            return r.json().catch(function() { return null; });
        });
    }
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
    function getUserSubtitleLang() {
        var uid = getUserId();
        if (!uid) return Promise.resolve('pt');
        return api('GET', 'Users/' + uid)
            .then(function(user) {
                var pref = user.Configuration && user.Configuration.SubtitleLanguagePreference;
                if (pref && pref.length > 0) return pref;
                return (navigator.language || 'pt').split('-')[0];
            })
            .catch(function() {
                return (navigator.language || 'pt').split('-')[0];
            });
    }
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
            '  <input id="lgz-lang" value="' + lang + '" placeholder="Language (e.g. pt, en)"',
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
            '    Enter language and click Search.',
            '  </p>',
            '</div>'
        ].join('');
        document.body.appendChild(panel);
        document.getElementById('lgz-close').addEventListener('click', removePanel);
        document.getElementById('lgz-go').addEventListener('click', function() {
            var searchLang = document.getElementById('lgz-lang').value.trim() || lang;
            _searchLang = searchLang;
            doSearch(itemId, searchLang);
        });
    }
    function renderResults(itemId, results) {
        var container = document.getElementById('lgz-results');
        if (!container) return;
        if (!results || results.length === 0) {
            container.innerHTML = '<p style="color:#666;font-size:.85rem;text-align:center;padding:20px">No subtitles found.</p>';
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
        container.innerHTML = '<p style="color:#888;font-size:.85rem;text-align:center;padding:20px">⏳ Searching… (may take a few minutes)</p>';
        api('GET', 'Items/' + itemId + '/RemoteSearch/Subtitles/' + encodeURIComponent(lang))
            .then(function(results) { renderResults(itemId, results); })
            .catch(function(err) {
                if (!container) return;
                container.innerHTML = '<p style="color:#f66;font-size:.85rem;text-align:center;padding:20px">Erro: ' + escHtml(err.message) + '</p>';
            });
    }
    function activateSubtitle(itemId, downloadedSub) {
        var langAliases = {
            'pob': ['por', 'pt', 'pt-br'], 'por': ['pob', 'pt', 'pt-br'],
            'pt':  ['pob', 'por', 'pt-br'], 'eng': ['en'],  'en':  ['eng'],
            'spa': ['es'],  'es':  ['spa'],  'fra': ['fr'],  'fr':  ['fra'],
            'deu': ['de', 'ger'], 'de': ['deu', 'ger'], 'ger': ['de', 'deu'],
            'jpn': ['ja'],  'ja':  ['jpn'],  'kor': ['ko'],  'ko':  ['kor'],
            'zho': ['zh', 'chi'], 'chi': ['zh', 'zho'],
            'rus': ['ru'],  'ru':  ['rus'],  'ita': ['it'],  'it':  ['ita'],
            'nld': ['nl'],  'nl':  ['nld'],  'pol': ['pl'],  'pl':  ['pol']
        };
        function langsMatch(a, b) {
            if (!a || !b) return false;
            a = a.toLowerCase(); b = b.toLowerCase();
            if (a === b) return true;
            return (langAliases[a] || []).indexOf(b) !== -1;
        }
        return new Promise(function(resolve) { setTimeout(resolve, 3000); })
            .then(function() {
                return Promise.all([
                    api('GET', 'Items/' + itemId + '?fields=MediaStreams'),
                    api('GET', 'Sessions?activeWithinSeconds=30')
                ]);
            })
            .then(function(results) {
                var item     = results[0];
                var sessions = results[1];
                var streams  = (item.MediaStreams || []).filter(function(s) { return s.Type === 'Subtitle'; });
                if (!streams.length) return;
                var targetLang = (downloadedSub.Language || _searchLang || '').toLowerCase();
                var targetFmt  = (downloadedSub.Format  || '').toLowerCase();
                var newSub = streams.find(function(s) {
                    return langsMatch(targetLang, s.Language) && (s.Codec || '').toLowerCase() === targetFmt;
                }) || streams.find(function(s) {
                    return langsMatch(targetLang, s.Language);
                }) || streams.find(function(s) {
                    return (s.Codec || '').toLowerCase() === targetFmt;
                }) || streams.filter(function(s) { return s.IsExternal; }).pop()
                  || streams[streams.length - 1];
                var idx = newSub.Index;
                var uid = getUserId();
                var session = sessions.find(function(s) {
                    return s.UserId === uid && s.NowPlayingItem;
                }) || sessions.find(function(s) { return s.NowPlayingItem; });
                if (!session) return;
                var posTicks   = (session.PlayState && session.PlayState.PositionTicks) || 0;
                var audioIdx   = session.PlayState && session.PlayState.AudioStreamIndex;
                var mediaSrcId = (session.NowPlayingItem && session.NowPlayingItem.MediaSourceId) || itemId;
                return api('POST', 'Sessions/' + session.Id + '/Playing', {
                    PlayCommand:         'PlayNow',
                    ItemIds:             [itemId],
                    StartPositionTicks:  posTicks,
                    SubtitleStreamIndex: idx,
                    AudioStreamIndex:    audioIdx,
                    MediaSourceId:       mediaSrcId
                });
            })
            .catch(function() {});
    }
    function downloadSub(itemId, sub) {
        var container = document.getElementById('lgz-results');
        if (container) {
            container.innerHTML = '<p style="color:#888;font-size:.85rem;text-align:center;padding:20px">⬇️ Downloading subtitle…</p>';
        }
        api('POST', 'Items/' + itemId + '/RemoteSearch/Subtitles/' + encodeURIComponent(sub.Id))
            .then(function() {
                return api('POST', 'Items/' + itemId + '/Refresh?MetadataRefreshMode=None&ImageRefreshMode=None&ReplaceAllMetadata=false&ReplaceAllImages=false');
            })
            .then(function() {
                return new Promise(function(resolve) { setTimeout(resolve, 1500); });
            })
            .then(function() {
                return activateSubtitle(itemId, sub);
            })
            .then(function() {
                removePanel();
                showToast('✅ ' + escHtml(sub.Name || 'Legenda') + ' baixada e ativada!');
            })
            .catch(function(err) {
                removePanel();
                showToast('❌ Erro: ' + err.message, true);
            });
    }
    function escHtml(str) {
        return String(str || '')
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
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
    function injectButton() {
        if (document.getElementById(BTN_ID)) return;
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
                    _searchLang = results[1];
                    showPanel(_itemId, _lang);
                })
                .catch(function(err) {
                    showPanel('', (navigator.language || 'pt').split('-')[0]);
                });
        });
        ref.parentNode.insertBefore(btn, ref);
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
        var panel = document.getElementById(PANEL_ID);
        if (panel && !panel.contains(e.target) && e.target.id !== BTN_ID) {
            removePanel();
        }
    });
}());
