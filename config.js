/* QuesMe — backend config.
 * Publishable key는 브라우저에 노출돼도 되는 공개 키입니다 (RLS로 보호).
 * 지금은 thaimate 프로젝트에 quesme_* 테이블로 얹혀 있고, 나중에 독립 프로젝트로 분리하면
 * 이 두 값만 바꾸면 됩니다.
 */
window.QUESME_CONFIG = {
  url: 'https://jhtsncdeoulanvytfwrl.supabase.co',
  anonKey: 'sb_publishable_ChPPAnOQnOUWh-huy83ckg_pK4343IF'
};
