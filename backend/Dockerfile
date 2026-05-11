FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json ./
COPY backend/package.json backend/package.json
RUN npm install --workspace backend

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY backend ./backend
WORKDIR /app/backend
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY backend/package.json backend/package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./backend/dist
WORKDIR /app/backend
EXPOSE 3333
CMD ["npm", "start"]
