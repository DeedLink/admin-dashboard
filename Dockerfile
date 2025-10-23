FROM node:18-alpine AS build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json package-lock.json yarn.lock* ./
RUN if [ -f yarn.lock ]; then yarn --frozen-lockfile; else npm ci; fi
COPY . .
RUN if [ -f package.json ] && grep -q "build" package.json; then npm run build --if-present; else echo "No build script found"; fi

FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html

COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || true
EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
