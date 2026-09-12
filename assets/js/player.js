/* ==========================================================================
   Konar / Nava — Unified Professional Audio Engine
   One real HTML5 Audio element + one shared state across every page.
   ========================================================================== */
(() => {
  'use strict';

  const STORE = 'konar_player_v13';
  const SETTINGS = 'konar_player_settings_v13';
  const ICONS = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13L19 12 8 5.5Z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h2v12H6V6Zm13 0v12l-10-6 10-6Z"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6h2v12h-2V6ZM5 6l10 6-10 6V6Z"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 7H4v4"/><path d="M4.5 11a8 8 0 1 0 2.1-5.2L4 7"/></svg>',
    forward: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 7h4v4"/><path d="M19.5 11a8 8 0 1 1-2.1-5.2L20 7"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m4 4 5 5"/><path d="m15 15 6 6"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
    volume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4Z"/><path d="m18 9 4 4m0-4-4 4"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 8.6c0 5.7-8.8 11.1-8.8 11.1S3.2 14.3 3.2 8.6A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>'
  };

  const state = {
    audio: null,
    tracks: [],
    track: null,
    index: -1,
    playing: false,
    shuffle: false,
    repeat: 'none',
    volume: 0.8,
    muted: false,
    lastVolume: 0.8,
    detailSource: null
  };

  let gp = null;
  let saveTimer = null;
  let beatFrame = 0;
  let playbackFrame = 0;
  let gpProgressDragging = false;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupGlobalPlayer();
    setupAudio();
    collectQueue();
    initTrackTriggers();
    initDetailPage();
    initTabs();
    setupLyricsCopy();
    restoreSettings();
    restoreState();
    bindKeyboard();
    syncAll();
    window.KonarPlayer = {
      playTrack: (source, autoplay = true) => playSource(source, autoplay),
      getState: () => ({ ...state, audio: undefined }),
      pause: () => state.audio?.pause(),
      resume: () => state.audio?.play(),
    };
  }

  function setupGlobalPlayer() {
    gp = document.querySelector('[data-global-player]');
    if (!gp) {
      gp = document.createElement('aside');
      gp.className = 'global-player';
      gp.dataset.globalPlayer = '';
      document.body.appendChild(gp);
    }
    gp.hidden = true;
    gp.setAttribute('aria-label', 'پخش‌کننده موسیقی');
    gp.innerHTML = `
      <div class="gp-main">
        <div class="gp-cover-wrap">
          <img class="global-player-cover" data-gp-cover src="assets/images/cover-01.svg" alt="جلد آهنگ">
          <span class="gp-live-dot" aria-hidden="true"></span>
        </div>
        <div class="global-player-meta">
          <div class="gp-overline"><span>اکنون در حال پخش</span><span class="gp-format" data-gp-format>MP3</span></div>
          <strong data-gp-title>انتخابی نشده</strong>
          <a data-gp-artist-link href="artist.html"><span data-gp-artist>—</span></a>
        </div>
      </div>
      <div class="gp-center">
        <div class="gp-controls">
          <button class="gp-control gp-seek" data-gp-forward type="button" aria-label="۱۰ ثانیه جلو">${ICONS.forward}<span>10</span></button>
          <button class="gp-play" data-gp-play type="button" aria-label="پخش">${ICONS.play}</button>
          <button class="gp-control gp-seek" data-gp-back type="button" aria-label="۱۰ ثانیه عقب">${ICONS.back}<span>10</span></button>
        </div>
        <div class="gp-progress">
          <span data-gp-current>۰:۰۰</span>
          <input data-gp-progress type="range" min="0" max="100" step="0.1" value="0" aria-label="پیشرفت پخش">
          <span data-gp-duration>۰:۰۰</span>
        </div>
      </div>
      <div class="gp-actions">
        <button class="gp-volume-button" data-gp-mute type="button" aria-label="بی‌صدا کردن">${ICONS.volume}</button>
        <input class="gp-volume" data-gp-volume type="range" min="0" max="100" step="1" value="80" aria-label="صدا">
      </div>
      <audio data-gp-audio preload="metadata"></audio>
    `;

    gp.querySelector('[data-gp-play]').addEventListener('click', togglePlay);
    gp.querySelector('[data-gp-back]').addEventListener('click', () => seekBy(-10));
    gp.querySelector('[data-gp-forward]').addEventListener('click', () => seekBy(10));
    const gpProgressInput = gp.querySelector('[data-gp-progress]');
    gpProgressInput.addEventListener('input', e => seekPercent(Number(e.target.value)));
    gpProgressInput.addEventListener('pointerdown', () => { gpProgressDragging = true; });
    const endGpProgressDrag = () => {
      if (!gpProgressDragging) return;
      gpProgressDragging = false;
      syncAll();
    };
    gpProgressInput.addEventListener('pointerup', endGpProgressDrag);
    gpProgressInput.addEventListener('pointercancel', endGpProgressDrag);
    gpProgressInput.addEventListener('change', endGpProgressDrag);
    gpProgressInput.addEventListener('blur', endGpProgressDrag);
    gp.querySelector('[data-gp-mute]').addEventListener('click', toggleMute);
    gp.querySelector('[data-gp-volume]').addEventListener('input', e => setVolume(Number(e.target.value) / 100));
    gp.querySelector('[data-gp-artist-link]').addEventListener('click', e => {
      if (!state.track?.artist) return;
      e.currentTarget.href = `artist.html?artist=${encodeURIComponent(state.track.artist)}`;
    });
  }

  function setupAudio() {
    state.audio = gp.querySelector('[data-gp-audio]');
    state.audio.addEventListener('loadedmetadata', () => {
      if (state.track) state.track.duration = state.audio.duration;
      syncAll();
      saveStateDebounced();
      updateMediaSession();
    });
    state.audio.addEventListener('timeupdate', () => {
      syncAll();
      saveStateDebounced();
    });
    state.audio.addEventListener('play', () => {
      state.playing = true;
      startPlaybackFrame();
      syncAll();
      updateMediaSession();
    });
    state.audio.addEventListener('pause', () => {
      state.playing = false;
      stopPlaybackFrame();
      syncAll();
      saveState();
    });
    state.audio.addEventListener('seeking', () => syncAll());
    state.audio.addEventListener('seeked', () => syncAll());
    state.audio.addEventListener('ended', handleEnded);
    state.audio.addEventListener('error', () => {
      state.playing = false;
      stopPlaybackFrame();
      syncAll();
      toast('فایل صوتی در این نسخه در دسترس نیست؛ در Django مسیر audio_file را وصل کنید.', 'error');
    });
    const storedVolume = Number(localStorage.getItem('konar_volume_v13'));
    setVolume(Number.isFinite(storedVolume) ? storedVolume : 0.8, false);
  }

  function collectQueue() {
    const rows = [...document.querySelectorAll('[data-track]')];
    state.tracks = rows.map((row, i) => ({ ...readTrack(row), _node: row, _order: i })).filter(t => t.title && t.src);
    if (!state.tracks.length) {
      // Legacy markup fallback: rows can have data-track as an empty attribute.
      state.tracks = [...document.querySelectorAll('.track-row[data-src]')].map((row, i) => ({ ...readTrack(row), _node: row, _order: i })).filter(t => t.title && t.src);
    }
  }

  function readTrack(source) {
    const d = source?.dataset || {};
    return {
      id: d.id || `${d.title || 'track'}-${d.artist || ''}`,
      title: d.title || source?.querySelector('.meta h4')?.textContent?.trim() || source?.querySelector('[data-track-title]')?.textContent?.trim() || '',
      artist: d.artist || source?.querySelector('.artist-link')?.textContent?.trim() || '',
      album: d.album || '',
      cover: d.cover || source?.querySelector('img')?.getAttribute('src') || 'assets/images/cover-01.svg',
      src: d.src || '',
      duration: Number(d.duration || d.durationSeconds || 0),
      release: d.release || '',
      plays: d.plays || '',
      genre: d.genre || '',
      quality: d.quality || 'MP3 320',
      feat: d.feat || '',
      lyrics: d.lyrics || ''
    };
  }

  function initTrackTriggers() {
    document.addEventListener('click', e => {
      const albumCover = e.target.closest('[data-album-select]');
      if (albumCover && albumCover.closest('[data-tab-panel="album"]')) {
        e.preventDefault();
        const row = albumCover.closest('[data-track], .track-row');
        if (row) playSource(row, true);
        return;
      }
      const nowPlay = e.target.closest('[data-now-play]');
      if (nowPlay) {
        e.preventDefault();
        if (state.track) togglePlay();
        else if (state.tracks[0]) playSource(state.tracks[0]._node, true);
        return;
      }
      const button = e.target.closest('[data-play-track]');
      if (button) {
        e.preventDefault();
        const row = button.closest('[data-track], .track-row');
        if (row) playSource(row, true);
        return;
      }
      const coverPlay = e.target.closest('[data-play-card]');
      if (coverPlay) {
        e.preventDefault();
        const row = coverPlay.closest('[data-track], .track-row');
        if (row) playSource(row, true);
        return;
      }
      const albumRow = e.target.closest('[data-tab-panel="album"] [data-track]');
      if (albumRow && !e.target.closest('a,button,input')) {
        playSource(albumRow, true);
      }
    });
  }

  function initDetailPage() {
    const detailPlayer = document.querySelector('[data-player]');
    const firstTrack = detailPlayer ? readTrack(detailPlayer) : null;
    if (!detailPlayer || !firstTrack?.title) return;
    state.detailSource = detailPlayer;

    // Make the dedicated player a rich visual companion to the floating player.
    detailPlayer.querySelectorAll('[data-detail-action]').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.detailAction;
        if (action === 'play') togglePlay();
        if (action === 'back') seekBy(-10);
        if (action === 'forward') seekBy(10);
        if (action === 'mute') toggleMute();
      });
    });
    const progress = detailPlayer.querySelector('[data-detail-progress]');
    if (progress) {
      const seekFromPointer = (e) => {
        if (!state.track) return;
        const rect = progress.getBoundingClientRect();
        if (!rect.width) return;
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        progress.value = String(pct * 100);
        seekPercent(pct * 100);
      };
      progress.addEventListener('input', e => seekPercent(Number(e.target.value)));
      progress.addEventListener('pointerdown', seekFromPointer);
      progress.addEventListener('click', seekFromPointer);
      const visual = detailPlayer.querySelector('.detail-progress-visual');
      if (visual) {
        const seekVisual = e => seekFromPointer(e);
        visual.addEventListener('pointerdown', seekVisual);
        visual.addEventListener('click', seekVisual);
      }
    }
    detailPlayer.querySelectorAll('[data-volume]').forEach(input => input.addEventListener('input', e => setVolume(Number(e.target.value) / 100)));

    const currentKey = localStorage.getItem('konar_open_detail_v12');
    if (currentKey) {
      const row = [...document.querySelectorAll('[data-tab-panel="album"] [data-track], [data-track][data-album]')].find(r => readTrack(r).id === currentKey);
      if (row) updateDetailFromTrack(row, false);
    }

    // The detail page itself should use the same track definition as the global queue.
    const existing = state.tracks.find(t => sameTrack(t, firstTrack));
    if (existing) {
      state.track = existing;
      state.index = existing._order;
    } else {
      state.track = firstTrack;
      state.index = -1;
    }
    // The dedicated detail player is never a second audio source. It mirrors
    // the same Audio element used by the floating player.
    syncDetailMeta(state.track);
    syncAll();
  }

  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(tabs => {
      tabs.addEventListener('click', e => {
        const btn = e.target.closest('[data-tab-target]');
        if (!btn) return;
        const target = btn.dataset.tabTarget;
        tabs.querySelectorAll('[data-tab-target]').forEach(b => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', String(active));
        });
        const scope = tabs.closest('.container, .detail-body, body');
        scope.querySelectorAll('[data-tab-panel]').forEach(panel => panel.classList.toggle('is-active', panel.dataset.tabPanel === target));
      });
    });
  }

  function playSource(source, autoplay = true, options = {}) {
    const track = source?.dataset ? readTrack(source) : source;
    if (!track?.src || !track.title) return;
    const queueMatch = state.tracks.findIndex(t => sameTrack(t, track));
    state.index = queueMatch;
    state.track = queueMatch >= 0 ? state.tracks[queueMatch] : track;
    document.querySelectorAll('[data-track]').forEach(row => {
      if (sameTrack(readTrack(row), state.track) && row.closest('[data-tab-panel="album"]')) row.classList.add('is-selected-detail');
    });

    const targetSrc = new URL(state.track.src, document.baseURI).href;
    const isSame = state.audio.src === targetSrc;
    const requestedSeek = Number.isFinite(Number(options.seekPercent))
      ? Math.max(0, Math.min(100, Number(options.seekPercent)))
      : null;
    const preservePlayback = !!options.preservePlayback;

    const seekLoaded = () => {
      if (state.track?.src !== track.src) return;
      if (requestedSeek != null) {
        const duration = Number.isFinite(state.audio.duration) && state.audio.duration > 0
          ? state.audio.duration
          : Number(state.track?.duration || 0);
        if (duration > 0) state.audio.currentTime = duration * requestedSeek / 100;
      }
      syncAll();
      if (autoplay || preservePlayback) {
        const playPromise = state.audio.play();
        if (playPromise?.catch) {
          playPromise.catch(() => {
            state.playing = false;
            syncAll();
          });
        }
      }
    };

    if (!isSame) {
      state.playing = false;
      state.audio.pause();

      if (requestedSeek != null || autoplay || preservePlayback) {
        const onMetadata = () => seekLoaded();
        state.audio.addEventListener('loadedmetadata', onMetadata, { once: true });
      }

      state.audio.src = targetSrc;
      state.audio.load();
      try { state.audio.currentTime = 0; } catch (_) {}
    } else {
      if (requestedSeek != null) {
        const duration = Number.isFinite(state.audio.duration) && state.audio.duration > 0
          ? state.audio.duration
          : Number(state.track?.duration || 0);
        if (duration > 0) state.audio.currentTime = duration * requestedSeek / 100;
      }
      syncAll();
      if (autoplay || preservePlayback) {
        const playPromise = state.audio.play();
        if (playPromise?.catch) {
          playPromise.catch(() => {
            state.playing = false;
            syncAll();
          });
        }
      }
    }
    updateDetailFromTrack(source, false);
    saveState();
    syncAll();
  }

  function togglePlay() {
    if (!state.track) {
      const first = state.tracks[0];
      if (first) return playSource(first._node, true);
      return;
    }
    if (state.audio.paused) state.audio.play().catch(() => {});
    else state.audio.pause();
  }

  function changeTrack(delta) {
    if (!state.tracks.length) return;
    let next;
    if (state.shuffle) {
      if (state.tracks.length === 1) next = 0;
      else {
        do next = Math.floor(Math.random() * state.tracks.length); while (next === state.index);
      }
    } else {
      next = state.index + delta;
      if (next < 0) next = state.tracks.length - 1;
      if (next >= state.tracks.length) next = 0;
    }
    const row = state.tracks[next]?._node;
    if (row) playSource(row, true);
  }

  function handleEnded() {
    state.playing = false;
    if (state.repeat === 'one') {
      state.audio.currentTime = 0;
      state.audio.play().catch(() => {});
      return;
    }
    if (state.repeat === 'all' || state.index < state.tracks.length - 1 || state.shuffle) {
      changeTrack(1);
      return;
    }
    state.audio.currentTime = 0;
    syncAll();
    saveState();
  }

  function seekBy(delta) {
    if (!state.audio) return;
    const duration = state.audio.duration || state.track?.duration || 0;
    state.audio.currentTime = Math.min(duration || Infinity, Math.max(0, state.audio.currentTime + delta));
    syncAll();
  }

  function seekPercent(percent) {
    if (!state.audio) return;
    const duration = state.audio.duration || state.track?.duration || 0;
    if (!duration) return;
    state.audio.currentTime = duration * Math.max(0, Math.min(100, percent)) / 100;
    syncAll();
  }

  function toggleShuffle() {
    state.shuffle = !state.shuffle;
    saveSettings();
    syncAll();
  }

  function toggleRepeat() {
    state.repeat = state.repeat === 'none' ? 'all' : state.repeat === 'all' ? 'one' : 'none';
    saveSettings();
    syncAll();
  }

  function setVolume(value, persist = true) {
    const v = Math.max(0, Math.min(1, Number(value) || 0));
    state.volume = v;
    if (v > 0) state.lastVolume = v;
    state.muted = false;
    if (state.audio) {
      state.audio.muted = false;
      state.audio.volume = v;
    }
    if (persist) localStorage.setItem('konar_volume_v13', String(v));
    syncVolumeUI();
  }

  function toggleMute() {
    if (!state.audio) return;
    if (state.audio.muted || state.audio.volume === 0) {
      const v = state.lastVolume || 0.8;
      state.audio.muted = false;
      setVolume(v);
    } else {
      state.lastVolume = state.audio.volume || 0.8;
      state.audio.muted = true;
      state.muted = true;
      syncVolumeUI();
    }
  }

  function closePlayer() {
    state.audio.pause();
    state.audio.removeAttribute('src');
    state.audio.load();
    state.track = null;
    state.index = -1;
    state.playing = false;
    gp.hidden = true;
    document.body.classList.remove('has-global-player');
    try { localStorage.removeItem(STORE); } catch (_) {}
    syncAll();
  }

  function startPlaybackFrame() {
    stopPlaybackFrame();
    const tick = () => {
      if (!state.audio || state.audio.paused || state.audio.ended) {
        playbackFrame = 0;
        return;
      }
      const duration = Number.isFinite(state.audio.duration) && state.audio.duration
        ? state.audio.duration
        : (state.track?.duration || 0);
      const current = Number.isFinite(state.audio.currentTime) ? state.audio.currentTime : 0;
      const percent = duration ? Math.max(0, Math.min(100, current / duration * 100)) : 0;
      paintPlaybackProgress(percent, duration, current);
      playbackFrame = requestAnimationFrame(tick);
    };
    playbackFrame = requestAnimationFrame(tick);
  }

  function stopPlaybackFrame() {
    if (playbackFrame) cancelAnimationFrame(playbackFrame);
    playbackFrame = 0;
  }

  function paintPlaybackProgress(percent, duration, current) {
    if (!state.track) return;
    const safe = Math.max(0, Math.min(100, Number(percent) || 0));
    const progress = gp?.querySelector('[data-gp-progress]');
    if (progress) {
      if (!gpProgressDragging) progress.value = String(safe);
      paintRange(progress, safe, '--gp-progress');
    }
    document.querySelectorAll('[data-detail-progress]').forEach(input => {
      input.value = String(safe);
      paintRange(input, safe, '--detail-progress');
    });
    document.querySelectorAll('[data-now-progress]').forEach(input => {
      input.value = String(safe);
      paintRange(input, safe, '--now-progress');
    });
    document.querySelectorAll('[data-current-time]').forEach(el => { el.textContent = formatTime(current); });
    document.querySelectorAll('[data-gp-current]').forEach(el => { el.textContent = formatTime(current); });
    document.querySelectorAll('[data-now-current]').forEach(el => { el.textContent = formatTime(current); });
    animateWaveforms(safe, current);
    updateMediaSessionPosition(duration, current);
  }

  function syncAll() {
    const track = state.track;
    if (!track) {
      gp.hidden = true;
      document.body.classList.remove('has-global-player');
      syncDetailFallback();
      return;
    }
    gp.hidden = false;
    document.body.classList.add('has-global-player');
    const duration = Number.isFinite(state.audio.duration) && state.audio.duration ? state.audio.duration : (track.duration || 0);
    const current = Number.isFinite(state.audio.currentTime) ? state.audio.currentTime : 0;
    const percent = duration ? Math.max(0, Math.min(100, current / duration * 100)) : 0;

    gp.classList.toggle('is-playing', state.playing);
    gp.querySelector('[data-gp-cover]').src = track.cover;
    gp.querySelector('[data-gp-cover]').alt = `جلد ${track.title}`;
    gp.querySelector('[data-gp-title]').textContent = track.title;
    gp.querySelector('[data-gp-artist]').textContent = track.artist || 'هنرمند نامشخص';
    gp.querySelector('[data-gp-format]').textContent = track.quality || 'MP3';
    gp.querySelector('[data-gp-current]').textContent = formatTime(current);
    gp.querySelector('[data-gp-duration]').textContent = formatTime(duration);
    const progress = gp.querySelector('[data-gp-progress]');
    if (!gpProgressDragging) progress.value = String(percent);
    paintRange(progress, percent, '--gp-progress');
    const play = gp.querySelector('[data-gp-play]');
    play.innerHTML = state.playing ? ICONS.pause : ICONS.play;
    play.setAttribute('aria-label', state.playing ? 'توقف' : 'پخش');

    syncVolumeUI();
    syncRows();
    syncDetailPlayer(percent, duration, current);
    syncNowPlaying(percent, duration, current);
    syncDetailMeta(track);
    animateWaveforms(percent, current);
    updateMediaSessionPosition(duration, current);
  }

  function syncRows() {
    const key = state.track ? trackKey(state.track) : '';
    document.querySelectorAll('[data-track]').forEach(row => {
      const track = readTrack(row);
      const active = key && trackKey(track) === key;
      const playing = active && state.playing;
      row.classList.toggle('is-active', !!active);
      row.classList.toggle('is-playing', !!playing);
      row.setAttribute('aria-current', active ? 'true' : 'false');
      const button = row.querySelector('[data-play-track]');
      if (button) {
        button.innerHTML = playing ? ICONS.pause : ICONS.play;
        button.setAttribute('aria-label', playing ? `توقف ${track.title}` : `پخش ${track.title}`);
        button.classList.toggle('is-playing-button', playing);
      }
    });
  }

  function syncDetailPlayer(percent, duration, current) {
    document.querySelectorAll('[data-player]').forEach(player => {
      const currentPlayer = state.track && sameTrack(readTrack(player), state.track);
      const detailTrack = state.track || readTrack(player);
      const localPercent = currentPlayer ? percent : 0;
      player.classList.toggle('is-playing', !!(currentPlayer && state.playing));
      player.classList.toggle('is-active', !!currentPlayer);
      const button = player.querySelector('[data-detail-action="play"]') || player.querySelector('[data-play]');
      if (button) button.innerHTML = state.playing && currentPlayer ? ICONS.pause : ICONS.play;
      if (button) button.setAttribute('aria-label', state.playing && currentPlayer ? 'توقف' : 'پخش');
      const progress = player.querySelector('[data-detail-progress]');
      if (progress) {
        progress.value = String(localPercent);
        paintRange(progress, localPercent, '--detail-progress');
      }
      const cur = player.querySelector('[data-current-time]');
      const dur = player.querySelector('[data-duration]');
      if (cur) cur.textContent = formatTime(currentPlayer ? current : 0);
      if (dur) dur.textContent = formatTime(currentPlayer ? duration : detailTrack.duration);
      const status = player.querySelector('[data-player-status]');
      if (status) {
        status.textContent = currentPlayer ? (state.playing ? 'در حال پخش' : 'مکث شده') : 'آماده پخش';
        status.classList.toggle('is-playing', !!(currentPlayer && state.playing));
      }
    });
  }

  function syncNowPlaying(percent, duration, current) {
    document.querySelectorAll('[data-now-title], [data-now-artist], [data-now-cover], [data-now-current], [data-now-duration]').forEach(el => {
      const track = state.track;
      if (el.matches('[data-now-title]')) el.textContent = track?.title || 'هنوز آهنگی پخش نشده';
      if (el.matches('[data-now-artist]')) el.textContent = track ? [track.artist, track.album ? `از آلبوم ${track.album}` : ''].filter(Boolean).join(' · ') : 'برای شروع یک آهنگ را انتخاب کن';
      if (el.matches('[data-now-cover]') && track) { el.src = track.cover; el.alt = `جلد ${track.title}`; }
      if (el.matches('[data-now-current]')) el.textContent = formatTime(current);
      if (el.matches('[data-now-duration]')) el.textContent = formatTime(duration);
    });
    document.querySelectorAll('[data-now-play]').forEach(btn => {
      btn.innerHTML = state.playing ? ICONS.pause : ICONS.play;
      btn.setAttribute('aria-label', state.playing ? 'توقف' : 'پخش');
    });
    document.querySelectorAll('[data-now-progress]').forEach(input => {
      input.value = String(percent);
      paintRange(input, percent, '--now-progress');
      input.disabled = !state.track;
    });
    document.querySelectorAll('.hero-now-playing').forEach(el => el.classList.toggle('is-playing', state.playing));
  }

  function syncDetailMeta(track) {
    const detail = document.querySelector('.detail-hero');
    if (!detail || !track) return;
    detail.style.setProperty('--detail-cover', `url("${cssUrl(track.cover)}")`);
    const set = (selector, text) => { const el = detail.querySelector(selector); if (el && text) el.textContent = text; };
    const cover = detail.querySelector('[data-detail-cover]');
    if (cover) { cover.src = track.cover; cover.alt = `جلد ${track.title}`; }
    set('[data-detail-title]', track.title);
    set('[data-detail-artist]', track.artist);
    set('[data-detail-release]', track.release);
    set('[data-detail-duration]', formatTime(track.duration || state.audio.duration || 0));
    set('[data-detail-plays]', track.plays);
    const download = detail.querySelector('[data-detail-download]');
    if (download) download.href = track.src || '#';
    set('[data-detail-quality]', track.quality || 'MP3 320');
    const dpt = document.querySelector('[data-detail-player-title]');
    if (dpt) dpt.textContent = track.title;
    const dpa = document.querySelector('[data-detail-player-artist]');
    if (dpa) dpa.textContent = [track.artist, track.album].filter(Boolean).join(' · ');
    const feat = detail.querySelector('[data-detail-feat]');
    if (feat) { feat.textContent = track.feat || ''; feat.hidden = !track.feat; }

    const albumName = detail.querySelector('[data-detail-album]');
    if (albumName) albumName.textContent = track.album ? `آلبوم · ${track.album}` : 'سینگل';
    document.title = `${track.title} — ${track.artist || 'کنار'}`;
    updateAlbumSelection(track);
  }

  function updateDetailFromTrack(source, autoplay) {
    const track = source?.dataset ? readTrack(source) : source;
    if (!track?.title) return;
    if (document.querySelector('.detail-hero')) {
      state.track = track;
      const matching = state.tracks.findIndex(t => sameTrack(t, track));
      state.index = matching;
      syncDetailMeta(track);
      localStorage.setItem('konar_open_detail_v13', track.id);
      const lyrics = document.querySelector('[data-tab-panel="lyrics"] .lyrics-block');
      if (lyrics && track.lyrics) renderLyrics(lyrics, track.lyrics);
    }
    if (autoplay) playSource(source, true);
  }

  function renderLyrics(container, rawLyrics) {
    const text = String(rawLyrics || '').replace(/\r/g, '').trim();
    if (!text) {
      container.innerHTML = '<p class="lyrics-empty">متن آهنگ برای این ترک ثبت نشده است.</p>';
      return;
    }
    const lines = text.split('\n');
    container.innerHTML = '';
    let paragraph = null;
    const flush = () => {
      if (paragraph && paragraph.textContent.trim()) container.appendChild(paragraph);
      paragraph = null;
    };
    lines.forEach(line => {
      const value = line.trim();
      if (!value) { flush(); return; }
      if (!paragraph) {
        paragraph = document.createElement('p');
        paragraph.className = 'lyrics-paragraph';
      }
      const lineEl = document.createElement('span');
      lineEl.className = 'lyrics-line';
      lineEl.textContent = value;
      paragraph.appendChild(lineEl);
    });
    flush();
  }

  function setupLyricsCopy() {
    document.addEventListener('click', async e => {
      const button = e.target.closest('[data-copy-lyrics]');
      if (!button) return;
      const container = document.querySelector('[data-lyrics-view]');
      const lines = container ? [...container.querySelectorAll('.lyrics-line')].map(el => el.textContent.trim()).filter(Boolean) : [];
      if (!lines.length) { toast('متنی برای کپی وجود ندارد.', 'error'); return; }
      try {
        const payload = lines.join('\n');
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(payload);
        } else {
          const helper = document.createElement('textarea');
          helper.value = payload;
          helper.setAttribute('readonly', '');
          helper.style.position = 'fixed';
          helper.style.opacity = '0';
          document.body.appendChild(helper);
          helper.select();
          document.execCommand('copy');
          helper.remove();
        }
        const original = button.innerHTML;
        button.innerHTML = '✓ کپی شد';
        button.classList.add('is-copied');
        setTimeout(() => { button.innerHTML = original; button.classList.remove('is-copied'); }, 1400);
      } catch (_) {
        toast('کپی متن در این مرورگر در دسترس نیست.', 'error');
      }
    });
  }

  function updateAlbumSelection(activeTrack) {
    document.querySelectorAll('[data-tab-panel="album"] [data-track]').forEach(row => {
      const active = sameTrack(readTrack(row), activeTrack);
      row.classList.toggle('is-selected-detail', active);
      row.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  function syncVolumeUI() {
    const volume = state.audio?.muted ? 0 : (state.audio?.volume ?? state.volume);
    const btn = gp?.querySelector('[data-gp-mute]');
    if (btn) {
      btn.innerHTML = volume === 0 ? ICONS.mute : ICONS.volume;
      btn.setAttribute('aria-label', volume === 0 ? 'فعال کردن صدا' : 'بی‌صدا کردن');
    }
    const input = gp?.querySelector('[data-gp-volume]');
    if (input) { input.value = String(Math.round(volume * 100)); paintRange(input, volume * 100, '--gp-volume'); }
    document.querySelectorAll('[data-volume]').forEach(i => { i.value = String(Math.round(volume * 100)); paintRange(i, volume * 100, '--volume'); });
    document.querySelectorAll('[data-detail-action="mute"]').forEach(i => { i.innerHTML = volume === 0 ? ICONS.mute : ICONS.volume; });
  }

  function syncDetailFallback() {
    document.querySelectorAll('[data-now-play]').forEach(btn => btn.innerHTML = ICONS.play);
  }

  function animateWaveforms(percent, current) {
    cancelAnimationFrame(beatFrame);
    beatFrame = requestAnimationFrame(() => {
      document.querySelectorAll('[data-waveform]').forEach(wave => {
        ensureBars(wave);
        const bars = [...wave.querySelectorAll('span')];
        const total = bars.length || 1;

        // Every waveform is driven by the same real Audio element, but a row
        // waveform should only display progress when that row is the active track.
        const row = wave.closest('[data-track], .track-row');
        const rowTrack = row ? readTrack(row) : null;
        const isActiveRow = !!(rowTrack && state.track && sameTrack(rowTrack, state.track));
        const localPercent = row ? (isActiveRow ? percent : 0) : percent;
        const localLive = row ? (isActiveRow && state.playing) : state.playing;

        const head = Math.max(0, Math.min(total - 1, Math.floor((localPercent / 100) * total)));
        const pulseWindow = Math.max(1, Math.floor(total / 42));
        wave.style.setProperty('--wave-progress', `${localPercent}%`);
        wave.style.setProperty('--wave-head', `${localPercent}%`);
        wave.classList.toggle('is-live', localLive);
        wave.classList.toggle('has-progress', !!state.track && (!row || isActiveRow));
        const playhead = wave.querySelector('.wave-playhead');
        if (playhead) {
          playhead.style.left = `${Math.max(0, Math.min(100, localPercent))}%`;
          playhead.classList.toggle('is-live', localLive);
        }
        bars.forEach((bar, i) => {
          const played = i / Math.max(1, total - 1) * 100 <= localPercent;
          bar.classList.toggle('is-played', played);
          bar.classList.toggle('is-head', localLive && Math.abs(i - head) <= pulseWindow);
          bar.style.setProperty('--bar-index', String(i));
        });
      });
    });
  }

  function ensureBars(wave) {
    if (!wave.children.length) {
      const count = Math.max(12, Number(wave.dataset.bars || 48));
      let seed = Number([...String(wave.dataset.seed || 'nava')].reduce((a, c) => a + c.charCodeAt(0), 0));
      for (let i = 0; i < count; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        const ratio = .22 + (seed / 233280) * .78;
        const span = document.createElement('span');
        span.style.setProperty('--bar-size', `${Math.round(ratio * 100)}%`);
        wave.appendChild(span);
      }
    }

    if (wave.dataset.seekBound) return;
    wave.dataset.seekBound = 'true';

    let dragging = false;
    let pendingSeekPercent = null;
    let pendingAutoplay = false;

    const getRow = () => wave.closest('[data-track], .track-row');

    const getPercentFromClientX = clientX => {
      const rect = wave.getBoundingClientRect();
      if (!rect.width) return null;
      return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    };

    const applySeek = percent => {
      if (percent == null || !state.audio) return;
      const duration = Number.isFinite(state.audio.duration) && state.audio.duration > 0
        ? state.audio.duration
        : Number(state.track?.duration || 0);
      if (!duration) return;
      state.audio.currentTime = duration * percent / 100;
      syncAll();
    };

    const seekAtClientX = clientX => {
      const percent = getPercentFromClientX(clientX);
      if (percent == null) return;

      const row = getRow();
      if (row) {
        const rowTrack = readTrack(row);
        const active = state.track && sameTrack(state.track, rowTrack);
        const wasPlaying = state.playing && !state.audio.paused;

        if (!active) {
          pendingSeekPercent = percent;
          pendingAutoplay = wasPlaying;
          playSource(row, false, { seekPercent: percent, preservePlayback: wasPlaying });
          return;
        }
      }

      applySeek(percent);
    };

    const move = e => {
      if (!dragging) return;
      e.preventDefault();
      seekAtClientX(e.clientX);
    };

    const stop = e => {
      if (!dragging) return;
      dragging = false;
      if (wave.releasePointerCapture && e.pointerId != null) {
        try { wave.releasePointerCapture(e.pointerId); } catch (_) {}
      }
      wave.classList.remove('is-seeking');
    };

    wave.addEventListener('pointerdown', e => {
      e.preventDefault();
      dragging = true;
      wave.classList.add('is-seeking');
      if (wave.setPointerCapture && e.pointerId != null) {
        try { wave.setPointerCapture(e.pointerId); } catch (_) {}
      }
      seekAtClientX(e.clientX);
    });
    wave.addEventListener('pointermove', move);
    wave.addEventListener('pointerup', stop);
    wave.addEventListener('pointercancel', stop);
    wave.addEventListener('lostpointercapture', () => {
      dragging = false;
      wave.classList.remove('is-seeking');
    });

    // Expose pending seek state to the shared engine. This makes row-waveform
    // seeking reliable even before the new audio file finishes loading metadata.
    wave._getPendingSeek = () => ({ percent: pendingSeekPercent, autoplay: pendingAutoplay });
  }

  function paintRange(input, percent, cssVar) {
    const safe = Math.max(0, Math.min(100, Number(percent) || 0));
    const value = `${safe}%`;
    input.style.setProperty('--range-progress', value);
    input.style.setProperty('--player-progress', value);
    if (cssVar) input.style.setProperty(cssVar, value);
    const shell = input.closest('.detail-wave-shell');
    if (shell) {
      shell.style.setProperty('--range-progress', value);
      if (cssVar) shell.style.setProperty(cssVar, value);
    }
  }

  function bindKeyboard() {
    document.addEventListener('keydown', e => {
      const tag = document.activeElement?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || document.activeElement?.isContentEditable) return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); seekBy(document.documentElement.dir === 'rtl' ? 10 : -10); }
      if (e.key === 'ArrowRight') { e.preventDefault(); seekBy(document.documentElement.dir === 'rtl' ? -10 : 10); }
      if (e.key.toLowerCase() === 'm') { e.preventDefault(); toggleMute(); }
    });
  }

  function restoreSettings() {
    try {
      const value = JSON.parse(localStorage.getItem(SETTINGS) || '{}');
      state.shuffle = Boolean(value.shuffle);
      state.repeat = ['none', 'all', 'one'].includes(value.repeat) ? value.repeat : 'none';
    } catch (_) {}
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS, JSON.stringify({ shuffle: state.shuffle, repeat: state.repeat }));
  }

  function saveState() {
    if (!state.track) return;
    localStorage.setItem(STORE, JSON.stringify({
      id: state.track.id,
      title: state.track.title,
      artist: state.track.artist,
      album: state.track.album,
      cover: state.track.cover,
      src: state.track.src,
      duration: state.track.duration,
      currentTime: state.audio.currentTime || 0,
      wasPlaying: state.playing
    }));
  }

  function saveStateDebounced() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 250);
  }

  function restoreState() {
    let saved;
    try { saved = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (_) { saved = null; }
    if (!saved?.src) return;
    const match = state.tracks.find(t => t.id === saved.id || t.src === saved.src || (t.title === saved.title && t.artist === saved.artist));
    const restored = match || { ...saved, _node: null, _order: -1 };
    state.track = restored;
    state.index = match ? match._order : -1;
    state.audio.addEventListener('loadedmetadata', () => {
      state.audio.currentTime = Math.min(Number(saved.currentTime) || 0, Math.max(0, (state.audio.duration || 1) - .1));
      state.playing = false;
      syncAll();
    }, { once: true });
    state.audio.src = restored.src;
    gp.hidden = false;
  }

  function updateMediaSession() {
    if (!('mediaSession' in navigator) || !state.track) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: state.track.title,
        artist: state.track.artist || '',
        album: state.track.album || 'کنار',
        artwork: [{ src: new URL(state.track.cover, document.baseURI).href, sizes: '512x512', type: 'image/svg+xml' }]
      });
      navigator.mediaSession.setActionHandler('play', () => state.audio.play());
      navigator.mediaSession.setActionHandler('pause', () => state.audio.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => changeTrack(-1));
      navigator.mediaSession.setActionHandler('nexttrack', () => changeTrack(1));
      navigator.mediaSession.setActionHandler('seekbackward', () => seekBy(-10));
      navigator.mediaSession.setActionHandler('seekforward', () => seekBy(10));
    } catch (_) {}
  }

  function updateMediaSessionPosition(duration, current) {
    if (!('mediaSession' in navigator) || !duration || !state.track) return;
    try { navigator.mediaSession.setPositionState({ duration, playbackRate: state.audio.playbackRate || 1, position: Math.min(current, duration) }); } catch (_) {}
  }

  function sameTrack(a, b) { return trackKey(a) === trackKey(b); }
  function trackKey(track) { return `${track?.id || ''}|${track?.src || ''}|${track?.title || ''}|${track?.artist || ''}`; }
  function cssUrl(v) { return String(v).replace(/(["\\])/g, '\\$1'); }
  function formatTime(seconds) {
    const n = Number(seconds);
    if (!Number.isFinite(n)) return '۰:۰۰';
    const s = Math.max(0, Math.floor(n));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`.replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  }
  function escapeHtml(text) { return String(text).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[c])); }
  function toast(message, type = 'info') {
    let el = document.querySelector('.konar-toast');
    if (!el) { el = document.createElement('div'); el.className = 'konar-toast'; document.body.appendChild(el); }
    el.className = `konar-toast is-${type}`;
    el.textContent = message;
    requestAnimationFrame(() => el.classList.add('is-visible'));
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('is-visible'), 3200);
  }
})();