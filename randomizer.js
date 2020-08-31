const characterHooks = [
	"",	// 00 DRMARIO
	"", // 01 MARIO
	"", // 02 LUIGI
	"", // 03 BOWSER
	"", // 04 PEACH
	"", // 05 YOSHI
	"", // 06 DK
	"", // 07 CFALCON
	"", // 08 GANONDORF
	"", // 09 FALCO
	"C2220BE4",	// 10 FOX
	"",	// 11 NESS
	"", // 12 ICECLIMBERS
	"", // 13 KIRBY
	"", // 14 SAMUS
	"", // 15 ZELDA
	"C2221988", // 16 LINK
	"", // 17 YLINK
	"", // 18 PICHU
	"", // 19 PIKACHU
	"", // 20 JIGGLYPUFF
	"", // 21 MEWTWO
	"", // 22 MRGAMEWATCH
	"", // 23 MARTH
	"", // 24 ROY
];

const codeStart = " 00000019\n3C00801C 60004210\n7C0803A6 4E800021\n48000058 4E800021";
const codeEnd = "\n4BFFFFAD 806DC18C\n7D0802A6 3908FFF8\n80A30024 80E5002C\n80070010 2C0000D1\n40820030 38000000\n80C50028 C4080008\nC0280004 9006007C\nD0060038 D026003C\n80C70DD4 9006007C\nD0060050 D0260060\n80A50008 2C050000\n4180FFBC 00000000";

const bounds = [
	{},	// 00 DRMARIO
	{}, // 01 MARIO
	{}, // 02 LUIGI
	{}, // 03 BOWSER
	{}, // 04 PEACH
	{}, // 05 YOSHI
	{}, // 06 DK
	{}, // 07 CFALCON
	{}, // 08 GANONDORF
	{}, // 09 FALCO
	{x1: -100, y1: -100, x2: 100, y2: 100}, // 10 FOX
	{},	// 11 NESS
	{}, // 12 ICECLIMBERS
	{}, // 13 KIRBY
	{}, // 14 SAMUS
	{}, // 15 ZELDA
	{x1: -100, y1: -100, x2: 100, y2: 100}, // 16 LINK
	{}, // 17 YLINK
	{}, // 18 PICHU
	{}, // 19 PIKACHU
	{}, // 20 JIGGLYPUFF
	{}, // 21 MEWTWO
	{}, // 22 MRGAMEWATCH
	{}, // 23 MARTH
	{}, // 24 ROY
];

var exclusions = [];
exclusions[10] = [ // 10 FOX
	{x1: -55, y1: 80, x2: -15, y2: 120},
	{x1: 115, y1: -30, x2: 145, y2: 20},
	{x1: -80, y1: -100, x2: -60, y2: 10},
];

function randomize() {
	var resultBox = document.querySelector('#result');

	var characterBox = document.querySelector('#character');
	var character = parseInt(characterBox.value);

	var result = characterHooks[character] + codeStart;
	for (let i = 0; i < 10; i++) {
		var invalid = true;
		while (invalid) {
			var x = getRndInteger(bounds[character].x1, bounds[character].x2);
			var y = getRndInteger(bounds[character].y1, bounds[character].y2);
			if (coordinatesValid(x, y, character)) {
				invalid = false;
			}
		}
		result += coordsToHex(x, y);
	}
	result += codeEnd;
	resultBox.value = result;
}

function coordinatesValid(x, y, character) {
	// exclusions
	if (exclusions[character] != null) {
		for (let i = 0; i < exclusions[character].length; i++) {
			var asdf = exclusions[character][i];
			if (withinBounds(x, y, exclusions[character][i])) {
				return false;
			}
		}
	}

	return true;
}

function withinBounds(x, y, bounds) {
	if (x >= bounds.x1 &&
		x <= bounds.x2 &&
		y >= bounds.y1 &&
		y <= bounds.y2) {
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