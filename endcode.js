/*
 * Generator and Gecko code developed by djwang88
 */

const code = "C21C4344 00000003\n2C0300XX 40820008\n38600001 3803FFFF\n60000000 00000000";

var resultBox = document.querySelector('#result');
var targetsBox = document.querySelector('#num-targets');

function generate() {
	var numTargets = parseInt(targetsBox.value);
	if (isNaN(numTargets) || numTargets < 1 || numTargets > 255) {
		resultBox.value = "Number of targets must be a number between 1 and 255."
		return;
	}

	var replacement = (numTargets + 1).toString(16).padStart(2, '0').toUpperCase();
	var result = code.replace("XX", replacement);
	resultBox.value = result;
}

function copy() {
	resultBox.select();
	document.execCommand('copy');
}