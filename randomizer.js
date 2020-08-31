/*
 * Randomizer developed by djwang88
 */

function randomize() {
	var resultBox = document.querySelector('#result');
	var characterBox = document.querySelector('#character');

	if (characterBox.value == "all") {
		var result = "";
		for (let i = 0; i < 25; i++) {
			if (bounds[i].x1) {
				result += getCode(i) + "\n";
			}
		}
		resultBox.value = result;
	} else {
		resultBox.value = getCode(parseInt(characterBox.value));
	}
}

function getCode(character) {
	var result = characterHooks[character] + codeStart;
	for (let i = 0; i < 10; i++) {
		var invalid = true;
		while (invalid) {
			var x = getRandomDecimal(bounds[character].x1, bounds[character].x2);
			var y = getRandomDecimal(bounds[character].y1, bounds[character].y2);
			if (coordinatesValid(x, y, character)) {
				invalid = false;
			}
		}
		result += coordsToHex(x, y);
	}
	result += codeEnd;
	return result;
}

function coordinatesValid(x, y, character) {
	// exclusions
	if (exclusions[character] != null) {
		for (let i = 0; i < exclusions[character].length; i++) {
			var characterExclusions = exclusions[character][i];
			if (characterExclusions.length == 2) {
				// rectangle
				if (withinRectangle(x, y, exclusions[character][i])) {
					return false;
				}
			} else {
				if (withinPolygon(x, y, exclusions[character][i])) {
					return false;
				}
			}
		}
	}

	return true;
}

function withinRectangle(x, y, vs) {
	if (x >= vs[0][0] && // x1
		x <= vs[1][0] && // x2
		y >= vs[0][1] && // y1
		y <= vs[1][1]) { // y2
			return true;
	}
	return false;
}

/*
 * withinPolygon() function by James Halliday
 * https://github.com/substack/point-in-polygon
 */
function withinPolygon (x, y, vs) {
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

function getRandomDecimal(min, max) {
	// two decimal places
	min = min * 100;
	max = max * 100;
	return Math.floor((Math.floor(Math.random() * (max - min + 1)) + min)) / 100;
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

/*
 * Character hooks (mostly) found by djwang88
 */
const characterHooks = [
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
];

/*
 * Gecko code template by Punkline
 */
const codeStart = " 00000019\n3C00801C 60004210\n7C0803A6 4E800021\n48000058 4E800021";
const codeEnd = "\n4BFFFFAD 806DC18C\n7D0802A6 3908FFF8\n80A30024 80E5002C\n80070010 2C0000D1\n40820030 38000000\n80C50028 C4080008\nC0280004 9006007C\nD0060038 D026003C\n80C70DD4 9006007C\nD0060050 D0260060\n80A50008 2C050000\n4180FFBC 00000000";

/*
 * Stage boundaries and exclusions by megaqwertification
 * https://docs.google.com/document/d/1Dke2FDt5gVqJZyGCLipJYVynHd7EIbuxknme12z_gf4/edit#
 */
const bounds = [
	{x1: -130, y1: -130, x2: 130, y2: 130}, // 00 DRMARIO
	{x1: -150, y1: -100, x2: 130, y2: 150}, // 01 MARIO
	{}, // 02 LUIGI
	{}, // 03 BOWSER
	{}, // 04 PEACH
	{}, // 05 YOSHI
	{}, // 06 DK
	{}, // 07 CFALCON
	{}, // 08 GANONDORF
	{}, // 09 FALCO
	{x1: -150, y1: -150, x2: 150, y2: 150}, // 10 FOX
	{}, // 11 NESS
	{}, // 12 ICECLIMBERS
	{}, // 13 KIRBY
	{}, // 14 SAMUS
	{}, // 15 ZELDA
	{x1: -150, y1: -100, x2: 150, y2: 100}, // 16 LINK
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
exclusions[0] = [ // DRMARIO
	[ [-95, -25], [-80, 90]  ], // Boundary 1
	[ [30, 10], [70, -35], [80, -25], [40, 20] ], // Boundary 2
	[ [-50, -85], [-30, -50] ], // Boundary 3
	[ [-85, -130], [-45, -105] ], // Boundary 4
];
exclusions[1] = [ // MARIO
	[ [-100, 157.5], [-150, 157.5], [-150, 57.5], [-100, 57.5], [-100, 97.5], [-140, 97.5], [-140, 127.5], 
		[-100, 127.5] ], // Boundary 1
	[ [45, -100], [85, -57.5] ], // Boundary 2
	[ [-150, 37.5], [-135, 37.5], [-135, 50], [-100, 50], [-100, -22.5], [-140, -22.5], [-140, -62.5], [-120, -62.5], 
		[-120, -72.5], [-140, -72.5], [-140, -100], [-150, -100] ], // Boundary 3
];
exclusions[10] = [ // FOX
	[ [-120, -100], [-60, -100], [-60, -40], [-15, -40], [-15, -105], [-5, -105], [-5, 0], [15, 0], [15, 10], 
		[-15, 10], [-15, -30], [-60, -30], [-60, 10], [-80, 10], [-80, -90], [-120, -90] ], // Boundary 1
	[ [-55, 80], [-15, 120] ], // Boundary 2
	[ [35, 80], [45, 80], [45, 130], [75, 130], [75, 65], [85, 65], [85, 140], [35, 140] ], // Boundary 3
	[ [115, -30], [145, 20] ], // Boundary 4
	[ [40, -50], [75, -40] ], // Boundary 5
	[ [45, -90], [70, -70] ], // Boundary 6
	[ [80, -120], [105, -110] ], // Boundary 7
	[ [45, -150], [70, -130] ], // Boundary 8
	[ [5, -130], [35, -120] ], // Boundary 9
	[ [-20, -145], [-5, -130] ], // Boundary 10
	[ [-45, -130], [-30, -120] ], // Boundary 11
];
exclusions[16] = [ // LINK
	[ [100, -10], [110, 0] ], // Boundary 1
	[ [80, -55], [100, -45], [100, -35], [ 80,-45 ] ], // Boundary 2
	[ [30, -59], [50, -69], [50, -59], [ 30,-49 ] ], // Boundary 3
	[ [40, -20], [50, -20], [50, -10], [80, -10], [80, 0], [60, 0], [60, 30], [50, 30], [50, 70], [70, 80], 
		[80, 80], [80, 90], [70, 90], [50, 80], [40, 80], [40, 20], [50, 20], [50, 0], [40, 0] ], // Boundary 4
	[ [0, 10], [0, -80], [-40, -80], [-40, -100], [-30, -100], [-30, -90], [-20, -90], [-20, -100], [-10, -100], 
		[-10, -90], [0, -90], [0, -100], [10, -100], [10, -95], [20, -95], [20, -100], [30, -100], [30, -95], 
		[40, -95], [40, -100], [50, -100], [50, -95], [60, -95], [60, -100], [70, -100], [70, -95], [80, -95], 
		[80, -100], [90, -100], [90, -90], [10, -90], [10, 10], [15, 10], [15, 20], [-5, 20], [-5, 10] ], // Boundary 5
];

/**
 * TESTING NOTES
 * 00 DRMARIO: 
 * 01 MARIO: 
 * 10 FOX: good
 * 16 LINK: target occasionally hidden deep in starting pillar
 **/