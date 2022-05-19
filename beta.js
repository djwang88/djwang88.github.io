/*
 * Randomizer developed by djwang88
 * Current version: 3.0
 * ---------
 * CHANGELOG
 * ---------
 * [2020-09-01] First version (version 0.1)
 * [2020-09-01] Fixed Zelda bounds (decreased y2)
 * [2020-09-04] Fixed Pichu exclusions (Boundary 5)
 * [2020-09-05] Spawn randomizer proof of concept (Link)
 * [2020-09-06] Random stage feature
 * [2020-09-06] Fixed Link exclusion (Boundary 5) (discovered by chaos6)
 * [2020-09-06] Fixed Young Link exception (discovered by chaos6)
 * [2020-09-06] New randomizer template using halfwords (fixes Mewtwo) (version 0.2)
 * [2020-09-06] Arbitrary targets feature for individual stages & modular code builder
 * [2020-09-07] Adjusted Samus bounds (increased x2)
 * [2020-09-07] Arbitrary targets feature for all stages code (version 0.3)
 * [2020-09-07] Updated short codes to handle Mewtwo's targets
 * [2020-09-07] Added mismatch randomizer feature (version 0.4)
 * [2020-09-07] Added spawn randomizer feature (version 0.5)
 * [2020-09-07] Adjusted Ness bounds (decreased y2)
 * [2020-09-07] Adjusted Link bounds (decreased x2)
 * [2020-09-08] New compact mismatch randomizer template
 * [2020-09-08] Adjusted Dr. Mario, Peach spawns
 * [2020-09-09] Adjusted DK bounds (increased x2)
 * [2020-09-09] Added Ice Climbers exclusion (Boundary 3)
 * [2020-09-09] Adjusted Falco bounds (increased y2) and fixed exclusion (Boundary 6)
 * [2020-09-09] Adjusted Captain Falcon bounds (increased y2)
 * [2020-09-09] Fixed Kirby spawn (5)
 * [2020-09-09] Randomizer ID feature (version 0.6)
 * [2020-09-14] Validation for randomizer ID
 * [2020-09-15] Adjusted Peach spawn (5), Yoshi spawn (3)
 * [2020-09-15] First official release (version 1.0)
 * [2020-09-16] Fixed Young Link exclusion (Boundary 10)
 * [2020-09-16] Added warning for Gecko code limits
 * [2020-09-18] New version of mismatch randomizer code to only affect target stages
 * [2020-09-29] Target counter feature (version 1.1)
 * [2020-10-06] Fixed issue with Mario/Luigi/Bowser spawn differentials
 * [2020-10-26] Reduce impossible seeds feature (version 1.2)
 * [2020-11-01] Fixed issue with Ice Climbers mismatch instadeath
 * [2020-11-06] Options added for speedrun codes, win condition, and reduce impossible
 * [2020-12-09] Adjusted Luigi center spawn and Mewtwo skinny spawns -0.1 for Popo
 * [2020-12-10] Second official release (version 2.0)
 * [2020-12-17] Moved several codes to default codes
 * [2021-08-16] Fixed issue with win condition code resulting in no score
 * [2021-11-29] Added URL seed argument
 * [2022-01-03] Default to spawn, mismatch, reduce impossible, speedrun
 * [2022-02-10] Display code counter, removed mismatch warning
 * [2022-05-08] Enable moving targets feature, use modular code for everything (unreleased)
 * [2022-05-10] Copy link feature (unreleased)
 * [2022-05-11] Randomly distributed targets feature [hotdogturtle]
 * [2022-??-??] Weighted areas & random exclusions [LinksDarkArrows] (version 3.0)
 */

includeJs("seedrandom.js");
initializeDatabase();

var resultBox = document.querySelector('#result');
var stageBox = document.querySelector('#stage');
var spawnBox = document.querySelector('#spawn');
var numTargetsBox = document.querySelector('#num-targets');
var numTargetsDiv = document.querySelector('#num-targets-div');
var optionsButton = document.querySelector('#show-options');
var optionsDiv = document.querySelector('#options-div');
var mismatchCheckboxDiv = document.querySelector('#mismatch-checkbox-div');
var mismatchCheckbox = document.querySelector('#mismatch-checkbox');
var impossibleCheckboxDiv = document.querySelector('#impossible-checkbox-div');
var impossibleCheckbox = document.querySelector('#impossible-checkbox');
var idBox = document.querySelector('#randomizer-id');
var geckoNote = document.querySelector('#gecko-limitation-note');
var winConditionCheckbox = document.querySelector('#win-condition');
var winConditionDiv = document.querySelector('#win-condition-div');
var winConditionBox = document.querySelector('#win-condition-box');
var speedrunCodesCheckbox = document.querySelector('#speedrun-codes');
var weightedCheckbox = document.querySelector('#weighted');
var codeDetailsDiv = document.querySelector('#code-details');
var enableMovingCheckbox = document.querySelector('#enable-moving');
var randomlyDistributeDiv = document.querySelector('#randomly-distribute-div');
var randomlyDistributeCheckbox = document.querySelector('#randomly-distribute');

var getRandom;
var db;

function randomize(seed, schema) {
	if (!schema) schema = CURRENT_SCHEMA;

	var load = true;
	if (!seed) {
		getRandom = new Math.seedrandom();
		seed = Math.floor(getRandom() * Number.MAX_SAFE_INTEGER);	// 9,007,199,254,740,991
		load = false;
	}
	getRandom = new Math.seedrandom(seed);

	var stage = getStage();
	var numTargets = getNumTargets(stage);
	var spawn = isSpawn();
	var mismatch = isMismatch();
	var reduceImpossible = isReduceImpossible();
	var enableSpeedrunCodes = isSpeedrunCodes();
	var enableWinCondition = isWinCondition();
	var winCondition = getWinCondition();
	var weighted = isWeighted();
	var enableMoving = isEnableMoving();
	var randomlyDistribute = isRandomlyDistribute();

	if (isNaN(numTargets) || numTargets < 1 || numTargets > 255) {
		resultBox.value = "Number of targets must be a number between 1 and 255."
		return;
	}

	if (enableWinCondition && (isNaN(winCondition) || winCondition < 1 || winCondition > numTargets)) {
		resultBox.value = "Win condition must be a number between 1 and the number of targets."
		return;
	}

	showHideGeckoNote();

	var code = "";
	if (stage == ALL) {
		if (schema == 1) {
			code = getAllStagesCode(spawn, weighted, enableMoving, randomlyDistribute, schema);
			if (mismatch) {
				var mismatchObject = getMismatchCode();
				code += '\n' + mismatchObject['code'];
			}
		} else {
			if (mismatch) {
				mismatchObject = getMismatchCode();
				if (reduceImpossible) {
					code = getAllStagesCode(spawn, weighted, enableMoving, randomlyDistribute, schema, mismatchObject['map']);
				} else {
					code = getAllStagesCode(spawn, weighted, enableMoving, randomlyDistribute, schema);
				}
				code += '\n' + mismatchObject['code'];
			} else {
				code = getAllStagesCode(spawn, weighted, enableMoving, randomlyDistribute, schema);
			}
		}
	} else if (stage == RANDOM) {
		stage = Math.floor(getRandom() * stageHooks.length);
		stageBox.value = stage.toString();
		code = getCode(stage, spawn, weighted, enableMoving, schema);
	} else {
		code = getCode(stage, spawn, weighted, enableMoving, schema);
	}

	code += '\n' + defaultCodes;

	if (enableSpeedrunCodes) {
		code += '\n' + speedrunCodes;
	}

	if (numTargets > 15 && !enableSpeedrunCodes) {
		code += '\n' + targetCounterCode;
	}

	if (enableWinCondition && winCondition != numTargets) {
		code += '\n' + winConditionCode + winCondition.toString(16).padStart(2, '0').toUpperCase();
		code += '\n' + noScoreFix;
	}

	resultBox.value = code;
	idBox.value = encodeRandomizerId(schema, seed, stage, numTargets, spawn, mismatch,
		reduceImpossible, enableSpeedrunCodes, enableWinCondition, winCondition, weighted,
		enableMoving, randomlyDistribute);

	var updateObject = {};
	if (load) {
		updateObject["load_counter"] = firebase.database.ServerValue.increment(1);
	} else {
		updateObject["randomize_counter"] = firebase.database.ServerValue.increment(1);
		updateObject["stage_counter_" + stage] = firebase.database.ServerValue.increment(1);
		updateObject["targets_counter_" + numTargets] = firebase.database.ServerValue.increment(1);
		if (spawn) updateObject["spawn_counter"] = firebase.database.ServerValue.increment(1);
		if (mismatch) updateObject["mismatch_counter"] = firebase.database.ServerValue.increment(1);
		if (reduceImpossible) updateObject["reduce_counter"] = firebase.database.ServerValue.increment(1);
		if (enableSpeedrunCodes) updateObject["codes_counter"] = firebase.database.ServerValue.increment(1);
		if (enableWinCondition) updateObject["win_counter_" + winCondition] = firebase.database.ServerValue.increment(1);
		if (weighted) updateObject["weighted_counter"] = firebase.database.ServerValue.increment(1);
		if (enableMoving) updateObject["enable_moving_counter"] = firebase.database.ServerValue.increment(1);
	}
	db.update(updateObject);
}

function getCode(stage, spawn, weighted, enableMoving, schema) {
	return getModularCode([stage], spawn, weighted, enableMoving, false, getNumTargets(stage), schema);
}

// function getRegularCode(stage, spawn, weighted, schema) {
// 	var numTargets = 10;
// 	var start = codeStart;
// 	var end = codeEnd;

// 	if (stage == 25) {
// 		// sheik-specific code
// 		start = codeStartSheik;
// 		end = codeEndSheik;
// 		numTargets = 3;
// 	}

// 	if (spawn) {
// 		start = codeStartSpawn;
// 		end = codeEndSpawn;
// 	}

// 	var result = stageHooks[stage] + start;

// 	if (spawn) {
// 		var index = Math.floor(getRandom() * spawns[stage].length);
// 		var x = spawns[stage][index][0];
// 		var y = spawns[stage][index][1];

// 		// handle bizarre spawn differentials for the short code
// 		if (stage == MARIO) {
// 			y -= 28;
// 		} else if (stage == LUIGI) {
// 			y -= 20;
// 		} else if (stage == BOWSER) {
// 			x += 50;
// 			y -= 77;
// 		}
// 		result += coordsToHex(x, y);
// 	}

// 	var checkRandomExclusions = isCheckRandomExclusions(stage, weighted, schema);

// 	for (let i = 0; i < numTargets; i++) {
// 		var coords = getValidCoordinates(stage, weighted, schema, null, checkRandomExclusions);
// 		result += coordsToHex(coords.x, coords.y);
// 	}
// 	result += end;
// 	return result;
// }

function getModularCode(stages, spawn, weighted, enableMoving, randomlyDistribute, numTargets, schema, mismatchMap) {
	// build injection code
	var instructions = [];
	instructions = instructions.concat(modularInjectionStart);
	var stageData = [];
	var spawnPosition = -1;
	var numTargetsMap = [];

	if (schema >= 3 && randomlyDistribute) {
		for (let i = 0; i < 25; i++) {
			numTargetsMap[i] = 0;
		}
		numTargetsMap[SHEIK] = Math.floor(getRandom() * 10) + 1;

		// randomly distribute targets from the pool
		var totalTargets = 0;
		while (totalTargets < 225) {
			var targetsLeft = 250 - totalTargets;
			for (let i = 0; i < 25; i++) {
				var n = Math.floor(getRandom() * Math.floor(targetsLeft / 25)) + 1;
				numTargetsMap[i] += n;
				totalTargets += n;
			}
		}

		// mop up the leftovers
		for (let i = totalTargets; i < 250; i++) {
			var n = Math.floor(getRandom() * 25);
			numTargetsMap[n]++;
			totalTargets++;
		}
	}

	for (let i = 0; i < stages.length; i++) {
		var stage = stages[i];
		var numTargetsToAdd = randomlyDistribute ? numTargetsMap[stage] : numTargets;
		stageData.push(getStageHeader(DEFAULT_SCALE, spawn, COMPRESSION_HWORD, numTargetsToAdd, stage));
		if (schema == 1) {
			if (spawn) {
				stageData.push(getSpawnHalfWords(stage));
			}
		} else {
			if (mismatchMap && stage == YLINK) {
				var character = mismatchMap[stage];
				switch (character) {
					case DRMARIO:
					case LUIGI:
					case BOWSER:
					case PEACH: // DIFFICULT
					case YOSHI:
					case DK:
					case GANONDORF:
					case FALCO:
					case FOX:
					case NESS:
					case ICECLIMBERS:
					case KIRBY:
					case LINK: // DIFFICULT
					case PIKACHU:
					case JIGGLYPUFF: // DIFFICULT
					case MEWTWO: // DIFFICULT
					case MRGAMEWATCH:
					case MARTH:
					case ROY:
						if (spawn) {
							// anything but pit spawn
							var index = Math.floor(getRandom() * (spawns[stage].length - 1)) + 1;
							stageData.push(coordsToHalfWords(spawns[stage][index][0], spawns[stage][index][1]));
						} else {
							// force spawn to be on lip of pit
							stageData.splice(-1, 1);
							stageData.push(getStageHeader(DEFAULT_SCALE, true, COMPRESSION_HWORD, numTargetsToAdd, stage));
							stageData.push(coordsToHalfWords(spawns[YLINK][1][0], spawns[YLINK][1][1]));
						}
						break;
					default:
						// normal behavior
						if (spawn) {
							stageData.push(getSpawnHalfWords(stage));
						}
						break;
				}
			} else if (spawn) {
				spawnPosition = Math.floor(getRandom() * spawns[stage].length);
				var spawnCoordinates = getSpawnHalfWords(stage, enableMoving, spawnPosition);
				if (mismatchMap && stage == ICECLIMBERS) {
					var character = mismatchMap[stage];
					switch (character) {
						case DK:
						case KIRBY:
						case JIGGLYPUFF:
							// prevent instadeath by moving spawn up
							var badSpawn = coordsToHalfWords(spawns[ICECLIMBERS][2][0], spawns[ICECLIMBERS][2][1]);
							if (spawnCoordinates == badSpawn) {
								spawnCoordinates = coordsToHalfWords(spawns[ICECLIMBERS][3][0], spawns[ICECLIMBERS][3][1]);
							}
							break;
					}
				}
				stageData.push(spawnCoordinates);
			}
		}

		var checkRandomExclusions = isCheckRandomExclusions(stage, weighted, schema, spawnPosition);
		for (let i = 0; i < numTargetsToAdd; i++) {
			var coords = getValidCoordinates(stage, weighted, schema, mismatchMap, checkRandomExclusions);
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

	if (isEnableMoving()) {
		result += modularEndEnableMoving;
	} else {
		result += modularEnd;
	}

	return result;
}

function isCheckRandomExclusions(stage, weighted, schema, spawnPosition = -1) {
	if (schema >= 3 && weighted) {
		if (topSpawn[stage] != null && spawnPosition == topSpawn[stage]) {
			// don't exclude if we spawn on top
			return false;
		}
		if (randomExclusions[stage] != null) {
			var rand = getRandomDecimal(0, 1);
			var weight = randomExclusions[stage].slice(0, 1)[0];
			if (rand > weight) {
				return true;
			}
		}
	}
	return false;
}

function getAllStagesCode(spawn, weighted, enableMoving, randomlyDistribute, schema, mismatchMap) {
	var numTargets = getNumTargets();
	var stages = [];
	for (let i = 0; i < 26; i++) {
		stages.push(i);
	}
	return getModularCode(stages, spawn, weighted, enableMoving, randomlyDistribute, numTargets, schema, mismatchMap);
}

function showHideGeckoNote() {
	geckoNote.style.display = "none";

	var stage = getStage();
	if (stage == ALL) {
		var numTargets = getNumTargets();
		if (numTargets > 15) {
			geckoNote.style.display = "block";
		}
	}
}

function getMismatchCode() {
	var mismatchObject = [];
	var code = mismatchStart;
	var randomized = [];
	var mismatchMap = [];	// index on stage

	// subtract one for sheik's stage
	var numStages = stageIds.length - 1;
	while (randomized.length < numStages) {
		var index = Math.floor(getRandom() * numStages);
		if (randomized.indexOf(index) == -1) {
			randomized.push(index);
		}
	}
	var randomizedCounter = 0;
	for (let i = 0; i <= 0x20; i++) {
		if (i == 0x0E || // ice climbers
			i == 0x13 || // sheik
			i == 0x1A || // master hand
			i == 0x1B || // wireframe male
			i == 0x1C || // wireframe female
			i == 0x1D || // giga bowser
			i == 0x1E || // crazy hand
			i == 0x1F    // sandbag
		) {
			code += "01";
		} else {
			var index = randomized[randomizedCounter];
			code += stageIds[index];
			mismatchMap[index] = characterIds.indexOf(i);
			randomizedCounter++;
		}
		if ((i + 1) % 8 == 0) {
			code += ' ';
		} else if ((i + 1) % 4 == 0) {
			code += '\n';
		}
	}
	code += "000000\n";
	code += mismatchEnd;

	mismatchObject['code'] = code;
	mismatchObject['map'] = mismatchMap;
	return mismatchObject;
}

/*
 * Header structure designed by Punkline
 * 0xFF000000 = scale (compression scale value) (signed)
 * 0x00100000 = spawn (custom spawn) (boolean)
 * 0x00070000 = compression (compression type) (unsigned)
 * 0x0000FF00 = numTargets (target count value) (unsigned)
 * 0x000000FF = stage (stage ID) (unsigned)
 */
function getStageHeader(scale, spawn, compression, numTargets, stage) {
	var header = scale.toString(16).padStart(2, '0') +
		(spawn ? '1' : '0') +
		compression.toString(16) +
		numTargets.toString(16).padStart(2, '0') +
		stageIds[stage];
	return header.toUpperCase();
}

function getValidCoordinates(stage, weighted, schema, mismatchMap, checkRandomExclusions) {
	var invalid = true;
	while (invalid) {
		if (schema == 1 ||
			schema == 2) {
			var x = getRandomDecimal(bounds[stage].x1, bounds[stage].x2);
			var y = getRandomDecimal(bounds[stage].y1, bounds[stage].y2);
		} else {
			if (newBounds[stage] != null) {
				var x = getRandomDecimal(newBounds[stage].x1, newBounds[stage].x2);
				var y = getRandomDecimal(newBounds[stage].y1, newBounds[stage].y2);
			} else {
				var x = getRandomDecimal(bounds[stage].x1, bounds[stage].x2);
				var y = getRandomDecimal(bounds[stage].y1, bounds[stage].y2);
			}
		}

		if (coordinatesValid(x, y, stage, weighted, schema, mismatchMap, checkRandomExclusions)) {
			invalid = false;
		}
	}
	return { x: x, y: y };
}

function coordinatesValid(x, y, stage, weighted, schema, mismatchMap, checkRandomExclusions) {
	if (schema == 1) {
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
	} else if (schema == 2) {
		if (mismatchMap) {
			var character = mismatchMap[stage];
			if (mismatchExclusions[stage] && mismatchExclusions[stage][character]) {
				for (let i = 0; i < mismatchExclusions[stage][character].length; i++) {
					var vs = mismatchExclusions[stage][character][i];
					if (withinBounds(x, y, vs)) {
						return false;
					}
				}
			}
		}
		if (exceptions[stage] != null) {
			for (let j = 0; j < exceptions[stage].length; j++) {
				var ex = exceptions[stage][j];
				if (withinBounds(x, y, ex)) {
					return true;
				}
			}
		}
		if (exclusions[stage] != null) {
			for (let i = 0; i < exclusions[stage].length; i++) {
				var vs = exclusions[stage][i];
				if (withinBounds(x, y, vs)) {
					return false;
				}
			}
		}
		return true;
	} else {
		if (mismatchMap) {
			var character = mismatchMap[stage];
			if (mismatchExclusions[stage] && mismatchExclusions[stage][character]) {
				for (let i = 0; i < mismatchExclusions[stage][character].length; i++) {
					var vs = mismatchExclusions[stage][character][i];
					if (withinBounds(x, y, vs)) {
						return false;
					}
				}
			}
		}
		if (exceptions[stage] != null) {
			for (let j = 0; j < exceptions[stage].length; j++) {
				var ex = exceptions[stage][j];
				if (withinBounds(x, y, ex)) {
					if (weighted) {
						return checkWeighted(x, y, stage);
					}
					return true;
				}
			}
		}
		if (exclusions[stage] != null) {
			for (let i = 0; i < exclusions[stage].length; i++) {
				var vs = exclusions[stage][i];
				if (withinBounds(x, y, vs)) {
					return false;
				}
			}
		}
		if (newExclusions[stage] != null) {
			for (let i = 0; i < newExclusions[stage].length; i++) {
				var vs = newExclusions[stage][i];
				if (withinBounds(x, y, vs)) {
					return false;
				}
			}
		}
		if (checkRandomExclusions && randomExclusions[stage] != null) {
			var vs = randomExclusions[stage].slice(1);
			if (withinBounds(x, y, vs)) {
				return false;
			}
		}
		if (weighted) {
			return checkWeighted(x, y, stage);
		}
		return true;
	}
}

function checkWeighted(x, y, stage) {
	if (weights[stage] == null) {
		return true;
	}
	for (let i = 0; i < weights[stage].length; i++) {
		var vs = weights[stage][i].slice(1);
		var weight = weights[stage][i].slice(0, 1)[0];
		if (withinBounds(x, y, vs)) {
			var rand = getRandomDecimal(0, 1);
			if (rand > weight) {
				return false;
			}
			return true;
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
function withinPolygon(x, y, vs) {
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
	return Math.floor((Math.floor(getRandom() * (max - min + 1)) + min)) / 100;
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
	return (result);
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

function getSpawnHalfWords(stage, enableMoving = false, spawnPosition = null) {
	var index = spawnPosition == null ? Math.floor(getRandom() * spawns[stage].length) : spawnPosition;
	var x = spawns[stage][index][0];
	var y = spawns[stage][index][1];

	// handle bizarre offsets if MTX updates are left on
	if (enableMoving) {
		if (stage == MARIO) {
			y -= 28;
		} else if (stage == BOWSER) {
			x += 46.3;
			y -= 77;
		}
	}
	return coordsToHalfWords(x, y);
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

function isEven(num) {
	return (num % 2 == 0);
}

function copy() {
	resultBox.select();
	document.execCommand('copy');
}

function copyLink() {
	if (idBox.value.length == 0) {
		resultBox.value = "No seed to copy!";
	} else {
		navigator.clipboard.writeText(window.location.href.split('?')[0] + "?seed=" + idBox.value);
	}
}

function onChangeStage() {
	var stage = getStage();
	if (stage == ALL) {
		mismatchCheckboxDiv.style.display = "block";
		randomlyDistributeDiv.style.display = "block";
	} else {
		mismatchCheckboxDiv.style.display = "none";
		impossibleCheckboxDiv.style.display = "none";
		randomlyDistributeDiv.style.display = "none";
		mismatchCheckbox.checked = false;
		impossibleCheckbox.checked = false;
		randomlyDistributeCheckbox.checked = false;
	}
}

function showOptions() {
	optionsDiv.style.display = "block";
	optionsButton.style.display = "none";
	showHideMismatch(true);
}

function hideOptions() {
	optionsDiv.style.display = "none";
	optionsButton.style.display = "block";
	showHideMismatch(true);
}

function showHideMismatch(noCheck) {
	if (isMismatch()) {
		impossibleCheckboxDiv.style.display = "block";
		if (!noCheck) {
			impossibleCheckbox.checked = true;
		}
	} else {
		impossibleCheckboxDiv.style.display = "none";
	}
}

function showHideWinCondition() {
	if (isWinCondition()) {
		winConditionDiv.style.display = "block";
		winConditionBox.value = numTargetsBox.value;
	} else {
		winConditionDiv.style.display = "none";
	}
}

function showCodeDetails() {
	codeDetailsDiv.style.display = "block";
}

function optionsActive() {
	return optionsDiv.style.display != "none";
}

function getStage() {
	var stage;
	if (stageBox.value == "all") {
		stage = ALL;
	} else if (stageBox.value == "random") {
		stage = RANDOM;
	} else {
		stage = parseInt(stageBox.value);
	}
	return stage;
}

function getNumTargets(stage) {
	var numTargets = stage != SHEIK ? 10 : 3;
	if (optionsActive()) {
		numTargets = parseInt(numTargetsBox.value);
	}
	return numTargets;
}

function isSpawn() {
	if (optionsActive() && !spawnBox.checked) {
		return false;
	}
	return true;
}

function isMismatch() {
	if (optionsActive() && !mismatchCheckbox.checked) {
		return false;
	}
	return true;
}

function isReduceImpossible() {
	// default to true unless checkbox is explicitly unchecked
	if (optionsActive() && !impossibleCheckbox.checked) {
		return false;
	}
	return true;
}

function isWinCondition() {
	if (optionsActive() && winConditionCheckbox.checked) {
		return true;
	}
	return false;
}

function getWinCondition() {
	return parseInt(winConditionBox.value);
}

function isSpeedrunCodes() {
	if (optionsActive() && !speedrunCodesCheckbox.checked) {
		return false;
	}
	return true;
}

function isWeighted() {
	if (optionsActive() && !weightedCheckbox.checked) {
		return false;
	}
	return true;
}

function isEnableMoving() {
	if (optionsActive() && enableMovingCheckbox.checked) {
		return true;
	}
	return false;
}

function isRandomlyDistribute() {
	if (optionsActive() && randomlyDistributeCheckbox.checked) {
		return true;
	}
	return false;
}

function encodeRandomizerId(schema, seed, stage, numTargets, spawn, mismatch,
	reduceImpossible, enableSpeedrunCodes, enableWinCondition, winCondition, weighted,
	enableMoving, randomlyDistribute) {
	if (!schema) schema = CURRENT_SCHEMA;
	var options = "1";

	var mask = 0;
	if (spawn) mask |= OPTION_SPAWN;
	if (mismatch) mask |= OPTION_MISMATCH;
	if (mismatch && reduceImpossible) mask |= OPTION_IMPOSSIBLE;
	if (enableSpeedrunCodes) mask |= OPTION_SPEEDRUN;
	if (enableWinCondition) mask |= OPTION_WIN;
	if (weighted) mask |= OPTION_WEIGHTED;
	options += mask.toString().padStart(2, '0');

	options += numTargets.toString().padStart(3, '0');
	options += enableWinCondition ? winCondition.toString().padStart(3, '0') : '000';
	options += stage.toString().padStart(2, '0');

	var extra = "-";
	var mask = 0;
	if (enableMoving) mask |= EXTRA_MOVING;
	if (randomlyDistribute) mask |= EXTRA_DISTRIBUTE;
	if (mask > 0) {
		extra += base62.encode(parseInt(mask));
	}

	var encoded = base62.encode(schema) + base62.encode(parseInt(options)) + base62.encode(seed);
	if (extra.length > 1) {
		encoded += extra;
	}
	return encoded;
}

function decodeRandomizerId(id) {
	var schema = base62.decode(id.slice(0, 1));

	if (schema >= 3) {
		var idSplit = id.split('-');
		var suffix = idSplit[1];
		id = idSplit[0];
	}

	if (!isAlphaNumeric(id)) {
		return false;
	}

	if (schema == 1) {
		var options = base62.decode(id.slice(1, 5)).toString();
		var seed = base62.decode(id.slice(5));

		var spawn = parseInt(options.slice(1, 2)) == 1;
		var mismatch = parseInt(options.slice(2, 3)) == 1;
		var numTargets = parseInt(options.slice(3, 6));
		var stage = parseInt(options.slice(6));

		var reduceImpossible = false;
		var enableSpeedrunCodes = false;
		var enableWinCondition = false;
		var winCondition = 0;

	} else if (schema == 2) {
		var options = base62.decode(id.slice(1, 7)).toString();
		var seed = base62.decode(id.slice(7));

		var mask = parseInt(options.slice(1, 3));
		var spawn = (mask & OPTION_SPAWN) != 0;
		var mismatch = (mask & OPTION_MISMATCH) != 0;
		var reduceImpossible = (mask & OPTION_IMPOSSIBLE) != 0;
		var enableSpeedrunCodes = (mask & OPTION_SPEEDRUN) != 0;
		var enableWinCondition = (mask & OPTION_WIN) != 0;

		var numTargets = parseInt(options.slice(3, 6));
		var winCondition = parseInt(options.slice(6, 9));
		var stage = parseInt(options.slice(9));
	} else if (schema == 3) {
		var options = base62.decode(id.slice(1, 7)).toString();
		var seed = base62.decode(id.slice(7));

		var mask = parseInt(options.slice(1, 3));
		var spawn = (mask & OPTION_SPAWN) != 0;
		var mismatch = (mask & OPTION_MISMATCH) != 0;
		var reduceImpossible = (mask & OPTION_IMPOSSIBLE) != 0;
		var enableSpeedrunCodes = (mask & OPTION_SPEEDRUN) != 0;
		var enableWinCondition = (mask & OPTION_WIN) != 0;
		var weighted = (mask & OPTION_WEIGHTED) != 0;

		var numTargets = parseInt(options.slice(3, 6));
		var winCondition = parseInt(options.slice(6, 9));
		var stage = parseInt(options.slice(9));

		var enableMoving = false;
		var randomlyDistribute = false;
		if (suffix != null) {
			var extra = base62.decode(suffix);
			var enableMoving = (extra & EXTRA_MOVING) != 0;
			var randomlyDistribute = (extra & EXTRA_DISTRIBUTE) != 0;
		}
	} else {
		return false;
	}

	if (isNaN(numTargets) || (numTargets < 1 || numTargets > 255) ||
		isNaN(stage) || ((stage < DRMARIO || stage > SHEIK) && stage != ALL) ||
		isNaN(winCondition) || (enableWinCondition && (winCondition < 1 || winCondition > numTargets))) {
		return false;
	}

	return {
		schema: schema,
		seed: seed,
		stage: stage,
		numTargets: numTargets,
		spawn: spawn,
		mismatch: mismatch,
		reduceImpossible: reduceImpossible,
		enableSpeedrunCodes: enableSpeedrunCodes,
		enableWinCondition: enableWinCondition,
		winCondition: winCondition,
		weighted: weighted,
		enableMoving: enableMoving,
		randomlyDistribute: randomlyDistribute,
	}
}

function loadCode() {
	var id = idBox.value;
	loadCodeFromSeed(id);
}

function loadCodeFromSeed(id) {
	var decoded = decodeRandomizerId(id);

	if (decoded) {
		stageBox.value = (decoded.stage == 99 ? "all" : decoded.stage.toString());
		numTargetsBox.value = decoded.numTargets.toString();
		spawnBox.checked = decoded.spawn;
		mismatchCheckbox.checked = decoded.mismatch;
		speedrunCodesCheckbox.checked = decoded.enableSpeedrunCodes;
		winConditionCheckbox.checked = decoded.enableWinCondition;
		onChangeStage();
		showHideMismatch(true);
		showHideWinCondition();
		impossibleCheckbox.checked = decoded.reduceImpossible;
		winConditionBox.value = decoded.winCondition.toString();
		weightedCheckbox.checked = decoded.weighted;
		enableMovingCheckbox.checked = decoded.enableMoving;
		randomlyDistributeCheckbox.checked = decoded.randomlyDistribute;

		randomize(decoded.seed, decoded.schema);
	} else {
		resultBox.value = "Invalid seed."
	}
}

function isAlphaNumeric(id) {
	for (let i = 0; i < id.length; i++) {
		var char = id.charCodeAt(i);
		if (!(char > 47 && char < 58) &&
			!(char > 64 && char < 91) &&
			!(char > 96 && char < 123)) {
			return false;
		}
	}
	return true;
}

function loadSeedFromURL() {
	var params = new URLSearchParams(window.location.search);
	var seed = params.get('seed');
	if (seed != null) {
		showOptions();
		loadCodeFromSeed(seed);
	}
}

/*
 * base62 by Bret Lowrey
 * https://lowrey.me/encoding-decoding-base-62-in-es6-javascript/
 */
const base62 = {
	charset: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
		.split(''),
	encode: integer => {
		if (integer === 0) {
			return 0;
		}
		let s = [];
		while (integer > 0) {
			s = [base62.charset[integer % 62], ...s];
			integer = Math.floor(integer / 62);
		}
		return s.join('');
	},
	decode: chars => chars.split('').reverse().reduce((prev, curr, i) =>
		prev + (base62.charset.indexOf(curr) * (62 ** i)), 0)
};

/*
 * includeJs by Svitlana Maksymchuk
 */
function includeJs(jsFilePath) {
	var js = document.createElement("script");
	js.type = "text/javascript";
	js.src = jsFilePath;
	document.body.appendChild(js);
}

function initializeDatabase() {
	var firebaseConfig = {
		apiKey: "AIzaSyBzmvCfvumHNbr0aYxzTQLvnuWAEjXLwlQ",
		authDomain: "bttrandomizer.firebaseapp.com",
		databaseURL: "https://bttrandomizer.firebaseio.com",
		projectId: "bttrandomizer",
		storageBucket: "bttrandomizer.appspot.com",
		messagingSenderId: "543190615441",
		appId: "1:543190615441:web:bd9b80541ebe2bc6568630"
	};
	firebase.initializeApp(firebaseConfig);

	db = firebase.database().ref();
	db.on("value", function (snapshot) {
		var data = snapshot.val();
		document.querySelector('#counter').innerHTML = data.randomize_counter;
	});
}

/*
 * Constants
 */
const CURRENT_SCHEMA = 3;

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

const ALL = 99;
const RANDOM = 98;

const characterIds = [
	0x16, // DRMARIO
	0x08, // MARIO
	0x07, // LUIGI
	0x05, // BOWSER
	0x0C, // PEACH
	0x11, // YOSHI
	0x01, // DK
	0x00, // CFALCON
	0x19, // GANONDORF
	0x14, // FALCO
	0x02, // FOX
	0x0B, // NESS
	0x20, // POPO
	0x04, // KIRBY
	0x10, // SAMUS
	0x12, // ZELDA/SHEIK
	0x06, // LINK
	0x15, // YLINK
	0x18, // PICHU
	0x0D, // PIKACHU
	0x0F, // JIGGLYPUFF
	0x0A, // MEWTWO
	0x03, // MRGAMEWATCH
	0x09, // MARTH
	0x17, // ROY
];

const stageNames = [
	"Dr. Mario",
	"Mario",
	"Luigi",
	"Bowser",
	"Peach",
	"Yoshi",
	"Donkey Kong",
	"Captain Falcon",
	"Ganondorf",
	"Falco",
	"Fox",
	"Ness",
	"Ice Climbers",
	"Kirby",
	"Samus",
	"Zelda",
	"Link",
	"Young Link",
	"Pichu",
	"Pikachu",
	"Jigglypuff",
	"Mewtwo",
	"Mr. Game & Watch",
	"Marth",
	"Roy",
];

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

const OPTION_SPAWN = 1;
const OPTION_MISMATCH = 2;
const OPTION_IMPOSSIBLE = 4;
const OPTION_SPEEDRUN = 8;
const OPTION_WIN = 16;
const OPTION_WEIGHTED = 32;

const EXTRA_MOVING = 1;
const EXTRA_DISTRIBUTE = 2;

/*
 * Assembly code by Punkline
 * Gecko code templates by djwang88
 */
// const codeStart = " 00000019\n3C00801C 60004210\n7C0803A6 4E800021\n48000058 4E800021";
// const codeEnd = "\n4BFFFFAD 806DC18C\n7D0802A6 3908FFF8\n80A30024 80E5002C\n80070010 2C0000D1\n40820030 80C50028\nC4080008 C0280004\nD0060038 D026003C\n80C70DD4 D0060050\nD0260060 80060014\n64000080 90060014\n80A50008 2C050000\n4180FFBC 00000000";

// const codeStartSheik = " 00000012\n3C00801C 60004210\n7C0803A6 4E800021\n48000020 4E800021";
// const codeEndSheik = "\n4BFFFFE5 806DC18C\n7D0802A6 3908FFF8\n80A30024 80E5002C\n80070010 2C0000D1\n40820030 38000000\n80C50028 C4080008\nC0280004 9006007C\nD0060038 D026003C\n80C70DD4 9006007C\nD0060050 D0260060\n80A50008 2C050000\n4180FFBC 00000000";

// const codeStartSpawn = " 0000001D\n3C00801C 60004210\n7C0803A6 4E800021\n48000060 4E800021";
// const codeEndSpawn = "\n4BFFFFA5 806DC18C\n7D0802A6 80A30024\n3C008049 6003E6C8\n80C30280 C0080000\nD0060038 C0080004\nD006003C 80E5002C\n80070010 2C0000D1\n40820030 80C50028\nC4080008 C0280004\nD0060038 D026003C\n80C70DD4 D0060050\nD0260060 80060014\n64000080 90060014\n80A50008 2C050000\n4180FFBC 00000000";

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
const modularEndEnableMoving = "C21C4244 00000016\n80C10008 70C000FF\n418200A0 54C9C63E\n7C9D4800 4184000C\n38A00000 4800008C\n80E1000C 7CAA2B79\n811F0280 2C1D0000\n40A20010 74C00010\n41A20008 7D054378\n2C050000 41A00028\n41A50060 3B9CFFFF\n3BDEFFFC 80680084\n3C008037 60000E44\n7C0803A6 4E800021\n7C651B78 80C10008\n80E1000C 54C4063E\n74C03F07 7C17E3A6\n100723CC F0050038\n102004A0 D0050050\nD0250060 90E1000C\n7C082800 40A2000C\n7D455378 4BFFFF9C\n2C050000 00000000";

/*
 * Mismatch code by djwang88 & Punkline
 */

const mismatchStart = "C21B659C 00000008\n48000009 4800002C\n4E800021 ";
const mismatchEnd = "7CA802A6 7C6520AE\n60000000 00000000";

/*
 * Target counter code by djwang88 & Punkline
 */

const targetCounterCode = "C218252C 00000002\n2C000021 2C80000F\n4C003102 00000000\n042FA188 38c00002\nC22F91A8 0000000D\n80630000 2C030010\n39252EA0 80890000\n38000005 7D000026\n7C0903A6 55082EF6\n3C003F60 90040044\n90040058 80040014\n510006F6 80C40038\n90040014 3CC60017\n90C40050 84890004\n4200FFE4 3C00802F\n6000A2D0 7C0803A6\n4E800021 3C60804A\n60000000 00000000\nC22F91D4 00000003\n80010014 2C00000F\n40810008 38000001\n60000000 00000000";

/*
 * Default codes
 * - Unlock All Characters and Stages [Datel]
 * - Boot to Target Test [djwang88]
 * - Disable Special Messages [Most]
 * - Disable Trophy Messages [Achilles]
 * - C-Stick in Single Player [Zauron]
 */
const defaultCodes = "0445BF28 FFFFFFFF\n0445BF2C FFFFFFFF\n041BFA20 3860000F\n0415D94C 4E800020\n0415D984 4E800020\n0416B480 60000000";

/*
 * Speedrun codes
 * - Pause During Game Start [UnclePunch]
 * - Disable Player HUD [Achilles]
 * - Remove Pause Textures [djwang88]
 * - Disable "Go!" Text Graphic On Match Start [gadzook]
 * - Fixed Cam (D-Pad) [djwang88]
 * - Target Counter Code (Always) [djwang88, Punkline]
 */

const speedrunCodes = "0416CC1C 60000000\n0416CA9C 60000000\n042F6508 4E800020\n041A0FEC 4E800020\nC22F6EA8 00000002\n7C6E1B78 2C030008\n60000000 00000000\nC22F6FAC 00000005\n2C0E0004 41820020\n3D808039 618C069C\n7D8903A6 4E800421\n60000000 39C00000\n60000000 00000000\n2046B109 00010000\n04452C6C 00000000\n2046B109 00020000\n04452C6C 00000004\nE0000000 80008000\nC218252C 00000002\n2C000021 2C80000F\n4C003102 00000000\n042FA188 38C00002\nC22F91A8 0000000A\n80630000 39252EA0\n80890000 38000005\n7C0903A6 55082EF6\n3C003F60 90040044\n90040058 80C40038\n3CC60017 90C40050\n84890004 4200FFF0\n3C00802F 6000A2D0\n7C0803A6 4E800021\n3C60804A 00000000\n042F91D4 38000001";

/*
 * Win condition code by djwang88
 */
const winConditionCode = "041C427C 380000";

/*
 * No score bug fix by djwang88
 */
const noScoreFix = "C21C4344 00000003\n2C030000 40820008\n38600001 3803FFFF\n60000000 00000000";

/*
 * Stage boundaries and exclusions by megaqwertification
 * https://docs.google.com/document/d/1Dke2FDt5gVqJZyGCLipJYVynHd7EIbuxknme12z_gf4/edit#
 */
bounds = [
	{ x1: -130, y1: -130, x2: 130, y2: 130 }, // 00 DRMARIO
	{ x1: -150, y1: -100, x2: 130, y2: 150 }, // 01 MARIO
	{ x1: -70, y1: -70, x2: 70, y2: 70 }, // 02 LUIGI
	{ x1: -110, y1: -150, x2: 250, y2: 100 }, // 03 BOWSER
	{ x1: -110, y1: -100, x2: 180, y2: 150 }, // 04 PEACH
	{ x1: -150, y1: -90, x2: 130, y2: 170 }, // 05 YOSHI
	{ x1: -190, y1: 0, x2: 190, y2: 200 }, // 06 DK
	{ x1: -160, y1: -130, x2: 170, y2: 150 }, // 07 CFALCON
	{ x1: -90, y1: -20, x2: 90, y2: 110 }, // 08 GANONDORF
	{ x1: -140, y1: -70, x2: 110, y2: 130 }, // 09 FALCO
	{ x1: -150, y1: -150, x2: 150, y2: 150 }, // 10 FOX
	{ x1: -150, y1: -140, x2: 150, y2: 100 }, // 11 NESS
	{ x1: -120, y1: 0, x2: 120, y2: 500 }, // 12 ICECLIMBERS
	{ x1: -150, y1: -70, x2: 130, y2: 180 }, // 13 KIRBY
	{ x1: -130, y1: -110, x2: 130, y2: 130 }, // 14 SAMUS
	{ x1: -130, y1: -100, x2: 115, y2: 115 }, // 15 ZELDA
	{ x1: -150, y1: -100, x2: 120, y2: 100 }, // 16 LINK
	{ x1: -190, y1: -40, x2: 120, y2: 210 }, // 17 YLINK
	{ x1: -160, y1: -80, x2: 145, y2: 110 }, // 18 PICHU
	{ x1: -130, y1: -90, x2: 175, y2: 115 }, // 19 PIKACHU
	{ x1: -150, y1: -75, x2: 130, y2: 90 }, // 20 JIGGLYPUFF
	{ x1: -120, y1: -120, x2: 130, y2: 100 }, // 21 MEWTWO
	{ x1: -79, y1: -29.5, x2: 76, y2: 57.44 }, // 22 MRGAMEWATCH
	{ x1: -150, y1: -80, x2: 120, y2: 140 }, // 23 MARTH
	{ x1: -155, y1: -30, x2: 110, y2: 140 }, // 24 ROY
	{ x1: -100, y1: 0, x2: 100, y2: 80 }, // 25 SHEIK
];

/*
 * Adjusted bounds for 3.0
 */
newBounds = [];
newBounds[DRMARIO] = { x1: -145, y1: -140, x2: 150, y2: 130 };
newBounds[BOWSER] = { x1: -105, y1: -150, x2: 250, y2: 100 };
newBounds[DK] = { x1: -190, y1: -30, x2: 190, y2: 225 };
newBounds[FALCO] = { x1: -140, y1: -80, x2: 110, y2: 130 };
newBounds[FOX] = { x1: -150, y1: -150, x2: 145, y2: 150 };
newBounds[SAMUS] = { x1: -130, y1: -110, x2: 130, y2: 150 };

/*
 * Two-coordinate pairs are assumed to be bottom-left and top-right corners of a rectangle
 */
exclusions = [];
exclusions[DRMARIO] = [
	[[-95, -25], [-80, 90]], // Boundary 1
	[[30, 10], [70, -35], [80, -25], [40, 20]], // Boundary 2
	[[-50, -85], [-30, -50]], // Boundary 3
	[[-85, -130], [-45, -105]], // Boundary 4
];
exclusions[MARIO] = [
	[[-100, 157.5], [-150, 157.5], [-150, 57.5], [-100, 57.5], [-100, 97.5], [-140, 97.5], [-140, 127.5],
	[-100, 127.5]], // Boundary 1
	[[45, -100], [85, -57.5]], // Boundary 2
	[[-150, 37.5], [-135, 37.5], [-135, 50], [-100, 50], [-100, -22.5], [-140, -22.5], [-140, -62.5], [-120, -62.5],
	[-120, -72.5], [-140, -72.5], [-140, -100], [-150, -100]], // Boundary 3
];
exclusions[LUIGI] = [
	[[-5, -5], [5, 5]], // Boundary 1
];
exclusions[BOWSER] = [
	[[95, 55], [105, 85]], // Boundary 1
	[[30, 40], [80, 40], [80, 65], [70, 65], [70, 50], [30, 50]], // Boundary 2
	[[-50, -10], [-40, 35]], // Boundary 3
	[[-80, -45], [-70, 10]], // Boundary 4
	[[-105, -100], [-95, 45]], // Boundary 5
	[[-85, -100], [-25, -90]], // Boundary 6
	[[-5, -15], [80, -5]], // Boundary 7
	[[-5, -120], [30, -110]], // Boundary 8
	[[75, -150], [90, -140]], // Boundary 9
	[[35, -90], [130, -90], [130, 5], [120, 5], [120, -25], [100, -25], [100, -25], [100, -40], [80, -40],
	[70, -50], [70, -70], [50, -70], [50, -80], [35, -80]], // Boundary 10
	[[150, -120], [175, -110]], // Boundary 11
	[[200, -120], [210, -120], [210, -90], [235, -90], [235, -80], [200, -80]], // Boundary 12
];
exclusions[PEACH] = [
	[[-55, 0], [-55, -10], [20, -10], [20, -100], [130, -100], [135, -90], [135, -75], [120, -75], [120, -90],
	[105, -90], [105, -75], [100, -75], [100, -90], [85, -90], [85, -75], [80, -75], [80, -90], [65, -90],
	[65, -75], [60, -75], [60, -90], [40, -90], [40, -80], [30, -80], [30, -25], [35, -15], [35, 0]], // Boundary 1
	[[45, 83], [45, 75], [40, 65], [40, 50], [55, 50], [55, -10], [50, -20], [50, -55], [110, -55], [110, -45],
	[60, -45], [60, 50], [55, 65], [55, 78]], // Boundary 2
	[[17, 20], [22, 20], [22, 65], [30, 80], [30, 120], [40, 120], [130, 86.24], [130, 65], [135, 65], [135, 84.38],
	[145, 80.62], [145, 65], [150, 65], [150, 85], [30, 130], [17, 130]], // Boundary 3
];
exclusions[YOSHI] = [
	[[-85, 150], [-85, 130], [-75, 120], [-40, 120], [-30, 130], [-30, 165], [-40, 165], [-40, 135], [-75, 135],
	[-75, 150],], // Boundary 1
	[[-155, -10], [-155, -20], [-130, -20], [-120, -10], [-120, 10], [-130, 20], [-145, 20], [-145, 10], [-130, 10],
	[-130, -10],], // Boundary 2
	[[-60, 0], [-40, 0], [-30, 10], [-30, 20], [-50, 20], [-50, 55], [-80, 55], [-80, 45], [-60, 45],], // Boundary 3
	[[-15, 40], [25, 40], [25, 50], [15, 55], [-5, 55], [-15, 50],], // Boundary 4
	[[45, 140], [55, 165]], // Boundary 5
	[[40, 10], [70, 20]], // Boundary 6
	[[-5, -40], [5, -50], [25, -50], [35, -40], [35, -30], [-5, -30],], // Boundary 7
	[[-95, -45], [-55, -45], [-55, -90], [130, -90], [130, -20], [100, -20], [66.63, -55.51], [31.63, -70],
	[-1.63, -70], [-36.63, -55.51], [-55, -40], [-105, -40], [-105, -80], [-80, -80], [-80, -70],
	[-95, -70],], // Boundary 8
];
exclusions[DK] = [
	[[20, 0], [190, 0], [190, 80], [170, 80], [170, 10], [110, 10],], // Boundary 1
	[[10, 90], [130, 90], [130, 100], [100, 100], [100, 120], [90, 120], [90, 100], [10, 100],], // Boundary 2
	[[-20, 50], [-10, 50], [90, 40], [100, 40], [100, 50], [90, 50], [-10, 60], [-20, 60],], // Boundary 3
	[[-150, 0], [-70, 0], [-70, 10], [-110, 10], [-110, 70], [-180, 70], [-180, 30], [-150, 30],], // Boundary 4
	[[-190, 110], [-170, 130],], // Boundary 5
	[[-140, 100], [-90, 100], [-90, 120], [-110, 120], [-110, 160], [-130, 160], [-130, 200], [-140, 200],] // Boundary 6 
];
exclusions[CFALCON] = [
	[[90, 80], [100, 80], [100, 95], [110, 100], [130, 100], [140, 95], [140, 30], [150, 30], [150, 100], [130, 110], [110, 110], [90, 100]], // Boundary 1
	[[-130, 20], [-110, 90]], // Boundary 2
	[[-130, -130], [-90, -130], [-90, -110], [-110, -110], [-110, -10], [-130, -10]], // Boundary 3
	[[-60, -130], [150, -130], [150, -110], [0, -110], [-40, -70], [-40, -110], [-60, -110]], // Boundary 4
	[[60, -80], [90, -70]], // Boundary 5
	[[130, -80], [150, -70]], // Boundary 6
];
exclusions[GANONDORF] = [
	[[-95, 70], [-75, 70], [-35, 110], [-95, 110]], // Boundary 1
	[[95, 70], [95, 110], [35, 110], [75, 70]], // Boundary 2
	[[-70, -10], [-50, 0]], // Boundary 3
	[[-20, -10], [20, 0]], // Boundary 4
	[[50, -10], [70, 0]], // Boundary 5
];
exclusions[FALCO] = [
	[[-140, -40], [-130, 90]], // Boundary 1
	[[-70, 30], [-65, 30], [-65, 10], [-40, 10], [-40, 130], [-70, 130],], // Boundary 2
	[[-100, -70], [-40, -70], [-40, -10], [-65, -10], [-65, -30], [-100, -30],], // Boundary 3
	[[-20, -60], [-10, -70], [10, -70], [30, -50], [30, -30.5], [40, -30.5], [40, 10], [30, 10], [10, 30], [10, 40],
	[-10, 40], [-10, 30], [-20, 10],], // Boundary 4
	[[40, 70], [40, 60], [50, 50], [60, 50], [70, 60], [70, 70], [60, 80], [50, 80],], // Boundary 5
	[[100, -10], [80, -10], [70, -20], [60, -20], [60, -30], [70, -30], [70, -40], [60, -40], [60, -50], [70, -50],
	[70, -60], [60, -60], [60, -70], [70, -70], [70, -80], [80, -80], [80, -15], [100, -15], [100, -90], [110, -90],
	[110, -30],], // Boundary 6
];
exclusions[FOX] = [
	[[-120, -100], [-60, -100], [-60, -40], [-15, -40], [-15, -105], [-5, -105], [-5, 0], [15, 0], [15, 10],
	[-15, 10], [-15, -30], [-60, -30], [-60, 10], [-80, 10], [-80, -90], [-120, -90]], // Boundary 1
	[[-55, 80], [-15, 120]], // Boundary 2
	[[35, 80], [45, 80], [45, 130], [75, 130], [75, 65], [85, 65], [85, 140], [35, 140]], // Boundary 3
	[[115, -30], [145, 20]], // Boundary 4
	[[40, -50], [75, -40]], // Boundary 5
	[[45, -90], [70, -70]], // Boundary 6
	[[80, -120], [105, -110]], // Boundary 7
	[[45, -150], [70, -130]], // Boundary 8
	[[5, -130], [35, -120]], // Boundary 9
	[[-20, -145], [-5, -130]], // Boundary 10
	[[-45, -130], [-30, -120]], // Boundary 11
];
exclusions[NESS] = [
	[[50, 100], [150, 120]], // Boundary 1
	[[50, -60], [90, -60], [150, -20], [150, 80], [140, 80], [140, 0], [120, 0], [120, 80], [110, 80], [110, 0], [80, 0],
	[80, -40], [60, -40], [60, 40], [80, 40], [80, 20], [90, 20], [90, 80], [80, 80], [80, 50], [60, 50], [60, 80],
	[50, 80],], // Boundary 2
	[[-60, -90], [-60, -140], [-35, -140], [-35, -120], [-50, -120], [-50, -100], [-20, -100], [-20, -130], [-10, -140],
	[50, -140], [60, -130], [60, -90], [70, -90], [70, -80], [50, -80], [50, -110], [30, -110], [30, -120], [20, -130],
	[0, -130], [-10, -120], [-10, -90],], // Boundary 3
	[[-110, -90], [-90, -90], [-90, -140], [-80, -140], [-80, -80], [-110, -80],], // Boundary 4
	[[-110, -40], [-110, -50], [-80, -50], [-80, 40], [-100, 40], [-100, 30], [-90, 30], [-90, -40],], // Boundary 5
	[[-150, 0], [-150, -140], [-140, -140], [-140, -10], [-115, -10], [-115, 0],], // Boundary 6
];
exclusions[ICECLIMBERS] = [
	[[-120, 0], [-80, 0], [-80, 200], [-60, 200], [-60, 340], [-50, 340], [-50, 430], [-25, 430], [-25, 440],
	[-100, 440], [-100, 340], [-120, 340],], // Boundary 1
	[[120, 0], [80, 0], [80, 200], [60, 200], [60, 340], [50, 340], [50, 430], [25, 430], [25, 440], [100, 440],
	[100, 340], [120, 340],], // Boundary 2
	[[100, 340], [120, 440]], // Boundary 3
	[[-120, 340], [-100, 440]], // Boundary 4
];
exclusions[KIRBY] = [
	[[-20, 160], [-150, 160], [-150, -70], [-70, -70], [-70, -60], [-90, -60], [-110, -50], [-110, 100], [-140, 100],
	[-140, 150], [-30, 150], [-30, 110], [-50, 110], [-50, 100], [-20, 50], [-20, 40], [10, 40], [10, 110],
	[-20, 110]], // Boundary 1
	[[-70, -40], [-40, -40], [-20, -30], [-20, -20], [-40, 10], [-40, 50], [-70, 99.5], [-70, 110], [-90, 110], [-90, 60],
	[-80, 60], [-80, 40], [-90, 40], [-90, -20], [-80, -20], [-80, 10], [-70, 10]], // Boundary 2
	[[30, 50], [60, 50], [60, 70], [50, 70], [50, 80], [60, 80], [60, 120], [30, 120]], // Boundary 3
	[[100, -30], [120, -30], [120, -60], [130, -60], [130, 160], [80, 160], [80, 80], [90, 80], [90, 70], [80, 70], [80, 50],
	[120, 50], [120, -10], [90, -10], [90, 0], [80, 0], [80, 20], [50, 20], [50, -20], [40, -50], [40, -60], [60, -70],
	[80, -70], [100, -60]], // Boundary 4
];
exclusions[SAMUS] = [
	[[-10, -10], [10, 0]], // Boundary 1
	[[-70, 110], [-70, 30], [-60, 30], [-60, 50], [-30, 50], [-30, 60], [-60, 60], [-60, 100], [-10, 100], [-10, 130],
	[10, 130], [10, 100], [50, 100], [50, 80], [30, 80], [30, 70], [50, 70], [50, 40], [80, 40], [80, 50], [60, 50],
	[60, 110], [20, 110], [20, 140], [-20, 140], [-20, 110]], // Boundary 2
	[[-110, -30], [-70, -30], [-70, -70], [-60, -70], [-60, -40], [-20, -40], [-20, -30], [-60, -30], [-60, -20],
	[-110, -20]], // Boundary 3
	[[-20, -70], [-20, -110], [-10, -110], [-10, -50], [-40, -50], [-40, -70]], // Boundary 4
	[[10, -60], [10, -110], [20, -110], [20, -70], [60, -70], [60, -30], [70, -30], [70, -20], [50, -20], [50, -30],
	[40, -30], [40, -40], [50, -40], [50, -60]], // Boundary 5
	[[100, -30], [130, -20]], // Boundary 6
];
exclusions[ZELDA] = [
	[[-50, 85], [-80, 40], [-20, 40]], // Boundary 1
	[[50, 85], [20, 40], [80, 40]], // Boundary 2
	[[-80, -5], [-80, -15], [-75, -15], [-75, -90], [-55, -90], [-40, -100], [-20, -100], [-20, -90], [-40, -90],
	[-55, -80], [-65, -80], [-65, -15], [-60, -15], [-60, -5]], // Boundary 3
	[[-10, -45], [10, -35]], // Boundary 4
	[[50, -80], [50, -90], [100, -90], [100, -80], [75, -80], [75, -15], [80, -15], [80, -5], [60, -5], [60, -15], [65, -15],
	[65, -80]], // Boundary 5
];
exclusions[LINK] = [
	[[100, -10], [110, 0]], // Boundary 1
	[[80, -55], [100, -45], [100, -35], [80, -45]], // Boundary 2
	[[30, -59], [50, -69], [50, -59], [30, -49]], // Boundary 3
	[[40, -20], [50, -20], [50, -10], [80, -10], [80, 0], [60, 0], [60, 30], [50, 30], [50, 70], [70, 80],
	[80, 80], [80, 90], [70, 90], [50, 80], [40, 80], [40, 20], [50, 20], [50, 0], [40, 0]], // Boundary 4
	[[0, 10], [0, -80], [-40, -80], [-40, -110], [-30, -110], [-30, -100], [-20, -100], [-20, -110], [-10, -110],
	[-10, -100], [0, -100], [0, -110], [10, -110], [10, -100], [20, -100], [20, -110], [30, -110], [30, -100],
	[40, -100], [40, -110], [50, -110], [50, -100], [60, -100], [60, -110], [70, -110], [70, -100], [80, -100],
	[80, -110], [90, -110], [90, -90], [10, -90], [10, 10], [15, 10], [15, 20], [-5, 20], [-5, 10]], // Boundary 5
];
exclusions[YLINK] = [
	[[-190, 150], [-190, 140], [-170, 160], [-170, 170]], // Boundary 1
	[[-120, 120], [-120, 110], [-110, 110], [-110, -40], [-100, -40], [-100, 120]], // Boundary 2
	[[-80, -40], [-70, 120]], // Boundary 3
	[[-35, 0], [-25, 10]], // Boundary 4
	[[-60, 70], [-45, 50], [-55, 25], [-35, 25], [-25, 50], [-40, 70]], // Boundary 5
	[[-25, 70], [-10, 50], [-20, 25], [0, 25], [10, 50], [-5, 70]], // Boundary 6
	[[-55, 120], [-5, 160]], // Boundary 7
	[[10, 120], [40, 130]], // Boundary 8
	[[70, 140], [70, 75], [80, 70], [80, 140]], // Boundary 9
	[[80, 65], [70, 70], [70, 30], [95, 5], [120, 30], [120, 210], [100, 210], [100, 170], [60, 170], [60, 160], [100, 160],
	[100, 50], [80, 50]], // Boundary 10
];
exclusions[PICHU] = [
	[[-160, 0], [-120.1, 10.22]], // Boundary 1
	[[-80, 25.22], [-70, 25.22], [-70, 35.22], [-50, 55.22], [-50, 65.22], [-60, 65.22], [-60, 55.22],
	[-80, 35.22]], // Boundary 2
	[[-55, 25.22], [-45, 25.22], [-45, 35.22], [-25, 55.22], [-25, 65.22], [-35, 65.22], [-35, 55.22],
	[-55, 35.22]], // Boundary 3
	[[-30, 25.22], [-20, 25.22], [-20, 35.22], [0, 55.22], [0, 65.22], [-10, 65.22], [-10, 55.22],
	[-30, 35.22]], // Boundary 4
	[[29.73, -10], [40, 110]], // Boundary 5
];
exclusions[PIKACHU] = [
	[[-130, 100], [-130, 90], [-90, 90], [-90, 60], [-130, 60], [-130, 50], [-80, 50], [-80, 100]], // Boundary 1
	[[-130, 30], [-130, -20], [-80, -20], [-80, -10], [-120, -10], [-120, 20], [-80, 20], [-80, 30],], // Boundary 2
	[[-130, -50], [-130, -60], [-80, -60], [-80, -70], [-70, -70], [-70, -80], [-60, -80], [-60, -90], [60, -90], [60, -80],
	[70, -80], [70, -70], [80, -70], [80, -60], [150, -60], [150, -50], [70, -50], [70, -60], [60, -60], [60, -70],
	[50, -70], [50, -80], [-50, -80], [-50, -70], [-60, -70], [-60, -60], [-70, -60], [-70, -50],], // Boundary 3
	[[70, 30], [70, -20], [120, -20], [120, 30], [110, 30], [110, -10], [80, -10], [80, 30],], // Boundary 4
	[[100, 115], [100, 65], [110, 65], [110, 105], [140, 105], [140, 85], [150, 85], [150, 115],], // Boundary 5
	[[35, 100], [35, 65], [45, 65], [45, 110], [15, 110], [15, 100],], // Boundary 6
	[[-50, 110], [-50, 80], [-40, 80], [-40, 100], [-15, 100], [-15, 110],], // Boundary 7
];
exclusions[JIGGLYPUFF] = [
	[[-150, 70], [-150, 0], [-110, 0], [-110, 10], [-125, 45], [-140, 45], [-140, 60], [-55, 60], [-55, 40], [-45, 40],
	[-40, 50], [-40, 60], [0, 60], [0, 45], [10, 45], [15, 55], [15, 60], [120, 60], [120, 10], [15, 10], [15, 20],
	[10, 30], [0, 30], [0, 10], [-40, 10], [-40, 5], [-45, 25], [-55, 25], [-55, 10], [-65, 10], [-65, 0], [120, 0],
	[120, -60], [100, -60], [100, -70], [130, -70], [130, 70]], // Boundary 1
	[[-150, -75], [-140, -30]], // Boundary 2
	[[70, -40], [90, -30]], // Boundary 3
];
exclusions[MEWTWO] = [
	[[-92.5, 42.5], [-77.5, 57.5], [-82.5, 62.5], [-97.5, 47.5]], // Boundary 1
	[[-60, 55], [-50, 85]], // Boundary 2
	[[-20, 55], [-10, 85]], // Boundary 3
	[[107.5, 47.5], [92.5, 62.5], [87.5, 57.5], [102.5, 42.5]], // Boundary 4
	[[120, -55], [130, 0]], // Boundary 5
	[[70, -170], [100, -80]], // Boundary 6
	[[-30, -170], [0, -80]], // Boundary 7
	[[-120, -55], [-110, 0]], // Boundary 8
];
exclusions[MRGAMEWATCH] = [
];
exclusions[MARTH] = [
	[[-100, 90], [-110, 70], [-110, -45], [-85, -45], [-85, -30], [-100, -30], [-100, 25], [-90, 70],
	[-90, 90],], // Boundary 1
	[[-35, 90], [-65, 90], [-65, 65], [-75, 0], [-75, -35], [-30, -35], [-30, -25], [-65, -25], [-65, 15],], // Boundary 2
	[[30, 140], [30, 95], [90, 95], [90, 105], [40, 105], [40, 140],], // Boundary 3
	[[-20, -35], [-10, -35], [-10, 30], [0, 30], [0, -40], [10, -40], [20, -30], [20, -20], [10, -20], [10, 40],
	[-20, 40],], // Boundary 4
	[[40, 50], [40, 0], [50, 0], [50, 10], [70, 10], [70, 20], [50, 20], [50, 50],], // Boundary 5
	[[80, 40], [80, 0], [90, 0], [90, 50], [60, 50], [60, 40],], // Boundary 6
	[[50, -20], [40, -20], [40, -40], [80, -40], [90, -30], [90, -20], [70, -20], [70, -10], [60, -10], [60, -30],
	[50, -30],], // Boundary 7
	[[-65, -65], [-65, -80], [70, -80], [70, -70], [90, -70], [90, -60], [-10, -60],], // Boundary 8
];
exclusions[ROY] = [
	[[-15, -10], [15, 0]], // Boundary 1
	[[50, -30], [80, 0]], // Boundary 2
	[[80, -10], [110, 20]], // Boundary 3
];
exclusions[SHEIK] = [
];

/*
 * New exclusions for 3.0
 */
newExclusions = [];
newExclusions[DK] = [
	[[-190, -30], [-80, 0]],
	[[-30, -30], [190, 0]],
	[[100, 200], [190, 225]],
];
newExclusions[FALCO] = [
	[[-100, -80], [-40, -70]],
];

/*
 * Exceptions to the exclusions
 */
exceptions = [];
exceptions[YLINK] = [
	[[-45, 130], [-15, 150]], // Box in Boundary 7
];
exceptions[ROY] = [
	[[60, -20], [70, -10]], // Box in Boundary 2
	[[90, 0], [100, 10]], // Box in Boundary 3
];

/*
 * Spawn points by djwang88 and megaqwertification (with feedback from the Break the Targets community)
 * Vanilla spawn point is assumed to be first
 * https://docs.google.com/document/d/19G9saXWbFKIWBrVeNEu-Ng2oTuj1y8Kk8cYQ5Lb6MfM/edit
 */
spawns = [];
spawns[DRMARIO] = [
	[-65, -110],
	[-40, -35], // 2
	[-88, 105], // 3
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
	[-0.1, 10], // original [1, -10] (y-20)
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
	[-35, -65], // 2
	[75, 35], // 3
	[90, 115], // 4
	[128, -60], // 5
];
spawns[YOSHI] = [
	[-40, 35],
	[-137.5, 35], // 2
	[55, 35], // 3
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
	[-20, 370], // 3
	[62.5, 455], // 4
];
spawns[KIRBY] = [
	[-127.5, 105],
	[-40, 125], // 2
	[-5, 125], // 3
	[-85, 175], // 4
	[105, 170], // 5
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
	[-115.1, 10], // 3
	[124.9, 10], // 4
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
	[84.5, 132], // 3
	[-140, 5], // 4
];
spawns[SHEIK] = [
	[0, 0],
	[-90, 0], // 2
	[80, 0], // 3
];

/*
 * Mismatch exclusions by djwang88 (with consultation by chaos6)
 * Map is stage to character
 */
mismatchExclusions = [];

mismatchExclusions[MARIO] = [];
mismatchExclusions[MARIO][LUIGI] = [
	[[75, -100], [130, -80]],
];
mismatchExclusions[MARIO][DK] = [
	[[75, -100], [130, -70]],
	[[-150, 37.5], [-120, -57.5]],
];
mismatchExclusions[MARIO][GANONDORF] = [
	[[75, -100], [130, -90]],
];
mismatchExclusions[MARIO][ICECLIMBERS] = [
	[[75, -100], [85, -40], [130, -100]],
];

mismatchExclusions[BOWSER] = [];
mismatchExclusions[BOWSER][GANONDORF] = [
	[[225, 0], [250, 100]],
];

mismatchExclusions[PEACH] = [];
mismatchExclusions[PEACH][DRMARIO] = [ // MEDIUM
	[[-110, 130], [30, 150]],
	[[30, 130], [30, 150], [180, 150], [180, 75]],
];
mismatchExclusions[PEACH][BOWSER] = [
	[[-110, 130], [30, 150]],
	[[30, 130], [30, 150], [180, 150], [180, 75]],
];
mismatchExclusions[PEACH][DK] = [ // MEDIUM
	[[-110, 130], [30, 150]],
	[[30, 130], [30, 150], [180, 150], [180, 75]],
];
mismatchExclusions[PEACH][GANONDORF] = [
	[[35, 83], [50, 112]],
];
mismatchExclusions[PEACH][ICECLIMBERS] = [
	[[-110, 130], [30, 150]],
	[[30, 130], [30, 150], [180, 150], [180, 75]],
];

mismatchExclusions[YOSHI] = [];
mismatchExclusions[YOSHI][DRMARIO] = [ // MEDIUM
	[[-150, 150], [130, 170]],
	[[-85, 135], [-30, 165]],
];
mismatchExclusions[YOSHI][BOWSER] = [
	[[-150, 150], [130, 170]],
	[[-85, 135], [-30, 165]],
];
mismatchExclusions[YOSHI][DK] = [
	[[-150, 150], [130, 170]],
	[[-85, 135], [-30, 165]],
];
mismatchExclusions[YOSHI][ICECLIMBERS] = [
	[[-150, 150], [130, 170]],
	[[-85, 135], [-30, 165]],
];

mismatchExclusions[FALCO] = [];
mismatchExclusions[FALCO][BOWSER] = [
	[[-40, -70], [10, -55]],
];
mismatchExclusions[FALCO][DK] = [
	[[-40, -70], [10, -50]],
	[[10, -70], [60, -55]],
];
mismatchExclusions[FALCO][YOSHI] = [
	[[-40, -70], [10, -55]],
];
mismatchExclusions[FALCO][CFALCON] = [
	[[-40, -70], [10, -55]],
];

mismatchExclusions[FOX] = [];
mismatchExclusions[FOX][DRMARIO] = [
	[[-150, 117], [150, 150]],
];
mismatchExclusions[FOX][LUIGI] = [
	[[-150, -150], [-20, -140]],
	[[70, -150], [150, -140]],
];
mismatchExclusions[FOX][BOWSER] = [
	[[-150, 117], [150, 150]],
	[[-150, -150], [-20, -140]],
	[[70, -150], [150, -140]],
];
mismatchExclusions[FOX][DK] = [
	[[-150, 117], [150, 150]],
	[[-150, -150], [-20, -135]],
	[[70, -150], [150, -135]],
];
mismatchExclusions[FOX][CFALCON] = [
	[[-150, -150], [-20, -140]],
	[[70, -150], [150, -140]],
];
mismatchExclusions[FOX][ICECLIMBERS] = [ // hard to get top
	[[-150, 117], [150, 150]],
	[[-150, -150], [-20, -135]],
	[[70, -150], [125, -132]],
];

mismatchExclusions[NESS] = [];
mismatchExclusions[NESS][DRMARIO] = [
	[[-40, -120], [-30, -103]], // alcove
	[[-35, -140], [-25, -120]],
	[[-150, -140], [-60, -130]], // bottom-left
];
mismatchExclusions[NESS][LUIGI] = [
	[[-50, -120], [-28, -103]], // alcove
	[[-35, -140], [-10, -120]],
	[[-150, -140], [-60, -120]], // bottom-left
];
mismatchExclusions[NESS][BOWSER] = [
	[[-50, -120], [-28, -103]], // alcove
	[[-35, -140], [-10, -120]],
	[[-150, -140], [-60, -115]], // bottom-left
	[[-150, -140], [-90, -110]],
	[[-110, -140], [-90, -90]],
	[[50, -140], [70, -90]], // bottom-right
];
mismatchExclusions[NESS][YOSHI] = [
	[[-44, -140], [-28, -103]], // alcove
	[[-28, -140], [-20, -127]],
];
mismatchExclusions[NESS][DK] = [
	[[-50, -127], [-28, -103]], // alcove
	[[-35, -140], [-10, -127]],
	[[-150, -140], [-60, -100]], // bottom-left
];
mismatchExclusions[NESS][CFALCON] = [
	[[-50, -120], [-27, -105]], // alcove
	[[-35, -140], [-10, -120]],
	[[-150, -140], [-60, -120]], // bottom-left
];
mismatchExclusions[NESS][GANONDORF] = [
	[[-44, -120], [-26, -106]], // alcove
	[[-35, -140], [-10, -120]],
	[[-150, -140], [-60, -125]], // bottom-left
];
mismatchExclusions[NESS][FALCO] = [
	[[-50, -120], [-25, -102]], // alcove
	[[-35, -140], [-10, -120]],
];
mismatchExclusions[NESS][ICECLIMBERS] = [
	[[-50, -120], [-29, -104]], // alcove
	[[-35, -140], [-10, -120]],
	[[-140, -140], [-130, -115]], // bottom-left
	[[-110, -90], [-90, -90], [-90, -115]],
];
mismatchExclusions[NESS][MARTH] = [
	[[-35, -140], [-25, -122]], // alcove
];
mismatchExclusions[NESS][ROY] = [
	[[-38, -123], [-32, -103]], // alcove
	[[-35, -140], [-21, -123]],
];

mismatchExclusions[ZELDA] = [];
mismatchExclusions[ZELDA][LUIGI] = [
	[[68, -100], [85, -90]],
];
mismatchExclusions[ZELDA][BOWSER] = [ // DIFFICULT
	[[-130, 90], [115, 115]],
	[[-20, 70], [20, 95]],
	[[58, -100], [92, -90]],
];
mismatchExclusions[ZELDA][YOSHI] = [
	[[68, -100], [85, -90]],
];
mismatchExclusions[ZELDA][DK] = [
	[[-130, 90], [115, 115]],
	[[-20, 85], [20, 90]],
	[[68, -100], [85, -90]],
];
mismatchExclusions[ZELDA][CFALCON] = [
	[[62, -100], [89, -90]],
];
mismatchExclusions[ZELDA][GANONDORF] = [ // hard to get top-right
	[[-130, 75], [-110, 115]],
	[[68, -100], [85, -90]],
];
mismatchExclusions[ZELDA][FALCO] = [
	[[58, -100], [92, -90]],
];
mismatchExclusions[ZELDA][FOX] = [
	[[63, -100], [87, -90]],
]
mismatchExclusions[ZELDA][ICECLIMBERS] = [ // DIFFICULT
	[[-130, 90], [115, 115]],
	[[-40, 70], [40, 95]],
	[[-130, -100], [115, -95]],
];

mismatchExclusions[YLINK] = [];
mismatchExclusions[YLINK][DRMARIO] = [
	[[80, 50], [100, 100]], // cage (medium)
	[[-35, 133], [-25, 147]], // box
	[[-190, -40], [-155, 140]], // bottom-left
	[[95, -40], [120, 30]], // bottom-right
];
mismatchExclusions[YLINK][MARIO] = [
	[[80, 50], [100, 100]], // cage (medium)
	[[-35, 133], [-25, 147]], // box
	[[95, -40], [120, 30]], // bottom-right
];
mismatchExclusions[YLINK][LUIGI] = [
	[[80, 50], [100, 100]], // cage (medium)
	[[-37, 133], [-23, 147]], // box
	[[-93, -40], [-87, 95]], // pit
	[[-190, -40], [-155, 140]], // bottom-left
	[[50, -40], [120, 30]], // bottom-right
];
mismatchExclusions[YLINK][BOWSER] = [
	[[80, 50], [100, 100]], // cage (easy)
	[[-35, 133], [-25, 147]], // box
	[[-190, -40], [-155, 140]], // bottom-left
	[[40, -40], [120, 0]], // bottom-right
	[[60, 0], [120, 30]],
	[[-70, -40], [120, -25]],
];
mismatchExclusions[YLINK][PEACH] = [
	[[-41, 133], [-19, 148]], // box
];
mismatchExclusions[YLINK][YOSHI] = [
	[[80, 50], [100, 100]], // cage (medium)
	[[-37, 133], [-23, 147]], // box
	[[-93, -40], [-87, 70]], // pit
	[[-190, -40], [-155, 140]], // bottom-left
	[[95, -40], [120, 30]], // bottom-right
];
mismatchExclusions[YLINK][DK] = [
	[[87, 50], [100, 100]], // cage
	[[-31, 137], [-29, 143]], // box
	[[-190, -40], [-155, 140]], // bottom-left
	[[-70, -40], [120, -15]], // bottom-right
	[[95, -40], [120, 30]],
];
mismatchExclusions[YLINK][CFALCON] = [
	[[80, 50], [100, 100]], // cage (difficult)
	[[-40, 135], [-20, 145]], // box
	[[-190, -40], [-155, 140]], // bottom-left
	[[25, -40], [120, -15]], // bottom-right
	[[85, -40], [120, 30]],
	[[-70, -40], [120, -25]],
];
mismatchExclusions[YLINK][GANONDORF] = [
	[[80, 50], [100, 100]], // cage
	[[-40, 135], [-20, 145]], // box
	[[-95, -40], [-85, 85]], // pit
	[[-190, -40], [-155, 140]], // bottom-left
	[[-190, 190], [-120, 210]], // top-left
	[[75, -40], [120, 30]], // bottom-right
];
mismatchExclusions[YLINK][FALCO] = [
	[[80, 50], [100, 100]], // cage (difficult)
	[[-41, 133], [-19, 148]], // box
	[[60, -40], [120, 30]], // bottom-right
];
mismatchExclusions[YLINK][FOX] = [
	[[80, 50], [100, 100]], // cage (difficult)
	[[-41, 133], [-19, 148]], // box
	[[60, -40], [120, 30]], // bottom-right
];
mismatchExclusions[YLINK][NESS] = [
	[[80, 50], [100, 100]], // cage (difficult)
	[[-35, 133], [-25, 147]], // box
];
mismatchExclusions[YLINK][ICECLIMBERS] = [
	[[-40, 135], [-20, 145]], // box
	[[-95, -40], [-85, 65]], // pit
	[[-70, -40], [-60, -15]], // bottom-right
	[[-50, -20], [-40, -5]],
	[[-40, -40], [-40, 0], [-20, 0], [20, -40]],
	[[0, 5], [50, 5], [95, -40], [40, -40]],
	[[95, -40], [120, 30]],
];
mismatchExclusions[YLINK][KIRBY] = [
	[[85, 50], [100, 100]], // cage
	[[-35, 133], [-25, 147]], // box
];
mismatchExclusions[YLINK][SAMUS] = [
	[[-37, 133], [-23, 147]], // box
];
mismatchExclusions[YLINK][JIGGLYPUFF] = [
	[[80, 50], [100, 100]], // cage (difficult)
	[[-41, 133], [-19, 148]], // box
];
mismatchExclusions[YLINK][MRGAMEWATCH] = [
	[[90, 50], [100, 100]], // cage
	[[-31, 137], [-29, 143]], // box
	[[-190, -40], [-155, 140]], // bottom-left
	[[95, -40], [120, 30]], // bottom-right
];
mismatchExclusions[YLINK][MARTH] = [
	[[80, 50], [100, 100]], // cage (difficult)
	[[-190, -40], [-155, 140]], // bottom-left
	[[75, -40], [120, 30]], // bottom-right
];
mismatchExclusions[YLINK][ROY] = [
	[[80, 50], [100, 100]], // cage (difficult)
	[[-190, -40], [-155, 140]], // bottom-left
	[[75, -40], [120, 30]], // bottom-right
];

mismatchExclusions[PIKACHU] = [];
mismatchExclusions[PIKACHU][DRMARIO] = [
	[[60, -90], [125, -60]],
];
mismatchExclusions[PIKACHU][MARIO] = [
	[[60, -90], [125, -60]],
];
mismatchExclusions[PIKACHU][LUIGI] = [
	[[60, -90], [140, -60]],
	[[60, -90], [175, -75]],
];
mismatchExclusions[PIKACHU][BOWSER] = [
	[[60, -90], [150, -60]],
	[[60, -90], [175, -75]],
];
mismatchExclusions[PIKACHU][YOSHI] = [
	[[60, -90], [125, -60]],
];
mismatchExclusions[PIKACHU][DK] = [
	[[60, -90], [150, -60]],
	[[60, -90], [175, -55]],
];
mismatchExclusions[PIKACHU][CFALCON] = [
	[[60, -90], [145, -60]],
	[[60, -90], [175, -70]],
];
mismatchExclusions[PIKACHU][GANONDORF] = [
	[[60, -90], [135, -60]],
	[[-75, -90], [-60, -80]],
];
mismatchExclusions[PIKACHU][FALCO] = [
	[[60, -90], [145, -60]],
];
mismatchExclusions[PIKACHU][FOX] = [
	[[60, -90], [145, -60]],
];
mismatchExclusions[PIKACHU][ICECLIMBERS] = [
	[[60, -90], [160, -60]],
	[[60, -90], [175, -65]],
];
mismatchExclusions[PIKACHU][KIRBY] = [
	[[60, -90], [95, -60]],
];
mismatchExclusions[PIKACHU][SAMUS] = [
	[[60, -90], [140, -70]],
];
mismatchExclusions[PIKACHU][ZELDA] = [
	[[60, -90], [130, -60]],
];
mismatchExclusions[PIKACHU][MRGAMEWATCH] = [
	[[60, -90], [125, -60]],
];
mismatchExclusions[PIKACHU][MARTH] = [
	[[60, -90], [125, -60]],
];
mismatchExclusions[PIKACHU][ROY] = [
	[[60, -90], [125, -60]],
];

mismatchExclusions[JIGGLYPUFF] = [];
mismatchExclusions[JIGGLYPUFF][DRMARIO] = [ // 55%
	[[-150, -75], [5, -40]],
];
mismatchExclusions[JIGGLYPUFF][MARIO] = [ // 50%
	[[-150, -75], [-10, -40]],
];
mismatchExclusions[JIGGLYPUFF][LUIGI] = [ // 40%
	[[-150, -75], [-35, -40]],
];
mismatchExclusions[JIGGLYPUFF][BOWSER] = [ // 55%
	[[-150, -75], [5, -40]],
];
mismatchExclusions[JIGGLYPUFF][YOSHI] = [ // 50%
	[[-150, -75], [-10, -40]],
];
mismatchExclusions[JIGGLYPUFF][DK] = [ // 45%
	[[-150, -75], [-25, -40]],
];
mismatchExclusions[JIGGLYPUFF][CFALCON] = [ // 40%
	[[-150, -75], [-35, -40]],
];
mismatchExclusions[JIGGLYPUFF][GANONDORF] = [ // 50%
	[[-150, -75], [-10, -40]],
];
mismatchExclusions[JIGGLYPUFF][NESS] = [ // 35%
	[[-150, -75], [-50, -40]],
];
mismatchExclusions[JIGGLYPUFF][ICECLIMBERS] = [ // 45%
	[[-150, -75], [-25, -40]],
];
mismatchExclusions[JIGGLYPUFF][ZELDA] = [ // 35%
	[[-150, -75], [-50, -40]],
];
mismatchExclusions[JIGGLYPUFF][PICHU] = [ // 40% (but allow low targets)
	[[-150, -72], [-35, -40]],
];
mismatchExclusions[JIGGLYPUFF][MRGAMEWATCH] = [ // 40%
	[[-150, -75], [-35, -40]],
];
mismatchExclusions[JIGGLYPUFF][MARTH] = [ // 40%
	[[-150, -75], [-35, -40]],
];
mismatchExclusions[JIGGLYPUFF][ROY] = [ // 45%
	[[-150, -75], [-25, -40]],
];

mismatchExclusions[MEWTWO] = [];
mismatchExclusions[MEWTWO][BOWSER] = [
	[[0, -120], [130, -110]],
];
mismatchExclusions[MEWTWO][DK] = [
	[[0, -120], [130, -100]],
];

mismatchExclusions[ROY] = [];
mismatchExclusions[ROY][BOWSER] = [
	[[-155, 95], [-130, 140]],
];
mismatchExclusions[ROY][GANONDORF] = [
	[[-155, 100], [-110, 140]],
];

/*
 * Weights by djwang88 (with consultation by chaos6 and megaqwertification)
 */
weights = [];
weights[DRMARIO] = [
	[0.1, [95, 80], [150, 130]], 		// top-right
	[0.5, [70, -105], [150, -60]],		// bottom-right
	[0.1, [15, -140], [150, -105]],
	[0.2, [-145, -140], [-85, -105]],	// bottom-left
	[0.2, [-85, -140], [-45, -130]],
	[0.3, [-45, -140], [15, -120]],
];
weights[MARIO] = [
	[0.7, [-32, 115], [45, 150]],		// top-right
	[0.3, [45, 115], [80, 150]],
	[0.1, [80, 115], [130, 150]],
];
weights[BOWSER] = [
	[0.1, [150, 50], [250, 100]],		// top-right
	[0.3, [175, -5], [250, 50]],
	[0.7, [-110, 65], [-5, 100]],		// top-left
	[0.4, [130, -150], [250, -120]],	// bottom-right
	[0.3, [-110, -150], [-50, -120]], 	// bottom-left
];
weights[PEACH] = [
	[0.1, [-110, 85], [-45, 150]],		// top-left
	[0.5, [150, 130], [180, 150]],		// top-right
	[0.5, [150, 0], [180, 65]],			// middle-right
	//	[ 0.5, [150, 150], [150, 85],		// top-middle
	//		[30, 130], [-45, 130],
	//		[-45, 150] ],
	[0.3, [-110, -100], [-75, -55]],	// bottom-left
];
weights[YOSHI] = [
	[0.3, [-150, 120], [-120, 170]],	// top-left
	//	[ 0.5, [-30, 135], [55, 170] ],		// top-middle
	[0.3, [85, 88], [130, 170]],		// top-right
];
weights[DK] = [
	[0.1, [-190, 0], [-150, 30]],		// bottom-left
	[0.5, [-90, 190], [10, 225]],		// top-middle
	[0.1, [130, 160], [190, 225]],		// top-right
	// [ 0.3, [-80, -30], [-30, 0] ],		// bottom-middle
];
weights[CFALCON] = [
	[0.3, [-160, -130], [-130, -20]],	// bottom-left
	[0.3, [-40, 90], [30, 150]],		// top-middle
	[0.5, [-60, 70], [50, 150]],
];
weights[FALCO] = [
	[0.5, [-140, 90], [-70, 130]],		// top-left
	[0.1, [-40, -80], [100, -70]],		// bottom-right
	[0.1, [10, -70], [40, -30]],
];
weights[FOX] = [
	[0.3, [-85, 120], [85, 150]],		// top-middle
	[0.3, [85, 105], [150, 150]],		// top-right
	[0.3, [-150, 80], [-80, 150]],		// top-left
	[0.5, [-150, 10], [-120, 80]],		// middle-left
	[0.3, [-150, -150], [45, -120]],	// bottom
];
weights[NESS] = [
	[0.3, [-140, -140], [-10, -100]],	// bottom-left
	[0.2, [-35, 65], [0, 100]],			// top-middle
	[0.2, [50, -140], [150, -100]],		// bottom-right
];
weights[ICECLIMBERS] = [
	[0.1, [-120, 440], [-80, 500]],		// top-left
	[0.1, [80, 440], [120, 500]],		// top-right
];
weights[KIRBY] = [
	[0.1, [-150, 160], [-90, 180]],		// top-left
	[0.3, [10, 160], [50, 180]],		// top-middle
	[0.3, [80, -70], [130, -30]],		// bottom-right
];
weights[SAMUS] = [
	[0.5, [-130, 80], [-110, 150]], 	// top-left
	[0.5, [100, 110], [130, 150]],		// top-right
	[0.1, [20, -110], [50, -70]],		// bottom-right
];
weights[ZELDA] = [
	[0.3, [-130, 80], [115, 115]],		// top
	[0.1, [-130, -100], [-75, -45]],	// bottom-left
	[0.1, [-75, -100], [-40, -90]],
];
weights[LINK] = [
	[0.1, [-150, -100], [-90, -40]],	// bottom-left
	[0.5, [-150, -40], [-120, 70]],		// middle-left
	[0.5, [-150, 70], [-90, 100]],		// top-left
];
weights[YLINK] = [
	[0.3, [-190, -40], [-80, 25]],		// bottom-left
	[0.3, [-190, 170], [-140, 210]],	// top-left
	[0.5, [-190, 25], [-170, 130]],		// middle-left
];
weights[PICHU] = [
	[0.1, [-160, 88], [-120, 110]],		// top-left
	[0.3, [-160, -80], [-120, 22]],		// bottom-left
	[0.3, [-120, -80], [15, -60]],		// bottom-middle
	[0.8, [95, -80], [145, -20]],		// bottom-right
];
weights[PIKACHU] = [
	[0.05, [-130, -90], [-60, -60]],	// bottom-left
	[0.05, [60, -90], [155, -60]],		// bottom-right
	[0.8, [-130, 60], [-80, 115]],		// top-left
];
// weights[JIGGLYPUFF] = [
// 	[ 0.3, [-150, 70], [130, 90] ],		// top
// ];
weights[MEWTWO] = [
	[0.3, [-120, -120], [-60, -80]],	// bottom-left
	[0.8, [40, 58], [70, 100]],			// top-right
	[0.3, [70, 80], [130, 100]],
];
weights[ROY] = [
	[0.1, [-155, 115], [-85, 140]],		// top-left
	[0.3, [-155, 60], [-125, 115]],		// middle-left
	[0.05, [80, -30], [110, -10]],		// bottom-right
];

/*
 * Random exclusions
 */
randomExclusions = [];
randomExclusions[PEACH] = [0.35, [-110, 120], [-110, 150],		// top
	[180, 150], [180, 65], [150, 65], [150, 85],
	[30, 130], [17, 130], [17, 120]];
randomExclusions[YOSHI] = [0.25, [-150, 135], [130, 170]];		// top
randomExclusions[SAMUS] = [0.35, [-130, 60], [-130, 150],		// top
	[130, 150], [130, 110], [20, 110], [20, 140],
	[-20, 140], [-20, 110], [-70, 110], [-70, 60]];
randomExclusions[JIGGLYPUFF] = [0.35, [-150, 70], [130, 90]];	// top

/*
 * Top spawn indices
 */
topSpawn = [];
topSpawn[PEACH] = 3;
topSpawn[YOSHI] = 3;
topSpawn[SAMUS] = 2;
topSpawn[JIGGLYPUFF] = 3;