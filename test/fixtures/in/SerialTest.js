module.exports = { '$':
   { parentVersion: 10,
     version: 66,
     con:
      { '$': { containVersion: 11 },
        '$class':
         { name: 'test.contain',
           serialVersionUID: '-3912185246934782049',
           flags: 2,
           fields: [ { type: 'I', name: 'containVersion' } ],
           superClass: null } } },
  '$class':
   { name: 'test.SerialTest',
     serialVersionUID: '-444444444555555555',
     flags: 2,
     fields:
      [ { type: 'I', name: 'version' },
        { type: 'L', name: 'con', classname: 'Ltest/contain;' } ],
     superClass:
      { name: 'test.parent',
        serialVersionUID: '-8467818262607962318',
        flags: 2,
        fields: [ { type: 'I', name: 'parentVersion' } ],
        superClass: null } } }