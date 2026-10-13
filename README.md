# 중1,2,3학년 수능영어 완성하기

중학생이 **수능과 똑같은 출제 형식**(45문항·70분, 듣기 17 + 읽기 28, 번호별 유형·발문)에 익숙해지도록 만든 모의고사 앱.
지문 난이도만 중학교 수준(중1·중2·중3)으로 낮추고, 형식은 수능 그대로 둔다.
목표는 **모의고사 100회분 (중1 30회 · 중2 30회 · 중3 40회)**.
서버 없이 정적 프론트엔드 + 브라우저 저장소(localStorage)로 동작한다.

```bash
npm install
npm run dev            # 개발 서버
npm run check:content  # 문제 데이터 검사 (build 전에 자동 실행)
npm run build
npm run audio          # 듣기 음원 생성 (Azure Speech 키 필요, scripts/make-audio.mjs 참고)
```

## 문제 추가하는 법

`src/content/<m1|m2|m3>/*.json` 에 배열로 추가하면 화면에 바로 나온다. 한 회차(45문항)를 4개 파일로 나눠 쓴다
(`mock-NN-listening`, `-reading-a`(18~28), `-reading-b`(29~40), `-reading-c`(41~45)).

```jsonc
{
  "id": "m1-01-22",          // 학년-회차-번호, 전체에서 유일
  "level": "m1",             // m1 | m2 | m3
  "set": "mock-01",          // mock-01, mock-02 ... (모의고사 회차)
  "no": 22,                  // 문항 번호 (듣기 1~17, 읽기 18~45)
  "group": "m1-01-g41",      // (선택) 한 지문을 공유하는 세트 문항. 같은 group은 지문 중복 허용
  "type": "gist",            // src/data/types.js 의 key
  "stem": "다음 글의 요지로 가장 적절한 것은?",
  "passage": "영어 지문...",   // 읽기. {1|close} 번호 밑줄, {u|word} 번호 없는 밑줄. 줄바꿈은 \n
  "script": [{ "speaker": "W", "text": "..." }, { "speaker": "M", "text": "..." }], // 듣기. W/M/N
  "picture": { "title": "...", "items": [{ "no": 1, "emoji": "🕒", "label": "a round clock" }] }, // l-picture: 5개
  "chart": { "title": "...", "unit": "students", "labels": ["A", "B"], "series": [{ "name": "N", "values": [3, 5] }] }, // l-chart, chart
  "options": ["...", "...", "...", "...", "..."],
  "answer": 1,               // 0부터. 회차마다 ①~⑤가 각 9개씩 되게 분산
  "translation": "해석",
  "why": "정답 근거",
  "optionNotes": ["①번 해설", "②번 해설", "③", "④", "⑤"],
  "trap": "함정 포인트",
  "tip": "풀이 전략"
}
```

### 작성 원칙
- **기출·참고서의 지문과 문장을 쓰지 않고 전부 새로 쓴다.** 수능의 형식과 유형만 따른다.
- 학년별 난이도 기준은 `src/data/levels.js`의 `spec`(지문 단어 수, 문장 길이, 듣기 대본 길이). 벗어나면 검사가 경고한다.
- 정답이 가장 긴 보기가 되지 않게, 오답 보기의 길이를 맞춘다(검사가 30% 초과 시 경고).
- 글의 순서·문장 삽입은 정답 외의 배열이 성립하지 않는지 확인한다(정관사·대명사·접속 부사 단서).

### 자동 검사
보기·해설 5개, 정답 범위, 어법/어휘 번호 밑줄, 빈칸·순서 표기, 그림·도표 자료, 지문 중복, 모의고사 번호 규칙,
정답 위치 쏠림, 정답이 가장 긴 보기 비율, 학년별 지문 난이도.

## 듣기 음원

`public/audio/manifest.json`에 있는 문제는 녹음된 음원(mp3)을 재생하고, 없으면 브라우저 내장 음성으로 임시 재생한다.
모의고사 모드에서는 듣기를 2번까지 재생할 수 있다.

## 보관

`archive/high-school-sample/`: 고등학교 수준으로 먼저 만들었던 모의고사 샘플. 앱에는 포함되지 않는다.

## 배포 (Render 정적 사이트)

`render.yaml`에 설정이 있다. 빌드는 `npm install && npm run build`(콘텐츠 검사 후 vite build), 게시 폴더는 `dist`.

1. Render 대시보드 → **New → Blueprint** → 저장소 `2dam/suneung-english` 선택 → 적용
   (또는 **New → Static Site**에서 같은 값으로 직접 입력)
2. 서비스 → **Settings → Custom Domains**에 `ichapterwise.com`, `www.ichapterwise.com` 추가
3. 도메인 등록 업체의 DNS에서 Render가 표시하는 값으로 설정
   - `@`(루트) → Render가 알려 주는 A 레코드 값
   - `www` → `<서비스 이름>.onrender.com` (CNAME)
4. 인증서는 Render가 자동 발급한다. 이후 `main`에 푸시하면 자동 배포된다.
