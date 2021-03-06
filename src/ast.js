import _ from 'lodash';

const propertyActions = [
  {
    typeNode: 'nested',
    check: (obj1, obj2, key) => (_.isObject(obj1[key]) && _.isObject(obj2[key])),
    process: (obj1, obj2, fn) => fn(obj1, obj2),
  },

  {
    typeNode: 'unchanged',
    check: (obj1, obj2, key) => (_.has(obj1, key) && _.has(obj2, key)) &&
      (obj1[key] === obj2[key]),
    process: (obj1, obj2) => ({ before: obj1, after: obj2 }),
  },

  {
    typeNode: 'changed',
    check: (obj1, obj2, key) => (_.has(obj1, key) && _.has(obj2, key)) &&
      (obj1[key] !== obj2[key]),
    process: (obj1, obj2) => ({ before: obj1, after: obj2 }),
  },
  {
    typeNode: 'added',
    check: (obj1, obj2, key) => (!_.has(obj1, key) && _.has(obj2, key)),
    process: (obj1, obj2) => ({ before: obj1, after: obj2 }),
  },
  {
    typeNode: 'deleted',
    check: (obj1, obj2, key) => (_.has(obj1, key) && !_.has(obj2, key)),
    process: (obj1, obj2) => ({ before: obj1, after: obj2 }),
  },
];

const buildAst = (obj1, obj2) => {
  const keys = _.union(Object.keys(obj1), Object.keys(obj2));
  return keys.map((key) => {
    const { typeNode, process } = propertyActions.find(({ check }) =>
      check(obj1, obj2, key));
    const children = process(obj1[key], obj2[key], buildAst);
    return { key, typeNode, children };
  });
};

export default buildAst;
