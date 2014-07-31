# java.io

A node implement of "java.io.InputObjectStream.readObject()" and "java.io.OutputObjectStream.writeObject()".

[![Build Status](https://secure.travis-ci.org/node-modules/java.io.png)](http://travis-ci.org/node-modules/java.io)

[![NPM](https://nodei.co/npm/java.io.png?downloads=true&stars=true)](https://nodei.co/npm/java.io/)

## Protocol

- [Object Serialization Stream Protocol](http://docs.oracle.com/javase/6/docs/platform/serialization/spec/protocol.html) (A protocal is not all, still need to refer to the implementation.)
- [Object Serialization Stream Protocol Mind Node](https://www.dropbox.com/s/chqbm91wl5wx2oa/Object%20Serialization%20Stream%20Protocol.pdf)


## Install

```
$ npm install java.io
```

## Usage

### 1. readObject()

```
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

```
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

```
1024
```

if you only care about the first object from input stream, you could write the code briefly:

```
var buf3 = fs.readFileSync('./test/fixtures/out/map/boolean.bin');
var obj3 = InputObjectStream.readObject(buf);
```

then `obj3` should be:

```
{ 'true': true, 'false': false }
```

### 2. writeObject(obj)

```
var outputObjectStream = new OutputObjectStream();

// 1. Passed in argument must contains the whole info
// 2. Every time calling the writeObject function
//    will return the buf had written in
var buf = outputObjectStream.writeObject(obj);
```

A brief style is also OK:

```
OutputObjectStream.writeObject(obj);
```

### 3. OutputObjectStream.normalize(obj, type)

A convenient way to convert ordinary JavaScript object to object of standard format with whole info.

- params
  - obj: accept all primitive value or primitive array and map
  - type: string | boolean | int | short | long | char | byte | float | double | 
- return: normalized object

```
var outputObjectStream = new OutputObjectStream();
var normalizedObj = OutputObjectStream.normalize(true);
var buf = outputObjectStream.writeObject(normalizedObj);
```

```
normalize(null)

normalize('string)

normalize(true)

normalize(1) // quals to normalize(1, 'int')

normalize(-123456, long)
  
normalize([ true, false, false, false ], 'boolean')

normalize( {'true': true, 'false': false}, 'boolean')
```

## Data structure

```
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

[some more examples](test/fixtures/in/)

## License

(The MIT License)

Copyright (c) 2014 fengmk2 &lt;fengmk2@gmail.com&gt; and other contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
