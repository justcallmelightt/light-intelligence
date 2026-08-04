# YUL AI — Personal Twin Lab

율이 직접 확인한 기억, 취향, 가치관, 목표, 말투와 판단 방식을 연결해
브라우저에서 검증하는 Local Personal AI Demo입니다. 디자인 평가나 공감만을
위한 도우미가 아니라, 다양한 상황에서 율의 방식으로 함께 생각하는 Self Model이
목표입니다.

새로운 Foundation Model을 학습한 제품이 아닙니다. 현재 버전은 확인된 상황을
분류하는 Local Persona Engine으로 응답하며, 답변마다 적용된 기준과 근거 수준을
표시합니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 출력된 Local URL을 엽니다.

## 검증

```bash
npm run lint
npm test
```

## 현재 기능

- 자기 이해, 일상, 취향과 선택, 진로와 성장, 창업, 프로젝트, 관계와 감정,
  개발과 디자인, 말투 전환에 대한 Local Demo 응답
- 답변에 연결된 Self Model 영역과 특징 표시
- `율 같음`과 `조금 다름` 교정 기록
- 성격 강도 조절
- 대화, 설정과 교정 의견의 기기 내 저장
- Dark/Light Mode
- Mobile, Tablet, Desktop 반응형 UI
- Reduced Motion과 Keyboard Focus 지원
- 실제 권율 사칭 및 확인되지 않은 개인정보 생성 방지

## 현재 한계

- 외부 LLM과 연결되지 않은 Local Demo입니다.
- 교정 의견은 실제 모델을 즉시 학습하지 않으며 이 기기에만 저장됩니다.
- 율이 확인하지 않은 감정, 기억과 개인정보는 답변하지 않습니다.

다음 버전에서는 교정 데이터를 검토 가능한 Persona 예시로 변환한 뒤, 서버 측
Provider를 통해 원하는 LLM을 선택적으로 연결할 수 있습니다.
