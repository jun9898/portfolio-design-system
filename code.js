'use strict';

// =====================================================================
// KB Resume System — Figma development plugin (plain JS, no build step)
// Contract: docs/SPEC.md. Everything is found by NAME and created only
// when missing, so every step can be re-run safely.
// =====================================================================

// ---------------------------------------------------------------------
// Spec constants
// ---------------------------------------------------------------------
const PAGE_DS = 'Design System';
const PAGE_TPL = 'Templates';
const PROTECTED_PAGE = 'Page 1';
const COLLECTION = 'KB Tokens';
const MODE_NAME = 'Default';

const SECTIONS = [
  ['1 Foundations', 0],
  ['2 Atoms', 2600],
  ['3 Blocks', 5200],
  ['4 Page Parts', 7800],
];
const SECTION_W = 2400;
const SECTION_H = 1600;

const COLOR_VARS = [
  ['color/ink', '#101010', ['TEXT_FILL', 'FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR']],
  ['color/accent', '#f9af00', ['TEXT_FILL', 'FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR']],
  ['color/rule-soft', '#a4a4a4', ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR']],
  ['color/paper', '#ffffff', ['FRAME_FILL', 'SHAPE_FILL']],
];

const SPACE_VARS = [
  ['space/page-x', 55], ['space/page-top', 37], ['space/page-bottom', 30],
  ['space/section', 36], ['space/section-head', 32], ['space/item', 24],
  ['space/item-list', 16], ['space/item-head', 11], ['space/para', 8],
  ['space/para-letter', 20], ['space/indent', 14], ['space/inner', 50],
  ['space/inline', 7], ['space/divider-l', 20], ['space/divider-r', 16],
  ['space/detail-block', 27], ['space/detail-side', 16], ['space/detail-side-group', 38],
  ['space/tag-x', 40], ['space/tag-y', 11], ['space/image', 30],
  ['space/project', 56], ['space/summary', 30], ['space/summary-sub', 7],
];

const SIZE_VARS = [
  ['size/page-w', 1190], ['size/page-h', 1684], ['size/content-w', 1080],
  ['size/sidebar-w', 245], ['size/detail-body-w', 720], ['size/photo-circle', 168],
  ['size/rule-thick', 2], ['size/rule-thin', 1], ['size/rule-short', 27],
  ['size/dot', 11], ['size/sep-h', 14], ['size/icon', 17],
];

// [name, weight, fontSize, lineHeight(px)]
const TEXT_STYLES = [
  ['KB/Name/Resume', 'Regular', 71, 83],
  ['KB/Name/Cover', 'Regular', 94, 109],
  ['KB/Title/Page', 'Bold', 50, 59],
  ['KB/Title/Portfolio', 'Regular', 41, 49],
  ['KB/Title/Section', 'Bold', 32, 38],
  ['KB/Title/Project', 'Bold', 30, 36],
  ['KB/Title/Side', 'Bold', 26, 31],
  ['KB/Title/Item', 'Bold', 24, 24],
  ['KB/Title/ItemSmall', 'Bold', 20, 24],
  ['KB/Tagline', 'Bold', 24, 29],
  ['KB/Tagline/Resume', 'Bold', 22, 26],
  ['KB/Headline', 'Bold', 24, 26],
  ['KB/Subtitle', 'Bold', 14, 22],
  ['KB/Para/Heading', 'Bold', 16, 25],
  ['KB/Body/Resume', 'Regular', 16, 30],
  ['KB/Body/About', 'Regular', 16, 28],
  ['KB/Body/Default', 'Regular', 16, 22],
  ['KB/Body/Dense', 'Regular', 16, 21],
  ['KB/Body/Letter', 'Regular', 20, 30],
  ['KB/Body/Bullet', 'Regular', 16, 25],
  ['KB/Caption', 'Regular', 16, 19],
  ['KB/Label', 'Regular', 19, 22],
  ['KB/Star', 'Regular', 28, 34],
  ['KB/Edu/Dept', 'Light', 20, 30],
  ['KB/Title/SkillResume', 'Bold', 20, 29],
  ['KB/Detail/Heading', 'Bold', 16, 22],
  ['KB/Caption/Image', 'Regular', 14, 17],
  ['KB/Code', 'Regular', 13, 18],
];
const CODE_STYLE = 'KB/Code';
const MONO_FAMILIES = ['Menlo', 'Roboto Mono', 'Source Code Pro'];

const FAMILIES = ['Apple SD Gothic Neo', 'Noto Sans KR'];
const FALLBACK_FAMILY = 'Noto Sans KR';
const DEFAULT_NOTE = '밑줄 쳐진 곳은 linking이 되어 있습니다.';

const PAGE_W = 1190;
const PAGE_H = 1684;
const TEMPLATE_GAP = 200;
const FILLED_GAP = 100;
const FILLED_Y = PAGE_H + 300;

const TEMPLATES = {
  resume: 'Template/Resume',
  portfolioCover: 'Template/PortfolioCover',
  portfolioDetail: 'Template/PortfolioDetail',
  coverLetter: 'Template/CoverLetter',
};
const TEMPLATE_ORDER = ['resume', 'portfolioCover', 'portfolioDetail', 'coverLetter'];

const COVER_PROFILE = { inset: 38, photoW: 374, photoH: 499, gap: 32, skillsTop: 10 };
const PAGE_TOP = { resume: 37, coverLetter: 55, portfolioDetail: 66, portfolioCover: 74 };
const PAGE_BOTTOM = 30;
const FILLED_STEP = PAGE_W + FILLED_GAP;
const VRULE_X = 66;
const VRULE_END = 1645;
const VRULE_GAP_BEFORE_TITLE = 20;
const VRULE_MIN = 40;
const RESUME_HEADER_PB = 44;
const RESUME_CONT_TOP = 44;
const RESUME_CONTACT = { right: 1133, y: 214 };
const RESUME_LOGO = { y: 55, h: 60, maxW: 270, gap: 20, defaultX: 259, defaultW: 84 };
const RESUME_SECTION_KEYS = ['education', 'about', 'experience', 'project', 'skill'];
const RESUME_SECTION_TITLE = { education: 'Education', about: 'About Me', experience: 'Experience', project: 'Project', skill: 'Skill' };
// Resume column (kb-preview): section title + rule 52 → 1133; item columns per section.
const RESUME_PAGE_X = { left: 52, right: 57 };
const RESUME_HEADER_INSET = 3;
// SPEC2 gaps are measured from the rule TOP (item top = title top + 38 + g); the 2px rule
// sits between, so the frame spacing is g − 2. Education rows are 24 high with the
// department 3 above the school: the item frame starts 3 higher (27 high), so g − 2 − 3.
const RESUME_SECTION_GAP = { education: 15, about: 25, experience: 34, project: 37, skill: 34 };
const RESUME_LIST_GAP = { education: 21, about: 9, experience: 24, project: 20, skill: 12 };
const RESUME_LIST_PAD = { education: { pl: 3 }, about: { pl: 3 }, experience: { pl: 3 }, project: { pr: 1 }, skill: { pl: 4 } };
const RESUME_ITEM_FIXED_W = { skill: 1081 };
const RESUME_NOTE_KEY = { education: 'educationNote', about: 'note', experience: 'experienceNote', project: 'projectsNote', skill: 'skillsNote' };
const RESUME_PROJECT_NOTE = '프로젝트에 관한 자세한 설명은 포트폴리오에 작성돼 있습니다.';
const TOOL_SLOTS = 10;
const PROJECT_LINKS_W = 97;
const SIDE_LINK_SLOTS = 3;
const SIDE_TAG_SLOTS = 8;
const RICH_BULLETS = { indent1: 10, indent2: 34, hang: 16 };
const PROJECT_BULLET_X = 13;
const DETAIL_IMAGE_UNKNOWN_H = 417;
const DETAIL = {
  listPl: 47, contTop: 64, headGap: 29, summaryGap: 9, headlineW: 728, dotGap: 9,
  firstProject: 19, projectGap: 56, ruleInset: 3, contentPt: 30, besideW: 720, sideGap: 59, fullW: 994,
  gapSection: 23, gapImage: 25, imageMaxH: 420, imagesMaxH: 220, imagesGap: 24, captionGap: 8, codePad: 12,
  vruleOffset: 16, vruleFirstEnd: 1652, vruleContEnd: 1645, columnW: 1030, contTitleInset: 3,
};
const THEME_VARS = { accent: 'color/accent', ink: 'color/ink' };

// Structural version per component. A component whose stored version is lower
// is archived (renamed) and rebuilt, so new layout rules reach existing files.
const PLUGIN_DATA_VERSION = 'kbv';
const COMP_VERSIONS = {
  'Atom/Rule/Short': 2,
  'Block/SectionHeader': 2,
  'Block/Resume/Header': 2,
  'Block/Resume/AboutPara': 3,
  'Block/Resume/EducationItem': 3,
  'Block/Resume/SkillGroup': 2,
  'Block/PageTitle': 3,
  'Block/Letter/Header': 2,
  'Block/Cover/Header': 2,
  'Block/Cover/SkillGroup': 2,
  'Block/Cover/ProjectItem': 3,
  'Block/Detail/Side': 4,
  'Block/Detail/Summary': 2,
  'Block/Detail/ProjectHead': 1,
  'Template/Resume': 8,
  'Template/PortfolioCover': 5,
  'Template/PortfolioDetail': 4,
  'Template/CoverLetter': 3,
};

// ---------------------------------------------------------------------
// Logging + per-run state
// ---------------------------------------------------------------------
let S = null;

function newState(step, family) {
  return {
    step,
    family: FAMILIES.includes(family) ? family : FAMILIES[0],
    vars: new Map(),
    collection: null,
    styles: new Map(),
    comps: new Map(),
    pending: null,
    failures: 0,
  };
}

function post(level, msg) {
  figma.ui.postMessage({ type: 'log', level, msg: String(msg) });
}
const info = (m) => post('info', m);
const ok = (m) => post('ok', m);
const warn = (m) => post('warn', m);
const fail = (m) => post('error', m);

function errText(e) {
  if (!e) return 'unknown error';
  const msg = e.message || String(e);
  const stack = e.stack ? '\n' + String(e.stack).split('\n').slice(0, 6).join('\n') : '';
  return msg + stack;
}

// ---------------------------------------------------------------------
// lib: fonts
// ---------------------------------------------------------------------
const fontLoads = new Map();
const fontWarned = new Set();
let availableFonts = null;

function fontKey(f) {
  return f.family + '|' + f.style;
}

async function loadFont(f) {
  const k = fontKey(f);
  if (!fontLoads.has(k)) fontLoads.set(k, figma.loadFontAsync({ family: f.family, style: f.style }));
  try {
    await fontLoads.get(k);
  } catch (e) {
    fontLoads.delete(k);
    throw new Error(`폰트 로드 실패: ${f.family} ${f.style} — ${e && e.message ? e.message : e}`);
  }
}

async function tryLoadFont(f) {
  try {
    await loadFont(f);
    return true;
  } catch (e) {
    return false;
  }
}

async function isFontAvailable(f) {
  if (!availableFonts) {
    const list = await figma.listAvailableFontsAsync();
    availableFonts = new Set(list.map((x) => fontKey(x.fontName)));
  }
  return availableFonts.has(fontKey(f));
}

// Returns a loaded FontName for (family, style), falling back gracefully.
async function resolveFont(family, style) {
  const candidates = [
    { family, style },
    { family, style: 'Regular' },
    { family: FALLBACK_FAMILY, style },
    { family: FALLBACK_FAMILY, style: 'Regular' },
    { family: 'Inter', style: 'Regular' },
  ];
  for (const c of candidates) {
    if (!(await isFontAvailable(c))) continue;
    if (!(await tryLoadFont(c))) continue;
    if (c.family !== family || c.style !== style) {
      const k = fontKey({ family, style });
      if (!fontWarned.has(k)) {
        fontWarned.add(k);
        warn(`폰트 대체: ${family} ${style} 를 쓸 수 없어 ${c.family} ${c.style} 사용`);
      }
    }
    return c;
  }
  throw new Error(`사용 가능한 폰트가 없습니다: ${family} ${style}`);
}

let monoWarned = false;

// Monospace for KB/Code: first available of MONO_FAMILIES, else the selected family Regular.
async function resolveMono(family) {
  for (const fam of MONO_FAMILIES) {
    const f = { family: fam, style: 'Regular' };
    if ((await isFontAvailable(f)) && (await tryLoadFont(f))) return f;
  }
  const f = await resolveFont(family, 'Regular');
  if (!monoWarned) {
    monoWarned = true;
    warn(`코드 폰트(${MONO_FAMILIES.join(', ')})를 쓸 수 없어 ${f.family} ${f.style} 로 대체합니다.`);
  }
  return f;
}

function styleFont(name, family, weight) {
  return name === CODE_STYLE ? resolveMono(family) : resolveFont(family, weight);
}

// Loads every font the KB text styles use, plus Inter (default for createText).
async function preloadStyleFonts() {
  await tryLoadFont({ family: 'Inter', style: 'Regular' });
  const families = new Set();
  for (const st of S.styles.values()) {
    families.add(st.fontName.family);
    const okLoad = await tryLoadFont(st.fontName);
    if (!okLoad) warn(`텍스트 스타일 "${st.name}" 의 폰트 ${st.fontName.family} ${st.fontName.style} 를 불러오지 못했습니다. 1단계에서 폰트를 다시 적용하세요.`);
  }
  for (const fam of families) await tryLoadFont({ family: fam, style: 'Bold' });
}

async function loadNodeFonts(node) {
  if (node.fontName !== figma.mixed) {
    await loadFont(node.fontName);
    return;
  }
  const segs = node.getStyledTextSegments(['fontName']);
  for (const s of segs) await loadFont(s.fontName);
}

function familyOf(node) {
  if (node.fontName !== figma.mixed) return node.fontName.family;
  return node.getRangeFontName(0, 1).family;
}

// ---------------------------------------------------------------------
// lib: pages, variables, styles, components
// ---------------------------------------------------------------------
function findPage(name) {
  return figma.root.children.find((p) => p.name === name) || null;
}

async function ensurePage(name) {
  let p = findPage(name);
  if (p) {
    info(`페이지 "${name}" exists → skipped`);
  } else {
    p = figma.createPage();
    p.name = name;
    ok(`페이지 "${name}" created`);
  }
  await p.loadAsync();
  return p;
}

async function requirePage(name) {
  const p = findPage(name);
  if (!p) throw new Error(`페이지 "${name}" 가 없습니다. 1단계 Foundations 를 먼저 실행하세요.`);
  await p.loadAsync();
  return p;
}

async function loadVars() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  S.collection = cols.find((c) => c.name === COLLECTION) || null;
  S.vars = new Map();
  if (!S.collection) return;
  const all = await figma.variables.getLocalVariablesAsync();
  for (const v of all) {
    if (v.variableCollectionId === S.collection.id) S.vars.set(v.name, v);
  }
}

function getVar(name) {
  const v = S.vars.get(name);
  if (!v) throw new Error(`변수 "${name}" 가 없습니다. 1단계 Foundations 를 먼저 실행하세요.`);
  return v;
}

async function loadStyles() {
  const styles = await figma.getLocalTextStylesAsync();
  S.styles = new Map();
  for (const s of styles) if (!S.styles.has(s.name)) S.styles.set(s.name, s);
}

function getStyle(name) {
  const s = S.styles.get(name);
  if (!s) throw new Error(`텍스트 스타일 "${name}" 가 없습니다. 1단계 Foundations 를 먼저 실행하세요.`);
  return s;
}

async function indexComponents() {
  S.comps = new Map();
  for (const pname of [PAGE_DS, PAGE_TPL]) {
    const p = findPage(pname);
    if (!p) continue;
    await p.loadAsync();
    const list = p.findAllWithCriteria({ types: ['COMPONENT'] });
    for (const c of list) {
      if (S.comps.has(c.name)) warn(`컴포넌트 이름 중복: "${c.name}" — 첫 번째 것을 사용합니다.`);
      else S.comps.set(c.name, c);
    }
  }
}

function findComponent(name) {
  return S.comps.get(name) || null;
}

function instanceOf(name, layerName) {
  const c = findComponent(name);
  if (!c) throw new Error(`컴포넌트 "${name}" 가 없습니다. 앞 단계(Atoms/Blocks/Templates)를 먼저 실행하세요.`);
  const i = c.createInstance();
  if (layerName) i.name = layerName;
  return i;
}

async function prepare({ needStyles = true, needVars = true, needComps = true } = {}) {
  if (needVars) await loadVars();
  if (needStyles) {
    await loadStyles();
    await preloadStyleFonts();
  }
  if (needComps) await indexComponents();
}

// ---------------------------------------------------------------------
// lib: binding + node factories
// ---------------------------------------------------------------------
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

// value: number (raw) or variable name (bound)
function bindGap(node, prop, value) {
  if (value == null) return;
  if (typeof value === 'number') {
    node[prop] = value;
    return;
  }
  node.setBoundVariable(prop, getVar(value));
}

function bindFill(node, varName) {
  const base = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } };
  node.fills = [figma.variables.setBoundVariableForPaint(base, 'color', getVar(varName))];
}

function solidFill(node, hex) {
  node.fills = [{ type: 'SOLID', color: hexToRgb(hex) }];
}

function applyPadding(f, o) {
  if (o.px != null) { bindGap(f, 'paddingLeft', o.px); bindGap(f, 'paddingRight', o.px); }
  if (o.py != null) { bindGap(f, 'paddingTop', o.py); bindGap(f, 'paddingBottom', o.py); }
  if (o.pl != null) bindGap(f, 'paddingLeft', o.pl);
  if (o.pr != null) bindGap(f, 'paddingRight', o.pr);
  if (o.pt != null) bindGap(f, 'paddingTop', o.pt);
  if (o.pb != null) bindGap(f, 'paddingBottom', o.pb);
}

function applyLayout(f, dir, o) {
  f.layoutMode = dir;
  if (o.gap != null) bindGap(f, 'itemSpacing', o.gap);
  applyPadding(f, o);
  f.primaryAxisAlignItems = o.main || 'MIN';
  f.counterAxisAlignItems = o.cross || 'MIN';
  if (o.wrap) {
    f.layoutWrap = 'WRAP';
    if (o.gapY != null) bindGap(f, 'counterAxisSpacing', o.gapY);
  }
}

// Auto-layout frame factory. o: {name, gap, pl/pr/pt/pb/px/py, main, cross, wrap, gapY}
function al(dir, o = {}) {
  const f = figma.createFrame();
  f.name = o.name || (dir === 'HORIZONTAL' ? 'row' : 'col');
  f.fills = [];
  f.clipsContent = false;
  applyLayout(f, dir, o);
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  return f;
}

// Append + sizing (sizing only after the node has an auto-layout parent).
function put(parent, child, o = {}) {
  parent.appendChild(child);
  if (o.w) child.layoutSizingHorizontal = o.w;
  if (o.h) child.layoutSizingVertical = o.h;
  return child;
}

function spacer(parent) {
  const s = figma.createFrame();
  s.name = 'spacer';
  s.fills = [];
  s.resize(10, 1);
  parent.appendChild(s);
  s.layoutSizingHorizontal = 'FILL';
  return s;
}

function addInst(parent, compName, o = {}) {
  const i = instanceOf(compName, o.name);
  parent.appendChild(i);
  if (o.w) i.layoutSizingHorizontal = o.w;
  return i;
}

function setLink(node, start, end, url) {
  if (!url || end <= start) return;
  node.setRangeHyperlink(start, end, { type: 'URL', value: url });
  node.setRangeTextDecoration(start, end, 'UNDERLINE');
}

// Text factory. o: {name, style, fill, chars, align, size:'HUG'|'FILL'|number, parent, link}
async function text(o) {
  const st = getStyle(o.style);
  await loadFont(st.fontName);
  const t = figma.createText();
  t.name = o.name;
  await t.setTextStyleIdAsync(st.id);
  t.characters = o.chars == null ? '' : String(o.chars);
  bindFill(t, o.fill || 'color/ink');
  if (o.align) t.textAlignHorizontal = o.align;
  if (o.parent) o.parent.appendChild(t);
  if (o.size === 'FILL') {
    t.textAutoResize = 'HEIGHT';
    t.resize(Math.max(40, o.width || 400), Math.max(1, t.height));
    if (o.parent) t.layoutSizingHorizontal = 'FILL';
  } else if (typeof o.size === 'number') {
    t.textAutoResize = 'HEIGHT';
    t.resize(o.size, Math.max(1, t.height));
  } else {
    t.textAutoResize = 'WIDTH_AND_HEIGHT';
  }
  if (o.link) setLink(t, 0, t.characters.length, o.link);
  return t;
}

// Component factory. o: {width, widthVar, gap, padding..., main, cross, desc}
function comp(name, dir, o = {}) {
  const c = figma.createComponent();
  S.pending = c;
  c.name = name;
  c.fills = [];
  c.clipsContent = false;
  if (o.width) c.resize(o.width, 100);
  applyLayout(c, dir, o);
  c.layoutSizingHorizontal = o.width ? 'FIXED' : 'HUG';
  c.layoutSizingVertical = 'HUG';
  if (o.widthVar) c.setBoundVariable('width', getVar(o.widthVar));
  if (o.desc) c.description = o.desc;
  return c;
}

function textProp(c, node, name) {
  const key = c.addComponentProperty(name, 'TEXT', node.characters);
  node.componentPropertyReferences = Object.assign({}, node.componentPropertyReferences || {}, { characters: key });
  return key;
}

function boolProp(c, node, name, def = true) {
  node.visible = !!def;
  const key = c.addComponentProperty(name, 'BOOLEAN', def);
  node.componentPropertyReferences = Object.assign({}, node.componentPropertyReferences || {}, { visible: key });
  return key;
}

function expose(instance) {
  try {
    instance.isExposedInstance = true;
  } catch (e) {
    warn(`"${instance.name}" 를 exposed instance 로 설정하지 못했습니다: ${e.message || e}`);
  }
}

// ---------------------------------------------------------------------
// lib: instance property + text access
// ---------------------------------------------------------------------
function propKey(instance, prefix, type) {
  const props = instance.componentProperties || {};
  return Object.keys(props).find((k) => k.split('#')[0] === prefix && (!type || props[k].type === type)) || null;
}

async function setTextProp(instance, prefix, value) {
  const key = propKey(instance, prefix, 'TEXT');
  if (key) {
    const node = textNodeFor(instance, prefix);
    if (node) await loadNodeFonts(node);
    instance.setProperties({ [key]: String(value) });
    return true;
  }
  const node = textNodeFor(instance, prefix);
  if (node) {
    await writeText(node, value, { rich: false });
    return true;
  }
  warn(`"${instance.name}" 에 텍스트 속성 "${prefix}" 가 없습니다.`);
  return false;
}

function setBoolProp(instance, prefix, value) {
  const key = propKey(instance, prefix, 'BOOLEAN');
  if (!key) {
    warn(`"${instance.name}" 에 boolean 속성 "${prefix}" 가 없습니다.`);
    return false;
  }
  instance.setProperties({ [key]: !!value });
  return true;
}

// Walk descendants; do not descend into nested instances unless deep=true.
function walk(root, visit, deep) {
  const stack = 'children' in root ? root.children.slice().reverse() : [];
  while (stack.length) {
    const n = stack.pop();
    if (visit(n) === true) return n;
    if ('children' in n && (deep || n.type !== 'INSTANCE')) {
      for (let i = n.children.length - 1; i >= 0; i--) stack.push(n.children[i]);
    }
  }
  return null;
}

function textNodeFor(container, prop) {
  const texts = [];
  walk(container, (n) => {
    if (n.type === 'TEXT') texts.push(n);
  });
  if (container.type === 'INSTANCE') {
    const key = propKey(container, prop, 'TEXT');
    if (key) {
      const byRef = texts.find((t) => t.componentPropertyReferences && t.componentPropertyReferences.characters === key);
      if (byRef) return byRef;
    }
  }
  return texts.find((t) => t.name === prop) || null;
}

function findNode(container, name, type) {
  return walk(container, (n) => n.name === name && (!type || n.type === type));
}

function need(container, name, type) {
  const n = findNode(container, name, type);
  if (!n) throw new Error(`"${container.name}" 안에서 "${name}"${type ? ' (' + type + ')' : ''} 을(를) 찾지 못했습니다. 템플릿 구조가 바뀌었는지 확인하세요.`);
  return n;
}

function needPath(container, path) {
  let cur = container;
  for (const name of path) cur = need(cur, name);
  return cur;
}

function findInst(container, name) {
  return findNode(container, name, 'INSTANCE');
}

async function findInstByComp(container, compName) {
  const insts = [];
  walk(container, (n) => {
    if (n.type === 'INSTANCE') insts.push(n);
  }, true);
  for (const i of insts) {
    const mc = await i.getMainComponentAsync();
    if (mc && mc.name === compName) return i;
  }
  return null;
}

// ---------------------------------------------------------------------
// lib: rich text (**bold**, [label](url), \n)
// ---------------------------------------------------------------------
function parseRich(md) {
  const src = String(md == null ? '' : md);
  const markerCount = (src.match(/\*\*/g) || []).length;
  let usableMarkers = markerCount % 2 === 0 ? markerCount : markerCount - 1;
  let out = '';
  let bold = false;
  let boldStart = 0;
  const bolds = [];
  const links = [];
  let i = 0;
  while (i < src.length) {
    if (usableMarkers > 0 && src.startsWith('**', i)) {
      usableMarkers--;
      if (!bold) {
        bold = true;
        boldStart = out.length;
      } else {
        bold = false;
        if (out.length > boldStart) bolds.push([boldStart, out.length]);
      }
      i += 2;
      continue;
    }
    if (src[i] === '[') {
      const m = /^\[([^\]]*)\]\(([^)\s]+)\)/.exec(src.slice(i));
      if (m) {
        const inner = parseRich(m[1]);
        const start = out.length;
        out += inner.text;
        for (const [s, e] of inner.bolds) bolds.push([start + s, start + e]);
        if (inner.text.length) links.push([start, start + inner.text.length, m[2]]);
        i += m[0].length;
        continue;
      }
    }
    out += src[i];
    i++;
  }
  if (bold && out.length > boldStart) bolds.push([boldStart, out.length]);
  return { text: out, bolds, links };
}

// o: {rich=true, link}
async function writeText(node, value, o = {}) {
  const rich = o.rich !== false;
  await loadNodeFonts(node);
  const parsed = rich ? parseRich(value) : { text: String(value == null ? '' : value), bolds: [], links: [] };
  const needsBold = parsed.bolds.length > 0;
  let boldFont = null;
  if (needsBold) boldFont = await resolveFont(familyOf(node), 'Bold');
  node.characters = parsed.text;
  const len = parsed.text.length;
  if (!len) return node;
  for (const [s, e] of parsed.bolds) node.setRangeFontName(s, e, boldFont);
  for (const [s, e, url] of parsed.links) setLink(node, s, e, url);
  if (o.link) setLink(node, 0, len, o.link);
  return node;
}

async function richText(node, markdown) {
  return writeText(node, markdown, { rich: true });
}

// Fill one text slot of a block instance (by property name, then layer name).
async function fillText(container, prop, value, o = {}) {
  const node = textNodeFor(container, prop);
  if (!node) {
    warn(`"${container.name}" 에서 텍스트 "${prop}" 를 찾지 못해 건너뜁니다.`);
    return null;
  }
  return writeText(node, value, o);
}

// ---------------------------------------------------------------------
// Step runner
// ---------------------------------------------------------------------
async function runStep(step, family, fn) {
  S = newState(step, family);
  info(`▶ ${step} 시작`);
  try {
    await fn();
    if (S.failures) {
      fail(`✖ ${step}: ${S.failures}개 항목 실패 (위 로그 참고)`);
    } else {
      ok(`✔ ${step} 완료`);
    }
  } catch (e) {
    fail(`✖ ${step} 실패: ${errText(e)}`);
  } finally {
    figma.ui.postMessage({ type: 'done', step });
  }
}

function compVersion(c) {
  let v = 0;
  try { v = parseInt(c.getPluginData(PLUGIN_DATA_VERSION), 10); } catch (e) { v = 0; }
  return v > 0 ? v : 1;
}

// Build a component only if no up-to-date component with that name exists.
// An older version is renamed "<name> (구버전 vN)" and kept; archive(node) may move it aside.
async function ensureComp(name, build, place, archive) {
  const want = COMP_VERSIONS[name] || 1;
  const existing = findComponent(name);
  if (existing) {
    const have = compVersion(existing);
    if (have >= want) {
      info(`${name} exists → skipped`);
      return existing;
    }
    existing.name = `${name} (구버전 v${have})`;
    S.comps.delete(name);
    S.comps.set(existing.name, existing);
    if (archive) {
      try { archive(existing); } catch (e) { /* keep in place */ }
    }
    warn(`${name}: 구버전(v${have}) → 이름을 "${existing.name}" 로 바꿔 보관하고 v${want} 를 새로 만듭니다.`);
  }
  S.pending = null;
  try {
    const c = await build();
    c.name = name;
    c.setPluginData(PLUGIN_DATA_VERSION, String(want));
    S.comps.set(name, c);
    place(c);
    ok(`${name} created (v${want})`);
    return c;
  } catch (e) {
    S.failures++;
    if (S.pending && !S.pending.removed) {
      try { S.pending.remove(); } catch (_) { /* ignore */ }
    }
    fail(`${name} 생성 실패: ${errText(e)}`);
    return null;
  } finally {
    S.pending = null;
  }
}

// Column placer inside a section: keeps a running y per column.
function makePlacer(section, columns) {
  const ys = columns.map(() => 80);
  for (const ch of section.children) {
    let idx = 0;
    for (let i = 0; i < columns.length; i++) if (ch.x >= columns[i] - 40) idx = i;
    ys[idx] = Math.max(ys[idx], ch.y + ch.height + 60);
  }
  const placer = (col) => (node) => {
    section.appendChild(node);
    node.x = columns[col];
    node.y = ys[col];
    ys[col] += node.height + 60;
  };
  placer.fit = () => {
    let maxB = 0;
    let maxR = 0;
    for (const ch of section.children) {
      maxB = Math.max(maxB, ch.y + ch.height);
      maxR = Math.max(maxR, ch.x + ch.width);
    }
    const w = Math.max(SECTION_W, maxR + 80);
    const h = Math.max(SECTION_H, maxB + 80);
    if (w !== section.width || h !== section.height) section.resizeWithoutConstraints(w, h);
  };
  return placer;
}

function findSection(page, name) {
  return page.children.find((n) => n.type === 'SECTION' && n.name === name) || null;
}

function requireSection(page, name) {
  const s = findSection(page, name);
  if (!s) throw new Error(`섹션 "${name}" 가 없습니다. 1단계 Foundations 를 먼저 실행하세요.`);
  return s;
}

// =====================================================================
// Step 1. ensureFoundations
// =====================================================================
async function ensureFoundations() {
  const ds = await ensurePage(PAGE_DS);
  await ensurePage(PAGE_TPL);

  await figma.setCurrentPageAsync(ds);
  for (const [name, x] of SECTIONS) {
    if (findSection(ds, name)) {
      info(`섹션 "${name}" exists → skipped`);
      continue;
    }
    const s = figma.createSection();
    ds.appendChild(s);
    s.name = name;
    s.x = x;
    s.y = 0;
    s.resizeWithoutConstraints(SECTION_W, SECTION_H);
    ok(`섹션 "${name}" created`);
  }

  await ensureVariables();
  await ensureTextStyles();
  await applyFontFamily(S.family);
}

async function ensureVariables() {
  await loadVars();
  if (!S.collection) {
    S.collection = figma.variables.createVariableCollection(COLLECTION);
    ok(`변수 컬렉션 "${COLLECTION}" created`);
  } else {
    info(`변수 컬렉션 "${COLLECTION}" exists → skipped`);
  }
  const col = S.collection;
  const modeId = col.modes[0].modeId;
  if (col.modes[0].name !== MODE_NAME) {
    col.renameMode(modeId, MODE_NAME);
    ok(`모드 이름 → "${MODE_NAME}"`);
  }

  const specs = [];
  for (const [n, hex, scopes] of COLOR_VARS) specs.push({ n, type: 'COLOR', value: hexToRgb(hex), scopes });
  for (const [n, v] of SPACE_VARS) specs.push({ n, type: 'FLOAT', value: v, scopes: ['GAP'] });
  for (const [n, v] of SIZE_VARS) specs.push({ n, type: 'FLOAT', value: v, scopes: ['WIDTH_HEIGHT'] });

  let created = 0;
  let skipped = 0;
  let updated = 0;
  for (const sp of specs) {
    try {
      let v = S.vars.get(sp.n);
      if (!v) {
        v = figma.variables.createVariable(sp.n, col, sp.type);
        v.setValueForMode(modeId, sp.value);
        v.scopes = sp.scopes;
        S.vars.set(sp.n, v);
        created++;
        continue;
      }
      if (v.resolvedType !== sp.type) {
        warn(`변수 "${sp.n}" 타입이 ${v.resolvedType} 입니다 (스펙 ${sp.type}). 건드리지 않습니다.`);
        continue;
      }
      let changed = false;
      const cur = v.valuesByMode[modeId];
      if (!sameValue(cur, sp.value)) {
        v.setValueForMode(modeId, sp.value);
        changed = true;
      }
      if (!sameScopes(v.scopes, sp.scopes)) {
        v.scopes = sp.scopes;
        changed = true;
      }
      if (changed) {
        updated++;
        info(`변수 "${sp.n}" 값/scope 를 스펙에 맞게 updated`);
      } else {
        skipped++;
      }
    } catch (e) {
      S.failures++;
      fail(`변수 "${sp.n}" 처리 실패: ${errText(e)}`);
    }
  }
  ok(`변수 ${specs.length}개: created ${created}, updated ${updated}, exists → skipped ${skipped}`);
}

function sameValue(a, b) {
  if (a == null) return false;
  if (typeof b === 'number') return typeof a === 'number' && Math.abs(a - b) < 0.001;
  if (typeof a !== 'object' || !('r' in a)) return false;
  const near = (x, y) => Math.abs(x - y) < 0.002;
  return near(a.r, b.r) && near(a.g, b.g) && near(a.b, b.b) && (a.a == null || near(a.a, 1));
}

function sameScopes(a, b) {
  if (!a || a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

async function ensureTextStyles() {
  await loadStyles();
  let created = 0;
  let skipped = 0;
  let updated = 0;
  for (const [name, weight, size, lh] of TEXT_STYLES) {
    try {
      let st = S.styles.get(name);
      if (!st) {
        const font = await styleFont(name, S.family, weight);
        st = figma.createTextStyle();
        st.name = name;
        st.fontName = font;
        st.fontSize = size;
        st.lineHeight = { value: lh, unit: 'PIXELS' };
        st.letterSpacing = { value: 0, unit: 'PIXELS' };
        S.styles.set(name, st);
        created++;
        continue;
      }
      const lhOk = st.lineHeight && st.lineHeight.unit === 'PIXELS' && Math.abs(st.lineHeight.value - lh) < 0.01;
      if (st.fontSize !== size || !lhOk) {
        if (!(await tryLoadFont(st.fontName))) await styleFont(name, S.family, weight).then((f) => { st.fontName = f; });
        st.fontSize = size;
        st.lineHeight = { value: lh, unit: 'PIXELS' };
        updated++;
        info(`텍스트 스타일 "${name}" 크기/행간을 스펙에 맞게 updated`);
      } else {
        skipped++;
      }
    } catch (e) {
      S.failures++;
      fail(`텍스트 스타일 "${name}" 처리 실패: ${errText(e)}`);
    }
  }
  ok(`텍스트 스타일 ${TEXT_STYLES.length}개: created ${created}, updated ${updated}, exists → skipped ${skipped}`);
}

async function applyFontFamily(family) {
  info(`폰트 패밀리 적용: ${family}`);
  let changed = 0;
  let same = 0;
  for (const [name, weight] of TEXT_STYLES) {
    const st = S.styles.get(name);
    if (!st) continue;
    try {
      const target = await styleFont(name, family, weight);
      if (st.fontName.family === target.family && st.fontName.style === target.style) {
        same++;
        continue;
      }
      await tryLoadFont(st.fontName);
      st.fontName = target;
      changed++;
    } catch (e) {
      S.failures++;
      fail(`텍스트 스타일 "${name}" 폰트 변경 실패 (기존 폰트 유지): ${errText(e)}`);
    }
  }
  ok(`폰트 적용 결과: 변경 ${changed}, 이미 동일 ${same}`);
}

// =====================================================================
// Step 2. buildAtoms
// =====================================================================
const ATOM_NAMES = [
  'Atom/Rule/Thick', 'Atom/Rule/Thin', 'Atom/Rule/Soft', 'Atom/Rule/Short',
  'Atom/Separator', 'Atom/Dot', 'Atom/Star', 'Atom/Note', 'Atom/Contact',
  'Atom/LinkChip', 'Atom/Tag',
];

function ruleComp(name, w, hVar, fillVar, wVar, desc) {
  const c = figma.createComponent();
  S.pending = c;
  c.name = name;
  c.resize(w, 2);
  c.setBoundVariable('height', getVar(hVar));
  if (wVar) c.setBoundVariable('width', getVar(wVar));
  bindFill(c, fillVar);
  c.description = desc;
  return c;
}

const ATOM_BUILDERS = {
  'Atom/Rule/Thick': async () => ruleComp('Atom/Rule/Thick', 200, 'size/rule-thick', 'color/ink', null,
    '굵은 구분선(2px). 섹션 제목 아래에 가로 FILL 로 사용.'),
  'Atom/Rule/Thin': async () => ruleComp('Atom/Rule/Thin', 200, 'size/rule-thin', 'color/ink', null,
    '얇은 구분선(1px). 페이지 제목·헤더 아래에 가로 FILL 로 사용.'),
  'Atom/Rule/Soft': async () => ruleComp('Atom/Rule/Soft', 200, 'size/rule-thin', 'color/rule-soft', null,
    '회색 얇은 선. 항목 제목과 날짜 사이를 잇는 선으로 가로 FILL 로 사용.'),
  'Atom/Rule/Short': async () => ruleComp('Atom/Rule/Short', 2, 'size/rule-short', 'color/ink', 'size/rule-thick',
    '세로 바(2×27). 프로젝트 제목과 기술 목록 사이에 사용.'),
  'Atom/Separator': async () => {
    const c = figma.createComponent();
    S.pending = c;
    c.name = 'Atom/Separator';
    c.resize(1, 14);
    c.setBoundVariable('width', getVar('size/rule-thin'));
    c.setBoundVariable('height', getVar('size/sep-h'));
    bindFill(c, 'color/ink');
    c.description = '세로 구분선(1×14). 연락처 항목 사이에 사용.';
    return c;
  },
  'Atom/Dot': async () => {
    const c = figma.createComponent();
    S.pending = c;
    c.name = 'Atom/Dot';
    c.resize(11, 11);
    c.fills = [];
    const e = figma.createEllipse();
    e.name = 'dot';
    c.appendChild(e);
    e.resize(11, 11);
    e.x = 0;
    e.y = 0;
    e.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
    bindFill(e, 'color/accent');
    c.setBoundVariable('width', getVar('size/dot'));
    c.setBoundVariable('height', getVar('size/dot'));
    c.description = '노란 점(11px). 페이지 제목 옆 장식.';
    return c;
  },
  'Atom/Star': async () => {
    const c = comp('Atom/Star', 'HORIZONTAL', { desc: '노란 별표 "*". 안내문 앞에 붙는 기호.' });
    await text({ name: 'star', style: 'KB/Star', fill: 'color/accent', chars: '*', parent: c });
    return c;
  },
  'Atom/Note': async () => {
    const c = comp('Atom/Note', 'HORIZONTAL', { gap: 'space/inline', cross: 'MAX',
      desc: '별표 안내문. 섹션/페이지 제목 우측에 두고 text 속성으로 문구 변경.' });
    addInst(c, 'Atom/Star', { name: 'star' });
    const t = await text({ name: 'text', style: 'KB/Caption', chars: DEFAULT_NOTE, parent: c });
    textProp(c, t, 'text');
    return c;
  },
  'Atom/Contact': async () => {
    const c = comp('Atom/Contact', 'HORIZONTAL', { gap: 'space/inline', cross: 'CENTER',
      desc: '연락처 한 줄(이메일|전화|GitHub|블로그). 텍스트 속성으로 값 변경, 링크는 채우기 단계에서 설정.' });
    const email = await text({ name: 'email', style: 'KB/Caption', chars: 'hello@example.com', parent: c });
    addInst(c, 'Atom/Separator', { name: 'sep' });
    const phone = await text({ name: 'phone', style: 'KB/Caption', chars: '010-0000-0000', parent: c });
    addInst(c, 'Atom/Separator', { name: 'sep' });
    const gh = await text({ name: 'github', style: 'KB/Caption', chars: 'github.com/your-github', parent: c, link: 'https://github.com/your-github' });
    addInst(c, 'Atom/Separator', { name: 'sep' });
    const blog = await text({ name: 'blog', style: 'KB/Caption', chars: 'example.com', parent: c, link: 'https://example.com' });
    textProp(c, email, 'email');
    textProp(c, phone, 'phone');
    textProp(c, gh, 'github');
    textProp(c, blog, 'blog');
    return c;
  },
  'Atom/LinkChip': async () => {
    const c = comp('Atom/LinkChip', 'HORIZONTAL', { gap: 4, cross: 'CENTER',
      desc: '아이콘+밑줄 링크. label 속성으로 문구 변경, 링크 URL 은 채우기 단계에서 설정.' });
    const icon = figma.createEllipse();
    icon.name = 'icon';
    icon.resize(17, 17);
    c.appendChild(icon);
    icon.setBoundVariable('width', getVar('size/icon'));
    icon.setBoundVariable('height', getVar('size/icon'));
    bindFill(icon, 'color/ink');
    const t = await text({ name: 'label', style: 'KB/Caption', chars: 'GitHub', parent: c, link: 'https://github.com/your-github' });
    textProp(c, t, 'label');
    return c;
  },
  'Atom/Tag': async () => {
    const c = comp('Atom/Tag', 'HORIZONTAL', { desc: '기술 스택 태그 하나. label 속성으로 기술명 변경.' });
    const t = await text({ name: 'label', style: 'KB/Caption', chars: 'Claude code', parent: c });
    textProp(c, t, 'label');
    return c;
  },
};

async function buildAtoms() {
  await prepare();
  const ds = await requirePage(PAGE_DS);
  await figma.setCurrentPageAsync(ds);
  const section = requireSection(ds, '2 Atoms');
  const placer = makePlacer(section, [80]);
  for (const name of ATOM_NAMES) {
    await ensureComp(name, ATOM_BUILDERS[name], placer(0));
  }
  placer.fit();
}

// =====================================================================
// Step 3. buildBlocks
// =====================================================================
const BLOCKS = {
  'Block/SectionHeader': async () => {
    const c = comp('Block/SectionHeader', 'VERTICAL', { width: 1080, gap: 0,
      desc: '이력서 섹션 제목(32/38) + 굵은 밑줄 2px. showRight 로 우측 별표 안내문(제목 top −10 에서 시작, 밑줄 14 위에서 끝).' });
    const row = put(c, al('HORIZONTAL', { name: 'row', cross: 'MAX' }), { w: 'FILL' });
    row.layoutSizingVertical = 'FIXED';
    row.resize(row.width, 38);
    const title = await text({ name: 'title', style: 'KB/Title/Section', chars: 'About Me', parent: row });
    spacer(row);
    const rightWrap = put(row, al('HORIZONTAL', { name: 'rightWrap', pb: 14 }));
    const right = addInst(rightWrap, 'Atom/Note', { name: 'right' });
    addInst(c, 'Atom/Rule/Thick', { name: 'rule', w: 'FILL' });
    textProp(c, title, 'title');
    boolProp(c, right, 'showRight', true);
    expose(right);
    return c;
  },
  'Block/Resume/Header': async () => {
    const c = comp('Block/Resume/Header', 'VERTICAL', { width: 1080, gap: 'space/inline',
      desc: '이력서 상단 이름 + 노란 한 줄 소개(KB/Tagline/Resume 22/26). name, tagline 속성.' });
    const name = await text({ name: 'name', style: 'KB/Name/Resume', chars: '홍길동', parent: c });
    const tagline = await text({ name: 'tagline', style: 'KB/Tagline/Resume', fill: 'color/accent',
      chars: '“문제를 구조로 푸는 Product Engineer 홍길동입니다”', parent: c, size: 'FILL', width: 1080 });
    textProp(c, name, 'name');
    textProp(c, tagline, 'tagline');
    return c;
  },
  'Block/Resume/AboutPara': async () => {
    const c = comp('Block/Resume/AboutPara', 'VERTICAL', { width: 1080, gap: 0,
      desc: 'About Me 단락(폭 1078). 소제목(16/25, x+2) + 본문(16/28, x+12, 폭 1066). 본문에 • 줄이 있으면 채울 때 줄 단위로 매달림 들여쓰기.' });
    const headWrap = put(c, al('HORIZONTAL', { name: 'headWrap', pl: 2 }), { w: 'FILL' });
    const heading = await text({ name: 'heading', style: 'KB/Para/Heading', chars: '문제 해결을 위한 방법은 ‘코드 바깥’에 있습니다', parent: headWrap, size: 'FILL', width: 1078 });
    const wrap = put(c, al('VERTICAL', { name: 'bodyWrap', pl: 12 }), { w: 'FILL' });
    const body = await text({ name: 'body', style: 'KB/Body/About', chars: '본문을 입력하세요.', parent: wrap, size: 'FILL', width: 1066 });
    textProp(c, heading, 'heading');
    textProp(c, body, 'body');
    return c;
  },
  'Block/Resume/ExperienceItem': async () => {
    const c = comp('Block/Resume/ExperienceItem', 'VERTICAL', { width: 1080, gap: 'space/item-head',
      desc: '경력 항목. 제목—회색선—기간 행과 본문. 제목에 링크 가능.' });
    const row = put(c, al('HORIZONTAL', { name: 'row', cross: 'CENTER' }), { w: 'FILL' });
    const title = await text({ name: 'title', style: 'KB/Title/Item', chars: 'Example Corp', parent: row });
    const ruleWrap = put(row, al('HORIZONTAL', { name: 'ruleWrap', pl: 'space/divider-l', pr: 'space/divider-r', cross: 'CENTER' }), { w: 'FILL' });
    addInst(ruleWrap, 'Atom/Rule/Soft', { name: 'rule', w: 'FILL' });
    const date = await text({ name: 'date', style: 'KB/Caption', chars: '2025.12.~ 진행중', align: 'RIGHT', parent: row });
    const body = await text({ name: 'body', style: 'KB/Body/Resume', chars: '본문을 입력하세요.', parent: c, size: 'FILL', width: 1080 });
    textProp(c, title, 'title');
    textProp(c, date, 'date');
    textProp(c, body, 'body');
    return c;
  },
  'Block/Resume/EducationItem': async () => {
    const c = comp('Block/Resume/EducationItem', 'HORIZONTAL', { width: 1078, gap: 0, cross: 'MIN',
      desc: '학력 한 줄(높이 24 + 위로 3). 학교(20 Bold) — 회색 가로선 29×1(학교 오른쪽 9, 위 12) — 학과(20 Light, 학교보다 3 위) — 메타(학과 오른쪽 17, 위 5).' });
    c.layoutSizingVertical = 'FIXED';
    c.resize(1078, 27);
    const schoolWrap = put(c, al('HORIZONTAL', { name: 'schoolWrap', pt: 3 }));
    const school = await text({ name: 'school', style: 'KB/Title/ItemSmall', chars: '예시대학교', parent: schoolWrap });
    const lineWrap = put(c, al('HORIZONTAL', { name: 'lineWrap', pl: 9, pt: 15 }));
    const line = addInst(lineWrap, 'Atom/Rule/Soft', { name: 'rule' });
    line.resize(29, line.height);
    const deptWrap = put(c, al('HORIZONTAL', { name: 'deptWrap', pl: 9 }));
    const dept = await text({ name: 'dept', style: 'KB/Edu/Dept', chars: '컴퓨터공학과', parent: deptWrap });
    const metaWrap = put(c, al('HORIZONTAL', { name: 'metaWrap', pl: 17, pt: 8 }));
    const meta = await text({ name: 'meta', style: 'KB/Caption', chars: '4.1 / 4.5   2023.11.~', parent: metaWrap });
    textProp(c, school, 'school');
    textProp(c, dept, 'dept');
    textProp(c, meta, 'meta');
    return c;
  },
  'Block/Resume/SkillGroup': async () => {
    const c = comp('Block/Resume/SkillGroup', 'VERTICAL', { width: 1081, gap: 0,
      desc: '이력서 스킬 그룹. 카테고리(20/29) + 위 10 에 1px 선(카테고리 오른쪽 20 부터), 아래 줄에 도구(쉼표)와 같은 높이의 우측 정렬 설명(폭 638).' });
    const row = put(c, al('HORIZONTAL', { name: 'row', cross: 'MIN' }), { w: 'FILL' });
    const category = await text({ name: 'category', style: 'KB/Title/SkillResume', chars: 'BE', parent: row });
    const ruleWrap = put(row, al('HORIZONTAL', { name: 'ruleWrap', pl: 'space/divider-l', pr: 4, pt: 10 }), { w: 'FILL' });
    addInst(ruleWrap, 'Atom/Rule/Thin', { name: 'rule', w: 'FILL' });
    const row2 = put(c, al('HORIZONTAL', { name: 'row2', cross: 'MIN' }), { w: 'FILL' });
    const tools = await text({ name: 'tools', style: 'KB/Caption', chars: 'Spring, NestJS, JPA', parent: row2, size: 'FILL', width: 442 });
    const desc = await text({ name: 'description', style: 'KB/Body/Dense', chars: '설명을 입력하세요.', align: 'RIGHT', parent: row2, size: 638 });
    textProp(c, category, 'category');
    textProp(c, tools, 'tools');
    textProp(c, desc, 'description');
    return c;
  },
  'Block/Letter/Header': async () => {
    const c = comp('Block/Letter/Header', 'VERTICAL', { width: 1080, gap: 13,
      desc: '자기소개서 상단. 왼쪽 열(이름·한 줄 소개·우측 정렬 연락처) + 오른쪽 원형 사진(168×171), 13px 아래 얇은 밑줄.' });
    const top = put(c, al('HORIZONTAL', { name: 'top', gap: 24, cross: 'MIN' }), { w: 'FILL' });
    const col = put(top, al('VERTICAL', { name: 'titles', gap: 'space/inline' }), { w: 'FILL' });
    const name = await text({ name: 'name', style: 'KB/Name/Resume', chars: '홍길동', parent: col });
    const tagline = await text({ name: 'tagline', style: 'KB/Tagline', fill: 'color/accent',
      chars: '"한계를 넘어서는 도전과 성장을 즐기며, 끝까지 포기하지 않는 개발자입니다."', parent: col, size: 'FILL', width: 800 });
    const contactRow = put(col, al('HORIZONTAL', { name: 'contactRow', main: 'MAX', pt: 36 }), { w: 'FILL' });
    const contact = addInst(contactRow, 'Atom/Contact', { name: 'contact' });
    const photo = figma.createEllipse();
    photo.name = 'photo';
    photo.resize(168, 171);
    solidFill(photo, '#d9d9d9');
    top.appendChild(photo);
    photo.setBoundVariable('width', getVar('size/photo-circle'));
    addInst(c, 'Atom/Rule/Thin', { name: 'rule', w: 'FILL' });
    textProp(c, name, 'name');
    textProp(c, tagline, 'tagline');
    expose(contact);
    return c;
  },
  'Block/Letter/Paragraph': async () => {
    const c = comp('Block/Letter/Paragraph', 'VERTICAL', { width: 980, gap: 5,
      desc: '자기소개서 단락. 노란 소제목 + 양쪽 정렬 본문(**굵게** 가능).' });
    const heading = await text({ name: 'heading', style: 'KB/Tagline', fill: 'color/accent', chars: '성장을 향한 끝없는 도전', parent: c, size: 'FILL', width: 980 });
    const body = await text({ name: 'body', style: 'KB/Body/Letter', chars: '본문을 입력하세요.', align: 'JUSTIFIED', parent: c, size: 'FILL', width: 980 });
    textProp(c, heading, 'heading');
    textProp(c, body, 'body');
    return c;
  },
  'Block/PageTitle': async () => {
    const c = comp('Block/PageTitle', 'VERTICAL', { width: 1080, gap: 0,
      desc: '큰 페이지 제목 + 노란 점. showRule 로 제목 줄 19 아래·왼쪽 50 부터 1px 밑줄(포폴 상세 회사명), showRight 로 별표 안내문, showRightText 로 우측 노란 소개문.' });
    const row = put(c, al('HORIZONTAL', { name: 'row', cross: 'MAX' }), { w: 'FILL' });
    const title = await text({ name: 'title', style: 'KB/Title/Page', chars: 'Profile', parent: row });
    const dotWrap = put(row, al('HORIZONTAL', { name: 'dotWrap', pl: 'space/inline', pb: 15 }));
    addInst(dotWrap, 'Atom/Dot', { name: 'dot' });
    spacer(row);
    const rightText = await text({ name: 'rightText', style: 'KB/Tagline', fill: 'color/accent',
      chars: '한 줄 소개', align: 'RIGHT', parent: row });
    const right = addInst(row, 'Atom/Note', { name: 'right' });
    const ruleWrap = put(c, al('HORIZONTAL', { name: 'ruleWrap', pt: 19, pl: 50 }), { w: 'FILL' });
    addInst(ruleWrap, 'Atom/Rule/Thin', { name: 'rule', w: 'FILL' });
    textProp(c, title, 'title');
    textProp(c, rightText, 'rightText');
    boolProp(c, right, 'showRight', true);
    boolProp(c, rightText, 'showRightText', false);
    boolProp(c, ruleWrap, 'showRule', false);
    expose(right);
    return c;
  },
  'Block/Cover/Header': async () => {
    const c = comp('Block/Cover/Header', 'VERTICAL', { width: 1080, gap: 0,
      desc: '포트폴리오 표지 상단. 이름·"Portfolio"·연락처 표(라벨 | 세로선 하나 | 값)·얇은 밑줄. 한 줄 소개는 Profile 제목 오른쪽(rightText)에 둔다.' });
    const name = await text({ name: 'name', style: 'KB/Name/Cover', chars: '홍길동', parent: c });
    const row = put(c, al('HORIZONTAL', { name: 'row', cross: 'MAX' }), { w: 'FILL' });
    const pWrap = put(row, al('HORIZONTAL', { name: 'portfolioWrap', pl: 11 }));
    await text({ name: 'portfolio', style: 'KB/Title/Portfolio', chars: 'Portfolio', parent: pWrap });
    spacer(row);
    const table = put(row, al('HORIZONTAL', { name: 'contactTable', gap: 9, cross: 'MIN' }));
    const labels = put(table, al('VERTICAL', { name: 'labels', gap: 4, cross: 'MAX' }));
    labels.layoutSizingHorizontal = 'FIXED';
    labels.resize(52, Math.max(1, labels.height));
    for (const l of ['E-mail', 'Github', 'Blog']) {
      await text({ name: 'label', style: 'KB/Label', chars: l, align: 'RIGHT', parent: labels, size: 'FILL', width: 52 });
    }
    const vline = figma.createRectangle();
    vline.name = 'vline';
    vline.resize(1, 10);
    table.appendChild(vline);
    vline.setBoundVariable('width', getVar('size/rule-thin'));
    vline.layoutSizingVertical = 'FILL';
    bindFill(vline, 'color/ink');
    vline.opacity = 0.35;
    const values = put(table, al('VERTICAL', { name: 'values', gap: 4 }));
    const email = await text({ name: 'email', style: 'KB/Label', chars: 'hello@example.com', parent: values });
    const gh = await text({ name: 'github', style: 'KB/Label', chars: 'your-github', parent: values, link: 'https://github.com/your-github' });
    const blog = await text({ name: 'blog', style: 'KB/Label', chars: 'your-blog', parent: values, link: 'https://example.com' });
    addInst(c, 'Atom/Rule/Thin', { name: 'rule', w: 'FILL' });
    textProp(c, name, 'name');
    textProp(c, email, 'email');
    textProp(c, gh, 'github');
    textProp(c, blog, 'blog');
    return c;
  },
  'Block/Cover/SkillGroup': async () => {
    const c = comp('Block/Cover/SkillGroup', 'VERTICAL', { width: 640, gap: 'space/inline',
      desc: '스킬 그룹. 카테고리·도구 + 카테고리 윗변 14px 아래 얇은 선, 아래 우측 정렬 설명(**굵게** 가능).' });
    const row = put(c, al('HORIZONTAL', { name: 'row', cross: 'MIN' }), { w: 'FILL' });
    const col = put(row, al('VERTICAL', { name: 'titles', gap: 0 }));
    const category = await text({ name: 'category', style: 'KB/Title/ItemSmall', chars: 'AI Agent', parent: col });
    const tools = await text({ name: 'tools', style: 'KB/Caption', chars: 'Claude code, Codex', parent: col });
    const ruleWrap = put(row, al('HORIZONTAL', { name: 'ruleWrap', pl: 'space/divider-l', pt: 14 }), { w: 'FILL' });
    addInst(ruleWrap, 'Atom/Rule/Thin', { name: 'rule', w: 'FILL' });
    const desc = await text({ name: 'description', style: 'KB/Body/Dense', chars: '설명을 입력하세요.', align: 'RIGHT', parent: c, size: 'FILL', width: 640 });
    textProp(c, category, 'category');
    textProp(c, tools, 'tools');
    textProp(c, desc, 'description');
    return c;
  },
  'Block/Cover/ProjectItem': async () => {
    const c = comp('Block/Cover/ProjectItem', 'VERTICAL', { width: 1080, gap: 0,
      desc: '프로젝트 항목(표지·이력서 공용). 제목 | 세로 바(오른쪽 11) | 기술(바 오른쪽 10, 단어 간격 6) | 회색선(좌 20 우 11) | 기간. 줄 높이 28. 아래 본문(+35, 불릿 x+13, 2단계) + 오른쪽 링크 열(+28, 간격 7).' });
    const row1 = put(c, al('HORIZONTAL', { name: 'row', cross: 'CENTER' }), { w: 'FILL' });
    row1.layoutSizingVertical = 'FIXED';
    row1.resize(row1.width, 28);
    const title = await text({ name: 'title', style: 'KB/Title/ItemSmall', chars: 'Sample Project', parent: row1 });
    const barWrap = put(row1, al('HORIZONTAL', { name: 'barWrap', pl: 11 }));
    addInst(barWrap, 'Atom/Rule/Short', { name: 'bar' });
    const toolsWrap = put(row1, al('HORIZONTAL', { name: 'toolsWrap', pl: 10 }));
    const tools = put(toolsWrap, al('HORIZONTAL', { name: 'tools', gap: 6, cross: 'CENTER' }));
    const sample = ['Spring', 'JPA', 'Docker'];
    for (let i = 1; i <= TOOL_SLOTS; i++) {
      const t = await text({ name: 'tool' + i, style: 'KB/Caption', chars: sample[i - 1] || 'Tool', parent: tools });
      t.visible = i <= sample.length;
    }
    const ruleWrap = put(row1, al('HORIZONTAL', { name: 'ruleWrap', pl: 'space/divider-l', pr: 11, cross: 'CENTER' }), { w: 'FILL' });
    addInst(ruleWrap, 'Atom/Rule/Soft', { name: 'rule', w: 'FILL' });
    const date = await text({ name: 'date', style: 'KB/Caption', chars: '2024.06.20. ~ 2024.07.25.', align: 'RIGHT', parent: row1 });
    const row2 = put(c, al('HORIZONTAL', { name: 'content', cross: 'MIN' }), { w: 'FILL' });
    const bodyWrap = put(row2, al('VERTICAL', { name: 'bodyWrap', pt: 7 }), { w: 'FILL' });
    const bullets = await text({ name: 'bullets', style: 'KB/Body/Bullet', chars: '• 불릿을 입력하세요.', parent: bodyWrap, size: 'FILL', width: 983 });
    const linksWrap = put(row2, al('VERTICAL', { name: 'linksWrap', cross: 'MAX' }));
    linksWrap.layoutSizingHorizontal = 'FIXED';
    linksWrap.resize(PROJECT_LINKS_W, Math.max(1, linksWrap.height));
    const links = put(linksWrap, al('VERTICAL', { name: 'links', gap: 7, cross: 'MAX' }));
    const l1 = addInst(links, 'Atom/LinkChip', { name: 'link1' });
    const l2 = addInst(links, 'Atom/LinkChip', { name: 'link2' });
    textProp(c, title, 'title');
    textProp(c, date, 'date');
    textProp(c, bullets, 'bullets');
    boolProp(c, l2, 'showLink2', true);
    expose(l1);
    expose(l2);
    return c;
  },
  'Block/Detail/Side': async () => {
    const c = comp('Block/Detail/Side', 'VERTICAL', { width: 245, widthVar: 'size/sidebar-w', gap: 0, pt: 9,
      desc: '포트폴리오 상세 사이드(본문보다 9 아래, 즉 밑줄 + 40). 기간 → 값(+16) → 링크(+17, 아이콘 19, 행 간격 12, 최대 3) → 사용 기술(+35) → 태그(+5, 최대 8, 열 40 행 11). 빈 링크·태그는 숨김.' });
    await text({ name: 'periodLabel', style: 'KB/Title/Side', chars: '기간', parent: c });
    const pw = put(c, al('VERTICAL', { name: 'periodWrap', pt: 16 }), { w: 'FILL' });
    const period = await text({ name: 'period', style: 'KB/Caption', chars: '2025.6. ~ 2025.7.', parent: pw });
    const lw = put(c, al('VERTICAL', { name: 'linksWrap', pt: 17 }), { w: 'FILL' });
    const links = put(lw, al('VERTICAL', { name: 'links', gap: 12 }), { w: 'FILL' });
    for (let i = 1; i <= SIDE_LINK_SLOTS; i++) {
      const row = put(links, al('HORIZONTAL', { name: 'link' + i, gap: 6, cross: 'CENTER' }));
      const icon = figma.createEllipse();
      icon.name = 'linkIcon' + i;
      icon.resize(19, 19);
      row.appendChild(icon);
      bindFill(icon, 'color/ink');
      await text({ name: 'linkLabel' + i, style: 'KB/Caption', chars: 'GitHub', parent: row, link: 'https://github.com/your-github' });
      row.visible = i === 1;
    }
    const tlw = put(c, al('VERTICAL', { name: 'tagsLabelWrap', pt: 35 }), { w: 'FILL' });
    await text({ name: 'tagsLabel', style: 'KB/Title/Side', chars: '사용 기술', parent: tlw });
    const tw = put(c, al('VERTICAL', { name: 'tagsWrap', pt: 5 }), { w: 'FILL' });
    const tags = put(tw, al('HORIZONTAL', { name: 'tags', gap: 'space/tag-x', wrap: true, gapY: 'space/tag-y' }), { w: 'FILL' });
    for (let i = 1; i <= SIDE_TAG_SLOTS; i++) {
      const tag = addInst(tags, 'Atom/Tag', { name: 'tag' + i });
      tag.visible = i <= 4;
      expose(tag);
    }
    textProp(c, period, 'period');
    return c;
  },
  'Block/Detail/Summary': async () => {
    const c = comp('Block/Detail/Summary', 'VERTICAL', { width: 1033, gap: DETAIL.summaryGap,
      desc: '포트폴리오 상세 요약. 굵은 헤드라인(24/26, 폭 728) + 9 아래 보조 설명(16/22, **굵게**·링크 가능).' });
    const headline = await text({ name: 'headline', style: 'KB/Headline', chars: '요약 헤드라인을 입력하세요.', parent: c, size: DETAIL.headlineW });
    const sub = await text({ name: 'sub', style: 'KB/Body/Default', chars: '보조 설명을 입력하세요.', parent: c, size: 'FILL', width: 1033 });
    textProp(c, headline, 'headline');
    textProp(c, sub, 'sub');
    return c;
  },
  'Block/Detail/ProjectHead': async () => {
    const c = comp('Block/Detail/ProjectHead', 'VERTICAL', { width: 1033, gap: 0,
      desc: '포트폴리오 상세 프로젝트 머리. 제목(30/36) + 12 옆 노란 부제(바닥 = 제목 바닥 −2) + 제목 바로 아래 1px 밑줄(왼쪽 3 들여, 폭 1030). 이어지는 장에도 다시 붙는다.' });
    const row = put(c, al('HORIZONTAL', { name: 'row', gap: 12, cross: 'MAX' }), { w: 'FILL' });
    const title = await text({ name: 'title', style: 'KB/Title/Project', chars: 'Influencer CRM 시스템 개발', parent: row });
    const subWrap = put(row, al('HORIZONTAL', { name: 'subWrap', pb: 2 }), { w: 'FILL' });
    const subtitle = await text({ name: 'subtitle', style: 'KB/Subtitle', fill: 'color/accent', chars: '프로젝트 한 줄 설명', parent: subWrap, size: 'FILL', width: 600 });
    const ruleWrap = put(c, al('HORIZONTAL', { name: 'ruleWrap', pl: DETAIL.ruleInset }), { w: 'FILL' });
    addInst(ruleWrap, 'Atom/Rule/Thin', { name: 'rule', w: 'FILL' });
    textProp(c, title, 'title');
    textProp(c, subtitle, 'subtitle');
    return c;
  },
};

// [name, column] — column 0 = 이력서/자소서 (x=80), 1 = 포트폴리오 (x=1280). Order respects dependencies.
const BLOCK_ORDER = [
  ['Block/SectionHeader', 0],
  ['Block/Resume/Header', 0],
  ['Block/Resume/AboutPara', 0],
  ['Block/Resume/ExperienceItem', 0],
  ['Block/Resume/EducationItem', 0],
  ['Block/Resume/SkillGroup', 0],
  ['Block/Letter/Header', 0],
  ['Block/Letter/Paragraph', 0],
  ['Block/PageTitle', 1],
  ['Block/Cover/Header', 1],
  ['Block/Cover/SkillGroup', 1],
  ['Block/Cover/ProjectItem', 1],
  ['Block/Detail/Side', 1],
  ['Block/Detail/Summary', 1],
  ['Block/Detail/ProjectHead', 1],
];

async function buildBlocks() {
  await prepare();
  const missingAtoms = ATOM_NAMES.filter((n) => !findComponent(n));
  if (missingAtoms.length) throw new Error(`Atom 이 없습니다: ${missingAtoms.join(', ')} — 2단계 buildAtoms 를 먼저 실행하세요.`);
  const staleAtoms = ATOM_NAMES.filter((n) => compVersion(findComponent(n)) < (COMP_VERSIONS[n] || 1));
  if (staleAtoms.length) throw new Error(`구버전 Atom 이 있습니다: ${staleAtoms.join(', ')} — 2단계 buildAtoms 를 다시 실행하세요.`);
  const ds = await requirePage(PAGE_DS);
  await figma.setCurrentPageAsync(ds);
  const section = requireSection(ds, '3 Blocks');
  const placer = makePlacer(section, [80, 1280]);
  for (const [name, col] of BLOCK_ORDER) {
    await ensureComp(name, BLOCKS[name], placer(col));
  }
  placer.fit();
}

// =====================================================================
// Step 4. buildTemplates
// =====================================================================
// top: number (px) or variable name. Bottom 30, sides 55.
function templateComp(name, desc, top, gap, o = {}) {
  const c = figma.createComponent();
  S.pending = c;
  c.name = name;
  c.layoutMode = 'VERTICAL';
  c.resize(PAGE_W, PAGE_H);
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';
  c.setBoundVariable('width', getVar('size/page-w'));
  c.setBoundVariable('height', getVar('size/page-h'));
  bindGap(c, 'paddingLeft', o.pl != null ? o.pl : 'space/page-x');
  bindGap(c, 'paddingRight', o.pr != null ? o.pr : 'space/page-x');
  bindGap(c, 'paddingTop', top);
  bindGap(c, 'paddingBottom', 'space/page-bottom');
  bindGap(c, 'itemSpacing', gap);
  c.primaryAxisAlignItems = 'MIN';
  c.counterAxisAlignItems = 'MIN';
  bindFill(c, 'color/paper');
  c.clipsContent = false;
  c.description = desc;
  return c;
}

function sectionFrame(parent, name, gap) {
  return put(parent, al('VERTICAL', { name, gap }), { w: 'FILL' });
}

function listFrame(parent, gap, o = {}) {
  return put(parent, al('VERTICAL', Object.assign({ name: 'list', gap }, o)), { w: 'FILL' });
}

function addItems(parent, compName, n, name = 'item') {
  for (let i = 0; i < n; i++) addInst(parent, compName, { name, w: 'FILL' });
}

function absolute(node, x, y) {
  node.layoutPositioning = 'ABSOLUTE';
  node.x = x;
  node.y = y;
}

function setDotGap(head, px) {
  const dw = findNode(head, 'dotWrap');
  if (!dw) return;
  try {
    dw.paddingLeft = px;
  } catch (e) {
    warn(`제목 점 간격(${px})을 바꾸지 못했습니다: ${e.message || e}`);
  }
}

async function pageTitle(parent, title, o) {
  const head = addInst(parent, 'Block/PageTitle', { name: 'head', w: 'FILL' });
  await setTextProp(head, 'title', title);
  setBoolProp(head, 'showRight', !!o.right);
  setBoolProp(head, 'showRightText', !!o.rightText);
  if (o.rightText) await setTextProp(head, 'rightText', o.rightText);
  setBoolProp(head, 'showRule', !!o.rule);
  return head;
}

// Structure contract with the Build all engine (KINDS below):
//   page > header? + section frames (name = KINDS[*].sections[].key) > head + list > item slots
const TEMPLATE_BUILDERS = {
  'Template/Resume': async () => {
    const c = templateComp('Template/Resume', 'A4 이력서 템플릿(상단 37, 첫 섹션 제목 233, 섹션 제목·밑줄 52→1133). 섹션 5종(education/about/experience/project/skill)을 resume.sections 순서로 쌓는다.', 'space/page-top', 'space/section', { pl: RESUME_PAGE_X.left, pr: RESUME_PAGE_X.right });
    const headerWrap = put(c, al('VERTICAL', { name: 'headerWrap', pl: RESUME_HEADER_INSET, pb: RESUME_HEADER_PB }), { w: 'FILL' });
    addInst(headerWrap, 'Block/Resume/Header', { name: 'header', w: 'FILL' });
    const logo = figma.createRectangle();
    logo.name = 'logo';
    logo.resize(RESUME_LOGO.defaultW, RESUME_LOGO.h);
    solidFill(logo, '#d9d9d9');
    c.appendChild(logo);
    absolute(logo, RESUME_LOGO.defaultX, RESUME_LOGO.y);
    logo.visible = false;
    const contact = addInst(c, 'Atom/Contact', { name: 'contact' });
    absolute(contact, RESUME_CONTACT.right - contact.width, RESUME_CONTACT.y);

    const items = {
      education: 'Block/Resume/EducationItem',
      about: 'Block/Resume/AboutPara',
      experience: 'Block/Resume/ExperienceItem',
      project: 'Block/Cover/ProjectItem',
      skill: 'Block/Resume/SkillGroup',
    };
    const notes = {
      about: DEFAULT_NOTE,
      experience: 'Team Sample Studio에서 진행한 프로젝트는 Portfolio에 자세하게 작성되어 있습니다.',
      project: RESUME_PROJECT_NOTE,
    };
    for (const key of RESUME_SECTION_KEYS) {
      const sec = sectionFrame(c, key, RESUME_SECTION_GAP[key]);
      const head = addInst(sec, 'Block/SectionHeader', { name: 'head', w: 'FILL' });
      await setTextProp(head, 'title', RESUME_SECTION_TITLE[key]);
      setBoolProp(head, 'showRight', !!notes[key]);
      if (notes[key]) {
        const note = findInst(head, 'right');
        if (note) await setTextProp(note, 'text', notes[key]);
      }
      const list = listFrame(sec, RESUME_LIST_GAP[key], RESUME_LIST_PAD[key]);
      addItems(list, items[key], 1);
      if (RESUME_ITEM_FIXED_W[key]) {
        for (const it of list.children) {
          it.layoutSizingHorizontal = 'FIXED';
          it.resize(RESUME_ITEM_FIXED_W[key], it.height);
        }
      }
    }
    return c;
  },
  'Template/PortfolioCover': async () => {
    const c = templateComp('Template/PortfolioCover', 'A4 포트폴리오 표지 템플릿(상단 74). Profile(사진+스킬 4) + Project 6 슬롯.', PAGE_TOP.portfolioCover, 'space/section');
    addInst(c, 'Block/Cover/Header', { name: 'header', w: 'FILL' });

    const profile = sectionFrame(c, 'profile', 36);
    await pageTitle(profile, 'Profile', { rightText: '“다양한 문제에 정면으로 부딪히며,\n해결책을 찾아내는 개발자 홍길동 입니다.”' });
    const plist = listFrame(profile, 0);
    const row = put(plist, al('HORIZONTAL', { name: 'item', gap: COVER_PROFILE.gap, pl: COVER_PROFILE.inset, cross: 'MIN' }), { w: 'FILL' });
    const photo = figma.createRectangle();
    photo.name = 'photo';
    photo.resize(COVER_PROFILE.photoW, COVER_PROFILE.photoH);
    solidFill(photo, '#d9d9d9');
    row.appendChild(photo);
    const skills = put(row, al('VERTICAL', { name: 'skills', gap: 9, pt: COVER_PROFILE.skillsTop }), { w: 'FILL' });
    addItems(skills, 'Block/Cover/SkillGroup', 4, 'skill');

    const projects = sectionFrame(c, 'projects', 36);
    await pageTitle(projects, 'Project', { right: true });
    addItems(listFrame(projects, 'space/item-list', { pl: 35 }), 'Block/Cover/ProjectItem', 6);
    return c;
  },
  'Template/PortfolioDetail': async () => {
    const c = templateComp('Template/PortfolioDetail', 'A4 포트폴리오 상세 템플릿(회사 하나, 상단 66). 회사명(밑줄 19 아래) → 29 → 요약 → 19 → 프로젝트. 프로젝트는 Build all 이 블록 단위로 조립한다.', PAGE_TOP.portfolioDetail, 0);
    const company = sectionFrame(c, 'company', DETAIL.headGap);
    const head = await pageTitle(company, 'Example Corp', { right: true, rule: true });
    setDotGap(head, DETAIL.dotGap);
    const list = listFrame(company, 0, { pl: DETAIL.listPl });
    addInst(list, 'Block/Detail/Summary', { name: 'summary', w: 'FILL' });
    return c;
  },
  'Template/CoverLetter': async () => {
    const c = templateComp('Template/CoverLetter', 'A4 자기소개서 템플릿(상단 55). 헤더 → 30 → About Me → 21 → 단락 4 슬롯.', PAGE_TOP.coverLetter, 30);
    addInst(c, 'Block/Letter/Header', { name: 'header', w: 'FILL' });
    const about = sectionFrame(c, 'about', 21);
    await pageTitle(about, 'About Me', {});
    addItems(listFrame(about, 'space/para-letter', { pl: 'space/inner', pr: 'space/inner' }), 'Block/Letter/Paragraph', 4);
    return c;
  },
};

async function ensurePageBottomVar() {
  const v = S.vars.get('space/page-bottom');
  if (!v || !S.collection) return;
  const modeId = S.collection.modes[0].modeId;
  const cur = v.valuesByMode[modeId];
  if (typeof cur === 'number' && Math.abs(cur - PAGE_BOTTOM) > 0.001) {
    v.setValueForMode(modeId, PAGE_BOTTOM);
    info(`변수 "space/page-bottom" ${cur} → ${PAGE_BOTTOM}`);
  }
}

async function buildTemplates() {
  await prepare();
  const missing = BLOCK_ORDER.map(([n]) => n).filter((n) => !findComponent(n));
  if (missing.length) throw new Error(`Block 이 없습니다: ${missing.join(', ')} — 3단계 buildBlocks 를 먼저 실행하세요.`);
  const stale = BLOCK_ORDER.map(([n]) => n).filter((n) => compVersion(findComponent(n)) < (COMP_VERSIONS[n] || 1));
  if (stale.length) throw new Error(`구버전 Block 이 있습니다: ${stale.join(', ')} — 3단계 buildBlocks 를 다시 실행하세요.`);
  await ensurePageBottomVar();
  const tpl = await requirePage(PAGE_TPL);
  await figma.setCurrentPageAsync(tpl);
  for (let i = 0; i < TEMPLATE_ORDER.length; i++) {
    const name = TEMPLATES[TEMPLATE_ORDER[i]];
    const x = i * (PAGE_W + TEMPLATE_GAP);
    await ensureComp(name, TEMPLATE_BUILDERS[name], (node) => {
      tpl.appendChild(node);
      node.x = x;
      node.y = 0;
    }, (old) => {
      old.x = x;
      old.y = -(PAGE_H + 300) * compVersion(old);
    });
  }
}

// =====================================================================
// Step 5. buildAll (whole JSON, paginated) + fillTemplate (one kind)
// =====================================================================
function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function req(obj, path) {
  let cur = obj;
  for (const k of path.split('.')) {
    if (cur == null || typeof cur !== 'object' || !(k in cur)) throw new Error(`JSON 에 "${path}" 가 없습니다.`);
    cur = cur[k];
  }
  return cur;
}

function arr(v, path) {
  if (v == null) return [];
  if (!Array.isArray(v)) throw new Error(`JSON "${path}" 는 배열이어야 합니다.`);
  return v;
}

function str(v) {
  return v == null ? '' : String(v);
}

function joinTools(t) {
  return Array.isArray(t) ? t.join(', ') : String(t || '');
}

// bullets[] → body lines: each item is a level-1 bullet; its extra "\n" lines continue it.
function bulletText(bullets) {
  return (bullets || []).map((b) => {
    const parts = str(b).split('\n');
    const head = /^\s*[•·]/.test(parts[0]) ? parts[0] : '• ' + parts[0];
    return [head].concat(parts.slice(1).map((l) => '  ' + l.replace(/^\s+/, ''))).join('\n');
  }).join('\n');
}

async function fillContact(contact, p) {
  await fillText(contact, 'email', p.email, { rich: false });
  await fillText(contact, 'phone', p.phone, { rich: false });
  await fillText(contact, 'github', p.github.label, { rich: false, link: p.github.url });
  await fillText(contact, 'blog', p.blog.label, { rich: false, link: p.blog.url });
}

function validateProfile(json) {
  const p = req(json, 'profile');
  for (const k of ['name', 'email', 'phone']) req(json, 'profile.' + k);
  req(json, 'profile.github.label');
  req(json, 'profile.github.url');
  req(json, 'profile.blog.label');
  req(json, 'profile.blog.url');
  return p;
}

// ---------------------------------------------------------------------
// images: http(s) URL | data URI | bare filename (bytes sent by the UI)
// ---------------------------------------------------------------------
function shortRef(v) {
  const s = String(v);
  return s.length > 60 ? s.slice(0, 57) + '…' : s;
}

function baseName(v) {
  return String(v).split(/[?#]/)[0].split(/[\\/]/).pop();
}

function toBytes(b) {
  if (b instanceof Uint8Array) return b;
  if (b instanceof ArrayBuffer) return new Uint8Array(b);
  if (Array.isArray(b)) return new Uint8Array(b);
  if (b && typeof b === 'object') {
    const n = typeof b.length === 'number' ? b.length : Object.keys(b).length;
    const out = new Uint8Array(n);
    for (let i = 0; i < n; i++) out[i] = b[i];
    return out;
  }
  throw new Error('이미지 바이트 형식을 알 수 없습니다.');
}

async function resolveImage(ctx, value, label) {
  const v = str(value).trim();
  if (!v) return null;
  if (ctx.imageCache.has(v)) return ctx.imageCache.get(v);
  let hash = null;
  try {
    if (/^https?:\/\//i.test(v)) {
      const img = await figma.createImageAsync(v);
      hash = img.hash;
    } else {
      let bytes = ctx.images[v] || null;
      if (!bytes && /^data:/i.test(v)) {
        const m = /^data:[^,]*;base64,([\s\S]*)$/i.exec(v);
        if (m) bytes = figma.base64Decode(m[1]);
      }
      if (!bytes) bytes = ctx.images[baseName(v)] || null;
      if (bytes) {
        hash = figma.createImage(toBytes(bytes)).hash;
      } else {
        warn(`${label}: 이미지 "${shortRef(v)}" 를 찾지 못했습니다. 플러그인 창에서 이미지 폴더를 선택/드롭한 뒤 다시 실행하세요. 이 자리는 숨깁니다.`);
      }
    }
  } catch (e) {
    warn(`${label}: 이미지 "${shortRef(v)}" 를 넣지 못했습니다 (${e && e.message ? e.message : e}). 이 자리는 숨깁니다.`);
    hash = null;
  }
  ctx.imageCache.set(v, hash);
  if (hash) ctx.imageCount++;
  return hash;
}

function paintImage(node, hash) {
  node.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: hash }];
}

// Plain slot (photo rect / ellipse). No value → placeholder kept. Unresolved → hidden.
async function imageSlot(ctx, node, value, label) {
  if (!str(value).trim()) return 'none';
  if (!node) {
    warn(`${label}: 이미지 자리(photo)를 찾지 못했습니다.`);
    return 'missing';
  }
  const hash = await resolveImage(ctx, value, label);
  if (!hash) {
    node.visible = false;
    return 'missing';
  }
  paintImage(node, hash);
  node.visible = true;
  return 'ok';
}

// ---------------------------------------------------------------------
// Rich body: one row per line so bullets hang exactly (SPEC2).
//   "• text" level 1 · "  • text" level 2 (+24) · "## text" accent subhead · plain line
// ---------------------------------------------------------------------
// Body line rules (same as lines() in docs/kb-preview.html):
//   "• " level-1 bullet · "  • " (2+ spaces) level-2 bullet · "## " accent subhead (when allowed)
//   plain line starting with 2–3 spaces = continuation at level-1 text x, 4+ spaces = level-2 text x
function bodyLines(md, allowHeading) {
  const out = [];
  for (const raw of str(md).split('\n')) {
    let m = /^\s{2,}[•·]\s?(.*)$/.exec(raw);
    if (m) { out.push({ kind: 'b2', text: m[1] }); continue; }
    m = /^[•·]\s?(.*)$/.exec(raw);
    if (m) { out.push({ kind: 'b1', text: m[1] }); continue; }
    if (allowHeading) {
      m = /^##\s+(.*)$/.exec(raw);
      if (m) { out.push({ kind: 'h', text: m[1] }); continue; }
    }
    m = /^( {2,})(\S.*)$/.exec(raw);
    if (m) { out.push({ kind: m[1].length >= 4 ? 'c2' : 'c1', text: m[2] }); continue; }
    out.push({ kind: 'p', text: raw });
  }
  return out;
}

function needsRich(md, allowHeading) {
  return bodyLines(md, allowHeading).some((l) => l.kind !== 'p');
}

// o: {name, style, headingStyle, indent1, indent2, hang}
async function buildRichBody(parent, md, o, index) {
  const box = al('VERTICAL', { name: o.name || 'body', gap: 0 });
  if (index != null) parent.insertChild(index, box);
  else parent.appendChild(box);
  box.layoutSizingHorizontal = 'FILL';
  for (const ln of bodyLines(md, !!o.allowHeading)) {
    if (ln.kind === 'b1' || ln.kind === 'b2') {
      const row = put(box, al('HORIZONTAL', { name: ln.kind === 'b1' ? 'bullet1' : 'bullet2', pl: ln.kind === 'b1' ? o.indent1 : o.indent2, cross: 'MIN' }), { w: 'FILL' });
      await text({ name: 'glyph', style: o.style, chars: '•', parent: row, size: o.hang });
      const t = await text({ name: 'line', style: o.style, chars: '', parent: row, size: 'FILL', width: 400 });
      await writeText(t, ln.text);
    } else if (ln.kind === 'c1' || ln.kind === 'c2') {
      const pl = (ln.kind === 'c1' ? o.indent1 : o.indent2) + o.hang;
      const row = put(box, al('HORIZONTAL', { name: 'cont', pl, cross: 'MIN' }), { w: 'FILL' });
      const t = await text({ name: 'line', style: o.style, chars: '', parent: row, size: 'FILL', width: 400 });
      await writeText(t, ln.text);
    } else if (ln.kind === 'h') {
      const t = await text({ name: 'subhead', style: o.headingStyle || o.style, fill: 'color/accent', chars: '', parent: box, size: 'FILL', width: 400 });
      await writeText(t, ln.text);
    } else {
      const t = await text({ name: 'line', style: o.style, chars: '', parent: box, size: 'FILL', width: 400 });
      await writeText(t, ln.text);
    }
  }
  return box;
}

// Fill a body text slot. Plain text stays in the (instance) text node. Bullet/subhead
// bodies detach the item (nested atoms stay instances) and replace the text node with rows.
// Returns the item node to keep using (the detached frame when detached).
async function fillRichSlot(item, name, md, o) {
  if (!needsRich(md, !!o.allowHeading)) {
    await fillText(item, name, md);
    return item;
  }
  let node = item;
  if (node.type === 'INSTANCE') node = node.detachInstance();
  const t = findNode(node, name, 'TEXT');
  if (!t) {
    warn(`"${node.name}" 에서 본문 "${name}" 를 찾지 못했습니다.`);
    return node;
  }
  const parent = t.parent;
  const idx = parent.children.indexOf(t);
  await buildRichBody(parent, md, Object.assign({ name }, o), idx);
  t.remove();
  return node;
}

const ABOUT_RICH = { style: 'KB/Body/About', headingStyle: 'KB/Para/Heading', indent1: 0, indent2: 24, hang: RICH_BULLETS.hang };
const PROJECT_RICH = { style: 'KB/Body/Bullet', indent1: PROJECT_BULLET_X, indent2: PROJECT_BULLET_X + 24, hang: RICH_BULLETS.hang };
const DETAIL_RICH = { style: 'KB/Body/Default', headingStyle: 'KB/Detail/Heading', allowHeading: true, indent1: RICH_BULLETS.indent1, indent2: RICH_BULLETS.indent2, hang: RICH_BULLETS.hang };

function toolList(t) {
  if (Array.isArray(t)) return t.map(str).map((x) => x.trim()).filter(Boolean);
  return str(t).split(',').map((x) => x.trim()).filter(Boolean);
}

function projectBody(pr) {
  if (typeof pr.body === 'string' && pr.body.trim()) return pr.body;
  return bulletText(Array.isArray(pr.bullets) ? pr.bullets : []);
}

// Block/Cover/ProjectItem (cover + resume project). Props first, detach (if any) last.
async function fillProjectItem(it, pr) {
  await fillText(it, 'title', str(pr.title), { rich: false, link: pr.url });
  await fillText(it, 'date', str(pr.period), { rich: false });
  const tools = toolList(pr.tools);
  if (tools.length > TOOL_SLOTS) warn(`프로젝트 "${pr.title}": 기술은 최대 ${TOOL_SLOTS}개만 표시합니다.`);
  for (let i = 1; i <= TOOL_SLOTS; i++) {
    const t = findNode(it, 'tool' + i, 'TEXT');
    if (!t) continue;
    if (tools[i - 1]) {
      await writeText(t, tools[i - 1], { rich: false });
      t.visible = true;
    } else {
      t.visible = false;
    }
  }
  const links = (pr.links || []).slice(0, 2);
  if ((pr.links || []).length > 2) warn(`프로젝트 "${pr.title}": 링크는 최대 2개만 표시합니다.`);
  const l1 = findInst(it, 'link1');
  const l2 = findInst(it, 'link2');
  if (l1) {
    l1.visible = links.length > 0;
    if (links[0]) await fillText(l1, 'label', str(links[0].label), { rich: false, link: links[0].url });
  }
  setBoolProp(it, 'showLink2', links.length > 1);
  if (l2 && links[1]) await fillText(l2, 'label', str(links[1].label), { rich: false, link: links[1].url });
  return fillRichSlot(it, 'bullets', projectBody(pr), PROJECT_RICH);
}

// ---------------------------------------------------------------------
// Resume (SPEC2 §1): sections in resume.sections order (else JSON key order)
// ---------------------------------------------------------------------
function resumeOrder(d) {
  const order = Array.isArray(d.sections) && d.sections.length ? d.sections.map(str) : RESUME_SECTION_KEYS;
  const out = [];
  for (const k of order) {
    if (!RESUME_SECTION_KEYS.includes(k)) {
      warn(`resume.sections: "${k}" 는 알 수 없는 섹션이라 건너뜁니다 (${RESUME_SECTION_KEYS.join(', ')}).`);
      continue;
    }
    if (!out.includes(k)) out.push(k);
  }
  return out;
}

function noteHead(text) {
  return async (head, cont) => {
    const t = str(text).trim();
    setBoolProp(head, 'showRight', !cont && !!t);
    if (cont || !t) return;
    const note = findInst(head, 'right');
    if (note) await fillText(note, 'text', t, { rich: false });
  };
}

function sectionNote(d, key) {
  if (key === 'about') return str(d.note).trim() || DEFAULT_NOTE;
  return str(d[RESUME_NOTE_KEY[key]]);
}

const RESUME_SECTIONS = {
  education: (d) => ({
    head: noteHead(sectionNote(d, 'education')),
    units: arr(d.education, 'resume.education').map((e) => ({
      slot: 0,
      fill: async (n) => {
        await fillText(n, 'school', str(e.school), { rich: false });
        await fillText(n, 'dept', str(e.dept), { rich: false });
        await fillText(n, 'meta', str(e.meta), { rich: false });
      },
    })),
  }),
  about: (d) => ({
    head: noteHead(sectionNote(d, 'about')),
    units: arr(d.about, 'resume.about').map((a) => ({
      slot: 0,
      fill: async (n) => {
        await fillText(n, 'heading', str(a.heading), { rich: false });
        return fillRichSlot(n, 'body', str(a.body), ABOUT_RICH);
      },
    })),
  }),
  experience: (d) => ({
    head: noteHead(sectionNote(d, 'experience')),
    units: arr(d.experience, 'resume.experience').map((e) => ({
      slot: 0,
      fill: async (n) => {
        await fillText(n, 'title', str(e.title), { rich: false, link: e.url });
        await fillText(n, 'date', str(e.period), { rich: false });
        await fillText(n, 'body', str(e.body));
      },
    })),
  }),
  project: (d) => ({
    head: noteHead(sectionNote(d, 'project')),
    units: arr(d.projects, 'resume.projects').map((pr) => ({ slot: 0, fill: (n) => fillProjectItem(n, pr) })),
  }),
  skill: (d) => ({
    head: noteHead(sectionNote(d, 'skill')),
    units: arr(d.skills, 'resume.skills').map((sk) => ({
      slot: 0,
      fill: async (n) => {
        await fillText(n, 'category', str(sk.category), { rich: false });
        await fillText(n, 'tools', joinTools(sk.tools), { rich: false });
        await fillText(n, 'description', str(sk.description));
      },
    })),
  }),
};

// Resume logo (SPEC2 §0): height 60 (resume.logoHeight), width by ratio up to 270,
// x = name right + 20, y = 55, FIT. No value → hidden.
async function fillResumeLogo(page, d, ctx) {
  const logo = childNamed(page, 'logo');
  const value = str(d.logo).trim();
  if (!logo) {
    if (value) warn('이력서 로고 자리(logo)를 찾지 못했습니다. 4단계 Templates 를 다시 실행하세요.');
    return;
  }
  logo.visible = false;
  if (!value) return;
  const hash = await resolveImage(ctx, value, '이력서 로고');
  if (!hash) return;
  const lh = Number(d.logoHeight);
  const h = lh > 0 ? Math.round(lh) : RESUME_LOGO.h;
  let w = RESUME_LOGO.maxW;
  try {
    const size = await imageSize(hash);
    if (size) w = Math.max(1, Math.min(RESUME_LOGO.maxW, Math.round(h * size.width / size.height)));
    else warn(`이력서 로고: 이미지 크기를 읽지 못해 ${w}×${h} 자리에 맞춰 넣습니다.`);
  } catch (e) {
    warn(`이력서 로고: 이미지 크기를 읽지 못해 ${w}×${h} 자리에 맞춰 넣습니다 (${e && e.message ? e.message : e}).`);
  }
  const header = findNode(page, 'header', 'INSTANCE');
  let x = RESUME_LOGO.defaultX;
  if (header) {
    const headerX = header.absoluteTransform[0][2] - page.absoluteTransform[0][2];
    const name = textNodeFor(header, 'name');
    x = Math.round(headerX + (name ? name.width : 0) + RESUME_LOGO.gap);
  }
  logo.resize(w, h);
  logo.x = x;
  logo.y = RESUME_LOGO.y;
  logo.fills = [{ type: 'IMAGE', scaleMode: 'FIT', imageHash: hash }];
  logo.visible = true;
}

// ---------------------------------------------------------------------
// Page kinds for the generic engine (resume, coverLetter, portfolioCover).
// A section = template frame `key` (head + boxes). A unit is one pagination
// item cloned from the slot prototype `proto` inside `box`; fill may return
// a replacement node (detached item).
// ---------------------------------------------------------------------
const KINDS = {
  resume: {
    tpl: 'Template/Resume',
    vrule: null,
    contTop: RESUME_CONT_TOP,
    shellKeys: RESUME_SECTION_KEYS,
    header: async (page, d, p, ctx) => {
      const header = need(page, 'header', 'INSTANCE');
      await fillText(header, 'name', p.name, { rich: false });
      await fillText(header, 'tagline', str(d.tagline), { rich: false });
      await fillResumeLogo(page, d, ctx);
      const contact = childNamed(page, 'contact');
      if (contact && contact.type === 'INSTANCE') {
        await fillContact(contact, p);
        contact.x = RESUME_CONTACT.right - contact.width;
        contact.y = RESUME_CONTACT.y;
      } else {
        warn('이력서 연락처(contact)를 찾지 못했습니다. 4단계 Templates 를 다시 실행하세요.');
      }
    },
    sections: (d) => resumeOrder(d).map((key) => {
      const def = RESUME_SECTIONS[key](d);
      return { key, slots: [{ box: ['list'], proto: 'item', fixedW: RESUME_ITEM_FIXED_W[key] }], head: def.head, units: def.units };
    }),
  },

  coverLetter: {
    tpl: 'Template/CoverLetter',
    vrule: 7,
    header: async (page, d, p, ctx) => {
      const header = need(page, 'header', 'INSTANCE');
      await fillText(header, 'name', p.name, { rich: false });
      await fillText(header, 'tagline', str(d.tagline), { rich: false });
      const contact = findInst(header, 'contact') || (await findInstByComp(header, 'Atom/Contact'));
      if (contact) await fillContact(contact, p);
      else warn('자기소개서 헤더에서 연락처를 찾지 못했습니다.');
      await imageSlot(ctx, findNode(header, 'photo'), d.photo, '자기소개서 사진');
    },
    sections: (d) => [
      {
        key: 'about',
        slots: [{ box: ['list'], proto: 'item' }],
        head: async (head) => {
          setBoolProp(head, 'showRight', false);
          setBoolProp(head, 'showRule', false);
        },
        units: arr(d.paragraphs, 'coverLetter.paragraphs').map((q) => ({
          slot: 0,
          fill: async (n) => {
            await fillText(n, 'heading', str(q.heading), { rich: false });
            await fillText(n, 'body', str(q.body));
          },
        })),
      },
    ],
  },

  portfolioCover: {
    tpl: 'Template/PortfolioCover',
    vrule: 16,
    header: async (page, d, p) => {
      const header = need(page, 'header', 'INSTANCE');
      await fillText(header, 'name', p.name, { rich: false });
      await fillText(header, 'email', p.email, { rich: false });
      await fillText(header, 'github', p.github.label, { rich: false, link: p.github.url });
      await fillText(header, 'blog', p.blog.label, { rich: false, link: p.blog.url });
    },
    sections: (d) => [
      {
        key: 'profile',
        slots: [{ box: ['list'], proto: 'item' }],
        head: async (head) => {
          const t = str(d.tagline);
          setBoolProp(head, 'showRight', false);
          setBoolProp(head, 'showRule', false);
          setBoolProp(head, 'showRightText', !!t);
          if (t) await fillText(head, 'rightText', t, { rich: false });
        },
        units: [{
          slot: 0,
          fill: async (row, ctx) => {
            await imageSlot(ctx, findNode(row, 'photo'), d.photo, '포트폴리오 표지 사진');
            const list = arr(d.skills, 'portfolio.cover.skills');
            const box = need(row, 'skills');
            let skills = box.children.filter((n) => n.name === 'skill');
            if (!skills.length) throw new Error('표지 템플릿에 skill 슬롯이 없습니다.');
            while (skills.length < list.length) {
              const cl = skills[skills.length - 1].clone();
              box.appendChild(cl);
              try { cl.layoutSizingHorizontal = 'FILL'; } catch (e) { /* keep */ }
              skills.push(cl);
            }
            skills.forEach((s, i) => { s.visible = i < list.length; });
            for (let i = 0; i < list.length; i++) {
              const s = list[i];
              await fillText(skills[i], 'category', str(s.category), { rich: false });
              await fillText(skills[i], 'tools', joinTools(s.tools), { rich: false });
              await fillText(skills[i], 'description', str(s.description));
            }
          },
        }],
      },
      {
        key: 'projects',
        slots: [{ box: ['list'], proto: 'item' }],
        head: async (head, cont) => {
          setBoolProp(head, 'showRule', false);
          setBoolProp(head, 'showRightText', false);
          setBoolProp(head, 'showRight', !cont);
          if (cont) return;
          const note = findInst(head, 'right');
          if (note) await fillText(note, 'text', d.projectsNote || DEFAULT_NOTE, { rich: false });
        },
        units: arr(d.projects, 'portfolio.cover.projects').map((pr) => ({ slot: 0, fill: (it) => fillProjectItem(it, pr) })),
      },
    ],
  },
};

async function imageSize(hash) {
  const image = figma.getImageByHash(hash);
  const size = image ? await image.getSizeAsync() : null;
  return size && size.width > 0 && size.height > 0 ? size : null;
}

// ---------------------------------------------------------------------
// Pagination helpers
// ---------------------------------------------------------------------
const FILLED_RE = /_(resume|coverLetter|portfolioCover|portfolioDetail)(-\d+)?(_\d+)?_\d{4}-\d{2}-\d{2}$/;

function nextFilledIndex(page) {
  let next = 0;
  for (const n of page.children) {
    if (!FILLED_RE.test(n.name)) continue;
    next = Math.max(next, Math.round(n.x / FILLED_STEP) + 1);
  }
  return next;
}

function contentBottom(page) {
  let bottom = 0;
  for (const ch of page.children) {
    if (!ch.visible || ch.layoutPositioning === 'ABSOLUTE') continue;
    bottom = Math.max(bottom, ch.y + ch.height);
  }
  return bottom;
}

function fits(page) {
  return contentBottom(page) <= page.height - page.paddingBottom + 0.5;
}

function overBy(page) {
  return Math.round(contentBottom(page) - (page.height - page.paddingBottom));
}

function childNamed(node, name) {
  return node.children.find((n) => n.name === name) || null;
}

function clearSlots(shell, sec) {
  for (const sl of sec.slots) {
    const box = needPath(shell, sl.box);
    for (const ch of box.children.slice()) if (ch.name === sl.proto) ch.remove();
  }
}

function placeInSlot(shell, sl, node) {
  const box = needPath(shell, sl.box);
  if (sl.at === 0) box.insertChild(0, node);
  else box.appendChild(node);
  try {
    if (sl.fixedW) {
      node.layoutSizingHorizontal = 'FIXED';
      node.resize(sl.fixedW, node.height);
    } else {
      node.layoutSizingHorizontal = 'FILL';
    }
  } catch (e) { /* keep template sizing */ }
}

function relY(page, n) {
  return n.absoluteTransform[1][2] - page.absoluteTransform[1][2];
}

function addVRule(page, top, end) {
  top = Math.round(top);
  end = Math.round(end);
  if (end - top < VRULE_MIN) return false;
  const r = figma.createRectangle();
  r.name = 'vrule';
  r.resize(1, end - top);
  bindFill(r, 'color/ink');
  page.insertChild(0, r);
  r.layoutPositioning = 'ABSOLUTE';
  r.x = VRULE_X;
  r.y = top;
  return true;
}

async function addVRules(page, offset) {
  for (const ch of page.children.slice()) if (ch.name === 'vrule' && ch.type === 'RECTANGLE') ch.remove();
  const candidates = [];
  walk(page, (n) => {
    if (n.type === 'INSTANCE' && n.name === 'head' && n.visible) candidates.push(n);
  });
  const heads = [];
  for (const h of candidates) {
    const mc = await h.getMainComponentAsync();
    if (mc && mc.name === 'Block/PageTitle') heads.push(h);
  }
  heads.sort((a, b) => relY(page, a) - relY(page, b));
  let count = 0;
  for (let i = 0; i < heads.length; i++) {
    const top = relY(page, heads[i]) + heads[i].height + offset;
    const end = heads[i + 1] ? relY(page, heads[i + 1]) - VRULE_GAP_BEFORE_TITLE : VRULE_END;
    if (addVRule(page, top, end)) count++;
  }
  return count;
}

function makePager(ctx, p, label) {
  const pages = [];
  const add = (node) => {
    if (node.parent !== ctx.page) ctx.page.appendChild(node);
    node.name = `${p.name}_${label}_${pages.length + 1}_${ctx.date}`;
    node.x = ctx.nextIndex * FILLED_STEP;
    node.y = FILLED_Y;
    ctx.nextIndex++;
    pages.push(node);
    ctx.created.push(node);
    return node;
  };
  return { pages, add };
}

async function buildKind(ctx, kindKey, d, p, label) {
  const K = KINDS[kindKey];
  const tpl = findComponent(K.tpl);
  const pager = makePager(ctx, p, label);
  const pages = pager.pages;

  const inst = tpl.createInstance();
  ctx.page.appendChild(inst);
  const first = pager.add(inst.detachInstance());

  const sections = K.sections(d, p);
  const blank = first.clone();
  ctx.store.appendChild(blank);
  for (const ch of blank.children.slice()) ch.remove();

  const protos = {};
  for (const sec of sections) {
    const shell = childNamed(first, sec.key);
    if (!shell) throw new Error(`${K.tpl} 에 섹션 "${sec.key}" 가 없습니다. 4단계 Templates 를 다시 실행하세요.`);
    const proto = shell.clone();
    ctx.store.appendChild(proto);
    for (const sl of sec.slots) {
      if (!needPath(proto, sl.box).children.some((n) => n.name === sl.proto)) {
        throw new Error(`${K.tpl}/${sec.key} 에 "${sl.proto}" 슬롯이 없습니다. 4단계 Templates 를 다시 실행하세요.`);
      }
    }
    protos[sec.key] = proto;
  }
  const shellKeys = new Set((K.shellKeys || []).concat(sections.map((sec) => sec.key)));
  for (const ch of first.children.slice()) if (shellKeys.has(ch.name)) ch.remove();

  if (K.header) await K.header(first, d, p, ctx);

  const newShell = async (page, sec, cont) => {
    const sh = protos[sec.key].clone();
    page.appendChild(sh);
    clearSlots(sh, sec);
    const head = childNamed(sh, 'head');
    if (head && sec.head) await sec.head(head, cont);
    return sh;
  };
  const newItem = (sec, unit) => {
    const sl = sec.slots[unit.slot];
    const src = needPath(protos[sec.key], sl.box).children.find((n) => n.name === sl.proto);
    const node = src.clone();
    node.visible = true;
    return node;
  };

  let page = first;
  let oversize = 0;
  for (const sec of sections) {
    if (!sec.units.length) {
      info(`${label}: "${sec.key}" 항목이 없어 섹션을 생략합니다.`);
      continue;
    }
    let shell = await newShell(page, sec, false);
    let placed = 0;
    for (const unit of sec.units) {
      const sl = sec.slots[unit.slot];
      let node = newItem(sec, unit);
      placeInSlot(shell, sl, node);
      const filled = await unit.fill(node, ctx);
      if (filled && filled !== node && !filled.removed) node = filled;
      if (!fits(page)) {
        const oldShell = shell;
        const wasEmpty = placed === 0;
        const np = blank.clone();
        if (K.contTop != null) np.paddingTop = K.contTop;
        pager.add(np);
        page = np;
        shell = await newShell(page, sec, !wasEmpty);
        placeInSlot(shell, sl, node);
        if (wasEmpty) oldShell.remove();
        placed = 0;
        if (!fits(page)) {
          oversize++;
          warn(`${label} ${pages.length}쪽: "${sec.key}" 항목 하나가 A4 한 장보다 큽니다 (${overBy(page)}px 넘침). 본문을 줄이거나 나눠 주세요.`);
        }
      }
      placed++;
    }
  }

  if (K.vrule != null) {
    for (const pg of pages) await addVRules(pg, K.vrule);
  }
  info(`${label}: ${pages.length}장${oversize ? `, 한 장보다 큰 항목 ${oversize}개` : ''}`);
  return pages;
}

// ---------------------------------------------------------------------
// Portfolio detail (SPEC2 §3): block flow model
// ---------------------------------------------------------------------
function detailBlocks(pr) {
  if (Array.isArray(pr.blocks)) return pr.blocks.filter((b) => b && typeof b === 'object');
  const out = [];
  for (const sec of pr.sections || []) out.push({ type: 'section', heading: sec.heading, body: sec.body });
  if (str(pr.image).trim()) out.push({ type: 'image', src: pr.image });
  return out;
}

function blockType(b) {
  return str(b.type || 'section');
}

function blockGap(prev, cur) {
  if (!prev) return 0;
  return blockType(prev) === 'section' && blockType(cur) === 'section' ? DETAIL.gapSection : DETAIL.gapImage;
}

async function figureFrame(parent, hash, w, h, caption) {
  const fig = put(parent, al('VERTICAL', { name: 'figure', gap: DETAIL.captionGap, cross: 'CENTER' }));
  const img = figma.createRectangle();
  img.name = 'image';
  img.resize(Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  fig.appendChild(img);
  img.fills = [{ type: 'IMAGE', scaleMode: 'FIT', imageHash: hash }];
  const cap = str(caption).trim();
  if (cap) {
    const t = await text({ name: 'caption', style: 'KB/Caption/Image', chars: '', align: 'CENTER', parent: fig, size: Math.max(40, Math.round(w)) });
    await writeText(t, cap);
  }
  return fig;
}

async function buildImageBlock(ctx, wrap, b, label) {
  const hash = await resolveImage(ctx, b.src, label);
  if (!hash) return false;
  let size = null;
  try { size = await imageSize(hash); } catch (e) { size = null; }
  let w = Number(b.width) > 0 ? Math.min(DETAIL.fullW, Number(b.width)) : DETAIL.fullW;
  let h = size ? Math.round(w * size.height / size.width) : DETAIL_IMAGE_UNKNOWN_H;
  if (!size) warn(`${label}: 이미지 크기를 읽지 못해 ${w}×${h} 자리에 맞춰 넣습니다.`);
  if (h > DETAIL.imageMaxH) {
    w = Math.round(w * DETAIL.imageMaxH / h);
    h = DETAIL.imageMaxH;
  }
  await figureFrame(wrap, hash, w, h, b.caption);
  return true;
}

async function buildImagesBlock(ctx, wrap, b, label) {
  const items = [];
  for (const it of Array.isArray(b.items) ? b.items : []) {
    if (!it || !str(it.src).trim()) continue;
    const hash = await resolveImage(ctx, it.src, label);
    if (!hash) continue;
    let size = null;
    try { size = await imageSize(hash); } catch (e) { size = null; }
    items.push({ hash, ratio: size ? size.width / size.height : 4 / 3, caption: it.caption });
  }
  if (!items.length) return false;
  const gap = b.gap != null && Number(b.gap) >= 0 ? Number(b.gap) : DETAIL.imagesGap;
  const sumRatio = items.reduce((a, it) => a + it.ratio, 0);
  let h = DETAIL.imagesMaxH;
  const room = DETAIL.fullW - gap * (items.length - 1);
  if (h * sumRatio > room) h = room / sumRatio;
  h = Math.floor(h);
  const row = put(wrap, al('HORIZONTAL', { name: 'images', gap, cross: 'MIN' }));
  for (const it of items) await figureFrame(row, it.hash, Math.floor(h * it.ratio), h, it.caption);
  return true;
}

// Code hugs its text up to 994 (wraps beyond), centered like the preview's <pre>.
async function buildCodeBlock(wrap, b) {
  const box = put(wrap, al('VERTICAL', { name: 'code', px: DETAIL.codePad, py: DETAIL.codePad }));
  solidFill(box, '#f6f6f6');
  const t = await text({ name: 'code', style: CODE_STYLE, chars: str(b.text), parent: box });
  const maxText = DETAIL.fullW - DETAIL.codePad * 2;
  if (t.width > maxText) {
    t.textAutoResize = 'HEIGHT';
    t.resize(maxText, Math.max(1, t.height));
  }
  return true;
}

// Appends one block (wrapped, top padding = gap) to `column`. Returns the wrapper or null.
// Sections are 720 beside the sidebar and 994 below it (pr 36 inside the 1030 column);
// image / images / code are centered in the 1030 column (x 105 → 1135).
function fitBlockWrap(wrap, type, below) {
  if (type === 'section') {
    wrap.counterAxisAlignItems = 'MIN';
    wrap.paddingRight = below ? DETAIL.columnW - DETAIL.fullW : 0;
  } else {
    wrap.counterAxisAlignItems = 'CENTER';
    wrap.paddingRight = 0;
  }
}

async function buildDetailBlock(ctx, column, b, gap, label, below) {
  const type = blockType(b);
  const wrap = put(column, al('VERTICAL', { name: 'block:' + type, pt: gap }), { w: 'FILL' });
  fitBlockWrap(wrap, type, below);
  let okBlock = true;
  if (type === 'section') {
    if (str(b.heading).trim()) {
      const h = await text({ name: 'heading', style: 'KB/Detail/Heading', chars: '', parent: wrap, size: 'FILL', width: 400 });
      await writeText(h, b.heading, { rich: false });
    }
    await buildRichBody(wrap, b.body, Object.assign({ name: 'body' }, DETAIL_RICH));
  } else if (type === 'image') {
    okBlock = await buildImageBlock(ctx, wrap, b, label);
  } else if (type === 'images') {
    okBlock = await buildImagesBlock(ctx, wrap, b, label);
  } else if (type === 'code') {
    okBlock = await buildCodeBlock(wrap, b);
  } else {
    warn(`${label}: 알 수 없는 블록 종류 "${type}" 는 건너뜁니다 (section / image / images / code).`);
    okBlock = false;
  }
  if (!okBlock) {
    wrap.remove();
    return null;
  }
  return wrap;
}

async function fillSide(side, pr) {
  await fillText(side, 'period', str(pr.period), { rich: false });
  const links = Array.isArray(pr.links) ? pr.links.filter((l) => l && str(l.label).trim()) : [];
  if (links.length > SIDE_LINK_SLOTS) warn(`프로젝트 "${pr.title}": 사이드 링크는 최대 ${SIDE_LINK_SLOTS}개만 표시합니다.`);
  for (let i = 1; i <= SIDE_LINK_SLOTS; i++) {
    const row = findNode(side, 'link' + i);
    if (!row) continue;
    const l = links[i - 1];
    row.visible = !!l;
    if (l) await fillText(side, 'linkLabel' + i, str(l.label), { rich: false, link: l.url });
  }
  const lw = findNode(side, 'linksWrap');
  if (lw) lw.visible = links.length > 0;
  const tags = Array.isArray(pr.tags) ? pr.tags.map(str).filter(Boolean) : [];
  if (tags.length > SIDE_TAG_SLOTS) warn(`프로젝트 "${pr.title}": 태그는 최대 ${SIDE_TAG_SLOTS}개만 표시합니다.`);
  for (let i = 1; i <= SIDE_TAG_SLOTS; i++) {
    const tag = findInst(side, 'tag' + i);
    if (!tag) continue;
    tag.visible = !!tags[i - 1];
    if (tags[i - 1]) await fillText(tag, 'label', tags[i - 1], { rich: false });
  }
}

// Project frame: head + content(pt 30) > [body row: beside(720) | 59 | side] + below(994).
function setTitleInset(head, px) {
  const row = findNode(head, 'row');
  if (!row) return;
  try {
    row.paddingLeft = px;
  } catch (e) {
    warn(`프로젝트 제목 들여쓰기(${px})를 바꾸지 못했습니다: ${e.message || e}`);
  }
}

async function newProjectFrame(list, pt, headSource, pr, withSide) {
  const pf = put(list, al('VERTICAL', { name: 'project', pt }), { w: 'FILL' });
  let head;
  if (headSource) {
    head = headSource.clone();
    pf.appendChild(head);
    try { head.layoutSizingHorizontal = 'FILL'; } catch (e) { /* keep */ }
  } else {
    head = addInst(pf, 'Block/Detail/ProjectHead', { name: 'head', w: 'FILL' });
    await fillText(head, 'title', str(pr.title), { rich: false });
    await fillText(head, 'subtitle', str(pr.subtitle), { rich: false });
  }
  const content = put(pf, al('VERTICAL', { name: 'content', pt: DETAIL.contentPt }), { w: 'FILL' });
  const st = { pf, head, beside: null, side: null, below: null, mode: 'below', prevBeside: null, prevBelow: null };
  if (withSide) {
    const body = put(content, al('HORIZONTAL', { name: 'body', gap: DETAIL.sideGap, cross: 'MIN' }), { w: 'FILL' });
    const bw = put(body, al('VERTICAL', { name: 'besideWrap', pl: DETAIL.ruleInset }));
    bw.layoutSizingHorizontal = 'FIXED';
    bw.resize(DETAIL.ruleInset + DETAIL.besideW, Math.max(1, bw.height));
    st.beside = put(bw, al('VERTICAL', { name: 'beside' }), { w: 'FILL' });
    st.side = addInst(body, 'Block/Detail/Side', { name: 'side' });
    await fillSide(st.side, pr);
    st.mode = 'beside';
  }
  const belowWrap = put(content, al('VERTICAL', { name: 'belowWrap', pl: DETAIL.ruleInset }), { w: 'FILL' });
  st.below = put(belowWrap, al('VERTICAL', { name: 'below' }), { w: 'FILL' });
  return st;
}

// Beside the sidebar only sections (720 wide) until the beside column is as tall as the
// sidebar; everything else goes below at 994. First below block: gap from the taller side.
async function placeDetailBlock(ctx, st, b, label) {
  if (st.mode === 'beside' && blockType(b) === 'section') {
    const wrap = await buildDetailBlock(ctx, st.beside, b, blockGap(st.prevBeside, b), label, false);
    if (!wrap) return null;
    st.prevBeside = b;
    if (st.beside.height >= st.side.height) st.mode = 'below';
    return wrap;
  }
  let gap;
  if (st.prevBelow) gap = blockGap(st.prevBelow, b);
  else if (st.side) gap = st.prevBeside && st.beside.height >= st.side.height ? blockGap(st.prevBeside, b) : DETAIL.gapImage;
  else gap = 0;
  st.mode = 'below';
  const wrap = await buildDetailBlock(ctx, st.below, b, gap, label, true);
  if (!wrap) return null;
  st.prevBelow = b;
  return wrap;
}

async function buildDetail(ctx, d, p, label) {
  const tpl = findComponent(TEMPLATES.portfolioDetail);
  const pager = makePager(ctx, p, label);
  const pages = pager.pages;
  const inst = tpl.createInstance();
  ctx.page.appendChild(inst);
  const first = pager.add(inst.detachInstance());
  const company = childNamed(first, 'company');
  if (!company) throw new Error(`${TEMPLATES.portfolioDetail} 에 "company" 가 없습니다. 4단계 Templates 를 다시 실행하세요.`);
  const head = childNamed(company, 'head');
  const firstList = childNamed(company, 'list');
  if (!head || !firstList) throw new Error(`${TEMPLATES.portfolioDetail} 구조가 다릅니다. 4단계 Templates 를 다시 실행하세요.`);

  const blank = first.clone();
  ctx.store.appendChild(blank);
  for (const ch of blank.children.slice()) ch.remove();
  blank.paddingTop = DETAIL.contTop;
  const listProto = firstList.clone();
  ctx.store.appendChild(listProto);
  for (const ch of listProto.children.slice()) ch.remove();

  await fillText(head, 'title', str(d.company), { rich: false, link: d.companyUrl });
  setBoolProp(head, 'showRule', true);
  setBoolProp(head, 'showRightText', false);
  setBoolProp(head, 'showRight', true);
  setDotGap(head, DETAIL.dotGap);

  const summary = childNamed(firstList, 'summary');
  if (summary) {
    if (d.summary && (str(d.summary.headline).trim() || str(d.summary.sub).trim())) {
      await fillText(summary, 'headline', str(d.summary.headline), { rich: false });
      await fillText(summary, 'sub', str(d.summary.sub));
    } else {
      summary.remove();
    }
  }

  let page = first;
  let list = firstList;
  let oversize = 0;
  const newPage = () => {
    const np = blank.clone();
    pager.add(np);
    const l = listProto.clone();
    np.appendChild(l);
    try { l.layoutSizingHorizontal = 'FILL'; } catch (e) { /* keep */ }
    page = np;
    list = l;
  };
  const warnOversize = (what) => {
    oversize++;
    warn(`${label} ${pages.length}쪽: ${what} 가 A4 한 장보다 큽니다 (${overBy(page)}px 넘침). 내용을 줄이거나 블록을 나눠 주세요.`);
  };
  const topGap = () => {
    const last = list.children[list.children.length - 1];
    if (!last) return 0;
    return last.name === 'summary' ? DETAIL.firstProject : DETAIL.projectGap;
  };

  for (const pr of arr(d.projects, 'details[].projects')) {
    const blocks = detailBlocks(pr);
    const title = `프로젝트 "${str(pr.title)}"`;
    let st = await newProjectFrame(list, topGap(), null, pr, true);
    if (page !== first) setTitleInset(st.head, DETAIL.contTitleInset);
    const alone = () => list.children[0] === st.pf && page !== first;
    let placed = 0;
    if (!blocks.length && !fits(page) && !alone()) {
      newPage();
      list.appendChild(st.pf);
      st.pf.paddingTop = 0;
      setTitleInset(st.head, DETAIL.contTitleInset);
      if (!fits(page)) warnOversize(title);
    }
    for (const b of blocks) {
      const wrap = await placeDetailBlock(ctx, st, b, title);
      if (!wrap) continue;
      if (fits(page)) {
        placed++;
        continue;
      }
      if (placed === 0) {
        if (!alone()) {
          newPage();
          list.appendChild(st.pf);
          st.pf.paddingTop = 0;
          setTitleInset(st.head, DETAIL.contTitleInset);
        }
        if (!fits(page)) warnOversize(`${title} 의 머리·사이드·첫 블록`);
        placed++;
        continue;
      }
      newPage();
      st = await newProjectFrame(list, 0, st.head, pr, false);
      setTitleInset(st.head, DETAIL.contTitleInset);
      wrap.paddingTop = 0;
      st.below.appendChild(wrap);
      try { wrap.layoutSizingHorizontal = 'FILL'; } catch (e) { /* keep */ }
      fitBlockWrap(wrap, blockType(b), true);
      st.prevBelow = b;
      if (!fits(page)) warnOversize(`${title} 의 "${blockType(b)}" 블록`);
      placed++;
    }
  }

  const row = findNode(head, 'row');
  const top1 = row ? relY(first, row) + row.height + DETAIL.vruleOffset : DETAIL.contTop;
  addVRule(first, top1, DETAIL.vruleFirstEnd);
  for (const pg of pages) if (pg !== first) addVRule(pg, pg.paddingTop, DETAIL.vruleContEnd);
  info(`${label}: ${pages.length}장${oversize ? `, 한 장보다 큰 덩어리 ${oversize}개` : ''}`);
  return pages;
}

async function runPlan(plan, p, images, theme) {
  await prepare();
  applyTheme(theme);
  const tplPage = await requirePage(PAGE_TPL);
  await figma.setCurrentPageAsync(tplPage);
  for (const kind of Array.from(new Set(plan.map((j) => j.kind)))) {
    const name = TEMPLATES[kind];
    const t = findComponent(name);
    if (!t) throw new Error(`"${name}" 가 없습니다. 4단계 buildTemplates 를 먼저 실행하세요.`);
    if (compVersion(t) < (COMP_VERSIONS[name] || 1)) {
      throw new Error(`"${name}" 가 구버전입니다. 3단계 Blocks → 4단계 Templates 를 다시 실행하세요.`);
    }
  }

  const ctx = {
    page: tplPage,
    images: images && typeof images === 'object' ? images : {},
    imageCache: new Map(),
    imageCount: 0,
    date: today(),
    nextIndex: nextFilledIndex(tplPage),
    created: [],
    store: null,
  };
  const store = figma.createFrame();
  store.name = '__kb_build_tmp';
  store.fills = [];
  tplPage.appendChild(store);
  store.x = -20000;
  store.y = -20000;
  store.visible = false;
  ctx.store = store;

  try {
    for (const job of plan) {
      const before = ctx.created.length;
      try {
        const pages = job.kind === 'portfolioDetail'
          ? await buildDetail(ctx, job.data, p, job.label)
          : await buildKind(ctx, job.kind, job.data, p, job.label);
        ok(`${job.label}: ${pages.map((n) => n.id).join(', ')}`);
      } catch (e) {
        S.failures++;
        const partial = ctx.created.slice(before).map((n) => n.id);
        fail(`${job.label} 실패: ${errText(e)}${partial.length ? `\n만들다 만 페이지(확인용으로 남김): ${partial.join(', ')}` : ''}`);
      }
    }
  } finally {
    if (!store.removed) store.remove();
  }

  const created = ctx.created.filter((n) => !n.removed);
  if (ctx.imageCount) ok(`이미지 ${ctx.imageCount}개 적용`);
  if (created.length) {
    figma.currentPage.selection = created;
    figma.viewport.scrollAndZoomIntoView(created);
  }
  ok(`만든 페이지 ${created.length}장: ${created.map((n) => n.id).join(', ')}`);
}

// ---------------------------------------------------------------------
// theme: JSON theme.{accent, ink} (priority) or the UI color input → KB Tokens
// ---------------------------------------------------------------------
function normHex(v) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(str(v).trim());
  if (!m) return null;
  let h = m[1].toLowerCase();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return '#' + h;
}

function themeFrom(json, uiAccent) {
  const t = json && json.theme && typeof json.theme === 'object' ? json.theme : {};
  const out = {};
  for (const k of Object.keys(THEME_VARS)) {
    if (t[k] == null || t[k] === '') continue;
    const h = normHex(t[k]);
    if (h) out[k] = { hex: h, from: 'JSON theme.' + k };
    else warn(`theme.${k} "${t[k]}" 는 #rrggbb 형식이 아니라 무시합니다.`);
  }
  if (!out.accent && uiAccent) {
    const h = normHex(uiAccent);
    if (h) out.accent = { hex: h, from: '창의 강조색' };
  }
  return out;
}

function applyTheme(theme) {
  const keys = Object.keys(theme || {});
  if (!keys.length) return;
  if (!S.collection) throw new Error(`변수 컬렉션 "${COLLECTION}" 이 없습니다. 1단계 Foundations 를 먼저 실행하세요.`);
  const modeId = S.collection.modes[0].modeId;
  for (const k of keys) {
    const v = getVar(THEME_VARS[k]);
    const rgb = hexToRgb(theme[k].hex);
    const cur = v.valuesByMode[modeId];
    if (sameValue(cur, rgb)) {
      info(`색 ${THEME_VARS[k]} = ${theme[k].hex} (${theme[k].from}, 이미 같음)`);
      continue;
    }
    v.setValueForMode(modeId, rgb);
    ok(`색 ${THEME_VARS[k]} → ${theme[k].hex} (${theme[k].from}). 이 변수를 쓰는 기존 페이지도 같이 바뀝니다.`);
  }
}

// Unbind color/accent·color/ink from fills/strokes under the selection, keeping the current color.
async function freezeSelectionColors() {
  const sel = figma.currentPage.selection;
  if (!sel.length) throw new Error('선택된 노드가 없습니다. 색을 고정할 페이지(프레임)를 선택하세요.');
  await loadVars();
  if (!S.collection) throw new Error(`변수 컬렉션 "${COLLECTION}" 이 없습니다.`);
  const modeId = S.collection.modes[0].modeId;
  const targets = new Map();
  for (const name of Object.values(THEME_VARS)) {
    const v = S.vars.get(name);
    if (v) targets.set(v.id, { name, color: v.valuesByMode[modeId] });
  }
  if (!targets.size) throw new Error('color/accent·color/ink 변수를 찾지 못했습니다.');

  const freeze = (paints) => {
    if (!Array.isArray(paints)) return null;
    let changed = false;
    const next = paints.map((pt) => {
      const bound = pt && pt.type === 'SOLID' && pt.boundVariables && pt.boundVariables.color;
      const tgt = bound ? targets.get(pt.boundVariables.color.id) : null;
      if (!tgt || !tgt.color || typeof tgt.color !== 'object' || !('r' in tgt.color)) return pt;
      changed = true;
      const out = { type: 'SOLID', color: { r: tgt.color.r, g: tgt.color.g, b: tgt.color.b } };
      if (pt.opacity != null) out.opacity = pt.opacity;
      if (pt.visible != null) out.visible = pt.visible;
      if (pt.blendMode) out.blendMode = pt.blendMode;
      return out;
    });
    return changed ? next : null;
  };

  let nodes = 0;
  let paints = 0;
  let mixed = 0;
  let failed = 0;
  const visit = async (n) => {
    try {
      let touched = false;
      if ('fills' in n) {
        if (n.fills === figma.mixed) {
          mixed++;
        } else {
          const nf = freeze(n.fills);
          if (nf) {
            if (n.type === 'TEXT') await loadNodeFonts(n);
            n.fills = nf;
            paints++;
            touched = true;
          }
        }
      }
      if ('strokes' in n) {
        const ns = freeze(n.strokes);
        if (ns) {
          n.strokes = ns;
          paints++;
          touched = true;
        }
      }
      if (touched) nodes++;
    } catch (e) {
      failed++;
    }
  };
  for (const root of sel) {
    await visit(root);
    const all = [];
    walk(root, (n) => { all.push(n); }, true);
    for (const n of all) await visit(n);
  }
  ok(`색 고정: 노드 ${nodes}개, 칠/선 ${paints}개를 현재 색 값으로 고정했습니다.`);
  if (mixed) warn(`구간별로 색이 섞인 텍스트 ${mixed}개는 건너뛰었습니다.`);
  if (failed) warn(`${failed}개 노드는 고치지 못했습니다(잠긴 노드 등).`);
}

function parseJson(jsonText) {
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    throw new Error(`JSON 파싱 실패: ${e.message || e}`);
  }
}

async function buildAll(jsonText, images, uiAccent) {
  const json = parseJson(jsonText);
  const p = validateProfile(json);
  const plan = [];
  if (json.resume) plan.push({ kind: 'resume', data: json.resume, label: 'resume' });
  if (json.coverLetter) plan.push({ kind: 'coverLetter', data: json.coverLetter, label: 'coverLetter' });
  const pf = json.portfolio || {};
  if (pf.cover) plan.push({ kind: 'portfolioCover', data: pf.cover, label: 'portfolioCover' });
  arr(pf.details, 'portfolio.details').forEach((d, i) => {
    if (d) plan.push({ kind: 'portfolioDetail', data: d, label: 'portfolioDetail-' + i });
  });
  if (!plan.length) throw new Error('JSON 에 resume / coverLetter / portfolio.cover / portfolio.details 가 하나도 없습니다.');
  info(`만들 순서: ${plan.map((j) => j.label).join(' → ')}`);
  await runPlan(plan, p, images, themeFrom(json, uiAccent));
}

async function fillTemplate(jsonText, which, index, images, uiAccent) {
  if (!TEMPLATES[which]) throw new Error(`알 수 없는 템플릿 종류: ${which}`);
  const json = parseJson(jsonText);
  const p = validateProfile(json);
  const idx = Math.max(0, parseInt(index, 10) || 0);
  let job;
  if (which === 'resume') job = { kind: which, data: req(json, 'resume'), label: 'resume' };
  else if (which === 'coverLetter') job = { kind: which, data: req(json, 'coverLetter'), label: 'coverLetter' };
  else if (which === 'portfolioCover') job = { kind: which, data: req(json, 'portfolio.cover'), label: 'portfolioCover' };
  else {
    const details = arr(req(json, 'portfolio.details'), 'portfolio.details');
    if (!details[idx]) throw new Error(`portfolio.details[${idx}] 가 없습니다 (총 ${details.length}개).`);
    job = { kind: which, data: details[idx], label: 'portfolioDetail-' + idx };
  }
  await runPlan([job], p, images, themeFrom(json, uiAccent));
}

// =====================================================================
// Step 6. exportSelectionPNG
// =====================================================================
async function exportSelectionPNG() {
  const sel = figma.currentPage.selection;
  if (!sel.length) throw new Error('선택된 노드가 없습니다. 내보낼 페이지(프레임/인스턴스)를 선택하세요.');
  if (sel.length > 1) warn(`${sel.length}개가 선택되어 첫 번째 "${sel[0].name}" 만 내보냅니다.`);
  const node = sel[0];
  if (typeof node.exportAsync !== 'function') throw new Error(`"${node.name}" 은(는) 내보낼 수 없는 노드입니다.`);
  const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
  figma.ui.postMessage({ type: 'png', name: node.name, bytes });
  ok(`"${node.name}" PNG ${Math.round(bytes.length / 1024)}KB 전송`);
}

// =====================================================================
// UI wiring
// =====================================================================
figma.showUI(__html__, { width: 440, height: 760, themeColors: true });

let busy = false;

figma.ui.onmessage = async (msg) => {
  if (!msg || msg.type !== 'run') return;
  if (busy) {
    warn('이전 작업이 아직 실행 중입니다. 끝난 뒤 다시 눌러 주세요.');
    figma.ui.postMessage({ type: 'done', step: msg.step });
    return;
  }
  busy = true;
  try {
    const family = msg.family;
    switch (msg.step) {
      case 'ensureFoundations':
        await runStep('1 ensureFoundations', family, ensureFoundations);
        break;
      case 'applyFont':
        await runStep('폰트만 적용', family, async () => {
          await loadStyles();
          await applyFontFamily(S.family);
        });
        break;
      case 'buildAtoms':
        await runStep('2 buildAtoms', family, buildAtoms);
        break;
      case 'buildBlocks':
        await runStep('3 buildBlocks', family, buildBlocks);
        break;
      case 'buildTemplates':
        await runStep('4 buildTemplates', family, buildTemplates);
        break;
      case 'buildAll':
        await runStep('5 buildAll', family, () => buildAll(msg.json, msg.images, msg.accent));
        break;
      case 'fillTemplate':
        await runStep(`5 fillTemplate(${msg.which}${msg.which === 'portfolioDetail' ? '[' + msg.index + ']' : ''})`, family,
          () => fillTemplate(msg.json, msg.which, msg.index, msg.images, msg.accent));
        break;
      case 'freezeSelectionColors':
        await runStep('색 고정(선택)', family, freezeSelectionColors);
        break;
      case 'exportSelectionPNG':
        await runStep('6 exportSelectionPNG', family, exportSelectionPNG);
        break;
      default:
        fail(`알 수 없는 단계: ${msg.step}`);
        figma.ui.postMessage({ type: 'done', step: msg.step });
    }
  } finally {
    busy = false;
  }
};

info(`KB Resume System 준비됨. 현재 페이지: ${figma.currentPage.name}. "${PROTECTED_PAGE}" 는 읽지도 수정하지도 않습니다.`);
