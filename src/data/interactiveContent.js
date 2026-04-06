// Interactive content for learn page modules
// Loaded by LearningHub to embed BlockEditor or PythonRunner in lessons

export const INTERACTIVE = {
  // ── My First Code (block coding) ───────────────────────────────────────────
  'y3-first-steps': {
    0: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'say', params: { msg: 'Hello, World!' } },
        { type: 'say', params: { msg: 'I love coding!' } },
      ],
    },
    1: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'move', params: { steps: 50 } },
        { type: 'turn_r', params: { deg: 90 } },
        { type: 'move', params: { steps: 50 } },
        { type: 'turn_r', params: { deg: 90 } },
        { type: 'move', params: { steps: 50 } },
        { type: 'turn_r', params: { deg: 90 } },
        { type: 'move', params: { steps: 50 } },
      ],
    },
    6: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'pen_down', params: {} },
        { type: 'repeat', params: { n: 4 }, children: [
          { type: 'move', params: { steps: 60 } },
          { type: 'turn_r', params: { deg: 90 } },
        ]},
      ],
    },
    7: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'say', params: { msg: 'Press run!' } },
        { type: 'pen_down', params: {} },
        { type: 'repeat', params: { n: 6 }, children: [
          { type: 'move', params: { steps: 50 } },
          { type: 'turn_r', params: { deg: 60 } },
        ]},
      ],
    },
    8: {
      type: 'blocks',
      starter: [
        { type: 'when_flag', params: {} },
        { type: 'pen_color', params: { color: '#6366f1' } },
        { type: 'pen_down', params: {} },
        { type: 'repeat', params: { n: 36 }, children: [
          { type: 'move', params: { steps: 10 } },
          { type: 'turn_r', params: { deg: 10 } },
        ]},
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
};
