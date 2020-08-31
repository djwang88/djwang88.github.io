const FOX = 0;
const LINK = 1;

var characterHooks = [
	"C2220BE4",	// FOX
	"C2221988", // LINK
];

var codeStart = " 00000019\n3C00801C 60004210\n7C0803A6 4E800021\n48000058 4E800021";
var codeEnd = "\n4BFFFFAD 806DC18C\n7D0802A6 3908FFF8\n80A30024 80E5002C\n80070010 2C0000D1\n40820030 38000000\n80C50028 C4080008\nC0280004 9006007C\nD0060038 D026003C\n80C70DD4 9006007C\nD0060050 D0260060\n80A50008 2C050000\n4180FFBC 00000000";

var inclusive = [
	{x1: -100, y1: -100, x2: 100, y2: 100},
	{x1: -100, y1: -100, x2: 100, y2: 100},
];

function randomize() {
	var resultBox = document.querySelector('#randomizer-result');

	var characterBox = document.querySelector('#randomizer-character');
	var character = parseInt(characterBox.value);

	var result = characterHooks[character] + codeStart;
	for (let i = 0; i < 10; i++) {
		var x = getRndInteger(inclusive[character].x1, inclusive[character].x2);
		var y = getRndInteger(inclusive[character].y1, inclusive[character].y2);
		result += coordsToHex(x, y);
	}
	result += codeEnd;
	resultBox.value = result;
}

function withinBounds(coords, bounds) {
	if (coords.x >= bounds.x1 &&
		coords.x <= bounds.x2 &&
		coords.y >= bounds.y1 &&
		coords.y <= bounds.y2) {
		return true;
	}
	return false;
}

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function coordsToHex(x, y) {
	return "\n" + toHex(x) + " " + toHex(y);
}

function toHex(floatNum) {
	const getHex = i => ('00' + i.toString(16)).slice(-2);
	var view = new DataView(new ArrayBuffer(4)), result;
	view.setFloat32(0, floatNum);
	result = Array
		.apply(null, { length: 4 })
		.map((_, i) => getHex(view.getUint8(i)))
		.join('');
	return(result);
}