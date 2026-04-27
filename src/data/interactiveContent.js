// Interactive content for learn page modules
// Loaded by LearningHub to embed BlockEditor or PythonRunner in lessons

export const INTERACTIVE = {
  // ── My First Code (block coding) ───────────────────────────────────────────
  'y3-first-steps': {
    // Module 0: Meet the Blocks! — just the flag block
    0: {
      type: 'blocks',
      pictobloxLayout: true,
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'move', params: { steps: 10 } },
        { type: 'forever', params: {}, children: [] },
        { type: 'broadcast', params: { msg: 'message1' } },
      ],
    },
    // Module 1: Make Your Sprite Talk — say blocks
    1: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'say', params: { msg: 'Hi! My name is Sparky!' } },
        { type: 'say', params: { msg: 'I love block coding!' } },
      ],
    },
    // Module 2: Wait for It — say + wait
    2: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'say', params: { msg: 'Knock knock!' } },
        { type: 'wait', params: { secs: 2 } },
        { type: 'say', params: { msg: "Who's there?" } },
        { type: 'wait', params: { secs: 2 } },
        { type: 'say', params: { msg: 'Lettuce!' } },
        { type: 'wait', params: { secs: 2 } },
        { type: 'say', params: { msg: "Lettuce in, it's cold out here! 🥬" } },
      ],
    },
    // Module 3: Move Your Sprite — move blocks
    3: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'say', params: { msg: "I'm going on a walk!" } },
        { type: 'wait', params: { secs: 1 } },
        { type: 'move', params: { steps: 50 } },
        { type: 'wait', params: { secs: 1 } },
        { type: 'move', params: { steps: 50 } },
      ],
    },
    // Module 4: Turn and Change Direction — move + turn
    4: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'move', params: { steps: 100 } },
        { type: 'turn_r', params: { deg: 90 } },
        { type: 'move', params: { steps: 100 } },
      ],
    },
    // Module 5: Pick Up the Pen! — pen_down + move
    5: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'say', params: { msg: 'Watch me draw!' } },
        { type: 'wait', params: { secs: 1 } },
        { type: 'pen_down', params: {} },
        { type: 'move', params: { steps: 100 } },
        { type: 'pen_up', params: {} },
      ],
    },
    // Module 6: Repeat Block Magic — repeat loop drawing a square
    6: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'pen_down', params: {} },
        { type: 'repeat', params: { n: 4 }, children: [
          { type: 'move', params: { steps: 80 } },
          { type: 'turn_r', params: { deg: 90 } },
        ]},
        { type: 'pen_up', params: {} },
      ],
    },
    // Module 7: Colourful Drawing — pen_color + repeat hexagon
    7: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'pen_color', params: { color: '#ef4444' } },
        { type: 'pen_down', params: {} },
        { type: 'repeat', params: { n: 6 }, children: [
          { type: 'move', params: { steps: 60 } },
          { type: 'turn_r', params: { deg: 60 } },
        ]},
        { type: 'pen_up', params: {} },
      ],
    },
    // Module 8: Thick and Thin Lines — pen_size + circle spiral
    8: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'pen_size', params: { size: 5 } },
        { type: 'pen_color', params: { color: '#6366f1' } },
        { type: 'pen_down', params: {} },
        { type: 'repeat', params: { n: 36 }, children: [
          { type: 'move', params: { steps: 10 } },
          { type: 'turn_r', params: { deg: 10 } },
        ]},
        { type: 'pen_up', params: {} },
      ],
    },
    // Module 9: Jump to Any Spot — go_xy positioning
    9: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'go_xy', params: { x: -100, y: 0 } },
        { type: 'pen_down', params: {} },
        { type: 'move', params: { steps: 200 } },
        { type: 'pen_up', params: {} },
        { type: 'go_xy', params: { x: 0, y: -100 } },
        { type: 'pen_down', params: {} },
        { type: 'move', params: { steps: 0 } },
      ],
    },
    // Module 10: Shapes Galore! — triangle with 360/3=120
    10: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'pen_color', params: { color: '#10b981' } },
        { type: 'pen_down', params: {} },
        { type: 'repeat', params: { n: 3 }, children: [
          { type: 'move', params: { steps: 80 } },
          { type: 'turn_r', params: { deg: 120 } },
        ]},
        { type: 'pen_up', params: {} },
      ],
    },
    // Module 11: Project — free canvas with pen_color, size, shapes
    11: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'pen_size', params: { size: 3 } },
        { type: 'pen_color', params: { color: '#f59e0b' } },
        { type: 'pen_down', params: {} },
        { type: 'repeat', params: { n: 4 }, children: [
          { type: 'move', params: { steps: 80 } },
          { type: 'turn_r', params: { deg: 90 } },
        ]},
        { type: 'pen_up', params: {} },
      ],
    },
  },

  // ── Python Basics ───────────────────────────────────────────────────────────
  'y5-python-basics': {
    0: {
      type: 'python',
      code: `# Welcome to Python! 🐍
# Lines starting with # are comments — Python ignores them

# print() shows text on screen
print("Hello, World!")
print("My name is Alex")
print("I love coding!")

# Try changing the messages above and click Run!`,
    },
    1: {
      type: 'python',
      code: `# Variables store information
# Think of them as labelled boxes

name = "Alex"
age = 10
favourite_colour = "blue"
score = 100

# Use variables in print()
print("My name is", name)
print("I am", age, "years old")
print("My favourite colour is", favourite_colour)
print("My score is", score)

# Try changing the values!`,
    },
    2: {
      type: 'python',
      code: `# Python can do maths!

a = 20
b = 6

print("Add:      ", a + b)
print("Subtract: ", a - b)
print("Multiply: ", a * b)
print("Divide:   ", a / b)
print("Remainder:", a % b)   # % = remainder

# Updating a variable
score = 0
score = score + 10
score = score + 5
print("Final score:", score)`,
    },
    3: {
      type: 'python',
      code: `# input() asks the user a question
# The answer is stored as a string (text)

name = input("What is your name? ")
print("Hello,", name + "!")

# int() converts text to a number
age = int(input("How old are you? "))
next_year = age + 1
print("Next year you will be", next_year)

# Try it — type your answers in the popup boxes`,
    },
    4: {
      type: 'python',
      code: `# if statements make decisions!
# Note: Python uses indentation (spaces) to group code

score = 75

if score >= 90:
    print("Amazing! A grade! 🌟")
elif score >= 70:
    print("Well done! B grade! 😊")
elif score >= 50:
    print("Good effort! C grade!")
else:
    print("Keep practising! You can do it!")

# Try changing the score value above`,
    },
    5: {
      type: 'python',
      code: `# for loops repeat code a fixed number of times
# range(1, 6) gives numbers 1, 2, 3, 4, 5

print("Counting to 5:")
for i in range(1, 6):
    print(i)

print("")  # blank line

# Print the 3 times table
print("3 times table:")
for i in range(1, 11):
    print("3 x", i, "=", 3 * i)`,
    },
    6: {
      type: 'python',
      code: `# while loops keep going until a condition is False

# Countdown!
countdown = 5
while countdown > 0:
    print(countdown, "...")
    countdown = countdown - 1

print("Blast off! 🚀")

print("")

# Sum numbers 1 to 10
total = 0
number = 1
while number <= 10:
    total = total + number
    number = number + 1

print("1 + 2 + ... + 10 =", total)`,
    },
    7: {
      type: 'python',
      code: `# Lists store multiple values in one variable
# Index starts at 0 — so fruits[0] is the first item

fruits = ["apple", "banana", "cherry", "orange", "mango"]

print("First fruit:", fruits[0])
print("Third fruit:", fruits[2])
print("Total fruits:", len(fruits))

print("")
print("All fruits:")
for fruit in fruits:
    print(" -", fruit)

# Add to a list
fruits.append("grape")
print("")
print("After adding grape:", len(fruits), "fruits")`,
    },
    8: {
      type: 'python',
      code: `# Functions are reusable blocks of code
# def means "define a new function"

def greet(name):
    print("Hello,", name + "!")
    print("Welcome to ByteBuddies!")

def add(a, b):
    result = a + b
    return result  # return sends a value back

# Call the functions
greet("Alex")
greet("Jamie")

total = add(10, 25)
print("10 + 25 =", total)

# Functions avoid repeating code!
names = ["Alice", "Bob", "Charlie"]
for name in names:
    greet(name)`,
    },
  },

  // ── My First Website (HTML/CSS) ────────────────────────────────────────────
  'y4-web-basics': {
    // Module 0: What is a Website?
    0: {
      type: 'html',
      code: `<!DOCTYPE html>
<html>
  <head>
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    <p>This is my very first web page.</p>
    <p>I built this with HTML!</p>
  </body>
</html>`,
    },
    // Module 1: HTML Tags & Elements
    1: {
      type: 'html',
      code: `<!DOCTYPE html>
<html>
  <head>
    <title>HTML Tags</title>
  </head>
  <body>
    <h1>Big Heading</h1>
    <h2>Smaller Heading</h2>
    <h3>Even Smaller</h3>
    <p>This is a paragraph of text.</p>
    <p>This is <strong>bold</strong> and this is <em>italic</em>.</p>
    <ul>
      <li>First item</li>
      <li>Second item</li>
      <li>Third item</li>
    </ul>
  </body>
</html>`,
    },
    // Module 2: CSS: Adding Colour & Style
    2: {
      type: 'html',
      code: `<!DOCTYPE html>
<html>
  <head>
    <title>My Styled Page</title>
    <style>
      body {
        background-color: #f0f4ff;
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      h1 {
        color: #6366f1;
        text-align: center;
      }
      p {
        color: #334155;
        font-size: 18px;
      }
      .highlight {
        background-color: #fef9c3;
        padding: 10px;
        border-radius: 8px;
      }
    </style>
  </head>
  <body>
    <h1>Welcome to My Styled Page!</h1>
    <p>This text has a custom colour and font.</p>
    <p class="highlight">This paragraph is highlighted in yellow!</p>
  </body>
</html>`,
    },
    // Module 3: The Box Model & Layout
    3: {
      type: 'html',
      code: `<!DOCTYPE html>
<html>
  <head>
    <title>Box Model</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; }
      .box {
        background-color: #6366f1;
        color: white;
        width: 200px;
        padding: 20px;
        margin: 20px;
        border: 4px solid #4f46e5;
        border-radius: 10px;
        text-align: center;
      }
      .container {
        display: flex;
        gap: 10px;
      }
    </style>
  </head>
  <body>
    <h1>The Box Model</h1>
    <div class="container">
      <div class="box">Box 1</div>
      <div class="box">Box 2</div>
      <div class="box">Box 3</div>
    </div>
  </body>
</html>`,
    },
    // Module 4: Images & Links
    4: {
      type: 'html',
      code: `<!DOCTYPE html>
<html>
  <head>
    <title>Images and Links</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; }
      img { border-radius: 10px; max-width: 300px; }
      a { color: #6366f1; font-weight: bold; }
      a:hover { color: #4f46e5; }
    </style>
  </head>
  <body>
    <h1>Images and Links</h1>
    <p>Here is an image from the internet:</p>
    <img src="https://picsum.photos/300/200" alt="A random photo" />
    <p>Click here to visit <a href="https://www.bbc.co.uk/cbbc" target="_blank">CBBC</a>!</p>
    <p>Or go to <a href="https://www.google.com" target="_blank">Google</a>.</p>
  </body>
</html>`,
    },
    // Module 5: Project — Personal Website
    5: {
      type: 'html',
      code: `<!DOCTYPE html>
<html>
  <head>
    <title>My Personal Website</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #0f172a;
        color: #e2e8f0;
        margin: 0;
        padding: 0;
      }
      header {
        background: linear-gradient(135deg, #6366f1, #ec4899);
        padding: 40px;
        text-align: center;
      }
      header h1 { font-size: 48px; margin: 0; }
      header p { font-size: 18px; opacity: 0.9; }
      main { padding: 30px; max-width: 700px; margin: 0 auto; }
      section { margin-bottom: 30px; }
      h2 { color: #818cf8; border-bottom: 2px solid #818cf8; padding-bottom: 6px; }
      ul li { margin-bottom: 8px; }
      footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
    </style>
  </head>
  <body>
    <header>
      <h1>👋 Hi, I'm [Your Name]!</h1>
      <p>Year 4 student and budding web developer</p>
    </header>
    <main>
      <section>
        <h2>About Me</h2>
        <p>Write something about yourself here! What do you like? What are your hobbies?</p>
      </section>
      <section>
        <h2>My Favourite Things</h2>
        <ul>
          <li>🎮 Gaming</li>
          <li>🐶 Animals</li>
          <li>⚽ Football</li>
        </ul>
      </section>
      <section>
        <h2>My Goals</h2>
        <p>What do you want to achieve? Write your goals here!</p>
      </section>
    </main>
    <footer>Made with ❤️ and HTML</footer>
  </body>
</html>`,
    },
  },
};
