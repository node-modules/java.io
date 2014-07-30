var numberCls = { name: 'java.lang.Number',
              serialVersionUID: '-8742448824652078965',
              flags: 2,
              fields: [],
              superClass: null }

var boolCls = { name: 'java.lang.Boolean',
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
   { 'char':
      { '$': { value: 22 },
        '$class':
         { name: 'java.lang.Character',
           serialVersionUID: '3786198910865385080',
           flags: 2,
           fields: [ { type: 'C', name: 'value' } ],
           superClass: null } },
     'byte':
      { '$': { value: 1 },
        '$class':
         { name: 'java.lang.Byte',
           serialVersionUID: '-7183698231559129828',
           flags: 2,
           fields: [ { type: 'B', name: 'value' } ],
           superClass: numberCls } },
     'String': 'int',
     'int':
      { '$': { value: 1 },
        '$class':
         { name: 'java.lang.Integer',
           serialVersionUID: '1360826667806852920',
           flags: 2,
           fields: [ { type: 'I', name: 'value' } ],
           superClass: numberCls } },
     'boolean':
      { '$': { value: true },
        '$class': boolCls },
     'double':
      { '$': { value: 1.1 },
        '$class':
         { name: 'java.lang.Double',
           serialVersionUID: '-9172774392245257468',
           flags: 2,
           fields: [ { type: 'D', name: 'value' } ],
           superClass: numberCls } },
     'float':
      { '$': { value: 2.200000047683716 },
        '$class':
         { name: 'java.lang.Float',
           serialVersionUID: '-2671257302660747028',
           flags: 2,
           fields: [ { type: 'F', name: 'value' } ],
           superClass: numberCls } },
     booleanf:
      { '$': { value: false },
        '$class':boolCls } } }