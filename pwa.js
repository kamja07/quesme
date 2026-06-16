/* QuesMe — PWA 설치 유도. 설치 가능하면 하단 배너 표시.
 * Android/Chrome: beforeinstallprompt → 바로 설치. iOS Safari: '홈 화면에 추가' 안내.
 * 이미 설치(standalone) / 인앱 브라우저(LINE·카톡)에서는 표시 안 함. */
(function () {
  'use strict';
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                   window.navigator.standalone === true;
  if (standalone) return;                                  // 이미 설치되어 실행 중

  var ua = navigator.userAgent || '', L = ua.toLowerCase();
  var isInApp = L.indexOf('kakaotalk') >= 0 || /\bline\//i.test(ua) ||
                /fban|fbav|fb_iab|instagram|naver|inapp/i.test(L);
  if (isInApp) return;                                     // 인앱 브라우저는 설치 불가 → inapp.js가 외부로 보냄

  var isIOS = /iphone|ipad|ipod/i.test(ua);
  var deferred = null, shown = false;

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; showPill(); });
  window.addEventListener('appinstalled', function () { hidePill(); deferred = null; });

  // iOS는 beforeinstallprompt가 없음 → 사파리에서만 안내 배너(크롬iOS/카톡 등 제외)
  if (isIOS && /safari/.test(L) && !/crios|fxios|edgios/.test(L)) ready(showPill);

  function ready(fn) { if (document.body) fn(); else document.addEventListener('DOMContentLoaded', fn); }
  function dismissed() { try { return localStorage.getItem('quesme:noinstall') === '1'; } catch (e) { return false; } }

  function showPill() {
    ready(function () {
      if (shown || dismissed() || document.getElementById('qm-pill')) return;
      shown = true;
      var bar = document.createElement('div');
      bar.id = 'qm-pill';
      bar.setAttribute('style',
        'position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:90000;' +
        'max-width:520px;margin:0 auto;background:#16323A;color:#fff;border-radius:14px;padding:12px 12px 12px 16px;' +
        'display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,.25);' +
        'font-family:system-ui,-apple-system,"Malgun Gothic",sans-serif;');
      bar.innerHTML =
        '<div style="font-size:24px;">📲</div>' +
        '<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:800;">앱으로 설치하기</div>' +
          '<div style="font-size:12px;opacity:.82;">홈 화면에 추가하면 다음엔 한 번에 · Add to Home</div></div>' +
        '<button id="qm-go" style="flex:0 0 auto;background:#0E7A5F;color:#fff;border:none;border-radius:10px;' +
          'padding:10px 14px;font-size:13px;font-weight:800;font-family:inherit;">설치</button>' +
        '<button id="qm-x" aria-label="닫기" style="flex:0 0 auto;background:transparent;color:#fff;border:none;' +
          'font-size:20px;opacity:.6;padding:4px 6px;font-family:inherit;">×</button>';
      document.body.appendChild(bar);
      document.getElementById('qm-go').onclick = install;
      document.getElementById('qm-x').onclick = function () { hidePill(); try { localStorage.setItem('quesme:noinstall', '1'); } catch (e) {} };
    });
  }
  function hidePill() { var b = document.getElementById('qm-pill'); if (b) b.remove(); shown = false; }

  function install() {
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; hidePill(); });
    } else if (isIOS) {
      iosSheet();
    }
  }
  window.qmInstall = install;                              // 페이지 버튼에서도 호출 가능

  function iosSheet() {
    if (document.getElementById('qm-ios')) return;
    var d = document.createElement('div'); d.id = 'qm-ios';
    d.setAttribute('style', 'position:fixed;inset:0;z-index:95000;background:rgba(8,18,22,.78);' +
      'display:flex;align-items:flex-end;justify-content:center;font-family:system-ui,-apple-system,sans-serif;');
    d.innerHTML = '<div style="background:#fff;color:#16323A;border-radius:18px 18px 0 0;max-width:520px;width:100%;' +
      'padding:22px 22px calc(26px + env(safe-area-inset-bottom));text-align:center;">' +
      '<div style="font-size:34px;">📲</div>' +
      '<div style="font-size:17px;font-weight:800;margin:6px 0 4px;">홈 화면에 추가</div>' +
      '<div style="font-size:14px;color:#6b7a7f;line-height:1.7;">사파리 아래 <b>공유 ⬆️</b> 버튼을 누르고 →<br>' +
      '<b>"홈 화면에 추가"</b>를 선택하세요</div>' +
      '<button id="qm-iosx" style="margin-top:18px;background:#0E7A5F;color:#fff;border:none;border-radius:12px;' +
      'padding:13px 22px;font-size:15px;font-weight:800;width:100%;font-family:inherit;">알겠어요</button></div>';
    document.body.appendChild(d);
    document.getElementById('qm-iosx').onclick = function () { d.remove(); };
    d.onclick = function (e) { if (e.target === d) d.remove(); };
  }
})();
