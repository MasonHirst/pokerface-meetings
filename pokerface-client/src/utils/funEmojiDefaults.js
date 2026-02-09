export const DEFAULT_EMOJIS = ['⚽️', '👍', '🍅'];
export const DEFAULT_EXTRA_EMOJI = '❗️';

export const resolveFunLastEmoji = (lastEmoji) => {
  if (!lastEmoji || DEFAULT_EMOJIS.includes(lastEmoji)) {
    return DEFAULT_EXTRA_EMOJI;
  }
  return lastEmoji;
};
