var classNumber = {
  name : 'java.lang.Number',
  serialVersionUID : '-8742448824652078965',
  flags : 2,
  fields : [],
  superClass : null
}

module.exports = {
  '_$' : [{
    '$' : {
      value : 1
    },
    '$class' : {
      name : 'java.lang.Integer',
      serialVersionUID : '1360826667806852920',
      flags : 2,
      fields : [{
        type : 'I',
        name : 'value'
      }],
      superClass : classNumber
    }
  }, null, {
    '$' : {
      value : 1024.1
    },
    '$class' : {
      name : 'java.lang.Double',
      serialVersionUID : '-9172774392245257468',
      flags : 2,
      fields : [{
        type : 'D',
        name : 'value'
      }],
      superClass : classNumber
    }
  }],
  '$' : {
    size : 3,
    capacity: 10
  },
  '$class' : {
    name : 'java.util.ArrayList',
    serialVersionUID : '8683452581122892189',
    flags : 3,
    fields : [{
      type : 'I',
      name : 'size'
    }],
    superClass : null
  }
}