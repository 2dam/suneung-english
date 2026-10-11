# 수능영어 유형 연습

수능 영어 유형을 대비하는 **독창 문제**(듣기 17 + 읽기 28 규격), 보기별 해설, 오답노트, 인쇄, 모의고사 모드를 갖춘 웹앱.
시범판은 서버 없이 정적 프론트엔드 + 브라우저 저장소(localStorage)로 동작한다.

```bash
npm install
npm run dev            # 개발 서버
npm run check:content  # 문제 데이터 검사 (build 전에 자동 실행)
npm run build
npm run audio          # 듣기 음원 생성 (Azure Speech 키 필요, scripts/make-audio.mjs 참고)
```

## 문제 추가하는 법

`src/content/<basic|mid|high>/*.json` 에 배열로 추가하면 화면에 바로 나온다. 한 파일은 한 묶음(예: 유형별 연습 한 세트, 모의고사 한 회차).

```jsonc
{
  "id": "mid-gist-002",        // 등급-유형-순번, 전체에서 유일
  "level": "mid",              // basic | mid | high
  "set": "practice",           // practice(유형 연습) | mock-01, mock-02 ... (모의고사 회차)
  "no": 22,                    // 모의고사 문항 번호(듣기 1~17, 읽기 18~45). practice는 생략
  "group": "mock01-g41",       // (선택) 한 지문을 공유하는 세트 문항 표시. 같은 group은 지문 중복 허용
  "type": "gist",              // src/data/types.js 의 key
  "stem": "다음 글의 요지로 가장 적절한 것은?",
  "passage": "영어 지문...",    // 읽기. 어법은 {1|close} 처럼 번호 붙은 밑줄. 줄바꿈은 \n
  "script": [{ "speaker": "W", "text": "..." }, { "speaker": "M", "text": "..." }], // 듣기. W/M/N
  "options": ["...", "...", "...", "...", "..."],
  "answer": 1,                 // 0부터. 정답 위치가 한쪽으로 쏠리지 않게 분산할 것
  "translation": "해석",
  "why": "정답 근거",
  "optionNotes": ["①번 해설", "②번 해설", "③", "④", "⑤"],
  "trap": "함정 포인트",
  "tip": "풀이 전략"
}
```

작성 원칙: **기출·참고서의 지문과 문장을 쓰지 않고 전부 새로 쓴다.** 유형과 형식만 참고한다.
자동 검사가 잡는 것: 보기 5개·정답 범위·해설 5개·지문 중복·어법 번호 표기·모의고사 번호 규칙·정답 위치 쏠림.

## 듣기 음원

`public/audio/manifest.json`에 있는 문제는 녹음된 음원(mp3)을 재생하고, 없으면 브라우저 내장 음성으로 임시 재생한다.
모의고사 모드에서는 듣기를 2번까지 재생할 수 있다.
