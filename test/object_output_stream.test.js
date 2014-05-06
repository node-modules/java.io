/**!
 * java.io - test/object_output_stream.test.js
 *
 * Copyright(c) 2014 fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

var Long = require('long');
var should = require('should');
var ByteArrayOutputStream = require('../').ByteArrayOutputStream;
var ObjectOutputStream = require('../').ObjectOutputStream;
var ByteArrayInputStream = require('../').ByteArrayInputStream;
var ObjectInputStream = require('../').ObjectInputStream;
var utils = require('./utils');
var types = require('../').types;

function NTestCommand(name, params, id) {
  this.isNewVersion = false;
  this.id = new types.JavaString(id);
  this.name = name;
  // [Ljava.lang.Object;: static final long serialVersionUID = -8012369246846506644L;
  this.params = new types.JavaObjectArray(params);
  // [Z isNewVersion, Ljava/lang/String; id, Ljava/lang/String; name, [Ljava/lang/Object; params]
}

NTestCommand.$class = 'test.NTestCommand';
NTestCommand.serialVersionUID = Long.fromString('574742954051697799');

NTestCommand.prototype.toString = function () {
  var s = '{ NTestCommand: name=' + this.name;
  if (this.params && this.params.length > 0) {
    s += ', params=[';
    for (var i = 0; i < this.params.length; i++) {
      s += this.params[i] + ', ';
    }
    s += ']';
  }
  s += ' }';
  return s;
};

function OneBooleanCommand(isNewVersion) {
  this.isNewVersion = !!isNewVersion;
}
OneBooleanCommand.$class = 'test.OneBooleanCommand';
OneBooleanCommand.serialVersionUID = Long.fromString('2747429540516977992');

function OneStringCommand(id) {
  this.id = new types.JavaString(id);
}
OneStringCommand.$class = 'test.OneStringCommand';
OneStringCommand.serialVersionUID = Long.fromString('2747429540516977993');

function TwoStringCommand(name) {
  this.id = new types.JavaString();
  this.name = name;
}
TwoStringCommand.$class = 'test.TwoStringCommand';
TwoStringCommand.serialVersionUID = Long.fromString('2747429540516977994');

function ObjectArrayCommand(params) {
  this.params = new types.JavaObjectArray(params);
}
ObjectArrayCommand.$class = 'test.ObjectArrayCommand';
ObjectArrayCommand.serialVersionUID = Long.fromString('2747429540516977995');

describe.skip('object_output_stream.test.js', function () {
  describe('writeObject(object)', function () {
    it('should write new Object[] as java write', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      var cmd = new types.JavaObjectArray([]);
      oos.writeObject(cmd);
      var bytes = byteStream.toByteArray();
      var javaBytes = utils.bytes('object[]_empty');
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] !== javaBytes[i]) {
          console.log(i, bytes[i], javaBytes[i], bytes.length, javaBytes.length);
          console.log('js  :', bytes, '\njava:', javaBytes);
          console.log('js  :', bytes.toString(), '\njava:', javaBytes.toString());
          break;
        }
        // bytes[i].should.equal(javaBytes[i]);
      }
      bytes.should.length(javaBytes.length);
      bytes.should.eql(javaBytes);
    });

    it('should write new Object[foo, bar] as java write', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      var cmd = new types.JavaObjectArray(['foo', 'bar']);
      oos.writeObject(cmd);
      var bytes = byteStream.toByteArray();
      var javaBytes = utils.bytes('object[foo,bar]');
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] !== javaBytes[i]) {
          console.log(i, bytes[i], javaBytes[i], bytes.length, javaBytes.length);
          console.log('js  :', bytes, '\njava:', javaBytes);
          console.log('js  :', bytes.toString(), '\njava:', javaBytes.toString());
          break;
        }
        // bytes[i].should.equal(javaBytes[i]);
      }
      bytes.should.length(javaBytes.length);
      bytes.should.eql(javaBytes);
    });

    it('should write one false boolean simple java object', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      var cmd = new OneBooleanCommand();
      oos.writeObject(cmd);
      var bytes = byteStream.toByteArray();
      var javaBytes = utils.bytes('cmd_with_one_boolean_field');
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] !== javaBytes[i]) {
          console.log(i, bytes[i], javaBytes[i], bytes.length, javaBytes.length);
          console.log('js  :', bytes, '\njava:', javaBytes);
          console.log('js  :', bytes.toString(), '\njava:', javaBytes.toString());
          break;
        }
        // bytes[i].should.equal(javaBytes[i]);
      }
      bytes.should.length(javaBytes.length);
      bytes.should.eql(javaBytes);
    });

    it('should write one true boolean simple java object', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      var cmd = new OneBooleanCommand(true);
      oos.writeObject(cmd);
      var bytes = byteStream.toByteArray();
      var javaBytes = utils.bytes('cmd_with_one_boolean_field_true');
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] !== javaBytes[i]) {
          console.log(i, bytes[i], javaBytes[i], bytes.length, javaBytes.length);
          console.log('js  :', bytes, '\njava:', javaBytes);
          console.log('js  :', bytes.toString(), '\njava:', javaBytes.toString());
          break;
        }
        // bytes[i].should.equal(javaBytes[i]);
      }
      bytes.should.length(javaBytes.length);
      bytes.should.eql(javaBytes);
    });

    it('should write one null string simple java object', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      var cmd = new OneStringCommand();
      oos.writeObject(cmd);
      var bytes = byteStream.toByteArray();
      var javaBytes = utils.bytes('cmd_with_one_string_field');
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] !== javaBytes[i]) {
          console.log(i, bytes[i], javaBytes[i], bytes.length, javaBytes.length);
          console.log('js  :', bytes, '\njava:', javaBytes);
          console.log('js  :', bytes.toString(), '\njava:', javaBytes.toString());
          break;
        }
      }
      bytes.should.length(javaBytes.length);
      bytes.should.eql(javaBytes);
    });

    it('should write one foo string simple java object', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      var cmd = new OneStringCommand('foo');
      oos.writeObject(cmd);
      var bytes = byteStream.toByteArray();
      var javaBytes = utils.bytes('cmd_with_one_string_field_foo');
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] !== javaBytes[i]) {
          console.log(i, bytes[i], javaBytes[i], bytes.length, javaBytes.length);
          console.log('js  :', bytes, '\njava:', javaBytes);
          console.log('js  :', bytes.toString(), '\njava:', javaBytes.toString());
          break;
        }
        // bytes[i].should.equal(javaBytes[i]);
      }
      bytes.should.length(javaBytes.length);
      bytes.should.eql(javaBytes);
    });

    it('should write TwoStringCommand success', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      var cmd = new TwoStringCommand('queryServerlist');
      oos.writeObject(cmd);
      var bytes = byteStream.toByteArray();
      var javaBytes = utils.bytes('cmd_with_two_string_field_queryServerlist');
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] !== javaBytes[i]) {
          console.log(i, bytes[i], javaBytes[i], bytes.length, javaBytes.length);
          console.log('js  :', bytes, '\njava:', javaBytes);
          console.log('js  :', bytes.toString(), '\njava:', javaBytes.toString());
          break;
        }
        // bytes[i].should.equal(javaBytes[i]);
      }
      bytes.should.length(javaBytes.length);
      bytes.should.eql(javaBytes);
    });

    it('should write NTestCommand queryServerlist java object', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      var cmd = new NTestCommand('queryServerlist', []);
      oos.writeObject(cmd);
      var bytes = byteStream.toByteArray();
      var javaBytes = utils.bytes('object_queryServerlist_cmd');
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] !== javaBytes[i]) {
          console.log(i, bytes[i], javaBytes[i], bytes.length, javaBytes.length);
          console.log('js  :', bytes, '\njava:', javaBytes);
          console.log('js  :', bytes.toString(), '\njava:', javaBytes.toString());
          break;
        }
        // bytes[i].should.equal(javaBytes[i]);
      }
      bytes.should.length(javaBytes.length);
      bytes.should.eql(javaBytes);
    });

    it('should write ObjectArrayCommand java object', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      var cmd = new ObjectArrayCommand([
        'com.test.service:1.0@RPC',
        'CHAIR'
      ]);
      oos.writeObject(cmd);
      var bytes = byteStream.toByteArray();
      var javaBytes = utils.bytes('object_array_cmd');
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] !== javaBytes[i]) {
          console.log(i, bytes[i], javaBytes[i], bytes.length, javaBytes.length);
          console.log('js  :', bytes, '\njava:', javaBytes);
          console.log('js  :', bytes.toString(), '\njava:', javaBytes.toString());
          break;
        }
        // bytes[i].should.equal(javaBytes[i]);
      }
      bytes.should.length(javaBytes.length);
      bytes.should.eql(javaBytes);
    });

    it('should write NTestCommand queryPublisherInfos java object', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      var cmd = new NTestCommand('queryPublisherInfos', [
        'com.test.service:1.0@RPC',
        'CHAIR'
      ]);
      oos.writeObject(cmd);
      var bytes = byteStream.toByteArray();
      var javaBytes = utils.bytes('object_queryPublisherInfos_cmd');
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] !== javaBytes[i]) {
          console.log(i, bytes[i], javaBytes[i], bytes.length, javaBytes.length);
          console.log('js  :', bytes, '\njava:', javaBytes);
          console.log('js  :', bytes.toString(), '\njava:', javaBytes.toString());
          break;
        }
        // bytes[i].should.equal(javaBytes[i]);
      }
      bytes.should.length(javaBytes.length);
      bytes.should.eql(javaBytes);
    });

    it('should write NTestCommand queryPublisherInfos with id 1024 java object', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      var cmd = new NTestCommand('queryPublisherInfos', [
        'com.test.service:1.0@RPC',
        'CHAIR'
      ], "1024");
      oos.writeObject(cmd);
      var bytes = byteStream.toByteArray();
      var javaBytes = utils.bytes('object_queryPublisherInfos_with_id_cmd');
      for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] !== javaBytes[i]) {
          console.log(i, bytes[i], javaBytes[i], bytes.length, javaBytes.length);
          console.log('js  :', bytes, '\njava:', javaBytes);
          console.log('js  :', bytes.toString(), '\njava:', javaBytes.toString());
          break;
        }
        // bytes[i].should.equal(javaBytes[i]);
      }
      bytes.should.length(javaBytes.length);
      bytes.should.eql(javaBytes);

      // TODO: should read it
      // var is = new ByteArrayInputStream(bytes);
      // var ois = new ObjectInputStream(is);
      // var foo = ois.readObject();
    });
  });

  describe('writeObject(string)', function () {
    it('should write foo string match java', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      oos.writeObject('foo');
      var bytes = byteStream.toByteArray();
      var expectBytes = utils.bytes('string_foo');
      bytes.should.length(expectBytes.length);
      bytes.should.eql(expectBytes);
    });

    it('should write empty string match java', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      oos.writeObject('');
      var bytes = byteStream.toByteArray();
      var expectBytes = utils.bytes('string_empty');
      bytes.should.length(expectBytes.length);
      bytes.should.eql(expectBytes);
    });

    it('should write null string match java', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      oos.writeObject(null);
      var bytes = byteStream.toByteArray();
      var expectBytes = utils.bytes('string_null');
      // bytes.should.length(expectBytes.length);
      bytes.should.eql(expectBytes);
    });

    it('should write utf8 string match java', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      oos.writeObject('utf8有中文了啊水电费水电费');
      byteStream.toByteArray().should.eql(utils.bytes('string_utf8'));
    });

    it('should write long ascii string match java', function () {
      var s = 'outputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamououtputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamtputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstream';
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      oos.writeObject(s);
      var bytes = byteStream.toByteArray();
      var expectBytes = utils.bytes('string_long_ascii');
      bytes.should.length(expectBytes.length);
      bytes.should.eql(expectBytes);
    });

    it('should write long utf8 string match java', function () {
      var s = 'utf8有中文了啊水电费水电费outputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamououtputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamtputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstreamoutputstream';
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      oos.writeObject(s);

      var bytes = byteStream.toByteArray();
      var expectBytes = utils.bytes('string_long_utf8');
      bytes.should.length(expectBytes.length);
      bytes.should.eql(expectBytes);
    });

    it('should write big 65535 utf8 string match java', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      oos.writeObject(utils.string('big_utf8'));

      var bytes = byteStream.toByteArray();
      var expectBytes = utils.bytes('big_utf8');
      bytes.should.length(expectBytes.length);
      bytes.should.eql(expectBytes);
    });

    it('should write big 65535 ascii string match java', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      oos.writeObject(utils.string('big_ascii'));

      var bytes = byteStream.toByteArray();
      var expectBytes = utils.bytes('big_ascii');
      bytes.should.length(expectBytes.length);
      bytes.should.eql(expectBytes);
    });
  });
});
