/**
 * funPacks.js — written content for the pupil mini-games, by topic.
 * tf: true/false statements · sorts: tap-to-sort sets · scenarios: "what should you do?" ·
 * orders: put-the-steps-in-order sets.
 */

export const TF = {
  safety: [
    { s: 'Your password should be kept secret, even from your best friend.', t: true, why: 'Anyone with your password can pretend to be you.' },
    { s: 'It’s fine to tell a game your home address if it offers a prize.', t: false, why: 'Your address is private. Prize pop-ups are often tricks.' },
    { s: 'If something online worries you, you should tell a trusted adult.', t: true, why: 'You are never in trouble for telling.' },
    { s: 'Everyone you meet online is who they say they are.', t: false, why: 'People can pretend to be someone else online.' },
    { s: 'A photo of you in your school uniform can show people where you go to school.', t: true, why: 'Uniform logos can give away private information.' },
    { s: 'Once you delete a post, nobody can ever see it again.', t: false, why: 'Posts can be screenshotted or copied before you delete them.' },
    { s: 'Being unkind online is just as hurtful as being unkind face to face.', t: true, why: 'Words online hurt real people.' },
    { s: 'If someone online asks you to keep a secret from your parents, that’s a red flag.', t: true, why: 'Safe people don’t ask you to hide things from trusted adults.' },
    { s: 'You should reply to mean messages to stick up for yourself.', t: false, why: 'Don’t reply — screenshot, block and tell an adult.' },
    { s: 'The same password for every account is a good idea because it’s easy to remember.', t: false, why: 'If one account is hacked, they all are. Use different passwords.' },
    { s: 'A good password can be three random words joined together.', t: true, why: 'Long, random passwords are much harder to guess.' },
    { s: 'Asking a friend before posting a photo of them is the respectful thing to do.', t: true, why: 'Their photo is part of their digital footprint.' },
  ],
  search: [
    { s: 'The first search result is always the most true.', t: false, why: 'Results are ranked by an algorithm, and the top ones can be adverts.' },
    { s: 'Results marked “Sponsored” or “Ad” were paid for.', t: true, why: 'Companies pay to appear at the top.' },
    { s: 'You should check an important fact on a second trusted website.', t: true, why: 'If two reliable sources agree, it’s more likely to be true.' },
    { s: 'Anyone can make a website, so not everything online is true.', t: true, why: 'There’s no check before people publish.' },
    { s: 'A website that looks professional must be reliable.', t: false, why: 'Anyone can make a slick-looking site. Check who made it.' },
    { s: 'Using 2–4 key words usually works better than typing a long sentence.', t: true, why: 'Key words help the search engine match the right pages.' },
    { s: '“This is the best phone ever!” is a fact.', t: false, why: 'It’s an opinion — you can’t prove it.' },
    { s: 'A website selling something might only show you the good side.', t: true, why: 'Its purpose is to persuade you to buy.' },
    { s: 'Old information can be out of date, so check when a page was updated.', t: true, why: 'Facts change — prices, records and science move on.' },
    { s: 'Search engines read every website live each time you search.', t: false, why: 'They search an index they built earlier — that’s why it’s fast.' },
  ],
  ai: [
    { s: 'AI chatbots can sometimes make up facts that sound true.', t: true, why: 'They predict likely words; they don’t check facts like people do.' },
    { s: 'If an AI sounds confident, it must be right.', t: false, why: 'AI can be confidently wrong. Always verify.' },
    { s: 'AI learns patterns from its training data.', t: true, why: 'That’s how machine learning works.' },
    { s: 'If the training data is unfair, the AI can be unfair too.', t: true, why: 'AI copies patterns, including biased ones.' },
    { s: 'Computers can’t be biased because they are machines.', t: false, why: 'They can learn bias from the data people give them.' },
    { s: 'An AI-made image can look like a real photo.', t: true, why: 'Look for clues like odd hands, text or shadows.' },
    { s: 'It’s honest to say when you used AI to help with work.', t: true, why: 'Being open about AI use is responsible.' },
    { s: 'AI should make important decisions with no human checking.', t: false, why: 'Humans should check important decisions.' },
    { s: 'Testing an AI on lots of different people helps make it fairer.', t: true, why: 'It shows who it works badly for, so it can be fixed.' },
  ],
  network: [
    { s: 'A network is two or more devices connected to share information.', t: true, why: 'That’s the definition of a network.' },
    { s: 'Wi-Fi means there are no connections at all.', t: false, why: 'Wi-Fi is a connection — it uses radio waves instead of cables.' },
    { s: 'The internet is a network of networks.', t: true, why: 'Millions of networks are linked together.' },
    { s: 'Data travels across the internet in small packets.', t: true, why: 'Big files are split into packets and put back together.' },
    { s: 'If one link breaks, the whole internet stops working.', t: false, why: 'Routers can send packets another way.' },
    { s: 'The internet and the World Wide Web are exactly the same thing.', t: false, why: 'The web is one service that uses the internet, like email does.' },
    { s: 'A router passes messages towards where they need to go.', t: true, why: 'Routers are like sorting offices for packets.' },
    { s: 'Encryption scrambles a message so only the right person can read it.', t: true, why: 'They need the key to unscramble it.' },
    { s: 'A padlock in the browser means the website is honest.', t: false, why: 'It means the connection is encrypted — not that the site is trustworthy.' },
    { s: 'Passwords help stop strangers joining a network.', t: true, why: 'Only people with the password can connect.' },
  ],
  collab: [
    { s: 'In pair programming, only the driver uses the mouse and keyboard.', t: true, why: 'The navigator guides with words.' },
    { s: 'If you disagree with your partner, the loudest person should win.', t: false, why: 'Test both ideas — the program shows which works.' },
    { s: 'A helpful comment says exactly what could be improved.', t: true, why: 'Specific feedback is useful feedback.' },
    { s: 'It’s fine to delete someone else’s work in a shared document if you don’t like it.', t: false, why: 'Leave a comment or talk to them instead.' },
    { s: 'Version history lets you go back to an older version.', t: true, why: 'Mistakes can be undone.' },
    { s: 'Swapping roles often means both partners learn every part.', t: true, why: 'Both should be able to explain the program.' },
    { s: '“It’s good” is the most useful feedback you can give.', t: false, why: 'Say what is good and why, and one thing to improve.' },
    { s: 'Sharing a document as “Commenter” means people can’t change your work.', t: true, why: 'They can only leave comments.' },
  ],
  web: [
    { s: 'HTML gives a web page its structure.', t: true, why: 'Tags mark headings, paragraphs, images and links.' },
    { s: 'CSS controls colours, fonts and layout.', t: true, why: 'HTML is structure; CSS is style.' },
    { s: 'Alt text helps people using screen readers understand images.', t: true, why: 'Screen readers read the alt text aloud.' },
    { s: 'The best web pages have lots of tiny text and no headings.', t: false, why: 'Short paragraphs and clear headings are easier to read.' },
    { s: 'A wireframe is a simple sketch of where things go on a page.', t: true, why: 'Designers sketch before they build.' },
    { s: 'Good apps give feedback, like a tick when something is saved.', t: true, why: 'Users need to know their action worked.' },
    { s: 'You should design an app for yourself, not the people who will use it.', t: false, why: 'Design for your real users and test with them.' },
  ],
  media: [
    { s: 'Bitmap images are made of tiny squares called pixels.', t: true, why: 'Zoom in far enough and you’ll see them.' },
    { s: 'Vector images go blurry when you make them bigger.', t: false, why: 'Vectors are maths shapes, so they stay sharp.' },
    { s: 'Animation is lots of pictures shown quickly one after another.', t: true, why: 'Our eyes blend them into movement.' },
    { s: 'To draw a square with code you turn 90° four times.', t: true, why: '4 × 90° = 360°, a full turn.' },
    { s: 'You can use any song from the internet in your project.', t: false, why: 'Only use media you made or have permission to use.' },
    { s: 'Pen down makes the sprite draw as it moves.', t: true, why: 'Pen up stops it drawing.' },
    { s: 'To draw a triangle the sprite turns 60° each time.', t: false, why: 'It turns 120° (360 ÷ 3).' },
    { s: '3D objects in games are built from lots of flat shapes called polygons.', t: true, why: 'Usually triangles!' },
  ],
  events: [
    { s: 'Clicking the green flag is an event.', t: true, why: 'Events are things that happen and start code.' },
    { s: 'Blocks that aren’t snapped under a hat block still run.', t: false, why: 'Only blocks attached to a hat run.' },
    { s: 'One project can have many scripts waiting for different events.', t: true, why: 'That’s how games react to the player.' },
    { s: 'A “when space key pressed” script runs when you click the green flag.', t: false, why: 'It only runs when space is pressed.' },
    { s: 'Broadcast lets one sprite send a message to other sprites.', t: true, why: 'Scripts starting “when I receive…” then run.' },
    { s: 'A key press is an input.', t: true, why: 'Information goes into the computer.' },
  ],
  debug: [
    { s: 'A bug is a mistake in a program.', t: true, why: 'Debugging means finding and fixing it.' },
    { s: 'When something goes wrong, change lots of blocks at once.', t: false, why: 'Change one thing, then test — or you won’t know what fixed it.' },
    { s: 'Running a program slowly can help you spot where it goes wrong.', t: true, why: 'You can see the first moment it goes wrong.' },
    { s: 'Testing only the right answers is enough.', t: false, why: 'Test wrong and unusual answers too — that’s where bugs hide.' },
    { s: 'Explaining your code out loud can help you find a bug.', t: true, why: 'It’s called rubber duck debugging!' },
    { s: 'Every programmer makes bugs — even experts.', t: true, why: 'Fixing them is a normal part of coding.' },
    { s: 'A good bug report says what you expected AND what actually happened.', t: true, why: 'Then someone else can fix it.' },
  ],
  project: [
    { s: 'Planning before you code saves time.', t: true, why: 'Problems are easier to fix on paper.' },
    { s: 'Success criteria describe what “finished and good” looks like.', t: true, why: 'Everyone can check the work fairly.' },
    { s: 'It’s best to build everything, then test only at the very end.', t: false, why: 'Test each part as you go — bugs are easier to find.' },
    { s: 'A storyboard shows each part of a project in order.', t: true, why: 'Like a comic strip of your plan.' },
    { s: 'Must-have features should come before nice-to-have features.', t: true, why: 'The product has to work first.' },
    { s: 'Decomposition means making a problem bigger.', t: false, why: 'It means breaking it into smaller parts.' },
    { s: 'Feedback from other people helps you improve your work.', t: true, why: 'They notice things you don’t.' },
  ],
  algorithms: [
    { s: 'An algorithm is a set of steps in order to solve a problem.', t: true, why: 'Like a recipe.' },
    { s: 'The order of the steps in an algorithm doesn’t matter.', t: false, why: 'Socks before shoes! Order matters.' },
    { s: 'Computers can guess what you mean if your instructions are unclear.', t: false, why: 'Computers do exactly what the steps say.' },
    { s: 'A recipe is an example of an algorithm.', t: true, why: 'Steps, in order, to reach a goal.' },
    { s: 'Pseudocode is plain-English code for planning.', t: true, why: 'It helps you think before you code.' },
    { s: 'An efficient algorithm uses fewer steps to get the same result.', t: true, why: 'Shorter is quicker and easier to fix.' },
    { s: 'A simulation copies how a real system works.', t: true, why: 'So we can test ideas safely.' },
  ],
  data: [
    { s: 'Data can be numbers, words, pictures or sounds.', t: true, why: 'All of these are facts or information.' },
    { s: 'A tally chart is a quick way to count while you collect data.', t: true, why: 'Gates of five make counting easy.' },
    { s: 'A chart doesn’t need a title or labels.', t: false, why: 'Without them nobody knows what the bars mean.' },
    { s: 'In a bar chart, the tallest bar shows the biggest number.', t: true, why: 'Height shows the amount.' },
    { s: 'You should collect people’s addresses for a survey about favourite fruit.', t: false, why: 'Only collect the data you need.' },
    { s: 'A line graph is good for showing change over time.', t: true, why: 'Like temperature each day.' },
    { s: 'A survey of one class tells you exactly what the whole country thinks.', t: false, why: 'A small group may not represent everyone.' },
    { s: 'In a database, each row is a record.', t: true, why: 'And each column is a field.' },
    { s: 'Sorting data can help you spot the biggest and smallest quickly.', t: true, why: 'They end up at the top and bottom.' },
  ],
  python: [
    { s: 'In Python, text must be inside quote marks.', t: true, why: 'print("Hello") — otherwise Python thinks it’s a variable.' },
    { s: 'battery = 80 makes a variable called battery.', t: true, why: '= stores a value in a variable.' },
    { s: 'Python runs from the bottom of the program to the top.', t: false, why: 'It runs top to bottom.' },
    { s: 'range(3) gives the numbers 1, 2, 3.', t: false, why: 'It gives 0, 1, 2 — Python counts from 0.' },
    { s: 'Lines inside an if or for need to be indented.', t: true, why: 'Indentation shows which lines belong inside.' },
    { s: 'def is used to create a function.', t: true, why: 'def cheer(name): starts a function.' },
    { s: 'The first item in a Python list is item 1.', t: false, why: 'The first item is at position 0.' },
  ],
};

const bins2 = (a, b) => [a, b];
export const SORTS = {
  privacy: {
    title: 'Private or OK to share?',
    bins: bins2({ id: 'p', label: 'Keep private', icon: '🔒' }, { id: 's', label: 'OK to share', icon: '✅' }),
    items: [
      { text: 'Your home address', bin: 'p' }, { text: 'Your favourite colour', bin: 's' }, { text: 'Your password', bin: 'p' },
      { text: 'Your favourite animal', bin: 's' }, { text: 'Your phone number', bin: 'p' }, { text: 'A drawing of a dragon', bin: 's' },
      { text: 'The name of your school', bin: 'p' }, { text: 'Your opinion of a book', bin: 's' }, { text: 'A photo of you in uniform', bin: 'p' },
      { text: 'Your favourite football team', bin: 's' },
    ],
  },
  kindness: {
    title: 'Kind or unkind?',
    bins: bins2({ id: 'k', label: 'Kind', icon: '💚' }, { id: 'u', label: 'Unkind', icon: '💔' }),
    items: [
      { text: '“I love the colours in your drawing!”', bin: 'k' }, { text: '“LOL who made THAT?”', bin: 'u' },
      { text: 'Asking before sharing a friend’s photo', bin: 'k' }, { text: 'Leaving someone out of a group chat on purpose', bin: 'u' },
      { text: '“Great game — want to play again?”', bin: 'k' }, { text: 'Sharing a screenshot to laugh at someone', bin: 'u' },
      { text: '“Maybe add a title to make it even better?”', bin: 'k' }, { text: 'Typing in capitals to shout at someone', bin: 'u' },
    ],
  },
  passwords: {
    title: 'Strong or weak password?',
    bins: bins2({ id: 's', label: 'Strong', icon: '💪' }, { id: 'w', label: 'Weak', icon: '🥀' }),
    items: [
      { text: 'password', bin: 'w' }, { text: 'PurpleTrainCactus!7', bin: 's' }, { text: '123456', bin: 'w' },
      { text: 'Your pet’s name', bin: 'w' }, { text: 'CloudPencilRiver42', bin: 's' }, { text: 'Your birthday', bin: 'w' },
      { text: 'MangoLadderWhistle#', bin: 's' }, { text: 'qwerty', bin: 'w' },
    ],
  },
  phishing: {
    title: 'Real message or phishing?',
    bins: bins2({ id: 'r', label: 'Looks OK', icon: '📧' }, { id: 'f', label: 'Phishing!', icon: '🎣' }),
    items: [
      { text: '“URGENT!! Your account is locked. Click hear now!”', bin: 'f', why: 'Urgency + spelling mistake + odd link.' },
      { text: '“Reminder: swimming kit needed on Friday.” — from your school', bin: 'r' },
      { text: '“You won a free tablet! Enter your password to claim.”', bin: 'f', why: 'Too good to be true, and asks for a password.' },
      { text: '“Your library book is due back next week.”', bin: 'r' },
      { text: '“Send your login to keep your game account.”', bin: 'f', why: 'Real companies never ask for your password.' },
      { text: '“Your homework has been marked.” — in the school app', bin: 'r' },
    ],
  },
  adverts: {
    title: 'Advert or search result?',
    bins: bins2({ id: 'a', label: 'Advert', icon: '💰' }, { id: 'r', label: 'Search result', icon: '🔎' }),
    items: [
      { text: 'Sponsored · BUY the best trainers now!', bin: 'a' }, { text: 'Encyclopedia: How volcanoes form', bin: 'r' },
      { text: 'Ad · 50% off toys today only', bin: 'a' }, { text: 'Museum website: The Romans in Britain', bin: 'r' },
      { text: 'Sponsored · Download our game FREE', bin: 'a' }, { text: 'Weather service: Forecast for tomorrow', bin: 'r' },
    ],
  },
  factOpinion: {
    title: 'Fact or opinion?',
    bins: bins2({ id: 'f', label: 'Fact', icon: '📊' }, { id: 'o', label: 'Opinion', icon: '💬' }),
    items: [
      { text: 'Water boils at 100°C at sea level.', bin: 'f' }, { text: 'Pizza is the best food in the world.', bin: 'o' },
      { text: 'The Moon orbits the Earth.', bin: 'f' }, { text: 'Homework is a waste of time.', bin: 'o' },
      { text: 'London is the capital of England.', bin: 'f' }, { text: 'This phone looks amazing.', bin: 'o' },
      { text: 'A spider has eight legs.', bin: 'f' }, { text: 'Football is more fun than tennis.', bin: 'o' },
    ],
  },
  io: {
    title: 'Input or output?',
    bins: bins2({ id: 'i', label: 'Input', icon: '⌨️' }, { id: 'o', label: 'Output', icon: '🖥️' }),
    items: [
      { text: 'Keyboard', bin: 'i' }, { text: 'Speaker', bin: 'o' }, { text: 'Microphone', bin: 'i' }, { text: 'Screen', bin: 'o' },
      { text: 'Mouse', bin: 'i' }, { text: 'Printer', bin: 'o' }, { text: 'Light sensor', bin: 'i' }, { text: 'Motor', bin: 'o' },
      { text: 'Touch screen tap', bin: 'i' }, { text: 'LED light', bin: 'o' },
    ],
  },
  events: {
    title: 'Event or action?',
    bins: bins2({ id: 'e', label: 'Event (starts code)', icon: '🏁' }, { id: 'a', label: 'Action (does something)', icon: '🎬' }),
    items: [
      { text: 'when ▶ clicked', bin: 'e' }, { text: 'move 10 steps', bin: 'a' }, { text: 'when space key pressed', bin: 'e' },
      { text: 'say Hello!', bin: 'a' }, { text: 'when this sprite clicked', bin: 'e' }, { text: 'play sound pop', bin: 'a' },
      { text: 'when I receive game over', bin: 'e' }, { text: 'turn right 90', bin: 'a' },
    ],
  },
  constructs: {
    title: 'Sequence, loop or decision?',
    bins: [{ id: 's', label: 'Sequence', icon: '➡️' }, { id: 'l', label: 'Loop', icon: '🔁' }, { id: 'd', label: 'Decision', icon: '🔀' }],
    items: [
      { text: 'Brush your teeth 30 times', bin: 'l' }, { text: 'If it’s raining, take a coat', bin: 'd' }, { text: 'Put socks on, then shoes', bin: 's' },
      { text: 'Keep stirring until it boils', bin: 'l' }, { text: 'If the score is 10, you win', bin: 'd' }, { text: 'Open the door, walk in, close it', bin: 's' },
      { text: 'Clap 4 times', bin: 'l' }, { text: 'If the light is red, stop', bin: 'd' },
    ],
  },
  varNames: {
    title: 'Good or unclear variable name?',
    bins: bins2({ id: 'g', label: 'Clear name', icon: '✅' }, { id: 'u', label: 'Unclear', icon: '❓' }),
    items: [
      { text: 'score', bin: 'g' }, { text: 'x', bin: 'u' }, { text: 'livesLeft', bin: 'g' }, { text: 'thing', bin: 'u' },
      { text: 'timer', bin: 'g' }, { text: 'abc', bin: 'u' }, { text: 'playerSpeed', bin: 'g' }, { text: 'stuff2', bin: 'u' },
    ],
  },
  mustNice: {
    title: 'Must-have or nice-to-have?',
    how: 'You are building a maze game. Is each feature a must-have or a nice extra?',
    bins: bins2({ id: 'm', label: 'Must-have', icon: '⭐' }, { id: 'n', label: 'Nice-to-have', icon: '✨' }),
    items: [
      { text: 'The player can move', bin: 'm' }, { text: 'Rainbow trail behind the player', bin: 'n' }, { text: 'Walls the player can’t go through', bin: 'm' },
      { text: 'A goal to reach', bin: 'm' }, { text: 'Background music', bin: 'n' }, { text: 'Costume shop', bin: 'n' },
      { text: 'A way to win', bin: 'm' }, { text: 'Fireworks when you win', bin: 'n' },
    ],
  },
  comments: {
    title: 'Helpful or unhelpful feedback?',
    bins: bins2({ id: 'h', label: 'Helpful', icon: '👍' }, { id: 'u', label: 'Unhelpful', icon: '👎' }),
    items: [
      { text: '“The jump is great — maybe make level 2 a little easier?”', bin: 'h' }, { text: '“Boring.”', bin: 'u' },
      { text: '“I got stuck because I didn’t know which key jumps.”', bin: 'h' }, { text: '“Mine is better.”', bin: 'u' },
      { text: '“Your loop saved loads of blocks — clever!”', bin: 'h' }, { text: '“It’s fine I guess.”', bin: 'u' },
    ],
  },
  vectorBitmap: {
    title: 'Vector or bitmap?',
    bins: bins2({ id: 'v', label: 'Vector (shapes)', icon: '🔷' }, { id: 'b', label: 'Bitmap (pixels)', icon: '🟦' }),
    items: [
      { text: 'A school logo that must look sharp on a banner', bin: 'v' }, { text: 'A photo of your pet', bin: 'b' },
      { text: 'A cartoon character for a game', bin: 'v' }, { text: 'A scanned painting', bin: 'b' },
      { text: 'An icon for an app', bin: 'v' }, { text: 'A selfie', bin: 'b' },
    ],
  },
  htmlCss: {
    title: 'HTML or CSS?',
    bins: bins2({ id: 'h', label: 'HTML (structure)', icon: '🧱' }, { id: 'c', label: 'CSS (style)', icon: '🎨' }),
    items: [
      { text: '<h1>My Club</h1>', bin: 'h' }, { text: 'color: green;', bin: 'c' }, { text: '<a href="join.html">Join</a>', bin: 'h' },
      { text: 'font-size: 20px;', bin: 'c' }, { text: '<img src="cat.jpg" alt="A cat">', bin: 'h' }, { text: 'background: yellow;', bin: 'c' },
    ],
  },
  surveyQ: {
    title: 'Fair or leading question?',
    bins: bins2({ id: 'f', label: 'Fair question', icon: '⚖️' }, { id: 'l', label: 'Leading question', icon: '👉' }),
    items: [
      { text: 'Which lunch do you like most?', bin: 'f' }, { text: 'Don’t you agree pizza is the best lunch?', bin: 'l' },
      { text: 'How do you travel to school?', bin: 'f' }, { text: 'Walking is healthiest — do you walk?', bin: 'l' },
      { text: 'How many books did you read last week?', bin: 'f' }, { text: 'Everyone loves football, right?', bin: 'l' },
    ],
  },
  fairData: {
    title: 'Fair or biased training data?',
    how: 'An AI is being trained to recognise children’s voices.',
    bins: bins2({ id: 'f', label: 'Fair data', icon: '⚖️' }, { id: 'b', label: 'Biased data', icon: '⚠️' }),
    items: [
      { text: 'Voices from children all over the UK', bin: 'f' }, { text: 'Only voices from one class', bin: 'b' },
      { text: 'Boys’ and girls’ voices', bin: 'f' }, { text: 'Only adults pretending to be children', bin: 'b' },
      { text: 'Quiet rooms and noisy playgrounds', bin: 'f' }, { text: 'Only recordings made in one quiet studio', bin: 'b' },
    ],
  },
  formulaValue: {
    title: 'Formula or value?',
    bins: bins2({ id: 'f', label: 'Formula', icon: '🧮' }, { id: 'v', label: 'Typed value', icon: '🔢' }),
    items: [
      { text: '=B2*C2', bin: 'f' }, { text: '42', bin: 'v' }, { text: '=SUM(D2:D5)', bin: 'f' }, { text: 'Pizza', bin: 'v' },
      { text: '=A1+A2', bin: 'f' }, { text: '3.50', bin: 'v' },
    ],
  },
  online: {
    title: 'Needs a network or works offline?',
    bins: bins2({ id: 'n', label: 'Needs a network', icon: '🌐' }, { id: 'o', label: 'Works offline', icon: '📴' }),
    items: [
      { text: 'Video call with Grandma', bin: 'n' }, { text: 'Drawing in a paint app', bin: 'o' }, { text: 'Sending an email', bin: 'n' },
      { text: 'Using a calculator app', bin: 'o' }, { text: 'Searching the web', bin: 'n' }, { text: 'Reading a downloaded e-book', bin: 'o' },
    ],
  },
  goodDebug: {
    title: 'Good debugging habit?',
    bins: bins2({ id: 'g', label: 'Good habit', icon: '👍' }, { id: 'b', label: 'Bad habit', icon: '👎' }),
    items: [
      { text: 'Change one thing, then test', bin: 'g' }, { text: 'Delete everything and start again', bin: 'b' },
      { text: 'Run it slowly and watch', bin: 'g' }, { text: 'Change lots of blocks at once', bin: 'b' },
      { text: 'Say each step out loud', bin: 'g' }, { text: 'Only test the right answers', bin: 'b' },
    ],
  },
};

export const SCENARIOS = {
  safety: [
    { q: 'A pop-up says you’ve won a prize — just type your address!', options: ['Close it and tell an adult', 'Type your address quickly', 'Share it with friends'], answer: 0, why: 'Your address is private, and prize pop-ups are often tricks.' },
    { q: 'Someone in a game keeps sending you mean messages.', options: ['Block, screenshot and tell an adult', 'Send mean messages back', 'Keep it a secret'], answer: 0, why: 'Don’t reply — block, save evidence and tell.' },
    { q: 'An online “friend” asks you to move to a private chat and not tell your parents.', options: ['Say no and tell a trusted adult', 'Agree, it’s just a chat', 'Give them your number'], answer: 0, why: 'Secrecy is a red flag.' },
    { q: 'You see something online that makes you feel scared.', options: ['Turn the screen over and tell an adult', 'Keep watching', 'Share it'], answer: 0, why: 'You’re never in trouble for telling.' },
    { q: 'Your friend asks for your password to help in a game.', options: ['Keep it secret', 'Tell them — they’re your friend', 'Write it on your hand'], answer: 0, why: 'Passwords are never shared, even with friends.' },
    { q: 'You want to post a funny photo of a friend.', options: ['Ask them first', 'Post it — it’s funny', 'Post it without their name'], answer: 0, why: 'Their photo is part of their footprint.' },
  ],
  search: [
    { q: 'Two websites disagree about a fact. What do you do?', options: ['Check a third trusted source', 'Believe the first one', 'Believe the prettiest one'], answer: 0, why: 'Find out what other reliable sources say.' },
    { q: 'A site says “This sweet makes you super smart!” and sells sweets.', options: ['Be sceptical — it wants to sell', 'Buy them all', 'It must be true'], answer: 0, why: 'Its purpose is to persuade you to buy.' },
    { q: 'Which search is likely to work best?', options: ['tallest animal world', 'please could you tell me what the tallest animal is', 'animal'], answer: 0, why: 'A few key words work best.' },
  ],
  ai: [
    { q: 'An AI gives you a fact for your homework.', options: ['Check it with a trusted source', 'Copy it straight in', 'Assume it’s right because it’s AI'], answer: 0, why: 'AI can make mistakes and invent facts.' },
    { q: 'A picture shows a cat riding a dolphin. What might it be?', options: ['An AI-made or edited image', 'Definitely a real photo', 'A news report'], answer: 0, why: 'Look for clues — and check where it came from.' },
    { q: 'An AI trained only on adults’ faces struggles with children. Why?', options: ['Its training data was biased', 'Children are hard to see', 'AI can’t see faces'], answer: 0, why: 'It never learned from children’s faces.' },
  ],
};

export const ORDERS = {
  worried: { title: 'Something online worries you. What do you do?', steps: ['Stop', 'Turn the screen over or close it', 'Tell a trusted adult', 'Report or block together'] },
  search: { title: 'Put the smart search steps in order', steps: ['Choose 2–4 key words', 'Skip the adverts', 'Check who made the page', 'Check a second source'] },
  packet: { title: 'How does a photo travel across the internet?', steps: ['The photo is split into packets', 'Each packet gets an address', 'Routers pass packets along', 'Packets arrive and are put back in order'] },
  project: { title: 'Put the project steps in order', steps: ['Plan and decompose', 'Write success criteria', 'Build one part', 'Test it', 'Improve with feedback'] },
  data: { title: 'Data detective steps', steps: ['Ask a question', 'Collect the data', 'Present it in a chart', 'Explain what it shows'] },
  debug: { title: 'Put the debugging steps in order', steps: ['Run it and watch', 'Find the first thing that goes wrong', 'Change one thing', 'Test again'] },
  pair: { title: 'Pair programming steps', steps: ['Read the task together', 'Agree the next small step', 'Driver builds, navigator checks', 'Test it', 'Swap roles'] },
  web: { title: 'Building a web page', steps: ['Know your audience', 'Sketch a wireframe', 'Write the HTML structure', 'Add CSS style', 'Test the links'] },
  toast: { title: 'Algorithm: jam on toast', steps: ['Put bread in the toaster', 'Push the lever down', 'Wait for it to pop up', 'Put toast on a plate', 'Spread the jam'] },
  teeth: { title: 'Algorithm: brush your teeth', steps: ['Pick up your toothbrush', 'Put toothpaste on it', 'Brush for two minutes', 'Rinse the brush'] },
  traffic: { title: 'UK traffic light sequence (starting at red)', steps: ['Red', 'Red and amber', 'Green', 'Amber'] },
  version: { title: 'Saving your work with version control', steps: ['Make one small change', 'Test it works', 'Save a version with a clear message', 'Start the next change'] },
  animation: { title: 'Make a walking animation', steps: ['when ▶ clicked', 'repeat 10', 'next costume', 'move 10', 'wait 0.2'] },
};
