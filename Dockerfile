# syntax=docker/dockerfile:1.7

# ──────────────────────────────────────────────────────────────────────────────
# deps: production/build 의존성 설치
# ──────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app

# alpine 호환성 (libc 관련 경고 방지)
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

# ──────────────────────────────────────────────────────────────────────────────
# builder: Next.js 빌드
# - NEXT_PUBLIC_* 같은 빌드 타임 변수가 없어야 한다 (런타임 주입 정책).
# - 런타임 변수(API_URL 등)는 builder에 주입하지 않는다.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ──────────────────────────────────────────────────────────────────────────────
# runner: 실행 전용 슬림 이미지
# - next.config.js 의 `output: 'standalone'` 산출물만 복사
# - 런타임 변수는 k3s 등에서 env 로 주입
#     API_URL=https://api.oinkvalley.example
#     SIGNUP_ENABLED=true
# ──────────────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
