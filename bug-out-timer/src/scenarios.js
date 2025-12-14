/**
 * Bug-Out Timer - Pre-loaded Evacuation Scenarios
 * All durations in seconds
 */

export const SCENARIOS = [
  {
    id: '5_min_immediate',
    name: 'Immediate Threat',
    duration: 300, // 5 minutes
    description: 'Someone breaking in - evacuate NOW',
    emoji: '🚨',
    urgency: 'critical',
    color: '#FF0000', // Red
    tasks: [
      {
        id: 1,
        title: 'Grab primary BOB',
        location: 'Bedroom closet',
        duration: 50,
        category: 'gear',
        details: 'Your main bug-out bag with 72-hour supplies'
      },
      {
        id: 2,
        title: 'Get BOV keys',
        location: 'Key hook',
        duration: 30,
        category: 'transportation',
        details: 'Bug-Out Vehicle keys and garage remote'
      },
      {
        id: 3,
        title: 'Lock all doors',
        location: 'Throughout house',
        duration: 60,
        category: 'security',
        details: 'Quickly secure front, back, and garage doors'
      },
      {
        id: 4,
        title: 'Text family "Evacuating"',
        location: 'Phone',
        duration: 30,
        category: 'communication',
        details: 'Quick message to all family members'
      },
      {
        id: 5,
        title: 'Leave immediately',
        location: 'Garage/front door',
        duration: 20,
        category: 'evacuation',
        details: 'Get to vehicle and start moving'
      },
      {
        id: 6,
        title: 'Call 911 from vehicle',
        location: 'While driving',
        duration: 60,
        category: 'communication',
        details: 'Report situation to authorities once safe'
      }
    ]
  },

  {
    id: '15_min_routine',
    name: 'Routine Drill',
    duration: 900, // 15 minutes
    description: 'Standard weekly evacuation drill - measure consistency',
    emoji: '📋',
    urgency: 'high',
    color: '#FF6600', // Orange
    tasks: [
      {
        id: 1,
        title: 'Notify all family members',
        location: 'TEXT + VERBAL',
        duration: 90,
        category: 'communication',
        details: 'Contact all family members and alert them to evacuate'
      },
      {
        id: 2,
        title: 'Grab primary BOB',
        location: 'Bedroom closet',
        duration: 90,
        category: 'gear',
        details: 'Your main bug-out bag with 72-hour supplies'
      },
      {
        id: 3,
        title: 'Grab backup BOB',
        location: 'Garage',
        duration: 90,
        category: 'gear',
        details: 'Secondary bag for spouse/partner'
      },
      {
        id: 4,
        title: 'Grab important documents',
        location: 'Home safe',
        duration: 120,
        category: 'documents',
        details: 'Birth certificates, passports, insurance papers, cash'
      },
      {
        id: 5,
        title: 'Shut off gas valve',
        location: 'Side of house',
        duration: 90,
        category: 'utilities',
        details: 'Turn main gas valve to OFF position (quarter turn)'
      },
      {
        id: 6,
        title: 'Kill electrical breaker',
        location: 'Garage/utility room',
        duration: 90,
        category: 'utilities',
        details: 'Flip main breaker to OFF to prevent electrical fires'
      },
      {
        id: 7,
        title: 'Lock all doors',
        location: 'Throughout house',
        duration: 90,
        category: 'security',
        details: 'Secure all entry points including windows'
      },
      {
        id: 8,
        title: 'Get vehicle keys',
        location: 'Key hook',
        duration: 30,
        category: 'transportation',
        details: 'BOV keys, garage remote, spare keys'
      },
      {
        id: 9,
        title: 'Load BOBs into vehicle',
        location: 'Garage',
        duration: 120,
        category: 'evacuation',
        details: 'Place all bags in vehicle trunk or back seat'
      },
      {
        id: 10,
        title: 'Leave property',
        location: 'Driveway',
        duration: 60,
        category: 'evacuation',
        details: 'Final check, start vehicle, depart to rally point'
      }
    ]
  },

  {
    id: '30_min_planned',
    name: 'Planned Evacuation',
    duration: 1800, // 30 minutes
    description: 'Fire/flood warning - time to gather essentials',
    emoji: '⚠️',
    urgency: 'medium',
    color: '#FFC107', // Yellow
    tasks: [
      {
        id: 1,
        title: 'Alert all family members',
        location: 'Phone + verbal',
        duration: 120,
        category: 'communication',
        details: 'Contact everyone, explain situation, assign roles'
      },
      {
        id: 2,
        title: 'Grab all BOBs',
        location: 'Closets/garage',
        duration: 150,
        category: 'gear',
        details: 'Primary, backup, and kids BOBs'
      },
      {
        id: 3,
        title: 'Get important documents',
        location: 'Home safe',
        duration: 180,
        category: 'documents',
        details: 'All IDs, deeds, insurance, medical records, cash'
      },
      {
        id: 4,
        title: 'Gather medications',
        location: 'Bathroom/kitchen',
        duration: 150,
        category: 'medical',
        details: 'Prescriptions, first aid, glasses, hearing aids'
      },
      {
        id: 5,
        title: 'Pack laptops/hard drives',
        location: 'Office',
        duration: 120,
        category: 'data',
        details: 'Computers, external drives, important digital data'
      },
      {
        id: 6,
        title: 'Grab family heirlooms',
        location: 'Throughout house',
        duration: 180,
        category: 'valuables',
        details: 'Photos, jewelry, irreplaceable items (top priority only)'
      },
      {
        id: 7,
        title: 'Load vehicle systematically',
        location: 'Garage',
        duration: 240,
        category: 'evacuation',
        details: 'Heavy items first, organize for access, secure load'
      },
      {
        id: 8,
        title: 'Shut off utilities',
        location: 'House exterior',
        duration: 150,
        category: 'utilities',
        details: 'Gas, water, electricity - all main valves/breakers'
      },
      {
        id: 9,
        title: 'Lock all doors and windows',
        location: 'Throughout house',
        duration: 120,
        category: 'security',
        details: 'Complete security check of all entry points'
      },
      {
        id: 10,
        title: 'Take photos of property',
        location: 'Exterior',
        duration: 90,
        category: 'documentation',
        details: 'Quick exterior photos for insurance claims'
      },
      {
        id: 11,
        title: 'Contact rally point',
        location: 'Phone',
        duration: 90,
        category: 'communication',
        details: 'Confirm destination, ETA, ask about conditions'
      },
      {
        id: 12,
        title: 'Depart to rally point',
        location: 'Driveway',
        duration: 60,
        category: 'evacuation',
        details: 'Final headcount, vehicle check, begin route'
      }
    ]
  },

  {
    id: '60_min_family',
    name: 'Family Bug-Out',
    duration: 3600, // 60 minutes
    description: 'Full family evacuation with kids and pets',
    emoji: '👨‍👩‍👧‍👦',
    urgency: 'medium',
    color: '#4CAF50', // Green
    tasks: [
      {
        id: 1,
        title: 'Family meeting - assign roles',
        location: 'Living room',
        duration: 300,
        category: 'communication',
        details: 'Explain situation, assign tasks to each family member'
      },
      {
        id: 2,
        title: 'Gather all BOBs',
        location: 'Throughout house',
        duration: 240,
        category: 'gear',
        details: 'Adult BOBs, kids BOBs, infant supplies'
      },
      {
        id: 3,
        title: 'Pack baby/toddler supplies',
        location: 'Nursery',
        duration: 300,
        category: 'childcare',
        details: 'Diapers, formula, bottles, favorite toys, clothes'
      },
      {
        id: 4,
        title: 'Secure pets and carriers',
        location: 'Throughout house',
        duration: 360,
        category: 'pets',
        details: 'Catch pets, carriers, food, meds, leashes, records'
      },
      {
        id: 5,
        title: 'Medications for everyone',
        location: 'Bathroom/kitchen',
        duration: 240,
        category: 'medical',
        details: 'All prescriptions, first aid, emergency meds'
      },
      {
        id: 6,
        title: 'Important documents',
        location: 'Home safe',
        duration: 240,
        category: 'documents',
        details: 'IDs, birth certificates, insurance, medical records'
      },
      {
        id: 7,
        title: 'Electronics and chargers',
        location: 'Throughout house',
        duration: 180,
        category: 'electronics',
        details: 'Phones, tablets, laptops, all chargers, power banks'
      },
      {
        id: 8,
        title: 'Food and water supplies',
        location: 'Kitchen/pantry',
        duration: 300,
        category: 'supplies',
        details: 'Non-perishables, bottled water, snacks for kids'
      },
      {
        id: 9,
        title: 'Notify extended family',
        location: 'Phone',
        duration: 180,
        category: 'communication',
        details: 'Call parents, siblings, close friends with plans'
      },
      {
        id: 10,
        title: 'Load vehicle methodically',
        location: 'Garage/driveway',
        duration: 420,
        category: 'evacuation',
        details: 'Heavy first, organize by access need, secure everything'
      },
      {
        id: 11,
        title: 'Install car seats properly',
        location: 'Vehicle',
        duration: 180,
        category: 'safety',
        details: 'Verify all child car seats are correctly installed'
      },
      {
        id: 12,
        title: 'Shut off all utilities',
        location: 'House exterior',
        duration: 180,
        category: 'utilities',
        details: 'Gas, water, electricity - document readings'
      },
      {
        id: 13,
        title: 'Secure house completely',
        location: 'Throughout house',
        duration: 240,
        category: 'security',
        details: 'Lock all doors, windows, garage, set alarm if available'
      },
      {
        id: 14,
        title: 'Final vehicle prep',
        location: 'Vehicle',
        duration: 180,
        category: 'transportation',
        details: 'Check fuel, tire pressure, emergency kit in vehicle'
      },
      {
        id: 15,
        title: 'Depart together',
        location: 'Driveway',
        duration: 120,
        category: 'evacuation',
        details: 'Headcount, confirm destination, begin route together'
      }
    ]
  },

  {
    id: '60_min_group',
    name: 'Group/MAG Bug-Out',
    duration: 3600, // 60 minutes
    description: 'Mutual Assistance Group coordination drill',
    emoji: '🤝',
    urgency: 'medium',
    color: '#2196F3', // Blue
    tasks: [
      {
        id: 1,
        title: 'Activate MAG comms',
        location: 'Radio/phone',
        duration: 240,
        category: 'communication',
        details: 'Contact all MAG members, verify status, assign roles'
      },
      {
        id: 2,
        title: 'Confirm rally point',
        location: 'Phone/radio',
        duration: 180,
        category: 'coordination',
        details: 'Verify primary or alternate rally point is accessible'
      },
      {
        id: 3,
        title: 'Gather family BOBs',
        location: 'Throughout house',
        duration: 300,
        category: 'gear',
        details: 'All family members BOBs and assigned MAG equipment'
      },
      {
        id: 4,
        title: 'Load MAG shared equipment',
        location: 'Garage',
        duration: 360,
        category: 'gear',
        details: 'Radios, medical kit, tools, supplies you\'re assigned'
      },
      {
        id: 5,
        title: 'Perform radio check',
        location: 'Vehicle',
        duration: 180,
        category: 'communication',
        details: 'Test all radios, confirm frequencies, check batteries'
      },
      {
        id: 6,
        title: 'Review rendezvous plan',
        location: 'Kitchen table',
        duration: 300,
        category: 'planning',
        details: 'Maps, routes, contingencies, timing, call signs'
      },
      {
        id: 7,
        title: 'Load weapons and ammo',
        location: 'Safe',
        duration: 300,
        category: 'security',
        details: 'Firearms, ammunition, cleaning kits (if applicable/legal)'
      },
      {
        id: 8,
        title: 'Pack group medical supplies',
        location: 'Medical cabinet',
        duration: 240,
        category: 'medical',
        details: 'Advanced first aid, trauma kit, prescriptions'
      },
      {
        id: 9,
        title: 'Coordinate convoy order',
        location: 'Phone',
        duration: 240,
        category: 'coordination',
        details: 'Determine vehicle order, spacing, communication protocol'
      },
      {
        id: 10,
        title: 'Load vehicle tactically',
        location: 'Garage',
        duration: 420,
        category: 'evacuation',
        details: 'Weapons accessible, comms ready, organize by priority'
      },
      {
        id: 11,
        title: 'Final MAG status check',
        location: 'Radio',
        duration: 300,
        category: 'communication',
        details: 'All members report status, ETA, any issues'
      },
      {
        id: 12,
        title: 'Depart to rendezvous',
        location: 'Driveway',
        duration: 180,
        category: 'evacuation',
        details: 'Begin route to rally point, maintain comms, travel safely'
      }
    ]
  }
];

/**
 * Get scenario by ID
 */
export const getScenarioById = (id) => {
  return SCENARIOS.find(scenario => scenario.id === id);
};

/**
 * Get all scenarios sorted by duration
 */
export const getScenariosSorted = () => {
  return [...SCENARIOS].sort((a, b) => a.duration - b.duration);
};

/**
 * Get scenario color by urgency
 */
export const getUrgencyColor = (urgency) => {
  const colors = {
    critical: '#FF0000',
    high: '#FF6600',
    medium: '#FFC107',
    low: '#4CAF50'
  };
  return colors[urgency] || '#2196F3';
};

export default SCENARIOS;
