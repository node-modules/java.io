var boolClass = { name: 'java.lang.Boolean',
           serialVersionUID: '-3665804199014368530',
           flags: 2,
           fields: [ { type: 'Z', name: 'value' } ],
           superClass: null }

module.exports = { '$': { loadFactor: 0.75, threshold: 12 },
  '$class':
   { name: 'java.util.HashMap',
     serialVersionUID: '362498820763181265',
     flags: 3,
     fields:
      [ { type: 'F', name: 'loadFactor' },
        { type: 'I', name: 'threshold' } ],
     superClass: null },
  '_$':
   { false:
      { '$': { value: false },
        '$class': boolClass },
     true:
      { '$': { value: true },
        '$class': boolClass } } }