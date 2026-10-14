# KB 이력서 디자인 시스템 스펙 (실측 기반)

파일: (원본 Figma 파일)  (fileKey `<fileKey>`)
기준 프레임(Page 1, 절대 건드리지 말 것): 이력서 `505:61`, 포폴 표지 `505:626`, 포폴 상세 `505:383`, 자기소개서 `505:799`
파일에는 현재 페이지가 "Page 1" 하나뿐이고, 컴포넌트/변수/텍스트 스타일이 0개다.

## 절대 규칙 (Worker 공통)
- 도구는 `mcp__plugin_figma_figma__use_figma` 만 쓴다. `get_metadata`, `get_screenshot`, `get_design_context`, `create_session` 은 월 호출 제한이 있으니 **절대 호출 금지**. 시각 확인은 use_figma 안에서 `await node.screenshot()` 로 한다(최대 3회).
- use_figma 호출 전 반드시 `Skill` 도구로 `figma:figma-use` 를 로드하고 규칙을 따른다. `skillNames: "figma-use"` 를 항상 넘긴다.
- 반환값은 20KB 제한. 큰 덤프는 쪼개라. 반환은 항상 생성/수정한 노드 ID 목록.
- 페이지 전환은 호출당 1회(`await figma.setCurrentPageAsync`). 호출 시작 시 항상 첫 페이지로 리셋된다.
- 폰트: **Noto Sans KR** (Regular / Bold / Light). Apple SD Gothic Neo 는 이 런타임에 없다. 텍스트 생성 전 `await figma.loadFontAsync({family:'Noto Sans KR', style:'Bold'})` 등 필요한 스타일을 모두 로드.
- 모든 컨테이너는 `figma.createAutoLayout()`. 절대좌표 배치 금지(페이지 최상위 노드 위치 제외).
- 간격/크기/색은 반드시 아래 변수에 바인딩한다(`setBoundVariable`, `setBoundVariableForPaint`). 텍스트는 텍스트 스타일을 적용한다(`setTextStyleIdAsync`).
- 기존 Page 1 노드는 읽기만 한다. 수정/이동/삭제 금지.
- 컴포넌트 `description` 에 용도와 사용법을 한국어로 한 줄 적는다.

## 페이지 구성
- `Design System` 페이지: 컴포넌트 전부. 섹션(Section 노드)으로 그룹: `1 Foundations`, `2 Atoms`, `3 Blocks`, `4 Page Parts`.
- `Templates` 페이지: 페이지 템플릿 4종 + KB 내용이 채워진 완성 예시.

## 변수 컬렉션 `KB Tokens` (모드 1개 "Default")
색 (scopes: 텍스트는 TEXT_FILL, 면은 FRAME_FILL/SHAPE_FILL, 선은 STROKE_COLOR)
- `color/ink` #101010 (본문·제목·굵은 구분선)
- `color/accent` #f9af00 (노란 점, 별표, 태그라인, 소제목)
- `color/rule-soft` #a4a4a4 (항목 헤더의 얇은 구분선)
- `color/paper` #ffffff
간격 (scope GAP; padding 도 같은 변수 사용)
- `space/page-x` 55, `space/page-top` 37, `space/page-bottom` 40
- `space/section` 36 (섹션 블록 사이)
- `space/section-head` 32 (섹션 헤더 밑줄 → 첫 항목)
- `space/item` 24 (이력서 Experience 항목 사이)
- `space/item-list` 16 (포폴 표지 프로젝트 목록 항목 사이)
- `space/item-head` 11 (항목 제목 → 본문)
- `space/para` 8 (About Me 단락 사이) / `space/para-letter` 20 (자소서 단락 사이)
- `space/indent` 14 (About Me 본문 들여쓰기) / `space/inner` 50 (포폴 상세·자소서 본문 들여쓰기)
- `space/inline` 7 (이름→태그라인, 연락처 구분선 좌우 등 작은 간격)
- `space/divider-l` 20, `space/divider-r` 16 (항목 제목 ↔ 얇은 구분선 ↔ 날짜)
- `space/detail-block` 27 (포폴 상세 본문 섹션 사이), `space/detail-side` 16 (사이드 라벨→값), `space/detail-side-group` 38 (사이드 그룹 사이), `space/tag-x` 40, `space/tag-y` 11, `space/image` 30 (본문→이미지), `space/project` 56 (상세 프로젝트 블록 사이), `space/summary` 30 (제목 밑줄→요약 헤드라인), `space/summary-sub` 7
크기 (scope WIDTH_HEIGHT)
- `size/page-w` 1190, `size/page-h` 1684, `size/content-w` 1080, `size/sidebar-w` 245, `size/detail-body-w` 720, `size/photo-circle` 168
- `size/rule-thick` 2, `size/rule-thin` 1, `size/rule-short` 27, `size/dot` 11, `size/sep-h` 14, `size/icon` 17
숫자 변수는 scope 를 명시할 것(기본 ALL_SCOPES 금지).

## 텍스트 스타일 (모두 Noto Sans KR, 색은 스타일에 안 들어가니 노드 fill 에 변수 바인딩)
이름 | 굵기 | 크기 | 행간(px) | 비고
- `KB/Name/Resume` Regular 71 / 83 (이력서·자소서 이름)
- `KB/Name/Cover` Regular 94 / 109 (포폴 표지 이름)
- `KB/Title/Page` Bold 50 / 59 (포폴 Profile·Project, 자소서 About Me, 포폴 상세 회사명)
- `KB/Title/Portfolio` Regular 41 / 49 ("Portfolio" 단어)
- `KB/Title/Section` Bold 32 / 38 (이력서 About Me·Experience·Education)
- `KB/Title/Project` Bold 30 / 36 (포폴 상세 프로젝트명)
- `KB/Title/Side` Bold 26 / 31 (포폴 상세 사이드 "기간"·"사용 기술")
- `KB/Title/Item` Bold 24 / 24 (이력서 Experience 항목명)
- `KB/Title/ItemSmall` Bold 20 / 24 (포폴 표지 프로젝트명·스킬 카테고리, 이력서 학교명)
- `KB/Tagline` Bold 24 / 29 (노란 한 줄 소개, 자소서 소제목)
- `KB/Headline` Bold 24 / 26 (포폴 상세 요약 헤드라인)
- `KB/Subtitle` Bold 14 / 22 (포폴 상세 프로젝트 옆 노란 한 줄 설명)
- `KB/Para/Heading` Bold 16 / 25 (이력서 About Me 소제목)
- `KB/Body/Resume` Regular 16 / 30 (이력서 Experience 본문)
- `KB/Body/About` Regular 16 / 28 (이력서 About Me 본문)
- `KB/Body/Default` Regular 16 / 22 (포폴 상세 본문, 표지 불릿)
- `KB/Body/Dense` Regular 16 / 21 (포폴 표지 스킬 설명, 우측 정렬)
- `KB/Body/Letter` Regular 20 / 30 (자소서 본문, 양쪽 정렬)
- `KB/Body/Bullet` Regular 16 / 25 (포폴 표지 프로젝트 불릿)
- `KB/Caption` Regular 16 / 19 (날짜, 연락처, 기술 스택, 링크, 별표 안내문)
- `KB/Label` Regular 19 / 22 (포폴 표지 연락처 라벨/값)
- `KB/Star` Regular 28 / 34 ("*" 별표)
- `KB/Edu/Dept` Light 20 / 30 (학과)
본문 안의 부분 굵게는 사용자가 Bold 로 range 지정하는 방식 유지(스타일은 Regular 기준).

## 컴포넌트 (Design System 페이지)
공통: 가로 폭은 상위 auto-layout 에서 FILL. 텍스트는 FIXED 폭 + `textAutoResize='HEIGHT'`(본문) 또는 HUG(제목·날짜).

### Atoms
- `Atom/Rule/Thick`: 높이 2(`size/rule-thick`), fill `color/ink`, 가로 FILL. (Rectangle 로 만들어 FILL 가능하게)
- `Atom/Rule/Thin`: 높이 1, fill `color/ink`.
- `Atom/Rule/Soft`: 높이 1, fill `color/rule-soft`.
- `Atom/Rule/Short`: 폭 27 × 높이 2, fill `color/ink` (포폴 표지 프로젝트 제목 옆 짧은 선).
- `Atom/Dot`: 11×11 Ellipse fill `color/accent`.
- `Atom/Star`: "*" `KB/Star` fill `color/accent`.
- `Atom/Separator`: 세로선 1×14 fill `color/ink` (연락처 구분).
- `Atom/Note`: 가로 [Star][text `KB/Caption`] gap `space/inline`, 하단 정렬. 텍스트 prop `text` 기본 "밑줄 쳐진 곳은 linking이 되어 있습니다."
- `Atom/Contact`: 가로 [email][sep][phone][sep][github][sep][blog] gap `space/inline`, `KB/Caption`, 가운데 정렬. 텍스트 prop 4개. github/blog 는 hyperlink 설정(값은 기본 https://github.com/your-github , https://example.com 로 두고 prop 으로 바꿀 수 있게 — hyperlink 자체는 prop 불가하니 그대로 둠).
- `Atom/LinkChip`: 가로 [icon 17×17 placeholder Rectangle fill `color/ink` 10% 대신 Ellipse 로 단순화 가능][text `KB/Caption` hyperlink] gap 4. 텍스트 prop.
- `Atom/Tag`: 텍스트 `KB/Caption` 하나(기술명). prop `label`.

### Blocks (이력서)
- `Block/Resume/Header`: 세로 [name `KB/Name/Resume`][tagline `KB/Tagline` accent] gap `space/inline`. props name, tagline.
- `Block/SectionHeader`: 세로 gap 0 → [row: title `KB/Title/Section` HUG | spacer FILL | right slot(인스턴스 `Atom/Note`, boolean prop `showRight`)] 하단 정렬, 그 아래 `Atom/Rule/Thick` FILL. props title, showRight. 폭 FILL.
- `Block/Resume/AboutPara`: 세로 [heading `KB/Para/Heading`][body `KB/Body/About`, 좌측 padding `space/indent`, FILL, HEIGHT] gap 0. props heading, body.
- `Block/Resume/ExperienceItem`: 세로 gap `space/item-head` → [row 가운데 정렬: title `KB/Title/Item` HUG | `Atom/Rule/Soft` FILL (좌 padding `space/divider-l`, 우 `space/divider-r` 는 row 의 itemSpacing 대신 Rule 양옆 래퍼 padding 으로) | date `KB/Caption` 우측 정렬 HUG][body `KB/Body/Resume` FILL HEIGHT]. props title, date, body. 제목에 hyperlink 가능.
- `Block/Resume/EducationItem`: 가로 gap `space/inline`, 하단 정렬 → [school `KB/Title/ItemSmall`][`Atom/Rule/Short` 폭 29][dept `KB/Edu/Dept`][gpa+date `KB/Caption` 좌 padding 7]. props school, dept, meta.

### Blocks (포트폴리오)
- `Block/PageTitle`: 세로 gap 0 → [row 하단정렬: title `KB/Title/Page` HUG | `Atom/Dot`(좌 padding `space/inline`, 세로 가운데) | spacer FILL | right slot `Atom/Note` boolean] 그 아래 `Atom/Rule/Thin` FILL. props title, showRight. (자소서 About Me, 포폴 Profile/Project, 포폴 상세 회사명 공용)
- `Block/Cover/Header`: 세로 → [name `KB/Name/Cover`][row: "Portfolio" `KB/Title/Portfolio` (좌 padding 11) | spacer | contact table] 그 아래 `Atom/Rule/Thin`. contact table = 세로 3행, 각 행 가로 [label `KB/Label` 우측정렬 폭 52 | 세로선 | value `KB/Label` hyperlink]. props name, email, github, blog.
- `Block/Cover/SkillGroup`: 세로 gap `space/inline` → [row 하단정렬: [세로: category `KB/Title/ItemSmall`, tools `KB/Caption`] HUG | `Atom/Rule/Thin` FILL 좌 padding 20][description `KB/Body/Dense` 우측 정렬 FILL HEIGHT]. props category, tools, description.
- `Block/Cover/ProjectItem`: 세로 gap `space/item-head` → [row 가운데정렬: title `KB/Title/ItemSmall` | `Atom/Rule/Short`(좌 padding 10) | tools `KB/Caption`(좌 padding 10) | `Atom/Rule/Soft` FILL(좌 padding `space/divider-l` 우 `space/divider-r`) | date `KB/Caption` 우측][row 상단정렬: bullets `KB/Body/Bullet` FILL HEIGHT | links 세로 HUG(`Atom/LinkChip` 인스턴스 2개, boolean 으로 2번째 숨김) gap 4, 우측 정렬]. props title, tools, date, bullets, link1, link2, showLink2.
- `Block/Detail/Section`: 세로 gap 0 → [heading `KB/Para/Heading` 16/22 Bold][body `KB/Body/Default` FILL HEIGHT]. props heading, body. (배경 및 문제 / 핵심 아이디어 / 임팩트)
- `Block/Detail/Side`: 세로 폭 `size/sidebar-w` 고정 → ["기간" `KB/Title/Side`][value `KB/Caption`] gap `space/detail-side`, 그룹 gap `space/detail-side-group`, ["사용 기술" `KB/Title/Side`][tags: 가로 wrap auto-layout(layoutWrap='WRAP') gap x `space/tag-x` y `space/tag-y`, `Atom/Tag` 인스턴스 4개, boolean 으로 숨김]. props period, tag1..tag4, showTag2..4.
- `Block/Detail/Project`: 세로 gap `space/section-head`(31) → [header 세로 gap 0: [row 하단정렬 gap 12: title `KB/Title/Project` | subtitle `KB/Subtitle` accent (하단 padding 6)] + `Atom/Rule/Thin` FILL][row 상단정렬 gap `space/detail-block`: left 세로(FILL, gap `space/detail-block`, `Block/Detail/Section` 인스턴스 3개 boolean 으로 숨김) | `Block/Detail/Side`][image slot: Rectangle 폭 FILL 높이 417, fill #f0f0f0, boolean `showImage`]. props title, subtitle, section heading/body ×3, showSection2/3, showImage, side props.
- `Block/Detail/Summary`: 세로 gap `space/summary-sub` → [headline `KB/Headline` FILL HEIGHT][sub `KB/Body/Default` FILL HEIGHT]. props headline, sub.

### Blocks (자기소개서)
- `Block/Letter/Header`: 가로 상단정렬 → [세로: name `KB/Name/Resume`, tagline `KB/Tagline` accent, (gap 7)] FILL | [photo: 168×171 Ellipse fill #d9d9d9 placeholder]. 그 아래 contact 행(`Atom/Contact` 우측 정렬) 과 `Atom/Rule/Thin`(0.5 대신 1) . props name, tagline.
- `Block/Letter/Paragraph`: 세로 gap 5 → [heading `KB/Tagline` accent][body `KB/Body/Letter` 양쪽정렬 FILL HEIGHT]. props heading, body.

## 페이지 템플릿 (Templates 페이지) — 전부 컴포넌트로 만들고 옆에 KB 내용이 채워진 인스턴스 1장씩
- 공통: 프레임 `size/page-w`×`size/page-h` FIXED, fill `color/paper`, 세로 auto-layout, padding 좌우 `space/page-x` 상 `space/page-top` 하 `space/page-bottom`, gap `space/section`, `clipsContent=false` (넘치면 아래로 삐져나와 눈에 보이게). primaryAxisSizingMode FIXED.
- `Template/Resume`: [Block/Resume/Header][Section: Block/SectionHeader("About Me", right=Contact) + 세로(gap `space/para`) AboutPara ×2][Section: SectionHeader("Experience", right=Note "자세한 내용은 Portfolio에 자세하게 작성되어 있습니다.") + 세로(gap `space/item`) ExperienceItem ×5][Section: SectionHeader("Education") + EducationItem]. 섹션 내부 헤더→목록 gap `space/section-head`.
- `Template/PortfolioCover`: [Cover/Header][Section: PageTitle("Profile") + row(왼쪽 들여 38, gap 32): 사진 자리 Rectangle 374×499(x=93) fill #d9d9d9 | 세로(gap 9, 위 10) SkillGroup ×4(x=499)][Section: PageTitle("Project", right=Note) + 세로(gap `space/item-list`) ProjectItem ×6].
- `Template/PortfolioDetail`: [PageTitle(회사명, right=Note)][세로 좌 padding `space/inner` gap `space/project`: Detail/Summary, Detail/Project ×2].
- `Template/CoverLetter`: [Letter/Header][PageTitle("About Me")][세로 좌 padding `space/inner` 우 padding 50 gap `space/para-letter`: Letter/Paragraph ×4].
- 완성 예시: 각 템플릿 인스턴스에 기준 프레임(505:61 / 505:626 / 505:383 / 505:799)의 실제 텍스트를 use_figma 로 읽어 채운다. 본문의 굵게 구간은 `getStyledTextSegments(['fontName'])` 로 읽어 새 노드에 `setRangeFontName` 으로 Bold 재적용(Noto Sans KR Bold).

## 실측 참고 (원본 좌표, 페이지 기준)
이력서 505:61: 이름(55,37) 71px h83 / 태그라인(55,127) 22 Bold #ffbc00(→accent 로 통일) / 연락처 행 (791..1133, 216) / About Me 제목(52,205) 32 Bold, 밑줄 2px y243 폭 1081 / 첫 단락 제목 y270, 본문 x67 폭 1066 lh28 / 단락 gap 8 / Experience 제목 y700 밑줄 y738 첫 항목 y774 / 항목: 제목 24 Bold, 얇은선 #a4a4a4 y+13, 날짜 16 우측정렬 x~982 폭 151, 본문 y+35 lh30, 항목 gap 23~24 / 섹션 gap 36 / Education 학교 20 Bold, 짧은선 29px, 학과 20 Light, "4.1 / 4.5   2023. 02.~ 2026. 02." 16
포폴 표지 505:626: 이름 94 (55,74) / "Portfolio" 41 (66,215) / 연락처 표 라벨 19 우측정렬 x878..930, 세로선 x934, 값 x943 / 밑줄 0.67 y266 / Profile 50 Bold (55,292) 점 (212,325) 밑줄 1px y372 / 스킬그룹 x499 폭 638, 카테고리 20 Bold, 툴 16, 선 1px, 설명 16 lh21 우측정렬, 그룹 gap 9 / Project 50 Bold (55,937) / 프로젝트 항목 x90 폭 1045: 제목 20 Bold, 짧은선 27×2, 툴 16, 얇은선, 날짜 16 우측; 불릿 16 lh25 y+35; 링크 우측 x~1046 아이콘 17 + 텍스트 16; 항목 gap 16
포폴 상세 505:383: 회사명 49.5 Bold (55,66) 점 (330,99) 밑줄 1px y141~144 / 별표 안내 (873,105) / 헤드라인 24 Bold lh26 (102,174) 폭 900 / 서브 16 lh22 (102,235) 폭 680 / 프로젝트 제목 30 Bold (102,306), 서브타이틀 14 Bold accent (400,318), 밑줄 1px y342 / 본문 x105 폭 ~720 y373, 섹션 lh22, 섹션 gap 27 / 사이드 x884 폭 245: "기간" 25.5 Bold y382, 값 y429, "사용 기술" y486, 태그 y527 가로 gap ~40 세로 ~11 / 이미지 (105,902) 980×417 / 다음 프로젝트 y1375
자소서 505:799: 이름 71 (55,55) / 태그라인 24 Bold accent (55,145) / 증명사진 원 168×171 (991,65) / 연락처 (660..1002, 217) / 얇은선 y249 / About Me 49.5 Bold (55,279) 점 (283,312) 밑줄 y345 / 단락 x110 폭 930~1021: 소제목 24 Bold accent, 본문 20 lh30 양쪽정렬 y+34, 단락 gap 20
