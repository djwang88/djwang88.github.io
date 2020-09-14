/*
 * Generator and Gecko code developed by djwang88
 */

const code = "041C427C 380000XX";

var resultBox = document.querySelector('#result');
var targetsBox = document.querySelector('#num-targets');

function generate() {
	var numTargets = parseInt(targetsBox.value);
	if (isNaN(numTargets) || numTargets < 1 || numTargets > 255) {
		resultBox.value = "Number of targets must be a number between 1 and 255."
		return;
	}

	var replacement = numTargets.toString(16).padStart(2, '0').toUpperCase();
	var result = code.replace("XX", replacement);
	resultBox.value = result;
}

function copy() {
	resultBox.select();
	document.execCommand('copy');
}