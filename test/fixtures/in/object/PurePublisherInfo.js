var arrCls = { name: 'java.util.ArrayList',
           serialVersionUID: '8683452581122892189',
           flags: 3,
           fields: [ { type: 'I', name: 'size' } ],
           superClass: null }

var clientInfoCls = { name: 'javaio.test.PureClientInfo',
                serialVersionUID: '-4839365452784671213',
                flags: 2,
                fields:
                 [ { type: 'Z', name: 'isValid' },
                   { type: 'L', name: 'clientId', classname: 'Ljava/lang/String;' },
                   { type: 'L', name: 'dataId', classname: 'Ljava/lang/String;' },
                   { type: 'L', name: 'groups', classname: 'Ljava/util/List;' },
                   { type: 'L', name: 'hostId', classname: 'Ljava/lang/String;' },
                   { type: 'L', name: 'serverIP', classname: 'Ljava/lang/String;' } ],
                superClass: null }

var groupsValue = { '$': { size: 2, capacity: 10 },
        '$class': arrCls,
        '_$': [ 'SOFA-GROUP', 'HSF' ] }

module.exports = { '$':
   { isValid: true,
     clientId: 'some-clientId',
     dataId: 'some-dataId',
     groups: groupsValue ,
     hostId: '127.0.0.1',
     serverIP: '127.0.0.2',
     isClusterPublisher: true,
     isPersistent: true,
     data:
      { '$': { size: 1, capacity: 10 },
        '$class': arrCls,
        '_$':
         [ { '$':
              { isValid: true,
                clientId: 'some-clientId',
                dataId: 'some-dataId',
                groups: groupsValue,
                hostId: '127.0.0.1',
                serverIP: '127.0.0.2' },
             '$class': clientInfoCls
               } ] },
     datumId: 'some-datumId' },
  '$class':
   { name: 'javaio.test.PurePublisherInfo',
     serialVersionUID: '-4839365452784671214',
     flags: 2,
     fields:
      [ { type: 'Z', name: 'isClusterPublisher' },
        { type: 'Z', name: 'isPersistent' },
        { type: 'L', name: 'data', classname: 'Ljava/util/List;' },
        { type: 'L', name: 'datumId', classname: 'Ljava/lang/String;' } ],
     superClass: clientInfoCls } }