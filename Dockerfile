# context must be root dir of this project
FROM node


RUN mkdir -p /code/src
WORKDIR /code
COPY ./src/ /code/src/
COPY ./package.json /code/
COPY ./.eslintrc /code/
COPY ./tsconfig.json /code/
COPY ./package-lock.json /code/
RUN npm install
RUN npm run build

CMD ["bash", "-c", "node dist/main.js"]
