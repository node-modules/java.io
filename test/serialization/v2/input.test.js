/**!
 * java.io - test/serialization/v2/input.test.js
 *
 * Copyright(c) Alibaba Group Holding Limited.
 * MIT Licensed
 *
 * Authors:
 *   苏千 <suqian.yf@alipay.com> (http://fengmk2.github.com)
 */

/*
console.log(require('util').inspect(
  ObjectInputStream.read(utils.bytes('boolean/true'), true),
  {depth: null}))
*/

'use strict';

/**
 * Module dependencies.
 */

var should = require('should');
var utils = require('../../utils');
var ObjectInputStream = require('../../../lib/serialization/v2/input');

describe('serialization/v2/input.test.js', function () {
  describe('read()', function () {
    it('should call read() twice work', function () {
      var ois = new ObjectInputStream(utils.bytes('array/[int'));
      ois.read(true).should.eql([0, 1, 2, 3]);
      should.ok(ois.read() === undefined);
    });
  });

  describe('Enum', function () {
    it('should read enum', function () {
      ObjectInputStream.read(utils.bytes('enum/WeekDayEnum')).should.eql({
        name: 'Mon'
      });
      ObjectInputStream.read(utils.bytes('enum/WeekDayEnum'), true).should.eql({
        '$class': {
          name: 'javaio.test.WeekDayEnum',
          serialVersionUID: '0',
          flags: 18,
          fields: [],
          superClass:
            { name: 'java.lang.Enum',
              serialVersionUID: '0',
              flags: 18,
              fields: [],
              superClass: null } },
        '$': { name: 'Mon' }
      });
      ObjectInputStream.read(utils.bytes('enum/WeekDayEnum_Thu')).should.eql({
        name: 'Thu'
      });
      ObjectInputStream.read(utils.bytes('enum/WeekDayEnum_Mon')).should.eql({
        name: 'Mon'
      });
      ObjectInputStream.read(utils.bytes('enum/WeekDayEnum_Sat')).should.eql({
        name: 'Sat'
      });
      ObjectInputStream.read(utils.bytes('enum/WeekDayEnum_Sun')).should.eql({
        name: 'Sun'
      });
    });
  });

  describe('Array', function () {
    it('should read Primitive value list', function () {
      ObjectInputStream.read(utils.bytes('array/[int')).should.eql([0, 1, 2, 3]);
      ObjectInputStream.read(utils.bytes('array/[byte')).should.eql([0, 1, 2, 3]);
      ObjectInputStream.read(utils.bytes('array/[char')).should.eql([97, 98, 99, 100]);
      ObjectInputStream.read(utils.bytes('array/[float'))
        .should.eql([0, 1.100000023841858, 2.200000047683716, 3.3333001136779785]);
      ObjectInputStream.read(utils.bytes('array/[double')).should.eql([0, 1.1, 2.2, 3.3333]);
      ObjectInputStream.read(utils.bytes('array/[String')).should.eql(["a", "bbb", "cccc", "ddd中文"]);
      ObjectInputStream.read(utils.bytes('array/[boolean')).should.eql([true, false, false, false]);
    });

    it('should read ArrayList', function () {
      // ArrayList objs
      ObjectInputStream.read(utils.bytes('array/objs')).should.eql([1, null, 1024.1]);
      // ArrayList<String>
      ObjectInputStream.read(utils.bytes('array/strs')).should.eql(['a1', 'a2', 'a3']);
    });

    it('should read Object list', function () {
      // new SerialTest[]
      ObjectInputStream.read(utils.bytes('array/[SerialTest')).should.eql([
        { parentVersion: 10, version: 66, con: { containVersion: 11 } },
        { parentVersion: 10, version: 66, con: { containVersion: 11 } },
        { parentVersion: 10, version: 66, con: { containVersion: 11 } },
      ]);


      // ArrayList<SerialTest>
      ObjectInputStream.read(utils.bytes('array/SerialTest_list')).should.eql([
        { parentVersion: 10, version: 66, con: { containVersion: 11 } },
        { parentVersion: 10, version: 66, con: { containVersion: 11 } },
        { parentVersion: 10, version: 66, con: { containVersion: 11 } },
      ]);


    });

    it('read object as ArrayList<SimplePurePublisherInfo>', function () {
      var obj = ObjectInputStream.read(utils.bytes('array_simplefinfo'));
      should.exist(obj);
      obj.should.eql([{
        clientId: 'clientIdvalue',
        hostId: '127.0.0.1:3333',
        isClusterPublisher: false,
        isPersistent: false,
      }]);
    });
  });

  describe('Map', function () {
    it.only('should read Primitive value map', function () {
      ObjectInputStream.read(utils.bytes('map/int'))
        .should.eql({ '0': 0, '1': 1, '2': 2 });
      ObjectInputStream.read(utils.bytes('map/int2'))
        .should.eql({ '0': { 'value': 0 }, '1': { 'value': 1 }, '2': { 'value': 2 } });
      ObjectInputStream.read(utils.bytes('map/byte'))
        .should.eql({ '0': 0, '1': 1, '2': 2 });
      ObjectInputStream.read(utils.bytes('map/char'))
        .should.eql({ '0': 0, '1': 1, '2': 2 });
      ObjectInputStream.read(utils.bytes('map/double'))
        .should.eql({ '0': 0, '1': 1.1, '2': 2.2222 });
      ObjectInputStream.read(utils.bytes('map/boolean'))
        .should.eql({ 'true': true, 'false': false });
      ObjectInputStream.read(utils.bytes('map/objs'))
        .should.eql({
          'int': 1,
          'double': 1.1,
          'float': 2.200000047683716,
          'String': 'int',
          'boolean': true,
          'booleanf': false,
          'byte': 1,
          'char': 22
        });
    });
  });

  describe('Primitive Value', function () {
    it('read byte', function () {
      ObjectInputStream.read(utils.bytes('byte/0xff')).should.equal(-1);
      ObjectInputStream.read(utils.bytes('byte/0x00')).should.equal(0x00);
      ObjectInputStream.read(utils.bytes('byte/0x01')).should.equal(0x01);
      ObjectInputStream.read(utils.bytes('byte/0x10')).should.equal(0x10);
      ObjectInputStream.read(utils.bytes('byte/-1')).should.equal(-1);
      ObjectInputStream.read(utils.bytes('byte/-128')).should.equal(-128);
      ObjectInputStream.read(utils.bytes('byte/127')).should.equal(127);
    });

    it('read char', function () {
      ObjectInputStream.read(utils.bytes('char/0xff')).should.equal(0xff);
      ObjectInputStream.read(utils.bytes('char/0x00')).should.equal(0x00);
      ObjectInputStream.read(utils.bytes('char/0x01')).should.equal(0x01);
      ObjectInputStream.read(utils.bytes('char/0x10')).should.equal(0x10);
    });

    it('read double', function () {
      ObjectInputStream.read(utils.bytes('double/0')).should.equal(0);
      ObjectInputStream.read(utils.bytes('double/0.0')).should.equal(0);
      ObjectInputStream.read(utils.bytes('double/0.0001')).should.equal(0.0001);
      ObjectInputStream.read(utils.bytes('double/1024')).should.equal(1024);
      ObjectInputStream.read(utils.bytes('double/1024.12345678')).should.equal(1024.12345678);
      ObjectInputStream.read(utils.bytes('double/12345678.12345678')).should.equal(12345678.12345678);

      ObjectInputStream.read(utils.bytes('double/-0.0001')).should.equal(-0.0001);
      ObjectInputStream.read(utils.bytes('double/-1024')).should.equal(-1024);
      ObjectInputStream.read(utils.bytes('double/-1024.12345678')).should.equal(-1024.12345678);
      ObjectInputStream.read(utils.bytes('double/-12345678.12345678')).should.equal(-12345678.12345678);
    });

    it('read float', function () {
      ObjectInputStream.read(utils.bytes('float/0')).should.equal(0);
      ObjectInputStream.read(utils.bytes('float/0.0')).should.equal(0);
      ObjectInputStream.read(utils.bytes('float/0.0001')).should.equal(0.00009999999747378752);
      ObjectInputStream.read(utils.bytes('float/1024')).should.equal(1024);
      ObjectInputStream.read(utils.bytes('float/1024.12345678')).should.equal(1024.1234130859375);
      ObjectInputStream.read(utils.bytes('float/12345678.12345678')).should.equal(12345678);

      ObjectInputStream.read(utils.bytes('float/-0.0001')).should.equal(-0.00009999999747378752);
      ObjectInputStream.read(utils.bytes('float/-1024')).should.equal(-1024);
      ObjectInputStream.read(utils.bytes('float/-1024.12345678')).should.equal(-1024.1234130859375);
      ObjectInputStream.read(utils.bytes('float/-12345678.12345678')).should.equal(-12345678);
    });

    it('read int', function () {
      ObjectInputStream.read(utils.bytes('int/Integer1')).should.equal(1);
      ObjectInputStream.read(utils.bytes('int/0')).should.equal(0);
      ObjectInputStream.read(utils.bytes('int/1')).should.equal(1);
      ObjectInputStream.read(utils.bytes('int/2')).should.equal(2);
      ObjectInputStream.read(utils.bytes('int/1024')).should.equal(1024);
      ObjectInputStream.read(utils.bytes('int/12345678')).should.equal(12345678);
      ObjectInputStream.read(utils.bytes('int/1234567899')).should.equal(1234567899);
      ObjectInputStream.read(utils.bytes('int/2147483646')).should.equal(2147483646);
      ObjectInputStream.read(utils.bytes('int/2147483647')).should.equal(2147483647);
      // ObjectInputStream.read(utils.bytes('int/2147483648')).should.equal(2147483648);

      ObjectInputStream.read(utils.bytes('int/-1')).should.equal(-1);
      ObjectInputStream.read(utils.bytes('int/-2')).should.equal(-2);
      ObjectInputStream.read(utils.bytes('int/-1024')).should.equal(-1024);
      ObjectInputStream.read(utils.bytes('int/-12345678')).should.equal(-12345678);
      ObjectInputStream.read(utils.bytes('int/-1234567899')).should.equal(-1234567899);
      ObjectInputStream.read(utils.bytes('int/-2147483647')).should.equal(-2147483647);
      ObjectInputStream.read(utils.bytes('int/-2147483648')).should.equal(-2147483648);
    });

    it('read long', function () {
      ObjectInputStream.read(utils.bytes('long/0')).should.equal(0);
      ObjectInputStream.read(utils.bytes('long/1')).should.equal(1);
      ObjectInputStream.read(utils.bytes('long/2')).should.equal(2);
      ObjectInputStream.read(utils.bytes('long/1024')).should.equal(1024);
      ObjectInputStream.read(utils.bytes('long/12345678')).should.equal(12345678);
      ObjectInputStream.read(utils.bytes('long/1234567899')).should.equal(1234567899);
      ObjectInputStream.read(utils.bytes('long/2147483646')).should.equal(2147483646);
      ObjectInputStream.read(utils.bytes('long/2147483647')).should.equal(2147483647);
      ObjectInputStream.read(utils.bytes('long/2147483648')).should.equal(2147483648);
      ObjectInputStream.read(utils.bytes('long/21474836489')).should.equal(21474836489);
      ObjectInputStream.read(utils.bytes('long/4503599627370496')).should.equal(4503599627370496);
      ObjectInputStream.read(utils.bytes('long/9007199254740990')).should.equal(9007199254740990);
      ObjectInputStream.read(utils.bytes('long/9007199254740991')).should.equal(9007199254740991);
      ObjectInputStream.read(utils.bytes('long/9007199254740992')).should.equal('9007199254740992');
      ObjectInputStream.read(utils.bytes('long/9007199254740993')).should.equal('9007199254740993');
      ObjectInputStream.read(utils.bytes('long/90071992547409931')).should.equal('90071992547409931');
      ObjectInputStream.read(utils.bytes('long/9223372036854774806')).should.equal('9223372036854774806');
      ObjectInputStream.read(utils.bytes('long/9223372036854774807')).should.equal('9223372036854774807');

      ObjectInputStream.read(utils.bytes('long/-1')).should.equal(-1);
      ObjectInputStream.read(utils.bytes('long/-2')).should.equal(-2);
      ObjectInputStream.read(utils.bytes('long/-1024')).should.equal(-1024);
      ObjectInputStream.read(utils.bytes('long/-12345678')).should.equal(-12345678);
      ObjectInputStream.read(utils.bytes('long/-1234567899')).should.equal(-1234567899);
      ObjectInputStream.read(utils.bytes('long/-2147483647')).should.equal(-2147483647);
      ObjectInputStream.read(utils.bytes('long/-2147483648')).should.equal(-2147483648);
      ObjectInputStream.read(utils.bytes('long/-21474836489')).should.equal(-21474836489);
      ObjectInputStream.read(utils.bytes('long/-4503599627370496')).should.equal(-4503599627370496);
      ObjectInputStream.read(utils.bytes('long/-9007199254740990')).should.equal(-9007199254740990);
      ObjectInputStream.read(utils.bytes('long/-9007199254740991')).should.equal(-9007199254740991);
      ObjectInputStream.read(utils.bytes('long/-9007199254740992')).should.equal('-9007199254740992');
      ObjectInputStream.read(utils.bytes('long/-9007199254740993')).should.equal('-9007199254740993');
      ObjectInputStream.read(utils.bytes('long/-90071992547409931')).should.equal('-90071992547409931');
      ObjectInputStream.read(utils.bytes('long/-9223372036854774807')).should.equal('-9223372036854774807');
      ObjectInputStream.read(utils.bytes('long/-9223372036854774808')).should.equal('-9223372036854774808');
    });

    it('read short', function () {
      ObjectInputStream.read(utils.bytes('short/0')).should.equal(0);
      ObjectInputStream.read(utils.bytes('short/1')).should.equal(1);
      ObjectInputStream.read(utils.bytes('short/2')).should.equal(2);
      ObjectInputStream.read(utils.bytes('short/1024')).should.equal(1024);
      ObjectInputStream.read(utils.bytes('short/32766')).should.equal(32766);
      ObjectInputStream.read(utils.bytes('short/32767')).should.equal(32767);

      ObjectInputStream.read(utils.bytes('short/-1')).should.equal(-1);
      ObjectInputStream.read(utils.bytes('short/-2')).should.equal(-2);
      ObjectInputStream.read(utils.bytes('short/-1024')).should.equal(-1024);
      ObjectInputStream.read(utils.bytes('short/-32767')).should.equal(-32767);
      ObjectInputStream.read(utils.bytes('short/-32768')).should.equal(-32768);
    });

    it('read boolean', function () {
      ObjectInputStream.read(utils.bytes('boolean/true')).should.equal(true);
      ObjectInputStream.read(utils.bytes('boolean/false')).should.equal(false);
    });

    it('read null', function () {
      should.ok(ObjectInputStream.read(utils.bytes('null')) === null);
    });

    it('read String', function () {
      ObjectInputStream.read(utils.bytes('String/empty')).should.equal('');
      ObjectInputStream.read(utils.bytes('String/foo')).should.equal('foo');
      ObjectInputStream.read(utils.bytes('String/nonascii')).should.equal('foo 还有中文');
      var large65535 = '';
      for (var i = 0; i < 65535; i++) {
        large65535 += 'a';
      }
      ObjectInputStream.read(utils.bytes('String/65535')).should.equal(large65535);
      var large65536 = '';
      for (var i = 0; i < 65536; i++) {
        large65536 += 'a';
      }
      ObjectInputStream.read(utils.bytes('String/65536')).should.equal(large65536);
      var large65535 = '';
      for (var i = 0; i < 65535; i++) {
        large65535 += '中';
      }
      ObjectInputStream.read(utils.bytes('String/65535_nonascii')).should.equal(large65535);
    });
  });

  describe('Simple Object', function () {
    it('read SerialTestRef object withType = false', function () {
      var ois = new ObjectInputStream(utils.bytes('SerialTestRef'));
      var foo = ois.read();
      foo.should.eql({
        a: 'a', c: 'a'
      });
    });

    it('read SerialTestValues object withType = false', function () {
      var ois = new ObjectInputStream(utils.bytes('SerialTestValues'));
      var foo = ois.read();
      foo.should.eql({
        version: 66,
        b: -1,
        c: 0x1f,
        s: 1024,
        t: true,
        f: false,
        l: 18668079069,
        d: 1024.21,
        fv: 0.11999999731779099
      });
    });

    it('read SerialTest2 object withType = false', function () {
      var ois = new ObjectInputStream(utils.bytes('SerialTest2'));
      var foo = ois.read();
      foo.should.eql({
        parentVersion: 10,
        nodeVersion: '0.11.12',
        b: -1,
        c: 31,
        d: 1024.21,
        f: false,
        fv: 0.1234000027179718,
        l: 18668079069,
        s: 1024,
        t: true,
        version: 66,
        con: { containVersion: 11 },
        hello: 'world1',
        hello1: 'world1',
        hello2: 'world2'
      });
    });

    it('read SerialTest object withType = false', function () {
      // http://www.javaworld.com/article/2072752/the-java-serialization-algorithm-revealed.html
      var ois = new ObjectInputStream(utils.bytes('SerialTest'));
      var foo = ois.read();
      foo.should.eql({
        parentVersion: 10,
        version: 66,
        con: { containVersion: 11 }
      });
    });

    it('read SerialTest object withType = true', function () {
      var ois = new ObjectInputStream(utils.bytes('SerialTest'), true);
      var foo = ois.read();
      foo.should.eql({
        '$class':
        { name: 'serialize.SerialTest',
          serialVersionUID: '-444444444555555555',
          flags: 2,
          fields:
          [ { type: 'I', name: 'version' },
            { type: 'L', name: 'con', classname: 'Lserialize/contain;' } ],
          superClass:
          { name: 'serialize.parent',
            serialVersionUID: '-8061904837446484456',
            flags: 2,
            fields: [ { type: 'I', name: 'parentVersion' } ],
            superClass: null } },
          '$fields':
          [ { type: 'I', name: 'parentVersion' },
            { type: 'I', name: 'version' },
            { type: 'L', name: 'con', classname: 'Lserialize/contain;' } ],
          '$serialVersionUID': '',
          '$':
          { parentVersion: 10,
            version: 66,
            con:
            { '$class':
             { name: 'serialize.contain',
               serialVersionUID: '5810625705047124443',
               flags: 2,
               fields: [ { type: 'I', name: 'containVersion' } ],
               superClass: null },
            '$fields': [ { type: 'I', name: 'containVersion' } ],
            '$serialVersionUID': '',
            '$': { containVersion: 11 } } }
      });
    });

    it('should read PureClientInfo', function () {
      var info = ObjectInputStream.read(utils.bytes('object/PureClientInfo'));
      info.should.eql({
        isValid: true,
        clientId: 'some-clientId',
        dataId: 'some-dataId',
        groups: [ 'SOFA-GROUP', 'HSF' ],
        hostId: '127.0.0.1',
        serverIP: '127.0.0.2'
      });
    });

    it('should read PurePublisherInfo', function () {
      var info = ObjectInputStream.read(utils.bytes('object/PurePublisherInfo'));
      info.should.eql({
        isValid: true,
        clientId: 'some-clientId',
        dataId: 'some-dataId',
        groups: [ 'SOFA-GROUP', 'HSF' ],
        hostId: '127.0.0.1',
        serverIP: '127.0.0.2',
        isClusterPublisher: true,
        isPersistent: true,
        data: [
          {
            isValid: true,
            clientId: 'some-clientId',
            dataId: 'some-dataId',
            groups: [ 'SOFA-GROUP', 'HSF' ],
            hostId: '127.0.0.1',
            serverIP: '127.0.0.2'
          }
        ],
        datumId: 'some-datumId'
      });
    });
  });
});
