# SPEC v2 — B형 원본(2026-06 PDF, Figma 287:*) 실측 기반 확장

SPEC.md 위에 덮어쓰는 변경·추가분. 수치는 전부 원본 프레임 좌표(페이지 1190×1684 기준, px). 충돌 시 이 문서가 우선.

## 0. 공통 정정
- **프로젝트 제목 옆 구분선은 세로 바**: `Atom/Rule/Short` 는 가로 27×2 가 아니라 **세로 2×27** (fill color/ink). 표지 Project 목록과 이력서 Project 섹션 모두. 제목 오른쪽 11px, 바 오른쪽 10px 뒤에 기술 목록.
- 기술 목록(tools) 은 쉼표 없이 단어 사이 6px 간격 (표지·이력서 Project). 스킬 그룹의 tools 는 쉼표 구분 유지.
- 이력서 태그라인 22/26 Bold accent (SPEC.md 의 24 는 자소서·표지용).
- 연락처 행(Atom/Contact)은 **헤더의 고정 위치**: 우측 끝 x=1133, y=214. 첫 섹션이 무엇이든 같은 자리(KB: About Me 옆 216, B형: Education 위 214). 페이지 프레임 ABSOLUTE 자식.
- 이력서 우측 상단 안내(Atom/Note): 1장만, 우측 끝 1133, y=36 → B형에는 첫 섹션(About Me) 헤더 오른쪽(884,344)에 있고 A형은 y=43 상단. **About Me 헤더 우측 슬롯**으로 통일(About Me 가 어디 있든 그 헤더 오른쪽). 상단 코너 노트는 제거.
- 로고: `resume.logo` 이미지. **높이 60 고정, 폭 비율대로(최대 270), x = 이름 오른쪽 끝 + 20, y = 55** (원본 SPARTA 로고 84×60 @ (260,55)). FIT, 왼쪽 정렬. 없으면 숨김. (`resume.logoHeight` 로 높이 덮어쓰기 허용, 기본 60)

## 1. 이력서 (Template/Resume)
섹션 5종을 JSON `resume.sections` 배열 순서대로 쌓는다. 기본 순서(B형): `["education","about","experience","project","skill"]`. A형은 `["about","experience","education"]`.
- 페이지 1 상단: 이름 (55,37) 71/83 · 로고 · 태그라인 (55,127) 22/26 accent · 연락처 (우측 1133, 214).
- 첫 섹션 제목 top = **233** (헤더 바닥 153 + 80). 이어지는 장(2장째~)은 섹션 제목 top = **44** (원본 Project 제목 (51,44)).
- 섹션 제목 32/38 Bold, 밑줄 2px: 제목 top + 38. 섹션 사이 gap **36**.
- 제목 밑줄 → 첫 항목 top 간격(섹션별): education **20**, about **27**, experience **36**, project **39**, skill **36**.
- **education**: 학교 20 Bold (55, +0) · 세로? 아니오: 짧은 가로선 29×1 rule-soft @ (학교 오른쪽+9, +12) · 학과 20 Light · 메타 16 (학과 오른쪽+17, +5). 항목 gap 24.
- **about**: 단락 = 소제목 16/25 Bold (x 57) + 본문 16/28 (x 67, 폭 1066). 본문 안 `• ` 줄은 들여쓰기 1em 매달림. 단락 gap **9**.
- **experience**: SPEC.md 그대로(제목 24 Bold, soft rule, 날짜 16 우측, 본문 16/30 top=제목+35, 항목 gap 24).
- **project** (이력서용, 표지 ProjectItem 과 같은 블록 `Block/Cover/ProjectItem` 재사용): 제목 20 Bold (52,+2) · 세로 바 2×27 @ 제목 오른쪽+11 · tools 16 @ 바+10, 단어 gap 6 · soft rule(좌 20 우 11) · 날짜 16 우측 끝 1132. 본문 16/25 top = 제목 top + 35, 폭 983 (우측 링크 열 제외). 2단계 불릿: 1단계 `• ` x=65, 2단계 `  • ` 들여쓰기 +24. 링크 열: 아이콘 17 + 텍스트 16, 우측 끝 1132, 첫 링크 top = 제목 top + 26, 링크 gap 7. 항목 gap **20**.
- **skill** (이력서용 `Block/Cover/SkillGroup` 변형 `layout=resume`): 카테고리 20/29 Bold (56,+0) · tools 16 쉼표 구분 (56,+29) · 가로선 1px @ y=+10, x=카테고리 오른쪽+20 → 1133 · 설명 16/21 우측 정렬, **top = tools 와 같은 +29**, 우측 끝 1137, 폭 638. 그룹 gap **12**. (표지 Profile 의 SkillGroup 은 기존대로: 설명이 tools 아래, 그룹 gap 9)

## 2. 포폴 표지 (Template/PortfolioCover)
변경 없음. 단 ProjectItem 구분선을 세로 바로, tools 를 쉼표 없는 단어 gap 6 으로.

## 3. 포폴 상세 (Template/PortfolioDetail) — 블록 흐름 모델
### 페이지 골격
- 1장: 회사명 (55,66) 50/59 Bold + 점 (제목 오른쪽+9, +33) · 가로선 1px (105,144)→1135 · 세로선 x=66, y=141→1652 · 안내 Note (873,105) · 요약 헤드라인 (102,174) 24/26 폭 728 · 요약 보조 (102,235) 16/22 · 첫 프로젝트 top **276**(보조 바닥 257 + 19).
- 이어지는 장: 상단 여백 **64**. 세로선 x=66, y=64→1645. 회사명 없음. **이어지는 프로젝트의 제목·부제·밑줄을 다시 붙임** (제목 (105,64), 밑줄 (105,100)). 새 프로젝트가 이어지는 장 맨 위에서 시작할 때도 같은 위치.
- 프로젝트 사이 gap **56**.

### 프로젝트 헤더
제목 30/36 Bold (102,top) · 부제 14/22 Bold accent, x=제목 오른쪽+12, 아래 정렬(부제 바닥 = 제목 바닥 −2) · 가로선 1px (105, 제목 top+36) 폭 1030.

### 사이드바 (우측, x=884, 폭 245, top = 밑줄 + 40)
`기간` 26/31 Bold → 값 16 (+47 = 라벨 바닥 +16) → **링크**(있을 때): 아이콘 19 + 텍스트 16 밑줄, 값 바닥 +17 부터, 행 gap 12 → `사용 기술` 26/31 Bold (직전 요소 바닥 +35) → 태그 16, 2열 wrap(열 gap 40, 행 gap 11), 라벨 바닥 +5.
JSON: `period`, `links:[{label,url,icon:"github"|"web"|"youtube"}]`, `tags`.

### 본문 블록 (JSON `blocks` 배열, 순서대로)
- `{ "type":"section", "heading":"개요", "body":"..." }` : 소제목 16/22 Bold + 본문 16/22. 본문 줄 규칙: `• ` 1단계 불릿(x=본문+10, 매달림 1em) · `  • ` 2단계(+24) · `## 텍스트` 줄은 accent 16 Bold 소제목(원본 포폴_7 "서비스 최적화") · 그 외 평문. 블록 폭: 사이드바 옆에 있는 동안 **720**, 사이드바 아래부터 **994**(x 105→1099).
- `{ "type":"image", "src":"a.png", "caption":"...", "width":660 }` : 폭 지정 없으면 994 (비율대로 높이, 최대 420 → 넘으면 높이 420 에 폭 축소), x=105 왼쪽 정렬. 캡션 14/17 ink 가운데, 이미지 아래 8.
- `{ "type":"images", "items":[{src,caption?},{...}], "gap":24 }` : 가로 나란히, 같은 높이(최대 220), 폭은 각 비율대로, 전체 994 안에 맞게 축소. 왼쪽 정렬.
- `{ "type":"code", "text":"..." }` : 13/18 monospace(Menlo 없으면 Roboto Mono/Source Code Pro), 배경 #f6f6f6, 패딩 12, 폭 994 또는 열 폭.
- 블록 사이 gap: section→section **23**, section↔image **25**, image→image 25.
- 사이드바 옆 배치 규칙: 블록을 위에서부터 넣다가 누적 높이가 사이드바 높이 이상이 되면 그다음 블록부터 폭 994. 이미지·images·code 블록은 항상 폭 994(사이드바 옆이면 사이드바와 겹치므로 사이드바 아래로 내려 배치: 즉 이미지가 사이드바 높이 안에서 나오면 그 이미지 top = 사이드바 바닥 + 25).

### 페이지 나눔
블록 단위. 블록이 A4 안쪽(1684−30)을 넘으면 그 블록부터 새 장으로, 새 장 맨 위에 **프로젝트 제목·부제·밑줄 재표시**(사이드바는 재표시 안 함). 한 블록이 한 장보다 크면 경고. 첫 블록부터 넘치면 프로젝트 전체를 새 장으로.

## 4. 콘텐츠 JSON 변경 (content.schema.json 갱신)
- `resume.sections: string[]` (위 5종), `resume.logo`, `resume.logoHeight?`, `resume.projects: ProjectItem[]`(표지 projects 와 같은 형식, 본문은 `bullets` 대신 2단계 불릿 포함 `body` 문자열 허용), `resume.skills: SkillGroup[]`.
- `portfolio.details[].projects[]`: `sections` 대신 `blocks` (위 타입). 하위 호환: `sections` 가 있으면 section 블록으로 변환, `image` 가 있으면 마지막에 image 블록.
- `theme.accent`, `theme.ink` 유지.
