export interface Field {
  type: string;
  name: string;
  classname: string;
}
export interface Value { [key: string]: any }
interface ClassDescription {
  name: string,
  serialVersionUID: string,
  flags: number,
  fields: Array<Field>,
  superClass: ClassDescription|null;
}
export interface ValueObject {
  _$: any;
  $: Value;
  $class: ClassDescription;
}
export class InputObjectStream {
  constructor(buff: Buffer, withTYpe?: boolean);
  static readObject(buff: Buffer, withTYpe?: boolean): void;
  static read(buff: Buffer, withTYpe?: boolean): void;
}
export class OutputObjectStream {
  constructor();
  static normalize(obj: any, type?: any/* |string */): ValueObject;
  static writeObject(obj: any): Buffer;
  static write(obj: any): Buffer;
}
