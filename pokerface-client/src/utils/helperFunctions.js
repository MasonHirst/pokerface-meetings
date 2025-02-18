import GraphemeSplitter from 'grapheme-splitter';
const splitter = GraphemeSplitter();

export function isTrueOrFalse(val) {
  return val === true || val === false;
}

export function getPowerLvlAsNumber(powerLvl) {
  if (powerLvl === 'owner') {
    return 1;
  } else if (powerLvl === 'high') {
    return 2;
  } else if (powerLvl === 'low') {
    return 3;
  } else {
    return 4;
  }
}

export function deriveCardsFromDeck(deck) {
  if (typeof deck !== 'string') {
    console.error('deriveCardsFromDeck helper function - deck input must be a string')
    return [];
  }
  //? I use a new Set because it automatically removes duplicates
  return [...new Set(deck?.split(','))]
    .filter((card) => card.trim().length > 0)
    .map((card) => {
      //? the splitter is needed to properly count emojis
      let length = splitter.splitGraphemes(card.trim()).length;
      //? cards must be between 1 and 30 character
      if (length <= 30 && length > 0) {
        return card.trim();
      }
    });
}
