module.exports = { '$':
   { isValid: true,
     clientId: 'some-clientId',
     dataId: 'some-dataId',
     groups:
      { '$': { size: 2, capacity: 10 },
        '$class':
         { name: 'java.util.ArrayList',
           serialVersionUID: '8683452581122892189',
           flags: 3,
           fields: [ { type: 'I', name: 'size' } ],
           superClass: null },
        '_$': [ 'SOFA-GROUP', 'HSF' ] },
     hostId: '127.0.0.1',
     serverIP: '127.0.0.2' },
  '$class':
   { name: 'javaio.test.PureClientInfo',
     serialVersionUID: '-4839365452784671213',
     flags: 2,
     fields:
      [ { type: 'Z', name: 'isValid' },
        { type: 'L', name: 'clientId', classname: 'Ljava/lang/String;' },
        { type: 'L', name: 'dataId', classname: 'Ljava/lang/String;' },
        { type: 'L', name: 'groups', classname: 'Ljava/util/List;' },
        { type: 'L', name: 'hostId', classname: 'Ljava/lang/String;' },
        { type: 'L', name: 'serverIP', classname: 'Ljava/lang/String;' } ],
     superClass: null } }