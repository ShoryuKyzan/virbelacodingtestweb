# context must be root dir of this project
FROM node

RUN mkdir /code
WORKDIR /code
COPY ./src/main.js /code/
COPY ./src/package.json /code/
COPY ./src/package-lock.json /code/
RUN npm install

CMD ["bash", "-c", "node main.js"]
