/**!
 * object_output_stream - test/object_output_stream.test.js
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
var utils = require('./utils');

function NCommand(name, params) {
  this.id = null;
  this.name = name;
  this.params = params || [];
  this.isNewVersion = false;
  // [Z isNewVersion, Ljava/lang/String; id, Ljava/lang/String; name, [Ljava/lang/Object; params]
}

NCommand.$class = 'com.alipay.config.common.dataobject.NCommand';
NCommand.serialVersionUID = Long.fromString('274742954051697799');

NCommand.prototype.toString = function () {
  var s = '{ NCommand: name=' + this.name;
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

describe('object_output_stream.test.js', function () {
  describe('writeObject(object)', function () {
    it('should write a NCommand java object', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      var cmd = new NCommand('queryServerlist');
      console.log(cmd.toString())
      oos.writeObject(cmd);
      var bytes = byteStream.toByteArray();
      var expectBytes = utils.bytes('object_queryServerlist_cmd');
      bytes.should.length(expectBytes.length);
      bytes.should.eql(expectBytes);
    });
  });

  describe('writeObject(string)', function () {
    it('should write string match java', function () {
      var byteStream = new ByteArrayOutputStream();
      var oos = new ObjectOutputStream(byteStream);
      oos.writeObject('foo');
      var bytes = byteStream.toByteArray();
      var expectBytes = utils.bytes('string_foo');
      bytes.should.length(expectBytes.length);
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
