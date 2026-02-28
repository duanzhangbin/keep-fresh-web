FROM node:20-alpine

RUN apk add --no-cache nginx supervisor bash git

WORKDIR /opt/freshkeep

COPY . .

RUN cd frontend && npm install && npm run build

RUN cd backend && npm install && npx prisma generate

COPY nginx.conf /etc/nginx/http.d/freshkeep.conf
COPY supervisord.conf /etc/supervisor/conf.d/freshkeep.conf

RUN mkdir -p /var/log/pm2 /var/log/nginx

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/freshkeep.conf"]
