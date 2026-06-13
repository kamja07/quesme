/* QuesMe — 인앱 브라우저(LINE/KakaoTalk/FB/IG 등) 감지 → 외부 브라우저(크롬·사파리)로 유도.
 * head에서 가장 먼저 로드해 렌더 전에 동작하게 한다. 일반 브라우저에서는 즉시 return. */
(function () {
  'use strict';
  var ua = navigator.userAgent || '';
  var L = ua.toLowerCase();

  var isKakao = L.indexOf('kakaotalk') >= 0;
  var isLine  = /\bline\//i.test(ua);                      // "online/" 등 오탐 방지(단어 경계)
  var isOther = /fban|fbav|fb_iab|instagram|naver|snapchat|musical_ly|tiktok|\bband\b|daumapps|trill|whale\/|inapp/i.test(L);
  if (!(isKakao || isLine || isOther)) return;             // 일반 크롬/사파리 → 아무것도 안 함

  var url = location.href;
  var isAndroid = /android/i.test(ua);
  var isIOS = /iphone|ipad|ipod/i.test(ua);

  // 카카오톡: 외부 브라우저 강제 오픈(안드로이드·iOS 모두 지원)
  if (isKakao) {
    location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(url);
    setTimeout(showGuide, 1400);                           // 실패 시 안내
    return;
  }

  // LINE: openExternalBrowser=1 파라미터를 붙이면 시스템 브라우저로 연다
  if (isLine) {
    if (url.indexOf('openExternalBrowser=1') < 0) {
      location.href = url + (url.indexOf('?') < 0 ? '?' : '&') + 'openExternalBrowser=1';
      return;
    }
    showGuide();                                           // 이미 시도했는데 여기면 수동 안내
    return;
  }

  // 그 외 인앱 브라우저(FB/IG/네이버 등): 안내 화면
  showGuide();

  function openChromeAndroid() {
    var noScheme = url.replace(/^https?:\/\//, '');
    location.href = 'intent://' + noScheme + '#Intent;scheme=https;package=com.android.chrome;end';
  }

  function showGuide() {
    if (document.getElementById('inapp-guide')) return;
    var d = document.createElement('div');
    d.id = 'inapp-guide';
    d.setAttribute('style',
      'position:fixed;inset:0;z-index:99999;background:#0c1a1f;color:#fff;display:flex;' +
      'flex-direction:column;align-items:center;justify-content:center;padding:30px 26px;text-align:center;' +
      'font-family:system-ui,-apple-system,"Malgun Gothic",sans-serif;');
    var btn = isAndroid
      ? '<button id="iaBtn" style="margin-top:24px;background:#0E7A5F;color:#fff;border:none;border-radius:14px;' +
        'padding:16px 28px;font-size:16px;font-weight:800;font-family:inherit;">크롬에서 열기 · Open in Chrome</button>'
      : '';
    var ios = isIOS
      ? '<div style="margin-top:20px;font-size:14px;line-height:1.75;opacity:.92;">' +
        '오른쪽 아래 <b>⋯</b> 또는 <b>↗</b> → <b>기본 브라우저로 열기</b><br>' +
        '<span style="opacity:.7">Tap ⋯ / ↗ then "Open in browser (Safari)"<br>' +
        'แตะ ⋯ แล้วเลือก "เปิดในเบราว์เซอร์"</span></div>'
      : '';
    d.innerHTML =
      '<div style="font-size:42px;">🌐</div>' +
      '<div style="font-size:19px;font-weight:800;margin-top:12px;">크롬·사파리에서 열어주세요</div>' +
      '<div style="font-size:14px;opacity:.85;margin-top:9px;line-height:1.65;">' +
        '인앱 브라우저(라인·카톡)에서는 화면이 어긋날 수 있어요.<br>' +
        '<span style="opacity:.7">Best viewed in Chrome / Safari · เปิดใน Chrome / Safari</span></div>' +
      btn + ios;
    (document.body || document.documentElement).appendChild(d);
    var b = document.getElementById('iaBtn');
    if (b) b.onclick = openChromeAndroid;
  }
})();
