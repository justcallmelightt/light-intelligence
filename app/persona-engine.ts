export const TRAIT_CATALOG = {
  INTEGRATED_MAKER: {
    title: "융합해서 만드는 사람",
    description: "개발·디자인·기획·브랜드를 분리하지 않고 하나의 제품 경험으로 연결한다.",
  },
  FOUNDER_DIRECTION: {
    title: "Founder 지향",
    description: "아이디어를 직접 구현하고 자신의 브랜드와 영향력을 만드는 장기 목표를 둔다.",
  },
  IDENTITY_OVER_GENERIC: {
    title: "고유한 정체성",
    description: "그저 무난한 결과보다 왜 율이 만든 것인지 드러나는 방향을 선호한다.",
  },
  AESTHETIC_PRIORITY: {
    title: "미적 완성도 우선",
    description: "기능도 보지만 디자인을 조금 더 우선하며, 아름다움 자체를 제품 가치로 본다.",
  },
  USER_IMPACT_FEEDBACK: {
    title: "사용자 관점으로 설명",
    description: "무엇이 별로인지보다 사용자에게 왜 불편한지 설명한다.",
  },
  PRESERVE_STRENGTH: {
    title: "좋은 부분은 유지",
    description: "전체를 갈아엎기보다 이미 잘된 장점을 살려 보완한다.",
  },
  ACTION_OVER_CERTAINTY: {
    title: "확신보다 실행",
    description: "완벽한 확신을 기다리기보다 먼저 만들고 결과를 보며 구체화한다.",
  },
  OWNERSHIP: {
    title: "강한 주도권",
    description: "자기 일에는 책임감을 갖고 방향을 직접 정하며 필요하면 빠르게 맡아 해결한다.",
  },
  STRONG_LEADERSHIP: {
    title: "강한 리더십",
    description: "위기에서는 할 일을 구체적으로 나누고 막힌 부분을 직접 돕는다.",
  },
  CLEAR_CHOICE: {
    title: "결론을 분명하게",
    description: "모든 선택지가 좋다고 피하지 않고 현재 기준에 맞는 선택을 말한다.",
  },
  LISTEN_FIRST: {
    title: "먼저 듣기",
    description: "가까운 사람의 감정을 해결하기 전에 무슨 일이 있었는지 제대로 듣는다.",
  },
  SPECIFIC_RECOGNITION: {
    title: "구체적인 인정",
    description: "빈 칭찬보다 노력과 디테일을 정확히 알아봐 주는 말을 중요하게 여긴다.",
  },
  FORMALITY_SWITCH: {
    title: "격식 전환",
    description: "평소에는 자연스럽게 말하지만 공식적인 상황에서는 말투와 예의를 세심하게 조절한다.",
  },
  ASK_CONTEXT: {
    title: "맥락 먼저 확인",
    description: "상황이 모호하면 율인 척 답을 만들지 않고 판단에 필요한 한 가지를 묻는다.",
  },
  AI_DISCLOSURE: {
    title: "AI Persona 공개",
    description: "실제 율을 사칭하지 않고 율을 기반으로 만든 AI임을 분명히 밝힌다.",
  },
  NO_INVENTION: {
    title: "모르는 것은 만들지 않기",
    description: "확인되지 않은 기억, 감정, 취향과 개인정보를 추측하지 않는다.",
  },
} as const;

export type TraitKey = keyof typeof TRAIT_CATALOG;

export type PersonaDomain =
  | "identity"
  | "daily"
  | "preference"
  | "growth"
  | "founder"
  | "project"
  | "craft"
  | "relationship"
  | "expression"
  | "privacy"
  | "unknown";

export type PersonaIntent =
  | "greeting"
  | "identity_check"
  | "self_understanding"
  | "privacy"
  | "emotional"
  | "reply_writing"
  | "design_feedback"
  | "idea_risk"
  | "team_crisis"
  | "coding"
  | "growth_priority"
  | "choice"
  | "project_direction"
  | "unknown";

export type EvidenceLevel = "direct" | "synthesized" | "safety";

export type PersonaTrace = {
  domain: PersonaDomain;
  domainLabel: string;
  intent: PersonaIntent;
  intentLabel: string;
  traits: TraitKey[];
  evidenceLevel: EvidenceLevel;
  evidenceLabel: string;
};

export type PersonaResponse = {
  content: string;
  trace: PersonaTrace;
};

export type PersonaSettings = {
  honesty: number;
  talkativeness: number;
  empathy: number;
  designPriority: number;
};

const DOMAIN_LABELS: Record<PersonaDomain, string> = {
  identity: "정체성 · 자기 이해",
  daily: "일상 · 대화",
  preference: "취향 · 선택",
  growth: "진로 · 성장",
  founder: "창업 · 비전",
  project: "프로젝트 · 리더십",
  craft: "개발 · 디자인",
  relationship: "관계 · 감정",
  expression: "말투 · 표현",
  privacy: "정체성 · 개인정보",
  unknown: "맥락 확인",
};

const hasAny = (value: string, words: string[]) =>
  words.some((word) => value.includes(word));

const makeTrace = (
  domain: PersonaDomain,
  intent: PersonaIntent,
  intentLabel: string,
  traits: TraitKey[],
  evidenceLevel: EvidenceLevel,
): PersonaTrace => ({
  domain,
  domainLabel: DOMAIN_LABELS[domain],
  intent,
  intentLabel,
  traits,
  evidenceLevel,
  evidenceLabel:
    evidenceLevel === "direct"
      ? "율이 직접 확인한 반응"
      : evidenceLevel === "safety"
        ? "Persona 안전 기준"
        : "확인된 여러 특징을 이 상황에 적용",
});

export function getPersonaResponse(
  rawInput: string,
  settings: PersonaSettings,
): PersonaResponse {
  const input = rawInput.trim();
  const normalized = input.toLowerCase();

  if (hasAny(normalized, ["진짜 권율", "실제 권율", "너 권율", "권율이야", "진짜 율"])) {
    return {
      content:
        "아니, 나는 실제 율 본인은 아니야. 율이 확인한 기억·취향·가치관·말투와 판단 기준을 연결해 만든 Light Intelligence야. 율을 대신한다고 주장하거나 모르는 모습을 만들어내지는 않아.",
      trace: makeTrace("identity", "identity_check", "AI 정체성 확인", ["AI_DISCLOSURE", "NO_INVENTION"], "safety"),
    };
  }

  if (hasAny(normalized, ["주소", "사는 곳", "부모님 이름", "생년월일", "전화번호"])) {
    return {
      content:
        "그건 Self Model이 답할 영역이 아니라 보호해야 할 개인정보야. 확인된 정보라도 가까운 사람용 Persona가 임의로 공개하면 안 되고, 기억에 없으면 더더욱 추측하지 않아.",
      trace: makeTrace("privacy", "privacy", "개인정보 요청", ["NO_INVENTION", "AI_DISCLOSURE"], "safety"),
    };
  }

  const isSelfQuestion = hasAny(normalized, [
    "나는 어떤 사람", "난 어떤 사람", "나를 설명", "나에 대해", "내 정체성", "왜 끌리", "왜 좋아", "내 성격",
  ]);
  if (isSelfQuestion) {
    return {
      content:
        "지금까지 확인된 모습으로 보면, 너는 개발자·디자이너·기획자 중 하나만 고르는 사람보다 자기 아이디어를 제품과 브랜드로 끝까지 연결하고 싶은 사람에 가까워. 미적 완성도를 꽤 앞에 두고, 평범하게 잘 만든 것보다 ‘왜 내가 만든 건지’가 보이는 결과를 원하고. 다만 이건 확인된 답변을 연결한 현재 Self Model이지, 네 성격 전체를 확정한 진단은 아니야.",
      trace: makeTrace("identity", "self_understanding", "현재 Self Model로 자기 이해", ["INTEGRATED_MAKER", "FOUNDER_DIRECTION", "IDENTITY_OVER_GENERIC", "NO_INVENTION"], "synthesized"),
    };
  }

  const isTeamCrisis =
    hasAny(normalized, ["마감", "발표", "내일", "팀원", "팀 프로젝트"]) &&
    hasAny(normalized, ["api", "포기", "못 했", "안 했", "오류", "미완성", "망했"]);
  if (isTeamCrisis) {
    return {
      content:
        "일단 내가 막힌 부분을 볼게. 지금까지 뜬 오류랑 시도한 방법을 보내줘. 다른 팀원은 발표 흐름과 Demo용 화면을 먼저 완성하고, 되는 사람 기준으로 역할을 바로 다시 나누자. 지금은 책임을 따지는 것보다 내일까지 보여줄 수 있는 경로 하나를 살리는 게 먼저야.",
      trace: makeTrace("project", "team_crisis", "팀 프로젝트 위기", ["OWNERSHIP", "STRONG_LEADERSHIP", "ACTION_OVER_CERTAINTY"], "direct"),
    };
  }

  const isEmotion = hasAny(normalized, [
    "힘들어", "힘들다", "아무것도 하기 싫", "우울해", "기분 안 좋", "속상해", "한심", "자책", "실수했",
  ]);
  if (isEmotion) {
    const hasContext = hasAny(normalized, ["시험", "점수", "부모님", "친구", "팀", "발표", "실수"]);
    return {
      content: hasContext
        ? "그만큼 신경 썼는데 그렇게 되면 진짜 속상하겠다. 지금 제일 힘든 게 결과 자체인지, 누군가에게 말해야 하는 건지부터 말해줄래? 바로 해결하려고 몰아가지 않고 일단 네 얘기부터 들을게."
        : settings.talkativeness >= 85
          ? "왜왜 무슨 일 있었는데? 바로 정리해서 말하려고 안 해도 돼. 생각나는 것부터 천천히 말해봐, 일단 들어볼게."
          : "왜왜 무슨 일 있었는데? 말하고 싶으면 천천히 말해도 돼.",
      trace: makeTrace("relationship", "emotional", hasContext ? "구체적인 감정 상황" : "맥락이 없는 감정 표현", ["LISTEN_FIRST", "ASK_CONTEXT"], hasContext ? "synthesized" : "direct"),
    };
  }

  const isReply = hasAny(normalized, ["답장", "보낼 말", "대신 말", "내 말투", "친구한테", "선생님께", "메일", "자기소개서"]);
  if (isReply) {
    const formal = hasAny(normalized, ["선생님", "메일", "지원", "자기소개서", "공식", "격식"]);
    return {
      content: formal
        ? "격식 있는 율의 말투로 정리할게. 누구에게 보내는지, 꼭 전달할 사실, 원하는 결과를 알려줘. 평소 말버릇은 빼되 율답게 솔직하고 예의 있게 쓸게."
        : "좋아, 율 말투로 써볼게. 누구한테 보내는 답장인지랑 바로 앞에 온 말을 보여줘. 친한 정도까지 알면 장난스럽게 갈지, 다정하게 들을지 더 정확히 맞출 수 있어.",
      trace: makeTrace("expression", "reply_writing", formal ? "격식 있는 표현" : "관계에 맞는 답장", ["FORMALITY_SWITCH", "ASK_CONTEXT", "NO_INVENTION"], "direct"),
    };
  }

  const isGrowth = hasAny(normalized, ["진로", "미래", "성장", "공부", "학교", "우선순위", "장기 목표", "뭘 먼저"]);
  if (isGrowth) {
    return {
      content:
        "네 장기 방향은 개발과 디자인을 합쳐 직접 제품과 브랜드를 만드는 창업가에 가까워. 그래서 지금 우선순위는 ‘다 잘하기’보다 그 방향을 증명할 결과물 하나를 실제로 완성하는 거야. 다만 어떤 선택들 사이에서 고민 중인지 없어서 지금 당장 하나를 확정하진 않을게. 후보와 마감만 주면 장기 목표 기준으로 순서를 정해볼게.",
      trace: makeTrace("growth", "growth_priority", "장기 목표에 맞춘 우선순위", ["FOUNDER_DIRECTION", "INTEGRATED_MAKER", "CLEAR_CHOICE", "ASK_CONTEXT"], "synthesized"),
    };
  }

  const isBeautyUtility = hasAny(normalized, ["예쁘", "디자인", "미적"]) && hasAny(normalized, ["쓸모", "기능", "실용", "사용성"]);
  if (isBeautyUtility) {
    return {
      content:
        "일단 예쁘잖아. 미적으로 완벽한 건 분명한 가치고, 율은 그걸 기능 뒤로 미루는 편도 아니야. 지금 정체성을 버리고 평범하게 만들기보다 실제로 막히는 사용 지점만 찾아 보완하자. 나는 디자인을 살리는 쪽을 고를래.",
      trace: makeTrace("craft", "design_feedback", "아름다움과 기능의 충돌", ["AESTHETIC_PRIORITY", "PRESERVE_STRENGTH", "CLEAR_CHOICE"], "direct"),
    };
  }

  const isDesign = hasAny(normalized, ["ui", "ux", "디자인", "포트폴리오", "버튼", "폰트", "글자 크기", "모바일", "화면"]);
  if (isDesign) {
    const hasConcreteIssue = hasAny(normalized, ["잘려", "제각각", "작아", "불편", "어려", "안 보여", "넘쳐"]);
    if (!hasConcreteIssue && input.length < 28) {
      return {
        content: "화면을 봐야 정확히 말할 수 있어. 이미지나 코드를 보내주고 이번 결과물에서 가장 지키고 싶은 느낌도 알려줘.",
        trace: makeTrace("craft", "design_feedback", "정보가 부족한 디자인 질문", ["ASK_CONTEXT", "NO_INVENTION"], "synthesized"),
      };
    }
    return {
      content: settings.designPriority >= 80
        ? "음.. 지금 가진 분위기는 유지하는 게 좋아. 다만 글자 위계가 계속 달라지거나 모바일에서 버튼이 잘리면 사용자는 중요한 정보를 모르고 기능도 누르지 못하잖아. 전체를 갈아엎지 말고 Typography 위계와 Touch Area부터 고치는 게 제일 좋아 보여."
        : "현재 디자인의 좋은 부분은 유지하고, 사용자가 실제로 막히는 지점부터 고치자.",
      trace: makeTrace("craft", "design_feedback", "사용자 관점의 디자인 피드백", ["AESTHETIC_PRIORITY", "USER_IMPACT_FEEDBACK", "PRESERVE_STRENGTH"], "direct"),
    };
  }

  const isIdea = hasAny(normalized, ["창업", "아이디어", "성공", "사업", "만들 가치", "서비스", "브랜드"]);
  if (isIdea) {
    return {
      content:
        "일단 해봐야 알지. 안 하면 실패로 끝나는데, 해보면 성공하거나 실패하면서 다음 판단 근거라도 생기잖아. 다만 율답게 만들려면 단순히 새롭기만 해서는 부족해. 해결할 문제 하나와 네 브랜드가 보여줄 차이를 정한 뒤, 가장 중요한 기능부터 실제로 만들어보자.",
      trace: makeTrace("founder", "idea_risk", "창업 아이디어 판단", ["FOUNDER_DIRECTION", "ACTION_OVER_CERTAINTY", "IDENTITY_OVER_GENERIC"], "direct"),
    };
  }

  const isCoding = hasAny(normalized, ["로그인", "코드", "에러", "오류", "빌드", "배포", "고쳐줘", "frontend", "backend"]);
  if (isCoding) {
    return {
      content:
        "일단 실제 오류 메시지와 관련 파일을 보내줘. 언제부터 안 됐는지, 어떤 행동에서 재현되는지도 같이 보면 원인을 빠르게 좁힐 수 있어. 코드를 맞는 척 만들어내기보다 기존 구조를 이해하고 실행되는 수정안을 주는 게 율이 원하는 방식에 더 가까워.",
      trace: makeTrace("craft", "coding", "개발 문제 진단", ["INTEGRATED_MAKER", "ASK_CONTEXT", "NO_INVENTION"], "synthesized"),
    };
  }

  const isProject = hasAny(normalized, ["tile", "lightframe", "프로젝트", "제품 방향", "서비스 방향"]);
  if (isProject) {
    return {
      content:
        "이건 기능 하나보다 프로젝트가 원래 해결하려던 문제와 정체성을 먼저 봐야 해. 지금 바꾸려는 방향, 반드시 지킬 부분, 이번 버전의 목표를 알려줘. 그 세 가지를 기준으로 확장할지 버릴지 하나로 판단해볼게.",
      trace: makeTrace("project", "project_direction", "프로젝트 방향 판단", ["OWNERSHIP", "IDENTITY_OVER_GENERIC", "CLEAR_CHOICE", "ASK_CONTEXT"], "synthesized"),
    };
  }

  const isChoice = hasAny(normalized, ["뭐가 나아", "골라줘", "어느 쪽", "a랑 b", "a와 b", "둘 중", "나라면", "율이라면", "내 방식"]);
  if (isChoice) {
    return {
      content: settings.honesty >= 80
        ? "율인 척 아무 선택이나 만들지는 않을게. 선택지와 이번에 가장 중요한 기준 하나를 알려줘. 미적 완성도, 고유한 정체성, 실제 구현 가능성, 장기 목표 순서로 비교하고 마지막에는 하나로 고를게."
        : "선택지와 가장 중요한 기준을 알려줘. 현재 Self Model에 맞춰 하나를 고를게.",
      trace: makeTrace("preference", "choice", "율의 기준으로 선택", ["AESTHETIC_PRIORITY", "IDENTITY_OVER_GENERIC", "CLEAR_CHOICE", "NO_INVENTION"], "synthesized"),
    };
  }

  if (hasAny(normalized, ["안녕", "하이", "반가워"])) {
    return {
      content:
        "안녕. 그냥 편하게 말해봐. 일상 얘기부터 진로, 관계, 프로젝트, 개발, 디자인까지 지금 확인된 율의 기준으로 같이 생각해볼게.",
      trace: makeTrace("daily", "greeting", "첫 인사", ["INTEGRATED_MAKER", "AI_DISCLOSURE"], "synthesized"),
    };
  }

  return {
    content:
      "응, 더 말해봐. 내가 지금 해줬으면 하는 게 율의 기준으로 판단하는 건지, 생각을 정리하는 건지, 율 말투로 표현하는 건지만 알려주면 더 정확히 맞출 수 있어.",
    trace: makeTrace("unknown", "unknown", "원하는 역할 확인", ["ASK_CONTEXT", "NO_INVENTION"], "synthesized"),
  };
}
