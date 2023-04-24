# seconds-frontend
The dockerized Angular frontend of a game, in which youll get 30 seconds to explain 5 words.


# How to deploy

    sudo apt-get update
    sudo apt-get install nginx
    sudo ufw app list
    sudo ufw allow ‘Nginx HTTP’
    systemctl status nginx

mkdir /data
mkdir /data/www

move all build files into /data/www

Make sure this is in the config file:
        server {
                location / {
                        root /data/www;
                        index index.html;
                        try_files $uri $uri/ /index.html;
                }
        }

        #include /etc/nginx/conf.d/*.conf;
        #include /etc/nginx/sites-enabled/*;
