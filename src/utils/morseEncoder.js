// Morse Code Encoder
// Converts text to Morse code and generates timing patterns

const MORSE_MAP = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
};

/**
 * Convert text to Morse code
 * @param {string} text - Text to convert
 * @returns {string} Morse code representation
 */
export function textToMorse(text) {
  if (!text) return '';

  const upper = text.toUpperCase();
  const morse = upper
    .split('')
    .map(char => {
      if (char === ' ') return '/'; // Word separator
      return MORSE_MAP[char] || '';
    })
    .filter(m => m !== '') // Remove unmapped characters
    .join(' ');

  return morse;
}

/**
 * Convert Morse code to timing array for transmission
 * @param {string} morse - Morse code string (e.g., "... --- ...")
 * @param {number} wpm - Words per minute (default: 20)
 * @returns {Array} Array of timing events [{type: 'signal'|'pause', duration: ms}]
 */
export function morseToTiming(morse, wpm = 20) {
  // Standard: PARIS method (50 dots per word)
  // At 20 WPM: 20 words × 50 dots = 1000 dots per minute = 60ms per dot
  const dotDuration = Math.round(1200 / wpm); // milliseconds
  const dashDuration = dotDuration * 3;
  const elementSpacing = dotDuration; // Space between dots/dashes within a letter
  const letterSpacing = dotDuration * 3; // Space between letters
  const wordSpacing = dotDuration * 7; // Space between words

  const timing = [];
  const elements = morse.split(' ');

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (element === '/') {
      // Word separator (extra spacing)
      timing.push({ type: 'pause', duration: wordSpacing });
    } else {
      // Process letter (dots and dashes)
      for (let j = 0; j < element.length; j++) {
        const symbol = element[j];

        if (symbol === '.') {
          timing.push({ type: 'signal', duration: dotDuration, symbol: '·' });
        } else if (symbol === '-') {
          timing.push({ type: 'signal', duration: dashDuration, symbol: '−' });
        }

        // Add spacing between elements (dots/dashes) within a letter
        if (j < element.length - 1) {
          timing.push({ type: 'pause', duration: elementSpacing });
        }
      }

      // Add spacing between letters (but not after the last letter)
      if (i < elements.length - 1 && elements[i + 1] !== '/') {
        timing.push({ type: 'pause', duration: letterSpacing });
      }
    }
  }

  return timing;
}

/**
 * Calculate total duration of a Morse message
 * @param {string} morse - Morse code string
 * @param {number} wpm - Words per minute
 * @returns {number} Duration in seconds
 */
export function calculateDuration(morse, wpm = 20) {
  const timing = morseToTiming(morse, wpm);
  const totalMs = timing.reduce((sum, event) => sum + event.duration, 0);
  return Math.round(totalMs / 100) / 10; // Round to 1 decimal place
}

/**
 * Decode Morse code to text
 * @param {string} morse - Morse code string
 * @returns {string} Decoded text
 */
export function morseToText(morse) {
  // Create reverse mapping
  const reverseMorseMap = {};
  Object.keys(MORSE_MAP).forEach(key => {
    reverseMorseMap[MORSE_MAP[key]] = key;
  });

  const words = morse.split(' / ');
  const decodedWords = words.map(word => {
    const letters = word.split(' ');
    return letters
      .map(letter => reverseMorseMap[letter] || '')
      .join('');
  });

  return decodedWords.join(' ');
}

/**
 * Get a random Morse character for practice
 * @returns {object} {char, morse}
 */
export function getRandomMorseCharacter() {
  const chars = Object.keys(MORSE_MAP);
  const randomChar = chars[Math.floor(Math.random() * chars.length)];
  return {
    char: randomChar,
    morse: MORSE_MAP[randomChar]
  };
}

export { MORSE_MAP };
