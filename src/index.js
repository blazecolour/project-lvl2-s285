import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import yaml from 'js-yaml';
import ini from 'ini';

const propertyActions = [
  {
    typeNode: 'initial',
    check: (obj1, obj2, key) =>
      (_.has(obj1, key) && _.has(obj2, key)) && (obj1[key] === obj2[key]),
    process: (obj1, obj2, key) => `  ${key}: ${obj1[key]}`,
  },
  {
    typeNode: 'changed',
    check: (obj1, obj2, key) =>
      (_.has(obj1, key) && _.has(obj2, key)) && (obj1[key] !== obj2[key]),
    process: (obj1, obj2, key) =>
      `+ ${key}: ${obj2[key]}\n- ${key}: ${obj1[key]}`,
  },
  {
    typeNode: 'added',
    check: (obj1, obj2, key) => !_.has(obj1, key) && _.has(obj2, key),
    process: (obj1, obj2, key) => `+ ${key}: ${obj2[key]}`,
  },
  {
    typeNode: 'deleted',
    check: (obj1, obj2, key) => _.has(obj1, key) && !_.has(obj2, key),
    process: (obj1, obj2, key) => `- ${key}: ${obj1[key]}`,
  },
];

const parsers = {
  json: JSON.parse,
  yml: yaml.safeLoad,
  ini: ini.parse,
};

const genDiff = (file1, file2) => {
  const data1 = fs.readFileSync(file1, 'utf8');
  const data2 = fs.readFileSync(file2, 'utf8');
  const fileExt = path.extname(file1).slice(1);
  const obj1 = parsers[fileExt](data1);
  const obj2 = parsers[fileExt](data2);
  const keys = _.union(Object.keys(obj1), Object.keys(obj2));
  const getPropertyActions = key =>
    propertyActions.find(({ check }) => check(obj1, obj2, key));
  const result = keys.reduce((acc, key) => {
    const build = getPropertyActions(key).process;
    return [...acc, build(obj1, obj2, key)];
  }, []);
  return `{\n${result.join('\n')}\n}`;
};

export default genDiff;
