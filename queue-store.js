/* QuesMe — QueueStore (data layer) · 단순 순번 모델
 * 고객은 테이블/룸을 고르지 않는다. 시간순 대기번호만 관리하고,
 * 직원이 "다음 손님 호출"로 순서대로 맞이한다. 자리 배정은 직원 재량(앱이 관여 안 함).
 * Multi-tenant by store slug. 백엔드 seam:
 *   NOW  : localStorage + BroadcastChannel (실제 탭/창 간 실시간, 서버 없음)
 *   LATER: 내부만 Supabase(Postgres+Realtime)로 교체 — 공개 API 동일.
 * Public API: new QueueStore(slug); .subscribe(cb)->unsub; .getState()
 *   .joinQueue({nick,size})->id ; .reserve({nick,size,time})->id ; .checkIn(resId)->qid ; .cancelReservation(id)
 *   .buyPriority(id) ; .passTurn(id) ; .cancel(id)
 *   .callNext() ; .setLogo(dataUrl) ; .addSampleGuest() ; .reset()
 */
(function (global) {
  'use strict';
  var SAMPLE = ['골프왕','쏨차이','민수','Nok','쑤다','단골손님','Por','사장님','나린','Aof','태국댁','말리','Beam','현주','Ploy'];
  function nowTs(){ return Date.now(); }
  function uid(p){ return (p||'id') + Math.random().toString(36).slice(2, 9) + nowTs().toString(36); }
  // 랜덤 고객번호(순번과 무관) — 현재 활성 엔트리와 겹치지 않게 100~999 중 발급
  function genCno(st){
    var used = {}, i;
    for (i = 0; i < st.waiting.length; i++) used[st.waiting[i].cno] = 1;
    if (st.serving) used[st.serving.cno] = 1;
    for (i = 0; i < st.reservations.length; i++) used[st.reservations[i].cno] = 1;
    var c, guard = 0;
    do { c = 100 + Math.floor(Math.random() * 900); guard++; } while (used[c] && guard < 3000);
    return c;
  }
  function sortWaiting(st){
    st.waiting.sort(function (a, b){ return (b.priority - a.priority) || ((b.reserved?1:0) - (a.reserved?1:0)) || (a.joinedAt - b.joinedAt); });
  }
  function mkParty(st, o, reserved){
    return { id: o.id || uid('q'), qno: st.qseq++, cno: o.cno || genCno(st), lang: o.lang || 'en', nick: o.nick || '손님', size: o.size || 1, joinedAt: nowTs(), priority: false, passes: 0, reserved: !!reserved, status: 'waiting' };
  }

  function QueueStore(slug){
    this.slug = slug || 'demo';
    this.key = 'quesme:' + this.slug;
    this.chan = 'quesme-rt:' + this.slug;
    this.listeners = [];
    this.state = this._load();
    if (!this.state){ this.state = this._seed(); this._persist(); }
    var self = this;
    try { this.bc = new BroadcastChannel(this.chan); this.bc.onmessage = function (){ self.state = self._load() || self.state; self._emit(); }; }
    catch (e){ this.bc = null; }
    global.addEventListener('storage', function (e){ if (e.key === self.key){ self.state = self._load() || self.state; self._emit(); } });
  }

  QueueStore.prototype._seed = function (){
    var st = {
      store: { names: { ko: '강남바베큐 라끄라방점', en: 'Gangnam BBQ Latkrabang', th: 'กังนัมบาร์บีคิว ลาดกระบัง', zh: '江南烤肉 拉甲邦店', ja: '江南バーベキュー ラートクラバン店', hi: 'गंगनाम बीबीक्यू लातक्राबांग', ru: 'Каннам Барбекю Латкрабанг' }, tagline: '한국식 BBQ 무한리필 · 11:00–22:00', slug: this.slug },
      waiting: [], serving: null, recent: [], served: 0, reservations: [], qseq: 1, rseq: 0, logo: null
    };
    var seedLangs = ['ko','th','en','zh','ja'];
    [2, 4, 2, 6, 3].forEach(function (sz, i){ st.waiting.push({ id: uid('s'), qno: st.qseq++, cno: genCno(st), lang: seedLangs[i], nick: SAMPLE[i], size: sz, joinedAt: nowTs() - (5 - i) * 45000, priority: false, passes: 0, reserved: false, status: 'waiting' }); });
    sortWaiting(st);
    return st;
  };
  QueueStore.prototype._load = function (){ try { var s = localStorage.getItem(this.key); return s ? JSON.parse(s) : null; } catch (e){ return null; } };
  QueueStore.prototype._persist = function (){ try { localStorage.setItem(this.key, JSON.stringify(this.state)); } catch (e){} };
  QueueStore.prototype._broadcast = function (){ try { if (this.bc) this.bc.postMessage(1); } catch (e){} };
  QueueStore.prototype._emit = function (){ for (var i = 0; i < this.listeners.length; i++){ try { this.listeners[i](this.state); } catch (e){} } };
  QueueStore.prototype.subscribe = function (cb){ this.listeners.push(cb); cb(this.state); var self = this; return function (){ self.listeners = self.listeners.filter(function (f){ return f !== cb; }); }; };
  QueueStore.prototype.getState = function (){ return this.state; };
  QueueStore.prototype._commit = function (fn){ var st = this._load() || this.state; fn(st); this.state = st; this._persist(); this._broadcast(); this._emit(); };

  /* ---- customer ---- */
  QueueStore.prototype.joinQueue = function (o){ var id = uid('q'); this._commit(function (st){ st.waiting.push(mkParty(st, { id: id, nick: o.nick, size: o.size, lang: o.lang }, false)); sortWaiting(st); }); return id; };
  QueueStore.prototype.reserve = function (o){ var id = uid('r'); this._commit(function (st){ st.reservations.push({ id: id, nick: o.nick || '손님', size: o.size, time: o.time, lang: o.lang || 'en', cno: genCno(st), num: 'R-' + String(st.rseq = (st.rseq||0) + 1).padStart(2,'0'), createdAt: nowTs() }); st.reservations.sort(function (a,b){ return a.time.localeCompare(b.time); }); }); return id; };
  QueueStore.prototype.checkIn = function (resId){ var qid = uid('q'); this._commit(function (st){ var r = st.reservations.find(function (x){ return x.id === resId; }); if (!r){ qid = null; return; } st.reservations = st.reservations.filter(function (x){ return x.id !== resId; }); st.waiting.push(mkParty(st, { id: qid, nick: r.nick, size: r.size, cno: r.cno, lang: r.lang }, true)); sortWaiting(st); }); return qid; };
  QueueStore.prototype.buyPriority = function (id){ this._commit(function (st){ var p = st.waiting.find(function (x){ return x.id === id; }); if (p){ p.priority = true; p.joinedAt = nowTs() - 9e9; sortWaiting(st); } }); };
  QueueStore.prototype.passTurn = function (id){ this._commit(function (st){ var i = st.waiting.findIndex(function (x){ return x.id === id; }); if (i === 0 && st.waiting.length > 1){ var p = st.waiting[0]; if (p.passes < 2){ p.passes++; p.joinedAt = st.waiting[1].joinedAt + 1; sortWaiting(st); } } }); };
  // 호출된 손님이 자기 순번에 뒷팀에게 n줄(1 또는 2) 양보 → 뒷팀이 먼저 호출되고 나는 n칸 뒤로
  QueueStore.prototype.yieldServing = function (id, n){ this._commit(function (st){
    if (!st.serving || st.serving.id !== id) return;
    if (st.waiting.length < 1) return;
    n = Math.max(1, Math.min(n || 1, st.waiting.length));
    var me = st.serving;
    var jumpers = st.waiting.splice(0, n);          // 앞으로 보낼 뒷팀들
    me.passes = (me.passes || 0) + n; me.status = 'waiting';
    var combined = jumpers.concat([me]).concat(st.waiting);
    st.serving = combined.shift();                  // 첫 뒷팀을 지금 호출
    st.serving.status = 'called';
    st.waiting = combined;
    var t0 = Date.now() - 9e8;                       // 양보로 정해진 순서를 고정
    st.serving.joinedAt = t0;
    for (var i = 0; i < st.waiting.length; i++) st.waiting[i].joinedAt = t0 + (i + 1);
  }); };
  QueueStore.prototype.cancel = function (id){ this._commit(function (st){ if (st.serving && st.serving.id === id) st.serving = null; else st.waiting = st.waiting.filter(function (x){ return x.id !== id; }); }); };
  QueueStore.prototype.cancelReservation = function (id){ this._commit(function (st){ st.reservations = st.reservations.filter(function (x){ return x.id !== id; }); }); };

  /* ---- store/staff ---- */
  QueueStore.prototype.callNext = function (){ this._commit(function (st){
    if (st.serving){ st.recent.unshift({ nick: st.serving.nick, cno: st.serving.cno, lang: st.serving.lang, size: st.serving.size, at: nowTs() }); st.recent = st.recent.slice(0, 5); st.served++; }
    st.serving = st.waiting.shift() || null;
    if (st.serving) st.serving.status = 'called';
  }); };
  QueueStore.prototype.setLogo = function (dataUrl){ this._commit(function (st){ st.logo = dataUrl || null; }); };
  QueueStore.prototype.setStoreName = function (lang, val){ this._commit(function (st){ if (!st.store.names) st.store.names = {}; st.store.names[lang] = (val || '').trim(); }); };

  /* ---- helpers ---- */
  QueueStore.prototype.addSampleGuest = function (){ this._commit(function (st){ var sizes = [1,2,2,3,4,4,5,6,8], langs = ['ko','th','en','zh','ja','hi','ru']; var size = sizes[Math.floor(Math.random()*sizes.length)]; st.waiting.push(mkParty(st, { nick: SAMPLE[Math.floor(Math.random()*SAMPLE.length)], size: size, lang: langs[Math.floor(Math.random()*langs.length)] }, false)); sortWaiting(st); }); };
  QueueStore.prototype.reset = function (){ this.state = this._seed(); this._persist(); this._broadcast(); this._emit(); };

  global.QueueStore = QueueStore;
})(window);
