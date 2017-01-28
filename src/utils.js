'use strict';

const stripPunctuation = sentence => sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
const tokenizeSentence = sentence => stripPunctuation(sentence).split(' ');

module.exports = { stripPunctuation, tokenizeSentence };