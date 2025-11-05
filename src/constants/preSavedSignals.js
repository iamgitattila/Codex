// Pre-saved emergency signals for Morse Blinker

export const PRE_SAVED_SIGNALS = [
  {
    signal_id: 'sos',
    name: 'SOS',
    morse: '... --- ...',
    english: 'Help needed',
    description: 'Universal distress signal',
    category: 'Emergency',
    wpm: 20,
    icon: '🆘'
  },
  {
    signal_id: 'allclear',
    name: 'ALL CLEAR',
    morse: '.- .-.. .-.. / -.-. .-.. . .- .-.',
    english: 'Situation stable',
    description: 'No danger present',
    category: 'Status',
    wpm: 20,
    icon: '✓'
  },
  {
    signal_id: 'needwater',
    name: 'NEED WATER',
    morse: '-. . . -.. / .-- .- - . .-.',
    english: 'Hydration emergency',
    description: 'Require water supply',
    category: 'Emergency',
    wpm: 20,
    icon: '💧'
  },
  {
    signal_id: 'underattack',
    name: 'UNDER ATTACK',
    morse: '..- -. -.. . .-. / .- - - .- -.-. -.-',
    english: 'Security threat',
    description: 'Active threat present',
    category: 'Emergency',
    wpm: 20,
    icon: '⚠️'
  },
  {
    signal_id: 'rallypoint',
    name: 'RALLY POINT ALPHA',
    morse: '.-. .- .-.. .-.. -.-- / .--. --- .. -. - / .- .-.. .--. .... .-',
    english: 'Meet at rally point',
    description: 'Rendezvous coordinates',
    category: 'Coordination',
    wpm: 20,
    icon: '📍'
  }
];

// Additional common signals that could be added in future versions
export const COMMON_SIGNALS = [
  {
    signal_id: 'help',
    name: 'HELP',
    morse: '.... . .-.. .--.',
    english: 'Need assistance',
    category: 'Emergency'
  },
  {
    signal_id: 'ok',
    name: 'OK',
    morse: '--- -.-',
    english: 'Acknowledged',
    category: 'Status'
  },
  {
    signal_id: 'yes',
    name: 'YES',
    morse: '-.-- . ...',
    english: 'Affirmative',
    category: 'Response'
  },
  {
    signal_id: 'no',
    name: 'NO',
    morse: '-. ---',
    english: 'Negative',
    category: 'Response'
  }
];
