// csPlayer — Improved Custom YouTube Player
// Fixes: live slider, quality labels, volume, domain protection, event accumulation

function $(selector, parent) {
    try {
        const els = (parent || document).querySelectorAll(selector);
        if (els.length === 1) return els[0];
        if (els.length === 0) return null;
        return els;
    } catch (e) { return e; }
}

// Human-readable quality labels
const _csQualityMap = {
    hd2160: '4K · 2160p',
    hd1440: 'QHD · 1440p',
    hd1080: 'FHD · 1080p',
    hd720: 'HD · 720p',
    large: '480p',
    medium: '360p',
    small: '240p',
    tiny: '144p',
    auto: 'Auto',
};

var csPlayer = {
    csPlayers: {},
    thumbnailCache: {},
    thumbnailPendingRequests: {},

    resolveProtectedThumbnail: (videoId) => {
        if (!videoId) return Promise.reject(new Error('Missing video id for thumbnail'));
        if (csPlayer.thumbnailCache[videoId]) {
            return Promise.resolve(csPlayer.thumbnailCache[videoId]);
        }
        if (csPlayer.thumbnailPendingRequests[videoId]) {
            return csPlayer.thumbnailPendingRequests[videoId];
        }

        csPlayer.thumbnailPendingRequests[videoId] = fetch('/api/video-thumbnail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId: videoId }),
        })
            .then((response) => {
                if (!response.ok) throw new Error('Thumbnail request failed');
                return response.blob();
            })
            .then((blob) => {
                var objectUrl = URL.createObjectURL(blob);
                csPlayer.thumbnailCache[videoId] = objectUrl;
                delete csPlayer.thumbnailPendingRequests[videoId];
                return objectUrl;
            })
            .catch((error) => {
                delete csPlayer.thumbnailPendingRequests[videoId];
                throw error;
            });

        return csPlayer.thumbnailPendingRequests[videoId];
    },

    applyThumbnail: (span, thumb, defaultId) => {
        if (!span) return Promise.resolve(null);

        if (thumb === true || thumb === 'true') {
            span.style.backgroundImage = 'none';
            return csPlayer.resolveProtectedThumbnail(defaultId)
                .then((url) => {
                    span.style.backgroundImage = `url("${url}")`;
                    return url;
                })
                .catch(() => {
                    span.style.backgroundImage = 'none';
                    return null;
                });
        }

        if (thumb && thumb !== false && thumb !== 'false') {
            span.style.backgroundImage = `url("${String(thumb).replace(/"/g, '\\"')}")`;
            return Promise.resolve(thumb);
        }

        span.style.backgroundImage = 'none';
        return Promise.resolve(null);
    },

    /* ───────────────────────────── preSetup ── */
    preSetup: (videoTag, playerTagId) => {
        var theme = csPlayer.csPlayers[videoTag]?.params?.theme ?? null;
        var themeClass = theme ? 'theme-' + theme : '';
        return new Promise((resolve) => {
            $('#' + videoTag).innerHTML = `
        <div class="csPlayer ${themeClass}">
          <div class="csPlayer-container">
            <span>
              <div></div>
              <i class="ti ti-player-play-filled csPlayer-loading"></i>
              <div></div>
            </span>
            <div id="${playerTagId}"></div>
          </div>
          <div class="csPlayer-controls-box">
            <main>
              <i class="ti ti-rewind-backward-10"></i>
              <i class="ti csPlayer-play-pause-btn ti-player-play-filled"></i>
              <i class="ti ti-rewind-forward-10"></i>
            </main>
            <div class="csPlayer-controls">
              <i class="ti ti-player-play-filled bottom-play-btn"></i>
              <div class="csPlayer-vol-wrap">
                <i class="ti ti-volume bottom-volume-btn"></i>
                <div class="csPlayer-vol-slider-wrap">
                  <input class="csPlayer-vol-slider" type="range" min="0" max="100" value="100" step="1">
                </div>
              </div>
              <span class="csPlayer-live-badge" style="display:none">
                <span class="csPlayer-live-dot"></span>LIVE
              </span>
              <p class="csPlayer-time-cur">00:00</p>
              <div class="csPlayer-prog-wrap">
                <span class="csPlayer-buf-bar"></span>
                <input type="range" min="0" max="100" value="0" step="any">
              </div>
              <p class="csPlayer-time-dur">00:00</p>
              <i class="ti ti-settings settingsBtn"></i>
              <i class="ti ti-maximize fsBtn"></i>
            </div>
            <div class="csPlayer-settings-box">
              <div class="csPlayer-settings-section">
                <p class="csPlayer-settings-label">Speed<b>1×</b><i class="ti ti-caret-right-filled"></i></p>
                <div class="csPlayer-settings-items">
                  <label><input type="radio" name="${videoTag}_spd">0.5×</label>
                  <label><input type="radio" name="${videoTag}_spd">0.75×</label>
                  <label><input type="radio" name="${videoTag}_spd" checked>1×</label>
                  <label><input type="radio" name="${videoTag}_spd">1.25×</label>
                  <label><input type="radio" name="${videoTag}_spd">1.5×</label>
                  <label><input type="radio" name="${videoTag}_spd">1.75×</label>
                  <label><input type="radio" name="${videoTag}_spd">2×</label>
                </div>
              </div>
              <div class="csPlayer-settings-section">
                <p class="csPlayer-settings-label">Quality<b>Auto</b><i class="ti ti-caret-right-filled"></i></p>
                <div class="csPlayer-settings-items">
                  <label><input type="radio" name="${videoTag}_ql" checked data-q="auto">Auto</label>
                </div>
              </div>
            </div>
          </div>
        </div>`;
            resolve();
        });
    },

    /* ───────────────────────── pauseWithPromise ── */
    pauseVideoWithPromise: (player) =>
        new Promise((resolve, reject) => {
            try { player.pauseVideo(); resolve(); }
            catch (e) { reject(e); }
        }),

    /* ─────────────────────────────── YtSetup ── */
    YtSetup: (videoTag, playerTagId) => {
        var root = document.querySelector('#' + playerTagId).closest('.csPlayer');
        var controlsTO = null;
        var liveRetryTOs = [];
        var userSeeked = false;
        var currentVol = 100;
        var settingsInited = false;

        // ── helpers ──────────────────────────────────────────
        function param(key) { return csPlayer.csPlayers[videoTag]?.params?.[key]; }

        function preferLiveEdge() {
            return param('preferLiveEdge') === true || param('preferLiveEdge') === 'true';
        }

        function detectLive() {
            try {
                var vd = csPlayer.csPlayers[videoTag].videoTag.getVideoData();
                if (vd && typeof vd.isLive === 'boolean') return vd.isLive;
                var dur = csPlayer.csPlayers[videoTag].videoTag.getDuration();
                // 0 or non-finite duration → likely live stream without DVR
                return !isFinite(dur) || dur <= 0;
            } catch (e) { return false; }
        }

        function clearLiveRetries() {
            liveRetryTOs.forEach(clearTimeout);
            liveRetryTOs = [];
            csPlayer.csPlayers[videoTag].LiveEdgeRetryTimeouts = [];
        }

        function markSeeked() {
            userSeeked = true;
            clearLiveRetries();
        }

        function syncToLiveEdge(force) {
            if (!preferLiveEdge()) return false;
            if (userSeeked && !force) return false;
            try {
                var p = csPlayer.csPlayers[videoTag].videoTag;
                var dur = Number(p.getDuration());
                var cur = Number(p.getCurrentTime());
                if (!isFinite(dur) || dur <= 0 || !isFinite(cur)) return false;
                var edge = Math.max(0, dur - 1);
                var threshold = force ? 2 : 8;
                if (edge - cur > threshold) { p.seekTo(edge, true); return true; }
            } catch (e) { }
            return false;
        }

        function scheduleLiveEdgeSync() {
            if (!preferLiveEdge()) return;
            clearLiveRetries();
            [300, 900, 1800, 3200, 5000].forEach((ms) => {
                var id = setTimeout(() => { if (!userSeeked) syncToLiveEdge(true); }, ms);
                liveRetryTOs.push(id);
            });
            csPlayer.csPlayers[videoTag].LiveEdgeRetryTimeouts = [...liveRetryTOs];
        }

        function resetControlsTO() {
            clearTimeout(controlsTO);
            controlsTO = setTimeout(() => {
                root.querySelector('.csPlayer-controls-box').classList.remove('csPlayer-controls-open');
            }, 3000);
        }

        function formatTime(sec) {
            const s = Math.max(0, Math.floor(Number(sec) || 0));
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            const ss = s % 60;
            const pad = (n) => String(n).padStart(2, '0');
            return h > 0 ? `${pad(h)}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`;
        }

        // ── live badge ───────────────────────────────────────
        function refreshLiveBadge(isLive) {
            csPlayer.csPlayers[videoTag].isLive = isLive;
            var badge = root.querySelector('.csPlayer-live-badge');
            badge.style.display = isLive ? 'flex' : 'none';
        }

        function goToLive() {
            var dur = csPlayer.csPlayers[videoTag].videoTag.getDuration();
            if (isFinite(dur) && dur > 0) {
                csPlayer.csPlayers[videoTag].videoTag.seekTo(dur - 0.5, true);
                userSeeked = false;
            }
        }

        // ── time / slider updates ────────────────────────────
        function updateTextTime() {
            var p = csPlayer.csPlayers[videoTag].videoTag;
            var cur = p.getCurrentTime();
            var dur = p.getDuration();
            cur = isFinite(cur) && cur >= 0 ? cur : 0;
            dur = isFinite(dur) && dur >= 0 ? dur : 0;

            var isLive = csPlayer.csPlayers[videoTag].isLive;
            var curEl = root.querySelector('.csPlayer-time-cur');
            var durEl = root.querySelector('.csPlayer-time-dur');
            var badge = root.querySelector('.csPlayer-live-badge');

            if (isLive) {
                // Slider is locked for live — hide time, just show LIVE badge
                curEl.style.display = 'none';
                durEl.style.display = 'none';
                badge?.classList.add('csPlayer-at-edge');
            } else {
                curEl.style.display = durEl.style.display = 'block';
                curEl.textContent = formatTime(cur);
                durEl.textContent = formatTime(dur);
            }
        }

        function updateTimeSlider() {
            var p = csPlayer.csPlayers[videoTag].videoTag;
            var slider = root.querySelector('.csPlayer-prog-wrap input');
            var isLive = csPlayer.csPlayers[videoTag].isLive;

            // For LIVE: lock slider to 100%, no seeking allowed
            if (isLive) {
                slider.value = 100;
                slider.disabled = true;
                slider.style.pointerEvents = 'none';
                slider.style.background = `linear-gradient(to right, var(--sliderSeekTrackColor) 100%, transparent 100%)`;
                root.querySelector('.csPlayer-buf-bar').style.width = '100%';
                return;
            }

            // For VOD: normal slider behavior
            if (csPlayer.csPlayers[videoTag].dragging || csPlayer.csPlayers[videoTag]._seekSettling) return;
            slider.disabled = false;
            slider.style.pointerEvents = 'auto';
            var cur = p.getCurrentTime();
            var dur = p.getDuration();
            var pct = 0;
            if (isFinite(cur) && isFinite(dur) && dur > 0) {
                pct = (cur / dur) * 100;
            }
            pct = Math.min(100, Math.max(0, pct));

            var loaded = (p.getVideoLoadedFraction() || 0) * 100;
            loaded = Math.min(100, Math.max(0, isFinite(loaded) ? loaded : 0));

            slider.value = pct;
            slider.style.background =
                `linear-gradient(to right, var(--sliderSeekTrackColor) ${pct}%, transparent ${pct}%)`;
            root.querySelector('.csPlayer-buf-bar').style.width = loaded + '%';
        }

        // While dragging: ONLY update the visual gradient, do NOT seek.
        function onSliderDrag() {
            if (csPlayer.csPlayers[videoTag].isLive) return; // No drag on live
            clearTimeout(controlsTO);
            var slider = root.querySelector('.csPlayer-prog-wrap input');
            var pct = Number(slider.value);
            slider.style.background =
                `linear-gradient(to right, var(--sliderSeekTrackColor) ${pct}%, transparent ${pct}%)`;
        }

        // On release: commit the final seek position to YouTube (VOD only).
        function commitSeek() {
            if (csPlayer.csPlayers[videoTag].isLive) return; // No seek on live
            markSeeked();
            var slider = root.querySelector('.csPlayer-prog-wrap input');
            var dur = csPlayer.csPlayers[videoTag].videoTag.getDuration();
            var pct = Number(slider.value);
            if (isFinite(dur) && dur > 0) {
                var targetSec = (pct / 100) * dur;
                csPlayer.csPlayers[videoTag].videoTag.seekTo(targetSec, true);
            }
            resetControlsTO();
            // Block auto-update from snapping slider back while YouTube buffers
            csPlayer.csPlayers[videoTag]._seekSettling = true;
            clearTimeout(csPlayer.csPlayers[videoTag]._seekSettleTO);
            csPlayer.csPlayers[videoTag]._seekSettleTO = setTimeout(() => {
                csPlayer.csPlayers[videoTag]._seekSettling = false;
            }, 2500);
        }

        // ── volume ───────────────────────────────────────────
        function volIconClass(vol) {
            if (vol === 0) return 'ti ti-volume-3 bottom-volume-btn';
            if (vol < 50) return 'ti ti-volume-2 bottom-volume-btn';
            return 'ti ti-volume bottom-volume-btn';
        }

        function setupVolume() {
            var volBtn = root.querySelector('.bottom-volume-btn');
            var volSlider = root.querySelector('.csPlayer-vol-slider');
            if (!volBtn || !volSlider) return;

            // Start muted (YT starts muted); icon reflects 100% when unmuted
            volSlider.value = 100;
            volBtn.className = volIconClass(0); // muted at start

            volBtn.addEventListener('click', () => {
                var p = csPlayer.csPlayers[videoTag].videoTag;
                if (p.isMuted() || p.getVolume() === 0) {
                    p.unMute();
                    p.setVolume(currentVol || 100);
                    volSlider.value = currentVol || 100;
                    volBtn.className = volIconClass(currentVol || 100);
                } else {
                    currentVol = p.getVolume();
                    p.mute();
                    volBtn.className = volIconClass(0);
                }
            });

            volSlider.addEventListener('input', () => {
                var val = Number(volSlider.value);
                var p = csPlayer.csPlayers[videoTag].videoTag;
                if (val === 0) {
                    p.mute();
                } else {
                    if (p.isMuted()) p.unMute();
                    p.setVolume(val);
                    currentVol = val;
                }
                volBtn.className = volIconClass(p.isMuted() ? 0 : val);
            });
        }

        // ── play / pause / seek ──────────────────────────────
        function togglePlayPause() {
            var st = csPlayer.csPlayers[videoTag];
            if (st.isPlaying) {
                st.videoTag.pauseVideo();
                clearTimeout(controlsTO);
            } else {
                st.videoTag.playVideo();
                resetControlsTO();
            }
        }

        function backward() {
            markSeeked();
            var cur = csPlayer.csPlayers[videoTag].videoTag.getCurrentTime();
            csPlayer.csPlayers[videoTag].videoTag.seekTo(Math.max(0, cur - 10), true);
            resetControlsTO();
        }

        function forward() {
            markSeeked();
            var cur = csPlayer.csPlayers[videoTag].videoTag.getCurrentTime();
            csPlayer.csPlayers[videoTag].videoTag.seekTo(cur + 10, true);
            resetControlsTO();
        }

        // ── fullscreen ───────────────────────────────────────
        function toggleFullscreen() {
            if (!document.fullscreenEnabled) return;
            if (!document.fullscreenElement) {
                (root.requestFullscreen || root.webkitRequestFullscreen ||
                    root.mozRequestFullScreen || root.msRequestFullscreen).call(root);
            } else {
                (document.exitFullscreen || document.webkitExitFullscreen ||
                    document.mozCancelFullScreen || document.msExitFullscreen).call(document);
            }
        }

        function onFSChange() {
            var fsBtn = root.querySelector('.fsBtn');
            if (!fsBtn) return;
            fsBtn.className = document.fullscreenElement === root
                ? 'ti ti-minimize fsBtn'
                : 'ti ti-maximize fsBtn';
        }

        // Store for cleanup in destroy()
        csPlayer.csPlayers[videoTag]._onFSChange = onFSChange;

        // ── settings ─────────────────────────────────────────
        function initSettings() {
            if (settingsInited) return;
            settingsInited = true;
            var box = root.querySelector('.csPlayer-settings-box');

            // Speed
            box.querySelectorAll('.csPlayer-settings-section:nth-of-type(1) input').forEach((inp) => {
                inp.addEventListener('change', (e) => {
                    var val = e.target.closest('label').textContent.replace('×', '').trim();
                    box.querySelector('.csPlayer-settings-section:nth-of-type(1) b').textContent = val + '×';
                    csPlayer.csPlayers[videoTag].videoTag.setPlaybackRate(Number(val));
                    collapseAll();
                });
            });

            // Section toggles
            box.querySelectorAll('.csPlayer-settings-label').forEach((label) => {
                label.addEventListener('click', () => {
                    var items = label.nextElementSibling;
                    var isOpen = items.style.maxHeight && items.style.maxHeight !== '0px';
                    collapseAll();
                    if (!isOpen) items.style.maxHeight = '220px';
                });
            });
        }

        function collapseAll() {
            root.querySelectorAll('.csPlayer-settings-items').forEach((el) => {
                el.style.maxHeight = '0px';
            });
        }

        function populateQualities() {
            var box = root.querySelector('.csPlayer-settings-box');
            var qualWrap = box.querySelector('.csPlayer-settings-section:nth-of-type(2) .csPlayer-settings-items');
            var levels = csPlayer.csPlayers[videoTag].videoTag.getAvailableQualityLevels() || [];

            levels.forEach((q) => {
                if (qualWrap.querySelector(`[data-q="${q}"]`)) return;
                var lbl = document.createElement('label');
                var name = _csQualityMap[q] || q;
                lbl.innerHTML = `<input type="radio" name="${videoTag}_ql" data-q="${q}">${name}`;
                lbl.querySelector('input').addEventListener('change', (e) => {
                    var qv = e.target.getAttribute('data-q');
                    var disp = _csQualityMap[qv] || qv;
                    box.querySelector('.csPlayer-settings-section:nth-of-type(2) b').textContent = disp;
                    try {
                        var player = csPlayer.csPlayers[videoTag].videoTag;
                        var currentTime = Number(player.getCurrentTime()) || 0;
                        var videoData = player.getVideoData ? player.getVideoData() : null;
                        var currentVideoId = videoData?.video_id || csPlayer.csPlayers[videoTag].params.defaultId;
                        var suggestedQuality = qv === 'auto' ? 'default' : qv;

                        player.loadVideoById({
                            videoId: currentVideoId,
                            startSeconds: currentTime,
                            suggestedQuality: suggestedQuality,
                        });
                    } catch (err) {
                        if (window.APP_DEBUG_MODE) console.warn('Quality set failed:', err);
                    }
                    collapseAll();
                });
                qualWrap.appendChild(lbl);
            });
        }

        // Called by YT when quality actually changes — update the label
        function onQualityChange(event) {
            var q = (typeof event === 'object' && event.data) ? event.data : event;
            var disp = _csQualityMap[q] || q;
            var box = root.querySelector('.csPlayer-settings-box');
            if (box) {
                box.querySelector('.csPlayer-settings-section:nth-of-type(2) b').textContent = disp;
                // Check the matching radio
                var radio = box.querySelector(`[data-q="${q}"]`);
                if (radio) radio.checked = true;
            }
        }

        function toggleSettings() {
            var box = root.querySelector('.csPlayer-settings-box');
            clearTimeout(controlsTO);
            if (box.style.display === 'block') {
                box.style.display = 'none';
                collapseAll();
            } else {
                populateQualities();
                box.style.display = 'block';
                resetControlsTO();
            }
        }

        // ── state change ─────────────────────────────────────
        function onStateChange(event) {
            var st = csPlayer.csPlayers[videoTag];
            var controlsBox = root.querySelector('.csPlayer-controls-box');
            var ppBtn = root.querySelector('.csPlayer-play-pause-btn');
            var botPlay = root.querySelector('.bottom-play-btn');
            var volBtn = root.querySelector('.bottom-volume-btn');
            var volSlider = root.querySelector('.csPlayer-vol-slider');

            if (event.data === YT.PlayerState.PLAYING) {
                st.isPlaying = true;
                st.playerState = 'playing';

                // Detect live on first PLAYING event (getVideoData is populated now)
                if (!st.liveDetected) {
                    st.liveDetected = true;
                    refreshLiveBadge(detectLive());
                }

                if (!userSeeked) syncToLiveEdge(true);

                ppBtn.className = 'ti csPlayer-play-pause-btn ti-player-pause-filled';
                if (botPlay) botPlay.className = 'ti bottom-play-btn ti-player-pause-filled';

                // Unmute and restore volume
                st.videoTag.unMute();
                st.videoTag.setVolume(currentVol || 100);
                if (volSlider) volSlider.value = currentVol || 100;
                if (volBtn) volBtn.className = volIconClass(currentVol || 100);

                root.querySelector('.csPlayer-container span i').classList.add('csPlayer-loading');
                root.querySelector('.csPlayer-container span').style.display = 'none';
                root.querySelector('.csPlayer-container').style.pointerEvents = 'none';
                controlsBox.style.display = 'flex';
                resetControlsTO();

                // Use onclick to avoid accumulation
                controlsBox.onclick = (e) => {
                    var inMain = root.querySelector('.csPlayer-controls-box main').contains(e.target);
                    var inControls = root.querySelector('.csPlayer-controls').contains(e.target);
                    var inSettings = root.querySelector('.csPlayer-settings-box').contains(e.target);
                    if (inMain || inControls || inSettings) return;
                    if (controlsBox.classList.contains('csPlayer-controls-open')) {
                        controlsBox.classList.remove('csPlayer-controls-open');
                        clearTimeout(controlsTO);
                    } else {
                        controlsBox.classList.add('csPlayer-controls-open');
                        resetControlsTO();
                    }
                };

            } else if (event.data === YT.PlayerState.PAUSED) {
                clearTimeout(controlsTO);
                st.isPlaying = false;
                st.playerState = 'paused';
                ppBtn.className = 'ti csPlayer-play-pause-btn ti-player-play-filled';
                if (botPlay) botPlay.className = 'ti bottom-play-btn ti-player-play-filled';
                controlsBox.classList.add('csPlayer-controls-open');

            } else if (event.data === YT.PlayerState.BUFFERING) {
                st.playerState = 'buffering';

            } else if (event.data === YT.PlayerState.ENDED) {
                st.playerState = 'ended';
                var loop = param('loop');
                if (loop === true || loop === 'true') {
                    st.videoTag.seekTo(0);
                } else {
                    st.videoTag.seekTo(0);
                    st.videoTag.pauseVideo();
                }
            }

            // Always suppress captions
            try { st.videoTag.unloadModule('captions'); st.videoTag.unloadModule('cc'); } catch (_) { }
        }

        // ── Player init ───────────────────────────────────────
        return new Promise((resolve, reject) => {
            csPlayer.csPlayers[videoTag].videoTag = new YT.Player(playerTagId, {
                videoId: csPlayer.csPlayers[videoTag].params.defaultId,
                playerVars: {
                    controls: 0,
                    mute: 1,
                    autoplay: 1,
                    disablekb: 1,
                    color: 'white',
                    fs: 0,
                    playsinline: 1,
                    rel: 0,
                    loop: 0,
                    cc_load_policy: 3,
                    showinfo: 0,
                    iv_load_policy: 3,
                    // Domain protection: tell YouTube the legitimate origin
                    origin: window.location.origin,
                    widget_referrer: window.location.origin,
                },
                events: {
                    onReady: () => {
                        if (!$('#' + videoTag)) return;
                        csPlayer.pauseVideoWithPromise(csPlayer.csPlayers[videoTag].videoTag)
                            .then(() => {
                                var iframe = root.querySelector('.csPlayer-container iframe');
                                iframe.addEventListener('load', () => {
                                    // Loading spinner off
                                    root.querySelector('.csPlayer-container span i').classList.remove('csPlayer-loading');

                                    // Mobile overlay click
                                    var overlay = root.querySelector('.csPlayer-container span');
                                    overlay.style.pointerEvents = 'auto';
                                    overlay.style.cursor = 'pointer';
                                    overlay.addEventListener('click', () => {
                                        csPlayer.csPlayers[videoTag].videoTag.playVideo();
                                    });

                                    // Center controls
                                    root.querySelector('.csPlayer-controls-box main i:nth-of-type(1)').addEventListener('click', backward);
                                    root.querySelector('.csPlayer-controls-box main i:nth-of-type(2)').addEventListener('click', togglePlayPause);
                                    root.querySelector('.csPlayer-controls-box main i:nth-of-type(3)').addEventListener('click', forward);

                                    // Bottom play
                                    var botPlay = root.querySelector('.bottom-play-btn');
                                    if (botPlay) botPlay.addEventListener('click', togglePlayPause);

                                    // Volume
                                    setupVolume();

                                    // Progress slider
                                    var progSlider = root.querySelector('.csPlayer-prog-wrap input');
                                    progSlider.addEventListener('mousedown', () => { csPlayer.csPlayers[videoTag].dragging = true; });
                                    progSlider.addEventListener('touchstart', () => { csPlayer.csPlayers[videoTag].dragging = true; }, { passive: true });
                                    progSlider.addEventListener('mouseup', () => {
                                        csPlayer.csPlayers[videoTag].dragging = false;
                                        commitSeek();
                                    });
                                    progSlider.addEventListener('touchend', () => {
                                        csPlayer.csPlayers[videoTag].dragging = false;
                                        commitSeek();
                                    });
                                    // During drag: visual-only updates (no seekTo)
                                    progSlider.addEventListener('input', onSliderDrag);
                                    // Single click on the track (no drag): also commit
                                    progSlider.addEventListener('change', () => {
                                        if (!csPlayer.csPlayers[videoTag].dragging) commitSeek();
                                    });

                                    // Live badge click → jump to live edge
                                    root.querySelector('.csPlayer-live-badge').addEventListener('click', goToLive);

                                    // Intervals (500 ms for smooth updates)
                                    csPlayer.csPlayers[videoTag].TextTimeInterval = setInterval(updateTextTime, 500);
                                    csPlayer.csPlayers[videoTag].TimeSliderInterval = setInterval(updateTimeSlider, 500);

                                    scheduleLiveEdgeSync();

                                    // Fullscreen
                                    var fsBtn = root.querySelector('.fsBtn');
                                    fsBtn.style.display = document.fullscreenEnabled ? 'block' : 'none';
                                    fsBtn.addEventListener('click', toggleFullscreen);
                                    document.addEventListener('fullscreenchange', onFSChange);

                                    // Settings
                                    root.querySelector('.settingsBtn').addEventListener('click', toggleSettings);
                                    initSettings();

                                    // State change + quality change listeners
                                    csPlayer.csPlayers[videoTag].videoTag.addEventListener('onStateChange', onStateChange);
                                    csPlayer.csPlayers[videoTag].videoTag.addEventListener('onPlaybackQualityChange', onQualityChange);

                                    if (window.APP_DEBUG_MODE) console.log('csPlayer: ready —', videoTag);
                                    resolve();
                                });
                            })
                            .catch(reject);
                    },
                    onError: (event) => {
                        if (window.APP_DEBUG_MODE) console.error('csPlayer: YT error', event.data, 'on', videoTag);
                        var icon = root.querySelector('.csPlayer-container span i');
                        icon.classList.remove('csPlayer-loading');
                        icon.classList.add('ti-alert-circle');
                        icon.style.display = 'flex';
                        reject(new Error('YouTube Player Error: ' + event.data));
                    },
                },
            });
        });
    },

    /* ─────────────────────────── Public API ── */
    init: (videoTag, params) => {
        return new Promise((resolve, reject) => {
            if (!videoTag || !params?.defaultId) {
                return reject(new Error('init() requires videoTag and params.defaultId'));
            }
            if (!$('#' + videoTag)) {
                return reject(new Error('No element #' + videoTag));
            }
            if (videoTag in csPlayer.csPlayers) {
                return reject(new Error('Player ' + videoTag + ' already exists'));
            }

            csPlayer.csPlayers[videoTag] = {
                videoTag: videoTag,
                params: { ...params },
                isPlaying: false,
                playerState: 'paused',
                initialized: false,
                isLive: false,
                liveDetected: false,
                dragging: false,
            };

            csPlayer.preSetup(videoTag, 'csPlayer-' + videoTag).then(() => {
                var root = document.querySelector('#csPlayer-' + videoTag).closest('.csPlayer');
                var thumb = params.thumbnail;
                var span = root.querySelector('.csPlayer-container span');

                csPlayer.applyThumbnail(span, thumb, params.defaultId);

                csPlayer.YtSetup(videoTag, 'csPlayer-' + videoTag)
                    .then(() => {
                        csPlayer.csPlayers[videoTag].initialized = true;
                        if (window.APP_DEBUG_MODE) console.log('csPlayer: initialized —', videoTag);
                        resolve();
                    })
                    .catch(reject);
            }).catch(reject);
        });
    },

    _check: (videoTag, fn) => {
        if (!videoTag) throw new Error(fn + '() requires a player id');
        if (!(videoTag in csPlayer.csPlayers) || !csPlayer.csPlayers[videoTag].initialized) {
            throw new Error('Player ' + videoTag + ' not initialized');
        }
    },

    pause: (videoTag) => {
        csPlayer._check(videoTag, 'pause');
        csPlayer.csPlayers[videoTag].videoTag.pauseVideo();
    },

    play: (videoTag) => {
        csPlayer._check(videoTag, 'play');
        if (csPlayer.csPlayers[videoTag].videoTag.isMuted()) {
            throw new Error('Play the video manually at least once first');
        }
        csPlayer.csPlayers[videoTag].videoTag.playVideo();
    },

    getDuration: (videoTag) => {
        csPlayer._check(videoTag, 'getDuration');
        return csPlayer.csPlayers[videoTag].videoTag.getDuration();
    },

    getCurrentTime: (videoTag) => {
        csPlayer._check(videoTag, 'getCurrentTime');
        return csPlayer.csPlayers[videoTag].videoTag.getCurrentTime();
    },

    getVideoTitle: (videoTag) => {
        csPlayer._check(videoTag, 'getVideoTitle');
        return csPlayer.csPlayers[videoTag].videoTag.getVideoData().title;
    },

    getPlayerState: (videoTag) => {
        csPlayer._check(videoTag, 'getPlayerState');
        return csPlayer.csPlayers[videoTag].playerState;
    },

    isLive: (videoTag) => {
        csPlayer._check(videoTag, 'isLive');
        return csPlayer.csPlayers[videoTag].isLive;
    },

    changeVideo: (videoTag, videoId) => {
        if (!videoId) throw new Error('changeVideo() requires videoTag and videoId');
        csPlayer._check(videoTag, 'changeVideo');
        if (csPlayer.csPlayers[videoTag].videoTag.isMuted()) {
            throw new Error('Play the player at least once before calling changeVideo()');
        }
        csPlayer.csPlayers[videoTag].isLive = false;
        csPlayer.csPlayers[videoTag].liveDetected = false;
        csPlayer.csPlayers[videoTag].videoTag.loadVideoById(videoId, 0);
    },

    destroy: (videoTag) => {
        csPlayer._check(videoTag, 'destroy');
        var st = csPlayer.csPlayers[videoTag];
        clearInterval(st.TimeSliderInterval);
        clearInterval(st.TextTimeInterval);
        (st.LiveEdgeRetryTimeouts || []).forEach(clearTimeout);
        if (st._onFSChange) document.removeEventListener('fullscreenchange', st._onFSChange);
        st.videoTag.destroy();
        delete csPlayer.csPlayers[videoTag];
    },

    initialized: (videoTag) => {
        if (!videoTag) throw new Error('initialized() requires a player id');
        if (!(videoTag in csPlayer.csPlayers)) throw new Error('Player ' + videoTag + ' not found');
        return csPlayer.csPlayers[videoTag].initialized;
    },
};
