# context must be root dir of this project
FROM node

RUN mkdir /code
WORKDIR /code
COPY ./src/main.ts /code/
COPY ./package.json /code/
COPY ./package-lock.json /code/
RUN npm install

CMD ["bash", "-c", "node main.js"]
