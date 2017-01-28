'use strict';

const { Random } = require('rando-js');
const _          = require('fnk');
const wrap       = require('wrap-ansi');

const { 
        stripPunctuation, 
        tokenizeSentence 
      } = require('./utils');

const { getPriorityTopic } = require('./prioritize');


const handleInteraction = (config, sentence, broadcaster) => {
  const npc    = config.npc;
  const player = config.player;
  if (!npc || !player) {
    throw new ReferenceError('You must include an NPC and a Player in your dialogue config.');
  }
  const noop = () => {};
  broadcaster = broadcaster || noop;

  if (npc.isInDialogue()) {
    return player.say('<blue>' + npc.getShortDesc('en') + ' is speaking with someone already.</blue>');
  }

  const priorityTopic = getPriorityTopic(config, sentence);

  if (!priorityTopic) { return; }

  const dialogueHandler = getDialogueHandler(priorityTopic.dialogue.type);
  dialogueHandler(player, npc, priorityTopic);
  broadcaster({ thirdPartyMessage: '<blue>' + npc.getShortDesc('en') + ' is speaking with ' + player.getName() + '.</blue>' });

};

const getDialogueHandler = type => {
  switch(type) {
    case Types.SIMPLE:
      return simpleDialogueHandler;
    case Types.RANDOM:
      return randomDialogueHandler;
    case Types.TIMED:
      return timedDialogueHandler;
    default:
      throw new ReferenceError("Unsupported dialogue type.");
  }
};

const simpleDialogueHandler = (player, npc, topic) => {
  const spoken = topic.dialogue.say;
  const action = topic.dialogue.action;
  enactDialogue(player, spoken, action);
};

const randomDialogueHandler = (player, npc, topic) => {
  const choice = Random.fromArray(topic.dialogue.choices);
  const spoken = choice.say;
  const action = choice.action;
  enactDialogue(player, spoken, action);
};

const timedDialogueHandler = (player, npc, topic) => {
  npc.startDialogue();
  const sequence = topic.dialogue.sequence;
  if (!sequence) { throw new ReferenceError("You need a sequence to use timed dialogue."); }
  enactDialogueSequence(player, npc, sequence);
};

const enactDialogueSequence = (player, npc, sequence, index) => {
  if (player.getLocation() === npc.getLocation()) {
    index = index || 0;
    const interaction = sequence[index];
    if (!interaction) {
      return npc.endDialogue();
    }

    const spoken = interaction.say;
    const action = interaction.action;
    const delay  = interaction.delay || 1250;
    enactDialogue(player, spoken, action);
    setTimeout(() => enactDialogueSequence(player, npc, sequence, index + 1), delay);
  }
}

const enactDialogue = (player, spoken, action) => {
  if (spoken) { player.say(wrap('<yellow>' + spoken + '</yellow>', 70)); }
  if (action) { action(); }
};

//TODO: Consider extracting these enums/consts from the main dialogue script file.
const Priority = Object.freeze({
  'LOWEST':  1,
  'LOW':     2,
  'MEDIUM':  3,
  'HIGH':    4,
  'HIGHEST': 5
});

const Types = Object.freeze({
  'SIMPLE':    'simple',
  'RANDOM':    'random',
  'TIMED':     'timed',
  'SEQUENCED': 'sequenced'
});

exports.Dialogue = {
  /* Handlers */
  simpleDialogueHandler, randomDialogueHandler, timedDialogueHandler,

  /* Utilities and main handler */
  getPriorityTopic,      handleInteraction,

  /* Constants */
  Priority,              Keywords,              Types
};