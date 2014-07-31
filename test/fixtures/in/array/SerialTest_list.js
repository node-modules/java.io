var containClass = { name: 'test.contain',
                serialVersionUID: '-3912185246934782049',
                flags: 2,
                fields: [ { type: 'I', name: 'containVersion' } ],
                superClass: null }

var parentClass = { name: 'test.parent',
             serialVersionUID: '-8467818262607962318',
             flags: 2,
             fields: [ { type: 'I', name: 'parentVersion' } ],
             superClass: null }

var serialClass =  { name: 'test.SerialTest',
          serialVersionUID: '-444444444555555555',
          flags: 2,
          fields:
           [ { type: 'I', name: 'version' },
             { type: 'L', name: 'con', classname: 'Ltest/contain;' } ],
          superClass: parentClass
            }

module.exports = { '$': { size: 3 ,
    capacity: 10},
  '$class':
   { name: 'java.util.ArrayList',
     serialVersionUID: '8683452581122892189',
     flags: 3,
     fields: [ { type: 'I', name: 'size' } ],
     superClass: null },
  '_$':
   [ { '$':
        { parentVersion: 10,
          version: 66,
          con:
           { '$': { containVersion: 11 },
             '$class': containClass } },
       '$class': serialClass },
     { '$':
        { parentVersion: 10,
          version: 66,
          con:
           { '$': { containVersion: 11 },
             '$class': containClass } },
       '$class': serialClass },
     { '$':
        { parentVersion: 10,
          version: 66,
          con:
           { '$': { containVersion: 11 },
             '$class': containClass } },
       '$class': serialClass } ] }