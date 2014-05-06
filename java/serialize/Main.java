package serialize;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.ArrayList;

class parent implements Serializable {
	int parentVersion = 10;
//	String nodeVersion = "0.11.12";
}

class parent2 extends parent implements Serializable {
	String nodeVersion = "0.11.12";
}

class contain implements Serializable{
	int containVersion = 11;
}

class SerialTest extends parent implements Serializable {
	int version = 66;
	contain con = new contain();
	private static final long serialVersionUID = -444444444555555555L;

	public int getVersion() {
		return version;
	}
}

class SerialTestRef implements Serializable {
	String a = "a";
	String c = "a";
}

class SerialTestValues implements Serializable {
	int version = 66;
	byte b = (byte) 0xff;
	char c = 0x1f;
	short s = 1024;
	boolean t = true;
	boolean f = false;
	long l = 18668079069l;
	double d = 1024.21;
	float fv = 0.12f;
}

class SerialTest2 extends parent2 implements Serializable {
	private static final long serialVersionUID = -4444444445555555552L;
	String hello1 = "world1";
	int version = 66;
	byte b = (byte) 0xff;
	char c = 0x1f;
	short s = 1024;
	contain con = new contain();
	boolean t = true;
	boolean f = false;
	long l = 18668079069l;
	double d = 1024.21;
	float fv = 0.1234f;
	String hello2 = "world2";
	String hello = "world1";
}

public class Main {

	static String fixtures = "/Users/mk2/git/java.io/test/fixtures";

	static void writeObject(Object obj, String filename) throws IOException {
		FileOutputStream fos = new FileOutputStream(fixtures + filename + ".bin");
		ObjectOutputStream oos = new ObjectOutputStream(fos);
		oos.writeObject(obj);
		oos.flush();
		oos.close();
	}

	static Object readObject(String filename) throws IOException, ClassNotFoundException {
		FileInputStream fis = new FileInputStream(fixtures + filename + ".bin");
		ObjectInputStream oin = new ObjectInputStream(fis);
		Object obj = oin.readObject();
		oin.close();
		return obj;
	}

	/**
	 * @param args
	 * @throws IOException
	 * @throws ClassNotFoundException
	 */
	public static void main(String[] args) throws IOException, ClassNotFoundException {
		SerialTest ts = new SerialTest();
		writeObject(ts, "/SerialTest");

		SerialTest2 ts2 = new SerialTest2();
		writeObject(ts2, "/SerialTest2");

		SerialTestRef ref = new SerialTestRef();
		writeObject(ref, "/SerialTestRef");

		SerialTestValues val = new SerialTestValues();
		writeObject(val, "/SerialTestValues");

		// byte
		writeObject((byte)0xff, "/byte/0xff");
		writeObject((byte)0x00, "/byte/0x00");
		writeObject((byte)0x01, "/byte/0x01");
		writeObject((byte)0x10, "/byte/0x10");
		writeObject((byte)-1, "/byte/-1");
		writeObject((byte)-128, "/byte/-128");
		writeObject((byte)127, "/byte/127");

		// char
		writeObject((char)0xff, "/char/0xff");
		writeObject((char)0x00, "/char/0x00");
		writeObject((char)0x01, "/char/0x01");
		writeObject((char)0x10, "/char/0x10");

		// double
		writeObject((double)0, "/double/0");
		writeObject((double)0.0, "/double/0.0");
		writeObject((double)0.0001, "/double/0.0001");
		writeObject((double)1024, "/double/1024");
		writeObject((double)1024.12345678, "/double/1024.12345678");
		writeObject((double)12345678.12345678, "/double/12345678.12345678");
		writeObject((double)-0.0001, "/double/-0.0001");
		writeObject((double)-1024, "/double/-1024");
		writeObject((double)-1024.12345678, "/double/-1024.12345678");
		writeObject((double)-12345678.12345678, "/double/-12345678.12345678");

		writeObject((float)0, "/float/0");
		writeObject((float)0.0, "/float/0.0");
		writeObject((float)0.0001, "/float/0.0001");
		writeObject((float)1024, "/float/1024");
		writeObject((float)1024.12345678, "/float/1024.12345678");
		writeObject((float)12345678.12345678, "/float/12345678.12345678");
		writeObject((float)-0.0001, "/float/-0.0001");
		writeObject((float)-1024, "/float/-1024");
		writeObject((float)-1024.12345678, "/float/-1024.12345678");
		writeObject((float)-12345678.12345678, "/float/-12345678.12345678");

		writeObject((int)0, "/int/0");
		writeObject((int)1, "/int/1");
		writeObject((int)2, "/int/2");
		writeObject((int)1024, "/int/1024");
		writeObject((int)12345678, "/int/12345678");
		writeObject((int)1234567899, "/int/1234567899");
		writeObject((int)2147483646, "/int/2147483646");
		writeObject((int)2147483647, "/int/2147483647");
		writeObject((int)-1, "/int/-1");
		writeObject((int)-2, "/int/-2");
		writeObject((int)-1024, "/int/-1024");
		writeObject((int)-12345678, "/int/-12345678");
		writeObject((int)-1234567899, "/int/-1234567899");
		writeObject((int)-2147483647, "/int/-2147483647");
		writeObject((int)-2147483648, "/int/-2147483648");

		writeObject((long)0, "/long/0");
		writeObject((long)1, "/long/1");
		writeObject((long)2, "/long/2");
		writeObject((long)1024, "/long/1024");
		writeObject((long)12345678, "/long/12345678");
		writeObject((long)1234567899, "/long/1234567899");
		writeObject((long)2147483646, "/long/2147483646");
		writeObject((long)2147483647, "/long/2147483647");
		writeObject(2147483648l, "/long/2147483648");
		writeObject(21474836489l, "/long/21474836489");

		writeObject(4503599627370496l, "/long/4503599627370496");
		writeObject(9007199254740990l, "/long/9007199254740990");
		writeObject(9007199254740991l, "/long/9007199254740991");
		writeObject(9007199254740992l, "/long/9007199254740992");
		writeObject(9007199254740993l, "/long/9007199254740993");
		writeObject(90071992547409931l, "/long/90071992547409931");
		writeObject(9223372036854774806l, "/long/9223372036854774806");
		writeObject(9223372036854774807l, "/long/9223372036854774807");

		writeObject((long)-1, "/long/-1");
		writeObject((long)-2, "/long/-2");
		writeObject((long)-1024, "/long/-1024");
		writeObject((long)-12345678, "/long/-12345678");
		writeObject((long)-1234567899, "/long/-1234567899");
		writeObject((long)-2147483647, "/long/-2147483647");
		writeObject((long)-2147483648, "/long/-2147483648");

		writeObject(-21474836489l, "/long/-21474836489");

		writeObject(-4503599627370496l, "/long/-4503599627370496");
		writeObject(-9007199254740990l, "/long/-9007199254740990");
		writeObject(-9007199254740991l, "/long/-9007199254740991");
		writeObject(-9007199254740992l, "/long/-9007199254740992");
		writeObject(-9007199254740993l, "/long/-9007199254740993");
		writeObject(-90071992547409931l, "/long/-90071992547409931");
		writeObject(-9223372036854774807l, "/long/-9223372036854774807");
		writeObject(-9223372036854774808l, "/long/-9223372036854774808");

		writeObject((short)0, "/short/0");
		writeObject((short)1, "/short/1");
		writeObject((short)2, "/short/2");
		writeObject((short)1024, "/short/1024");
		writeObject((short)32766, "/short/32766");
		writeObject((short)32767, "/short/32767");

		writeObject((short)-1, "/short/-1");
		writeObject((short)-2, "/short/-2");
		writeObject((short)-1024, "/short/-1024");
		writeObject((short)-32767, "/short/-32767");
		writeObject((short)-32768, "/short/-32768");

		writeObject(true, "/boolean/true");
		writeObject(false, "/boolean/false");

		writeObject(null, "/null");

		writeObject("", "/String/empty");
		writeObject("foo", "/String/foo");
		writeObject("foo 还有中文", "/String/nonascii");
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < 65535; i++) {
			sb.append("a");
		}
		writeObject(sb.toString(), "/String/65535");

		sb = new StringBuilder();
		for (int i = 0; i < 65536; i++) {
			sb.append("a");
		}
		writeObject(sb.toString(), "/String/65536");

		sb = new StringBuilder();
		for (int i = 0; i < 65535; i++) {
			sb.append("中");
		}
		writeObject(sb.toString(), "/String/65535_nonascii");

		writeObject(new int[] {0, 1, 2, 3}, "/array/[int");
		writeObject(new byte[] {0, 1, 2, 3}, "/array/[byte");
		writeObject(new char[] {'a', 'b', 'c', 'd'}, "/array/[char");
		writeObject(new double[] {0, 1.1, 2.2, 3.3333}, "/array/[double");
		writeObject(new float[] {0, 1.1f, 2.2f, 3.3333f}, "/array/[float");
		writeObject(new String[] {"a", "bbb", "cccc", "ddd中文"}, "/array/[String");

		ArrayList objs = new ArrayList();
		objs.add(1);
		objs.add(null);
		objs.add(1024.1);
		writeObject(objs, "/array/objs");

		ArrayList<String> strs = new ArrayList<String>();
		strs.add("a1");
		strs.add("a2");
		strs.add("a3");
		writeObject(strs, "/array/strs");

		ArrayList<SerialTest> list = new ArrayList<SerialTest>();
		list.add(new SerialTest());
		list.add(new SerialTest());
		list.add(new SerialTest());
		writeObject(list, "/array/SerialTest_list");

		writeObject(new SerialTest[]{
			new SerialTest(),
			new SerialTest(),
			new SerialTest()
		}, "/array/[SerialTest");
//		SerialTest ts2 = (SerialTest)readObject("/TestSerial.bin");
//		System.out.println(ts2.version);
	}

}
