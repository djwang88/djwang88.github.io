/*
 * Custom stage generator developed by djwang88
 */

const stageHooks = [
	"C2220568", // 00 DRMARIO
	"C221F89C", // 01 MARIO
	"C2221C6C", // 02 LUIGI
	"C22216A4", // 03 BOWSER
	"C2222910", // 04 PEACH
	"C2223BA4", // 05 YOSHI
	"C2220284", // 06 DK
	"C221FCBC", // 07 CFALCON
	"C222473C", // 08 GANONDORF
	"C2220854", // 09 FALCO
	"C2220BE4", // 10 FOX
	"C222262C", // 11 NESS
	"C2220F6C", // 12 ICECLIMBERS
	"C22213C0", // 13 KIRBY
	"C22235DC", // 14 SAMUS
	"C2223E88", // 15 ZELDA
	"C2221988", // 16 LINK
	"C221FFA0", // 17 YLINK
	"C2222BF4", // 18 PICHU
	"C2222ED8", // 19 PIKACHU
	"C22231C4", // 20 JIGGLYPUFF
	"C222223C", // 21 MEWTWO
	"C222416C", // 22 MRGAMEWATCH
	"C2221F50", // 23 MARTH
	"C2224450", // 24 ROY
	"C22238C0", // 25 SHEIK
];

/*
 * Gecko code template by Punkline
 */
const codeStart = " 00000019\n3C00801C 60004210\n7C0803A6 4E800021\n48000058 4E800021";
const codeEnd = "\n4BFFFFAD 806DC18C\n7D0802A6 3908FFF8\n80A30024 80E5002C\n80070010 2C0000D1\n40820030 38000000\n80C50028 C4080008\nC0280004 9006007C\nD0060038 D026003C\n80C70DD4 9006007C\nD0060050 D0260060\n80A50008 2C050000\n4180FFBC 00000000";

const codeStartSheik = " 00000012\n3C00801C 60004210\n7C0803A6 4E800021\n48000020 4E800021";
const codeEndSheik = "\n4BFFFFE5 806DC18C\n7D0802A6 3908FFF8\n80A30024 80E5002C\n80070010 2C0000D1\n40820030 38000000\n80C50028 C4080008\nC0280004 9006007C\nD0060038 D026003C\n80C70DD4 9006007C\nD0060050 D0260060\n80A50008 2C050000\n4180FFBC 00000000";

const codeStartSpawn = " 0000001D\n3C00801C 60004210\n7C0803A6 4E800021\n48000060 4E800021";
const codeEndSpawn = "\n4BFFFFA5 806DC18C\n7D0802A6 80A30024\n3C008049 6003E6C8\n80C30280 C0080000\nD0060038 C0080004\nD006003C 80E5002C\n80070010 2C0000D1\n40820030 38000000\n80C50028 C4080008\nC0280004 9006007C\nD0060038 D026003C\n80C70DD4 9006007C\nD0060050 D0260060\n80A50008 2C050000\n4180FFBC 00000000"

var customizeSpawn = false;

function onSelect() {
	var stage = parseInt(document.querySelector('#stage').value);
	if (stage == 25) {
		for (let i = 4; i <= 10; i++) {
			document.querySelector('#c' + i).style.display = "none";
		}
	} else {
		for (let i = 4; i <= 10; i++) {
			document.querySelector('#c' + i).style.display = "table-row";
		}
	}
}

function addSpawn() {
	document.querySelector('#include-spawn').style.display = "none";
	document.querySelector('#spawn-coordinates').style.display = "inline";
	customizeSpawn = true;
}

function cancelSpawn() {
	document.querySelector('#include-spawn').style.display = "inline";
	document.querySelector('#spawn-coordinates').style.display = "none";
	customizeSpawn = false;
}

function generate() {
	var resultBox = document.querySelector('#result');
	var stageBox = document.querySelector('#stage');
	resultBox.value = getCode(parseInt(stageBox.value));
}

function getCode(stage) {
	var start = codeStart;
	var end = codeEnd;
	var numTargets = 10;

	if (stage == 25) {
		// Sheik-specific code
		start = codeStartSheik;
		end = codeEndSheik;
		numTargets = 3;
	} else if (customizeSpawn) {
		start = codeStartSpawn;
		end = codeEndSpawn;
	}

	var result = stageHooks[stage] + start;

	if (customizeSpawn) {
		var x = parseInt(document.querySelector('#xs').value);
		var y = parseInt(document.querySelector('#ys').value);
		result += coordsToHex(x, y);
	}

	for (let i = 1; i <= numTargets; i++) {
		try {
			var asdf = document.querySelector('#x' + i);
			var x = parseInt(document.querySelector('#x' + i).value);
			var y = parseInt(document.querySelector('#y' + i).value);
		} catch (e) {
			return "Please fill in valid coordinates.";
		}
		result += coordsToHex(x, y);
	}
	result += end;
	return result;
}

function coordsToHex(x, y) {
	var hex = "\n" + toHex(x) + " " + toHex(y)
	return hex.toUpperCase();
}

/*
 * toHex() function by Nina Scholz
 * https://stackoverflow.com/questions/47164675/convert-float-to-32bit-hex-string-in-javascript
 */
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

function copy() {
	var text = document.querySelector('#result');
	text.select();
	document.execCommand('copy');
}