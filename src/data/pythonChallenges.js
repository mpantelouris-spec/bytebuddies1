/**
 * Python challenges that check themselves. Printing challenges compare what was printed;
 * function challenges run hidden tests after the child's code, which print `__PASS__` or
 * `__FAIL__ message` lines that the page reads back.
 *
 * Fields: id, title, emoji, level (1 starter · 2 explorer · 3 expert), concept, task,
 * starter, hints (question → clue → near-answer), expect (printed lines) or tests (Python),
 * uses (regex for ★★),
 * usesLabel.
 */

/** Printing challenges: compare the printed lines with what they should be. */
const out = (expected) => ({ expect: expected });

const fn = (name, cases) => ({ tests: `
try:
    ${name}
except NameError:
    print("__FAIL__ I can't find a function called ${name}. Did you rename it?")
else:
    __ok = True
${cases.map(([args, want]) => `    if __ok:
        try:
            __r = ${name}(${args})
        except Exception as __e:
            print("__FAIL__ ${name}(${args.replace(/"/g, '\\"')}) crashed: " + str(__e))
            __ok = False
        else:
            if __r != ${want}:
                print("__FAIL__ ${name}(${args.replace(/"/g, '\\"')}) gave " + repr(__r) + " but it should give " + repr(${want}))
                __ok = False`).join('\n')}
    if __ok:
        print("__PASS__")
` });

export const PYTHON_CHALLENGES = [
  {
    id: 'py-hello', title: 'Hello, world!', emoji: '👋', level: 1, concept: 'Printing',
    task: 'Make the computer print exactly: Hello, ByteBuddies!',
    starter: '# Print a greeting\n',
    hints: ['Which Python word shows text on the screen?', 'Use print( ) and put your text inside quote marks.', 'print("___")  ← put the greeting in the gap'],
    ...out(['Hello, ByteBuddies!']),
    uses: /print\s*\(/, usesLabel: 'Used print',
  },
  {
    id: 'py-countdown', title: 'Rocket countdown', emoji: '🚀', level: 1, concept: 'Loops',
    task: 'Print the numbers 5, 4, 3, 2, 1 (one per line), then print Lift off!',
    starter: '# Count down from 5, then launch!\n',
    hints: ['Could you write five print lines? Is there a shorter way that repeats?', 'range(5, 0, -1) counts 5, 4, 3, 2, 1. Use it in a for loop.', 'for n in range(5, 0, -1):\n    print(___)\nprint("___")'],
    ...out(['5', '4', '3', '2', '1', 'Lift off!']),
    uses: /\bfor\b|\bwhile\b/, usesLabel: 'Used a loop',
  },
  {
    id: 'py-times', title: 'Times table machine', emoji: '✖️', level: 1, concept: 'Loops & maths',
    task: 'Print the 7 times table from 7 x 1 = 7 up to 7 x 10 = 70.',
    starter: '# The 7 times table\n',
    hints: ['Each line follows the same pattern — only the middle number changes. What repeats things?', 'Loop i through range(1, 11) and print 7, i and 7 * i.', 'for i in range(1, 11):\n    print("7 x " + str(i) + " = " + str(___))'],
    ...out(Array.from({ length: 10 }, (_, i) => `7 x ${i + 1} = ${7 * (i + 1)}`)),
    uses: /\bfor\b|\bwhile\b/, usesLabel: 'Used a loop',
  },
  {
    id: 'py-double', title: 'Double trouble', emoji: '2️⃣', level: 1, concept: 'Functions',
    task: 'Finish the function double(n) so it gives back the number n times 2.',
    starter: 'def double(n):\n    # give back n times 2\n    pass\n',
    hints: ['A function gives an answer back with one special word. Which one?', 'Replace pass with return and a sum using n.', 'return n ___ 2'],
    ...fn('double', [['4', '8'], ['0', '0'], ['21', '42'], ['-3', '-6']]),
    uses: /\breturn\b/, usesLabel: 'Used return',
  },
  {
    id: 'py-even', title: 'Odd or even?', emoji: '⚖️', level: 2, concept: 'If & maths',
    task: 'Finish is_even(n) so it gives back True if n is even and False if it is odd.',
    starter: 'def is_even(n):\n    pass\n',
    hints: ['What is left over when you share an even number into 2 groups?', 'n % 2 gives the remainder after dividing by 2. Even numbers have remainder 0.', 'return n % 2 == ___'],
    ...fn('is_even', [['4', 'True'], ['7', 'False'], ['0', 'True'], ['13', 'False']]),
    uses: /%/, usesLabel: 'Used the % remainder',
  },
  {
    id: 'py-fizz', title: 'FizzBuzz', emoji: '🐝', level: 2, concept: 'If / elif / else',
    task: 'Print 1 to 15. But for multiples of 3 print Fizz, multiples of 5 print Buzz, and multiples of both print FizzBuzz.',
    starter: '# FizzBuzz from 1 to 15\n',
    hints: ['Which numbers are multiples of BOTH 3 and 5? Which check should come first?', 'Loop 1 to 15. Check n % 15 first, then n % 3, then n % 5, else print n.', 'for n in range(1, 16):\n    if n % 15 == 0: print("FizzBuzz")\n    elif n % ___ == 0: print("Fizz")\n    elif ___: print("Buzz")\n    else: print(___)'],
    ...out(Array.from({ length: 15 }, (_, i) => { const n = i + 1; return n % 15 === 0 ? 'FizzBuzz' : n % 3 === 0 ? 'Fizz' : n % 5 === 0 ? 'Buzz' : String(n); })),
    uses: /\belif\b/, usesLabel: 'Used elif',
  },
  {
    id: 'py-vowels', title: 'Vowel counter', emoji: '🔤', level: 2, concept: 'Strings & loops',
    task: 'Finish count_vowels(word) so it counts the a, e, i, o, u letters in a word.',
    starter: 'def count_vowels(word):\n    count = 0\n    # look at each letter\n    return count\n',
    hints: ['How could you look at one letter at a time?', 'for letter in word: … and check if letter in "aeiou". Remember capital letters!', 'for letter in word.lower():\n        if letter in ___:\n            count = ___'],
    ...fn('count_vowels', [['"robot"', '2'], ['"ByteBuddies"', '4'], ['"sky"', '0'], ['"AEIOU"', '5']]),
    uses: /\bfor\b/, usesLabel: 'Used a loop',
  },
  {
    id: 'py-biggest', title: 'Biggest number', emoji: '🏔️', level: 3, concept: 'Lists & loops',
    task: 'Finish biggest(numbers) so it gives back the biggest number in a list — without using max().',
    starter: 'def biggest(numbers):\n    best = numbers[0]\n    # check every number\n    return best\n',
    hints: ['If you went through the list one number at a time, what would you need to remember?', 'Keep the biggest so far in best. For each number, if it is bigger than best, replace best.', 'for n in numbers:\n        if n ___ best:\n            best = ___'],
    ...fn('biggest', [['[3, 9, 2]', '9'], ['[-5, -2, -8]', '-2'], ['[7]', '7'], ['[1, 4, 4, 0]', '4']]),
    uses: /^(?![\s\S]*\bmax\s*\()[\s\S]*\bfor\b/, usesLabel: 'Did it without max()',
  },
  {
    id: 'py-robot', title: 'Robot route', emoji: '🤖', level: 3, concept: 'Algorithms',
    task: 'A robot starts at 0. moves is a string like "FFBF": F moves it forward 1, B moves it back 1. Finish final_position(moves).',
    starter: 'def final_position(moves):\n    position = 0\n    return position\n',
    hints: ['Go through the moves one letter at a time. What happens to position for each letter?', 'For each letter: if it is "F", add 1; if it is "B", take 1 away.', 'for m in moves:\n        if m == "F":\n            position ___\n        elif m == "B":\n            position ___'],
    ...fn('final_position', [['"FFBF"', '2'], ['""', '0'], ['"BBB"', '-3'], ['"FBFBFF"', '2']]),
    uses: /\bfor\b/, usesLabel: 'Used a loop',
  },
  {
    id: 'py-password', title: 'Strong password?', emoji: '🔐', level: 3, concept: 'Logic',
    task: 'Finish is_strong(pw): True if it has at least 8 characters AND at least one digit, otherwise False.',
    starter: 'def is_strong(pw):\n    pass\n',
    hints: ['Two things both have to be true. Which Python word joins two checks?', 'len(pw) gives the length. any(c.isdigit() for c in pw) checks for a digit.', 'return len(pw) >= ___ and any(c.isdigit() for c in pw)'],
    ...fn('is_strong', [['"robot123"', 'True'], ['"robot"', 'False'], ['"abcdefgh"', 'False'], ['"12345678"', 'True']]),
    uses: /\band\b/, usesLabel: 'Used and',
  },

  /* ── Starter ── */
  {
    id: 'py-badge', title: 'Name badge', emoji: '🏷', level: 1, concept: 'Variables',
    task: 'Make a variable name set to "Ada" and a variable age set to 9. Then print exactly:\nName: Ada\nAge: 9',
    starter: '# Make two variables, then print them\n',
    hints: ['A variable is a labelled box. How do you put something in it?', 'name = "Ada" stores text. age = 9 stores a number. Use str(age) to join a number to text.', 'name = "Ada"\nage = 9\nprint("Name: " + name)\nprint("Age: " + str(___))'],
    ...out(['Name: Ada', 'Age: 9']),
    uses: /\bname\s*=[\s\S]*\bage\s*=|\bage\s*=[\s\S]*\bname\s*=/, usesLabel: 'Used variables',
  },
  {
    id: 'py-shopping', title: 'Shopping list', emoji: '🛒', level: 1, concept: 'Lists & loops',
    task: 'Make a list called shopping with "apples", "bread" and "milk". Use a loop to print each item on its own line.',
    starter: 'shopping = []\n# print each item\n',
    hints: ['Put the three items inside the [ ] with commas between them.', 'for item in shopping: runs once for every item in the list.', 'shopping = ["apples", "bread", "milk"]\nfor item in shopping:\n    print(___)'],
    ...out(['apples', 'bread', 'milk']),
    uses: /\bfor\b/, usesLabel: 'Used a loop',
  },
  {
    id: 'py-stars', title: 'Star staircase', emoji: '⭐', level: 1, concept: 'Loops & strings',
    task: 'Print a staircase of stars: 1 star on the first line, then 2, 3, 4 and 5 stars.',
    starter: '# *\n# **\n# ***  … up to 5 stars\n',
    hints: ['Each line has one more star than the last. What changes each time round a loop?', 'In Python, "*" * 3 makes "***". Loop i from 1 to 5.', 'for i in range(1, 6):\n    print("*" * ___)'],
    ...out(['*', '**', '***', '****', '*****']),
    uses: /\bfor\b|\bwhile\b/, usesLabel: 'Used a loop',
  },
  {
    id: 'py-add', title: 'Adding machine', emoji: '➕', level: 1, concept: 'Functions',
    task: 'Finish add(a, b) so it gives back a and b added together.',
    starter: 'def add(a, b):\n    pass\n',
    hints: ['Which word sends an answer back out of a function?', 'Replace pass with return and the sum of the two inputs.', 'return a ___ b'],
    ...fn('add', [['2, 3', '5'], ['10, 0', '10'], ['-4, 6', '2'], ['100, 250', '350']]),
    uses: /\breturn\b/, usesLabel: 'Used return',
  },
  {
    id: 'py-area', title: 'Playground area', emoji: '📐', level: 1, concept: 'Functions & maths',
    task: 'Finish area(width, height) so it gives back the area of a rectangle.',
    starter: 'def area(width, height):\n    pass\n',
    hints: ['How do you work out the area of a rectangle in maths?', 'Area = width × height. In Python the × sign is *.', 'return width ___ height'],
    ...fn('area', [['3, 4', '12'], ['10, 10', '100'], ['7, 1', '7'], ['0, 5', '0']]),
    uses: /\*/, usesLabel: 'Used * to multiply',
  },
  {
    id: 'py-greet', title: 'Friendly greeter', emoji: '😊', level: 1, concept: 'Strings & functions',
    task: 'Finish greet(name) so greet("Sam") gives back "Hello, Sam!"',
    starter: 'def greet(name):\n    pass\n',
    hints: ['You need to join three bits of text together. Which sign joins text?', '"Hello, " + name + "!" joins the pieces.', 'return "Hello, " + ___ + "!"'],
    ...fn('greet', [['"Sam"', '"Hello, Sam!"'], ['"Byte"', '"Hello, Byte!"'], ['"Mrs Khan"', '"Hello, Mrs Khan!"']]),
    uses: /\breturn\b/, usesLabel: 'Used return',
  },
  {
    id: 'py-evens', title: 'Even steps', emoji: '🔢', level: 1, concept: 'Loops',
    task: 'Print the even numbers from 2 to 20, one per line.',
    starter: '# 2, 4, 6 … 20\n',
    hints: ['Each number is 2 more than the one before. Can a loop count in 2s?', 'range(start, stop, step) — range(2, 21, 2) counts 2, 4, 6 … 20.', 'for n in range(2, 21, ___):\n    print(n)'],
    ...out(Array.from({ length: 10 }, (_, i) => String((i + 1) * 2))),
    uses: /\bfor\b|\bwhile\b/, usesLabel: 'Used a loop',
  },

  /* ── Explorer ── */
  {
    id: 'py-weather', title: 'What to wear?', emoji: '🌡', level: 2, concept: 'If / elif / else',
    task: 'Finish feels(temp): give back "cold" below 10, "warm" from 10 up to 24, and "hot" for 25 or more.',
    starter: 'def feels(temp):\n    pass\n',
    hints: ['There are three possible answers. Which Python words choose between more than two?', 'if temp < 10 … elif temp < 25 … else …', 'if temp < 10:\n        return "cold"\n    elif temp < ___:\n        return "warm"\n    else:\n        return ___'],
    ...fn('feels', [['3', '"cold"'], ['10', '"warm"'], ['24', '"warm"'], ['25', '"hot"'], ['-2', '"cold"']]),
    uses: /\belif\b/, usesLabel: 'Used elif',
  },
  {
    id: 'py-total', title: 'Pocket money total', emoji: '🧮', level: 2, concept: 'Lists & loops',
    task: 'Finish total(numbers) so it adds up every number in the list — without using sum().',
    starter: 'def total(numbers):\n    running = 0\n    # add each number\n    return running\n',
    hints: ['If you added the coins one at a time, what would you keep track of?', 'Loop through numbers and add each one to running.', 'for n in numbers:\n        running = running ___ n'],
    ...fn('total', [['[1, 2, 3]', '6'], ['[]', '0'], ['[10, -4, 5]', '11'], ['[50]', '50']]),
    uses: /^(?![\s\S]*\bsum\s*\()[\s\S]*\bfor\b/, usesLabel: 'Did it without sum()',
  },
  {
    id: 'py-reverse', title: 'Backwards word', emoji: '🔄', level: 2, concept: 'Strings',
    task: 'Finish reverse_word(word) so reverse_word("robot") gives back "tobor".',
    starter: 'def reverse_word(word):\n    pass\n',
    hints: ['Could you build a new word one letter at a time, putting each new letter at the front?', 'Start with result = "" and for each letter do result = letter + result. (Or try slicing: word[::-1].)', 'result = ""\n    for letter in word:\n        result = ___ + result\n    return result'],
    ...fn('reverse_word', [['"robot"', '"tobor"'], ['"a"', '"a"'], ['""', '""'], ['"ByteBuddies"', '"seidduBetyB"']]),
    uses: /\bfor\b|\[::-1\]/, usesLabel: 'Used a loop or slice',
  },
  {
    id: 'py-medal', title: 'Medal table', emoji: '🥇', level: 2, concept: 'If / elif / else',
    task: 'Finish medal(score): 90+ is "Gold", 70+ is "Silver", 50+ is "Bronze", anything lower is "Keep going".',
    starter: 'def medal(score):\n    pass\n',
    hints: ['Which check must come first so a score of 95 gets Gold, not Bronze?', 'Check the biggest score first: if score >= 90 … elif score >= 70 …', 'if score >= 90:\n        return "Gold"\n    elif score >= ___:\n        return "Silver"\n    elif ___:\n        return "Bronze"\n    return "Keep going"'],
    ...fn('medal', [['95', '"Gold"'], ['90', '"Gold"'], ['70', '"Silver"'], ['55', '"Bronze"'], ['12', '"Keep going"']]),
    uses: /\belif\b/, usesLabel: 'Used elif',
  },
  {
    id: 'py-multiple', title: 'Times table checker', emoji: '✖', level: 2, concept: 'Maths & logic',
    task: 'Finish is_multiple(n, of) so it gives back True if n is in the "of" times table, otherwise False.',
    starter: 'def is_multiple(n, of):\n    pass\n',
    hints: ['If 12 is in the 3 times table, what is left over when you divide 12 by 3?', 'n % of gives the remainder. No remainder means it is a multiple.', 'return n % of == ___'],
    ...fn('is_multiple', [['12, 3', 'True'], ['14, 3', 'False'], ['35, 5', 'True'], ['0, 7', 'True'], ['9, 2', 'False']]),
    uses: /%/, usesLabel: 'Used the % remainder',
  },
  {
    id: 'py-initials', title: 'Initials', emoji: '✍', level: 2, concept: 'Strings',
    task: 'Finish initials(name) so initials("Ada Lovelace") gives back "AL".',
    starter: 'def initials(name):\n    pass\n',
    hints: ['How could you split a full name into separate words?', 'name.split() gives a list of words. word[0] is the first letter of a word.', 'result = ""\n    for word in name.split():\n        result = result + word[___]\n    return result.upper()'],
    ...fn('initials', [['"Ada Lovelace"', '"AL"'], ['"Alan Mathison Turing"', '"AMT"'], ['"grace hopper"', '"GH"']]),
    uses: /\.split\s*\(/, usesLabel: 'Used split()',
  },
  {
    id: 'py-average', title: 'Class average', emoji: '📊', level: 2, concept: 'Lists & maths',
    task: 'Finish average(numbers) so it gives back the mean: add them all up, then divide by how many there are.',
    starter: 'def average(numbers):\n    pass\n',
    hints: ['Two steps: find the total, then share it out. Which function tells you how many items are in a list?', 'sum(numbers) adds them up. len(numbers) counts them.', 'return sum(numbers) / ___'],
    ...fn('average', [['[2, 4, 6]', '4'], ['[10]', '10'], ['[1, 2]', '1.5'], ['[3, 3, 3, 3]', '3']]),
    uses: /\blen\s*\(/, usesLabel: 'Used len()',
  },
  {
    id: 'py-letters', title: 'Letter detective', emoji: '🔍', level: 2, concept: 'Strings & loops',
    task: 'Finish count_letter(word, letter) so it counts how many times a letter appears. count_letter("banana", "a") gives 3.',
    starter: 'def count_letter(word, letter):\n    count = 0\n    return count\n',
    hints: ['Look at the word one letter at a time. When do you add 1 to count?', 'for ch in word: if ch == letter: count += 1', 'for ch in word:\n        if ch == ___:\n            count = count + 1'],
    ...fn('count_letter', [['"banana", "a"', '3'], ['"robot", "o"', '2'], ['"sky", "z"', '0'], ['"", "a"', '0']]),
    uses: /\bfor\b/, usesLabel: 'Used a loop',
  },

  /* ── Expert ── */
  {
    id: 'py-palindrome', title: 'Palindrome finder', emoji: '🔁', level: 3, concept: 'Strings & logic',
    task: 'A palindrome reads the same backwards, like "Hannah". Finish is_palindrome(word) — capital letters should not matter.',
    starter: 'def is_palindrome(word):\n    pass\n',
    hints: ['If you turned the word backwards, what would be true about a palindrome?', 'Make it lower case first, then compare it with its reverse (word[::-1]).', 'w = word.lower()\n    return w == ___'],
    ...fn('is_palindrome', [['"Hannah"', 'True'], ['"level"', 'True'], ['"robot"', 'False'], ['"a"', 'True']]),
    uses: /\.lower\s*\(/, usesLabel: 'Ignored capitals with lower()',
  },
  {
    id: 'py-cipher', title: 'Secret code', emoji: '🔑', level: 3, concept: 'Algorithms',
    task: 'Spies shift every letter one place on: a→b, b→c … z→a. Finish shift_word(word) for lower-case words.',
    starter: 'alphabet = "abcdefghijklmnopqrstuvwxyz"\n\ndef shift_word(word):\n    secret = ""\n    return secret\n',
    hints: ['For each letter, find where it is in the alphabet. Which letter comes next? What about z?', 'alphabet.index(letter) finds its position. (position + 1) % 26 wraps z back round to a.', 'for letter in word:\n        pos = alphabet.index(letter)\n        secret = secret + alphabet[(pos + 1) % ___]'],
    ...fn('shift_word', [['"abc"', '"bcd"'], ['"zoo"', '"app"'], ['"hal"', '"ibm"'], ['""', '""']]),
    uses: /%\s*26/, usesLabel: 'Wrapped round with % 26',
  },
  {
    id: 'py-grid', title: 'Robot on a grid', emoji: '🧭', level: 3, concept: 'Algorithms',
    task: 'A robot starts at (0, 0). N moves y up 1, S moves y down 1, E moves x right 1, W moves x left 1. Finish where(moves) to give back (x, y).',
    starter: 'def where(moves):\n    x = 0\n    y = 0\n    return (x, y)\n',
    hints: ['Keep two numbers, x and y. Which one changes for each letter?', 'Loop through moves and use if / elif for "N", "S", "E" and "W".', 'for m in moves:\n        if m == "N":\n            y = y + 1\n        elif m == "S":\n            y = ___\n        elif m == "E":\n            x = ___\n        elif m == "W":\n            x = ___'],
    ...fn('where', [['"NNES"', '(1, 1)'], ['""', '(0, 0)'], ['"WWS"', '(-2, -1)'], ['"NESW"', '(0, 0)']]),
    uses: /\belif\b/, usesLabel: 'Used elif',
  },
  {
    id: 'py-leap', title: 'Leap year', emoji: '📅', level: 3, concept: 'Logic',
    task: 'A year is a leap year if it divides by 4 — except years that divide by 100, which are only leap years if they also divide by 400. Finish is_leap(year).',
    starter: 'def is_leap(year):\n    pass\n',
    hints: ['Try the rule on 2024, 1900 and 2000. Which check is the most special?', 'Check 400 first, then 100, then 4.', 'if year % 400 == 0:\n        return True\n    if year % 100 == 0:\n        return ___\n    return year % 4 == 0'],
    ...fn('is_leap', [['2024', 'True'], ['2023', 'False'], ['1900', 'False'], ['2000', 'True'], ['2100', 'False']]),
    uses: /%/, usesLabel: 'Used the % remainder',
  },
  {
    id: 'py-filter', title: 'Even sorter', emoji: '🧹', level: 3, concept: 'Lists & loops',
    task: 'Finish only_evens(numbers) so it gives back a new list with just the even numbers, in the same order.',
    starter: 'def only_evens(numbers):\n    keep = []\n    return keep\n',
    hints: ['Start with an empty list. When should a number go into it?', 'Loop through numbers; if n % 2 == 0, keep.append(n).', 'for n in numbers:\n        if n % 2 == 0:\n            keep.___(n)'],
    ...fn('only_evens', [['[1, 2, 3, 4]', '[2, 4]'], ['[]', '[]'], ['[7, 9]', '[]'], ['[10, 3, 8, 8]', '[10, 8, 8]']]),
    uses: /\.append\s*\(/, usesLabel: 'Used append()',
  },
  {
    id: 'py-pattern', title: 'Number pyramid', emoji: '🧱', level: 3, concept: 'Nested loops',
    task: 'Print this pattern exactly:\n1\n12\n123\n1234\n12345',
    starter: '# A loop inside a loop\n',
    hints: ['Each line counts up from 1. How long is each line?', 'An outer loop picks the line (1 to 5). An inner loop builds the line from 1 up to that number.', 'for row in range(1, 6):\n    line = ""\n    for n in range(1, row + 1):\n        line = line + str(___)\n    print(line)'],
    ...out(['1', '12', '123', '1234', '12345']),
    uses: /\bfor\b[\s\S]*\n\s+for\b/, usesLabel: 'Used a loop inside a loop',
  },
  {
    id: 'py-binary', title: 'Binary converter', emoji: '💻', level: 3, concept: 'Binary & algorithms',
    task: 'Computers count in binary. Finish to_binary(n) so it gives back n as a binary string, e.g. to_binary(5) gives "101" — without using bin().',
    starter: 'def to_binary(n):\n    if n == 0:\n        return "0"\n    bits = ""\n    return bits\n',
    hints: ['Keep halving the number. What do the remainders tell you?', 'While n > 0: the remainder n % 2 is the next bit (from the right). Then n = n // 2.', 'while n > 0:\n        bits = str(n % 2) + bits\n        n = n // ___'],
    ...fn('to_binary', [['5', '"101"'], ['0', '"0"'], ['1', '"1"'], ['8', '"1000"'], ['13', '"1101"']]),
    uses: /^(?![\s\S]*\bbin\s*\()[\s\S]*\bwhile\b/, usesLabel: 'Did it without bin()',
  },
];

export const SPLIT = '__BB_TESTS__';

/** The program to run: the child's code, then (for function challenges) the hidden tests. */
export function buildCheckProgram(challenge, code) {
  return challenge.tests ? `${code}\nprint("${SPLIT}")\n${challenge.tests}` : code;
}

/** The child's own printed output (without the hidden test lines). */
export function childOutput(text) {
  return String(text || '').split(SPLIT)[0];
}

/** Did the challenge pass? Returns { pass, message }. */
export function checkResult(challenge, text) {
  if (challenge.expect) {
    const lines = childOutput(text).split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => l.trim() !== '');
    const want = challenge.expect;
    for (let i = 0; i < want.length; i++) {
      if (i >= lines.length) return { pass: false, message: `Line ${i + 1} is missing — it should say: ${want[i]}` };
      if (lines[i] !== want[i]) return { pass: false, message: `Line ${i + 1} says "${lines[i]}" but it should say "${want[i]}"` };
    }
    if (lines.length > want.length) return { pass: false, message: `You printed ${lines.length} lines, but only ${want.length} are needed.` };
    return { pass: true };
  }
  const after = String(text || '').split(SPLIT)[1] || '';
  if (after.split('\n').some((l) => l.trim() === '__PASS__')) return { pass: true };
  const fail = after.split('\n').find((l) => l.startsWith('__FAIL__'));
  return { pass: false, message: fail ? fail.replace('__FAIL__', '').trim() : 'Your code needs to run without errors first.' };
}
