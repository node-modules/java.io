var pcls = {
          name : 'java.lang.Number',
          serialVersionUID : '-8742448824652078965',
          flags : 2,
          fields : [],
          superClass : null
        }

var cls = {
        name : 'java.lang.Integer',
        serialVersionUID : '1360826667806852920',
        flags : 2,
        fields : [{
          type : 'I',
          name : 'value'
        }],
        superClass : pcls
      }

module.exports = {
  '_$' : {
    '0' : {
      '$' : {
        value : 0
      },
      '$class' : cls
    },
    '1' : {
      '$' : {
        value : 1
      },
      '$class' : cls
    },
    '2' : {
      '$' : {
        value : 2
      },
      '$class' : cls
    }
  },
  '$': { loadFactor: 0.75, threshold: 12 },
  '$class' : {
    name : 'java.util.HashMap',
    serialVersionUID : '362498820763181265',
    flags : 3,
    fields : [{
      type : 'F',
      name : 'loadFactor'
    }, {
      type : 'I',
      name : 'threshold'
    }],
    superClass : null
  }
}