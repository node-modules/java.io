/**!
 * java.io - test/object_input_stream.test.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

var should = require('should');
var utils = require('./utils');
var ByteArrayInputStream = require('../').ByteArrayInputStream;
var ObjectInputStream = require('../').ObjectInputStream;

describe('object_input_stream.test.js', function () {
  describe('readObject()', function () {
    it('read object as ascii string', function () {
      var is = new ByteArrayInputStream(utils.bytes('string_foo'));
      var ois = new ObjectInputStream(is);
      var foo = ois.readObject();
      foo.should.equal('foo');
    });

    it('read object as utf8 string', function () {
      var is = new ByteArrayInputStream(utils.bytes('string_utf8'));
      var ois = new ObjectInputStream(is);
      var foo = ois.readObject();
      foo.should.equal('utf8有中文了啊水电费水电费');
    });

    it('read object as empty string', function () {
      var is = new ByteArrayInputStream(utils.bytes('string_empty'));
      var ois = new ObjectInputStream(is);
      var foo = ois.readObject();
      foo.should.equal('');
    });

    it('read object as null string', function () {
      var is = new ByteArrayInputStream(utils.bytes('string_null'));
      var ois = new ObjectInputStream(is);
      var foo = ois.readObject();
      should.ok(foo === null);
    });

    it('read object as ArrayList<String> length 2', function () {
      var is = new ByteArrayInputStream(utils.bytes('array_list_string_two'));
      var ois = new ObjectInputStream(is);
      var foo = ois.readObject();
      foo.should.eql([
        '1.java.io.alibaba.com',
        '2.java.io.alibaba.com',
      ]);
    });

    it('read object as ArrayList<String> length 1', function () {
      var bytes = utils.bytes('array_list_string_one');
      var is = new ByteArrayInputStream(bytes);
      var ois = new ObjectInputStream(is);
      var foo = ois.readObject();
      foo.should.eql([
        '1.java.io.alibaba.com',
      ]);
    });

    it('read object as ArrayList<String> length 0', function () {
      var bytes = utils.bytes('array_list_string_zero');
      var is = new ByteArrayInputStream(bytes);
      var ois = new ObjectInputStream(is);
      var foo = ois.readObject();
      foo.should.eql([]);
    });

    it('read TestSerial object', function () {
      // http://www.javaworld.com/article/2072752/the-java-serialization-algorithm-revealed.html
      var is = new ByteArrayInputStream(utils.bytes('TestSerial'));
      var ois = new ObjectInputStream(is);
      var foo = ois.readObject();
      foo.should.eql({
        version: 66,
        con: { containVersion: 11 }
      });
    });

    it.skip('read object as ArrayList<SimplePurePublisherInfo>', function () {
      var is = new ByteArrayInputStream(utils.bytes('array_simplefinfo'));
      var ois = new ObjectInputStream(is);
      var foo = ois.readObject();
      foo.should.eql([{
        clientId: 'clientIdvalue',
        hostId: '127.0.0.1:3333',
        isClusterPublisher: false,
        isPersistent: false,
      }]);
    });

    it.skip('read object as ArrayList<NPurePublisherInfo>', function () {
      var is = new ByteArrayInputStream(utils.bytes('array_list_object_multi'));
      var ois = new ObjectInputStream(is);
      var foo = ois.readObject();
      foo.should.eql([]);
    });
  });
});
