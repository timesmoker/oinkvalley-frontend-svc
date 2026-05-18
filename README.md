# frontend-svc

Oinkvalley **웹 프론트엔드**다. Next.js(App Router) 기반이며, 게시판(Board)·게시글(Post)·댓글(Comment) 화면과 인증·프로필 조회를 **업스트림 REST API**와 연동한다.

브라우저에서는 **httpOnly 쿠키**로 세션을 두고, Axios가 `withCredentials: true`로 쿠키를 보낸다. **board-svc** 등 업스트림에는 게이트웨이가 `**Authorization: Bearer <JWT>`** 로 변환해 넘기는 전제를 둔다(프론트 앱이 Bearer 헤더를 직접 조립하지 않는 경로가 기본이다). 서버 컴포넌트에서의 업스트림 `fetch`는 들어온 요청의 `**Cookie` / `Authorization**` 을 그대로 전달한다.

의존성·런타임 버전 요약은 `**package.json**` 과 `**volta**` 필드를 본다(Node 18 계열).

**단일 진실 소스(SOT):** 배포·운영에서 쓰는 값의 기준은 무조건 **infra 폴더**(Helm values, 매니페스트, 환경 변수 정의 등)에 있다. 로컬 `.env.local` 은 편의용이며, 충돌하면 **infra 쪽이 정답이다.**

---

## 목차

- [빠른 시작](#빠른-시작)
- [설정](#설정)
- [프로젝트 구조](#프로젝트-구조)
- [HTTP API 연동](#http-api-연동)

---

## 빠른 시작

- **Node:** `package.json` 의 `volta.node` (예: 18.18.2)에 맞춘다.
- **의존성:** `npm ci`
- **개발 서버:** `npm run dev`
- **프로덕션 빌드·실행:** `npm run build` 후 `npm run start`

로컬 `.env.local` 예시:

```env
API_URL=http://localhost:8080
SIGNUP_ENABLED=true
```

Docker 로컬 실행 예시:

```bash
docker build -t frontend-svc:local .
docker run --rm -p 3000:3000 \
  -e API_URL=http://host.docker.internal:8080 \
  -e SIGNUP_ENABLED=true \
  frontend-svc:local
```

k3s 로컬(`infra/k3s/local/up.sh`)은 `frontend-svc:latest` 태그를 기대한다. `docker build -t frontend-svc:latest .`

---

## 설정

런타임에 Next 서버가 환경 변수를 읽는다. `**NEXT_PUBLIC_***` 로 베이스 URL을 박지 않는다. 클라이언트가 필요한 공개 설정은 `**GET /runtime-config**` 로 내려받아 브라우저에서 1회 캐시한다.

**SOT 재확인:** 클러스터·배포에 실제로 쓰는 키·값은 **infra 폴더**를 따른다(이 절의 표는 이름·역할 참고용).

### 환경 변수


| 환경 변수            | 바인딩(요지)                                               | 설명                                                                           |
| ---------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `API_URL`        | Next 서버 (`process.env.API_URL`), `/runtime-config` 응답 | API 게이트웨이 **절대 URL**(필수). 비어 있으면 SSR은 즉시 throw. 끝에 `/api` 등 경로 접미사를 붙이지 않는다. |
| `SIGNUP_ENABLED` | `/runtime-config` 응답                                  | `"true"`일 때만 회원가입 UX가 요청을 시도한다. 실제 허용 여부는 백엔드 책임!!!!!                        |


운영 시 같은 도메인 계열에서 쿠키 공유·CORS·Ingress 라우팅은 **infra / 게이트웨이**에서 맞춘다.

---

## 프로젝트 구조


| 경로                      | 역할                                       |
| ----------------------- | ---------------------------------------- |
| `src/app/`              | App Router 페이지·레이아웃·`runtime-config` 라우트 |
| `src/features/auth/`    | 로그인·로그아웃·회원가입 API 훅·스토어·초기화              |
| `src/features/boards/`  | 게시판·글·댓글 API·컴포넌트·타입                     |
| `src/features/profile/` | 작성자 닉네임 조회(`profiles`)                   |
| `src/lib/api/`          | Axios 클라이언트·SSR 베이스 URL·런타임 설정 로더        |
| `src/components/`       | 공통 UI·레이아웃 헤더/푸터                         |


세부 호출 경로는 아래 [HTTP API 연동](#http-api-연동)과 소스의 `boardSvc`, `loginApi`, `profileSvc` 등을 본다.

---

## HTTP API 연동

베이스 URL·리버스 프록시 접두 경로는 이 저장소에서 고정하지 않는다.

### 호출 방식 요약


| 방식                       | 용도                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| 서버(RSC) `fetch`          | 게시판 목록·번들·글 상세·프로필 배치 등. `getServerApiBaseUrl()` + `buildSsrUpstreamFetchInit`, `cache: 'no-store'`. |
| 브라우저 Axios (`apiClient`) | 로그인·글/댓글 변경 등. 첫 요청 전 `/runtime-config`로 `apiUrl` 확보. `withCredentials: true`.                       |


### 인증·프로필

로그인 ID는 **이메일(`email`)** 이다.


| 메서드    | 경로                    | 비고                                                              |
| ------ | --------------------- | --------------------------------------------------------------- |
| `POST` | `/auth/login`         | `{ email, password }`                                           |
| `GET`  | `/auth/me`            | 세션 확인                                                           |
| `POST` | `/auth/logout`        |                                                                 |
| `POST` | `/auth/signup`        | `{ email, password, nickname }` — `SIGNUP_ENABLED=true` 일 때만 시도 |
| `GET`  | `/profiles?ids=1,2,3` | 닉네임 배치                                                          |


### 게시판·글 (서버 `fetch`)


| 메서드   | 경로                              |
| ----- | ------------------------------- |
| `GET` | `/boards`                       |
| `GET` | `/boards/{segment}?page=&size=` |
| `GET` | `/boards/{segment}/{postId}`    |


`{segment}` 는 숫자만이면 보드 PK, 아니면 slug.

### 게시판·글·댓글 (브라우저)


| 메서드      | 경로                                                |
| -------- | ------------------------------------------------- |
| `POST`   | `/posts` — `{ boardId, title, content }`          |
| `PUT`    | `/posts/{postId}`                                 |
| `DELETE` | `/posts/{postId}`                                 |
| `GET`    | `/comments?postId=&page=&size=` — 401이면 로그인 안내 UI |
| `POST`   | `/comments?postId=` — `{ content }`               |
| `PUT`    | `/comments/{commentId}`                           |
| `DELETE` | `/comments/{commentId}`                           |


### 화면 ↔ 호출


| 앱 라우트                          | 주요 API                                                  |
| ------------------------------ | ------------------------------------------------------- |
| `/boards`                      | `GET /boards`                                           |
| `/boards/[slug]`               | `GET /boards/{segment}?page=&size=` → `GET /profiles?…` |
| `/boards/[slug]/write`         | `GET /boards/{segment}/write`, `POST /posts`            |
| `/boards/[slug]/[postId]`      | 번들·상세·프로필·댓글 목록                                         |
| `/boards/[slug]/[postId]/edit` | 조회 후 `PUT /posts/{postId}`                              |


### 상태 코드(프론트 처리 기준)

`200` 정상 · `400` 잘못된 요청 · `401` 인증 필요 · `403` 권한 없음 · `404` 없음

글·댓글·보드 규칙은 **board-svc** 계약과 같다. 게시글 단건은 `GET /posts/{id}` 가 아니라 `**GET /boards/{segment}/{postId}`** 만 쓴다. JSON 필드는 **camelCase** 가정.