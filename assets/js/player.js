/* ==========================================================================
   کنار | Konar — player.js
   شبیه‌سازی رفتار پخش‌کننده (Play/Pause، پیشرفت، صدا)
   نکته برای بک‌اند: در پروژه‌ی جنگو، src واقعی فایل صوتی را از
   {{ track.audio_file.url }} در data-src قرار دهید و بخش شبیه‌سازی‌شده‌ی
   زیر را با ontimeupdate واقعیِ تگ <audio> جایگزین کنید.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-player]').forEach(initPlayer);
});

function initPlayer(playerEl) {
  const playBtn = playerEl.querySelector('[data-play]');
  const waveform = playerEl.querySelector('[data-waveform]');
  const currentTimeEl = playerEl.querySelector('[data-current-time]');
  const durationEl = playerEl.querySelector('[data-duration]');
  const volumeInput = playerEl.querySelector('[data-volume]');

  const durationSeconds = parseInt(playerEl.dataset.durationSeconds || '210', 10);
  let currentSeconds = 0;
  let isPlaying = false;
  let timer = null;

  if (durationEl) durationEl.textContent = formatTime(durationSeconds);

  function tick() {
    currentSeconds += 1;
    if (currentSeconds >= durationSeconds) {
      currentSeconds = durationSeconds;
      setPlaying(false);
    }
    updateUI();
  }

  function setPlaying(state) {
    isPlaying = state;
    if (playBtn) playBtn.innerHTML = isPlaying ? iconPause() : iconPlay();
    if (waveform) waveform.classList.toggle('is-live', isPlaying);

    if (isPlaying) {
      timer = setInterval(tick, 1000);
    } else {
      clearInterval(timer);
    }
  }

  function updateUI() {
    if (currentTimeEl) currentTimeEl.textContent = formatTime(currentSeconds);
    if (waveform) {
      const percent = (currentSeconds / durationSeconds) * 100;
      const bars = waveform.querySelectorAll('span');
      bars.forEach((bar, i) => {
        const barPercent = (i / bars.length) * 100;
        bar.classList.toggle('is-played', barPercent < percent);
      });
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => setPlaying(!isPlaying));
  }

  if (waveform) {
    waveform.style.cursor = 'pointer';
    waveform.addEventListener('click', (e) => {
      const rect = waveform.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = clickX / rect.width;
      /* راست‌به‌چپ بودن صفحه را در نظر می‌گیریم */
      const isRTL = getComputedStyle(document.documentElement).direction === 'rtl';
      const percent = isRTL ? 1 - ratio : ratio;
      currentSeconds = Math.round(durationSeconds * percent);
      updateUI();
    });
  }

  if (volumeInput) {
    volumeInput.addEventListener('input', () => {
      /* در نسخه‌ی واقعی: audioTag.volume = volumeInput.value / 100 */
    });
  }

  updateUI();
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function iconPlay() {
  return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg>';
}
function iconPause() {
  return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7V5zm6 0h4v14h-4V5z"/></svg>';
}
