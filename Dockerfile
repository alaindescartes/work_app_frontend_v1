# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# install deps first for cache
COPY package*.json ./
RUN npm ci

# copy source & build
COPY . .
RUN npm run build

# ---------- run stage ----------
FROM node:20-alpine
WORKDIR /app

# Next 15 needs the entire .next + node_modules
COPY --from=build /app . ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]