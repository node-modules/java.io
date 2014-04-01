/**!
 * outputstream - lib/object_stream_field.js
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

var Long = require('long');
var is = require('is-type-of');

/**
 * Returns JVM type signature for given class.
 */
function getClassSignature(v) {
  var s = '';
  while (Array.isArray(v)) {
    s += '[';
    v = v[0];
    // emtpy [], make it to 'Ljava/lang/Object'
    // cl = cl.getComponentType();
  }

  if (v === null || v === undefined) {
  //   throw new Error('InternalError');
    return 'Ljava/lang/Object;';
  }

  var t = typeof v;
  if (t === 'string') {
    s = 'Ljava/lang/String;';
  } else if (t === 'number' || t.$class === 'int') {
    // number as Inter
    s += 'I';
  } else if (t.$class === 'byte') {
    s += 'B';
  // } else if (cl == Long.TYPE) {
  } else if (v instanceof Long) {
    s += 'J';
  // } else if (cl == Float.TYPE) {
  } else if (t.$class === 'float') {
    s += 'F';
  // } else if (cl == Double.TYPE) {
  } else if (v.$class === 'double' || is.double(v)) {
    s += 'D';
  // } else if (cl == Short.TYPE) {
  } else if (v.$class === 'short') {
    s += 'S';
  // } else if (cl == Character.TYPE) {
  } else if (v.$class === 'char') {
    s += 'C';
  // } else if (cl == Boolean.TYPE) {
  } else if (t === 'boolean') {
    s += 'Z';
  } else if (v.$class === 'void') {
    s += 'V';
  } else {
    var classname = v.$class;
    s += 'L' + classname.replace('.', '/') + ';';
  }
  return s;
}

function ObjectStreamField(name, value) {
  this.signature = getClassSignature(value);
  this.name = name;
}

var proto = ObjectStreamField.prototype;

/**
 * Returns character encoding of field type.  The encoding is as follows:
 * <blockquote><pre>
 * B            byte
 * C            char
 * D            double
 * F            float
 * I            int
 * J            long
 * L            class or interface
 * S            short
 * Z            boolean
 * [            array
 * </pre></blockquote>
 *
 * @return	the typecode of the serializable field
 */
// REMIND: deprecate?
proto.getTypeCode = function () {
  return this.signature.charAt(0);
};

/**
 * Return the JVM type signature.
 *
 * @return	null if this field has a primitive type.
 */
// REMIND: deprecate?
proto.getTypeString = function () {
  return this.isPrimitive() ? null : this.signature;
};

proto.getName = function () {
  return this.name;
};

/**
 * Return true if this field has a primitive type.
 *
 * @return	true if and only if this field corresponds to a primitive type
 */
// REMIND: deprecate?
proto.isPrimitive = function () {
  var tcode = this.signature.charAt(0);
  return (tcode !== 'L') && (tcode !== '[');
};

module.exports = ObjectStreamField;
