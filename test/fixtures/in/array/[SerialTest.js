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


module.exports = { '$':
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
       '$class': serialClass } ],
  '$class':
   { name: '[Ltest.SerialTest;',
     serialVersionUID: '-1850949957007947226',
     flags: 2,
     fields: [],
     superClass: null } }