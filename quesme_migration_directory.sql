-- QuesMe — directory fields + demo stores (for the home/discovery screen)
alter table quesme_stores add column if not exists category text;
alter table quesme_stores add column if not exists area text;

update quesme_stores set category='restaurant', area='latkrabang' where slug='gangnam';

insert into quesme_stores (slug, names, tagline, category, area) values
('hcs-bangna',        '{"th":"HCS คลินิกรักษาข้อเข่าเสื่อม สาขาบางนา","en":"HCS Knee Osteoarthritis Clinic, Bangna","ko":"HCS 무릎 퇴행성관절 클리닉 방나점","zh":"HCS 膝关节退化诊所 邦那分院","ja":"HCS 膝関節クリニック バンナー店"}'::jsonb, '퇴행성 무릎관절 전문', 'clinic',     'bangna'),
('nailart-asok',      '{"ko":"샤인 네일아트 아속","en":"Shine Nail Art Asok","th":"ไชน์ เนลอาร์ต อโศก","zh":"Shine 美甲 阿索","ja":"シャインネイル アソーク"}'::jsonb, '네일·속눈썹·왁싱', 'beauty',     'asok'),
('massage-thonglor',  '{"ko":"사바이 타이마사지 텅러","en":"Sabai Thai Massage Thonglor","th":"สบาย ไทยมาสสาจ ทองหล่อ","zh":"Sabai 泰式按摩 通罗","ja":"サバイ タイマッサージ トンロー"}'::jsonb, '타이·발·아로마', 'massage',    'thonglor'),
('cafe-asok',         '{"ko":"모닝 커피 아속","en":"Morning Coffee Asok","th":"มอร์นิ่ง คอฟฟี่ อโศก","zh":"晨光咖啡 阿索","ja":"モーニングコーヒー アソーク"}'::jsonb, '스페셜티 카페', 'cafe',       'asok'),
('bank-siam',         '{"ko":"방콕은행 시암점","en":"Bangkok Bank Siam","th":"ธนาคารกรุงเทพ สยาม","zh":"盘谷银行 暹罗","ja":"バンコク銀行 サイアム"}'::jsonb, '환전·창구', 'bank',       'siam')
on conflict (slug) do nothing;
