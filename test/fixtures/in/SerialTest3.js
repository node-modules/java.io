var parentClass = { name: 'test.parent',
			  serialVersionUID: '-3491248796286893704',
			  flags: 3,
			  fields: [],
			  superClass: null };

var containClass = { name: 'test.AE',
			  serialVersionUID: '1',
			  flags: 3,
			  fields: [{
			    type: 'L',
			    name: 'name',
			    classname: 'Ljava/lang/String;'
			  }, {
			    type: 'L',
			    name: 'value',
			    classname: 'Ljava/io/Serializable;'
			  }],
			  superClass: null };

module.exports = {
		  '$': {},
		  '$class': {
		    name: 'test.PP',
		    serialVersionUID: '1',
		    flags: 2,
		    fields: [],
		    superClass: parentClass
		  },
		  elements: [{
		    '$': {
		      build: 0,
		      major: 1,
		      minor: 2
		    },
		    '$class': {
		      name: 'test.VersionElement',
		      serialVersionUID: '1',
		      flags: 2,
		      fields: [{
		        type: 'I',
		        name: 'build'
		      }, {
		        type: 'S',
		        name: 'major'
		      }, {
		        type: 'S',
		        name: 'minor'
		      }],
		      superClass: null
		    }
		  }, {
		    '$': {},
		    '$class': {
		      name: 'test.SP',
		      serialVersionUID: '1',
		      flags: 2,
		      fields: [],
		      superClass: {
		        name: 'test.DP',
		        serialVersionUID: '2599767358714732354',
		        flags: 2,
		        fields: [],
		        superClass: parentClass
		      }
		    },
		    elements: [{
		      '$': {
		        clientId: 'Mr. Wish.1',
		        dataId: 'xxx',
		        datumId: null
		      },
		      '$class': {
		        name: 'test.SE',
		        serialVersionUID: '1',
		        flags: 2,
		        fields: [],
		        superClass: {
		          name: 'test.DE',
		          serialVersionUID: '6039820397437263813',
		          flags: 2,
		          fields: [{
		            type: 'L',
		            name: 'clientId',
		            classname: 'Ljava/lang/String;'
		          }, {
		            type: 'L',
		            name: 'dataId',
		            classname: 'Ljava/lang/String;'
		          }, {
		            type: 'L',
		            name: 'datumId',
		            classname: 'Ljava/lang/String;'
		          }],
		          superClass: null
		        }
		      }
		    }, {
		      '$': {
		        name: '!Group',
		        value: 'XXX'
		      },
		      '$class': containClass
		    }]
		  }, {
		    '$': {
		      name: '!ZIP',
		      value: 'true'
		    },
		    '$class': containClass
		  }]
		};