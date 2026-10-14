# Portfolio Design System

이력서·자기소개서·포트폴리오를 **JSON 하나로** Figma에 찍어 내는 디자인 시스템과 Figma 플러그인입니다.
간격·색·글꼴은 Figma 변수와 텍스트 스타일로 묶여 있고, A4를 넘치는 내용은 자동으로 다음 장으로 넘어갑니다.

## 들어 있는 것

| 경로 | 내용 |
|---|---|
| `manifest.json`, `code.js`, `ui.html` | Figma 개발 플러그인 (빌드 과정 없음) |
| `docs/sample.json` | 가상 인물로 채운 예시 콘텐츠 |
| `docs/content.schema.json` | 콘텐츠 JSON 스키마 |
| `docs/preview.html` | 브라우저 미리보기. JSON을 붙여 넣으면 A4 장표로 바로 렌더링 |
| `docs/GUIDE.md` | 플러그인 상세 설명 (단계별 동작, 레이아웃 규칙, 업그레이드) |
| `docs/SPEC.md`, `docs/SPEC2.md` | 토큰·컴포넌트·간격 수치 스펙 |

## 빠른 시작

1. **Figma 데스크톱 앱**에서 작업할 파일을 엽니다. 브라우저 Figma에서는 개발 플러그인을 가져올 수 없습니다.
2. 메뉴 **Plugins → Development → Import plugin from manifest…** 에서 이 저장소의 `manifest.json` 을 고릅니다.
3. **Plugins → Development → KB Resume System** 으로 실행합니다.
4. 창 위쪽 폰트를 고르고 버튼을 순서대로 누릅니다.
   - **1. Foundations** — 페이지, 변수(`KB Tokens`), 텍스트 스타일 생성
   - **2. Atoms** — 선·점·연락처 같은 기본 부품
   - **3. Blocks** — 경력 항목, 프로젝트 블록 등
   - **4. Templates** — A4 템플릿 4종(이력서, 자기소개서, 포폴 표지, 포폴 상세)
5. JSON 칸에 내 콘텐츠를 붙여 넣고, 이미지가 있으면 이미지 칸에 파일들을 끌어다 놓은 뒤 **5. Build all** 을 누릅니다.
6. `Templates` 페이지에 장표가 생깁니다. 선택하고 **PNG 내보내기** 로 저장할 수 있습니다.

1~4단계는 처음 한 번만 누르면 됩니다. 이후에는 JSON만 고치고 5단계만 누르세요.
모든 단계는 이름으로 먼저 찾고 없을 때만 만들어서, 여러 번 눌러도 중복이 생기지 않습니다.

## 콘텐츠 작성

`docs/sample.json` 을 복사해 고치는 것이 가장 빠릅니다. 최상위 키가 곧 만들 장표입니다. 없는 키는 건너뜁니다.

```json
{
  "theme":       { "accent": "#f9af00", "ink": "#101010" },
  "profile":     { "name": "…", "email": "…", "phone": "…", "github": {…}, "blog": {…} },
  "resume":      { "sections": ["education","about","experience","project","skill"], … },
  "coverLetter": { "tagline": "…", "paragraphs": [ … ] },
  "portfolio":   { "cover": { … }, "details": [ { "company": "…", "projects": [ … ] } ] }
}
```

본문 문자열 규칙:

| 쓰는 법 | 결과 |
|---|---|
| `**굵게**` | 굵은 글씨 |
| `[보이는 글자](https://주소)` | 밑줄 링크 |
| `\n` | 줄바꿈 |
| `• 항목` | 1단계 불릿 |
| `  • 항목` | 2단계 불릿 |
| 공백 2칸 / 4칸으로 시작하는 줄 | 1단계 / 2단계 불릿의 이어지는 줄 |
| `## 소제목` | 강조색 소제목 (포폴 상세 섹션 안) |

포트폴리오 상세 프로젝트는 `blocks` 배열을 위에서부터 쌓습니다.

| type | 용도 |
|---|---|
| `section` | 소제목 + 본문 |
| `image` | 이미지 1장 (+ `caption`, 선택 `width`) |
| `images` | 이미지 여러 장 나란히 |
| `code` | 코드 블록 |

이미지 값(`src`, `resume.logo`, `photo`)은 세 가지 형태를 받습니다.

- `https://…` URL — 플러그인이 직접 불러옵니다.
- 파일 이름 (`diagram.png`) — 플러그인 창 이미지 칸에 같은 이름의 파일을 넣어 주세요.
- `data:image/png;base64,…` — JSON 안에 직접 넣기.

## 미리보기로 먼저 확인하기

`docs/preview.html` 을 브라우저로 열고 왼쪽 칸에 JSON을 붙여 넣으면 Figma 없이 장 수, 줄바꿈, 페이지 나눔을 확인할 수 있습니다. 플러그인과 같은 간격 규칙을 씁니다.

## 자주 하는 작업

- **브랜드 프리셋** — `"theme": { "preset": "krafton" }` 처럼 적거나 플러그인 창의 **브랜드** 목록에서 고릅니다. 지금 있는 프리셋은 `default`(#f9af00)와 `krafton`(#02b86f)입니다. `accent`·`ink` 를 같이 적으면 그 값이 우선합니다.
- **회사별 색 바꾸기** — `theme.accent` 를 바꾸고 5단계. 이미 만든 페이지 색을 유지하려면 그 페이지를 선택하고 **선택한 페이지 색 고정** 을 먼저 누르세요(변수를 공유하기 때문).
- **회사 로고 넣기** — `resume.logo` 에 파일 이름을 적고 이미지 칸에 로고 파일을 넣습니다. 이름 오른쪽, 높이 60으로 들어갑니다.
- **링크 아이콘** — 링크의 `icon` 값(`github` / `youtube` / `web`)에 맞춰 `icon-github.png`, `icon-youtube.png`, `icon-web.png` 를 붙입니다. `docs/icons/` 의 파일을 이미지 칸에 같이 넣으세요. 파일이 없으면 검은 원으로 표시됩니다.
- **다른 페이지·파일로 옮긴 뒤 글자 크기가 틀어졌을 때** — 옮긴 장표를 선택하고 **선택한 페이지 글자 크기 복구** 를 누릅니다. 글자마다 붙은 텍스트 스타일 이름으로 이 파일의 KB 스타일을 찾아 크기·행간을 되돌리고, 다른 파일에서 딸려 온 스타일은 이 파일 스타일로 다시 연결합니다. 로그에 바뀐 글자와 크기가 남습니다.
- **섹션 순서 바꾸기** — `resume.sections` 배열 순서를 바꿉니다.
- **프로젝트 추가** — `portfolio.details[].projects` 에 항목을 하나 더 넣습니다. 넘치면 자동으로 다음 장이 생깁니다.

## 알아 둘 점

- 기본 글꼴은 Apple SD Gothic Neo(맥 기본)이고, 없으면 Noto Sans KR로 대체합니다.
- 한 블록이 A4 한 장보다 크면 자동으로 나눌 수 없어 로그에 경고가 남습니다. 본문을 줄이거나 블록을 나눠 주세요.
- 다시 Build all 하면 기존 페이지를 지우지 않고 오른쪽에 새로 만듭니다.
- 자세한 동작과 업그레이드 절차는 [`docs/GUIDE.md`](docs/GUIDE.md) 를 보세요.
