# Clean Architecture Rules for Blog Platform

이 프로젝트는 **클린 아키텍처(Clean Architecture)** 원칙을 따릅니다.
모든 코드 작성 시 아래의 규칙을 준수하세요.

---

## 1. 의존성 방향 (Dependency Rule)

```
Presentation / Infrastructure  →  Application  →  Domain
```

- **안쪽 계층은 절대 바깥 계층을 import하지 않습니다.**
- `domain/`은 어떤 외부 패키지나 다른 계층도 import하지 않습니다.
- `application/`은 `domain/`만 import할 수 있습니다. `infrastructure/`, `presentation/`을 절대 import하지 않습니다.
- `infrastructure/`와 `presentation/`은 `application/`과 `domain/`을 import할 수 있습니다.

---

## 2. 계층별 책임

### 📁 `src/domain/`  —  핵심 비즈니스 규칙
- **역할**: 순수한 비즈니스 로직과 규칙만 존재합니다. 외부 기술 의존성이 없습니다.
- **포함**: 엔티티 클래스(Entity), 도메인 전용 에러(Exception)
- **규칙**:
  - 유효성 검사 로직은 Entity 내부 메서드에서 처리합니다 (`setTitle`, `setContent` 등).
  - 상태 변경은 Entity의 메서드를 통해서만 이루어져야 합니다 (`publish()`, `archive()` 등).
  - 절대 `Next.js`, `React`, `Prisma` 등 외부 라이브러리를 import하지 않습니다.

### 📁 `src/application/`  —  유즈케이스 (Use Cases)
- **역할**: 애플리케이션이 "무엇을 할 수 있는가"를 정의합니다.
- **포함**: `use-cases/` (비즈니스 흐름), `interfaces/` (포트 인터페이스)
- **규칙**:
  - 하나의 파일에 하나의 유즈케이스만 존재합니다 (`CreatePostUseCase`, `DeletePostUseCase` 등).
  - 외부 시스템(DB, Auth)은 인터페이스(`IPostRepository`, `IAuthService`)를 통해서만 사용합니다.
  - 유즈케이스가 실패할 경우 `domain/exceptions/`에 정의된 에러를 throw합니다.
  - UI, HTTP, 프레임워크 관련 코드 (React, Next.js 등)를 절대 import하지 않습니다.

### 📁 `src/infrastructure/`  —  외부 시스템 구현체
- **역할**: `application/interfaces/`에 정의된 인터페이스를 실제로 구현합니다.
- **포함**: `repositories/` (DB 접근), `auth/` (인증 서비스 구현)
- **규칙**:
  - 모든 클래스는 `application/interfaces/`의 인터페이스를 `implements`해야 합니다.
  - DB 교체(예: `InMemory` → `Prisma`)는 이 폴더의 파일 교체만으로 가능해야 합니다.
  - 비즈니스 로직을 포함하지 않습니다. 데이터 읽기/쓰기만 담당합니다.

### 📁 `src/presentation/`  —  UI 및 프레임워크 연동
- **역할**: Next.js와 UI를 연결하는 계층입니다.
- **포함**: `actions/` (Server Actions), `di/` (의존성 주입 컨테이너), `components/` (공유 컴포넌트)
- **규칙**:
  - 비즈니스 로직을 직접 작성하지 않습니다. 반드시 유즈케이스를 호출합니다.
  - 의존성 주입은 `di/container.ts`에서 일괄 관리합니다.
  - Server Actions (`'use server'`)는 유즈케이스 호출 및 `revalidatePath`만 담당합니다.
  - 에러는 action 내에서 `{ success: false, error: message }` 형태로 클라이언트에 반환합니다.

### 📁 `src/app/`  —  Next.js App Router 페이지
- **역할**: 라우팅 및 페이지 렌더링.
- **규칙**:
  - 페이지 컴포넌트에서는 `di/container.ts`를 통해 유즈케이스를 직접 호출하거나, Server Actions를 사용합니다.
  - 복잡한 비즈니스 판단 로직을 페이지에 작성하지 않습니다.

---

## 3. 네이밍 규칙

| 종류 | 규칙 | 예시 |
|---|---|---|
| Entity 클래스 | `PascalCase` | `Post.ts`, `User.ts` |
| Repository 인터페이스 | `I` 접두사 + `PascalCase` | `IPostRepository.ts` |
| Use Case 클래스 | 동사 + `UseCase` | `CreatePostUseCase.ts` |
| Infrastructure 구현체 | 기술명 + 인터페이스명 | `InMemoryPostRepository.ts` |
| Server Action 파일 | `camelCase` + `Actions.ts` | `postActions.ts` |
| 에러 클래스 | `PascalCase` + `Error` | `LimitExceededError` |

---

## 4. 에러 처리 규칙

- 비즈니스 규칙 위반은 `domain/exceptions/errors.ts`의 커스텀 에러 클래스를 throw합니다.
- 유즈케이스에서 throw한 에러는 Server Action의 `try/catch`에서 처리합니다.
- 클라이언트로 전달할 때는 `{ success: boolean, error?: string }` 구조를 사용합니다.

---

## 5. 새 기능 추가 시 체크리스트

새로운 기능(예: 댓글 기능)을 추가할 때 항상 이 순서를 따릅니다:

1. `domain/entities/`에 엔티티 정의 (비즈니스 규칙 포함)
2. `application/interfaces/`에 Repository / Service 인터페이스 정의
3. `application/use-cases/`에 유즈케이스 구현
4. `infrastructure/repositories/`에 실제 구현체 추가
5. `presentation/di/container.ts`에 의존성 등록
6. `presentation/actions/`에 Server Action 추가
7. `app/`에 페이지 / 컴포넌트 추가
