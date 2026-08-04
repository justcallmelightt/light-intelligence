# Light Intelligence — Personal AI

`Light Intelligence`는 율의 별명인 **빛**에서 가져온 이름입니다. 율이 직접 확인한
기억, 취향, 가치관, 목표, 말투와 판단 방식을 연결해 다양한 상황에서 율의 방식으로
함께 생각하는 Personal AI를 실험합니다.

이 프로젝트는 실제 율 본인이 아니며, 율을 완벽하게 대체한다고 주장하지 않습니다.
새로운 Foundation Model을 학습한 제품도 아닙니다. 현재 버전은 브라우저에서
동작하는 Local Persona Engine으로, 확인된 기준과 반응 예시를 조합해 답변합니다.

## 주요 기능

- 자기 이해, 일상, 취향과 선택, 진로와 성장, 창업, 프로젝트, 관계와 감정,
  개발과 디자인 등 여러 맥락에 대한 Local Persona 응답
- 답변에 사용한 Self Model 영역, 판단 기준과 근거 수준 표시
- `율 같음`과 `조금 다름` 피드백 및 구체적인 교정 의견 기록
- 솔직함, 공감, 장난스러움, 분석 깊이 등 성격 강도 조절
- 대화, 설정, 테마와 교정 기록의 브라우저 내 저장
- Dark/Light Mode와 Mobile, Tablet, Desktop 반응형 UI
- Keyboard Focus와 `prefers-reduced-motion` 접근성 대응
- 실제 권율 사칭, 확인되지 않은 기억 생성과 개인정보 추측 방지

## 기술 스택

- **Frontend:** Next.js 16, React 19, TypeScript 5
- **UI & Motion:** CSS, Motion, Lucide React
- **Build & Runtime:** Vinext, Vite 8, Cloudflare Workers 호환 Runtime
- **Quality:** ESLint, Node.js Test Runner, TypeScript Type Check
- **Storage:** Browser `localStorage`

## 개인정보 보호 및 보안

- 현재 버전의 대화, 설정과 교정 기록은 사용 중인 브라우저의 `localStorage`에만
  저장되며 별도 서버로 전송하지 않습니다.
- 외부 LLM API와 연결되어 있지 않아 API Key를 요구하거나 Client에 노출하지 않습니다.
- 실제 권율 본인으로 가장하지 않고, 율을 기반으로 만든 AI Persona임을 명확히 밝힙니다.
- 확인되지 않은 기억, 감정, 취향과 개인정보를 사실처럼 생성하지 않습니다.
- 민감한 개인정보 요청에는 답변하지 않으며, 공개된 저장소에 Secret이나 개인 인증
  정보를 Commit하지 않습니다.
- 브라우저에 저장된 데이터는 해당 Site의 저장 공간을 삭제하면 함께 제거됩니다.

## 실행

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서 출력된 Local URL을 엽니다.

## 검증

```bash
npm run lint
npx tsc --noEmit
npm test
```

## 현재 한계

- 외부 LLM과 연결되지 않은 Local Demo입니다.
- 교정 의견은 실제 모델을 즉시 학습하지 않으며 현재 브라우저에만 저장됩니다.
- 율이 확인하지 않은 모습은 의도적으로 빈칸으로 남깁니다.

다음 버전에서는 교정 데이터를 검토 가능한 Persona 예시로 변환한 뒤, 서버 측
Provider를 통해 원하는 LLM을 선택적으로 연결할 수 있습니다.

## README 유지 원칙

기능, 의존성, 저장 방식 또는 외부 연동이 바뀌면 이 README의 **주요 기능**,
**기술 스택**, **개인정보 보호 및 보안** 항목도 실제 구현과 함께 갱신합니다.
