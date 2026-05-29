/**
 * Generates fun, lesson-specific interactive tasks at runtime (no JSON bloat).
 * Activities are tailored to be age-appropriate for each year group.
 */

import { getChallengeForLesson } from './lessonChallenges.js';

const BLOCK_CATEGORIES = new Set([
  'y3-block-coding', 'y3-storytelling', 'y3-music', 'y3-math', 'y3-animals', 'y3-sports',
  'y4-game-dev', 'y4-variables', 'y4-conditionals', 'y4-game-design',
]);
const PYTHON_CATEGORIES = /^y(5-python|6-python|5-ml|6-ai|5-algorithms|6-algorithms|6-competitive)/;
const HTML_CATEGORIES = /-(web|web-pro)$/;

function getYearGroup(courseId) {
  if (courseId.startsWith('y3-')) return 3;
  if (courseId.startsWith('y4-')) return 4;
  if (courseId.startsWith('y5-')) return 5;
  if (courseId.startsWith('y6-')) return 6;
  return 4;
}

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick(seed, arr, n = 1) {
  const out = [];
  const copy = [...arr];
  let s = seed;
  for (let i = 0; i < n && copy.length; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const idx = s % copy.length;
    out.push(copy.splice(idx, 1)[0]);
  }
  return n === 1 ? out[0] : out;
}

function shuffle(seed, arr) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Category-specific concept pools (one unique pool per course category) ──
// Each concept: { def, emoji, fill } — fill is a cloze sentence with **key** for the blank

const CATEGORY_CONCEPTS = {
  /* ── Year 3 ── */
  'y3-block-coding': {
    sequence:  { def: 'Doing steps one at a time, like following a recipe!', emoji: '📋', fill: 'A **sequence** means doing instructions one after another, in order.' },
    loop:      { def: 'Repeating the same action many times without writing it again.', emoji: '🔄', fill: 'A **loop** block makes your code repeat the same action many times.' },
    event:     { def: 'Something that starts your code — like clicking the green flag!', emoji: '🚩', fill: 'An **event** is what triggers your code to start running.' },
    sprite:    { def: 'A character or picture you can move around the screen.', emoji: '😺', fill: 'A **sprite** is the character or picture you move in Scratch.' },
    block:     { def: 'A coloured puzzle piece that gives the computer one instruction.', emoji: '🧩', fill: 'Each **block** in Scratch gives the computer one instruction to follow.' },
    algorithm: { def: 'A step-by-step plan that tells the computer exactly what to do.', emoji: '📝', fill: 'An **algorithm** is a step-by-step plan for solving a problem.' },
    debug:     { def: 'Finding the mistake in your code and fixing it.', emoji: '🐛', fill: 'To **debug** means to find and fix mistakes in your code.' },
    command:   { def: 'An instruction you give to the computer, like "move 10 steps".', emoji: '💬', fill: 'A **command** is an instruction that tells the computer what to do.' },
    output:    { def: 'What the computer shows or does when you run your code.', emoji: '📺', fill: 'The **output** is what the computer shows when your program runs.' },
    flag:      { def: 'Clicking the green flag starts your Scratch program!', emoji: '🟢', fill: 'Clicking the green **flag** starts your Scratch program running.' },
  },
  'y3-pixel-art': {
    pixel:     { def: 'A tiny square of colour — lots of them make up a picture!', emoji: '🟦', fill: 'A **pixel** is a tiny square of colour on a screen.' },
    grid:      { def: 'A pattern of squares arranged in rows and columns.', emoji: '⬛', fill: 'A **grid** is a pattern of squares arranged in rows and columns.' },
    colour:    { def: 'The shade or hue you choose to paint your pixels.', emoji: '🎨', fill: 'The **colour** of a pixel is the shade you choose to paint it.' },
    pattern:   { def: 'A design that repeats — like a checkerboard!', emoji: '♟️', fill: 'A **pattern** is a design that repeats in a regular way.' },
    symmetry:  { def: 'When both halves of a picture look like mirror images.', emoji: '🪞', fill: '**Symmetry** is when both halves of a picture look the same.' },
    canvas:    { def: 'The blank area where you draw your pixel art.', emoji: '🖼️', fill: 'The **canvas** is the blank area where you create your artwork.' },
    palette:   { def: 'The set of colours you have chosen to use in your art.', emoji: '🖌️', fill: 'The colour **palette** holds all the colours you can use.' },
    animation: { def: 'Switching between pictures quickly to make something move.', emoji: '🎞️', fill: '**Animation** switches pictures quickly to create movement.' },
    resolution:{ def: 'How many pixels wide and tall your image is — more = sharper!', emoji: '🔍', fill: 'The **resolution** of an image is how many pixels wide and tall it is.' },
    layer:     { def: 'A level in your artwork — like sheets of clear paper stacked up.', emoji: '📚', fill: 'A **layer** in pixel art is like a separate sheet you can draw on independently.' },
  },
  'y3-storytelling': {
    character: { def: 'The person or creature in your story — shown as a Scratch sprite!', emoji: '🦸', fill: 'A **character** is the person or creature your story is about.' },
    setting:   { def: 'Where and when your story takes place — shown by the backdrop.', emoji: '🏰', fill: 'The **setting** is where and when your story takes place.' },
    scene:     { def: 'One part of your story, like a chapter in a book.', emoji: '🎬', fill: 'A **scene** is one section of your story.' },
    dialogue:  { def: 'The words your characters say — shown in speech bubbles.', emoji: '💬', fill: '**Dialogue** is the words characters say to each other in a story.' },
    backdrop:  { def: 'The background picture showing where your story is happening.', emoji: '🖼️', fill: 'The **backdrop** is the background that shows where your story takes place.' },
    animation: { def: 'Making your sprite move and change to bring it to life.', emoji: '✨', fill: '**Animation** makes your sprites move and look alive on screen.' },
    plot:      { def: 'What happens in your story — the events from start to finish.', emoji: '📖', fill: 'The **plot** is all the events that happen from the start to the end.' },
    emotion:   { def: 'Showing how a character feels — happy, scared, or excited!', emoji: '😊', fill: 'An **emotion** shows how a character feels — happy, scared, or excited.' },
    sequence:  { def: 'Telling events in the right order — beginning, middle, end.', emoji: '1️⃣', fill: 'Good stories follow a **sequence** — beginning, middle, and end.' },
    costume:   { def: 'A different look for your sprite — useful for showing emotions!', emoji: '👗', fill: 'Changing a sprite\'s **costume** can show different emotions or poses.' },
  },
  'y3-music': {
    note:      { def: 'A single musical sound with a pitch and a length.', emoji: '🎵', fill: 'A musical **note** has both a pitch and a length.' },
    beat:      { def: 'The steady pulse in music — like a heartbeat you tap along to.', emoji: '🥁', fill: 'The **beat** is the steady pulse that keeps music in time.' },
    rhythm:    { def: 'The pattern of long and short sounds in music.', emoji: '🎶', fill: 'The **rhythm** is the pattern of long and short sounds in a piece of music.' },
    tempo:     { def: 'How fast or slow a piece of music is played.', emoji: '⏱️', fill: 'The **tempo** of music is how fast or slow it is played.' },
    melody:    { def: 'A tune — a sequence of notes that sounds like a song.', emoji: '🎼', fill: 'A **melody** is a sequence of notes that forms a recognisable tune.' },
    instrument:{ def: 'Something that makes music — like a drum, guitar, or piano.', emoji: '🎹', fill: 'An **instrument** is used to make musical sounds, like a piano or drum.' },
    loop:      { def: 'Playing the same music pattern over and over again.', emoji: '🔄', fill: 'A music **loop** plays the same pattern of sounds over and over.' },
    volume:    { def: 'How loud or quiet a sound is.', emoji: '🔊', fill: 'The **volume** of a sound controls how loud or quiet it is.' },
    pitch:     { def: 'How high or low a note sounds — a whistle is high, a drum is low.', emoji: '📈', fill: 'The **pitch** of a note determines how high or low it sounds.' },
    compose:   { def: 'Creating your own piece of music by putting notes together.', emoji: '🎤', fill: 'To **compose** music means to create your own piece by combining notes.' },
  },
  'y3-math': {
    number:    { def: 'A value used for counting or measuring things.', emoji: '🔢', fill: 'A **number** is a value we use to count or measure things.' },
    pattern:   { def: 'A sequence that repeats in a regular way — like 2, 4, 6, 8.', emoji: '🔁', fill: 'A **pattern** is a sequence that repeats in a predictable way.' },
    angle:     { def: 'The amount of turn between two lines that meet at a point.', emoji: '📐', fill: 'An **angle** measures how much two lines turn away from each other.' },
    coordinate:{ def: 'A pair of numbers (x, y) that gives a position on a grid.', emoji: '📍', fill: 'A **coordinate** is a pair of numbers that locates a point on a grid.' },
    calculate: { def: 'Working out an answer using maths — add, subtract, multiply.', emoji: '🧮', fill: 'To **calculate** means to work out a maths answer.' },
    shape:     { def: 'A closed outline — like a square, circle, or triangle.', emoji: '🔷', fill: 'A **shape** has edges and corners — like a square or triangle.' },
    estimate:  { def: 'Making a sensible guess without calculating exactly.', emoji: '🤔', fill: 'To **estimate** means to make a sensible guess about a number.' },
    variable:  { def: 'A named store for a number that can change — like score.', emoji: '📦', fill: 'A **variable** stores a number that can change as the program runs.' },
    symmetry:  { def: 'When a shape looks the same on both sides of a line.', emoji: '🪞', fill: 'A shape has **symmetry** when both sides are mirror images.' },
    sequence:  { def: 'A list of numbers arranged in a special order.', emoji: '📋', fill: 'A number **sequence** is a list of numbers arranged in a special order.' },
  },
  'y3-animals': {
    sprite:    { def: 'The animal character you control on the screen.', emoji: '🐱', fill: 'The animal **sprite** is the character you control on the screen.' },
    habitat:   { def: 'The natural home where an animal lives — forest, ocean, desert.', emoji: '🌿', fill: 'An animal\'s **habitat** is its natural home in the wild.' },
    movement:  { def: 'The way an animal moves — flying, swimming, or hopping!', emoji: '🐾', fill: 'The **movement** of an animal can be flying, swimming, or hopping.' },
    costume:   { def: 'Different pictures for your sprite — like different animal poses.', emoji: '👗', fill: 'A sprite\'s **costume** shows a different pose or look.' },
    animation: { def: 'Switching costumes quickly to make the animal look like it moves.', emoji: '🎞️', fill: '**Animation** switches costumes quickly to make movement look real.' },
    sound:     { def: 'The noise your animal makes — a roar, bark, or tweet!', emoji: '🔊', fill: 'The **sound** a sprite plays can be a roar, bark, or any animal noise.' },
    loop:      { def: 'Making your animal repeat an action — like flapping wings forever.', emoji: '🔄', fill: 'A **loop** makes the animal repeat an action again and again.' },
    event:     { def: 'Something that triggers the animal to react — like clicking it.', emoji: '🖱️', fill: 'An **event** triggers the animal to react, like being clicked.' },
    backdrop:  { def: 'The background scene that shows where the animal lives.', emoji: '🌅', fill: 'The **backdrop** is the scene that shows the animal\'s habitat.' },
    behaviour: { def: 'What the animal does — the actions in its script.', emoji: '📋', fill: 'An animal\'s **behaviour** is all the things it does, controlled by code.' },
  },
  'y3-sports': {
    score:     { def: 'A number that goes up each time you succeed in the game.', emoji: '🏆', fill: 'The **score** goes up each time the player does something right.' },
    timer:     { def: 'Counting down seconds to set a time limit for the game.', emoji: '⏱️', fill: 'A **timer** counts down the seconds left in the game.' },
    player:    { def: 'The sprite that the user controls to play the game.', emoji: '🕹️', fill: 'The **player** sprite is controlled by the person playing the game.' },
    collision: { def: 'When two sprites touch each other on the screen.', emoji: '💥', fill: 'A **collision** happens when two sprites touch each other.' },
    speed:     { def: 'How fast the player or ball moves across the screen.', emoji: '⚡', fill: 'The **speed** of a sprite controls how fast it moves.' },
    goal:      { def: 'What the player needs to achieve to win the game.', emoji: '⚽', fill: 'The **goal** is what the player must achieve to win.' },
    level:     { def: 'A stage in the game — gets harder as the player scores more.', emoji: '📈', fill: 'Each **level** is a stage that gets harder as the player progresses.' },
    loop:      { def: 'The forever block that keeps the game running non-stop.', emoji: '🔄', fill: 'The forever **loop** keeps the game running and checking for events.' },
    event:     { def: 'Something that makes things happen — like pressing the spacebar.', emoji: '🚩', fill: 'An **event** like pressing spacebar makes the player jump or shoot.' },
    restart:   { def: 'Sending the game back to the beginning to play again.', emoji: '🔁', fill: 'A **restart** sends the game back to the beginning so you can play again.' },
  },
  /* ── Year 4 ── */
  'y4-game-dev': {
    variable:   { def: 'A named box that stores a value — like score, lives, or speed.', emoji: '📦', fill: 'A **variable** stores a value that can change, like the player\'s score.' },
    score:      { def: 'A variable that tracks how well the player is doing.', emoji: '🏆', fill: 'The **score** is a variable that increases when the player succeeds.' },
    lives:      { def: 'How many chances the player has before the game ends.', emoji: '❤️', fill: 'The **lives** variable tracks how many chances the player has left.' },
    collision:  { def: 'Detecting when two sprites overlap — used to lose lives or score.', emoji: '💥', fill: 'A **collision** is detected when two sprites touch or overlap.' },
    'game loop': { def: 'The forever block that keeps checking and updating the game.', emoji: '🔄', fill: 'The **game loop** runs forever to keep the game updating every frame.' },
    conditional:{ def: 'An if-block that decides what happens based on what is true.', emoji: '🔀', fill: 'A **conditional** uses if-blocks to make different things happen.' },
    broadcast:  { def: 'Sending a message to other sprites to trigger their scripts.', emoji: '📡', fill: 'A **broadcast** sends a message that other sprites can react to.' },
    timer:      { def: 'A variable counting down the seconds left in a level.', emoji: '⏱️', fill: 'A **timer** variable counts down the seconds left in a round.' },
    level:      { def: 'A stage of the game — each level is harder than the last.', emoji: '📈', fill: 'Each **level** increases the challenge for the player.' },
    restart:    { def: 'Resetting all variables and sprites to start the game again.', emoji: '🔁', fill: 'A **restart** resets all variables and sprites to their starting values.' },
  },
  'y4-variables': {
    variable:   { def: 'A named container that holds a value which can change.', emoji: '📦', fill: 'A **variable** is a named container that holds a value.' },
    integer:    { def: 'A whole number stored in a variable, like 0, 5, or -3.', emoji: '🔢', fill: 'An **integer** is a whole number with no decimal point.' },
    string:     { def: 'Text stored in a variable, shown with "quote marks".', emoji: '📝', fill: 'A **string** stores text and is shown inside "quote marks".' },
    assign:     { def: 'Giving a variable a starting value — like setting score to 0.', emoji: '=', fill: 'To **assign** a variable means to give it a value, like setting score to 0.' },
    change:     { def: 'Adding or subtracting from a variable — "change score by 1".', emoji: '✏️', fill: 'To **change** a variable means to add or subtract from its current value.' },
    input:      { def: 'Information typed by the user and stored in a variable.', emoji: '⌨️', fill: '**Input** is information typed by the user and stored in a variable.' },
    output:     { def: 'Showing the value of a variable — using "say" or print.', emoji: '📺', fill: '**Output** is what the program shows — like the value of a variable.' },
    counter:    { def: 'A variable that increases by 1 each time something happens.', emoji: '🔢', fill: 'A **counter** is a variable that goes up by 1 each time an event happens.' },
    'data type': { def: 'What kind of value a variable stores — number, text, or true/false.', emoji: '📋', fill: 'A **data type** describes what kind of value a variable holds.' },
    scope:      { def: 'Where a variable can be used — for all sprites or just one.', emoji: '📌', fill: 'The **scope** of a variable decides which sprites can use it.' },
  },
  'y4-conditionals': {
    conditional:{ def: 'Code that runs ONLY when a condition is true — an IF block.', emoji: '🔀', fill: 'A **conditional** runs code only when a specific condition is true.' },
    'if-else':  { def: 'Choosing between two actions depending on whether a condition is true.', emoji: '↔️', fill: 'An **if-else** block chooses between two different actions.' },
    condition:  { def: 'A test that is either true or false — like "score > 5".', emoji: '❓', fill: 'A **condition** is a test that is either true or false.' },
    boolean:    { def: 'A value that is exactly true or false — nothing in between.', emoji: '⚖️', fill: 'A **boolean** value is always either true or false.' },
    operator:   { def: 'A comparison symbol like = (equal), > (greater), or < (less).', emoji: '🔣', fill: 'An **operator** compares two values — like = (equal) or > (greater than).' },
    'nested if': { def: 'An if-block inside another if-block — for more complex decisions.', emoji: '🪆', fill: 'A **nested if** puts one if-block inside another for complex decisions.' },
    'AND':      { def: 'Both conditions must be true for the whole thing to be true.', emoji: '🤝', fill: 'The **AND** operator means both conditions must be true.' },
    'OR':       { def: 'At least one condition must be true for the result to be true.', emoji: '🔓', fill: 'The **OR** operator means at least one condition must be true.' },
    branch:     { def: 'A different path through the code depending on the condition.', emoji: '🌿', fill: 'A **branch** is a path the code takes based on whether a condition is true.' },
    bug:        { def: 'A mistake in a condition — like using > when you meant >=.', emoji: '🐞', fill: 'A **bug** in a condition causes the wrong path of code to run.' },
  },
  'y4-game-design': {
    mechanic:   { def: 'A game rule or system — like jumping, shooting, or collecting coins.', emoji: '⚙️', fill: 'A game **mechanic** is a rule or action the player can do, like jumping.' },
    feedback:   { def: 'Letting the player know what happened — a sound, flash, or score change.', emoji: '🔔', fill: '**Feedback** tells the player what happened — like a score going up.' },
    challenge:  { def: 'Something that makes the game hard and interesting to play.', emoji: '😤', fill: 'A good **challenge** makes the game interesting without being too hard.' },
    reward:     { def: 'What the player gets for doing well — points, power-ups, or a new level.', emoji: '🎁', fill: 'A **reward** is what the player earns for achieving something in the game.' },
    difficulty: { def: 'How hard the game is — good games start easy and get harder.', emoji: '📈', fill: 'The **difficulty** of a game should increase gradually as the player improves.' },
    player:     { def: 'The person playing — always design your game with them in mind!', emoji: '🕹️', fill: 'A good game always considers what the **player** needs and enjoys.' },
    UI:         { def: 'User Interface — buttons, score, and health bars visible to the player.', emoji: '🖥️', fill: 'The **UI** shows the player information like score, lives, and time.' },
    iteration:  { def: 'Making your game, testing it, and improving it again and again.', emoji: '🔄', fill: '**Iteration** is the process of improving your game through repeated testing.' },
    prototype:  { def: 'A simple first version of your game to test your ideas quickly.', emoji: '📄', fill: 'A **prototype** is a simple early version used for quick testing.' },
    playtesting:{ def: 'Watching someone else play your game and noting what to improve.', emoji: '👀', fill: '**Playtesting** means watching others play your game to find improvements.' },
  },
  'y4-web': {
    'HTML tag': { def: 'A label in angle brackets like <h1> that tells the browser what to show.', emoji: '🏷️', fill: 'An **HTML tag** tells the browser what type of content to display.' },
    element:    { def: 'One piece of a web page — a heading, paragraph, image, or link.', emoji: '🧱', fill: 'An **element** is one piece of a web page, like a heading or paragraph.' },
    heading:    { def: 'A large, bold title on a page — created with <h1> to <h6>.', emoji: '📰', fill: 'A **heading** is a large title on a webpage, made with the <h1> tag.' },
    paragraph:  { def: 'A block of text on a web page — created with the <p> tag.', emoji: '📄', fill: 'A **paragraph** is a block of text on a webpage, made with the <p> tag.' },
    link:       { def: 'A clickable piece of text or image that takes you to another page.', emoji: '🔗', fill: 'A **link** is a clickable element that takes you to another web page.' },
    CSS:        { def: 'Code that styles your HTML — changes colours, sizes, and fonts.', emoji: '🎨', fill: '**CSS** is used to style HTML — it changes colours, fonts, and layout.' },
    browser:    { def: 'The program you use to view websites — like Chrome or Firefox.', emoji: '🌐', fill: 'A **browser** is what you use to view websites — like Chrome or Firefox.' },
    attribute:  { def: 'Extra information inside an HTML tag, like href="..." in a link.', emoji: '📌', fill: 'An **attribute** adds extra information inside an HTML tag.' },
    structure:  { def: 'The skeleton of a webpage — how HTML elements are arranged.', emoji: '🏗️', fill: 'The **structure** of a webpage is how its HTML elements are arranged.' },
    image:      { def: 'A picture added to a web page using the <img> tag.', emoji: '🖼️', fill: 'An **image** is added to a web page using the <img> tag.' },
  },
  'y4-cyber': {
    password:   { def: 'A secret code that protects your account — keep it private!', emoji: '🔑', fill: 'A strong **password** is a secret code that protects your account.' },
    privacy:    { def: 'Keeping personal information to yourself and not sharing it online.', emoji: '🔒', fill: '**Privacy** means keeping your personal information to yourself online.' },
    'personal data': { def: 'Information about you — your name, address, or birthday.', emoji: '👤', fill: '**Personal data** includes your name, address, and other private details.' },
    phishing:   { def: 'A fake message that tries to trick you into giving away your details.', emoji: '🎣', fill: '**Phishing** is a fake message designed to steal your personal details.' },
    'cyber safety': { def: 'Staying safe when using the internet and devices.', emoji: '🛡️', fill: '**Cyber safety** means staying safe when using the internet and devices.' },
    threat:     { def: 'Something online that could harm you or your data.', emoji: '⚠️', fill: 'An online **threat** is anything that could harm you or your data.' },
    malware:    { def: 'Harmful software that damages devices or steals data.', emoji: '🦠', fill: '**Malware** is harmful software that can damage devices or steal data.' },
    backup:     { def: 'Saving a copy of your data somewhere safe.', emoji: '💾', fill: 'A **backup** is a copy of your data saved somewhere safe.' },
    'two-factor':{ def: 'Using two checks to log in — a password AND a phone code.', emoji: '📱', fill: '**Two-factor** authentication requires two checks to log in securely.' },
    'digital footprint': { def: 'The trail of data you leave behind whenever you use the internet.', emoji: '👣', fill: 'Your **digital footprint** is the trail of data you leave online.' },
  },
  'y4-algorithms': {
    algorithm:  { def: 'A precise step-by-step plan to solve a problem.', emoji: '📋', fill: 'An **algorithm** is a precise step-by-step plan to solve a problem.' },
    sort:       { def: 'Arranging items in order — smallest to biggest, or A to Z.', emoji: '🔢', fill: 'A **sort** algorithm arranges items in a specific order.' },
    search:     { def: 'Looking through a list to find a specific item.', emoji: '🔍', fill: 'A **search** algorithm looks through data to find a specific item.' },
    input:      { def: 'The information fed into an algorithm to be processed.', emoji: '📥', fill: 'The **input** is the information an algorithm starts with.' },
    output:     { def: 'The result produced by running the algorithm.', emoji: '📤', fill: 'The **output** is the result that the algorithm produces.' },
    efficiency: { def: 'How quickly an algorithm solves a problem using little effort.', emoji: '⚡', fill: 'An **efficient** algorithm solves problems quickly using little effort.' },
    trace:      { def: 'Following an algorithm step by step to check it works.', emoji: '👣', fill: 'To **trace** an algorithm means to follow it step by step manually.' },
    loop:       { def: 'Repeating a step in the algorithm until a condition is met.', emoji: '🔄', fill: 'A **loop** repeats a step in the algorithm until a condition is met.' },
    pseudocode: { def: 'Writing an algorithm in plain English before you code it.', emoji: '📝', fill: '**Pseudocode** is an algorithm written in plain English before coding.' },
    flowchart:  { def: 'A diagram with shapes and arrows showing the steps of an algorithm.', emoji: '📊', fill: 'A **flowchart** uses shapes and arrows to map out an algorithm.' },
  },
  'y4-ai': {
    AI:         { def: 'Artificial Intelligence — computers that can learn and make decisions.', emoji: '🤖', fill: '**AI** stands for Artificial Intelligence — computers that can learn.' },
    pattern:    { def: 'A repeated feature that AI looks for across many examples.', emoji: '🔁', fill: 'A **pattern** is a repeated feature that AI learns to recognise.' },
    training:   { def: 'Showing the AI many labelled examples so it can learn.', emoji: '🏋️', fill: '**Training** means showing an AI lots of labelled examples to learn from.' },
    label:      { def: 'The correct answer on a training example — like "cat" or "dog".', emoji: '🏷️', fill: 'A **label** is the correct answer attached to a training example.' },
    recognition:{ def: 'The AI correctly identifying something it was trained to see.', emoji: '✅', fill: '**Recognition** is when AI correctly identifies something it was trained on.' },
    model:      { def: 'The AI system built from training — it makes predictions on new data.', emoji: '🧠', fill: 'An AI **model** is trained on data and then used to make predictions.' },
    prediction: { def: 'The AI\'s best guess about new data it hasn\'t seen before.', emoji: '🎯', fill: 'A **prediction** is the AI\'s best guess about new, unseen data.' },
    accuracy:   { def: 'How often the AI gets the right answer — measured as a percentage.', emoji: '📊', fill: 'The **accuracy** of an AI model is how often it gives the correct answer.' },
    bias:       { def: 'When training data is unfair, the AI learns unfair patterns.', emoji: '⚖️', fill: '**Bias** in an AI happens when the training data is unfair or unbalanced.' },
    data:       { def: 'The information used to train and test an AI model.', emoji: '📦', fill: '**Data** is the information used to train and improve an AI model.' },
  },
  /* ── Year 5 ── */
  'y5-python': {
    function:    { def: 'A named block of reusable code defined with "def".', emoji: '🔧', fill: 'A **function** is a named, reusable block of code defined with "def".' },
    list:        { def: 'An ordered collection: ["apple", "banana", "cherry"].', emoji: '📋', fill: 'A **list** is an ordered collection of items in square brackets.' },
    loop:        { def: 'A for or while loop that repeats a block of code.', emoji: '🔄', fill: 'A **loop** repeats a block of code a set number of times.' },
    string:      { def: 'A sequence of characters in quotes: "Hello World".', emoji: '📝', fill: 'A **string** is a sequence of characters enclosed in quotes.' },
    integer:     { def: 'A whole number — stores values like 0, 5, or -12.', emoji: '🔢', fill: 'An **integer** is a whole number with no decimal part.' },
    boolean:     { def: 'A value that is True or False — used in if-statements.', emoji: '⚖️', fill: 'A **boolean** value is always either True or False.' },
    return:      { def: 'Sending a value back out of a function when it is called.', emoji: '↩️', fill: 'The **return** statement sends a value back from a function.' },
    'print()':   { def: 'The function that displays output in the Python terminal.', emoji: '📺', fill: 'The **print()** function displays output in the Python terminal.' },
    indentation: { def: 'Spaces at the start of a line — Python uses these to group code.', emoji: '➡️', fill: '**Indentation** (spaces at the start) tells Python which code belongs together.' },
    import:      { def: 'Loading an extra module to access its built-in functions.', emoji: '📦', fill: 'The **import** statement loads a Python module to use its functions.' },
  },
  'y5-web': {
    CSS:         { def: 'Cascading Style Sheets — rules that control how a webpage looks.', emoji: '🎨', fill: '**CSS** controls how HTML elements look — colours, fonts, and spacing.' },
    selector:    { def: 'The part of a CSS rule that targets which HTML element to style.', emoji: '🎯', fill: 'A CSS **selector** targets the specific HTML elements you want to style.' },
    property:    { def: 'What you are styling — like color, font-size, or margin.', emoji: '✏️', fill: 'A CSS **property** controls one aspect of an element\'s style, like color.' },
    flexbox:     { def: 'A CSS layout system that arranges items in a row or column.', emoji: '📐', fill: '**Flexbox** is a CSS layout system for arranging items in rows or columns.' },
    responsive:  { def: 'A website that adjusts its layout to fit different screen sizes.', emoji: '📱', fill: 'A **responsive** website looks good on all screen sizes.' },
    class:       { def: 'A CSS label added to HTML elements to style groups of them.', emoji: '🏷️', fill: 'A CSS **class** lets you style a group of HTML elements together.' },
    font:        { def: 'The style of text — typeface, size, and weight.', emoji: '🅰️', fill: 'The **font** property controls the text typeface, size, and weight.' },
    'media query':{ def: 'A CSS rule that applies only at certain screen sizes.', emoji: '📺', fill: 'A **media query** applies CSS rules only on screens of a certain size.' },
    animation:   { def: 'CSS keyframes that make elements move or change automatically.', emoji: '✨', fill: 'CSS **animation** uses keyframes to move or change elements over time.' },
    layout:      { def: 'How elements are positioned and arranged on the page.', emoji: '🏗️', fill: 'The **layout** determines how elements are positioned on a web page.' },
  },
  'y5-data-structures': {
    list:       { def: 'An ordered, changeable collection: fruits = ["apple", "banana"].', emoji: '📋', fill: 'A **list** is an ordered, changeable collection of items.' },
    dictionary: { def: 'Stores key-value pairs: {"name": "Alice", "age": 11}.', emoji: '📖', fill: 'A **dictionary** stores data as key-value pairs in curly braces.' },
    tuple:      { def: 'Like a list but cannot be changed after creation: (1, 2, 3).', emoji: '🔒', fill: 'A **tuple** is like a list but is immutable — it cannot be changed.' },
    index:      { def: 'The position of an item in a list — starts at 0, not 1!', emoji: '0️⃣', fill: 'An **index** is the position of an item in a list — starting from 0.' },
    key:        { def: 'The unique label used to look up a value in a dictionary.', emoji: '🔑', fill: 'A **key** in a dictionary is the unique label used to find a value.' },
    'append()': { def: 'Adds a new item to the end of a list.', emoji: '➕', fill: 'The **append()** method adds a new item to the end of a list.' },
    'len()':    { def: 'Returns the number of items in a list or characters in a string.', emoji: '📏', fill: 'The **len()** function returns the number of items in a list.' },
    iteration:  { def: 'Looping through every item in a list using a for loop.', emoji: '🔄', fill: '**Iteration** means looping through every item in a list one by one.' },
    'sort()':   { def: 'Arranges list items in order — alphabetically or numerically.', emoji: '🔢', fill: 'The **sort()** method arranges list items in order.' },
    search:     { def: 'Looking through a data structure to find a specific value.', emoji: '🔍', fill: 'A **search** algorithm looks through data to find a specific value.' },
  },
  'y5-algorithms': {
    'binary search': { def: 'Halving the search space each time to find an item quickly.', emoji: '🔍', fill: '**Binary search** halves the search space each step to find items quickly.' },
    'bubble sort':   { def: 'Repeatedly swapping neighbours until the list is in order.', emoji: '🫧', fill: '**Bubble sort** repeatedly swaps neighbours until the list is sorted.' },
    recursion:       { def: 'A function that calls itself to solve smaller versions of a problem.', emoji: '🌀', fill: '**Recursion** is when a function calls itself to solve smaller sub-problems.' },
    'Big O':         { def: 'Describes how an algorithm\'s speed changes as input grows.', emoji: '📈', fill: '**Big O** notation describes how an algorithm slows down as data grows.' },
    pseudocode:      { def: 'Writing an algorithm in plain English before coding it.', emoji: '📝', fill: '**Pseudocode** is a plain English description of an algorithm before coding.' },
    efficiency:      { def: 'How quickly and with how little memory an algorithm runs.', emoji: '⚡', fill: 'A more **efficient** algorithm uses less time and memory to get the answer.' },
    trace:           { def: 'Following code line by line to find exactly where a bug is.', emoji: '👣', fill: 'To **trace** code means to follow it line by line to find bugs.' },
    iteration:       { def: 'Repeating steps using a loop — each pass is one iteration.', emoji: '🔄', fill: 'Each pass through a loop is called an **iteration**.' },
    'merge sort':    { def: 'Splitting a list in half, sorting each half, then merging them.', emoji: '🔀', fill: '**Merge sort** splits a list, sorts each half, then merges them back.' },
    'time complexity':{ def: 'How much longer an algorithm takes as the input gets bigger.', emoji: '⏱️', fill: '**Time complexity** measures how much slower an algorithm gets with more data.' },
  },
  'y5-databases': {
    table:      { def: 'A grid of rows and columns that stores related data.', emoji: '📊', fill: 'A database **table** stores related data in rows and columns.' },
    row:        { def: 'One record in a table — like one person\'s complete set of details.', emoji: '➡️', fill: 'One **row** in a table contains all the data for a single record.' },
    column:     { def: 'A field storing one type of data — like "Name" or "Age".', emoji: '⬇️', fill: 'Each **column** in a table holds one type of data, like Name or Age.' },
    'primary key':{ def: 'A unique ID for each row — no two rows can share the same value.', emoji: '🔑', fill: 'A **primary key** is a unique ID that identifies each row in a table.' },
    query:      { def: 'A question you ask the database to get back specific records.', emoji: '❓', fill: 'A **query** asks the database to find and return specific records.' },
    SQL:        { def: 'Structured Query Language — used to create, read, update, and delete data.', emoji: '💻', fill: '**SQL** is the language used to interact with relational databases.' },
    filter:     { def: 'A WHERE clause that returns only the rows matching your condition.', emoji: '🔽', fill: 'A **filter** (WHERE clause) returns only rows that match a condition.' },
    SELECT:     { def: 'The SQL command that retrieves data from one or more tables.', emoji: '📥', fill: 'The **SELECT** command retrieves data from a database table.' },
    'data type': { def: 'The kind of value a column stores — text, number, date, or boolean.', emoji: '📋', fill: 'A **data type** defines what kind of value a column can hold.' },
    record:     { def: 'A complete set of related data — one full row in a table.', emoji: '📄', fill: 'A **record** is one complete set of related data — one row in a table.' },
  },
  'y5-cyber': {
    encryption: { def: 'Scrambling data so only the right person with the key can read it.', emoji: '🔐', fill: '**Encryption** scrambles data so only the correct key can decode it.' },
    hash:       { def: 'Turning data into a fixed code — used to store passwords safely.', emoji: '#️⃣', fill: 'A **hash** is a fixed-length code created from data — used to store passwords.' },
    firewall:   { def: 'Software or hardware that blocks unauthorised network traffic.', emoji: '🧱', fill: 'A **firewall** blocks unauthorised traffic from entering a network.' },
    malware:    { def: 'Harmful software — includes viruses, ransomware, and spyware.', emoji: '🦠', fill: '**Malware** is harmful software including viruses and ransomware.' },
    phishing:   { def: 'A fake email or site that tricks you into giving away your details.', emoji: '🎣', fill: 'A **phishing** attack uses fake messages to steal your details.' },
    'two-factor auth': { def: 'Logging in with a password plus a code sent to your phone.', emoji: '📱', fill: '**Two-factor auth** protects accounts with a password AND a one-time code.' },
    HTTPS:      { def: 'A secure version of HTTP — the padlock in the browser confirms it.', emoji: '🔒', fill: '**HTTPS** is the secure version of HTTP — look for the padlock symbol.' },
    'social engineering': { def: 'Tricking people into revealing confidential information.', emoji: '🎭', fill: '**Social engineering** tricks people into giving away private information.' },
    patch:      { def: 'An update that fixes a security weakness in software.', emoji: '🩹', fill: 'A **patch** is an update that fixes a security flaw in software.' },
    'data breach': { def: 'When private data is accessed or stolen by unauthorised people.', emoji: '⚠️', fill: 'A **data breach** is when private data is accessed without permission.' },
  },
  'y5-game-advanced': {
    class:      { def: 'A blueprint for creating game objects — defines their data and behaviour.', emoji: '📐', fill: 'A **class** is a blueprint that defines an object\'s data and behaviour.' },
    object:     { def: 'An instance of a class — like one specific enemy or bullet.', emoji: '🎮', fill: 'An **object** is one instance of a class — like one specific enemy.' },
    method:     { def: 'A function that belongs to a class — like enemy.move() or player.jump().', emoji: '🔧', fill: 'A **method** is a function attached to a class, like player.jump().' },
    attribute:  { def: 'A variable stored inside a class — like self.health or self.speed.', emoji: '📋', fill: 'An **attribute** is a variable inside a class, like self.health.' },
    collision:  { def: 'Detecting when two game objects overlap — triggers effects.', emoji: '💥', fill: '**Collision** detection triggers effects when two game objects overlap.' },
    physics:    { def: 'Simulating gravity, velocity, and friction for realistic movement.', emoji: '⚙️', fill: '**Physics** simulates gravity and velocity to make movement feel realistic.' },
    'game state':{ def: 'Whether the game is on the menu, playing, paused, or game-over.', emoji: '📊', fill: 'The **game state** tracks if you are on the menu, playing, or game-over.' },
    score:      { def: 'Tracked in an attribute and updated when the player achieves something.', emoji: '🏆', fill: 'The **score** attribute is updated whenever the player does something right.' },
    animation:  { def: 'Cycling through image frames to make characters look alive.', emoji: '🎞️', fill: '**Animation** cycles through image frames to make characters move smoothly.' },
    inheritance:{ def: 'A subclass inherits methods and attributes from its parent class.', emoji: '👪', fill: '**Inheritance** lets a subclass reuse code from its parent class.' },
  },
  'y5-ml': {
    'training data': { def: 'Labelled examples used to teach a machine learning model.', emoji: '📚', fill: '**Training data** is a collection of labelled examples used to teach an AI model.' },
    label:       { def: 'The correct answer on a training example — like "cat" or "dog".', emoji: '🏷️', fill: 'A **label** is the correct category attached to each training example.' },
    model:       { def: 'The mathematical system that makes predictions after training.', emoji: '🧠', fill: 'A machine learning **model** is trained on data to make future predictions.' },
    accuracy:    { def: 'The percentage of predictions the model gets correct on test data.', emoji: '📊', fill: 'The **accuracy** of a model is the percentage of correct predictions it makes.' },
    feature:     { def: 'A measurable property of the data used to make a prediction.', emoji: '🔍', fill: 'A **feature** is a measurable property of data used to make predictions.' },
    prediction:  { def: 'The model\'s output for data it hasn\'t seen during training.', emoji: '🎯', fill: 'A **prediction** is the model\'s best guess for new, unseen data.' },
    bias:        { def: 'Unfairness in a model caused by skewed training data.', emoji: '⚖️', fill: '**Bias** in an AI model comes from unfair or unbalanced training data.' },
    overfitting:  { def: 'When a model learns training data too well and fails on new data.', emoji: '📉', fill: '**Overfitting** happens when a model memorises training data and fails on new data.' },
    classify:    { def: 'Sorting input data into one of several categories.', emoji: '📁', fill: 'To **classify** data means to sort it into one of several categories.' },
    'test data':  { def: 'Unseen examples used to measure how well the model has learnt.', emoji: '✅', fill: '**Test data** is unseen examples used to evaluate the trained model.' },
  },
  /* ── Year 6 ── */
  'y6-python': {
    class:       { def: 'A blueprint for creating objects — bundles data and methods together.', emoji: '🏗️', fill: 'A **class** is a blueprint that bundles data and methods into one object.' },
    inheritance: { def: 'A subclass gaining the methods and attributes of its parent class.', emoji: '👪', fill: '**Inheritance** allows a subclass to reuse code from its parent class.' },
    exception:   { def: 'An error caught and handled gracefully using try/except.', emoji: '⚠️', fill: 'An **exception** is an error that can be caught and handled with try/except.' },
    'list comprehension': { def: '[x*2 for x in nums] — builds a list in one compact line.', emoji: '⚡', fill: 'A **list comprehension** builds a new list in one compact, readable line.' },
    lambda:      { def: 'An anonymous one-line function: lambda x: x + 1.', emoji: 'λ', fill: 'A **lambda** is an anonymous function written in a single line.' },
    module:      { def: 'A Python file with reusable code — imported with import.', emoji: '📦', fill: 'A **module** is a Python file that you import to use its functions.' },
    decorator:   { def: 'A function that wraps another function to add extra behaviour.', emoji: '🎀', fill: 'A **decorator** wraps a function to add extra behaviour without changing it.' },
    generator:   { def: 'A function that yields values one at a time to save memory.', emoji: '🔄', fill: 'A **generator** yields values one at a time instead of all at once.' },
    recursion:   { def: 'A function that calls itself — must have a base case to stop.', emoji: '🌀', fill: 'A recursive function calls **itself** and must have a base case to stop.' },
    'type hint':  { def: 'Optional annotation: def add(x: int) -> int shows expected types.', emoji: '📋', fill: 'A **type hint** annotates the expected types in a function signature.' },
  },
  'y6-web-pro': {
    JavaScript:  { def: 'The programming language that makes web pages interactive.', emoji: '⚡', fill: '**JavaScript** is the programming language that adds interactivity to websites.' },
    DOM:         { def: 'Document Object Model — the tree of HTML elements in the browser.', emoji: '🌳', fill: 'The **DOM** is the tree structure of HTML elements in the browser.' },
    'event listener': { def: 'Code that runs when the user clicks, types, or scrolls.', emoji: '👂', fill: 'An **event listener** runs code when the user interacts with the page.' },
    'fetch API': { def: 'A built-in JavaScript function for requesting data from a server.', emoji: '🌐', fill: 'The **fetch API** requests data from a server using JavaScript.' },
    async:       { def: 'Code that runs without blocking — used with Promises and await.', emoji: '⏳', fill: '**Async** code runs without blocking the rest of the program.' },
    JSON:        { def: 'JavaScript Object Notation — a text format for exchanging data.', emoji: '📋', fill: '**JSON** is a text format used to send data between a client and server.' },
    framework:   { def: 'A ready-made structure for building web apps — like React or Vue.', emoji: '🏗️', fill: 'A web **framework** provides a ready-made structure for building apps.' },
    component:   { def: 'A reusable piece of UI with its own logic, style, and data.', emoji: '🧩', fill: 'A **component** is a reusable UI building block with its own code and style.' },
    deployment:  { def: 'Putting your website on a server so anyone can access it.', emoji: '🚀', fill: '**Deployment** makes your website live and accessible to users online.' },
    'API endpoint': { def: 'A URL your code sends requests to in order to get or send data.', emoji: '🔌', fill: 'An **API endpoint** is a URL your code sends requests to for data.' },
  },
  'y6-data-structures': {
    stack:       { def: 'A last-in, first-out (LIFO) structure — like a stack of plates.', emoji: '🥞', fill: 'A **stack** is a last-in, first-out data structure.' },
    queue:       { def: 'A first-in, first-out (FIFO) structure — like a queue at a shop.', emoji: '🚶', fill: 'A **queue** is a first-in, first-out data structure.' },
    'linked list':{ def: 'A chain of nodes where each node points to the next one.', emoji: '🔗', fill: 'A **linked list** is a chain of nodes, each pointing to the next.' },
    tree:        { def: 'A hierarchical structure with a root node and child branches.', emoji: '🌳', fill: 'A **tree** is a hierarchical data structure with a root and branches.' },
    graph:       { def: 'Nodes connected by edges — used to model networks and relationships.', emoji: '🕸️', fill: 'A **graph** has nodes connected by edges — used to model relationships.' },
    'hash table': { def: 'Stores key-value pairs and uses hashing for very fast lookup.', emoji: '#️⃣', fill: 'A **hash table** uses hashing to enable very fast key-value lookups.' },
    node:        { def: 'A single element in a structure that holds data and links.', emoji: '⭕', fill: 'A **node** holds data and links to other nodes in a data structure.' },
    complexity:  { def: 'How time or memory usage grows as the data size increases.', emoji: '📈', fill: '**Complexity** describes how resource usage grows as data size increases.' },
    traversal:   { def: 'Visiting every node in a data structure in a specific order.', emoji: '👣', fill: '**Traversal** visits every node in a data structure in a defined order.' },
    pointer:     { def: 'A reference storing the memory address of another node or value.', emoji: '👉', fill: 'A **pointer** stores the memory address of another node or value.' },
  },
  'y6-algorithms': {
    'dynamic programming': { def: 'Solving problems by caching solutions to overlapping subproblems.', emoji: '🧩', fill: '**Dynamic programming** caches sub-solutions to avoid repeating computation.' },
    greedy:      { def: 'Always picks the locally best option at each step.', emoji: '🍃', fill: 'A **greedy** algorithm always picks the best local option at each step.' },
    backtracking:{ def: 'Trying a solution and undoing it when it fails — then trying another.', emoji: '↩️', fill: '**Backtracking** tries a solution and undoes it if it fails.' },
    BFS:         { def: 'Breadth-First Search — explores all neighbours before going deeper.', emoji: '🌊', fill: '**BFS** explores all nodes at the current level before going deeper.' },
    DFS:         { def: 'Depth-First Search — goes as deep as possible before backtracking.', emoji: '🏔️', fill: '**DFS** goes as deep as possible down one path before backtracking.' },
    'Big O':     { def: 'Describes how runtime grows with input — O(1) is constant, O(n²) is slow.', emoji: '📈', fill: '**Big O** notation expresses how an algorithm\'s runtime scales with input.' },
    memoisation: { def: 'Caching the results of function calls to avoid repeating them.', emoji: '💾', fill: '**Memoisation** caches function results to avoid recomputing the same answer.' },
    'divide and conquer': { def: 'Split a problem in half, solve each half, then combine.', emoji: '✂️', fill: '**Divide and conquer** splits a problem, solves each part, then combines.' },
    'space complexity': { def: 'How much extra memory an algorithm needs as input grows.', emoji: '💾', fill: '**Space complexity** measures how much extra memory an algorithm uses.' },
    optimise:    { def: 'Improving an algorithm to use less time or memory.', emoji: '⚡', fill: 'To **optimise** an algorithm means to reduce its time or memory usage.' },
  },
  'y6-databases': {
    JOIN:        { def: 'Combining rows from two tables based on a related column.', emoji: '🔗', fill: 'A SQL **JOIN** combines rows from two tables using a shared column.' },
    normalisation:{ def: 'Organising data to reduce repetition and improve consistency.', emoji: '✂️', fill: '**Normalisation** reduces data repetition to keep a database consistent.' },
    transaction: { def: 'A group of SQL operations that all succeed or all fail together.', emoji: '💳', fill: 'A **transaction** ensures all SQL operations succeed or all fail together.' },
    index:       { def: 'A structure that speeds up searching by pre-sorting column values.', emoji: '🔍', fill: 'A database **index** pre-sorts a column to speed up search queries.' },
    NoSQL:       { def: 'A database storing data in documents or key-value pairs instead of tables.', emoji: '📄', fill: '**NoSQL** databases store data in documents or key-value pairs.' },
    schema:      { def: 'The blueprint of a database — defines tables, columns, and types.', emoji: '🗺️', fill: 'The **schema** is the blueprint of a database — its tables and column types.' },
    aggregate:   { def: 'SQL functions like COUNT(), SUM(), and AVG() that summarise data.', emoji: '📊', fill: '**Aggregate** functions like SUM() and COUNT() summarise groups of data.' },
    constraint:  { def: 'A rule on a column — like NOT NULL or UNIQUE — to keep data valid.', emoji: '🔒', fill: 'A database **constraint** like NOT NULL keeps data clean and valid.' },
    'foreign key':{ def: 'A column that links a row in one table to a row in another.', emoji: '🔑', fill: 'A **foreign key** links a row in one table to a row in another table.' },
    'stored procedure': { def: 'A saved SQL script that runs on demand inside the database.', emoji: '💾', fill: 'A **stored procedure** is a saved SQL script that runs inside the database.' },
  },
  'y6-cyber-pro': {
    'penetration testing': { def: 'Legally testing a system for weaknesses before attackers find them.', emoji: '🕵️', fill: '**Penetration testing** legally checks systems for security weaknesses.' },
    cryptography: { def: 'The science of encoding and decoding messages securely.', emoji: '🔐', fill: '**Cryptography** is the science of encoding messages so only the right person can read them.' },
    'zero-day':  { def: 'A security flaw unknown to the vendor — exploited before it is patched.', emoji: '0️⃣', fill: 'A **zero-day** vulnerability is unknown to the vendor and has no patch yet.' },
    'intrusion detection': { def: 'Software that monitors a network for suspicious activity.', emoji: '🔔', fill: '**Intrusion detection** software monitors networks for suspicious activity.' },
    'risk assessment': { def: 'Identifying threats and deciding how to respond to them.', emoji: '⚠️', fill: 'A **risk assessment** identifies threats and plans how to handle them.' },
    'public key': { def: 'A key shared openly — used to encrypt messages only you can decrypt.', emoji: '🔓', fill: 'A **public key** encrypts messages that only the private key can decrypt.' },
    firewall:    { def: 'Filters network traffic to block unauthorised access.', emoji: '🧱', fill: 'A **firewall** filters network traffic to block unauthorised connections.' },
    'incident response': { def: 'The plan for what to do when a security breach is detected.', emoji: '🚨', fill: '**Incident response** is the plan for handling a detected security breach.' },
    GDPR:        { def: 'UK/EU law protecting personal data and giving people rights over it.', emoji: '⚖️', fill: '**GDPR** is the law that protects personal data and gives people rights over it.' },
    'social engineering': { def: 'Manipulating people to reveal confidential information.', emoji: '🎭', fill: '**Social engineering** manipulates people into revealing private information.' },
  },
  'y6-ai-advanced': {
    'neural network': { def: 'Layers of artificial neurons that learn by adjusting weights.', emoji: '🧠', fill: 'A **neural network** learns by adjusting weights across layers of artificial neurons.' },
    backpropagation: { def: 'Adjusts weights by working backwards from the prediction error.', emoji: '↩️', fill: '**Backpropagation** updates model weights backwards from the measured error.' },
    'loss function': { def: 'Measures how wrong the model\'s predictions are — minimised during training.', emoji: '📉', fill: 'The **loss function** measures how wrong predictions are — we aim to minimise it.' },
    epoch:       { def: 'One full pass through all training data during model training.', emoji: '🔄', fill: 'One **epoch** is a single full pass through all the training data.' },
    overfitting:  { def: 'Model memorises training data but performs poorly on new examples.', emoji: '📈', fill: '**Overfitting** means the model memorises training data but fails on new data.' },
    'transfer learning': { def: 'Using a pre-trained model as the starting point for a new task.', emoji: '♻️', fill: '**Transfer learning** reuses a pre-trained model as a starting point.' },
    NLP:         { def: 'Natural Language Processing — teaching computers to understand human language.', emoji: '💬', fill: '**NLP** enables computers to understand and generate human language.' },
    'computer vision': { def: 'AI systems that can interpret and understand images and video.', emoji: '👁️', fill: '**Computer vision** allows AI to interpret and understand images.' },
    'reinforcement learning': { def: 'An AI that learns by taking actions and receiving rewards or penalties.', emoji: '🎮', fill: '**Reinforcement learning** trains AI through rewards and penalties for actions.' },
    GAN:         { def: 'Generative Adversarial Network — two models compete: one creates, one detects.', emoji: '🎨', fill: 'A **GAN** trains two models that compete — one creates, one detects fakes.' },
  },
  'y6-git': {
    commit:      { def: 'A saved snapshot of your code at a specific point in time.', emoji: '📸', fill: 'A **commit** saves a snapshot of your code at a specific point in time.' },
    branch:      { def: 'A parallel version of the code — lets you develop features safely.', emoji: '🌿', fill: 'A **branch** is a parallel version of code for developing features safely.' },
    merge:       { def: 'Combining changes from one branch into another.', emoji: '🔀', fill: 'A **merge** combines code changes from one branch into another.' },
    'pull request': { def: 'Requesting your branch\'s changes be reviewed and merged.', emoji: '🙋', fill: 'A **pull request** asks team members to review and merge your changes.' },
    conflict:    { def: 'When two branches have conflicting changes to the same line.', emoji: '⚡', fill: 'A **conflict** happens when two branches edit the same line differently.' },
    repository:  { def: 'The folder that stores all the code and history of a project.', emoji: '📁', fill: 'A **repository** stores all the code and history of a project.' },
    clone:       { def: 'Making a local copy of a remote repository on your machine.', emoji: '📋', fill: 'To **clone** a repository is to make a local copy on your machine.' },
    push:        { def: 'Uploading your local commits to the remote repository.', emoji: '📤', fill: 'To **push** means to upload your local commits to the remote repository.' },
    fork:        { def: 'Creating your own copy of someone else\'s repository.', emoji: '🍴', fill: 'To **fork** a repository is to create your own copy of it to modify.' },
    'version control': { def: 'Tracking all code changes over time so you can review or revert them.', emoji: '🕰️', fill: '**Version control** tracks all code changes so you can undo or review them.' },
  },
  'y6-mobile': {
    component:   { def: 'A reusable UI building block in React Native — like Button or View.', emoji: '🧩', fill: 'A **component** is a reusable UI building block, like a Button or Text.' },
    state:       { def: 'Data stored inside a component that updates the UI when it changes.', emoji: '📊', fill: '**State** is data inside a component that updates the UI when it changes.' },
    navigation:  { def: 'Moving between different screens in a mobile app.', emoji: '🗺️', fill: '**Navigation** is the system for moving between screens in an app.' },
    gesture:     { def: 'Touch interactions like swipe, pinch, and tap detected by the app.', emoji: '👆', fill: 'A **gesture** is a touch interaction like swipe, pinch, or tap.' },
    hook:        { def: 'A React function like useState that adds features to components.', emoji: '🪝', fill: 'A React **hook** like useState adds state and lifecycle features to components.' },
    permission:  { def: 'Asking the user to allow access to camera, location, or notifications.', emoji: '🔐', fill: 'A **permission** request asks the user to allow access to device features.' },
    StyleSheet:  { def: 'React Native\'s system for writing CSS-like styles in JavaScript.', emoji: '🎨', fill: '**StyleSheet** is React Native\'s system for applying CSS-like styles.' },
    deploy:      { def: 'Submitting your app to the App Store or Play Store for users.', emoji: '🚀', fill: 'To **deploy** an app means to publish it to the App Store or Play Store.' },
    'API call':  { def: 'Fetching data from the internet using fetch() into your app.', emoji: '🌐', fill: 'An **API call** fetches data from the internet into your app.' },
    Expo:        { def: 'A toolset that simplifies building and testing React Native apps.', emoji: '⚡', fill: '**Expo** is a toolset that simplifies building and testing React Native apps.' },
  },
  'y6-cloud': {
    server:      { def: 'A computer that hosts services and responds to client requests.', emoji: '🖥️', fill: 'A **server** is a computer that hosts services and handles client requests.' },
    container:   { def: 'A packaged app with all its dependencies — runs the same anywhere.', emoji: '📦', fill: 'A **container** packages an app with its dependencies so it runs anywhere.' },
    'CI/CD':     { def: 'Continuous Integration/Deployment — automatically building and releasing code.', emoji: '🔄', fill: '**CI/CD** automatically builds, tests, and deploys code on every change.' },
    microservice:{ def: 'A small, independent service that handles one specific task.', emoji: '🧩', fill: 'A **microservice** is a small, independent service that handles one task.' },
    'load balancer': { def: 'Distributes requests across multiple servers to prevent overload.', emoji: '⚖️', fill: 'A **load balancer** spreads traffic across servers to prevent overload.' },
    scalability: { def: 'The ability to handle more users by adding more resources.', emoji: '📈', fill: '**Scalability** is the ability to handle more users by adding resources.' },
    API:         { def: 'A way for cloud services to communicate with each other.', emoji: '🔌', fill: 'An **API** lets cloud services communicate and share data with each other.' },
    Docker:      { def: 'The most popular tool for creating and running containers.', emoji: '🐋', fill: '**Docker** is the most popular tool for creating and running containers.' },
    'cloud storage': { def: 'Storing files on remote servers accessed via the internet.', emoji: '☁️', fill: '**Cloud storage** keeps files on remote servers you access via the internet.' },
    infrastructure: { def: 'The servers, networks, and storage that run cloud apps.', emoji: '🏗️', fill: '**Infrastructure** is the underlying servers and networks that power cloud apps.' },
  },
  'y6-competitive': {
    'dynamic programming': { def: 'Cache solutions to overlapping subproblems to avoid recomputation.', emoji: '🧩', fill: '**Dynamic programming** caches answers to avoid solving sub-problems twice.' },
    greedy:      { def: 'Picks the locally best option at each step — fast but sometimes suboptimal.', emoji: '🍃', fill: 'A **greedy** approach always picks the best local option at each step.' },
    'brute force':{ def: 'Tries every possible solution — guaranteed but very slow.', emoji: '💪', fill: '**Brute force** tries every possible solution — correct but very slow.' },
    'edge case': { def: 'An unusual input at the boundary — like an empty list or max value.', emoji: '🔲', fill: 'An **edge case** is an unusual input at the boundary of what is expected.' },
    'Big O':     { def: 'Growth rate — O(n log n) beats O(n²) for large data.', emoji: '📈', fill: '**Big O** expresses how an algorithm\'s speed scales with the size of input.' },
    recursion:   { def: 'A function calling itself — needs a base case to avoid infinite loops.', emoji: '🌀', fill: '**Recursion** is a function that calls itself and needs a base case to stop.' },
    optimise:    { def: 'Improve your solution to fit within time and memory limits.', emoji: '⚡', fill: 'To **optimise** your solution means to make it run faster and use less memory.' },
    'binary search': { def: 'Halve the search space each step — O(log n) instead of O(n).', emoji: '🔍', fill: '**Binary search** halves the search space each step for O(log n) speed.' },
    heuristic:   { def: 'A strategy that finds a good-enough answer quickly without being exact.', emoji: '🎯', fill: 'A **heuristic** finds a good-enough answer quickly when exact solutions are too slow.' },
    memoisation: { def: 'Storing function results to avoid recomputing the same answer.', emoji: '💾', fill: '**Memoisation** caches function results so the same answer is never computed twice.' },
  },
  'y6-capstone': {
    planning:    { def: 'Deciding what to build, who it is for, and how to build it.', emoji: '📋', fill: '**Planning** means deciding what to build, who it is for, and how.' },
    wireframe:   { def: 'A simple sketch showing the layout of an app before building.', emoji: '✏️', fill: 'A **wireframe** is a simple sketch of the app layout created before coding.' },
    prototype:   { def: 'A working first version used to gather feedback and test ideas.', emoji: '🧪', fill: 'A **prototype** is an early working version used to test and get feedback.' },
    iteration:   { def: 'Improving your project after feedback, then testing again.', emoji: '🔄', fill: '**Iteration** is the cycle of building, testing, and improving your project.' },
    testing:     { def: 'Checking your project works correctly and finding bugs.', emoji: '🔍', fill: '**Testing** checks that your project works as expected and finds bugs.' },
    deployment:  { def: 'Making your project available online for others to use.', emoji: '🚀', fill: '**Deployment** makes your finished project available online to users.' },
    documentation: { def: 'Writing clear notes so others can understand your project.', emoji: '📄', fill: '**Documentation** explains your project clearly so others can understand it.' },
    presentation: { def: 'Sharing your project with an audience and explaining what it does.', emoji: '🎤', fill: 'A **presentation** shares your project with an audience and explains it.' },
    feedback:    { def: 'Comments from users about what works and what needs improving.', emoji: '💬', fill: '**Feedback** from users tells you what works well and what to improve.' },
    reflection:  { def: 'Thinking about what you learned and what you would do differently.', emoji: '🪞', fill: '**Reflection** is thinking about what you learned and how to improve next time.' },
  },
  'y6-careers': {
    role:        { def: 'A specific job in tech — like developer, designer, or data scientist.', emoji: '👔', fill: 'A tech **role** is a specific job like developer, designer, or data analyst.' },
    portfolio:   { def: 'A collection of your best projects showing your skills to employers.', emoji: '💼', fill: 'A **portfolio** showcases your best projects to potential employers.' },
    agile:       { def: 'A way of working in short sprints — plan, build, review, repeat.', emoji: '🔄', fill: '**Agile** is a work process of short sprints — plan, build, and review repeatedly.' },
    teamwork:    { def: 'Collaborating with others — using Git, code reviews, and stand-ups.', emoji: '🤝', fill: '**Teamwork** in tech involves collaboration, code reviews, and communication.' },
    'open source':{ def: 'Software whose code is publicly available for anyone to use or improve.', emoji: '🌐', fill: '**Open source** software is publicly available for anyone to use or contribute to.' },
    specialisation: { def: 'Becoming an expert in one area — front-end, AI, cyber, or games.', emoji: '🎯', fill: '**Specialisation** means becoming an expert in one area of computing.' },
    ethics:      { def: 'Thinking carefully about whether technology is fair, safe, and helpful.', emoji: '⚖️', fill: '**Ethics** in tech means ensuring your work is fair, safe, and beneficial.' },
    'continuous learning': { def: 'Tech changes fast — reading and practising keeps you current.', emoji: '📚', fill: '**Continuous learning** is essential in tech because the field changes rapidly.' },
    interview:   { def: 'A meeting where you demonstrate your skills and knowledge to get a job.', emoji: '🎤', fill: 'A tech **interview** tests both your coding skills and your problem-solving approach.' },
    networking:  { def: 'Building professional relationships with people in the tech industry.', emoji: '🌐', fill: '**Networking** means building relationships with other professionals in your field.' },
  },
  'y6-blockchain': {
    ledger:      { def: 'A complete, permanent record of every transaction on the blockchain.', emoji: '📖', fill: 'The **ledger** is the permanent record of all transactions on a blockchain.' },
    hash:        { def: 'A unique fingerprint of a block\'s data — any change breaks it.', emoji: '#️⃣', fill: 'A **hash** is a unique fingerprint of a block\'s data — changing data changes the hash.' },
    block:       { def: 'A package of data — transactions, timestamp, and previous block hash.', emoji: '📦', fill: 'Each **block** contains transactions, a timestamp, and the previous block\'s hash.' },
    consensus:   { def: 'The process by which all nodes agree on the state of the blockchain.', emoji: '🤝', fill: '**Consensus** is the process by which all nodes agree on what is recorded.' },
    'smart contract': { def: 'Self-executing code on the blockchain triggered by conditions.', emoji: '📜', fill: 'A **smart contract** is code that executes automatically when conditions are met.' },
    decentralised: { def: 'Controlled by many nodes, not a single organisation.', emoji: '🌐', fill: 'A **decentralised** system is controlled by many nodes, not one authority.' },
    wallet:      { def: 'A tool that stores your private keys and manages your blockchain assets.', emoji: '👜', fill: 'A cryptocurrency **wallet** stores your private keys and manages your assets.' },
    immutable:   { def: 'Cannot be changed — once data is on the blockchain it stays forever.', emoji: '🔒', fill: 'Blockchain data is **immutable** — once recorded, it cannot be altered.' },
    node:        { def: 'A computer holding a complete copy of the blockchain and validating data.', emoji: '🖥️', fill: 'A blockchain **node** stores a full copy of the ledger and validates transactions.' },
    'proof of work': { def: 'A consensus mechanism where nodes solve puzzles to add blocks.', emoji: '⛏️', fill: '**Proof of work** requires nodes to solve puzzles to earn the right to add a block.' },
  },
  'y6-arvr': {
    augmented:   { def: 'Adding digital objects on top of the real world — like AR filters.', emoji: '📱', fill: '**Augmented** reality overlays digital content on top of the real world.' },
    virtual:     { def: 'A fully computer-generated environment you experience through a headset.', emoji: '🥽', fill: '**Virtual** reality is a fully computer-generated world you explore with a headset.' },
    marker:      { def: 'A physical image or pattern that triggers an AR experience.', emoji: '🎯', fill: 'An AR **marker** is a physical pattern that triggers a digital overlay.' },
    scene:       { def: 'A 3D environment containing objects, lights, and cameras.', emoji: '🎬', fill: 'A 3D **scene** contains the objects, lighting, and cameras in a VR environment.' },
    depth:       { def: 'Perception of distance — VR headsets recreate this to feel immersive.', emoji: '👀', fill: '**Depth** perception is simulated by VR headsets to create a sense of distance.' },
    interaction: { def: 'How users engage with AR/VR — through gestures, gaze, or controllers.', emoji: '🖐️', fill: '**Interaction** in VR uses gestures, gaze, or controllers to engage with objects.' },
    spatial:     { def: 'Relating to 3D space — position, orientation, and scale all matter.', emoji: '📐', fill: '**Spatial** computing deals with 3D positions, rotations, and scale.' },
    simulation:  { def: 'A VR environment that mimics a real-world scenario for training.', emoji: '🧑‍🚀', fill: 'A **simulation** in VR replicates real-world scenarios for training purposes.' },
    immersive:   { def: 'An experience that fully surrounds the senses to feel real.', emoji: '🌐', fill: 'An **immersive** experience surrounds the user so completely it feels real.' },
    'frame rate': { def: 'How many frames per second are displayed — must be high to avoid sickness.', emoji: '⏩', fill: 'A high **frame rate** in VR prevents motion sickness and ensures smooth visuals.' },
  },
  'y6-robotics': {
    sensor:      { def: 'A component that detects the environment — like light, distance, or touch.', emoji: '📡', fill: 'A **sensor** detects the environment — like light levels or distance.' },
    actuator:    { def: 'A component that causes movement — like a motor or servo.', emoji: '⚙️', fill: 'An **actuator** is a motor or servo that produces movement in a robot.' },
    microcontroller: { def: 'A small computer chip that runs a robot\'s control code.', emoji: '💻', fill: 'A **microcontroller** is the small computer chip that runs a robot\'s code.' },
    servo:       { def: 'A motor that rotates to a precise angle — used to control joints.', emoji: '🔩', fill: 'A **servo** motor rotates to a precise angle to control robot joints.' },
    feedback:    { def: 'Sensor data that a robot uses to adjust its behaviour in real time.', emoji: '🔄', fill: '**Feedback** from sensors lets the robot adjust its actions in real time.' },
    autonomous:  { def: 'Operating independently without human control — using sensors and logic.', emoji: '🤖', fill: 'An **autonomous** robot operates independently using sensors and programmed logic.' },
    algorithm:   { def: 'The step-by-step plan the microcontroller follows to control the robot.', emoji: '📋', fill: 'The robot\'s **algorithm** tells the microcontroller exactly what to do.' },
    circuit:     { def: 'A complete electrical path that allows current to flow through components.', emoji: '⚡', fill: 'A **circuit** is a complete electrical path that powers robot components.' },
    calibrate:   { def: 'Adjusting sensors or motors so they give accurate readings.', emoji: '🔧', fill: 'To **calibrate** a sensor means to adjust it so it gives accurate readings.' },
    PID:         { def: 'A control algorithm that corrects errors to hit a target value precisely.', emoji: '🎯', fill: 'A **PID** controller corrects errors to keep a robot on its target precisely.' },
  },
  'y6-sound': {
    waveform:    { def: 'The shape of a sound wave — shows how amplitude changes over time.', emoji: '〰️', fill: 'A **waveform** shows how a sound\'s amplitude changes over time.' },
    frequency:   { def: 'How many times a wave repeats per second — measured in Hz. Higher = higher pitch.', emoji: '📈', fill: 'The **frequency** of a sound wave determines its pitch — higher Hz = higher pitch.' },
    amplitude:   { def: 'The height of a sound wave — determines how loud the sound is.', emoji: '🔊', fill: 'The **amplitude** of a wave determines how loud the sound is.' },
    sampling:    { def: 'Taking many measurements of a sound per second to store it digitally.', emoji: '🔢', fill: '**Sampling** takes thousands of measurements per second to store sound digitally.' },
    MIDI:        { def: 'Musical Instrument Digital Interface — a protocol for digital music.', emoji: '🎹', fill: '**MIDI** is a protocol that lets digital instruments communicate with computers.' },
    DAW:         { def: 'Digital Audio Workstation — software for recording, editing, and producing music.', emoji: '🎛️', fill: 'A **DAW** is software for recording, editing, and producing digital music.' },
    filter:      { def: 'A signal processor that removes certain frequencies from audio.', emoji: '🎚️', fill: 'An audio **filter** removes certain frequency ranges from a sound signal.' },
    oscillator:  { def: 'Generates a repeated waveform — the building block of synthesised sound.', emoji: '🔄', fill: 'An **oscillator** generates repeated waveforms — the basis of synthesised sounds.' },
    synthesis:   { def: 'Creating sounds electronically by combining and shaping waveforms.', emoji: '🎛️', fill: '**Synthesis** creates sounds electronically by shaping and combining waveforms.' },
    loop:        { def: 'A section of audio that repeats continuously in a track.', emoji: '🔁', fill: 'An audio **loop** is a section of sound that plays repeatedly in a track.' },
  },
  'y6-game-pro': {
    'physics engine': { def: 'Simulates gravity, collisions, and forces for realistic movement.', emoji: '⚙️', fill: 'A **physics engine** simulates real-world forces like gravity and friction.' },
    shader:      { def: 'A GPU program that controls the colour and look of pixels.', emoji: '🎨', fill: 'A **shader** is a GPU program that controls how pixels are coloured and lit.' },
    'particle system': { def: 'Creates many small objects — used for fire, smoke, and explosions.', emoji: '✨', fill: 'A **particle system** generates many small objects to create effects like fire.' },
    'AI pathfinding': { def: 'Algorithms that help NPCs navigate around obstacles to reach a target.', emoji: '🗺️', fill: '**AI pathfinding** lets NPCs navigate around obstacles to find their target.' },
    'game loop':  { def: 'The main cycle that updates game logic and renders the screen every frame.', emoji: '🔁', fill: 'The **game loop** updates game logic and renders the screen every frame.' },
    performance: { def: 'How smoothly the game runs — measured in FPS and frame time.', emoji: '📊', fill: '**Performance** is how smoothly the game runs, measured in frames per second.' },
    multiplayer: { def: 'Multiple players connected over a network — requires syncing game states.', emoji: '👥', fill: '**Multiplayer** connects players over a network and syncs their game states.' },
    'level design': { def: 'Crafting environments that guide the player through challenges.', emoji: '🗺️', fill: '**Level design** creates environments that guide players through challenges.' },
    optimisation: { def: 'Making the game run faster by reducing complexity and draw calls.', emoji: '⚡', fill: '**Optimisation** reduces complexity so the game runs faster and more smoothly.' },
    'asset pipeline': { def: 'The workflow for importing art, audio, and models into the engine.', emoji: '🔄', fill: 'The **asset pipeline** is the workflow for getting art and audio into the engine.' },
  },
  'y6-modding': {
    mod:         { def: 'A modification to a game — adds, changes, or removes content.', emoji: '🔧', fill: 'A **mod** is a modification that adds or changes content in a game.' },
    API:         { def: 'An interface the game exposes so modders can add features safely.', emoji: '🔌', fill: 'A game\'s **API** lets modders add features without changing the core code.' },
    plugin:      { def: 'A mod that adds specific functionality — like a new game mechanic.', emoji: '🧩', fill: 'A **plugin** is a mod that adds specific new functionality to a game.' },
    scripting:   { def: 'Writing code in Lua or Python to modify game behaviour.', emoji: '📝', fill: '**Scripting** is writing code in Lua or Python to change game behaviour.' },
    asset:       { def: 'A game resource — a texture, model, sound, or script file.', emoji: '🖼️', fill: 'A **game asset** is any resource used in the game — textures, models, or sounds.' },
    configuration: { def: 'Settings files that change game parameters without rewriting code.', emoji: '⚙️', fill: 'A **configuration** file lets you change game settings without modifying code.' },
    community:   { def: 'The group of players and creators who make and share mods together.', emoji: '👥', fill: 'The modding **community** shares creations and helps each other learn.' },
    hook:        { def: 'A point in the game code where modders can insert their own logic.', emoji: '🪝', fill: 'A **hook** is a place in the game code where modders can add their own logic.' },
    'version compatibility': { def: 'Ensuring a mod still works when the game is updated.', emoji: '🔄', fill: '**Version compatibility** means your mod still works after a game update.' },
    'reverse engineering': { def: 'Analysing existing code or assets to understand how to mod them.', emoji: '🔍', fill: '**Reverse engineering** analyses existing code to understand how to modify it.' },
  },
  'y6-chatbots': {
    intent:      { def: 'What the user wants to achieve — the goal behind their message.', emoji: '🎯', fill: 'The **intent** is what the user wants to achieve with their message.' },
    entity:      { def: 'A specific piece of information in a message — like a date or city.', emoji: '🏷️', fill: 'An **entity** is a specific detail extracted from a message, like a city or date.' },
    utterance:   { def: 'An example phrase that a user might type to trigger an intent.', emoji: '💬', fill: 'An **utterance** is an example phrase used to train the chatbot for an intent.' },
    NLP:         { def: 'Natural Language Processing — understanding and generating human text.', emoji: '🧠', fill: '**NLP** enables the chatbot to understand and generate human language.' },
    response:    { def: 'What the chatbot says back — fixed text or dynamically generated.', emoji: '🤖', fill: 'The chatbot\'s **response** is what it sends back to the user.' },
    flow:        { def: 'A conversation path — how the chatbot guides a user through steps.', emoji: '🔄', fill: 'A conversation **flow** is the path the chatbot takes to guide the user.' },
    trigger:     { def: 'A condition that starts a specific chatbot response or flow.', emoji: '⚡', fill: 'A **trigger** is a condition that starts a specific chatbot response.' },
    context:     { def: 'Information from earlier in the conversation used to understand current messages.', emoji: '💡', fill: '**Context** is information from earlier in the chat used to understand new messages.' },
    'training phrases': { def: 'Example sentences that teach the AI which intent a message belongs to.', emoji: '📚', fill: '**Training phrases** teach the AI to recognise which intent a message has.' },
    webhook:     { def: 'A URL the chatbot calls to fetch live data or trigger external actions.', emoji: '🌐', fill: 'A **webhook** lets the chatbot fetch live data or trigger external actions.' },
  },
};

// Fallbacks for any category not listed above
const YEAR_FALLBACKS = {
  3: {
    sequence:  { def: 'Doing steps one at a time, in order.', emoji: '📋', fill: 'A **sequence** means doing steps in order, one at a time.' },
    loop:      { def: 'Repeating the same action many times.', emoji: '🔄', fill: 'A **loop** repeats an action many times without rewriting it.' },
    event:     { def: 'Something that starts your code, like clicking the green flag.', emoji: '🚩', fill: 'An **event** triggers your code to start running.' },
    sprite:    { def: 'A character or picture you can move on the screen.', emoji: '😺', fill: 'A **sprite** is a character you can move and control.' },
    algorithm: { def: 'A step-by-step plan for the computer to follow.', emoji: '📝', fill: 'An **algorithm** is a step-by-step plan to solve a problem.' },
    debug:     { def: 'Finding and fixing mistakes in your code.', emoji: '🐛', fill: 'To **debug** means to find and fix mistakes in your code.' },
    output:    { def: 'What the program shows when it runs.', emoji: '📺', fill: 'The **output** is what the program shows or does when it runs.' },
    costume:   { def: 'A different look for your sprite.', emoji: '👗', fill: 'A **costume** gives your sprite a different appearance.' },
    backdrop:  { def: 'The background image behind your sprites.', emoji: '🖼️', fill: 'The **backdrop** is the background image in your project.' },
    sound:     { def: 'Music or noise your project makes.', emoji: '🎵', fill: 'A **sound** is the music or noise your project plays.' },
  },
  4: {
    variable:    { def: 'A named box that stores a value that can change.', emoji: '📦', fill: 'A **variable** is a named container that stores a changing value.' },
    conditional: { def: 'Code that runs only when a condition is true.', emoji: '🔀', fill: 'A **conditional** runs code only when a condition is true.' },
    loop:        { def: 'Repeating steps using a loop block.', emoji: '🔄', fill: 'A **loop** repeats code a set number of times.' },
    bug:         { def: 'A mistake in your code that needs fixing.', emoji: '🐞', fill: 'A **bug** is a mistake in code that needs to be fixed.' },
    algorithm:   { def: 'A step-by-step plan to solve a problem.', emoji: '📋', fill: 'An **algorithm** is a precise plan for solving a problem.' },
    input:       { def: 'Information given to a program by the user.', emoji: '⌨️', fill: '**Input** is information given to a program by the user.' },
    output:      { def: 'What a program shows or does as a result.', emoji: '📺', fill: 'The **output** is what the program shows as a result.' },
    data:        { def: 'Information stored and used by a computer.', emoji: '📊', fill: '**Data** is information stored and processed by a computer.' },
    'HTML tag':  { def: 'A label that tells the browser what to show.', emoji: '🏷️', fill: 'An **HTML tag** tells the browser what type of content to show.' },
    score:       { def: 'A number tracking how well the player is doing.', emoji: '🏆', fill: 'The **score** tracks how well a player is doing in a game.' },
  },
  5: {
    function:  { def: 'A reusable block of code with a name.', emoji: '🔧', fill: 'A **function** is a reusable, named block of code.' },
    list:      { def: 'An ordered collection of items.', emoji: '📋', fill: 'A **list** is an ordered collection of items.' },
    loop:      { def: 'A for or while loop that repeats code.', emoji: '🔄', fill: 'A **loop** repeats a block of code multiple times.' },
    string:    { def: 'Text stored in quotes: "Hello World".', emoji: '📝', fill: 'A **string** is text stored inside quote marks.' },
    boolean:   { def: 'A value that is True or False.', emoji: '⚖️', fill: 'A **boolean** is a value that is either True or False.' },
    algorithm: { def: 'A precise set of steps to solve a problem.', emoji: '🧮', fill: 'An **algorithm** is a precise set of steps to solve a problem.' },
    debug:     { def: 'Finding and fixing errors in code.', emoji: '🔍', fill: 'To **debug** means to find and fix errors in code.' },
    variable:  { def: 'A named store for a value that can change.', emoji: '📦', fill: 'A **variable** stores a value that can change as the program runs.' },
    integer:   { def: 'A whole number like 0, 5, or -3.', emoji: '🔢', fill: 'An **integer** is a whole number with no decimal point.' },
    'web design': { def: 'Creating websites with HTML and CSS.', emoji: '🌐', fill: '**Web design** uses HTML and CSS to create websites.' },
  },
  6: {
    class:       { def: 'A blueprint for creating objects.', emoji: '🏗️', fill: 'A **class** is a blueprint for creating objects in code.' },
    API:         { def: 'A way for programs to communicate over the internet.', emoji: '🔌', fill: 'An **API** is how programs communicate with each other online.' },
    'neural network': { def: 'An AI system inspired by the structure of the brain.', emoji: '🧠', fill: 'A **neural network** is an AI structure inspired by the human brain.' },
    algorithm:   { def: 'A step-by-step process for solving a complex problem.', emoji: '📋', fill: 'An **algorithm** solves complex problems step by step.' },
    encryption:  { def: 'Scrambling data so only the right person can read it.', emoji: '🔐', fill: '**Encryption** scrambles data so only authorised users can read it.' },
    'cloud computing': { def: 'Running programs on remote servers via the internet.', emoji: '☁️', fill: '**Cloud computing** runs programs on remote internet-connected servers.' },
    recursion:   { def: 'A function that calls itself to solve smaller problems.', emoji: '🌀', fill: '**Recursion** is a function that calls itself to solve smaller versions of a problem.' },
    database:    { def: 'An organised collection of data stored and accessed electronically.', emoji: '🗄️', fill: 'A **database** organises and stores data for efficient access.' },
    'machine learning': { def: 'Training computers to recognise patterns from data.', emoji: '🤖', fill: '**Machine learning** trains computers to recognise patterns in data.' },
    'data science': { def: 'Using code to analyse and visualise large datasets.', emoji: '📉', fill: '**Data science** uses code to find patterns and insights in large datasets.' },
  },
};

function getCategoryConcepts(courseId) {
  return CATEGORY_CONCEPTS[courseId] || YEAR_FALLBACKS[getYearGroup(courseId)] || YEAR_FALLBACKS[4];
}

const CONCEPT_DEFS = {
  sequence: 'Doing instructions one after another, in order.',
  loop: 'Repeating the same blocks again and again.',
  variable: 'A named box that stores a value you can change.',
  conditional: 'Code that runs only when a condition is true.',
  event: 'Something that starts your code running (like clicking the flag).',
  sprite: 'A character or object you can move and animate on the stage.',
  algorithm: 'A clear step-by-step plan to solve a problem.',
  debug: 'Finding and fixing mistakes in your code.',
  function: 'A reusable chunk of code with a name.',
  input: 'Information your program receives from the user.',
  output: 'What your program shows or does as a result.',
  html: 'Tags that structure content on a web page.',
  css: 'Rules that style how a webpage looks.',
  python: 'A text-based language great for games, data, and AI.',
  creativity: 'Using code to express your own ideas and stories.',
  'problem solving': 'Breaking big challenges into smaller steps.',
};

function definitionFor(skill, courseId) {
  const catConcepts = courseId ? getCategoryConcepts(courseId) : {};
  const key = skill.toLowerCase();
  for (const [k, v] of Object.entries(catConcepts)) {
    if (key.includes(k) || k.includes(key)) return v.def;
  }
  for (const [k, v] of Object.entries(CONCEPT_DEFS)) {
    if (key.includes(k)) return v;
  }
  return `An important idea from this lesson: **${skill}**.`;
}

function emojiFor(skill, courseId) {
  const catConcepts = courseId ? getCategoryConcepts(courseId) : {};
  const key = skill.toLowerCase();
  for (const [k, v] of Object.entries(catConcepts)) {
    if (key.includes(k) || k.includes(key)) return v.emoji;
  }
  return ['💡', '🧠', '⭐', '🚀', '🎯'][Math.abs(hashSeed(skill)) % 5];
}

function buildFlipCards(module, seed, courseId, conceptPool) {
  const year = courseId ? getYearGroup(courseId) : 4;
  const catConcepts = getCategoryConcepts(courseId || 'y4-game-dev');
  const challenge = getChallengeForLesson(courseId);
  const difficulty = getDifficultySettings(year, challenge?.type);
  const cardCount = difficulty.cardCount;

  // Use the pre-selected pool (no overlap with match pairs)
  let usedConcepts = (conceptPool || []).filter((k) => catConcepts[k]).slice(0, cardCount);
  if (usedConcepts.length === 0) {
    usedConcepts = pick(seed, Object.keys(catConcepts), cardCount);
  }

  const cards = usedConcepts.slice(0, cardCount).map((concept, i) => {
    const info = catConcepts[concept] || { def: definitionFor(concept, courseId), emoji: '💡' };
    
    // Year 3: Very simple, playful questions with emojis
    let front;
    if (year === 3) {
      const playfulQuestions = [
        `What is a **${concept}**? 🤔`,
        `Tell me about **${concept}**! 👀`,
        `Can you find a **${concept}**? 🔍`,
      ];
      front = playfulQuestions[i % playfulQuestions.length];
    }
    // Year 4: Game-like, slightly more technical
    else if (year === 4) {
      front = `In a game, what is **${concept}** used for? 🎮`;
    }
    // Year 5-6: Professional, code-focused
    else {
      front = `In programming, **${concept}** is...`;
    }

    return {
      id: `card-${i}`,
      front,
      back: info.def,
      emoji: info.emoji,
      difficulty: year,
    };
  });

  const subtitles = {
    3: '🎮 Tap each card to flip it! What will you learn?',
    4: '🃏 Tap to reveal — remember what each thing does!',
    5: '📚 Study the definitions — you\'ll need to remember these!',
    6: '🎓 Master these key concepts from the lesson.',
  };

  return {
    type: 'flip_cards', id: 'flip',
    title: year <= 4 ? '🃏 Concept Cards' : '🃏 Key Definitions',
    subtitle: subtitles[year] || 'Tap each card to learn the meaning.',
    cards,
    difficulty,
  };
}

function buildMatchPairs(module, seed, courseId, conceptPool) {
  const year = courseId ? getYearGroup(courseId) : 4;
  const catConcepts = getCategoryConcepts(courseId || 'y4-game-dev');
  const challenge = getChallengeForLesson(courseId);
  const difficulty = getDifficultySettings(year, challenge?.type);
  const pairCount = Math.max(3, Math.ceil(difficulty.cardCount / 2));

  // Use the pre-selected pool (guaranteed different from flip cards)
  let poolKeys = (conceptPool || []).filter((k) => catConcepts[k]).slice(0, pairCount);
  if (poolKeys.length === 0) {
    const usedByFlip = new Set();
    poolKeys = pick(seed, Object.keys(catConcepts).filter((k) => !usedByFlip.has(k)), pairCount);
  }

  const pairs = poolKeys.map((k) => ({
    term: year === 3 ? `🏷️ ${k}` : k,
    def: catConcepts[k].def.replace(/\*\*/g, ''),
  }));

  // Ensure minimum pairs
  while (pairs.length < pairCount) {
    pairs.push({ term: module.title.split(' ')[0] || 'coding', def: module.description || 'A key idea in this lesson.' });
  }

  const finalPairs = pairs.slice(0, pairCount);
  const terms = shuffle(seed, finalPairs.map((p) => p.term));
  const defs = shuffle(seed + 7, finalPairs.map((p) => p.def));

  const subtitles = {
    3: '🎮 Tap a word, then tap what it means! (Nice job learning!)',
    4: '🎯 Match each term to its meaning to earn points!',
    5: '📚 Match programming terms to precise definitions.',
    6: '🎓 Connect advanced concepts to their correct definitions.',
  };

  return {
    type: 'match', id: 'match',
    title: year <= 4 ? '🔗 Word Match' : '🔗 Match the Pairs',
    subtitle: subtitles[year] || 'Connect each term to its meaning.',
    pairs: finalPairs,
    terms,
    defs,
    difficulty,
  };
}

function buildOrderSteps(module, categoryId, seed, lessonIdx = 0) {
  const year = getYearGroup(categoryId);
  const title = module.title;
  const variant = lessonIdx % 3;
  let steps;
  if (BLOCK_CATEGORIES.has(categoryId)) {
    const sets = [
      [
        { text: year === 3 ? '🚩 Click the green flag to start' : 'Click the green flag to start', order: 0 },
        { text: year === 3 ? '🧩 Drag blocks into your program' : 'Add blocks in the right order', order: 1 },
        { text: year === 3 ? '▶ Press Run and watch your sprite!' : 'Press Run — see what happens', order: 2 },
        { text: year === 3 ? '✏️ Change something and try again!' : 'Tweak your code and re-run', order: 3 },
      ],
      [
        { text: '🎭 Choose a sprite from the library', order: 0 },
        { text: '🎨 Pick a backdrop for your scene', order: 1 },
        { text: '🧩 Add motion and sound blocks', order: 2 },
        { text: '🚩 Click the flag to test your project', order: 3 },
      ],
      [
        { text: '🤔 Plan what you want your program to do', order: 0 },
        { text: '🔁 Use a loop block to repeat actions', order: 1 },
        { text: '❓ Add an if-block to check a condition', order: 2 },
        { text: '🚩 Run and fix any problems you spot', order: 3 },
      ],
    ];
    steps = sets[variant];
  } else if (PYTHON_CATEGORIES.test(categoryId)) {
    const sets = [
      [
        { text: '📖 Read the Python example carefully', order: 0 },
        { text: '✍️ Type or edit code in the editor', order: 1 },
        { text: '▶ Press Run to see the output', order: 2 },
        { text: '🔍 Fix any errors and experiment', order: 3 },
      ],
      [
        { text: '🧠 Plan what your function should do', order: 0 },
        { text: '✍️ Write def and add the function body', order: 1 },
        { text: '📞 Call the function with test values', order: 2 },
        { text: '✅ Check the output matches your expectation', order: 3 },
      ],
      [
        { text: '💡 Understand the problem to solve', order: 0 },
        { text: '📝 Write the algorithm step by step', order: 1 },
        { text: '🐍 Turn each step into Python code', order: 2 },
        { text: '🖨️ Use print() to test your results', order: 3 },
      ],
    ];
    steps = sets[variant];
  } else if (HTML_CATEGORIES.test(categoryId)) {
    const sets = [
      [
        { text: '🏗️ Start with the HTML structure', order: 0 },
        { text: '📝 Add headings, paragraphs and links', order: 1 },
        { text: '🎨 Style with CSS to change colours', order: 2 },
        { text: '👁️ Preview and refine in the browser panel', order: 3 },
      ],
      [
        { text: '🗂️ Create a new HTML file', order: 0 },
        { text: '🔖 Add <head> with a title tag', order: 1 },
        { text: '📄 Add <body> with your page content', order: 2 },
        { text: '🔗 Link a CSS file to style the page', order: 3 },
      ],
      [
        { text: '✏️ Plan your webpage layout on paper', order: 0 },
        { text: '🏗️ Build the structure with HTML tags', order: 1 },
        { text: '🎨 Apply CSS for fonts, colours and spacing', order: 2 },
        { text: '📱 Test on different screen sizes', order: 3 },
      ],
    ];
    steps = sets[variant];
  } else {
    const sets = [
      [
        { text: `Learn about ${title}`, order: 0 },
        { text: 'Try the interactive activity', order: 1 },
        { text: 'Practice in Game Builder', order: 2 },
        { text: 'Pass the quiz checkpoint', order: 3 },
      ],
      [
        { text: 'Read the lesson explanation', order: 0 },
        { text: 'Complete the flip-card challenge', order: 1 },
        { text: 'Finish the matching activity', order: 2 },
        { text: 'Earn your XP and move on', order: 3 },
      ],
      [
        { text: 'Watch the example carefully', order: 0 },
        { text: 'Try it yourself in the editor', order: 1 },
        { text: 'Check your answer', order: 2 },
        { text: 'Reflect on what you learned', order: 3 },
      ],
    ];
    steps = sets[variant];
  }
  const orderTitles = { 3: '🪜 Put Steps in Order', 4: '📋 Put Steps in Order', 5: '🔢 Order the Steps', 6: '🧩 Sequence the Steps' };
  const orderSubs = { 3: 'Drag the steps to put them in the right order!', 4: 'Drag the steps into the correct order.', 5: 'Drag to arrange these steps correctly.', 6: 'Arrange the steps in the correct sequence.' };
  return {
    type: 'order',
    id: 'order',
    title: orderTitles[year] || 'Put Steps in Order',
    subtitle: orderSubs[year] || 'Drag the steps into the correct order (top = first).',
    steps: shuffle(seed, steps.map((s) => ({ ...s, id: `step-${s.order}` }))),
    correctOrder: [0, 1, 2, 3],
  };
}


function buildCodePredict(module, categoryId, seed, lessonIdx = 0) {
  const year = getYearGroup(categoryId);
  const variant = lessonIdx % 3;
  let code, correctAnswer, wrongAnswers;

  if (BLOCK_CATEGORIES.has(categoryId)) {
    if (year === 3) {
      const examples = [
        {
          code: `when 🚩 clicked\n  say "Hello!" for 2 secs\n  move 100 steps`,
          correct: 'Sprite says Hello! then moves forward',
          wrong: ['Nothing happens', 'Sprite disappears', 'Sprite spins around'],
        },
        {
          code: `when 🚩 clicked\n  repeat 3 times\n    move 50 steps`,
          correct: 'Sprite moves 150 steps total (50 three times)',
          wrong: ['Sprite moves 50 steps once', 'Sprite spins 3 times', 'Nothing happens'],
        },
        {
          code: `when space key pressed\n  change costume by 1\n  play sound "pop"`,
          correct: 'Costume changes and a pop sound plays when space is pressed',
          wrong: ['Sprite moves right', 'Program restarts', 'Sprite disappears'],
        },
      ];
      ({ code, correct: correctAnswer, wrong: wrongAnswers } = examples[variant]);
    } else {
      const examples = [
        {
          code: `when 🚩 clicked\n  set [score] to 0\n  repeat 5\n    change [score] by 1`,
          correct: 'Score starts at 0 then goes up to 5',
          wrong: ['Score stays at 0', 'Score becomes 50', 'Program crashes'],
        },
        {
          code: `when 🚩 clicked\n  if <touching [edge]?> then\n    turn 180 degrees`,
          correct: 'Sprite turns around when it touches the edge',
          wrong: ['Sprite stops moving', 'Sprite disappears at the edge', 'Sprite speeds up'],
        },
        {
          code: `when 🚩 clicked\n  set [lives] to 3\n  if <[lives] < 1> then\n    stop all`,
          correct: 'Game would only stop if lives dropped below 1',
          wrong: ['Game stops immediately', 'Lives count up', 'Score resets to 0'],
        },
      ];
      ({ code, correct: correctAnswer, wrong: wrongAnswers } = examples[variant]);
    }
  } else if (PYTHON_CATEGORIES.test(categoryId)) {
    if (year <= 5) {
      const examples = [
        {
          code: `fruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(fruit)`,
          correct: 'Prints each fruit on a new line',
          wrong: ['Prints only "apple"', 'Prints the list as one line', 'Shows a syntax error'],
        },
        {
          code: `x = 10\nif x > 5:\n    print("Big!")\nelse:\n    print("Small!")`,
          correct: 'Prints: Big!',
          wrong: ['Prints: Small!', 'Prints both lines', 'Nothing prints'],
        },
        {
          code: `for i in range(1, 4):\n    print(i * 2)`,
          correct: 'Prints 2, 4, 6 on separate lines',
          wrong: ['Prints 1, 2, 3', 'Prints 2, 4, 6, 8', 'Causes an error'],
        },
      ];
      ({ code, correct: correctAnswer, wrong: wrongAnswers } = examples[variant]);
    } else {
      const examples = [
        {
          code: `def greet(name):\n    return "Hello, " + name\n\nprint(greet("World"))`,
          correct: 'Prints: Hello, World',
          wrong: ['Prints: name', 'Causes an error', 'Prints nothing'],
        },
        {
          code: `numbers = [3, 1, 4, 1, 5]\nnumbers.sort()\nprint(numbers[0])`,
          correct: 'Prints: 1',
          wrong: ['Prints: 3', 'Prints: 5', 'Prints: [1, 1, 3, 4, 5]'],
        },
        {
          code: `def double(n):\n    return n * 2\n\nresult = double(double(3))\nprint(result)`,
          correct: 'Prints: 12',
          wrong: ['Prints: 6', 'Prints: 3', 'Causes a recursion error'],
        },
      ];
      ({ code, correct: correctAnswer, wrong: wrongAnswers } = examples[variant]);
    }
  } else if (HTML_CATEGORIES.test(categoryId)) {
    const examples = [
      {
        code: `<h1>My Website</h1>\n<p>Welcome to my page!</p>`,
        correct: 'A big heading and a paragraph of text',
        wrong: ['Only an image appears', 'The page is blank', 'Shows raw code text'],
      },
      {
        code: `<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>`,
        correct: 'A bullet list with three items',
        wrong: ['A numbered list', 'Three headings', 'A table with three columns'],
      },
      {
        code: `<a href="about.html">About Me</a>`,
        correct: 'A clickable link that goes to the About Me page',
        wrong: ['A heading that says About Me', 'A button that submits a form', 'An image with a caption'],
      },
    ];
    ({ code, correct: correctAnswer, wrong: wrongAnswers } = examples[variant]);
  } else {
    const examples = [
      {
        code: `repeat 5 times:\n  move right\n  move down`,
        correct: 'Moves the character in a staircase pattern',
        wrong: ['Moves only right 5 times', 'Does nothing', 'Moves backwards'],
      },
      {
        code: `if touching wall:\n  bounce\nelse:\n  move forward`,
        correct: 'Character bounces off walls and moves otherwise',
        wrong: ['Character stops at walls', 'Character teleports', 'Program resets'],
      },
      {
        code: `score = 0\nrepeat until score = 10:\n  score = score + 1`,
        correct: 'Score counts up from 0 to 10 then stops',
        wrong: ['Score stays at 0', 'Score counts forever', 'Score decreases'],
      },
    ];
    ({ code, correct: correctAnswer, wrong: wrongAnswers } = examples[variant]);
  }

  const allOptions = shuffle(seed + 3, [correctAnswer, ...wrongAnswers]);
  const titles = {
    3: '🤔 What Will My Sprite Do?',
    4: '🤔 What Will Happen?',
    5: '🐍 What Does This Code Do?',
    6: '🧠 Predict the Output',
  };
  return {
    type: 'predict',
    id: 'predict',
    title: titles[year] || 'What Will Happen?',
    subtitle: year <= 4 ? 'Read the blocks and choose what happens!' : 'Read the code carefully and predict the result.',
    code,
    options: allOptions,
    answer: allOptions.indexOf(correctAnswer),
  };
}

function buildFillBlank(module, seed, courseId, forcedConceptKey) {
  const year = courseId ? getYearGroup(courseId) : 4;
  const catConcepts = getCategoryConcepts(courseId || 'y4-game-dev');
  // Use the forced concept (from practice pool, not in Read activities)
  let chosenKey = forcedConceptKey && catConcepts[forcedConceptKey] ? forcedConceptKey : null;
  if (!chosenKey) {
    const skills = module.keySkills || ['coding'];
    for (const skill of skills) {
      const match = Object.keys(catConcepts).find((k) => skill.toLowerCase().includes(k) || k.includes(skill.toLowerCase()));
      if (match) { chosenKey = match; break; }
    }
    chosenKey = chosenKey || Object.keys(catConcepts)[seed % Object.keys(catConcepts).length];
  }

  // Use the concept's fill sentence (has **key** as the blank marker)
  const conceptInfo = catConcepts[chosenKey];
  const sentence = conceptInfo?.fill || `In computing, **${chosenKey}** is an important concept.`;

  // Use other category concept keys as distractors (more relevant than generic pools)
  const allKeys = Object.keys(catConcepts);
  const pool = allKeys.filter((w) => w !== chosenKey);
  const wordBank = shuffle(seed, [chosenKey, ...pool.slice(0, 3)]);

  return {
    type: 'fill_blank',
    id: 'fill',
    title: year <= 4 ? '✏️ Fill in the Gap' : '✏️ Complete the Sentence',
    subtitle: 'Tap the correct word to complete the sentence.',
    sentence: sentence.replace(`**${chosenKey}**`, '___'),
    correct: chosenKey,
    wordBank,
  };
}

function buildTrueFalse(module, seed, courseId, lessonIdx = 0) {
  const year = courseId ? getYearGroup(courseId) : 4;

  // Category-specific fact pools (9 facts = 3 lessons of 3 unique facts before repeating)
  const categoryFacts = {
    'y3-block-coding': [
      { q: 'Blocks always run from top to bottom, in order.', a: true },
      { q: 'A loop block can repeat steps many times without rewriting them.', a: true },
      { q: 'You need to type code to use Scratch blocks.', a: false },
      { q: 'Clicking the green flag starts your Scratch program.', a: true },
      { q: 'An event block triggers your code when something happens.', a: true },
      { q: 'You can only have one sprite in a Scratch project.', a: false },
      { q: 'Debugging means finding and fixing errors in your code.', a: true },
      { q: 'A sequence means doing steps in a random order.', a: false },
      { q: 'Dragging blocks together joins them into a script.', a: true },
    ],
    'y3-pixel-art': [
      { q: 'A pixel is a tiny square of colour on a screen.', a: true },
      { q: 'Pixel art is made up of thousands of tiny coloured squares.', a: true },
      { q: 'You need an internet connection to create pixel art.', a: false },
      { q: 'Symmetry means both halves of a picture look the same.', a: true },
      { q: 'Animation switches between pictures quickly to create movement.', a: true },
      { q: 'A pixel can only be black or white.', a: false },
      { q: 'A colour palette is the set of colours you choose to use.', a: true },
      { q: 'Higher resolution means fewer pixels in an image.', a: false },
      { q: 'The fill tool paints all pixels inside a shape the same colour.', a: true },
    ],
    'y3-storytelling': [
      { q: 'A backdrop is the background image behind your sprites.', a: true },
      { q: 'A good story has a beginning, middle, and end.', a: true },
      { q: 'Dialogue is the words characters say to each other.', a: true },
      { q: 'Sprites can only say words — they cannot move.', a: false },
      { q: 'A costume gives a sprite a different appearance.', a: true },
      { q: 'You can only have one scene in a Scratch story.', a: false },
      { q: 'Animation can make your sprite look like it is moving.', a: true },
      { q: 'The setting of a story is where and when it takes place.', a: true },
      { q: 'A character in a story must always be human.', a: false },
    ],
    'y3-music': [
      { q: 'The tempo of music is how fast or slow it is played.', a: true },
      { q: 'The beat is the steady pulse that keeps music in time.', a: true },
      { q: 'All music must have the same volume throughout.', a: false },
      { q: 'A melody is a sequence of notes that forms a tune.', a: true },
      { q: 'Pitch describes how high or low a note sounds.', a: true },
      { q: 'A loop plays the same pattern of sounds just once.', a: false },
      { q: 'Composing means creating your own piece of music.', a: true },
      { q: 'Rhythm is the pattern of long and short sounds in music.', a: true },
      { q: 'Volume has no effect on how music sounds.', a: false },
    ],
    'y3-math': [
      { q: 'A coordinate is a pair of numbers that locates a point on a grid.', a: true },
      { q: 'An angle measures how much two lines turn away from each other.', a: true },
      { q: 'A pattern is a sequence that repeats in a random way.', a: false },
      { q: 'Symmetry means both sides of a shape look like mirror images.', a: true },
      { q: 'You can use code to draw shapes and patterns.', a: true },
      { q: 'A variable can store a number that changes as a program runs.', a: true },
      { q: 'An estimate is always the exact correct answer.', a: false },
      { q: 'Sequences of numbers always go up by the same amount.', a: false },
      { q: 'A calculation uses operations like add, subtract, or multiply.', a: true },
    ],
    'y3-animals': [
      { q: 'A sprite can look like any animal you choose.', a: true },
      { q: 'An animal\'s habitat is its natural home in the wild.', a: true },
      { q: 'Changing costumes quickly creates animation.', a: true },
      { q: 'Sprites can only move left and right on the screen.', a: false },
      { q: 'A loop can make an animal repeat an action forever.', a: true },
      { q: 'Clicking a sprite can trigger an event in the code.', a: true },
      { q: 'Backdrops cannot be changed once chosen.', a: false },
      { q: 'Sounds can be added to make animal noises in your project.', a: true },
      { q: 'All animals in Scratch must be cats.', a: false },
    ],
    'y3-sports': [
      { q: 'A score variable goes up each time the player succeeds.', a: true },
      { q: 'A timer counts down the seconds left in a game.', a: true },
      { q: 'A collision happens when two sprites touch each other.', a: true },
      { q: 'Every game must end immediately when the player scores.', a: false },
      { q: 'Speed controls how fast a player sprite moves.', a: true },
      { q: 'The forever loop keeps a game running non-stop.', a: true },
      { q: 'Pressing the spacebar cannot trigger anything in a game.', a: false },
      { q: 'A restart sends the game back to the beginning.', a: true },
      { q: 'Score variables always start at 100 in Scratch.', a: false },
    ],
    'y4-game-dev': [
      { q: 'A variable can store a score that changes during the game.', a: true },
      { q: 'A collision happens when two sprites overlap on screen.', a: true },
      { q: 'The game loop runs forever to keep the game updating.', a: true },
      { q: 'Games never need variables — they just use fixed numbers.', a: false },
      { q: 'A broadcast sends a message that other sprites can hear.', a: true },
      { q: 'Lives and score are common variables in games.', a: true },
      { q: 'A timer variable counts down the seconds left in a round.', a: true },
      { q: 'Conditionals are never used in game programming.', a: false },
      { q: 'A restart resets all variables to their starting values.', a: true },
    ],
    'y4-variables': [
      { q: 'A variable is a named container that stores a value.', a: true },
      { q: 'A string stores text inside quote marks.', a: true },
      { q: 'An integer is a whole number with no decimal point.', a: true },
      { q: 'Variables can never change their value once set.', a: false },
      { q: 'A counter variable goes up by 1 each time an event happens.', a: true },
      { q: 'You can store a player\'s name in a string variable.', a: true },
      { q: 'All variables must store numbers — not text.', a: false },
      { q: 'Assigning a variable means giving it a starting value.', a: true },
      { q: 'A data type describes what kind of value a variable holds.', a: true },
    ],
    'y4-conditionals': [
      { q: 'A conditional runs its code only when the condition is true.', a: true },
      { q: 'An if-else block chooses between two different actions.', a: true },
      { q: 'A boolean value is always either true or false.', a: true },
      { q: 'Conditionals can never be used inside a loop.', a: false },
      { q: 'The AND operator means both conditions must be true.', a: true },
      { q: 'The OR operator means both conditions must be true.', a: false },
      { q: 'A nested if is an if-block inside another if-block.', a: true },
      { q: 'A condition like "score > 5" is either true or false.', a: true },
      { q: 'A bug in a condition causes the wrong code path to run.', a: true },
    ],
    'y4-game-design': [
      { q: 'A game mechanic is a rule or action the player can do.', a: true },
      { q: 'Feedback tells the player what happened — like a score increase.', a: true },
      { q: 'Good game design makes games easier as the player progresses.', a: false },
      { q: 'A prototype is an early version of a game used for testing.', a: true },
      { q: 'Playtesting means watching others play to find improvements.', a: true },
      { q: 'The UI shows the player information like score and lives.', a: true },
      { q: 'A reward is what the player earns for achieving something.', a: true },
      { q: 'Iteration means making a game just once and never changing it.', a: false },
      { q: 'Good challenges make a game interesting without being too hard.', a: true },
    ],
    'y4-web': [
      { q: 'An HTML tag tells the browser what type of content to show.', a: true },
      { q: 'The <p> tag creates a paragraph in HTML.', a: true },
      { q: 'CSS is used to make web pages interactive with JavaScript.', a: false },
      { q: 'CSS controls the colour, font, and layout of a webpage.', a: true },
      { q: 'A link takes you to another web page when clicked.', a: true },
      { q: 'The <h1> tag creates the largest heading on a page.', a: true },
      { q: 'HTML tags always have an opening and closing tag.', a: true },
      { q: 'An image tag in HTML needs a src attribute to load the image.', a: true },
      { q: 'CSS stands for Creative Style Sheets.', a: false },
    ],
    'y4-cyber': [
      { q: 'A strong password should be long and hard to guess.', a: true },
      { q: 'Phishing is a fake message designed to steal your details.', a: true },
      { q: 'It is safe to share your password with your best friend.', a: false },
      { q: 'Malware is harmful software that can damage devices.', a: true },
      { q: 'Two-factor authentication uses two checks to log in.', a: true },
      { q: 'Your digital footprint is the trail of data you leave online.', a: true },
      { q: 'Keeping your personal data private is important online.', a: true },
      { q: 'A backup means deleting your data to save space.', a: false },
      { q: 'Cyber safety means staying safe when using the internet.', a: true },
    ],
    'y4-algorithms': [
      { q: 'An algorithm is a step-by-step plan to solve a problem.', a: true },
      { q: 'A flowchart uses shapes and arrows to map out an algorithm.', a: true },
      { q: 'Pseudocode is written in a specific programming language.', a: false },
      { q: 'A sort algorithm arranges items in a specific order.', a: true },
      { q: 'Tracing an algorithm means following it step by step manually.', a: true },
      { q: 'An efficient algorithm solves problems slowly but carefully.', a: false },
      { q: 'A loop repeats a step in an algorithm until a condition is met.', a: true },
      { q: 'Search algorithms look through data to find specific items.', a: true },
      { q: 'Algorithms can only work with numbers — not words or images.', a: false },
    ],
    'y4-ai': [
      { q: 'AI stands for Artificial Intelligence.', a: true },
      { q: 'Machine learning models are trained on labelled examples.', a: true },
      { q: 'An AI model always gives 100% correct answers.', a: false },
      { q: 'The accuracy of an AI model is how often it is correct.', a: true },
      { q: 'Training data is used to teach an AI to recognise patterns.', a: true },
      { q: 'A label is the correct answer on a training example.', a: true },
      { q: 'Bias in AI only occurs if the programmer makes mistakes.', a: false },
      { q: 'An AI model makes predictions on new data it hasn\'t seen.', a: true },
      { q: 'AI can only work with text — not images or sounds.', a: false },
    ],
    'y5-python': [
      { q: 'In Python, a function is defined using the "def" keyword.', a: true },
      { q: 'Python uses indentation (spaces) to group blocks of code.', a: true },
      { q: 'The print() function displays output in Python.', a: true },
      { q: 'Python lists use curly braces { }.', a: false },
      { q: 'A boolean value in Python is either True or False.', a: true },
      { q: 'A for loop in Python repeats code for each item in a list.', a: true },
      { q: 'You cannot import modules in Python.', a: false },
      { q: 'A string in Python is text enclosed in quote marks.', a: true },
      { q: 'The return statement sends a value back from a function.', a: true },
    ],
    'y5-web': [
      { q: 'CSS stands for Cascading Style Sheets.', a: true },
      { q: 'A CSS selector targets the HTML elements you want to style.', a: true },
      { q: 'Flexbox is a CSS layout system for arranging items in rows or columns.', a: true },
      { q: 'A responsive website looks the same on all screen sizes.', a: false },
      { q: 'A media query applies CSS rules only on screens of a certain size.', a: true },
      { q: 'CSS can be used to create animations using keyframes.', a: true },
      { q: 'The font property controls the text typeface and size.', a: true },
      { q: 'A CSS class can style multiple HTML elements at once.', a: true },
      { q: 'CSS must always be written inside the HTML body tag.', a: false },
    ],
    'y5-data-structures': [
      { q: 'A Python list is an ordered collection of items.', a: true },
      { q: 'A dictionary stores data as key-value pairs.', a: true },
      { q: 'List indexes in Python start at 0, not 1.', a: true },
      { q: 'A tuple is like a list but cannot be changed.', a: true },
      { q: 'The len() function returns the number of items in a list.', a: true },
      { q: 'The append() method removes an item from a list.', a: false },
      { q: 'Iterating over a list means visiting each item using a loop.', a: true },
      { q: 'A dictionary key must be unique within the dictionary.', a: true },
      { q: 'Sorting a list always arranges items in reverse order.', a: false },
    ],
    'y5-algorithms': [
      { q: 'Binary search halves the search space each step.', a: true },
      { q: 'Bubble sort repeatedly swaps neighbouring items until sorted.', a: true },
      { q: 'Big O notation describes how fast an algorithm slows down as data grows.', a: true },
      { q: 'Recursion means a function calls itself.', a: true },
      { q: 'An algorithm with O(n²) time complexity is faster than O(n).', a: false },
      { q: 'Tracing code means following it line by line to find bugs.', a: true },
      { q: 'Merge sort splits a list, sorts each half, then merges them.', a: true },
      { q: 'Pseudocode must use a specific programming language.', a: false },
      { q: 'Each pass through a loop is called an iteration.', a: true },
    ],
    'y5-databases': [
      { q: 'A database table stores data in rows and columns.', a: true },
      { q: 'SQL stands for Structured Query Language.', a: true },
      { q: 'A primary key uniquely identifies each row in a table.', a: true },
      { q: 'The SELECT command retrieves data from a database.', a: true },
      { q: 'A WHERE clause filters rows that match a condition.', a: true },
      { q: 'All databases must use the same data type for every column.', a: false },
      { q: 'A record is one complete set of data — one full row.', a: true },
      { q: 'SQL cannot be used to delete data from a table.', a: false },
      { q: 'A foreign key links a row in one table to a row in another.', a: true },
    ],
    'y5-cyber': [
      { q: 'Encryption scrambles data so only authorised users can read it.', a: true },
      { q: 'A hash is a fixed-length code created from data.', a: true },
      { q: 'HTTPS means a website\'s connection is secure.', a: true },
      { q: 'Phishing attacks use fake messages to steal personal details.', a: true },
      { q: 'A firewall blocks authorised traffic from entering a network.', a: false },
      { q: 'Two-factor authentication requires both a password and a second check.', a: true },
      { q: 'A data breach is when private data is accessed without permission.', a: true },
      { q: 'Malware includes viruses, ransomware, and spyware.', a: true },
      { q: 'Social engineering tricks people into revealing private information.', a: true },
    ],
    'y5-game-advanced': [
      { q: 'A class is a blueprint for creating game objects.', a: true },
      { q: 'An object is one instance of a class.', a: true },
      { q: 'A method is a function attached to a class.', a: true },
      { q: 'Attributes store data inside a class, like self.health.', a: true },
      { q: 'Collision detection is never used in games.', a: false },
      { q: 'A physics engine simulates gravity and friction.', a: true },
      { q: 'Inheritance lets a subclass reuse code from its parent class.', a: true },
      { q: 'Animation cycles through image frames to make movement.', a: true },
      { q: 'The game state tracks whether you are playing, paused, or on the menu.', a: true },
    ],
    'y5-ml': [
      { q: 'Training data is used to teach a machine learning model.', a: true },
      { q: 'A label is the correct answer attached to a training example.', a: true },
      { q: 'Model accuracy is the percentage of correct predictions made.', a: true },
      { q: 'Overfitting means the model works well on new data.', a: false },
      { q: 'A feature is a measurable property used to make predictions.', a: true },
      { q: 'Bias in AI comes from unfair or unbalanced training data.', a: true },
      { q: 'Test data is the same as training data.', a: false },
      { q: 'Classification sorts data into one of several categories.', a: true },
      { q: 'Once a model is trained, it cannot make any mistakes.', a: false },
    ],
  };

  // Year-level fallbacks for categories not listed above
  const yearFacts = {
    6: [
      { q: 'A class is a blueprint for creating objects in code.', a: true },
      { q: 'Recursion means a function calling a completely different function.', a: false },
      { q: 'Encryption makes data unreadable without the correct key.', a: true },
      { q: 'Big O notation describes how fast an algorithm\'s time grows.', a: true },
      { q: 'A neural network is inspired by the structure of the human brain.', a: true },
      { q: 'Cloud computing means running everything on your local machine.', a: false },
      { q: 'A dictionary in Python stores key-value pairs.', a: true },
      { q: 'Binary uses the digits 0, 1, and 2.', a: false },
      { q: 'An object in OOP can have both data and methods.', a: true },
      { q: 'Cybersecurity only matters for large companies.', a: false },
      { q: 'Machine learning models improve by seeing more training data.', a: true },
      { q: 'An API lets programs communicate with each other over the internet.', a: true },
    ],
  };

  const pool = categoryFacts[courseId] || yearFacts[year] || yearFacts[6];
  // Rotate through facts by lesson index so each lesson gets a different set of 3
  const startIdx = (lessonIdx * 3) % pool.length;
  const chosen = [0, 1, 2].map((i) => pool[(startIdx + i) % pool.length]);
  const titles = { 3: '👍 True or False?', 4: '✅ True or False?', 5: '⚖️ True or False?', 6: '🧠 True or False?' };
  return {
    type: 'true_false',
    id: 'tf',
    title: titles[year] || 'True or False?',
    subtitle: year <= 4 ? 'Tap True or False for each one!' : 'Answer each statement correctly.',
    questions: chosen,
  };
}

function buildSpotDifference(module, seed, year) {
  const yearEmojis = {
    3: ['🐱', '🐶', '🐸', '🎮', '🌟', '🎨', '🚀', '🦊'],
    4: ['💻', '🎮', '🌐', '🔒', '🤖', '📱', '🎯', '💡'],
    5: ['🐍', '📊', '🔢', '⚙️', '🧮', '💾', '📡', '🔗'],
    6: ['🤖', '🧠', '☁️', '🔐', '📈', '🌐', '⚡', '🏆'],
  };
  const pool = yearEmojis[year] || yearEmojis[4];
  const target = pick(seed, pool);
  const grid = Array(9).fill(target);
  const oddIdx = seed % 9;
  grid[oddIdx] = pick(seed + 1, pool.filter((e) => e !== target));
  return {
    type: 'spot',
    id: 'spot',
    title: year <= 4 ? '👀 Spot the Odd One Out!' : '🔍 Spot the Difference',
    subtitle: year <= 4 ? 'Find the one that doesn\'t match — tap it!' : 'Find the emoji that doesn\'t belong.',
    grid,
    target,
    oddIndex: oddIdx,
  };
}

/** Read-level interactives (complete all to continue) */
/**
 * Get difficulty multiplier based on year and challenge type
 */
function getDifficultySettings(year, challengeType) {
  // Year 3: Simple, visual, short
  if (year === 3) {
    return { cardCount: 3, timeLimit: 120, complexity: 'easy', useEmoji: true, useColors: true };
  }
  // Year 4: Medium, game-like, more interactive
  if (year === 4) {
    return { cardCount: 4, timeLimit: 90, complexity: 'medium', useEmoji: true, scoring: true };
  }
  // Year 5: Complex, code-based, conceptual
  if (year === 5) {
    return { cardCount: 5, timeLimit: 60, complexity: 'hard', useCode: true, precision: true };
  }
  // Year 6: Advanced, professional, optimization-focused
  return { cardCount: 6, timeLimit: 45, complexity: 'expert', useCode: true, advanced: true };
}

/**
 * Enrich activities with lesson-specific challenge context and age-appropriate difficulty
 */
function enrichActivityWithChallenge(activity, courseId, lessonIdx) {
  const challenge = getChallengeForLesson(courseId, lessonIdx);
  if (!challenge) return activity;

  const year = getYearGroup(courseId);
  const difficulty = getDifficultySettings(year, challenge.type);

  // Create lesson-specific flavor based on challenge type
  const challengeContext = {
    'block_explorer': `Discover blocks in "${challenge.title}" — tap each to see its power! 🔍`,
    'sequence_puzzle': `Order blocks to complete: **${challenge.title}** 📚`,
    'visual_pattern': `Create amazing patterns for: **${challenge.title}** 🎨`,
    'conversation_builder': `Write fun dialogue for: **${challenge.title}** 💬`,
    'game_mechanics_puzzle': `Master **${challenge.title}** — understand game mechanics! 🎮`,
    'game_debug': `Fix the buggy game in **${challenge.title}** 🐛`,
    'sprite_collision': `Build a game for **${challenge.title}** 🎯`,
    'coding_challenge': `Complete the **${challenge.title}** coding challenge 💻`,
    'python_hello': `Write your first Python program! 🐍`,
    'python_loops': `Master loops with **${challenge.title}** 🔄`,
    'python_function': `Create functions for **${challenge.title}** ⚙️`,
    'build_challenge': `Build: **${challenge.title}** 🏗️`,
    'html_forms': `Create forms for **${challenge.title}** 📝`,
    'neural_network': `Train AI for **${challenge.title}** 🧠`,
  };

  const context = challengeContext[challenge.type] || challenge.description;

  // Enhance activity with challenge-specific subtitle and difficulty
  if (activity && context) {
    activity.subtitle = context;
    activity.challengeContext = challenge;
    activity.difficulty = difficulty;
    
    // Adjust activity parameters based on year
    if (activity.type === 'flip_cards') {
      activity.cards = (activity.cards || []).slice(0, difficulty.cardCount);
    }
    if (activity.type === 'match') {
      activity.pairs = (activity.pairs || []).slice(0, difficulty.cardCount / 2);
    }
  }

  return activity;
}

export function getReadInteractives(courseId, lessonIdx, module) {
  const seed = hashSeed(`${courseId}-${lessonIdx}-read`);
  const catConcepts = getCategoryConcepts(courseId);
  const allKeys = Object.keys(catConcepts);
  const n = allKeys.length;

  const courseSeed = hashSeed(courseId);
  const rotatedKeys = shuffle(courseSeed, allKeys);
  const start = (lessonIdx * 3) % n;

  // Pick 3 concept keys for flip/fill activities — advance 3 per lesson so content differs
  const pool3 = [0, 1, 2].map((i) => rotatedKeys[(start + i) % n]);
  // Pick 4 keys for match activities (needs 4 pairs)
  const pool4 = [0, 1, 2, 3].map((i) => rotatedKeys[(start + i) % n]);
  // Fill-blank key — use offset 8 so it never collides with practice section's offset 7
  const fillKey = rotatedKeys[(start + 8) % n];

  // Rotate through 5 different activity-type combinations — each lesson feels different
  const rotIdx = lessonIdx % 5;
  let activities;
  
  switch (rotIdx) {
    case 0:
      // FlipCards → MatchPairs → OrderSteps
      activities = [
        buildFlipCards(module, seed, courseId, pool3),
        buildMatchPairs(module, seed + 11, courseId, pool4),
        buildOrderSteps(module, courseId, seed + 22, lessonIdx),
      ];
      break;
    case 1:
      // TrueFalse → FlipCards → FillBlank
      activities = [
        buildTrueFalse(module, seed, courseId, lessonIdx),
        buildFlipCards(module, seed + 11, courseId, pool3),
        buildFillBlank(module, seed + 22, courseId, fillKey),
      ];
      break;
    case 2:
      // MatchPairs → TrueFalse → OrderSteps
      activities = [
        buildMatchPairs(module, seed, courseId, pool4),
        buildTrueFalse(module, seed + 11, courseId, lessonIdx),
        buildOrderSteps(module, courseId, seed + 22, lessonIdx),
      ];
      break;
    case 3:
      // FillBlank → MatchPairs → FlipCards
      activities = [
        buildFillBlank(module, seed, courseId, fillKey),
        buildMatchPairs(module, seed + 11, courseId, pool4),
        buildFlipCards(module, seed + 22, courseId, pool3),
      ];
      break;
    case 4:
    default:
      // OrderSteps → FillBlank → TrueFalse
      activities = [
        buildOrderSteps(module, courseId, seed, lessonIdx),
        buildFillBlank(module, seed + 11, courseId, fillKey),
        buildTrueFalse(module, seed + 22, courseId, lessonIdx),
      ];
      break;
  }

  // Enrich activities with lesson challenge context
  return activities.map((act, idx) => enrichActivityWithChallenge(act, courseId, lessonIdx));
}

/** Practice-level interactives (non-editor courses) */
export function getPracticeInteractives(courseId, lessonIdx, module) {
  const seed = hashSeed(`${courseId}-${lessonIdx}-practice`);
  const year = getYearGroup(courseId);
  const catConcepts = getCategoryConcepts(courseId);
  const allKeys = Object.keys(catConcepts);
  const n = allKeys.length;

  const courseSeed = hashSeed(courseId);
  const rotatedKeys = shuffle(courseSeed, allKeys);
  const start = (lessonIdx * 3) % n;
  // Offset 7 — never collides with Read's offset 8
  const fillConceptKey = rotatedKeys[(start + 7) % n];

  // Rotate through 4 different activity-type combinations for practice
  const rotIdx = lessonIdx % 4;
  let tasks;
  switch (rotIdx) {
    case 0:
      // CodePredict → FillBlank → TrueFalse  (classic)
      tasks = [
        buildCodePredict(module, courseId, seed, lessonIdx),
        buildFillBlank(module, seed + 5, courseId, fillConceptKey),
        buildTrueFalse(module, seed + 9, courseId, lessonIdx),
      ];
      break;
    case 1:
      // TrueFalse → CodePredict → OrderSteps
      tasks = [
        buildTrueFalse(module, seed, courseId, lessonIdx),
        buildCodePredict(module, courseId, seed + 5, lessonIdx),
        buildOrderSteps(module, courseId, seed + 9, lessonIdx),
      ];
      break;
    case 2:
      // FillBlank → TrueFalse → CodePredict
      tasks = [
        buildFillBlank(module, seed, courseId, fillConceptKey),
        buildTrueFalse(module, seed + 5, courseId, lessonIdx),
        buildCodePredict(module, courseId, seed + 9, lessonIdx),
      ];
      break;
    case 3:
    default:
      // OrderSteps → FillBlank → CodePredict
      tasks = [
        buildOrderSteps(module, courseId, seed, lessonIdx),
        buildFillBlank(module, seed + 5, courseId, fillConceptKey),
        buildCodePredict(module, courseId, seed + 9, lessonIdx),
      ];
      break;
  }

  // Enrich tasks with lesson challenge context
  tasks = tasks.map((t) => enrichActivityWithChallenge(t, courseId, lessonIdx));

  // Add spot-the-difference every 3 lessons for younger years; every 4 for older
  const spotFreq = year <= 4 ? 3 : 4;
  if (lessonIdx % spotFreq === 0) {
    const spotDiff = buildSpotDifference(module, seed + 13, year);
    tasks.push(enrichActivityWithChallenge(spotDiff, courseId, lessonIdx));
  }
  return tasks;
}

export function getPracticeMode(courseId) {
  if (PYTHON_CATEGORIES.test(courseId)) return 'python';
  if (HTML_CATEGORIES.test(courseId)) return 'html';
  if (BLOCK_CATEGORIES.has(courseId) || courseId.startsWith('y3-')) return 'blocks';
  return 'interactive';
}

export function buildBetterQuiz(lessonTitle, skills, categoryId, lessonIdx) {
  const skill = skills[0] || 'coding';
  const s2 = skills[1] || 'practice';
  const isBlock = BLOCK_CATEGORIES.has(categoryId);
  const isPy = PYTHON_CATEGORIES.test(categoryId);
  const isHtml = HTML_CATEGORIES.test(categoryId);

  const q1opts = [
    `Practising ${skill} and ${s2}`,
    'Only watching videos without trying',
    'Memorizing keyboard shortcuts only',
    'Avoiding all computer activities',
  ];

  const q2opts = isBlock
    ? ['Stack blocks in order from top to bottom', 'Write only in Python first', 'Delete every sprite', 'Turn off the screen']
    : isPy
    ? ['Run code and read the output', 'Never press Run', 'Only use blocks', 'Hide all print statements']
    : isHtml
    ? ['Use tags like <h1> and <p> in your page', 'Only draw on paper', 'Remove all HTML tags', 'Close the browser immediately']
    : ['Try the activity hands-on', 'Skip all practice', 'Ignore instructions', 'Never save your work'];

  const q3opts = [
    `Ideas from "${lessonTitle}"`,
    'Unrelated cooking recipes',
    'How to disable learning',
    'Random lottery numbers only',
  ];

  const q4opts = [
    'Earn XP and unlock more lessons',
    'Lose all progress permanently',
    'Break the website on purpose',
    'Nothing — lessons are pointless',
  ];

  const seed = hashSeed(`${categoryId}-${lessonIdx}-quiz`);
  const extra = lessonIdx % 2 === 0
    ? { q: 'What should you do if your code does not work the first time?', options: ['Debug: check each step and try again', 'Give up forever', 'Delete the whole project', 'Blame the computer and walk away'], answer: 0 }
    : { q: 'Why do coders test their programs often?', options: ['To catch mistakes early', 'To slow everything down', 'To avoid learning', 'To remove all blocks'], answer: 0 };

  return [
    { q: `What is the main focus of "${lessonTitle}"?`, options: q1opts, answer: 0 },
    { q: 'What is the best way to learn in this lesson?', options: q2opts, answer: 0 },
    { q: 'The quiz checks that you understood…', options: q3opts, answer: 0 },
    { q: 'Finishing lessons in ByteBuddies helps you…', options: q4opts, answer: 0 },
    extra,
  ];
}
