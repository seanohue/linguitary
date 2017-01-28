const _ = require('fnk');

/* Returns a number of points, 
 * used to weight the relevance of each topic to user input.
 * @param topic { priority, keywords }
 * @param name String
 * @param sentence String
 * @return points Number
*/

const getTopicWeight = (topic, name, sentence) => {
  let points = 0;

  let { 
        priority, 
        keywords, 
      } = topic; 

  if (!topic.keywords) {
    throw new ReferenceError('You must supply keywords for ' + name + '.');
  }

  if (sentence.includes(name)) { points++; }

  points += foundEvery(keywords, sentence) ? 5 : 0;
  points += foundSome(keywords, sentence)  ? 2 : 0;
  points += foundEach(keywords, sentence);
  points += calculatePriority(priority);

  return points;
};

/* 
  Priority can be a function or a number. 
  Defaults to 0 if NaN
  */
const weightPriority = priority => 
  typeof priority === 'function' ?
    priority() :
    isNaN(priority) ? 
      0 : 
      priority;

/*
  If every word in the keywords.everyMatch array is found in the sentence, 
  returns true. Else, false.
  */
const foundEvery = (keywords, sentence) => 
  keywords.everyMatch ?
    _.toArray(keywords.everyMatch).every(str => sentence.includes(str)) :
    false;

/*
  If any of the words in keywords.someMatch are found in the sentence,
  returns true. Else, false.
  */
const foundSome = (keywords, sentence ) => 
  keywords.someMatch ?
    _.toArray(keywords.someMatch).some(str => sentence.includes(str)) :
    false;
/*
  For each match found in sentence, returns n+1.
  For example, if there are 3 words in findMatch, 
  and 1 is found once and the others are found twice,
  it will return 5.
  */
const foundEach = (keywords, sentence) => 
  keywords.findMatch ?
    _.toArray(keywords.findMatch).reduce(countMatch(sentence)) :
    0;

/* 
  Takes the sentence to match against in a closure,
  and returns a reducer function.
  */
const countMatch = sentence => 
  (sum, str) => sentence.includes(str) ? sum + 1 : 0;

module.exports = { getTopicWeight };