# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────
#  Frontend: Vite build → nginx (static)
# ─────────────────────────────────────────────────────────────

FROM node:20-alpine AS build
WORKDIR /app

# build-time API base — ส่งผ่าน --build-arg ตอน build
ARG VITE_API_BASE=http://localhost:8000
ENV VITE_API_BASE=$VITE_API_BASE

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ── Runtime: nginx เสิร์ฟ static + SPA fallback
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
