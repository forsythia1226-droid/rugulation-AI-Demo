/* 로컬 전용 설정 예시 파일
 * - 이 파일을 js/env.js 로 복사해서 값을 채우면 브라우저가 그 값을 읽습니다.
 * - js/env.js 는 .gitignore 에 있어 저장소에 올라가지 않습니다.
 * - 공개 배포본(GitHub Pages)에는 빈 값으로만 들어갑니다. 공개 페이지에 API 키를 넣지 마십시오.
 */
window.__ENV={
  GEMINI_PROXY:"http://localhost:8787",   // 프록시 서버 주소 (권장). 비우면 직접 호출
  GEMINI_API_KEY:"",                      // 직접 호출용 키. 로컬 테스트 외에는 사용하지 마세요
  GEMINI_MODEL:"gemini-3.5-flash"
};
