const _ = require('fnk');
const { getTopicWeight } = require('./weight');


/* 
 * Given a dialogue tree, 
 * find the highest priority valid topic,
 * based on the input sentence.  
 * @param dialogue Iterator [name, topic]
 * @param sentence String
 * @return priorityTopic String
*/
const getPriorityTopic = (dialogue, sentence) => {

  const highestPriority = { 
    points: 0, 
    topic: null 
  };

  for (let [name, topic] of dialogue) {
    if (notUsedToPrioritize(name)) { continue; }
    if (failsPrerequisite(topic))  { continue; }

    const topicWeight = getTopicWeight(topic, name, sentence);

    // Note: If there is a tie, the one that is iterated over first wins.
    if (topicWeight > highestPriority.points) {
      highestPriority.points = topicWeight;
      highestPriority.topic  = topic;
    }
  }

  return highestPriority.topic;
};

/* Used to skip properties that have nothing to do with priority. */
const notUsedToPrioritize = prop => 
  _.has(['npc', 'player', 'prerequisite'], prop)

/*
  If the topic has some kind of prerequisite function that evaluates to truthy,
  the topic can be discussed.
*/
const failsPrerequisite = topic => 
  topic.prerequisite && !topic.prerequisite();

module.exports = { getPriorityTopic; }