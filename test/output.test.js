'use strict';

/**
 * Module dependencies.
 */

var utils = require('./utils');
var InputStream = require('../lib/input');
var OutputStream = require('../lib/output');

require('./addobjects');

describe('output.test.js', function () {
  describe('Enum', function () {
    it('write enum', function() {
      OutputStream.write(utils.obj('enum/WeekDayEnum_Mon')).should.eql(utils.bytes('enum/WeekDayEnum_Mon'));
      OutputStream.write(utils.obj('enum/WeekDayEnum_Thu')).should.eql(utils.bytes('enum/WeekDayEnum_Thu'));
      OutputStream.write(utils.obj('enum/WeekDayEnum_Sat')).should.eql(utils.bytes('enum/WeekDayEnum_Sat'));
      OutputStream.write(utils.obj('enum/WeekDayEnum_Sun')).should.eql(utils.bytes('enum/WeekDayEnum_Sun'));
    })
  });

  describe('Array', function () {
    it('write Primitive value list', function () {
      OutputStream.write(utils.obj('array/[int')).should.eql(utils.bytes('array/[int'));
      OutputStream.write(utils.obj('array/[byte')).should.eql(utils.bytes('array/[byte'));
      OutputStream.write(utils.obj('array/[char')).should.eql(utils.bytes('array/[char'));
      OutputStream.write(utils.obj('array/[short')).should.eql(utils.bytes('array/[short'));
      OutputStream.write(utils.obj('array/[float')).should.eql(utils.bytes('array/[float'));
      OutputStream.write(utils.obj('array/[double')).should.eql(utils.bytes('array/[double'));
      OutputStream.write(utils.obj('array/[String')).should.eql(utils.bytes('array/[String'));
      OutputStream.write(utils.obj('array/[boolean')).should.eql(utils.bytes('array/[boolean'));
      OutputStream.write(utils.obj('array/[Object')).should.eql(utils.bytes('array/[Object'));
    });

    it('write ArrayList', function () {
      OutputStream.write(utils.obj('array/objs2')).should.eql(utils.bytes('array/objs2'));
      OutputStream.write(utils.obj('array/objs')).should.eql(utils.bytes('array/objs'));
      OutputStream.write(utils.obj('array/strs')).should.eql(utils.bytes('array/strs'));
    });

    it('write Object list', function () {
      OutputStream.write(utils.obj('array/[SerialTest')).should.eql(utils.bytes('array/[SerialTest'));
      OutputStream.write(utils.obj('array/SerialTest_list')).should.eql(utils.bytes('array/SerialTest_list'));
    });

    it('write object as ArrayList<SimplePurePublisherInfo>', function () {
      OutputStream.write(utils.obj('array_simplefinfo')).should.eql(utils.bytes('array_simplefinfo'));
    });
  });

  describe('Map', function () {
    it('write map', function() {
      // NOTE:
      // cannot compare the output buffer with bin file directly
      // because map cannot guarantee the order that the entries be written in
      //   when some key is number
      var obj = utils.obj('map/int');
      var outBuf = OutputStream.write(obj);
      var inputStream = new InputStream(outBuf, true);
      var readObj = inputStream.readObject();
      obj.should.eql(readObj);

      OutputStream.write(utils.obj('map/boolean')).should.eql(utils.bytes('map/boolean'));
      OutputStream.write(utils.obj('map/objs')).should.eql(utils.bytes('map/objs'));
      OutputStream.write(utils.obj('map/String')).should.eql(utils.bytes('map/String'));
    })
  });

  describe('Primitive Value', function () {

    it('write byte', function(){
      OutputStream.write(utils.obj('byte/0xff')).should.eql(utils.bytes('byte/0xff'));
    });

    it('write char', function() {
      OutputStream.write(utils.obj('char/0xff')).should.eql(utils.bytes('char/0xff'));
    });

    it('write double', function() {
      OutputStream.write(utils.obj('double/0')).should.eql(utils.bytes('double/0'));
    });

    it('write float', function() {
      OutputStream.write(utils.obj('float/0')).should.eql(utils.bytes('float/0'));
    });

    it('write int', function() {
      OutputStream.write(utils.obj('int/1024')).should.eql(utils.bytes('int/1024'));
    });

    it('write long', function() {
      OutputStream.write(utils.obj('long/-12345678')).should.eql(utils.bytes('long/-12345678'));
    });

    it('write short', function() {
      OutputStream.write(utils.obj('short/0')).should.eql(utils.bytes('short/0'));
    });

    it('write boolean', function() {
      OutputStream.write(utils.obj('boolean/true')).should.eql(utils.bytes('boolean/true'));
    });

    it('write null', function () {
      OutputStream.write(null).should.eql(new Buffer([0xac, 0xed, 0x00, 0x05, 0x70]));
    });

    it('write String', function () {
      OutputStream.write('').should.eql(utils.bytes('String/empty'));
      OutputStream.write('foo').should.eql(utils.bytes('String/foo'));
      OutputStream.write('foo 还有中文').should.eql(utils.bytes('String/nonascii'));

      var large65535 = '';
      for (var i = 0; i < 65535; i++) {
        large65535 += 'a';
      }
      OutputStream.write(large65535).should.eql(utils.bytes('String/65535'));

      var large65536 = '';
      for (var i = 0; i < 65536; i++) {
        large65536 += 'a';
      }
      OutputStream.write(large65536).should.eql(utils.bytes('String/65536'));

      var large65535 = '';
      for (var i = 0; i < 65535; i++) {
        large65535 += '中';
      }
      OutputStream.write(large65535).should.eql(utils.bytes('String/65535_nonascii'));
    });
  });

  describe('Simple Object', function () {
    it('write SerialTestRef object', function () {
      OutputStream.write(utils.obj('SerialTestRef')).should.eql(utils.bytes('SerialTestRef'));
    });

    it('write SerialTestValues object', function () {
      OutputStream.write(utils.obj('SerialTestValues')).should.eql(utils.bytes('SerialTestValues'));
    });

    it('write SerialError object', function () {
      (function () {
        OutputStream.write(utils.obj('SerialError'));
      }).should.throw('Class "test.Error" dose not be added in or not implement writeObject()');
    });

    it('write SerialTest3 object', function () {
      OutputStream.write(utils.obj('SerialTest3')).should.eql(utils.bytes('SerialTest3'));
    });

    it('write SerialTest2 object', function () {
      OutputStream.write(utils.obj('SerialTest2')).should.eql(utils.bytes('SerialTest2'));
    });

    it('write SerialTest object', function () {
      OutputStream.write(utils.obj('SerialTest')).should.eql(utils.bytes('SerialTest'));
    });

    it('write PureClientInfo', function () {
      OutputStream.write(utils.obj('object/PureClientInfo')).should.eql(utils.bytes('object/PureClientInfo'));
    });

    it('write PurePublisherInfo', function () {
      OutputStream.write(utils.obj('object/PurePublisherInfo')).should.eql(utils.bytes('object/PurePublisherInfo'));
    });

    it('write undefined property', function () {
      var obj = {
        "$": {
          foo: undefined
        },
        "$class": {
          "name": "xxx",
          "serialVersionUID": "1",
          "flags": 2,
          "fields": [{
             "type": "L",
             "name": "foo",
             "classname": "Ljava/lang/String;"
           }],
          "superClass": null
        }
      };
      var buf = OutputStream.write(obj);
      var inputStream = new InputStream(buf, true);
      var readObj = inputStream.readObject();
      obj.$.foo = null;
      readObj.should.eql(obj);
    });

     it('write bolck header', function () {
      var out = new OutputStream();
      out.writeBlockHeader(5);
      out.writeBlockHeader(256);
      out.writeBlockHeader(512);
      out.writeBlockHeader(1024);
      out.writeBlockHeader(2029);
      out.writeBlockHeader(8888);

      var ins = new InputStream(out.buf);
      ins.readBlockHeader().should.eql(5);
      ins.readBlockHeader().should.eql(256);
      ins.readBlockHeader().should.eql(512);
      ins.readBlockHeader().should.eql(1024);
      ins.readBlockHeader().should.eql(2029);
      ins.readBlockHeader().should.eql(8888);
    });
  });

  describe('Date', function() {
    it('should write Date', function() {
      OutputStream.write({
        $: {},
        $class: {
          name: 'java.util.Date',
          serialVersionUID: '7523967970034938905',
          flags: 3,
          fields: [],
          superClass: null,
        },
        _$: new Date('2016-11-28T04:16:49.696Z'),
      }).should.eql(new Buffer('aced00057372000e6a6176612e7574696c2e44617465686a81014b5974190300007870770800000158a9264e2078', 'hex'));
    });
  });

  describe('HashSet', function() {
    it('should write HashSet', function() {
      OutputStream.write({
        $: {},
        $class: {
          name: 'java.util.HashSet',
          serialVersionUID: '-5024744406713321676',
          flags: 3,
          fields: [],
          superClass: null,
        },
        _$: [{
          $: {
            value: 123,
          },
          $class: {
            name: 'java.lang.Integer',
            serialVersionUID: '1360826667806852920',
            flags: 2,
            fields: [{
              type: 'I',
              name: 'value',
            }],
            superClass: {
              name: 'java.lang.Number',
              serialVersionUID: '-8742448824652078965',
              flags: 2,
              fields: [],
              superClass: null,
            },
          }
        }, {
          $: {
            value: true,
          },
          $class: {
            name: 'java.lang.Boolean',
            serialVersionUID: '-3665804199014368530',
            flags: 2,
            fields: [{
              type: 'Z',
              name: 'value',
            }],
            superClass: null,
          },
        }],
      }).should.eql(new Buffer('aced0005737200116a6176612e7574696c2e48617368536574ba44859596b8b7340300007870770c000000103f40000000000002737200116a6176612e6c616e672e496e746567657212e2a0a4f781873802000149000576616c7565787200106a6176612e6c616e672e4e756d62657286ac951d0b94e08b02000078700000007b737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c756578700178', 'hex'));
    });

    it('should write HashSet with big size', function() {
      var array = [];
      for (var i = 0; i < 13; ++i) {
        array.push({
          $: {
            value: true,
          },
          $class: {
            name: 'java.lang.Boolean',
            serialVersionUID: '-3665804199014368530',
            flags: 2,
            fields: [{
              type: 'Z',
              name: 'value',
            }],
            superClass: null,
          },
        });
      }
      OutputStream.write({
        $: {},
        $class: {
          name: 'java.util.HashSet',
          serialVersionUID: '-5024744406713321676',
          flags: 3,
          fields: [],
          superClass: null,
        },
        _$: array,
      }).should.eql(new Buffer('aced0005737200116a6176612e7574696c2e48617368536574ba44859596b8b7340300007870770c000000203f4000000000000d737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c7565787001737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c7565787001737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c7565787001737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c7565787001737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c7565787001737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c7565787001737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c7565787001737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c7565787001737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c7565787001737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c7565787001737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c7565787001737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c7565787001737200116a6176612e6c616e672e426f6f6c65616ecd207280d59cfaee0200015a000576616c756578700178', 'hex'));
    });
  });

  describe('TreeSet', function() {
    it('should write TreeSet ok', function() {
      var classDesc = {
        name: 'java.lang.Integer',
        serialVersionUID: '1360826667806852920',
        flags: 2,
        fields: [{ type: 'I', name: 'value' }],
        superClass: {
          name: 'java.lang.Number',
          serialVersionUID: '-8742448824652078965',
          flags: 2,
          fields: [],
          superClass: null,
        },
      };
      var ret = OutputStream.write({
        $: {},
        $class: {
          name: 'java.util.TreeSet',
          serialVersionUID: '-2479143000061671589',
          flags: 3,
          fields: [],
          superClass: null,
        },
        _$: [{
          $: { value: 123 },
          $class: classDesc,
        }, {
          $: { value: 321 },
          $class: classDesc,
        }],
      }).should.eql(new Buffer('aced0005737200116a6176612e7574696c2e54726565536574dd98509395ed875b030000787070770400000002737200116a6176612e6c616e672e496e746567657212e2a0a4f781873802000149000576616c7565787200106a6176612e6c616e672e4e756d62657286ac951d0b94e08b02000078700000007b7371007e00020000014178', 'hex'));
    });
  });
});
