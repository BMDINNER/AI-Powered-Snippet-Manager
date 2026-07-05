FROM node:22-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_KEY
ARG VITE_PROJECT_ID

ENV VITE_API_KEY=$VITE_API_KEY
ENV VITE_PROJECT_ID=$VITE_PROJECT_ID

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]