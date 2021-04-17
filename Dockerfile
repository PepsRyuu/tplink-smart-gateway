FROM node:14
RUN mkdir /code
WORKDIR /code

COPY package.json /code
RUN npm install --quiet

COPY . /code

CMD ["npm", "start"]