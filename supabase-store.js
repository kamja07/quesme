/* QuesMe — QueueStore backed by Supabase (Postgres + Realtime).
 * Same public API as the localStorage version, so the surfaces are unchanged.
 * Tables: quesme_stores, quesme_entries, quesme_reservations (namespaced; standalone).
 */
(function (global) {
  'use strict';
  var CFG = global.QUESME_CONFIG || {};
  var SAMPLE = ['골프왕','쏨차이','민수','Nok','쑤다','단골손님','Por','사장님','나린','Aof','태국댁','말리','Beam','현주','Ploy'];
  var LANGS = ['ko','th','en','zh','ja','hi','ru'];

  function nowTs(){ return Date.now(); }
  function uuid(){ return (global.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'x'+Math.random().toString(36).slice(2)+Date.now().toString(36); }
  function parseTs(s){ return s ? Date.parse(s) : 0; }

  function mapEntry(r){
    return { id:r.id, qno:r.qno, cno:r.cno, nick:r.nick, size:r.party_size, lang:r.lang,
      status:r.status, priority:!!r.priority, passes:r.passes||0, reserved:!!r.reserved,
      sort_at:Number(r.sort_at)||0, joinedAt:parseTs(r.created_at)||nowTs(),
      called_at:r.called_at, done_at:r.done_at };
  }
  function sortWaiting(arr){
    arr.sort(function(a,b){ return (b.priority-a.priority) || ((b.reserved?1:0)-(a.reserved?1:0)) || (a.sort_at-b.sort_at); });
  }

  function QueueStore(slug){
    this.slug = slug || 'gangnam';
    this.listeners = [];
    this.state = { store:{ slug:this.slug, names:{}, tagline:'' }, logo:null, waiting:[], serving:null, recent:[], served:0, reservations:[] };
    this.rows = { entries:[], reservations:[], store:null };
    this._refTimer = null;
    this.client = global.supabase.createClient(CFG.url, CFG.anonKey, { realtime:{ params:{ eventsPerSecond:10 } } });
    this._init();
  }

  QueueStore.prototype._init = function(){
    var self = this;
    this._fetchAll();
    var ch = this.client.channel('quesme-' + this.slug);
    ['quesme_entries','quesme_reservations','quesme_stores'].forEach(function(tbl){
      ch.on('postgres_changes', { event:'*', schema:'public', table:tbl }, function(){ self._fetchSoon(); });
    });
    ch.subscribe();
    this.channel = ch;
  };

  QueueStore.prototype._fetchSoon = function(){ var self=this; if(this._refTimer) return; this._refTimer = setTimeout(function(){ self._refTimer=null; self._fetchAll(); }, 120); };

  QueueStore.prototype._fetchAll = function(){
    var self = this, slug = this.slug;
    Promise.all([
      this.client.from('quesme_entries').select('*').eq('store_slug', slug).neq('status','cancelled').neq('status','done').limit(500),
      this.client.from('quesme_entries').select('nick,cno,party_size,lang,done_at').eq('store_slug', slug).eq('status','done').order('done_at',{ascending:false}).limit(5),
      this.client.from('quesme_reservations').select('*').eq('store_slug', slug),
      this.client.from('quesme_stores').select('*').eq('slug', slug).maybeSingle(),
      this.client.from('quesme_entries').select('id', { count:'exact', head:true }).eq('store_slug', slug).eq('status','done')
    ]).then(function(res){
      var active = (res[0].data)||[], done = (res[1].data)||[], resv = (res[2].data)||[], store = (res[3].data)||null, servedCount = (res[4] && res[4].count)||0;
      self._rebuild(active, done, resv, store, servedCount);
    }).catch(function(e){ /* keep last state */ });
  };

  QueueStore.prototype._rebuild = function(active, done, resv, store, servedCount){
    var st = this.state;
    var entries = active.map(mapEntry);
    st.waiting = entries.filter(function(e){ return e.status==='waiting'; });
    sortWaiting(st.waiting);
    var called = entries.filter(function(e){ return e.status==='called'; });
    called.sort(function(a,b){ return parseTs(b.called_at)-parseTs(a.called_at); });
    st.serving = called.length ? called[0] : null;
    st.recent = (done||[]).map(function(r){ return { nick:r.nick, cno:r.cno, size:r.party_size, lang:r.lang, at:parseTs(r.done_at) }; });
    st.served = servedCount || 0;
    st.reservations = (resv||[]).map(function(r){ return { id:r.id, nick:r.nick, size:r.party_size, time:r.time, num:r.num, cno:r.cno, lang:r.lang }; })
      .sort(function(a,b){ return (a.time||'').localeCompare(b.time||''); });
    if(store){ st.store = { slug:store.slug, names:store.names||{}, tagline:store.tagline||'' }; st.logo = store.logo||null; }
    this._emit();
  };

  QueueStore.prototype.subscribe = function(cb){ this.listeners.push(cb); cb(this.state); var self=this; return function(){ self.listeners = self.listeners.filter(function(f){return f!==cb;}); }; };
  QueueStore.prototype.getState = function(){ return this.state; };
  QueueStore.prototype._emit = function(){ for(var i=0;i<this.listeners.length;i++){ try{ this.listeners[i](this.state); }catch(e){} } };

  /* helpers from local cache */
  QueueStore.prototype._activeCnos = function(){ var s={},i; for(i=0;i<this.state.waiting.length;i++) s[this.state.waiting[i].cno]=1; if(this.state.serving) s[this.state.serving.cno]=1; for(i=0;i<this.state.reservations.length;i++) s[this.state.reservations[i].cno]=1; return s; };
  QueueStore.prototype._genCno = function(){ var used=this._activeCnos(), c, g=0; do{ c=100+Math.floor(Math.random()*900); g++; }while(used[c] && g<3000); return c; };
  QueueStore.prototype._nextQno = function(){ var m=0; this.state.waiting.concat(this.state.serving?[this.state.serving]:[]).forEach(function(e){ if(e.qno>m)m=e.qno; }); return m+1; };
  QueueStore.prototype._minSort = function(){ var m=Infinity; this.state.waiting.forEach(function(e){ if(e.sort_at<m)m=e.sort_at; }); return m===Infinity?nowTs():m; };

  /* ---- customer ---- */
  QueueStore.prototype.joinQueue = function(o){
    var id = uuid(), cno=this._genCno();
    var row = { id:id, store_slug:this.slug, qno:this._nextQno(), cno:cno, nick:o.nick||'-', party_size:o.size||1, lang:o.lang||'en', status:'waiting', priority:false, passes:0, reserved:false, sort_at:nowTs() };
    // optimistic
    this.state.waiting.push(mapEntry(Object.assign({created_at:new Date(nowTs()).toISOString()}, row))); sortWaiting(this.state.waiting); this._emit();
    this.client.from('quesme_entries').insert(row).then(this._after(this)).catch(this._after(this));
    return id;
  };
  QueueStore.prototype.reserve = function(o){
    var id = uuid(), cno=this._genCno();
    var rn = 'R-' + String((this.state.reservations.length+1)).padStart(2,'0');
    var row = { id:id, store_slug:this.slug, nick:o.nick||'-', party_size:o.size||1, lang:o.lang||'en', cno:cno, time:o.time, num:rn };
    this.state.reservations.push({ id:id, nick:row.nick, size:row.party_size, time:row.time, num:rn, cno:cno, lang:row.lang }); this._emit();
    this.client.from('quesme_reservations').insert(row).then(this._after(this)).catch(this._after(this));
    return id;
  };
  QueueStore.prototype.checkIn = function(resId){
    var r = this.state.reservations.find(function(x){ return x.id===resId; }); if(!r) return null;
    var id = uuid();
    var row = { id:id, store_slug:this.slug, qno:this._nextQno(), cno:r.cno||this._genCno(), nick:r.nick, party_size:r.size, lang:r.lang||'en', status:'waiting', priority:false, passes:0, reserved:true, sort_at:nowTs() };
    this.client.from('quesme_reservations').delete().eq('id', resId).then(this._after(this));
    this.client.from('quesme_entries').insert(row).then(this._after(this)).catch(this._after(this));
    return id;
  };
  QueueStore.prototype.buyPriority = function(id){ this._update(id, { priority:true, sort_at:this._minSort()-1e9 }); };
  QueueStore.prototype.passTurn = function(id){
    var w=this.state.waiting; var i=w.findIndex(function(e){return e.id===id;});
    if(i!==0 || w.length<2) return;
    var after = w[2] ? (w[1].sort_at+w[2].sort_at)/2 : w[1].sort_at+1;
    this._update(id, { sort_at:after, passes:(w[0].passes||0)+1 });
  };
  QueueStore.prototype.yieldServing = function(id, n){
    var st=this.state; if(!st.serving || st.serving.id!==id) return; var w=st.waiting; if(!w.length) return;
    n = Math.max(1, Math.min(n||1, w.length));
    var anchorPrev = w[n-1];                                  // me lands right after this
    var anchorNext = w[n];                                    // ... and before this
    var meSort = anchorNext ? (anchorPrev.sort_at+anchorNext.sort_at)/2 : anchorPrev.sort_at+1;
    // 양보: 내 순번만 n칸 뒤로 (대기로 복귀). 다음 호출은 직원이 함.
    this._update(st.serving.id, { status:'waiting', sort_at:meSort, passes:(st.serving.passes||0)+n });
  };
  QueueStore.prototype.cancel = function(id){ this._update(id, { status:'cancelled' }); };
  QueueStore.prototype.cancelReservation = function(id){
    this.state.reservations = this.state.reservations.filter(function(x){ return x.id!==id; }); this._emit();
    this.client.from('quesme_reservations').delete().eq('id', id).then(this._after(this));
  };

  /* ---- staff ---- */
  QueueStore.prototype.callNext = function(){
    var st=this.state;
    if(st.serving) this._update(st.serving.id, { status:'done', done_at:new Date(nowTs()).toISOString() });
    if(st.waiting.length) this._update(st.waiting[0].id, { status:'called', called_at:new Date(nowTs()).toISOString() });
  };
  QueueStore.prototype.setLogo = function(dataUrl){
    this.state.logo = dataUrl||null; this._emit();
    this.client.from('quesme_stores').upsert({ slug:this.slug, logo:dataUrl||null, updated_at:new Date(nowTs()).toISOString() }, { onConflict:'slug' }).then(this._after(this));
  };
  QueueStore.prototype.setStoreName = function(lang, val){
    if(!this.state.store.names) this.state.store.names={};
    this.state.store.names[lang] = (val||'').trim(); this._emit();
    var names = this.state.store.names;
    this.client.from('quesme_stores').upsert({ slug:this.slug, names:names, updated_at:new Date(nowTs()).toISOString() }, { onConflict:'slug' }).then(this._after(this));
  };

  /* ---- helpers ---- */
  QueueStore.prototype.addSampleGuest = function(){
    var sizes=[1,2,2,3,4,4,5,6,8], size=sizes[Math.floor(Math.random()*sizes.length)];
    this.joinQueue({ nick:SAMPLE[Math.floor(Math.random()*SAMPLE.length)], size:size, lang:LANGS[Math.floor(Math.random()*LANGS.length)] });
  };
  QueueStore.prototype.reset = function(){
    var self=this;
    this.client.from('quesme_entries').delete().eq('store_slug', this.slug).then(function(){ self._fetchAll(); });
    this.client.from('quesme_reservations').delete().eq('store_slug', this.slug).then(this._after(this));
  };

  QueueStore.prototype._update = function(id, patch){ this.client.from('quesme_entries').update(patch).eq('id', id).then(this._after(this)).catch(this._after(this)); };
  QueueStore.prototype._after = function(self){ return function(){ self._fetchSoon(); }; };

  /* ---- staff auth ---- */
  QueueStore.prototype.signIn = function(email, password){ return this.client.auth.signInWithPassword({ email:email, password:password }); };
  QueueStore.prototype.signOut = function(){ return this.client.auth.signOut(); };
  QueueStore.prototype.onAuth = function(cb){
    var self = this;
    this.client.auth.getSession().then(function(r){ cb((r.data && r.data.session) || null); });
    this.client.auth.onAuthStateChange(function(_e, session){ cb(session || null); });
  };

  global.QueueStore = QueueStore;
})(window);
