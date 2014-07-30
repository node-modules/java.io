var numCls = { name: 'java.lang.Number',
             serialVersionUID: '-8742448824652078965',
             flags: 2,
             fields: [],
             superClass: null }

var intCls = { name: 'java.lang.Integer',
          serialVersionUID: '1360826667806852920',
          flags: 2,
          fields: [ { type: 'I', name: 'value' } ],
          superClass: numCls }

var v = { '$': { value: 1 }, '$class': intCls }

module.exports = { '$': { size: 100 , capacity: 109},
  '$class':
   { name: 'java.util.ArrayList',
     serialVersionUID: '8683452581122892189',
     flags: 3,
     fields: [ { type: 'I', name: 'size' } ],
     superClass: null },
  '_$':
   [ v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v,
     v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v,
     v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v,
     v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v,
     v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v, v ] }