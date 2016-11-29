# java.io

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![codecov](https://codecov.io/gh/node-modules/java.io/branch/master/graph/badge.svg)](https://codecov.io/gh/node-modules/java.io)
[![David][david-image]][david-url]

[npm-image]: https://img.shields.io/npm/v/java.io.svg?style=flat
[npm-url]: https://npmjs.org/package/java.io
[travis-image]: https://img.shields.io/travis/node-modules/java.io.svg?style=flat
[travis-url]: https://travis-ci.org/node-modules/java.io
[david-image]: https://img.shields.io/david/node-modules/java.io.svg?style=flat
[david-url]: https://david-dm.org/node-modules/java.io

A node implement of "java.io.InputObjectStream.readObject()" and "java.io.OutputObjectStream.writeObject()".

## Protocol

- [Object Serialization Stream Protocol](http://docs.oracle.com/javase/6/docs/platform/serialization/spec/protocol.html) (A protocal is not all, still need to refer to the implementation.)
- [Object Serialization Stream Protocol Mind Node](https://www.dropbox.com/s/vfom3gz5t13h3w6/Object%20Serialization%20Stream%20Protocol.pdf)


## Install

```bash
$ npm install java.io --save
```

## Usage

### 1. readObject()

```js
var fs = require('fs');
var io = require('java.io');
var InputObjectStream = io.InputObjectStream;
var OutputObjectStream = io.OutputObjectStream;

// Read object and return whole info
var buf = fs.readFileSync('./test/fixtures/out/int/1024.bin');
var in = new InputObjectStream(buf, true);
var obj = in.readObject();

// Read object but return value only
var buf2 = fs.readFileSync('./test/fixtures/out/int/1024.bin');
var in2 = new InputObjectStream(buf);
var obj2 = in.readObject();
```

`obj` should be:

```js
{
  '$' : {
    value : 1024
  },
  '$class' : {
    name : 'java.lang.Integer',
    serialVersionUID : '1360826667806852920',
    flags : 2,
    fields : [{
      type : 'I',
      name : 'value'
    }],
    superClass : {
      name : 'java.lang.Number',
      serialVersionUID : '-8742448824652078965',
      flags : 2,
      fields : [],
      superClass : null
    }
  }
}
```

`obj2` should be:

```js
1024
```

if you only care about the first object from input stream, you could write the code briefly:

```js
var buf3 = fs.readFileSync('./test/fixtures/out/map/boolean.bin');
var obj3 = InputObjectStream.readObject(buf);
```

then `obj3` should be:

```js
{ 'true': true, 'false': false }
```

### 2. writeObject(obj)

```js
var outputObjectStream = new OutputObjectStream();

// 1. Passed in argument must contains the whole info
// 2. Every time calling the writeObject function
//    will return the buf had written in
var buf = outputObjectStream.writeObject(obj);
```

A brief style is also OK:

```js
OutputObjectStream.writeObject(obj);
```

### 3. OutputObjectStream.normalize(obj, type)

A convenient way to convert ordinary JavaScript object to object of standard format with whole info.

- params
  - obj: accept all primitive value or primitive array and map
  - type: string | boolean | int | short | long | char | byte | float | double |
- return: normalized object

```js
var outputObjectStream = new OutputObjectStream();
var normalizedObj = OutputObjectStream.normalize(true);
var buf = outputObjectStream.writeObject(normalizedObj);
```

```js
normalize(null)

normalize('string')

normalize(true)

normalize(1) // quals to normalize(1, 'int')

normalize(-123456, long)

normalize([ true, false, false, false ], 'boolean')

normalize( {'true': true, 'false': false}, 'boolean')
```

### 4. addObject()

If a class has writeObject/readObject methods, you need to implement the corresponding methods, and add them via addObject() before read or write the object.

```js
var io = require('java.io');
io.addObject({{className}}, {{class}});

```

Builtin classes:

- [java.util.ArrayList](./lib/objects/array_list.js)
- [java.util.LinkedList](./lib/objects/linked_list.js)
- [java.util.HashMap](./lib/objects/hash_map.js)
- [java.util.HashSet](./lib/objects/hash_set.js)
- [java.util.TreeMap](./lib/objects/tree_map.js)
- [java.util.TreeSet](./lib/objects/tree_set.js)
- [java.util.Date](./lib/objects/date.js)

## Data structure

```js
{
  // if a object has it's own readObject/writeObject method
  // save it's special value here
  '_$': ...,

  // value of object
  '$': ...,

  // class description
  '$class': {
    name: 'className',
    serialVersionUID: 'SVUID',
    flags: flags,
    fields:
     [ { type: 'F', name: 'primitiveProperty' },
       { type: 'L', name: 'objProperty', classname: 'Ljava/lang/String;' }],
    superClass: parentClassDescriptionOrNull
  }
}
```

[Some more examples](test/fixtures/in/)

## Incompatible between 1.x and 2.x

- decode java `[B` to `new Buffer([1, 2, 3])` not `[1, 2, 3]` [#10](https://github.com/node-modules/java.io/pull/10)

## License

[MIT](LICENSE)
