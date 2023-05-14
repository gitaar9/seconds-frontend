up:
		docker run --name mynginx1 -p 80:80 --mount type=bind,source=/projects/seconds-frontend/dist/seconds-frontend,target=/data/www,readonly --mount type=bind,source=/projects/seconds-frontend/nginx_docker/default.conf,target=/etc/nginx/conf.d/default.conf,readonly -d nginx:1.24.0

down:
		docker stop  mynginx1

restart:
		docker restart mynginx1

enter:
		docker exec -it mynginx1 bash

remove:
		docker rm mynginx1

logs:
		docker logs mynginx1
