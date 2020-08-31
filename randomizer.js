/*
 * Randomizer developed by djwang88
 */

function randomize() {
	var resultBox = document.querySelector('#result');
	var stageBox = document.querySelector('#stage');

	if (stageBox.value == "all") {
		var result = "";
		for (let i = 0; i < 25; i++) {
			if (bounds[i].x1) {
				result += getCode(i) + "\n";
			}
		}
		resultBox.value = result;
	} else {
		resultBox.value = getCode(parseInt(stageBox.value));
	}
}

function getCode(stage) {
	var result = stageHooks[stage] + codeStart;
	var numTargets = 10;

	for (let i = 0; i < numTargets; i++) {
		var invalid = true;
		while (invalid) {
			var x = getRandomDecimal(bounds[stage].x1, bounds[stage].x2);
			var y = getRandomDecimal(bounds[stage].y1, bounds[stage].y2);
			if (coordinatesValid(x, y, stage)) {
				invalid = false;
			}
		}
		result += coordsToHex(x, y);
	}
	result += codeEnd;
	return result;
}

function coordinatesValid(x, y, stage) {
	// exclusions
	if (exclusions[stage] != null) {
		for (let i = 0; i < exclusions[stage].length; i++) {
			var stageExclusions = exclusions[stage][i];
			if (stageExclusions.length == 2) {
				// rectangle
				if (withinRectangle(x, y, exclusions[stage][i])) {
					return false;
				}
			} else {
				if (withinPolygon(x, y, exclusions[stage][i])) {
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
 * Stage hooks (mostly) found by djwang88
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

/*
 * Stage boundaries and exclusions by megaqwertification
 * https://docs.google.com/document/d/1Dke2FDt5gVqJZyGCLipJYVynHd7EIbuxknme12z_gf4/edit#
 */
const bounds = [
	{x1: -130, y1: -130, x2: 130, y2: 130}, // 00 DRMARIO
	{x1: -150, y1: -100, x2: 130, y2: 150}, // 01 MARIO
	{x1: -70, y1: -70, x2: 70, y2: 70}, // 02 LUIGI
	{x1: -110, y1: -150, x2: 250, y2: 100}, // 03 BOWSER
	{x1: -110, y1: -100, x2: 180, y2: 150}, // 04 PEACH
	{x1: -150, y1: -90, x2: 130, y2: 170}, // 05 YOSHI
	{}, // 06 DK
	{}, // 07 CFALCON
	{x1: -90, y1: -20, x2: 90, y2: 110}, // 08 GANONDORF
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
	{}, // 25 SHEIK
];

var exclusions = [];
exclusions[0] = [ // DRMARIO
	[ [-95, -25], [-80, 90] ], // Boundary 1
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
exclusions[2] = [ // LUIGI
	[ [-5, -5], [5, 5] ], // Boundary 1
];
exclusions[3] = [ // BOWSER
	[ [95, 55], [105, 85] ], // Boundary 1
	[ [30, 40], [80, 40], [80, 65], [70, 65], [70, 50], [30, 50] ], // Boundary 2
	[ [-50, -10], [-40, 35] ], // Boundary 3
	[ [-80, -45], [-70, 10] ], // Boundary 4
	[ [-105, -100], [-95, 45] ], // Boundary 5
	[ [-85, -100], [-25, -90] ], // Boundary 6
	[ [-5, -15], [80, -5] ], // Boundary 7
	[ [-5, -120], [30, -110] ], // Boundary 8
	[ [75, -150], [90, -140] ], // Boundary 9
	[ [35, -90], [130, -90], [130, 5], [120, 5], [120, -25], [100, -25], [100, -25], [100, -40], [80, -40],
		[70, -50], [70, -70], [50, -70], [50, -80], [35, -80] ], // Boundary 10
	[ [150, -120], [175, -110] ], // Boundary 11
	[ [200, -120], [210, -120], [210, -90], [235, -90], [235, -80], [200, -80] ], // Boundary 12
];
exclusions[4] = [ // PEACH
	[ [-55, 0], [-55, -10], [20, -10], [20, -100], [130, -100], [135, -90], [135, -75], [120, -75], [120, -90],
		[105, -90], [105, -75], [100, -75], [100, -90], [85, -90], [85, -75], [80, -75], [80, -90], [65, -90],
		[65, -75], [60, -75], [60, -90], [40, -90], [40, -80], [30, -80], [30, -25], [35, -15], [35, 0] ], // Boundary 1
	[ [45, 83], [45, 75], [40, 65], [40, 50], [55, 50], [55, -10], [50, -20], [50, -55], [110, -55], [110, -45],
		[60, -45], [60, 50], [55, 65], [55, 78] ], // Boundary 2
	[ [17, 20], [22, 20], [22, 65], [30, 80], [30, 120], [40, 120], [130, 86.24], [130, 65], [135, 65], [135, 84.38],
		[145, 80.62], [145, 65], [150, 65], [150, 85], [30, 130], [17, 130] ], // Boundary 3	
];
exclusions[5] = [ // YOSHI
	[ [-85, 150], [-85, 130], [-75, 120], [-40, 120], [-30, 130], [-30, 165], [-40, 165], [-40, 135], [-75, 135],
		[-75, 150], ], // Boundary 1
	[ [-155, -10], [-155, -20], [-130, -20], [-120, -10], [-120, 10], [-130, 20], [-145, 20], [-145, 10], [-130, 10],
		[-130, -10],], // Boundary 2
	[[-60, 0], [-40, 0], [-30, 10], [-30, 20], [-50, 20], [-50, 55], [-80, 55], [-80, 45], [-60, 45], ], // Boundary 3
	[ [-15, 40], [25, 40], [25, 50], [15, 55], [-5, 55], [-15, 50], ], // Boundary 4
	[ [45, 140], [55, 165] ], // Boundary 5
	[ [40, 10], [70, 20] ], // Boundary 6
	[ [-5, -40], [5, -50], [25, -50], [35, -40], [35, -30], [-5, -30], ], // Boundary 7
	[ [-95, -45], [-55, -45], [-55, -90], [130, -90], [130, -20], [100, -20], [66.63, -55.51], [31.63, -70],
		[-1.63, -70], [-36.63, -55.51], [-55, -40], [-105, -40], [-105, -80], [-80, -80], [-80, -70],
		[-95, -70], ], // Boundary 8
];

exclusions[8] = [ // GANONDORF
	[ [-95, 70], [-75, 70], [-35, 110], [-95, 110] ], // Boundary 1
	[ [95, 70], [95, 110], [35, 110], [75, 70] ], // Boundary 2
	[ [-70, -10], [-50, 0] ], // Boundary 3
	[ [-20, -10], [20, 0] ], // Boundary 4
	[ [50, -10], [70, 0] ], // Boundary 5
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