"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BookOpen,
  Check,
  ChevronRight,
  FileText,
  LockKeyhole,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";

type WikiCategory = "나" | "서비스" | "프로젝트" | "결정 기록";
type WikiVisibility = "나만 보기" | "친한 사람";
type WikiStatus = "확정" | "정리 중";

type WikiEntry = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: WikiCategory;
  visibility: WikiVisibility;
  status: WikiStatus;
  updatedAt: string;
};

const STORAGE_KEY = "light-intelligence:wiki:v1";

const INITIAL_ENTRIES: WikiEntry[] = [
  {
    id: "identity-integrated-maker",
    title: "율은 어떤 사람인가",
    summary: "개발·디자인·기획·브랜드를 하나의 제품 경험으로 연결하는 사람.",
    content:
      "율은 미림마이스터고등학교 뉴미디어소프트웨어과 학생이며 개발자 지망생, 그래픽·시각·UI/UX 디자이너, 영상 편집자이자 미니 Founder다. 단순히 한 분야를 잘하는 것보다 여러 분야를 연결해 자기 아이디어를 실제 제품과 브랜드로 만드는 방향을 중요하게 생각한다.",
    category: "나",
    visibility: "친한 사람",
    status: "확정",
    updatedAt: "2026-08-05",
  },
  {
    id: "values-kindness",
    title: "절대 잃고 싶지 않은 것",
    summary: "율이 가장 오래 지키고 싶은 특징은 착함이다.",
    content:
      "율은 자신의 가장 큰 장점으로 착함과 강한 몰입을 꼽는다. 가까운 사람이 힘들다고 하면 해결책부터 단정하기보다 ‘왜왜 무슨 일 있었는데?’라고 먼저 이유를 묻고 이야기를 들어주려 한다.",
    category: "나",
    visibility: "친한 사람",
    status: "확정",
    updatedAt: "2026-08-05",
  },
  {
    id: "design-principles",
    title: "디자인 판단 기준",
    summary: "미적 완성도를 조금 더 우선하고, 아름다움 자체를 제품 가치로 본다.",
    content:
      "율은 기능과 디자인 중 디자인을 조금 더 앞에 둔다. 예쁘기만 하다는 평가에도 ‘일단 예쁘잖아’라고 생각하며, 이미 만들어진 미적 정체성을 버리기보다 사용성을 보완하는 방향을 선호한다. Apple 스타일, 명확한 위계, 자연스러운 모션과 디테일을 중요하게 본다.",
    category: "나",
    visibility: "친한 사람",
    status: "확정",
    updatedAt: "2026-08-05",
  },
  {
    id: "service-tile",
    title: "Tile",
    summary: "학생의 현재 교시와 학교 일과를 직관적으로 보여주는 학생 중심 서비스.",
    content:
      "Tile은 현재 교시, 남은 시간, 교실, 시간표, 급식과 학교 정보를 직관적으로 보여주는 학교 일과 관리 서비스다. 웹에서 시작했으며 iOS, iPadOS, watchOS와 Android 확장을 고려한다. 기능 목록보다 학생이 하루를 더 자연스럽게 이해하도록 만드는 전체 경험이 핵심이다.",
    category: "서비스",
    visibility: "친한 사람",
    status: "확정",
    updatedAt: "2026-08-05",
  },
  {
    id: "brand-lightframe",
    title: "Lightframe.",
    summary: "율의 디자인과 개발 결과물을 연결하는 개인 브랜드.",
    content:
      "Lightframe.는 율의 디자인·개발 정체성을 담는 브랜드다. 프로젝트마다 예쁜 화면을 만드는 데 그치지 않고 이름, 문구, 상호작용과 사용자가 처음 받는 인상까지 같은 목소리로 연결하는 것을 목표로 한다.",
    category: "서비스",
    visibility: "친한 사람",
    status: "정리 중",
    updatedAt: "2026-08-05",
  },
  {
    id: "decision-local-first",
    title: "위키는 기기 안에서 시작한다",
    summary: "초기 위키는 외부 전송 없이 브라우저에 저장한다.",
    content:
      "개인 위키에는 민감할 수 있는 정보가 쌓이므로 초기 버전은 계정이나 서버 없이 현재 브라우저의 Local Storage에만 저장한다. 친구에게 공개할 수 있는 정보와 율만 볼 정보를 문서마다 구분한다.",
    category: "결정 기록",
    visibility: "나만 보기",
    status: "확정",
    updatedAt: "2026-08-05",
  },
];

const CATEGORIES: Array<"전체" | WikiCategory> = [
  "전체",
  "나",
  "서비스",
  "프로젝트",
  "결정 기록",
];

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `wiki-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const emptyDraft = (): WikiEntry => ({
  id: "",
  title: "",
  summary: "",
  content: "",
  category: "나",
  visibility: "나만 보기",
  status: "정리 중",
  updatedAt: new Date().toISOString().slice(0, 10),
});

export default function WikiWorkspace() {
  const reduceMotion = useReducedMotion();
  const [entries, setEntries] = useState<WikiEntry[]>(INITIAL_ENTRIES);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("전체");
  const [selectedId, setSelectedId] = useState(INITIAL_ENTRIES[0].id);
  const [draft, setDraft] = useState<WikiEntry | null>(null);

  useEffect(() => {
    let storedEntries: WikiEntry[] | null = null;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WikiEntry[];
        if (Array.isArray(parsed) && parsed.length) storedEntries = parsed;
      }
    } catch {
      // 손상된 Local 데이터는 안전한 기본 위키로 대체한다.
    }
    queueMicrotask(() => {
      if (storedEntries) setEntries(storedEntries);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, hydrated]);

  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const categoryMatches = category === "전체" || entry.category === category;
      const queryMatches =
        !normalized ||
        `${entry.title} ${entry.summary} ${entry.content}`.toLowerCase().includes(normalized);
      return categoryMatches && queryMatches;
    });
  }, [category, entries, query]);

  const selected =
    entries.find((entry) => entry.id === selectedId) ?? filteredEntries[0] ?? null;

  const transition = reduceMotion
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 420, damping: 41, mass: 1 };

  const saveEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft?.title.trim() || !draft.content.trim()) return;

    const next: WikiEntry = {
      ...draft,
      id: draft.id || createId(),
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      content: draft.content.trim(),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setEntries((current) => {
      const exists = current.some((entry) => entry.id === next.id);
      return exists
        ? current.map((entry) => (entry.id === next.id ? next : entry))
        : [next, ...current];
    });
    setSelectedId(next.id);
    setDraft(null);
  };

  const deleteEntry = () => {
    if (!draft?.id) return;
    if (!window.confirm(`“${draft.title}” 문서를 삭제할까? 이 작업은 되돌릴 수 없어.`)) return;
    const nextEntries = entries.filter((entry) => entry.id !== draft.id);
    setEntries(nextEntries);
    setSelectedId(nextEntries[0]?.id ?? "");
    setDraft(null);
  };

  return (
    <section className="wiki-workspace" aria-label="율 위키">
      <header className="wiki-header">
        <div>
          <p className="eyebrow">YUL KNOWLEDGE BASE</p>
          <h1>율 위키</h1>
          <p>확인된 나와 서비스의 맥락을 한곳에 기록해.</p>
        </div>
        <motion.button
          className="wiki-add-button pressable"
          type="button"
          onClick={() => setDraft(emptyDraft())}
          whileTap={{ scale: 0.97 }}
          transition={transition}
        >
          <Plus size={17} /> 새 문서
        </motion.button>
      </header>

      <div className="wiki-toolbar">
        <label className="wiki-search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="위키에서 검색"
            aria-label="위키 검색"
          />
          {query && (
            <button type="button" className="pressable" onClick={() => setQuery("")} aria-label="검색어 지우기">
              <X size={15} />
            </button>
          )}
        </label>
        <div className="wiki-filters" aria-label="문서 분류">
          {CATEGORIES.map((item) => (
            <button
              type="button"
              className={`wiki-filter pressable ${category === item ? "is-active" : ""}`}
              key={item}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="wiki-body">
        <div className="wiki-list" aria-label="위키 문서 목록">
          <div className="wiki-list-heading">
            <span>{filteredEntries.length}개의 문서</span>
            <span>이 기기에만 저장</span>
          </div>
          {filteredEntries.length ? (
            filteredEntries.map((entry) => (
              <button
                type="button"
                className={`wiki-list-item pressable ${selected?.id === entry.id ? "is-selected" : ""}`}
                key={entry.id}
                onClick={() => setSelectedId(entry.id)}
              >
                <span className="wiki-item-icon" aria-hidden="true"><FileText size={16} /></span>
                <span className="wiki-item-copy">
                  <span className="wiki-item-meta">{entry.category} · {entry.status}</span>
                  <strong>{entry.title}</strong>
                  <small>{entry.summary || "요약이 아직 없어."}</small>
                </span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            ))
          ) : (
            <div className="wiki-empty-list">
              <Search size={21} />
              <strong>일치하는 문서가 없어</strong>
              <span>검색어나 분류를 바꿔봐.</span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selected ? (
            <motion.article
              className="wiki-document"
              key={selected.id}
              initial={{ opacity: 0, y: 7, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={transition}
            >
              <div className="wiki-document-topline">
                <div className="wiki-badges">
                  <span>{selected.category}</span>
                  <span className={selected.status === "확정" ? "is-confirmed" : ""}>
                    {selected.status === "확정" && <Check size={12} />}{selected.status}
                  </span>
                </div>
                <button
                  type="button"
                  className="wiki-edit-button pressable"
                  onClick={() => setDraft({ ...selected })}
                >
                  <Pencil size={15} /> 수정
                </button>
              </div>
              <h2>{selected.title}</h2>
              {selected.summary && <p className="wiki-document-summary">{selected.summary}</p>}
              <div className="wiki-document-content">{selected.content}</div>
              <footer className="wiki-document-footer">
                <span>
                  {selected.visibility === "나만 보기" ? <LockKeyhole size={14} /> : <Users size={14} />}
                  {selected.visibility}
                </span>
                <span>마지막 수정 {selected.updatedAt}</span>
              </footer>
            </motion.article>
          ) : (
            <div className="wiki-empty-document">
              <BookOpen size={28} />
              <strong>문서를 선택해줘</strong>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="wiki-privacy-note">
        <ShieldCheck size={16} />
        <span><strong>Local Wiki</strong> — 위키는 현재 브라우저에만 저장되며 외부 AI나 서버로 전송되지 않아.</span>
      </div>

      <AnimatePresence>
        {draft && (
          <motion.div
            className="overlay wiki-editor-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onMouseDown={(event) => event.target === event.currentTarget && setDraft(null)}
          >
            <motion.form
              className="wiki-editor"
              role="dialog"
              aria-modal="true"
              aria-label={draft.id ? "위키 문서 수정" : "새 위키 문서"}
              onSubmit={saveEntry}
              initial={{ opacity: 0, y: 26, scale: 0.97, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={transition}
            >
              <div className="wiki-editor-heading">
                <div>
                  <p className="eyebrow">{draft.id ? "EDIT WIKI" : "NEW WIKI"}</p>
                  <h2>{draft.id ? "문서 수정" : "새 문서"}</h2>
                </div>
                <button type="button" className="icon-button pressable" onClick={() => setDraft(null)} aria-label="닫기">
                  <X size={19} />
                </button>
              </div>
              <label className="wiki-field">
                <span>제목</span>
                <input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="무엇에 대한 문서야?" />
              </label>
              <label className="wiki-field">
                <span>한 줄 요약</span>
                <input value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} placeholder="이 문서의 핵심을 짧게 적어줘" />
              </label>
              <div className="wiki-field-row">
                <label className="wiki-field">
                  <span>분류</span>
                  <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as WikiCategory })}>
                    {CATEGORIES.slice(1).map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="wiki-field">
                  <span>확인 상태</span>
                  <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as WikiStatus })}>
                    <option>확정</option><option>정리 중</option>
                  </select>
                </label>
                <label className="wiki-field">
                  <span>공개 범위</span>
                  <select value={draft.visibility} onChange={(event) => setDraft({ ...draft, visibility: event.target.value as WikiVisibility })}>
                    <option>나만 보기</option><option>친한 사람</option>
                  </select>
                </label>
              </div>
              <label className="wiki-field wiki-content-field">
                <span>내용</span>
                <textarea value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="확인된 사실과 맥락을 적어줘" rows={9} />
              </label>
              <div className="wiki-editor-actions">
                {draft.id && (
                  <button type="button" className="wiki-delete-button pressable" onClick={deleteEntry}>
                    <Trash2 size={16} /> 삭제
                  </button>
                )}
                <button type="submit" className="wiki-save-button pressable" disabled={!draft.title.trim() || !draft.content.trim()}>
                  문서 저장
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
