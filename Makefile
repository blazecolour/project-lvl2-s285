install: 
		npm install

start: 
		npm run babel-node -- src/bin/gendiff.js before.json after.json

test:
		npm test

lint: 
		npm run eslint .

publish: 
		npm publish
