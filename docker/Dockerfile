FROM node:18.13 as builder
WORKDIR /build
COPY client .
RUN yarn config set network-timeout 600000 -g
RUN yarn install
RUN yarn run build
# FROM nginx:1-alpine 
EXPOSE 80
CMD [ "npm", "start" ]
# COPY docker/nginx/conf.d /etc/nginx/conf.d
# COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
# COPY --from=builder /build/client/public /etc/nginx/html/client
# cypress will request the root even though noone else uses it
# RUN echo "OK" >> /etc/nginx/html/index.html
