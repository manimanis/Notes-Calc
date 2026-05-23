'use strict';

function isStandaloneDisplay() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || window.navigator.standalone === true;
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isAndroid() {
  return /android/i.test(window.navigator.userAgent);
}

function showIosInstallHint() {
  if (!isIos() || isStandaloneDisplay()
    || sessionStorage.getItem('pwa-hint-dismissed') === '1') {
    return;
  }
  const banner = document.createElement('div');
  banner.className = 'pwa-install-hint';
  banner.setAttribute('role', 'status');
  banner.innerHTML = [
    '<p><strong>Mode plein écran sur iPhone</strong></p>',
    '<p>Dans Safari : bouton <strong>Partager</strong> → <strong>Sur l\'écran d\'accueil</strong>, puis ouvrez l\'app depuis l\'icône (pas depuis Safari).</p>',
    '<button type="button">Compris</button>',
  ].join('');
  document.body.appendChild(banner);
  const closeBtn = banner.querySelector('button');
  closeBtn.addEventListener('click', () => {
    sessionStorage.setItem('pwa-hint-dismissed', '1');
    banner.remove();
  });
}

function lockAppViewportHeight() {
  const setHeight = () => {
    document.documentElement.style.setProperty(
      '--app-height',
      `${window.innerHeight}px`,
    );
  };
  setHeight();
  window.addEventListener('resize', setHeight);
  window.addEventListener('orientationchange', setHeight);
}

document.documentElement.classList.toggle('is-standalone', isStandaloneDisplay());

showIosInstallHint();
lockAppViewportHeight();
