# base image
FROM node:16

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
#RUN npm install
#RUN npm install -g @angular/cli@7.3.9
#RUN npm install jquery --save
#RUN npm install materialize-css --save
#RUN ng update
#RUN npm update
# add app
COPY . /app

# start app
CMD tail -f /dev/null # ng serve --host 0.0.0.0
