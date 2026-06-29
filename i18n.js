/* QuesMe — i18n (ko / en / th / zh / ja / hi / ru)
 * t(lang,key) -> string ('{n}' 자리표시자는 호출부에서 치환)
 * storeName(state,lang) -> 언어별 매장 이름. 해당 언어 없으면 영어 → 태국어 → (한/중/일/힌디/러) 순 대체.
 */
(function (global) {
  'use strict';
  var LANGS = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'th', label: 'ไทย' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ru', label: 'Русский' }
  ];

  var S = {
    appTagline: { ko:'예약 순서대로 줄서기', en:'Join the queue in order', th:'เข้าคิวตามลำดับ', zh:'按顺序排队', ja:'順番どおりに並ぶ', hi:'क्रम से कतार में लगें', ru:'Очередь по порядку' },
    'join.now': { ko:'지금 줄서기', en:'Join now', th:'เข้าคิวเลย', zh:'立即排队', ja:'今すぐ並ぶ', hi:'अभी कतार में लगें', ru:'Встать в очередь' },
    'join.reserve': { ko:'시간 예약', en:'Reserve a time', th:'จองเวลา', zh:'预约时间', ja:'時間予約', hi:'समय आरक्षित करें', ru:'Забронировать время' },
    'field.party': { ko:'인원수', en:'Party size', th:'จำนวนคน', zh:'人数', ja:'人数', hi:'कितने लोग', ru:'Сколько человек' },
    'field.partyTel': { ko:'9명 이상 단체는 ☎ 096-868-0454 전화 예약', en:'Groups of 9+ please call ☎ 096-868-0454', th:'กลุ่ม 9 คนขึ้นไป โทร ☎ 096-868-0454', zh:'9人以上团体请致电 ☎ 096-868-0454', ja:'9名以上の団体は ☎ 096-868-0454 へ', hi:'9+ लोगों के समूह ☎ 096-868-0454 पर कॉल करें', ru:'Группы от 9 чел. — ☎ 096-868-0454' },
    'field.nick': { ko:'표시 닉네임 (전광판에 떠요)', en:'Display nickname (shown on the board)', th:'ชื่อที่แสดง (ขึ้นบนจอ)', zh:'显示昵称（会显示在屏幕上）', ja:'表示ニックネーム（掲示板に表示）', hi:'प्रदर्शन उपनाम (बोर्ड पर दिखेगा)', ru:'Имя на табло' },
    'field.resTime': { ko:'예약 시간', en:'Reservation time', th:'เวลาที่จอง', zh:'预约时间', ja:'予約時間', hi:'आरक्षण समय', ru:'Время брони' },
    'opt.today': { ko:'오늘', en:'Today', th:'วันนี้', zh:'今天', ja:'本日', hi:'आज', ru:'Сегодня' },
    'btn.join': { ko:'줄 서기', en:'Join the queue', th:'เข้าคิว', zh:'开始排队', ja:'列に並ぶ', hi:'कतार में लगें', ru:'Встать в очередь' },
    'btn.reserveDo': { ko:'이 시간으로 예약하기', en:'Reserve this time', th:'จองเวลานี้', zh:'预约此时间', ja:'この時間で予約する', hi:'यह समय आरक्षित करें', ru:'Забронировать это время' },
    'hint.join': { ko:'순서가 되면 알림 드릴게요 — 자리는 직원이 안내합니다.', en:"We'll notify you when it's your turn — staff will seat you.", th:'เราจะแจ้งเตือนเมื่อถึงคิวของคุณ — พนักงานจะพาไปที่โต๊ะ', zh:'轮到您时会通知您——由店员安排座位。', ja:'順番になりましたらお知らせします — お席はスタッフがご案内します。', hi:'आपकी बारी आने पर हम सूचित करेंगे — स्टाफ़ आपको बैठाएगा।', ru:'Мы уведомим вас, когда подойдёт очередь — персонал проводит к столу.' },
    'hint.reserve': { ko:'원하는 시간을 미리 잡아두세요. 도착해 체크인하면 순서대로 안내해 드려요.', en:"Book a time in advance. Check in when you arrive and we'll seat you in order.", th:'จองเวลาล่วงหน้า เช็คอินเมื่อมาถึง แล้วเราจะเรียกตามลำดับ', zh:'提前预约时间。到店签到后将按顺序为您安排。', ja:'ご希望の時間を予約してください。到着後チェックインすると順番にご案内します。', hi:'पहले से समय बुक करें। पहुँचने पर चेक-इन करें, हम क्रम से बुलाएँगे।', ru:'Забронируйте время заранее. По прибытии отметьтесь — пригласим по очереди.' },
    'install': { ko:'자주 오신다면 홈 화면에 추가해 앱처럼 쓰세요 — 다음엔 한 번에 진입·알림', en:'Frequent visitor? Add to Home Screen to use it like an app — faster entry & alerts next time.', th:'มาบ่อย? เพิ่มลงหน้าจอหลักเพื่อใช้เหมือนแอป — เข้าเร็วและรับการแจ้งเตือนครั้งหน้า', zh:'常来？添加到主屏幕像App一样使用——下次更快进入并接收提醒。', ja:'よく利用される方はホーム画面に追加してアプリのように — 次回はすぐ入場・通知', hi:'अक्सर आते हैं? होम स्क्रीन पर जोड़ें और ऐप जैसा उपयोग करें — अगली बार तेज़ प्रवेश व सूचना।', ru:'Часто заходите? Добавьте на главный экран — быстрый вход и уведомления.' },
    'res.done': { ko:'예약 완료', en:'Reserved', th:'จองแล้ว', zh:'已预约', ja:'予約完了', hi:'आरक्षित', ru:'Забронировано' },
    'lbl.myNick': { ko:'내 닉네임', en:'Your nickname', th:'ชื่อของคุณ', zh:'您的昵称', ja:'あなたのニックネーム', hi:'आपका उपनाम', ru:'Ваше имя' },
    'lbl.party': { ko:'일행 {n}명', en:'Party of {n}', th:'{n} คน', zh:'{n} 人', ja:'{n}名', hi:'{n} लोग', ru:'{n} чел.' },
    'res.num': { ko:'예약번호', en:'Reservation no.', th:'หมายเลขจอง', zh:'预约号', ja:'予約番号', hi:'आरक्षण नं.', ru:'№ брони' },
    'res.notify': { ko:'예약 시간 10분 전에 알림을 보내드려요', en:"We'll remind you 10 minutes before your time", th:'เราจะเตือน 10 นาทีก่อนเวลาจอง', zh:'我们将在预约前10分钟提醒您', ja:'予約時間の10分前にお知らせします', hi:'हम आपके समय से 10 मिनट पहले याद दिलाएँगे', ru:'Напомним за 10 минут до вашего времени' },
    'res.checkin': { ko:'지금 도착 — 체크인하고 줄 서기', en:"I've arrived — check in & join", th:'มาถึงแล้ว — เช็คอินและเข้าคิว', zh:'我已到店——签到并排队', ja:'到着しました — チェックインして並ぶ', hi:'मैं पहुँच गया — चेक-इन कर कतार में लगें', ru:'Я пришёл — отметиться и в очередь' },
    'res.cancel': { ko:'예약 취소', en:'Cancel reservation', th:'ยกเลิกการจอง', zh:'取消预约', ja:'予約をキャンセル', hi:'आरक्षण रद्द करें', ru:'Отменить бронь' },
    'call.enter': { ko:'입장하세요!', en:"You're up — come in!", th:'ถึงคิวคุณแล้ว เชิญเข้าได้เลย!', zh:'轮到您了，请进！', ja:'ご入場ください！', hi:'आपकी बारी — अंदर आइए!', ru:'Ваша очередь — заходите!' },
    'call.enterBig': { ko:'입장', en:'ENTER', th:'เชิญเข้า', zh:'请进', ja:'入場', hi:'प्रवेश', ru:'ВХОД' },
    'call.followStaff': { ko:'직원 안내를 따라 자리로 가세요', en:'Please follow the staff to your seat', th:'กรุณาตามพนักงานไปที่โต๊ะ', zh:'请跟随店员就座', ja:'スタッフのご案内に従ってお席へ', hi:'कृपया स्टाफ़ के साथ अपनी सीट पर जाएँ', ru:'Пройдите за персоналом к столу' },
    'yield.ask': { ko:'아직 준비가 안 되셨나요? 순서를 양보하세요.', en:'Not ready yet? Give up your spot.', th:'ยังไม่พร้อม? สละคิวของคุณได้', zh:'还没准备好？可以让出顺位。', ja:'まだ準備ができていませんか？順番をお譲りください。', hi:'अभी तैयार नहीं? अपनी बारी छोड़ें।', ru:'Ещё не готовы? Уступите очередь.' },
    'yield.one': { ko:'한 줄 양보', en:'Yield 1 spot', th:'สละ 1 คิว', zh:'让1位', ja:'1組に譲る', hi:'1 स्थान छोड़ें', ru:'Уступить 1 место' },
    'yield.two': { ko:'두 줄 양보', en:'Yield 2 spots', th:'สละ 2 คิว', zh:'让2位', ja:'2組に譲る', hi:'2 स्थान छोड़ें', ru:'Уступить 2 места' },
    'wait.cancel': { ko:'대기 취소', en:'Cancel', th:'ยกเลิกคิว', zh:'取消排队', ja:'キャンセル', hi:'रद्द करें', ru:'Отменить' },
    'lbl.waitNo': { ko:'대기 {n}번', en:'Queue #{n}', th:'คิวที่ {n}', zh:'排队号 {n}', ja:'受付番号 {n}', hi:'कतार #{n}', ru:'Очередь №{n}' },
    'ahead.lbl': { ko:'내 앞에 대기 팀 (예약 순서)', en:'groups ahead of you (in order)', th:'กลุ่มที่อยู่ก่อนคุณ (ตามลำดับ)', zh:'您前面的组数（按顺序）', ja:'あなたの前の組数（順番）', hi:'आपसे आगे समूह (क्रम में)', ru:'групп перед вами (по порядку)' },
    'est': { ko:'예상 대기 약 {n}분 · 알림 켜짐', en:'Approx. {n} min wait · alerts on', th:'รอประมาณ {n} นาที · เปิดแจ้งเตือน', zh:'预计等待约 {n} 分钟 · 提醒已开', ja:'待ち時間 約{n}分 · 通知オン', hi:'लगभग {n} मिनट प्रतीक्षा · सूचना चालू', ru:'Ожидание ~{n} мин · уведомления вкл.' },
    'pri.title': { ko:'우선 패스로 빨리 입장', en:'Skip ahead with Priority Pass', th:'ลัดคิวด้วยบัตรพิเศษ', zh:'用优先通行证插队', ja:'優先パスで先に入場', hi:'प्रायोरिटी पास से पहले प्रवेश', ru:'Раньше — с приоритет-пропуском' },
    'pri.buy': { ko:'우선 패스 구매 ฿49', en:'Buy Priority Pass ฿49', th:'ซื้อบัตรพิเศษ ฿49', zh:'购买优先通行证 ฿49', ja:'優先パス購入 ฿49', hi:'प्रायोरिटी पास खरीदें ฿49', ru:'Купить приоритет-пропуск ฿49' },
    'pri.desc': { ko:'대기 순번 앞쪽으로 이동합니다. 전광판·다른 손님에겐 표시되지 않아요.', en:"Moves you up the queue. Not shown on the board or to others.", th:'เลื่อนคุณขึ้นคิว ไม่แสดงบนจอหรือให้คนอื่นเห็น', zh:'让您在队列中前移。不会显示在屏幕上，其他顾客也看不到。', ja:'待ち順を前に移動します。掲示板や他のお客様には表示されません。', hi:'आपको कतार में आगे ले जाता है। बोर्ड या अन्य लोगों को नहीं दिखता।', ru:'Поднимает вас в очереди. Не видно на табло и другим.' },
    'pri.applied': { ko:'✓ 우선 패스 적용됨', en:'✓ Priority Pass active', th:'✓ ใช้บัตรพิเศษแล้ว', zh:'✓ 已启用优先通行证', ja:'✓ 優先パス適用中', hi:'✓ प्रायोरिटी पास सक्रिय', ru:'✓ Приоритет-пропуск активен' },
    'pri.appliedDesc': { ko:'대기 순번 앞쪽으로 이동했어요. 다른 손님은 알 수 없습니다.', en:"You've moved up. Others can't tell.", th:'คุณเลื่อนขึ้นคิวแล้ว คนอื่นไม่รู้', zh:'您已前移，其他人无法察觉。', ja:'順番が前に移動しました。他のお客様にはわかりません。', hi:'आप आगे बढ़ गए। दूसरों को पता नहीं चलेगा।', ru:'Вы поднялись в очереди. Другие не заметят.' },
    'pill.waiting': { ko:'대기중', en:'Waiting', th:'รอ', zh:'等待中', ja:'待機中', hi:'प्रतीक्षारत', ru:'Ожидание' },
    'pill.priority': { ko:'우선', en:'Priority', th:'พิเศษ', zh:'优先', ja:'優先', hi:'प्रायोरिटी', ru:'Приоритет' },
    'pill.reserved': { ko:'예약', en:'Reserved', th:'จอง', zh:'预约', ja:'予約', hi:'आरक्षित', ru:'Бронь' },
    'pill.yielded': { ko:'양보 {n}회', en:'Yielded {n}x', th:'สละ {n} ครั้ง', zh:'已让 {n} 次', ja:'{n}回譲渡', hi:'{n}x छोड़ा', ru:'Уступлено {n}x' },
    'soon': { ko:'곧 차례 — 가까이 와 주세요', en:'Almost your turn — stay close', th:'ใกล้ถึงคิวแล้ว — อยู่ใกล้ๆ นะ', zh:'快轮到您了——请就近等待', ja:'まもなく順番です — お近くでお待ちください', hi:'लगभग आपकी बारी — पास रहें', ru:'Скоро ваша очередь — будьте рядом' },
    'pass.one': { ko:'한 줄 패스 — 뒷팀 먼저', en:'Pass — let the next group go', th:'ผ่านคิว — ให้กลุ่มถัดไปก่อน', zh:'让位——让下一组先', ja:'パス — 次の組を先に', hi:'पास — अगले समूह को पहले जाने दें', ru:'Пропустить следующую группу' },
    'pass.max': { ko:'한 줄 패스 2회 모두 사용', en:'Pass used (2/2)', th:'ใช้ผ่านคิวครบ 2 ครั้งแล้ว', zh:'让位已用完（2/2）', ja:'パス2回すべて使用済み', hi:'पास उपयोग हो गया (2/2)', ru:'Пропуск использован (2/2)' },
    'lbl.custNo': { ko:'고객번호 {n}', en:'No. {n}', th:'หมายเลข {n}', zh:'号码 {n}', ja:'番号 {n}', hi:'नंबर {n}', ru:'№ {n}' },

    /* ----- 직원 콘솔 (한/영/태) ----- */
    'con.subtitle': { ko:'대기 관리', en:'Queue management', th:'จัดการคิว' },
    'con.branding': { ko:'매장 브랜딩', en:'Branding', th:'แบรนด์ร้าน' },
    'con.logoUp': { ko:'로고 업로드', en:'Upload logo', th:'อัปโหลดโลโก้' },
    'con.logoChange': { ko:'로고 변경', en:'Change logo', th:'เปลี่ยนโลโก้' },
    'con.logoRemove': { ko:'제거', en:'Remove', th:'ลบ' },
    'con.qr': { ko:'매장 QR 코드', en:'Store QR', th:'QR ร้าน' },
    'con.namesTitle': { ko:'매장 이름 (언어별 · 입력하면 손님 언어에 맞춰 표시 / 없으면 영어→태국어 순 대체)', en:"Store name per language (shown in the guest's language; falls back English → Thai)", th:'ชื่อร้านตามภาษา (แสดงตามภาษาลูกค้า / ถ้าไม่มี ใช้อังกฤษ → ไทย)' },
    'con.namesHelp': { ko:'예: 손님이 일본어를 선택했는데 일본어 이름이 비어 있으면 → 영어 이름, 그것도 없으면 태국어 이름으로 표시됩니다.', en:'e.g., a guest picks Japanese but the Japanese name is empty → English name, then Thai.', th:'เช่น ลูกค้าเลือกภาษาญี่ปุ่นแต่ไม่มีชื่อญี่ปุ่น → ใช้ชื่ออังกฤษ ถ้าไม่มีก็ไทย' },
    'con.statWait': { ko:'대기 팀', en:'Waiting', th:'รอคิว' },
    'con.statServed': { ko:'오늘 입장', en:'Seated today', th:'เข้าวันนี้' },
    'con.statRes': { ko:'예약', en:'Reservations', th:'การจอง' },
    'con.nowCalling': { ko:'현재 호출 (입장 안내 중)', en:'Now calling', th:'กำลังเรียก' },
    'con.callNext': { ko:'다음 손님 호출 ▶', en:'Call next ▶', th:'เรียกคิวถัดไป ▶' },
    'con.listTitle': { ko:'대기 명단 (예약·도착 순서)', en:'Waiting list (in order)', th:'รายชื่อรอ (ตามลำดับ)' },
    'con.listSub': { ko:'· 자리는 직원이 상황에 맞게 안내', en:'· staff seat guests as appropriate', th:'· พนักงานจัดที่นั่งตามสถานการณ์' },
    'con.empty': { ko:'대기 팀 없음', en:'No one waiting', th:'ไม่มีคิว' },
    'con.footHint': { ko:'“다음 손님 호출”을 누르면 대기 1순위 팀이 전광판에 표시됩니다', en:'Tap "Call next" to show the first group on the board', th:'กด "เรียกคิวถัดไป" เพื่อแสดงคิวแรกบนจอ' },
    'con.persons': { ko:'{n}명', en:'{n} ppl', th:'{n} คน' },
    'con.resCount': { ko:'예약 {n}건', en:'{n} reservations', th:'จอง {n} รายการ' },
    'con.loginTitle': { ko:'직원 로그인', en:'Staff login', th:'เข้าสู่ระบบพนักงาน' },
    'con.email': { ko:'아이디 (예: danny)', en:'ID (e.g. danny)', th:'ไอดี (เช่น danny)' },
    'con.pw': { ko:'비밀번호', en:'Password', th:'รหัสผ่าน' },
    'con.loginBtn': { ko:'로그인', en:'Log in', th:'เข้าสู่ระบบ' },
    'con.loginErr': { ko:'로그인 실패 — 이메일/비밀번호를 확인하세요', en:'Login failed — check email & password', th:'เข้าสู่ระบบไม่สำเร็จ — ตรวจสอบอีเมล/รหัสผ่าน' },
    'con.loginNote': { ko:'지정된 직원만 접근할 수 있어요', en:'Authorized staff only', th:'เฉพาะพนักงานที่ได้รับอนุญาต' },
    'con.logout': { ko:'로그아웃', en:'Log out', th:'ออกจากระบบ' },

    /* ----- 홈 / 디스커버리 ----- */
    'home.tagline': { ko:'동네 가게, 줄 서지 말고', en:'Skip the line at local shops', th:'ร้านใกล้คุณ ไม่ต้องต่อแถว', zh:'附近门店，免排队', ja:'近くのお店、並ばずに', hi:'पास की दुकानें, बिना कतार', ru:'Локальные места без очередей' },
    'home.search': { ko:'가게 이름 검색', en:'Search shops', th:'ค้นหาร้าน', zh:'搜索门店', ja:'お店を検索', hi:'दुकान खोजें', ru:'Поиск мест' },
    'home.allAreas': { ko:'전체 지역', en:'All areas', th:'ทุกพื้นที่', zh:'所有地区', ja:'全地域', hi:'सभी क्षेत्र', ru:'Все районы' },
    'home.waitTeams': { ko:'대기 {n}팀', en:'{n} waiting', th:'รอ {n} คิว', zh:'{n} 组等待', ja:'{n}組待ち', hi:'{n} प्रतीक्षारत', ru:'{n} в очереди' },
    'home.noWait': { ko:'바로 입장', en:'No wait', th:'ไม่ต้องรอ', zh:'无需等待', ja:'待ちなし', hi:'कोई प्रतीक्षा नहीं', ru:'Без очереди' },
    'home.empty': { ko:'검색 결과가 없어요', en:'No shops found', th:'ไม่พบร้าน', zh:'未找到门店', ja:'お店が見つかりません', hi:'कोई दुकान नहीं मिली', ru:'Ничего не найдено' },
    'cat.all': { ko:'전체', en:'All', th:'ทั้งหมด', zh:'全部', ja:'すべて', hi:'सभी', ru:'Все' },
    'cat.restaurant': { ko:'식당', en:'Restaurant', th:'ร้านอาหาร', zh:'餐厅', ja:'レストラン', hi:'रेस्तराँ', ru:'Ресторан' },
    'cat.cafe': { ko:'카페', en:'Cafe', th:'คาเฟ่', zh:'咖啡', ja:'カフェ', hi:'कैफ़े', ru:'Кафе' },
    'cat.clinic': { ko:'병원·클리닉', en:'Clinic', th:'คลินิก', zh:'诊所', ja:'クリニック', hi:'क्लिनिक', ru:'Клиника' },
    'cat.bank': { ko:'은행', en:'Bank', th:'ธนาคาร', zh:'银行', ja:'銀行', hi:'बैंक', ru:'Банк' },
    'cat.beauty': { ko:'네일·뷰티', en:'Beauty', th:'ความงาม', zh:'美容', ja:'ビューティー', hi:'ब्यूटी', ru:'Красота' },
    'cat.massage': { ko:'마사지', en:'Massage', th:'นวด', zh:'按摩', ja:'マッサージ', hi:'मसाज', ru:'Массаж' },
    'cat.gov': { ko:'관공서', en:'Public office', th:'หน่วยงานรัฐ', zh:'政府机构', ja:'役所', hi:'सरकारी कार्यालय', ru:'Госучреждение' },
    'home.codeTitle': { ko:'매장 코드로 바로 입장', en:'Enter by store code', th:'เข้าด้วยรหัสร้าน', zh:'用门店代码进入', ja:'店舗コードで入る', hi:'स्टोर कोड से प्रवेश', ru:'Вход по коду заведения' },
    'home.codePh': { ko:'매장 코드 입력 (예: gangnam)', en:'Store code (e.g. gangnam)', th:'รหัสร้าน (เช่น gangnam)', zh:'门店代码（如 gangnam）', ja:'店舗コード（例: gangnam）', hi:'स्टोर कोड (जैसे gangnam)', ru:'Код (напр. gangnam)' },
    'home.enter': { ko:'입장', en:'Enter', th:'เข้า', zh:'进入', ja:'入る', hi:'प्रवेश', ru:'Войти' },
    'home.notFound': { ko:'매장을 찾을 수 없어요', en:'Store not found', th:'ไม่พบร้านนี้', zh:'未找到门店', ja:'店舗が見つかりません', hi:'स्टोर नहीं मिला', ru:'Заведение не найдено' },
    'home.forBiz': { ko:'매장 사장님이세요?', en:'Own a shop?', th:'เป็นเจ้าของร้าน?', zh:'是商家吗？', ja:'お店の方ですか？', hi:'दुकान के मालिक हैं?', ru:'Владелец заведения?' },
    'home.staffLogin': { ko:'매장 로그인', en:'Store login', th:'เข้าสู่ระบบร้าน', zh:'商家登录', ja:'店舗ログイン', hi:'स्टोर लॉगिन', ru:'Вход для заведений' },
    'home.registerStore': { ko:'매장 등록 신청', en:'Register your store', th:'สมัครร้าน', zh:'注册门店', ja:'店舗登録申請', hi:'स्टोर पंजीकरण', ru:'Регистрация заведения' },

    /* ----- 시작 화면 (닉네임) ----- */
    'start.nickLabel': { ko:'닉네임을 정하세요 — 전광판에 이 이름이 떠요', en:'Choose a nickname — it shows on the board', th:'ตั้งชื่อเล่น — จะขึ้นบนจอ', zh:'设置昵称 — 会显示在屏幕上', ja:'ニックネームを決めてください — 掲示板に表示されます', hi:'उपनाम चुनें — यह बोर्ड पर दिखेगा', ru:'Выберите имя — оно появится на табло' },
    'start.nickPh': { ko:'예: 골프왕', en:'e.g. Mango', th:'เช่น มะม่วง', zh:'如：芒果', ja:'例: マンゴー', hi:'जैसे आम', ru:'напр. Манго' },
    'start.go': { ko:'시작하기', en:'Start', th:'เริ่ม', zh:'开始', ja:'はじめる', hi:'शुरू करें', ru:'Начать' },
    'start.taken': { ko:'지금 사용 중인 닉네임이에요 — 다른 이름으로 바꿔주세요', en:'That nickname is in use right now — please pick another', th:'ชื่อนี้มีคนใช้อยู่ — กรุณาเปลี่ยนชื่อ', zh:'该昵称正在被使用 — 请换一个', ja:'そのニックネームは使用中です — 別の名前にしてください', hi:'यह उपनाम अभी उपयोग में है — कृपया दूसरा चुनें', ru:'Это имя сейчас занято — выберите другое' },
    'start.available': { ko:'사용 가능한 닉네임이에요 ✓', en:'Nickname available ✓', th:'ใช้ชื่อนี้ได้ ✓', zh:'昵称可用 ✓', ja:'使用できます ✓', hi:'उपनाम उपलब्ध ✓', ru:'Имя свободно ✓' },
    'start.checking': { ko:'확인 중…', en:'Checking…', th:'กำลังตรวจสอบ…', zh:'检查中…', ja:'確認中…', hi:'जाँच हो रही है…', ru:'Проверка…' },
    'start.owner': { ko:'매장 주인이신가요?', en:'Are you a shop owner?', th:'เป็นเจ้าของร้าน?', zh:'您是商家吗？', ja:'お店の方ですか？', hi:'क्या आप दुकान के मालिक हैं?', ru:'Вы владелец заведения?' },

    /* ----- 마사지/스파/네일 손님 예약 ----- */
    'spa.tagline': { ko:'지명·룸·시간까지 예약하고 편하게', en:'Book your therapist, room & time', th:'จองหมอนวด ห้อง และเวลา', zh:'预约按摩师·房间·时间', ja:'セラピスト・部屋・時間を予約', hi:'थेरेपिस्ट, रूम और समय बुक करें', ru:'Выберите мастера, кабинет и время' },
    'spa.svc': { ko:'시술 선택', en:'Choose a service', th:'เลือกบริการ', zh:'选择服务', ja:'メニューを選ぶ', hi:'सेवा चुनें', ru:'Выберите услугу' },
    'spa.min': { ko:'{n}분', en:'{n} min', th:'{n} นาที', zh:'{n}分钟', ja:'{n}分', hi:'{n} मिनट', ru:'{n} мин' },
    'spa.therapist': { ko:'마사지사 지명', en:'Pick a therapist', th:'เลือกหมอนวด', zh:'指定按摩师', ja:'セラピスト指名', hi:'थेरेपिस्ट चुनें', ru:'Выберите мастера' },
    'spa.anyone': { ko:'아무나 · 먼저 되는 분', en:'Anyone available', th:'คนไหนก็ได้', zh:'任意可约', ja:'指名なし', hi:'कोई भी उपलब्ध', ru:'Любой свободный' },
    'spa.room': { ko:'룸 선택', en:'Choose a room', th:'เลือกห้อง', zh:'选择房间', ja:'部屋を選ぶ', hi:'रूम चुनें', ru:'Выберите кабинет' },
    'spa.room.private': { ko:'개인룸', en:'Private', th:'ห้องส่วนตัว', zh:'独立房', ja:'個室', hi:'निजी', ru:'Отдельный' },
    'spa.room.shared': { ko:'공용', en:'Shared', th:'ห้องรวม', zh:'共用', ja:'共用', hi:'साझा', ru:'Общий' },
    'spa.room.group': { ko:'단체룸', en:'Group', th:'ห้องกลุ่ม', zh:'团体房', ja:'グループ', hi:'समूह', ru:'Групповой' },
    'spa.cap': { ko:'{n}인', en:'{n} ppl', th:'{n} คน', zh:'{n}人', ja:'{n}名', hi:'{n} लोग', ru:'{n} чел.' },
    'spa.when': { ko:'언제 받으실래요?', en:'When?', th:'เมื่อไหร่?', zh:'什么时候？', ja:'いつ？', hi:'कब?', ru:'Когда?' },
    'spa.now': { ko:'지금 바로', en:'Now', th:'ตอนนี้', zh:'现在', ja:'今すぐ', hi:'अभी', ru:'Сейчас' },
    'spa.reserve': { ko:'시간 예약', en:'Reserve', th:'จองเวลา', zh:'预约', ja:'時間予約', hi:'समय बुक करें', ru:'Бронь' },
    'spa.time': { ko:'예약 시간', en:'Time', th:'เวลา', zh:'时间', ja:'時間', hi:'समय', ru:'Время' },
    'spa.book': { ko:'예약하기', en:'Book now', th:'จองเลย', zh:'确认预约', ja:'予約する', hi:'बुक करें', ru:'Забронировать' },
    'spa.bookNow': { ko:'지금 접수하기', en:'Check in now', th:'รับคิวตอนนี้', zh:'立即登记', ja:'今すぐ受付', hi:'अभी चेक-इन', ru:'Записаться сейчас' },
    'spa.needSvc': { ko:'시술을 선택해주세요', en:'Please choose a service', th:'กรุณาเลือกบริการ', zh:'请选择服务', ja:'メニューを選んでください', hi:'कृपया सेवा चुनें', ru:'Выберите услугу' },
    'spa.needRoom': { ko:'룸을 선택해주세요', en:'Please choose a room', th:'กรุณาเลือกห้อง', zh:'请选择房间', ja:'部屋を選んでください', hi:'कृपया रूम चुनें', ru:'Выберите кабинет' },
    'spa.booked': { ko:'예약 완료', en:'Booked!', th:'จองสำเร็จ', zh:'预约成功', ja:'予約完了', hi:'बुक हो गया', ru:'Готово!' },
    'spa.myBooking': { ko:'내 예약', en:'Your booking', th:'การจองของคุณ', zh:'您的预约', ja:'あなたの予約', hi:'आपकी बुकिंग', ru:'Ваша бронь' },
    'spa.lblSvc': { ko:'시술', en:'Service', th:'บริการ', zh:'服务', ja:'メニュー', hi:'सेवा', ru:'Услуга' },
    'spa.lblWho': { ko:'마사지사', en:'Therapist', th:'หมอนวด', zh:'按摩师', ja:'セラピスト', hi:'थेरेपिस्ट', ru:'Мастер' },
    'spa.lblRoom': { ko:'룸', en:'Room', th:'ห้อง', zh:'房间', ja:'部屋', hi:'रूम', ru:'Кабинет' },
    'spa.lblWhen': { ko:'시간', en:'When', th:'เวลา', zh:'时间', ja:'時間', hi:'समय', ru:'Время' },
    'spa.statusWait': { ko:'대기 중 — 순서 되면 알려드려요', en:"Waiting — we'll call you", th:'รอคิว — เราจะเรียกคุณ', zh:'等待中 — 轮到会通知', ja:'お待ちください — お呼びします', hi:'प्रतीक्षारत — हम बुलाएँगे', ru:'Ожидание — мы позовём' },
    'spa.statusServing': { ko:'지금 받는 중이에요', en:'In session now', th:'กำลังนวด', zh:'正在进行', ja:'施術中', hi:'सत्र जारी', ru:'Идёт сеанс' },
    'spa.cancel': { ko:'예약 취소', en:'Cancel', th:'ยกเลิก', zh:'取消', ja:'キャンセル', hi:'रद्द करें', ru:'Отменить' },
    'spa.today': { ko:'오늘', en:'Today', th:'วันนี้', zh:'今天', ja:'本日', hi:'आज', ru:'Сегодня' },
    'spa.tier.pretty': { ko:'프리티', en:'Pretty', th:'พริตตี้', zh:'精选', ja:'プリティ', hi:'प्रीमियम', ru:'Премиум' },
    'spa.tier.regular': { ko:'일반', en:'Regular', th:'ทั่วไป', zh:'普通', ja:'一般', hi:'सामान्य', ru:'Обычный' },
    'spa.extra': { ko:'추가 +฿{n}', en:'+฿{n}', th:'+฿{n}', zh:'+฿{n}', ja:'+฿{n}', hi:'+฿{n}', ru:'+฿{n}' },
    'spa.firstHint': { ko:'마사지사를 보고 직접 골라보세요', en:'Browse and pick your therapist', th:'เลือกหมอนวดที่คุณชอบ', zh:'浏览并选择按摩师', ja:'セラピストを見て選べます', hi:'थेरेपिस्ट देखकर चुनें', ru:'Выберите мастера по профилю' },
    'spa.where': { ko:'어디서 받으실래요?', en:'Where?', th:'รับบริการที่ไหน?', zh:'在哪里？', ja:'どこで？', hi:'कहाँ?', ru:'Где?' },
    'spa.locShop': { ko:'샵 방문', en:'At the shop', th:'ที่ร้าน', zh:'到店', ja:'店舗で', hi:'दुकान पर', ru:'В салоне' },
    'spa.locOutcall': { ko:'출장 마사지', en:'Outcall', th:'นวดนอกสถานที่', zh:'上门服务', ja:'出張', hi:'आउटकॉल', ru:'Выезд' },
    'spa.address': { ko:'출장 주소', en:'Your address', th:'ที่อยู่ของคุณ', zh:'您的地址', ja:'ご住所', hi:'आपका पता', ru:'Ваш адрес' },
    'spa.addressPh': { ko:'건물·호수·랜드마크', en:'Building, room, landmark', th:'อาคาร ห้อง จุดสังเกต', zh:'楼栋·房号·地标', ja:'建物・部屋・目印', hi:'भवन, कमरा, लैंडमार्क', ru:'Здание, кв., ориентир' },
    'spa.travelFee': { ko:'출장비', en:'Travel fee', th:'ค่าเดินทาง', zh:'上门费', ja:'出張費', hi:'यात्रा शुल्क', ru:'Сбор за выезд' },
    'spa.needAddr': { ko:'출장 주소를 입력해주세요', en:'Please enter your address', th:'กรุณากรอกที่อยู่', zh:'请输入地址', ja:'住所を入力してください', hi:'कृपया पता दर्ज करें', ru:'Введите адрес' },
    'spa.lblWhere': { ko:'장소', en:'Where', th:'สถานที่', zh:'地点', ja:'場所', hi:'स्थान', ru:'Место' },
    'spa.noTherapist': { ko:'지금 가능한 마사지사가 없어요', en:'No therapist available now', th:'ไม่มีหมอนวดว่างตอนนี้', zh:'暂无可约按摩师', ja:'対応可能なセラピストがいません', hi:'अभी कोई थेरेपिस्ट उपलब्ध नहीं', ru:'Нет свободных мастеров' }
  };

  function t(lang, key){ var e = S[key]; if (!e) return key; return e[lang] || e.en || e.ko || key; }

  function storeName(state, lang){
    var n = (state && state.store && state.store.names) || {};
    function v(k){ return n[k] && String(n[k]).trim(); }
    return v(lang) || v('en') || v('th') || v('ko') || v('zh') || v('ja') || v('hi') || v('ru') || (state && state.store && state.store.name) || 'QuesMe';
  }

  function detectLang(){
    try { var s = localStorage.getItem('quesme:lang'); if (s) return s; } catch (e){}
    var n = (global.navigator && (navigator.language || navigator.userLanguage) || 'en').slice(0, 2).toLowerCase();
    return ['ko','en','th','zh','ja','hi','ru'].indexOf(n) >= 0 ? n : 'en';
  }

  global.I18N = { LANGS: LANGS, t: t, storeName: storeName, detectLang: detectLang };
})(window);
