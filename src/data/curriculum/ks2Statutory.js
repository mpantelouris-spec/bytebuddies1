/** Statutory KS2 computing (England) — Curriculum Bible codes */
export const KS2_STATUTORY = {
  'CS-1': 'Design, write and debug programs; decompose problems into smaller parts.',
  'CS-2': 'Use sequence, selection, repetition, variables, and forms of input and output.',
  'CS-3': 'Use logical reasoning to explain algorithms and detect and correct errors.',
  'IT-1': 'Understand computer networks, the internet, and opportunities for collaboration.',
  'IT-2': 'Use search technologies effectively and evaluate digital content discerningly.',
  'IT-3': 'Select and combine software to create content and handle data for given goals.',
  'DL-1': 'Use technology safely, respectfully, responsibly; report concerns about content or contact.',
};

export const KS2_TRACKS = {
  3: 'y3-cs-foundations',
  4: 'y4-cs-problem-solver',
  5: 'y5-cs-advanced',
  6: 'y6-cs-expert',
};

export const KS2_TERM_RANGES = {
  y3: [
    { term: 1, name: 'Autumn 1', focus: 'Safe computing, algorithms, first programs', color: '#10b981', range: [0, 5] },
    { term: 2, name: 'Autumn 2', focus: 'Loops, events, variables, decomposition', color: '#3b82f6', range: [6, 12] },
    { term: 3, name: 'Spring 1', focus: 'Data, search, online kindness', color: '#8b5cf6', range: [13, 19] },
    { term: 4, name: 'Spring 2', focus: 'Projects, animation, testing, networks', color: '#f59e0b', range: [20, 26] },
    { term: 5, name: 'Summer 1', focus: 'Selection, inputs, collaboration, simulation', color: '#ec4899', range: [27, 33] },
    { term: 6, name: 'Summer 2', focus: 'Capstone and showcase', color: '#6366f1', range: [34, 37] },
  ],
  y4: [
    { term: 1, name: 'Autumn 1', focus: 'Responsibility, pseudocode, studio shapes', color: '#10b981', range: [0, 5] },
    { term: 2, name: 'Autumn 2', focus: 'Events, collectors, game design', color: '#3b82f6', range: [6, 12] },
    { term: 3, name: 'Spring 1', focus: 'Data, search, digital footprint', color: '#8b5cf6', range: [13, 19] },
    { term: 4, name: 'Spring 2', focus: 'Media, sprites, testing, internet model', color: '#f59e0b', range: [20, 26] },
    { term: 5, name: 'Summer 1', focus: 'Selection, input, collaboration, efficiency', color: '#ec4899', range: [27, 33] },
    { term: 6, name: 'Summer 2', focus: 'Capstone game and showcase', color: '#6366f1', range: [34, 37] },
  ],
  y5: [
    { term: 1, name: 'Autumn 1', focus: 'Security, design docs, selection', color: '#10b981', range: [0, 5] },
    { term: 2, name: 'Autumn 2', focus: 'Loops, logic, modules', color: '#3b82f6', range: [6, 12] },
    { term: 3, name: 'Spring 1', focus: 'Databases, sources, cyber scenarios', color: '#8b5cf6', range: [13, 19] },
    { term: 4, name: 'Spring 2', focus: 'Media, iteration, user testing', color: '#f59e0b', range: [20, 26] },
    { term: 5, name: 'Summer 1', focus: 'Python intro, sensors, systems', color: '#ec4899', range: [27, 33] },
    { term: 6, name: 'Summer 2', focus: 'Capstone product launch', color: '#6366f1', range: [34, 37] },
  ],
  y6: [
    { term: 1, name: 'Autumn 1', focus: 'Citizenship, patterns, deep variables', color: '#10b981', range: [0, 5] },
    { term: 2, name: 'Autumn 2', focus: 'Spreadsheets, capstone planning, web project', color: '#3b82f6', range: [6, 12] },
    { term: 3, name: 'Spring 1', focus: 'Data analysis, AI literacy, ethics', color: '#8b5cf6', range: [13, 19] },
    { term: 4, name: 'Spring 2', focus: 'Media, UX, peer review, networks', color: '#f59e0b', range: [20, 26] },
    { term: 5, name: 'Summer 1', focus: 'Python functions, robotics, conditionals', color: '#ec4899', range: [27, 33] },
    { term: 6, name: 'Summer 2', focus: 'Complete system capstone', color: '#6366f1', range: [34, 37] },
  ],
};
