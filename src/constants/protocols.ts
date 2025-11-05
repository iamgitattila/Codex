export type UrgencyLevel = 'RED' | 'YELLOW' | 'GREEN';

export interface Step {
  step: number;
  action: string;
  duration?: string;
  details?: string;
  imageLocalPath?: string;
  imageUrl?: string;
}

export interface Material {
  name: string;
  quantity: number;
  unit?: string;
  sourceUrl?: string;
  estimatedCost?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface Protocol {
  id: string;
  title: string;
  description: string;
  urgencyLevel: UrgencyLevel;
  displayOrder: number;
  triageAssessment: string;
  steps: Step[];
  contraindications: string[];
  materialsRequired: Material[];
  videoMetadata?: {
    filename: string;
    duration: string;
    localPath?: string;
    remoteUrl?: string;
    sizeMb?: number;
  };
  warningSigns: string[];
  evacuationTrigger: string;
  myths: { myth: string; fact: string }[];
  quizQuestions: QuizQuestion[];
}

export const PROTOCOLS: Protocol[] = [
  {
    id: 'severe_bleeding',
    title: 'Severe Bleeding & Hemorrhage Control',
    description: 'Critical life-saving techniques for controlling severe bleeding',
    urgencyLevel: 'RED',
    displayOrder: 1,
    triageAssessment:
      'Bleeding that doesn\'t stop after 10 minutes of direct pressure, bright red spurting blood (arterial), or large volume blood loss',
    steps: [
      {
        step: 1,
        action: 'Apply direct pressure with clean cloth',
        duration: '10 minutes minimum',
        details:
          'Use clean cloth, gauze, or clothing. Press firmly WITHOUT LIFTING to check. Maintain constant pressure.',
      },
      {
        step: 2,
        action: 'Assess bleeding type',
        details:
          'Arterial (bright red, spurting) requires immediate tourniquet. Venous (dark red, flowing) may respond to pressure. Capillary (oozing) usually stops with pressure.',
      },
      {
        step: 3,
        action: 'Elevate injured area above heart',
        details: 'If possible, elevate the wounded area above the heart level to reduce blood flow.',
      },
      {
        step: 4,
        action: 'Pack wound if deep',
        details:
          'For deep wounds, pack with gauze or clean cloth deep into the wound cavity. Apply pressure on top.',
      },
      {
        step: 5,
        action: 'Apply tourniquet if bleeding continues',
        duration: 'Safe for 2+ hours',
        details:
          'Place 2-3 inches above wound on limb. Tighten until bleeding stops. Note time applied. DO NOT loosen.',
      },
      {
        step: 6,
        action: 'Monitor for shock symptoms',
        details: 'Watch for pale/clammy skin, rapid weak pulse, confusion, shallow breathing.',
      },
      {
        step: 7,
        action: 'Keep patient warm',
        details: 'Cover with blanket to prevent hypothermia from blood loss.',
      },
      {
        step: 8,
        action: 'Prepare for evacuation',
        details: 'If bleeding controlled, stabilize and prepare for medical evacuation.',
      },
    ],
    contraindications: [
      'Do NOT remove embedded objects - stabilize them in place',
      'Do NOT probe the wound with fingers or instruments',
      'Do NOT remove tourniquet once applied - note time and leave it',
      'Do NOT lift pressure dressing to check if bleeding stopped before 10 minutes',
      'Do NOT apply tourniquet over joints or directly on wound',
    ],
    materialsRequired: [
      { name: 'Gauze pads (4x4)', quantity: 20, unit: 'pieces', estimatedCost: 15 },
      { name: 'Combat gauze (hemostatic)', quantity: 2, unit: 'pieces', estimatedCost: 40 },
      { name: 'Tourniquets (CAT or SOFT-T)', quantity: 2, unit: 'pieces', estimatedCost: 60 },
      { name: 'Pressure bandages', quantity: 3, unit: 'pieces', estimatedCost: 25 },
      { name: 'Medical tape', quantity: 1, unit: 'roll', estimatedCost: 5 },
      { name: 'Nitrile gloves', quantity: 10, unit: 'pairs', estimatedCost: 10 },
    ],
    warningSigns: [
      'Continued bleeding after 20 minutes of pressure',
      'Pale, cold, clammy skin',
      'Rapid, weak pulse over 120 bpm',
      'Confusion or loss of consciousness',
      'Blue or white distal to tourniquet (expected)',
    ],
    evacuationTrigger:
      'If bleeding doesn\'t stop after tourniquet + pressure in 30 minutes, prepare immediate evacuation. Patient needs surgical intervention.',
    myths: [
      {
        myth: 'Tourniquets cut off all circulation and cause amputation',
        fact:
          'Modern tourniquets are safe for 2+ hours on limbs. Studies show limb salvage rate >90% even after prolonged application.',
      },
      {
        myth: 'Remove the tourniquet after bleeding stops',
        fact:
          'NEVER remove a tourniquet once applied. Only trained medical personnel should remove it in controlled setting.',
      },
      {
        myth: 'Ice will help stop bleeding',
        fact: 'Ice does NOT stop severe bleeding. It may slow capillary bleeding but use direct pressure first.',
      },
    ],
    quizQuestions: [
      {
        id: 'sb_q1',
        question: 'What is the maximum safe duration for a tourniquet on a limb?',
        options: ['30 minutes', '1 hour', '2+ hours', 'Never safe to use'],
        correctOption: 2,
        explanation:
          'Modern tourniquets are safe for 2+ hours. Older doctrine recommended removal after 30 minutes, but current evidence supports longer application.',
        difficulty: 'EASY',
      },
      {
        id: 'sb_q2',
        question: 'Where should you place a tourniquet?',
        options: [
          'Directly over the wound',
          '2-3 inches above the wound',
          'Below the wound',
          'Over a joint',
        ],
        correctOption: 1,
        explanation:
          'Place tourniquet 2-3 inches above wound on the limb, never over joints or directly on wound.',
        difficulty: 'EASY',
      },
      {
        id: 'sb_q3',
        question: 'How long should you maintain direct pressure before checking if bleeding stopped?',
        options: ['2 minutes', '5 minutes', '10 minutes', '20 minutes'],
        correctOption: 2,
        explanation:
          'Maintain pressure for minimum 10 minutes WITHOUT lifting to check. Lifting pressure restarts bleeding.',
        difficulty: 'MEDIUM',
      },
      {
        id: 'sb_q4',
        question: 'What color is arterial blood?',
        options: ['Dark red', 'Bright red', 'Brown', 'Pink'],
        correctOption: 1,
        explanation:
          'Arterial blood is bright red due to high oxygen content and typically spurts in rhythm with heartbeat.',
        difficulty: 'EASY',
      },
      {
        id: 'sb_q5',
        question: 'What should you do if an object is embedded in the wound?',
        options: ['Remove it immediately', 'Stabilize it in place', 'Push it deeper', 'Ignore it'],
        correctOption: 1,
        explanation:
          'NEVER remove embedded objects. Stabilize them in place as they may be plugging a blood vessel. Removal can cause catastrophic bleeding.',
        difficulty: 'MEDIUM',
      },
    ],
  },
  {
    id: 'cpr_airway',
    title: 'CPR & Airway Management',
    description: 'Life-saving cardiopulmonary resuscitation and airway techniques',
    urgencyLevel: 'RED',
    displayOrder: 2,
    triageAssessment: 'Person is unresponsive, not breathing normally, or has no detectable pulse',
    steps: [
      {
        step: 1,
        action: 'Check responsiveness',
        details: 'Tap shoulders firmly and shout "Are you OK?" Check for response.',
      },
      {
        step: 2,
        action: 'Call for help / activate emergency response',
        details: 'Alert others, send someone to get AED if available.',
      },
      {
        step: 3,
        action: 'Check breathing and pulse',
        duration: '10 seconds maximum',
        details: 'Look for chest rise, listen for breathing, feel for pulse on carotid artery.',
      },
      {
        step: 4,
        action: 'Position patient',
        details: 'Place on firm, flat surface on their back. Clear airway obstructions.',
      },
      {
        step: 5,
        action: 'Begin chest compressions',
        duration: '100-120 compressions per minute',
        details:
          'Place heel of one hand center of chest, other hand on top. Compress 2-2.4 inches deep. Allow full recoil between compressions.',
      },
      {
        step: 6,
        action: 'Provide rescue breaths',
        duration: '2 breaths after every 30 compressions',
        details: 'Tilt head back, lift chin, pinch nose. Give 2 breaths (1 second each) watching for chest rise.',
      },
      {
        step: 7,
        action: 'Continue CPR cycles',
        details: '30 compressions : 2 breaths. Continue until help arrives or patient recovers.',
      },
      {
        step: 8,
        action: 'Use AED if available',
        details: 'Attach pads, follow voice prompts. Continue CPR between shocks.',
      },
    ],
    contraindications: [
      'Do NOT perform CPR on someone with a pulse',
      'Do NOT stop compressions for more than 10 seconds',
      'Do NOT compress too shallow (less than 2 inches)',
      'Do NOT give compressions over stomach or lower ribs',
      'Do NOT tilt head back if neck injury suspected - use jaw thrust method',
    ],
    materialsRequired: [
      { name: 'CPR face shield/mask', quantity: 2, unit: 'pieces', estimatedCost: 15 },
      { name: 'AED (Automated External Defibrillator)', quantity: 1, unit: 'device', estimatedCost: 1200 },
      { name: 'Nitrile gloves', quantity: 10, unit: 'pairs', estimatedCost: 10 },
    ],
    warningSigns: [
      'No chest rise during rescue breaths (check airway)',
      'Ribs breaking/cracking (continue anyway - better than death)',
      'Vomiting during CPR (turn head to side, clear airway)',
      'Gasping breaths (not effective breathing - continue CPR)',
    ],
    evacuationTrigger:
      'Continue CPR until professional medical help arrives or person recovers pulse and breathing. If no response after 30 minutes in remote setting with no help coming, survival unlikely.',
    myths: [
      {
        myth: 'You can hurt someone by doing CPR wrong',
        fact:
          'If person has no pulse, they are clinically dead. CPR cannot make them worse. Any CPR is better than no CPR.',
      },
      {
        myth: 'Mouth-to-mouth is required',
        fact:
          'Hands-only CPR (compressions only) is nearly as effective for adults. If untrained or unwilling, do compressions only.',
      },
      {
        myth: 'Stop CPR once you start',
        fact: 'Continue CPR until help arrives, person recovers, or you are physically unable to continue.',
      },
    ],
    quizQuestions: [
      {
        id: 'cpr_q1',
        question: 'What is the correct compression rate for CPR?',
        options: ['60-80 per minute', '100-120 per minute', '150-180 per minute', '200+ per minute'],
        correctOption: 1,
        explanation:
          'Compress at 100-120 per minute (about 2 compressions per second). This is the rhythm of "Stayin\' Alive" by Bee Gees.',
        difficulty: 'EASY',
      },
      {
        id: 'cpr_q2',
        question: 'How deep should chest compressions be for an adult?',
        options: ['1 inch', '2-2.4 inches', '3-4 inches', 'As deep as possible'],
        correctOption: 1,
        explanation:
          'Compress 2-2.4 inches (5-6 cm) for adults. This depth is necessary to circulate blood effectively.',
        difficulty: 'EASY',
      },
      {
        id: 'cpr_q3',
        question: 'What is the compression to breath ratio for single-rescuer CPR?',
        options: ['15:2', '30:2', '5:1', '100:2'],
        correctOption: 1,
        explanation:
          '30 compressions followed by 2 rescue breaths. Continue this cycle until help arrives.',
        difficulty: 'MEDIUM',
      },
      {
        id: 'cpr_q4',
        question: 'If you are untrained or unable to give rescue breaths, what should you do?',
        options: [
          'Don\'t start CPR',
          'Only give compressions',
          'Wait for help',
          'Give mouth-to-mouth only',
        ],
        correctOption: 1,
        explanation:
          'Hands-only CPR (compressions only) is nearly as effective as conventional CPR for adults. Do continuous compressions.',
        difficulty: 'MEDIUM',
      },
      {
        id: 'cpr_q5',
        question: 'When should you stop CPR?',
        options: [
          'After 10 minutes',
          'When tired',
          'When help arrives or person recovers',
          'After 100 compressions',
        ],
        correctOption: 2,
        explanation:
          'Continue CPR until professional help arrives, the person recovers pulse/breathing, or you are physically unable to continue.',
        difficulty: 'EASY',
      },
    ],
  },
  {
    id: 'fractures',
    title: 'Fractures & Immobilization',
    description: 'Recognizing and stabilizing broken bones in emergency situations',
    urgencyLevel: 'YELLOW',
    displayOrder: 3,
    triageAssessment:
      'Severe pain, swelling, deformity, inability to use limb, bone visible through skin (open fracture)',
    steps: [
      {
        step: 1,
        action: 'Assess the injury',
        details: 'Check for deformity, swelling, pain, loss of function. Do NOT move injured area unnecessarily.',
      },
      {
        step: 2,
        action: 'Check circulation below injury',
        details: 'Check pulse, skin color, temperature, capillary refill. Note if sensation present.',
      },
      {
        step: 3,
        action: 'Immobilize in position found',
        details:
          'Do NOT attempt to realign bone unless circulation compromised. Splint in position found.',
      },
      {
        step: 4,
        action: 'Apply splint',
        details:
          'Use rigid material (boards, branches, rolled newspaper). Splint should immobilize joints above and below fracture.',
      },
      {
        step: 5,
        action: 'Pad the splint',
        details: 'Use cloth, clothing, or foam between splint and skin to prevent pressure sores.',
      },
      {
        step: 6,
        action: 'Secure splint',
        details:
          'Use bandages, cloth strips, or tape. Secure above and below fracture but NOT over fracture site.',
      },
      {
        step: 7,
        action: 'Re-check circulation',
        details: 'After splinting, recheck pulse, color, sensation. If circulation impaired, adjust splint.',
      },
      {
        step: 8,
        action: 'Elevate and ice',
        details: 'Elevate limb to reduce swelling. Apply ice (wrapped in cloth) for 20 min on, 20 min off.',
      },
    ],
    contraindications: [
      'Do NOT attempt to push protruding bones back in',
      'Do NOT realign fracture unless circulation completely absent',
      'Do NOT move patient if spinal fracture suspected',
      'Do NOT remove impaled objects',
      'Do NOT give food or water (may need surgery)',
    ],
    materialsRequired: [
      { name: 'SAM splint (moldable)', quantity: 2, unit: 'pieces', estimatedCost: 30 },
      { name: 'Elastic bandages', quantity: 4, unit: 'rolls', estimatedCost: 20 },
      { name: 'Triangle bandages (for slings)', quantity: 3, unit: 'pieces', estimatedCost: 10 },
      { name: 'Padding material', quantity: 1, unit: 'roll', estimatedCost: 15 },
      { name: 'Medical tape', quantity: 2, unit: 'rolls', estimatedCost: 10 },
    ],
    warningSigns: [
      'Loss of pulse or sensation below fracture',
      'Increasing pain despite immobilization',
      'Blue or white color below fracture',
      'Numbness or tingling',
      'Signs of compartment syndrome (severe pain, tight swollen limb)',
    ],
    evacuationTrigger:
      'Open fractures, suspected spine/neck injury, or loss of circulation require immediate evacuation. Simple closed fractures can wait for controlled evacuation.',
    myths: [
      {
        myth: 'You must realign a broken bone',
        fact:
          'Splint in position found unless circulation is completely absent. Attempting to realign can cause more damage.',
      },
      {
        myth: 'If you can move it, it\'s not broken',
        fact: 'You may be able to move a fractured bone. Deformity, swelling, and severe pain are better indicators.',
      },
      {
        myth: 'Apply heat to fractures',
        fact: 'Use ice (wrapped in cloth) for first 48 hours to reduce swelling and pain.',
      },
    ],
    quizQuestions: [
      {
        id: 'frac_q1',
        question: 'What is the main purpose of splinting a fracture?',
        options: ['Heal the bone', 'Prevent movement', 'Reduce pain', 'All of the above'],
        correctOption: 1,
        explanation:
          'Splinting immobilizes the injury to prevent further damage, reduce pain, and prevent complications.',
        difficulty: 'EASY',
      },
      {
        id: 'frac_q2',
        question: 'Which joints should a splint immobilize?',
        options: [
          'Only the injured joint',
          'Joint above and below fracture',
          'All joints in limb',
          'No joints needed',
        ],
        correctOption: 1,
        explanation:
          'Splint should immobilize the joints above and below the fracture to fully stabilize the broken bone.',
        difficulty: 'MEDIUM',
      },
      {
        id: 'frac_q3',
        question: 'What should you do if bone is protruding through the skin?',
        options: ['Push it back in', 'Cover with clean dressing and splint', 'Wash with water', 'Pull it out'],
        correctOption: 1,
        explanation:
          'Do NOT push bone back in. Cover with clean/sterile dressing, splint in position found, and evacuate immediately.',
        difficulty: 'MEDIUM',
      },
      {
        id: 'frac_q4',
        question: 'When should you attempt to realign a fracture?',
        options: [
          'Always realign',
          'Never realign',
          'Only if circulation completely absent',
          'Only if patient requests',
        ],
        correctOption: 2,
        explanation:
          'Only attempt gentle realignment if circulation is completely absent below fracture. Otherwise, splint in position found.',
        difficulty: 'HARD',
      },
      {
        id: 'frac_q5',
        question: 'What is compartment syndrome?',
        options: [
          'Broken bone in multiple pieces',
          'Dangerous pressure buildup in limb',
          'Bone infection',
          'Muscle tear',
        ],
        correctOption: 1,
        explanation:
          'Compartment syndrome is dangerous pressure buildup that cuts off blood flow. Signs: severe pain, tight swollen limb, numbness. Requires immediate evacuation.',
        difficulty: 'HARD',
      },
    ],
  },
  {
    id: 'burns',
    title: 'Burns (Minor to Severe)',
    description: 'Assessment and treatment of burn injuries by degree',
    urgencyLevel: 'YELLOW',
    displayOrder: 4,
    triageAssessment:
      'Redness, blistering, or charred skin from heat, chemicals, electricity, or radiation',
    steps: [
      {
        step: 1,
        action: 'Stop the burning process',
        details: 'Remove from heat source. Remove hot clothing (unless stuck to skin). Brush off dry chemicals.',
      },
      {
        step: 2,
        action: 'Cool the burn',
        duration: '10-20 minutes',
        details:
          'Run cool (not cold) water over burn. Do NOT use ice directly. For chemical burns, flush for 20+ minutes.',
      },
      {
        step: 3,
        action: 'Assess burn degree',
        details:
          '1st degree: red, painful (sunburn). 2nd degree: blisters, very painful. 3rd degree: white/black, may not hurt (nerve damage).',
      },
      {
        step: 4,
        action: 'Remove jewelry and tight clothing',
        details: 'Remove before swelling occurs. Do NOT remove clothing stuck to burn.',
      },
      {
        step: 5,
        action: 'Cover burn with clean dressing',
        details:
          'Use sterile non-stick dressing. Do NOT apply creams, ointments, or butter. Keep loosely covered.',
      },
      {
        step: 6,
        action: 'Manage pain',
        details: 'Elevate burned area. Cool compresses (not ice). OTC pain medication if available.',
      },
      {
        step: 7,
        action: 'Monitor for shock and infection',
        details:
          'Watch for signs of shock (pale, clammy, rapid pulse). Check for infection (increased pain, redness, pus, fever).',
      },
      {
        step: 8,
        action: 'Keep patient hydrated',
        details: 'Burns cause fluid loss. Encourage water/electrolyte drinks if conscious.',
      },
    ],
    contraindications: [
      'Do NOT apply ice directly to burns',
      'Do NOT break blisters intentionally',
      'Do NOT apply butter, oil, or ointments to fresh burns',
      'Do NOT remove clothing stuck to skin',
      'Do NOT use fluffy cotton on burns (fibers stick)',
    ],
    materialsRequired: [
      { name: 'Burn dressings (non-stick)', quantity: 10, unit: 'pieces', estimatedCost: 25 },
      { name: 'Sterile gauze pads', quantity: 20, unit: 'pieces', estimatedCost: 15 },
      { name: 'Burn gel packets', quantity: 10, unit: 'pieces', estimatedCost: 20 },
      { name: 'Medical tape', quantity: 2, unit: 'rolls', estimatedCost: 10 },
      { name: 'Pain medication (ibuprofen)', quantity: 1, unit: 'bottle', estimatedCost: 8 },
      { name: 'Antibiotic ointment', quantity: 2, unit: 'tubes', estimatedCost: 12 },
    ],
    warningSigns: [
      'Burns covering more than 10% of body',
      'Burns on face, hands, feet, genitals, or joints',
      'Electrical or chemical burns',
      'Difficulty breathing (airway burns)',
      'Signs of infection: increased redness, pus, fever, red streaks',
    ],
    evacuationTrigger:
      '3rd degree burns, burns >10% body surface, airway involvement, electrical/chemical burns, or signs of infection require immediate medical evacuation.',
    myths: [
      {
        myth: 'Apply butter or oil to burns',
        fact:
          'Butter/oil traps heat and increases damage. They also increase infection risk. Use only cool water and clean dressings.',
      },
      {
        myth: 'Pop burn blisters to drain them',
        fact:
          'Intact blisters provide sterile protection. Popping them increases infection risk dramatically.',
      },
      {
        myth: 'Use ice on burns',
        fact:
          'Ice can cause frostbite and further tissue damage. Use cool (not cold) running water.',
      },
    ],
    quizQuestions: [
      {
        id: 'burn_q1',
        question: 'How long should you cool a burn with water?',
        options: ['2-5 minutes', '10-20 minutes', '30-60 minutes', 'Until help arrives'],
        correctOption: 1,
        explanation:
          'Cool burn with running cool water for 10-20 minutes. This stops burning process and reduces damage.',
        difficulty: 'EASY',
      },
      {
        id: 'burn_q2',
        question: 'Which degree burn is characterized by blisters?',
        options: ['1st degree', '2nd degree', '3rd degree', '4th degree'],
        correctOption: 1,
        explanation:
          '2nd degree burns cause blisters and are very painful. 1st degree is red/painful. 3rd degree is white/black with less pain.',
        difficulty: 'EASY',
      },
      {
        id: 'burn_q3',
        question: 'Why might a 3rd degree burn hurt less than a 2nd degree burn?',
        options: [
          'It\'s not as serious',
          'Nerve endings are destroyed',
          'Body releases painkillers',
          'Skin is numb from cold',
        ],
        correctOption: 1,
        explanation:
          '3rd degree burns destroy nerve endings, so there may be less pain despite being more serious.',
        difficulty: 'MEDIUM',
      },
      {
        id: 'burn_q4',
        question: 'What should you do with clothing stuck to a burn?',
        options: ['Pull it off quickly', 'Soak and remove gently', 'Leave it in place', 'Cut around it'],
        correctOption: 2,
        explanation:
          'Do NOT remove clothing stuck to burn. Leave it in place and cover with clean dressing. Removal causes more damage.',
        difficulty: 'MEDIUM',
      },
      {
        id: 'burn_q5',
        question: 'What is the "rule of nines" for burns?',
        options: [
          'How long to cool burn',
          'Estimating body surface area burned',
          'Number of dressings needed',
          'Days until healed',
        ],
        correctOption: 1,
        explanation:
          'Rule of nines estimates burn area: head 9%, each arm 9%, chest/back 18% each, each leg 18%, groin 1%.',
        difficulty: 'HARD',
      },
    ],
  },
];

export const URGENCY_COLORS = {
  RED: '#D32F2F',
  YELLOW: '#F57C00',
  GREEN: '#388E3C',
};

export const URGENCY_LABELS = {
  RED: 'CRITICAL',
  YELLOW: 'IMPORTANT',
  GREEN: 'REFERENCE',
};
