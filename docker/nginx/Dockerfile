FROM nginx:latest
RUN rm -f /etc/nginx/conf.d/*

ADD nginx.conf /etc/nginx/conf.d/myapp.conf
EXPOSE 8080
RUN service nginx start