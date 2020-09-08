/*
 * Randomizer developed by djwang88
 * Current version: 0.2
 * ---------
 * CHANGELOG
 * ---------
 * [2020-09-01] First version (version 0.1)
 * [2020-09-01] Fixed Zelda bounds (decreased y2)
 * [2020-09-04] Fixed Pichu exclusions (Boundary 5)
 * [2020-09-06] Random stage feature
 * [2020-09-06] Fixed Link exclusion (Boundary 5) (discovered by chaos6)
 * [2020-09-06] Fixed Young Link exception (discovered by chaos6)
 * [2020-09-06] New randomizer template using halfwords (fixes Mewtwo) (version 0.2)
 * [2020-09-06] Arbitrary targets feature for individual stages & modular code builder
 * [2020-09-07] Adjusted Samus bounds (increased x2)
 * [2020-09-07] Arbitrary targets feature for all stages code (version 0.3)
 * [2020-09-07] Updated short codes to handle Mewtwo's targets
 * [2020-09-07] Added character randomizer feature (version 0.4)
 * [2020-09-07] Added spawn randomizer feature (version 0.5)
 */

var resultBox = document.querySelector('#result');
var stageBox = document.querySelector('#stage');
// var overflowBox = document.querySelector('#overflow');
// var overflowText = document.querySelector('#overflow-note');
// var overflowCopy = document.querySelector('#overflow-copy');
var spawnBox = document.querySelector('#spawn');
// var spawnDiv = document.querySelector('#spawn-div');
var numTargetsBox = document.querySelector('#num-targets');
var numTargetsDiv = document.querySelector('#num-targets-div');
var optionsButton = document.querySelector('#show-options');
var optionsDiv = document.querySelector('#options-div');
var characterRandomizerCheckboxDiv = document.querySelector('#character-randomizer-checkbox-div');
var characterRandomizerCheckbox = document.querySelector('#character-randomizer-checkbox');
var characterRandomizerDiv = document.querySelector('#character-randomizer-div');
var characterRandomizerBox = document.querySelector('#character-randomizer-result');
var characterRandomizerCopy = document.querySelector('#character-randomizer-copy');
var characterRandomizerNote = document.querySelector('#character-randomizer-note');

function randomize() {
	var spawn = false;
	if (optionsActive() && spawnBox.checked) {
		spawn = true;
	}

	if (stageBox.value == "all") {
		resultBox.value = getAllStagesCode(spawn);
		if (optionsActive() && characterRandomizerCheckbox.checked) {
			characterRandomizerBox.value = getCharacterRandomizerCode();
		} else {
			characterRandomizerBox.value = "";
		}
		// hideOverflow();
	} else if (stageBox.value == "random") {
		var stage = Math.floor(Math.random() * stageHooks.length);
		resultBox.value = getCode(stage, spawn);
		stageBox.value = stage.toString();
		// hideOverflow();
	} else {
		resultBox.value = getCode(parseInt(stageBox.value), spawn);
		// hideOverflow();
	}
}

// function showOverflow() {
// 	overflowBox.style.display = "inline";
// 	overflowText.style.display = "inline";
// 	overflowCopy.style.display = "inline";
// }

// function hideOverflow() {
// 	overflowBox.style.display = "none";
// 	overflowText.style.display = "none";
// 	overflowCopy.style.display = "none";
// }

function getCode(stage, spawn) {
	var numTargets = stage != SHEIK ? 10 : 3;
	if (optionsActive()) {
		numTargets = parseInt(numTargetsBox.value);
	}
	if ((stage != SHEIK && numTargets != 10) ||
		(stage == SHEIK && numTargets != 3)) {
		return getModularCode([stage], spawn, numTargets);
	} else {
		return getRegularCode(stage, spawn);
	}
}

function getRegularCode(stage, spawn) {
	var numTargets = 10;
	var start = codeStart;
	var end = codeEnd;

	if (stage == 25) {
		// Sheik-specific code
		start = codeStartSheik;
		end = codeEndSheik;
		numTargets = 3;
	}

	if (spawn) {
		start = codeStartSpawn;
		end = codeEndSpawn;
	}

	var result = stageHooks[stage] + start;

	if (spawn) {
		var index = Math.floor(Math.random() * spawns[stage].length);
		var x = spawns[stage][index][0];
		var y = spawns[stage][index][1];

		// handle the bizarre spawn differentials for the short code
		if (stage == MARIO) {
			y -= 28;
		} else if (stage == LUIGI) {
			y -= 20;
		} else if (stage == BOWSER) {
			x += 50;
			y -= 77;
		}
		result += coordsToHex(spawns[stage][index][0], spawns[stage][index][1]);
	}

	for (let i = 0; i < numTargets; i++) {
		var coords = getValidCoordinates(stage);
		result += coordsToHex(coords.x, coords.y);
	}
	result += end;
	return result;
}

function getModularCode(stages, spawn, numTargets) {
	if (isNaN(numTargets) || numTargets < 1 || numTargets > 255) {
		return "Number of targets must be a number between 1 and 255."
	}

	// build injection code
	var instructions = [];
	instructions = instructions.concat(modularInjectionStart);

	var stageData = [];
	for (let i = 0; i < stages.length; i++) {
		var stage = stages[i];
		stageData.push(getStageHeader(DEFAULT_SCALE, spawn, COMPRESSION_HWORD, numTargets, stage));
		if (spawn) {
			stageData.push(getSpawnHalfWords(stage));
		}
		for (let i = 0; i < numTargets; i++) {
			var coords = getValidCoordinates(stage);
			stageData.push(coordsToHalfWords(coords.x, coords.y));
		}
	}
	stageData.push(modularZero);
	instructions = instructions.concat(stageData);

	instructions = instructions.concat(modularInjectionEnd);
	if (isEven(instructions.length)) {
		instructions.push(modularNop);
	}
	instructions.push(modularZero);

	// build string
	var result = "";
	for (let i = 0; i < instructions.length; i++) {
		result += instructions[i];
		result += isEven(i) ? ' ' : '\n';
	}

	// calculate size (minus header) and offset
	var size = (instructions.length - 2) / 2;
	var offset = (stageData.length * 4) + 8;
	result = result.replace(modularSizePlaceholder, size.toString(16).padStart(4, '0').toUpperCase());
	result = result.replace(modularOffsetPlaceholder, offset.toString(16).padStart(6, '0').toUpperCase());
	result += modularEnd;

	return result;
}

function getAllStagesCode(spawn) {
	var numTargets = parseInt(numTargetsBox.value);
	// TODO: warning if more than 20 targets
	var stages = [];
	for (let i = 0; i < 26; i++) {
		stages.push(i);
	}
	return getModularCode(stages, spawn, numTargets);
}

function getCharacterRandomizerCode() {
	var result = characterRandomizerStart;
	var randomized = [];
	while (randomized.length < characterIds.length) {
		var index = Math.floor(Math.random() * characterIds.length);
		if (randomized.indexOf(characterIds[index]) == -1) {
			randomized.push(characterIds[index]);
		}
	}
	for (let i = 0; i < randomized.length; i++) {
		result += "2C0400" + randomized[i] + "\n418200CC ";
	}
	result += characterRandomizerEnd;
	return result;
}

/*
 * Original (split) code
 */
// function getOldAllStagesCode() {
// 	var result = "";
// 	for (let i = 0; i < 13; i++) {
// 		result += getCode(i) + "\n";
// 	}
// 	resultBox.value = result;

// 	var overflow = "";
// 	for (let i = 13; i < 26; i++) {
// 		overflow += getCode(i) + "\n";
// 	}
// 	overflowBox.value = overflow;
// 	showOverflow();
// }

/*
 * Old utility function for new all stages code
 */
// function getStageData(stage) {
// 	var result = getStageHeader(DEFAULT_SCALE, true, COMPRESSION_HWORD, 0, stage) + "\n";
// 	result += getSpawnHalfWords(stage) + " ";
// 	var numTargets = 10;
// 	for (let i = 0; i < numTargets; i++) {
// 		var coords = getValidCoordinates(stage);
// 		result += coordsToHalfWords(coords.x, coords.y);
// 		if (isEven(i)) {
// 			result += "\n";
// 		} else {
// 			result += " ";
// 		}
// 	}
// 	return result;
// }

/*
 * Header structure designed by Punkline
 * 0xFF000000 = scale (compression scale value) (signed)
 * 0x00100000 = spawn (custom spawn) (boolean)
 * 0x00070000 = compression (compression type) (unsigned)
 * 0x0000FF00 = numTargets (target count value) (unsigned)
 * 0x000000FF = stage (stage ID) (unsigned)
 */
function getStageHeader(scale, spawn, compression, numTargets, stage) {
	return scale.toString(16).padStart(2, '0') +
		(spawn ? '1' : '0') + 
		compression.toString(16) +
		numTargets.toString(16).padStart(2, '0') +
		stageIds[stage];
}

function getValidCoordinates(stage) {
	var invalid = true;
	while (invalid) {
		var x = getRandomDecimal(bounds[stage].x1, bounds[stage].x2);
		var y = getRandomDecimal(bounds[stage].y1, bounds[stage].y2);
		if (coordinatesValid(x, y, stage)) {
			invalid = false;
		}
	}
	return {x: x, y: y};
}

function coordinatesValid(x, y, stage) {
	if (exclusions[stage] != null) {
		for (let i = 0; i < exclusions[stage].length; i++) {
			var vs = exclusions[stage][i];
			if (withinBounds(x, y, vs)) {
				if (exceptions[stage] != null) {
					for (let j = 0; j < exceptions[stage].length; j++) {
						var ex = exceptions[stage][j];
						if (withinBounds(x, y, ex)) {
							return true;
						}
					}
				}
				return false;
			}
		}
	}
	return true;
}

function withinBounds(x, y, vs) {
	if (vs.length == 2) {
		return withinRectangle(x, y, vs);
	} else {
		return withinPolygon(x, y, vs);
	}
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
}

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

function coordsToHalfWords(x, y) {
	return toHalfWord(x) + toHalfWord(y);
}

/*
 * Signed halfword conversion formula by Punkline
 * Using scale of 6 (can handle coordinates <512)
 */
function toHalfWord(floatNum) {
	if (floatNum == 0) {
		return '0000';
	}

	var floatView = new Float32Array(1);
	var int32View = new Int32Array(floatView.buffer);

	floatView[0] = floatNum;
	var hex = int32View[0];

	var scale = 6;
	var mask = ((1 << 16) - 1);
	var exp = ((hex >> 23) & 0xFF) - 127;
	var frac = (hex & 0x7FFFFF) | 0x800000;
	var fixed = frac >> (23 - (exp + scale));
	var pad = '0';
	if (hex >> 31) {
		pad = 'F';
		fixed = -fixed & mask;
	}
	return fixed.toString(16).padStart(4, pad).toUpperCase();
}

function getSpawnHalfWords(stage) {
	var index = Math.floor(Math.random() * spawns[stage].length);
	return coordsToHalfWords(spawns[stage][index][0], spawns[stage][index][1]);
}

function isEven(num) {
	return (num % 2 == 0);
}

function copy() {
	resultBox.select();
	document.execCommand('copy');
}

function copyCharacterRandomizer() {
	characterRandomizerBox.select();
	document.execCommand('copy');
}

// function copyOverflow() {
// 	overflowBox.select();
// 	document.execCommand('copy');
// }

function onChangeStage() {
	if (stageBox.value == "all") {
		characterRandomizerCheckboxDiv.style.display = "block";
	} else {
		characterRandomizerCheckboxDiv.style.display = "none";
		characterRandomizerCheckbox.checked = false;
		showHideCharacterRandomizer();
	}
	// if (stageBox.value == "all") {
	// 	numTargetsDiv.style.display = "none";
	// } else {
	// 	numTargetsDiv.style.display = "block";
	// }

	// spawnDiv.style.display = "none";
	// spawnBox.checked = false;

	// if (stageBox.value != "all") {
	// 	var stage = parseInt(stageBox.value);
	// 	if (stage == LINK) {
	// 		spawnDiv.style.display = "block";
	// 	}
	// }
}

function showOptions() {
	optionsDiv.style.display = "block";
	optionsButton.style.display = "none";
}

function hideOptions() {
	optionsDiv.style.display = "none";
	optionsButton.style.display = "block";
}

function optionsActive() {
	return optionsDiv.style.display != "none";
}

function showHideCharacterRandomizer() {
	if (characterRandomizerCheckbox.checked) {
		characterRandomizerDiv.style.display = "block";
		characterRandomizerNote.style.display = "inline";
	} else {
		characterRandomizerDiv.style.display = "none";
		characterRandomizerNote.style.display = "none";
	}
}

function convertToHex() {
	var xcoord = document.querySelector('#xcoord').value;
	var ycoord = document.querySelector('#ycoord').value;
	var hexresult = document.querySelector('#hexresult');
	if (xcoord && ycoord) {
		xcoord = parseFloat(xcoord);
		ycoord = parseFloat(ycoord);
		hexresult.value = toHalfWord(xcoord) + " " + toHalfWord(ycoord);
	}
}

/*
 * Constants
 */
const DRMARIO = 0;
const MARIO = 1;
const LUIGI = 2;
const BOWSER = 3;
const PEACH = 4;
const YOSHI = 5;
const DK = 6;
const CFALCON = 7;
const GANONDORF = 8;
const FALCO = 9;
const FOX = 10;
const NESS = 11;
const ICECLIMBERS = 12;
const KIRBY = 13;
const SAMUS = 14;
const ZELDA = 15;
const LINK = 16;
const YLINK = 17;
const PICHU = 18;
const PIKACHU = 19;
const JIGGLYPUFF = 20;
const MEWTWO = 21;
const MRGAMEWATCH = 22;
const MARTH = 23;
const ROY = 24;
const SHEIK = 25;

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

const DEFAULT_SCALE = 6;
const COMPRESSION_WORD = 0;
const COMPRESSION_BYTE = 6;
const COMPRESSION_HWORD = 7;

const stageIds = [
	"25", // 00 DRMARIO
	"21", // 01 MARIO
	"2C", // 02 LUIGI
	"2A", // 03 BOWSER
	"30", // 04 PEACH
	"36", // 05 YOSHI
	"24", // 06 DK
	"22", // 07 CFALCON
	"3A", // 08 GANONDORF
	"26", // 09 FALCO
	"27", // 10 FOX
	"2F", // 11 NESS
	"28", // 12 ICECLIMBERS
	"29", // 13 KIRBY
	"34", // 14 SAMUS
	"37", // 15 ZELDA
	"2B", // 16 LINK
	"23", // 17 YLINK
	"31", // 18 PICHU
	"32", // 19 PIKACHU
	"33", // 20 JIGGLYPUFF
	"2E", // 21 MEWTWO
	"38", // 22 MRGAMEWATCH
	"2D", // 23 MARTH
	"39", // 24 ROY
	"35", // 25 SHEIK
];

const characterIds = [
	"00", // CFALCON
	"01", // DK
	"02", // FOX
	"03", // MRGAMEWATCH
	"04", // KIRBY
	"05", // BOWSER
	"06", // LINK
	"07", // LUIGI
	"08", // MARIO
	"09", // MARTH
	"0A", // MEWTWO
	"0B", // NESS
	"0C", // PEACH
	"0D", // PIKACHU
	"0F", // JIGGLYPUFF
	"10", // SAMUS
	"11", // YOSHI
	"12", // ZELDA/SHEIK
	"14", // FALCO
	"15", // YLINK
	"16", // DRMARIO
	"17", // ROY
	"18", // PICHU
	"19", // GANONDORF
	"20", // POPO
]

/*
 * Assembly code by Punkline
 * Gecko code templates by djwang88
 */
// const codeStart = " 00000019\n3C00801C 60004210\n7C0803A6 4E800021\n48000058 4E800021";
// const codeEnd = "\n4BFFFFAD 806DC18C\n7D0802A6 3908FFF8\n80A30024 80E5002C\n80070010 2C0000D1\n40820030 38000000\n80C50028 C4080008\nC0280004 9006007C\nD0060038 D026003C\n80C70DD4 9006007C\nD0060050 D0260060\n80A50008 2C050000\n4180FFBC 00000000";

const codeStart = " 00000019\n3C00801C 60004210\n7C0803A6 4E800021\n48000058 4E800021";
const codeEnd = "\n4BFFFFAD 806DC18C\n7D0802A6 3908FFF8\n80A30024 80E5002C\n80070010 2C0000D1\n40820030 80C50028\nC4080008 C0280004\nD0060038 D026003C\n80C70DD4 D0060050\nD0260060 80060014\n64000080 90060014\n80A50008 2C050000\n4180FFBC 00000000";

const codeStartSheik = " 00000012\n3C00801C 60004210\n7C0803A6 4E800021\n48000020 4E800021";
const codeEndSheik = "\n4BFFFFE5 806DC18C\n7D0802A6 3908FFF8\n80A30024 80E5002C\n80070010 2C0000D1\n40820030 38000000\n80C50028 C4080008\nC0280004 9006007C\nD0060038 D026003C\n80C70DD4 9006007C\nD0060050 D0260060\n80A50008 2C050000\n4180FFBC 00000000";

// const codeStartSpawn = " 0000001D\n3C00801C 60004210\n7C0803A6 4E800021\n48000060 4E800021";
// const codeEndSpawn = "\n4BFFFFA5 806DC18C\n7D0802A6 80A30024\n3C008049 6003E6C8\n80C30280 C0080000\nD0060038 C0080004\nD006003C 80E5002C\n80070010 2C0000D1\n40820030 38000000\n80C50028 C4080008\nC0280004 9006007C\nD0060038 D026003C\n80C70DD4 9006007C\nD0060050 D0260060\n80A50008 2C050000\n4180FFBC 00000000"

const codeStartSpawn = " 0000001D\n3C00801C 60004210\n7C0803A6 4E800021\n48000060 4E800021";
const codeEndSpawn = "\n4BFFFFA5 806DC18C\n7D0802A6 80A30024\n3C008049 6003E6C8\n80C30280 C0080000\nD0060038 C0080004\nD006003C 80E5002C\n80070010 2C0000D1\n40820030 80C50028\nC4080008 C0280004\nD0060038 D026003C\n80C70DD4 D0060050\nD0260060 80060014\n64000080 90060014\n80A50008 2C050000\n4180FFBC 00000000";

// const codeStartAllStages = "C21C4228 000000AF\n93C10018 480004EC\n4E800021 ";
// const codeEndAllStages = "00000000\n4BFFFB19 7FC802A6\n39400000 808D9348\n7D3E506E 712800FF\n41820058 38C00008\n5520877F 2C800006\n41820010 38C00002\n41860008 38C00004\n50C9063E 7C882000\n5527C63F 40A20008\n38E0000A 50E9442E\n41860020 75200010\n41A20008 38E70001\n7D4639D6 394A0007\n554A003A 4BFFFFA4\n38BE0004 7CA62850\n91210008 90A1000C\n60000000 00000000\nC21C4244 00000018\n80C10008 70C000FF\n418200AC 54C9C63E\n7C9D4800 4184000C\n38A00000 48000098\n80E1000C 7CAA2B79\n811F0280 2C1D0000\n40A20010 74C00010\n41A20008 7D054378\n2C050000 41A00028\n41A5006C 3B9CFFFF\n3BDEFFFC 80680084\n3C008037 60000E44\n7C0803A6 4E800021\n7C651B78 80C10008\n80E1000C 54C4063E\n74C03F07 7C17E3A6\n100723CC F0050038\n102004A0 D0050050\nD0250060 80050014\n64000080 90050014\n90E1000C 7C082800\n40A2000C 7D455378\n4BFFFF90 2C050000\n60000000 00000000";

const modularSizePlaceholder = "XXXX";
const modularOffsetPlaceholder = "YYYYYY";
const modularInjectionStart = [
	"C21C4228",
	"0000" + modularSizePlaceholder,
	"93C10018",
	"48000009",
	"48" + modularOffsetPlaceholder,
	"4E800021",
];
const modularInjectionEnd = [
	"7FC802A6",
	"39400000",
	"808D9348",
	"7D3E506E",
	"712800FF",
	"41820058",
	"38C00008",
	"5520877F",
	"2C800006",
	"41820010",
	"38C00002",
	"41860008",
	"38C00004",
	"50C9063E",
	"7C882000",
	"5527C63F",
	"40A20008",
	"38E0000A",
	"50E9442E",
	"41860020",
	"75200010",
	"41A20008",
	"38E70001",
	"7D4639D6",
	"394A0007",
	"554A003A",
	"4BFFFFA4",
	"38BE0004",
	"7CA62850",
	"91210008",
	"90A1000C",
]
const modularNop = "60000000";
const modularZero = "00000000";
const modularEnd = "C21C4244 00000018\n80C10008 70C000FF\n418200AC 54C9C63E\n7C9D4800 4184000C\n38A00000 48000098\n80E1000C 7CAA2B79\n811F0280 2C1D0000\n40A20010 74C00010\n41A20008 7D054378\n2C050000 41A00028\n41A5006C 3B9CFFFF\n3BDEFFFC 80680084\n3C008037 60000E44\n7C0803A6 4E800021\n7C651B78 80C10008\n80E1000C 54C4063E\n74C03F07 7C17E3A6\n100723CC F0050038\n102004A0 D0050050\nD0250060 80050014\n64000080 90050014\n90E1000C 7C082800\n40A2000C 7D455378\n4BFFFF90 2C050000\n60000000 00000000";

/*
 * Assembly code by djwang88
 */
const characterRandomizerStart = "C216E7F4 00000034\n889F0060 "
const characterRandomizerEnd = "A07F000E\n480000CC 38600021\n480000C4 38600022\n480000BC 38600023\n480000B4 38600024\n480000AC 38600025\n480000A4 38600026\n4800009C 38600027\n48000094 38600028\n4800008C 38600029\n48000084 3860002A\n4800007C 3860002B\n48000074 3860002C\n4800006C 3860002D\n48000064 3860002E\n4800005C 3860002F\n48000054 38600030\n4800004C 38600031\n48000044 38600032\n4800003C 38600033\n48000034 38600034\n4800002C 38600036\n48000024 38600037\n4800001C 38600038\n48000014 38600039\n4800000C 3860003A\n60000000 00000000";

/*
 * Stage boundaries and exclusions by megaqwertification
 * https://docs.google.com/document/d/1Dke2FDt5gVqJZyGCLipJYVynHd7EIbuxknme12z_gf4/edit#
 */
const bounds = [
	{x1: -130, y1: -130,  x2: 130, y2: 130  }, // 00 DRMARIO
	{x1: -150, y1: -100,  x2: 130, y2: 150  }, // 01 MARIO
	{x1: -70,  y1: -70,   x2: 70,  y2: 70   }, // 02 LUIGI
	{x1: -110, y1: -150,  x2: 250, y2: 100  }, // 03 BOWSER
	{x1: -110, y1: -100,  x2: 180, y2: 150  }, // 04 PEACH
	{x1: -150, y1: -90,   x2: 130, y2: 170  }, // 05 YOSHI
	{x1: -190, y1: 0,     x2: 130, y2: 200  }, // 06 DK
	{x1: -160, y1: -130,  x2: 170, y2: 110  }, // 07 CFALCON
	{x1: -90,  y1: -20,   x2: 90,  y2: 110  }, // 08 GANONDORF
	{x1: -140, y1: -70,   x2: 110, y2: 100  }, // 09 FALCO
	{x1: -150, y1: -150,  x2: 150, y2: 150  }, // 10 FOX
	{x1: -150, y1: -140,  x2: 150, y2: 120  }, // 11 NESS
	{x1: -120, y1: 0,     x2: 120, y2: 500  }, // 12 ICECLIMBERS
	{x1: -150, y1: -70,   x2: 130, y2: 180  }, // 13 KIRBY
	{x1: -130, y1: -110,  x2: 130, y2: 130  }, // 14 SAMUS
	{x1: -130, y1: -100,  x2: 115, y2: 115  }, // 15 ZELDA
	{x1: -150, y1: -100,  x2: 150, y2: 100  }, // 16 LINK
	{x1: -190, y1: -40,   x2: 120, y2: 210  }, // 17 YLINK
	{x1: -160, y1: -80,   x2: 145, y2: 110  }, // 18 PICHU
	{x1: -130, y1: -90,   x2: 175, y2: 115  }, // 19 PIKACHU
	{x1: -150, y1: -75,   x2: 130, y2: 90   }, // 20 JIGGLYPUFF
	{x1: -120, y1: -120,  x2: 130, y2: 100  }, // 21 MEWTWO
	{x1: -79,  y1: -29.5, x2: 76,  y2: 57.44}, // 22 MRGAMEWATCH
	{x1: -150, y1: -80,   x2: 120, y2: 140  }, // 23 MARTH
	{x1: -155, y1: -30,   x2: 110, y2: 140  }, // 24 ROY
	{x1: -100, y1: 0,     x2: 100, y2: 80   }, // 25 SHEIK
];

/*
 * Two-coordinate pairs are assumed to be bottom-left and top-right corners of a rectangle
 */
var exclusions = [];
exclusions[DRMARIO] = [
	[ [-95, -25], [-80, 90] ], // Boundary 1
	[ [30, 10], [70, -35], [80, -25], [40, 20] ], // Boundary 2
	[ [-50, -85], [-30, -50] ], // Boundary 3
	[ [-85, -130], [-45, -105] ], // Boundary 4
];
exclusions[MARIO] = [
	[ [-100, 157.5], [-150, 157.5], [-150, 57.5], [-100, 57.5], [-100, 97.5], [-140, 97.5], [-140, 127.5], 
		[-100, 127.5] ], // Boundary 1
	[ [45, -100], [85, -57.5] ], // Boundary 2
	[ [-150, 37.5], [-135, 37.5], [-135, 50], [-100, 50], [-100, -22.5], [-140, -22.5], [-140, -62.5], [-120, -62.5], 
		[-120, -72.5], [-140, -72.5], [-140, -100], [-150, -100] ], // Boundary 3
];
exclusions[LUIGI] = [
	[ [-5, -5], [5, 5] ], // Boundary 1
];
exclusions[BOWSER] = [
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
exclusions[PEACH] = [
	[ [-55, 0], [-55, -10], [20, -10], [20, -100], [130, -100], [135, -90], [135, -75], [120, -75], [120, -90],
		[105, -90], [105, -75], [100, -75], [100, -90], [85, -90], [85, -75], [80, -75], [80, -90], [65, -90],
		[65, -75], [60, -75], [60, -90], [40, -90], [40, -80], [30, -80], [30, -25], [35, -15], [35, 0] ], // Boundary 1
	[ [45, 83], [45, 75], [40, 65], [40, 50], [55, 50], [55, -10], [50, -20], [50, -55], [110, -55], [110, -45],
		[60, -45], [60, 50], [55, 65], [55, 78] ], // Boundary 2
	[ [17, 20], [22, 20], [22, 65], [30, 80], [30, 120], [40, 120], [130, 86.24], [130, 65], [135, 65], [135, 84.38],
		[145, 80.62], [145, 65], [150, 65], [150, 85], [30, 130], [17, 130] ], // Boundary 3	
];
exclusions[YOSHI] = [
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
exclusions[DK] = [
	[ [20, 0], [190, 0], [190, 80], [170, 80], [170, 10], [110, 10], ], // Boundary 1
	[ [10, 90], [130, 90], [130, 100], [100, 100], [100, 120], [90, 120], [90, 100], [10, 100], ], // Boundary 2
	[ [-20, 50], [-10, 50], [90, 40], [100, 40], [100, 50], [90, 50], [-10, 60], [-20, 60],], // Boundary 3
	[ [-150, 0], [-70, 0], [-70, 10], [-110, 10], [-110, 70], [-180, 70], [-180, 30], [-150, 30], ], // Boundary 4
	[ [-190, 110], [-170, 130], ], // Boundary 5
	[ [-140, 100], [-90, 100], [-90, 120], [-110, 120], [-110, 160], [-130, 160], [-130, 200], [-140, 200], ] // Boundary 6 
];
exclusions[CFALCON] = [
	[ [90, 80], [100, 80], [100, 95], [110, 100], [130, 100], [140, 95], [140, 30], [150, 30], [150, 100], [130, 110], [110, 110], [90, 100] ], // Boundary 1
	[ [-130, 20], [-110, 90] ], // Boundary 2
	[ [-130, -130], [-90, -130], [-90, -110], [-110, -110], [-110, -10], [-130, -10] ], // Boundary 3
	[ [-60, -130], [150, -130], [150, -110], [0, -110], [-40, -70], [-40, -110], [-60, -110] ], // Boundary 4
	[ [60, -80], [90, -70] ], // Boundary 5
	[ [130, -80], [150, -70] ], // Boundary 6
];
exclusions[GANONDORF] = [
	[ [-95, 70], [-75, 70], [-35, 110], [-95, 110] ], // Boundary 1
	[ [95, 70], [95, 110], [35, 110], [75, 70] ], // Boundary 2
	[ [-70, -10], [-50, 0] ], // Boundary 3
	[ [-20, -10], [20, 0] ], // Boundary 4
	[ [50, -10], [70, 0] ], // Boundary 5
];
exclusions[FALCO] = [
	[ [-140, -40], [-130, 90] ], // Boundary 1
	[ [-70, 30], [-65, 30], [-65, 10], [-40, 10], [-40, 100], [-70, 100], ], // Boundary 2
	[ [-100, -70], [-40, -70], [-40, -10], [-65, -10], [-65, -30], [-100, -30], ], // Boundary 3
	[ [-20, -60], [-10, -70], [10, -70], [30, -50], [30, -30.5], [40, -30.5], [40, 10], [30, 10], [10, 30], [10, 40],
		[-10, 40], [-10, 30], [-20, 10], ], // Boundary 4
	[ [40, 70], [40, 60], [50, 50], [60, 50], [70, 60], [70, 70], [60, 80], [50, 80], ], // Boundary 5
	[ [60, -70], [110, -70], [110, -20], [100, -10], [80, -10], [70, -20], [60, -20], [60, -30], [70, -30], [70, -40],
		[60, -40], [60, -50], [70, -50], [70, -60], [60, -60], ], // Boundary 6
];	
exclusions[FOX] = [
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
exclusions[NESS] = [
	[ [50, 100], [150, 120] ], // Boundary 1
	[ [50, -60], [90, -60], [150, -20], [150, 80], [140, 80], [140, 0], [120, 0], [120, 80], [110, 80], [110, 0], [80, 0],
		[80, -40], [60, -40], [60, 40], [80, 40], [80, 20], [90, 20], [90, 80], [80, 80], [80, 50], [60, 50], [60, 80],
		[50, 80], ], // Boundary 2
	[ [-60, -90], [-60, -140], [-35, -140], [-35, -120], [-50, -120], [-50, -100], [-20, -100], [-20, -130], [-10, -140],
		[50, -140], [60, -130], [60, -90], [70, -90], [70, -80], [50, -80], [50, -110], [30, -110], [30, -120], [20, -130],
		[0, -130], [-10, -120], [-10, -90], ], // Boundary 3
	[ [-110, -90], [-90, -90], [-90, -140], [-80, -140], [-80, -80], [-110, -80], ], // Boundary 4
	[ [-110, -40], [-110, -50], [-80, -50], [-80, 40], [-100, 40], [-100, 30], [-90, 30], [-90, -40], ], // Boundary 5
	[ [-150, 0], [-150, -140], [-140, -140], [-140, -10], [-115, -10], [-115, 0], ], // Boundary 6
];	
exclusions[ICECLIMBERS] = [
	[ [-120, 0], [-80, 0], [-80, 200], [-60, 200], [-60, 340], [-50, 340], [-50, 430], [-25, 430], [-25, 440],
		[-100, 440], [-100, 340], [-120, 340], ], // Boundary 1
	[ [120, 0], [80, 0], [80, 200], [60, 200], [60, 340], [50, 340], [50, 430], [25, 430], [25, 440], [100, 440],
		[100, 340], [120, 340], ], // Boundary 2
];
exclusions[KIRBY] = [
	[ [-20, 160], [-150, 160], [-150, -70], [-70, -70], [-70, -60], [-90, -60], [-110, -50], [-110, 100], [-140, 100],
		[-140, 150], [-30, 150], [-30, 110], [-50, 110], [-50, 100], [-20, 50], [-20, 40], [10, 40], [10, 110],
		[-20, 110] ], // Boundary 1
	[ [-70, -40], [-40, -40], [-20, -30], [-20, -20], [-40, 10], [-40, 50], [-70, 99.5], [-70, 110], [-90, 110], [-90, 60],
		[-80, 60], [-80, 40], [-90, 40], [-90, -20], [-80, -20], [-80, 10], [-70, 10] ], // Boundary 2
	[ [30, 50], [60, 50], [60, 70], [50, 70], [50, 80], [60, 80], [60, 120], [30, 120] ], // Boundary 3
	[ [100, -30], [120, -30], [120, -60], [130, -60], [130, 160], [80, 160], [80, 80], [90, 80], [90, 70], [80, 70], [80, 50], 
		[120, 50], [120, -10], [90, -10], [90, 0], [80, 0], [80, 20], [50, 20], [50, -20], [40, -50], [40, -60], [60, -70], 
		[80, -70], [100, -60] ], // Boundary 4
];
exclusions[SAMUS] = [
	[ [-10, -10], [10, 0] ], // Boundary 1
	[ [-70, 110], [-70, 30], [-60, 30], [-60, 50], [-30, 50], [-30, 60], [-60, 60], [-60, 100], [-10, 100], [-10, 130],
		[10, 130], [10, 100], [50, 100], [50, 80], [30, 80], [30, 70], [50, 70], [50, 40], [80, 40], [80, 50], [60, 50],
		[60, 110], [20, 110], [20, 140], [-20, 140], [-20, 110] ], // Boundary 2
	[ [-110, -30], [-70, -30], [-70, -70], [-60, -70], [-60, -40], [-20, -40], [-20, -30], [-60, -30], [-60, -20],
		[-110, -20] ], // Boundary 3
	[ [-20, -70], [-20, -110], [-10, -110], [-10, -50], [-40, -50], [-40, -70] ], // Boundary 4
	[ [10, -60], [10, -110], [20, -110], [20, -70], [60, -70], [60, -30], [70, -30], [70, -20], [50, -20], [50, -30],
		[40, -30], [40, -40], [50, -40], [50, -60] ], // Boundary 5
	[ [100, -30], [130, -20] ], // Boundary 6
];
exclusions[ZELDA] = [
	[ [-50, 85], [-80, 40], [-20, 40] ], // Boundary 1
	[ [50, 85], [20, 40], [80, 40] ], // Boundary 2
	[ [-80, -5], [-80, -15], [-75, -15], [-75, -90], [-55, -90], [-40, -100], [-20, -100], [-20, -90], [-40, -90],
		[-55, -80], [-65, -80], [-65, -15], [-60, -15], [-60, -5] ], // Boundary 3
	[ [-10, -45], [10, -35] ], // Boundary 4
	[ [50, -80], [50, -90], [100, -90], [100, -80], [75, -80], [75, -15], [80, -15], [80, -5], [60, -5], [60, -15], [65, -15],
		[65, -80] ], // Boundary 5
];
exclusions[LINK] = [
	[ [100, -10], [110, 0] ], // Boundary 1
	[ [80, -55], [100, -45], [100, -35], [ 80,-45 ] ], // Boundary 2
	[ [30, -59], [50, -69], [50, -59], [ 30,-49 ] ], // Boundary 3
	[ [40, -20], [50, -20], [50, -10], [80, -10], [80, 0], [60, 0], [60, 30], [50, 30], [50, 70], [70, 80], 
		[80, 80], [80, 90], [70, 90], [50, 80], [40, 80], [40, 20], [50, 20], [50, 0], [40, 0] ], // Boundary 4
	[ [0, 10], [0, -80], [-40, -80], [-40, -110], [-30, -110], [-30, -100], [-20, -100], [-20, -110], [-10, -110],
		[-10, -100], [0, -100], [0, -110], [10, -110], [10, -100], [20, -100], [20, -110], [30, -110], [30, -100],
		[40, -100], [40, -110], [50, -110], [50, -100], [60, -100], [60, -110], [70, -110], [70, -100], [80, -100],
		[80, -110], [90, -110], [90, -90], [10, -90], [10, 10], [15, 10], [15, 20], [-5, 20], [-5, 10] ], // Boundary 5
];
exclusions[YLINK] = [
	[ [-190, 150], [-190, 140], [-170, 160], [-170, 170] ], // Boundary 1
	[ [-120, 120], [-120, 110], [-110, 110], [-110, -40], [-100, -40], [-100, 120] ], // Boundary 2
	[ [-80, -40], [-70, 120] ], // Boundary 3
	[ [-35, 0], [-25, 10] ], // Boundary 4
	[ [-60, 70], [-45, 50], [-55, 25], [-35, 25], [-25, 50], [-40, 70] ], // Boundary 5
	[ [-25, 70], [-10, 50], [-20, 25], [0, 25], [10, 50], [-5, 70] ], // Boundary 6
	[ [-55, 120], [-5, 160] ], // Boundary 7
	[ [10, 120], [40, 130] ], // Boundary 8
	[ [70, 140], [70, 75], [80, 70], [80, 140] ], // Boundary 9
	[ [80, 65], [70, 70], [70, 30], [95, 5], [120, 30], [120, 210], [100, 210], [100, 170], [70, 170], [70, 160], [100, 160],
		[100, 50], [80, 50] ], // Boundary 10
];
exclusions[PICHU] = [
	[ [-160, 0], [-120.1, 10.22] ], // Boundary 1
	[ [-80, 25.22], [-70, 25.22], [-70, 35.22], [-50, 55.22], [-50, 65.22], [-60, 65.22], [-60, 55.22],
		[-80, 35.22] ], // Boundary 2
	[ [-55, 25.22], [-45, 25.22], [-45, 35.22], [-25, 55.22], [-25, 65.22], [-35, 65.22], [-35, 55.22],
		[-55, 35.22] ], // Boundary 3
	[ [-30, 25.22], [-20, 25.22], [-20, 35.22], [0, 55.22], [0, 65.22], [-10, 65.22], [-10, 55.22],
		[-30, 35.22] ], // Boundary 4
	[ [29.73, -10], [40, 110] ], // Boundary 5
];
exclusions[PIKACHU] = [
	[ [-130, 100], [-130, 90], [-90, 90], [-90, 60], [-130, 60], [-130, 50], [-80, 50], [-80, 100] ], // Boundary 1
	[ [-130, 30], [-130, -20], [-80, -20], [-80, -10], [-120, -10], [-120, 20], [-80, 20], [-80, 30], ], // Boundary 2
	[ [-130, -50], [-130, -60], [-80, -60], [-80, -70], [-70, -70], [-70, -80], [-60, -80], [-60, -90], [60, -90], [60, -80],
		[70, -80], [70, -70], [80, -70], [80, -60], [150, -60], [150, -50], [70, -50], [70, -60], [60, -60], [60, -70],
		[50, -70], [50, -80], [-50, -80], [-50, -70], [-60, -70], [-60, -60], [-70, -60], [-70, -50], ], // Boundary 3
	[ [70, 30], [70, -20], [120, -20], [120, 30], [110, 30], [110, -10], [80, -10], [80, 30], ], // Boundary 4
	[ [100, 115], [100, 65], [110, 65], [110, 105], [140, 105], [140, 85], [150, 85], [150, 115], ], // Boundary 5
	[ [35, 100], [35, 65], [45, 65], [45, 110], [15, 110], [15, 100], ], // Boundary 6
	[ [-50, 110], [-50, 80], [-40, 80], [-40, 100], [-15, 100], [-15, 110], ], // Boundary 7
];
exclusions[JIGGLYPUFF] = [
	[ [-150, 70], [-150, 0], [-110, 0], [-110, 10], [-125, 45], [-140, 45], [-140, 60], [-55, 60], [-55, 40], [-45, 40],
		[-40, 50], [-40, 60], [0, 60], [0, 45], [10, 45], [15, 55], [15, 60], [120, 60], [120, 10], [15, 10], [15, 20],
		[10, 30], [0, 30], [0, 10], [-40, 10], [-40, 5], [-45, 25], [-55, 25], [-55, 10], [-65, 10], [-65, 0], [120, 0],
		[120, -60], [100, -60], [100, -70], [130, -70], [130, 70] ], // Boundary 1
	[ [-150, -75], [-140, -30] ], // Boundary 2
	[ [70, -40], [90, -30] ], // Boundary 3
];	
exclusions[MEWTWO] = [
	[ [-92.5, 42.5], [-77.5, 57.5], [-82.5, 62.5], [-97.5, 47.5] ], // Boundary 1
	[ [-60, 55], [-50, 85] ], // Boundary 2
	[ [-20, 55], [-10, 85] ], // Boundary 3
	[ [107.5, 47.5], [92.5, 62.5], [87.5, 57.5], [102.5, 42.5] ], // Boundary 4
	[ [120, -55], [130, 0] ], // Boundary 5
	[ [70, -170], [100, -80] ], // Boundary 6
	[ [-30, -170], [0, -80] ], // Boundary 7
	[ [-120, -55], [-110, 0] ], // Boundary 8
];
exclusions[MRGAMEWATCH] = [
];
exclusions[MARTH] = [
	[ [-100, 90], [-110, 70], [-110, -45], [-85, -45], [-85, -30], [-100, -30], [-100, 25], [-90, 70],
		[-90, 90], ], // Boundary 1
	[ [-35, 90], [-65, 90], [-65, 65], [-75, 0], [-75, -35], [-30, -35], [-30, -25], [-65, -25], [-65, 15], ], // Boundary 2
	[ [30, 140], [30, 95], [90, 95], [90, 105], [40, 105], [40, 140], ], // Boundary 3
	[ [-20, -35], [-10, -35], [-10, 30], [0, 30], [0, -40], [10, -40], [20, -30], [20, -20], [10, -20], [10, 40],
		[-20, 40], ], // Boundary 4
	[ [40, 50], [40, 0], [50, 0], [50, 10], [70, 10], [70, 20], [50, 20], [50, 50], ], // Boundary 5
	[ [80, 40], [80, 0], [90, 0], [90, 50], [60, 50], [60, 40], ], // Boundary 6
	[ [50, -20], [40, -20], [40, -40], [80, -40], [90, -30], [90, -20], [70, -20], [70, -10], [60, -10], [60, -30],
		[50, -30], ], // Boundary 7
	[ [-65, -65], [-65, -80], [70, -80], [70, -70], [90, -70], [90, -60], [-10, -60], ], // Boundary 8
];	
exclusions[ROY] = [
	[ [-15, -10], [15, 0] ], // Boundary 1
	[ [50, -30], [80, 0] ], // Boundary 2
	[ [80, -10], [110, 20] ], // Boundary 3
	];
exclusions[SHEIK] = [
];

/*
 * Exceptions to the exclusions
 */
exceptions = [];
exceptions[YLINK] = [
	[ [-45, 130], [-15, 150] ], // Box in Boundary 7
];	
exceptions[ROY] = [
	[ [60, -20], [70, -10] ], // Box in Boundary 2
	[ [90, 0], [100, 10] ], // Box in Boundary 3
];

/*
 * Spawn points by djwang88 and megaqwertification (with feedback from the Break the Targets community)
 * Vanilla spawn point is assumed to be first
 */
spawns = [];
spawns[DRMARIO] = [
	[-65, -110],
	[-40, -35], // 2
	[-92.5, 105], // 3
	[5, 105], // 4
	[37.5, -25], // 5
	[115, -20], // 6
	[-20, 45], // 7
];
spawns[MARIO] = [
	[0, 30], // original [0, 1.9] (y-28)
	[-120, 107.5], // 2 [-120, 79.5]
	[72.5, 82.5], // 3 [72.5, 54.5]
	[50, -9.5], // 4 [50, -37.5]
	[-78, 58], // 5 [-78, 30]
];
spawns[LUIGI] = [
	[0, 10], // original [1, -10] (y-20)
	[-55, -60], // 2 [-55, -80]
	[35, -60], // 3 [35, -80]
];
spawns[BOWSER] = [
	[50, 70], // original [99.25, -7.1] (x+50, y-77)
	[50, 10], // 2 [100, -67]
	[-88, 20], // 3 [-38, -57]
	[-55, -75], // 4 [-5, -152]
	[90, -25], // 5 [140, -102]
];
spawns[PEACH] = [
	[-20, 10],
	[-25, -55], // 2
	[75, 35], // 3
	[90, 115], // 4
	[82.5, -60], // 5
];
spawns[YOSHI] = [
	[-40, 35],
	[-137.5, 35], // 2
	[50, 35], // 3
	[-55, 150], // 4
	[115, -5], // 5
	[15, -15], // 6
];
spawns[DK] = [
	[0, 11],
	[-145, 85], // 2
	[-120, 175], // 3
	[-155, 205], // 4
	[30, 165], // 5
	[180, 95], // 6
];
spawns[CFALCON] = [
	[125, -105],
	[120, 125], // 2
	[-120, 105], // 3
	[-120, 5], // 4
	[-35, 5], // 5
	[120, -5], // 6
	[0, -95], // 7
];
spawns[GANONDORF] = [
	[0, 0],
	[-60, 15], // 2
	[60, 15], // 3
];
spawns[FALCO] = [
	[-5, 55],
	[-5, 55], // 2
	[-85, -15], // 3
	[88, -55], // 4
];
spawns[FOX] = [
	[-100, -75],
	[-37.5, -15], // 2
	[-35, 135], // 3
	[60, 155], // 4
	[130, 35], // 5
	[57.5, -25], // 6
	[20, -105], // 7
];
spawns[NESS] = [
	[10, -115],
	[-95, -65], // 2
	[-135.5, 15], // 3
	[70, 65], // 4
	[130, 15], // 5
	[-15, 15], // 6
];
spawns[ICECLIMBERS] = [
	[0, 0],
	[-50, 70], // 2
	[-20, 370], // 3	// maybe -25
	[62.5, 455], // 4
];
spawns[KIRBY] = [
	[-127.5, 105],
	[-40, 125], // 2
	[-5, 125], // 3
	[-85, 175], // 4
	[105, 75], // 5
	[65, 35], // 6
];
spawns[SAMUS] = [
	[0, -5],
	[-45, 75], // 2
	[40, 125], // 3
	[-85, -5], // 4
	[115, -5], // 5
	[30, -45], // 6
];
spawns[ZELDA] = [
	[0, -28.94],
	[0, 95], // 2
	[-112, 10], // 3
	[-47.5, -70], // 4
	[70, 10], // 5
];
spawns[LINK] = [
	[5, 21.06],
	[-52, 42], // 2
	[45, 90], // 3
	[40, -50], // 4
	[75, 5], // 5
	// [105, 5], // far right platform
];
spawns[YLINK] = [
	[-90, 40],
	[-110, 135], // 2
	[-30, 175], // 3
	[-15, 85], // 4
	[85, 185], // 5
];
spawns[PICHU] = [
	[24.59, -16.07],
	[-140, 25], // 2
	[5, 95], // 3
	[120, 65], // 4
];
spawns[PIKACHU] = [
	[0, -65],
	[-100, 0], // 2
	[-105, 115], // 3
	[135, -35], // 4
	[-30, 55], // 5
	[95, 5], // 6
];
spawns[JIGGLYPUFF] = [
	[82.5, 20],
	[-132, 45], // 2
	[-20, 20], // 3
	[100, 80], // 4
	[110, -50], // 5
];
spawns[MEWTWO] = [
	[5, -30],
	[-35, 70], // 2
	[-115, 10], // 3
	[125, 10], // 4
	[85, -70], // 5
];
spawns[MRGAMEWATCH] = [
	[20, -35],
	[-72, 27], // 2
	[52, 15], // 3
];
spawns[MARTH] = [
	[-5, -60],
	[-5, 80], // 2
	[-140, 20], // 3
	[70, 60], // 4
	[65, 115], // 5
];
spawns[ROY] = [
	[0, 15],
	[65, 15], // 2
	[84.5, 132] // 3
	[-140, 5], // 4
];
spawns[SHEIK] = [
	[0, 0],
	[-90, 0], // 2
	[80, 0], // 3
];