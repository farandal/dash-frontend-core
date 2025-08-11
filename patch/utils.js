'use strict';

const stringReplaceAll = (string, substring, replacer) => {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

const MAX_STRING_LENGTH = 1000000; // 1 million chars, adjust as needed

const stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index) => {
	let endIndex = 0;
	let returnValue = '';
	let processedLength = 0;
	do {
		const gotCR = string[index - 1] === '\r';
		const segmentLength = (gotCR ? index - 1 : index) - endIndex;
		processedLength += segmentLength;
		if (processedLength > MAX_STRING_LENGTH) {
			// Prevent RangeError by truncating
			returnValue += string.substr(endIndex, MAX_STRING_LENGTH - (processedLength - segmentLength)) + '[truncated]';
			break;
		}
		returnValue += string.substr(endIndex, segmentLength) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

module.exports = {
	stringReplaceAll,
	stringEncaseCRLFWithFirstIndex
};
