/**!
 * java.io - test/serialization/v2/input.test.js
 *
 * Copyright(c) Alibaba Group Holding Limited.
 * MIT Licensed
 *
 * Authors:
 *   fool2fish <fool2fish@gmail.com> (http://fool2fish.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var should = require('should');
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
      /*
      var wstream = fs.createWriteStream(path.join(__dirname, 'fout.bin'));
      wstream.write(OutputStream.write(utils.obj('object/PurePublisherInfo')));
      wstream.end();
      */
      OutputStream.write(utils.obj('object/PurePublisherInfo')).should.eql(utils.bytes('object/PurePublisherInfo'));
    });
  });
});
