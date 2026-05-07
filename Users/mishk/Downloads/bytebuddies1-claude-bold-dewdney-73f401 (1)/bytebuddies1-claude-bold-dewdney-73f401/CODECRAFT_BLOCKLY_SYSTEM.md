# CodeCraft Academy - Block-Based Visual Coding System

## 🎉 Major Update: Visual Block Programming

CodeCraft Academy now uses **drag-and-drop visual blocks** instead of text coding! This makes it perfect for beginners and matches Minecraft Education Edition's approach.

## 🧩 Visual Coding Blocks

### Entity Blocks (Purple - 290)

**1. Spawn Entity Block**
```
┌─────────────────────────────────┐
│ spawn [Villager ▼] at [5] , [5] │
└─────────────────────────────────┘
```
- **Dropdown**: 16 entities (people, animals, monsters)
- **Row/Col**: Number inputs (0-11 rows, 0-15 cols)
- **Generates**: `spawn_entity(5, 5, "VILLAGER")`

**2. Move Entity Block**
```
┌─────────────────────────────────────────┐
│ move [PLAYER] [→ right ▼] [3] steps    │
└─────────────────────────────────────────┘
```
- **Entity**: Text input (PLAYER, VILLAGER, COW, etc.)
- **Direction**: Dropdown (↑ up, ↓ down, ← left, → right)
- **Steps**: Number input (1-10)
- **Generates**: `move_entity("PLAYER", "right", 3)`

**3. Walk To Block**
```
┌───────────────────────────────────────┐
│ make [PLAYER] walk to [8] , [8]      │
└───────────────────────────────────────┘
```
- **Entity**: Text input
- **Target Row/Col**: Number inputs
- **Generates**: `walk_to("PLAYER", 8, 8)`
- **Feature**: Automatic pathfinding!

### Block Blocks (Green - 120)

**4. Place Block**
```
┌──────────────────────────────────────┐
│ place block [0] , [0] [Grass ▼]     │
└──────────────────────────────────────┘
```
- **Row/Col**: Number inputs
- **Block Type**: Dropdown (15 block types)
- **Generates**: `place_block(0, 0, "GRASS")`

### Control Blocks (Orange - 200)

**5. Repeat Block**
```
┌──────────────────────┐
│ repeat [10] times    │
│ ┌──────────────────┐ │
│ │  do blocks here  │ │
│ └──────────────────┘ │
└──────────────────────┘
```
- **Times**: Number input (1-100)
- **Contains**: Statement blocks
- **Generates**: JavaScript for loop

**6. Wait Block**
```
┌─────────────────────────┐
│ wait [1] seconds        │
└─────────────────────────┘
```
- **Seconds**: Number input (0.1-10)
- **Generates**: Delay in execution

## 🎮 How Students Use It

### Step 1: Drag Blocks
- Open the **Entities** category in toolbox
- Drag "spawn" block to workspace
- Connect blocks together

### Step 2: Configure Values
- Click dropdown to choose entity type
- Type row/col coordinates
- Set movement directions

### Step 3: Connect Blocks
- Stack blocks vertically
- Nest blocks inside repeat loops
- Build complex programs visually

### Step 4: Run
- Click **▶ RUN CODE**
- Watch entities appear and move!
- See results in output console

## 💡 Example Programs (Block-Based)

### Example 1: Spawn & Move
```
[spawn PLAYER at 5, 5]
└─[move PLAYER right 3 steps]
  └─[move PLAYER down 2 steps]
```

### Example 2: Multiple Animals
```
[repeat 3 times]
  do:
    [spawn COW at 5, 5]
```

### Example 3: Patrol Pattern
```
[spawn KNIGHT at 0, 0]
└─[repeat 4 times]
    do:
      [move KNIGHT right 3 steps]
      └─[move KNIGHT down 2 steps]
```

### Example 4: Village Life
```
[spawn VILLAGER at 3, 3]
└─[spawn BUILDER at 7, 7]
  └─[make VILLAGER walk to 8, 8]
    └─[make BUILDER walk to 3, 10]
```

## 🎨 Interface Layout

### Left Panel: Block Palette (140px)
**Two Modes:**
- 🧱 **Blocks Mode** - Place terrain blocks
- 🧑 **Entities Mode** - Spawn people/animals

### Center Panel: Minecraft World
- 12×16 grid (432 blocks)
- Click to place blocks/entities
- See entities move in real-time
- Sky blue background with clouds
- Entity info panel below

### Right Panel: Block Workspace (420px)
**Top Section: Blockly Workspace**
- Drag-and-drop coding area
- Toolbox with 3 categories:
  - **Entities** (spawn, move, walk)
  - **Blocks** (place blocks)
  - **Control** (repeat, wait)
- Zoom controls
- Trash can

**Bottom Section: Output Console (160px)**
- Shows execution results
- Entity spawn messages
- Movement confirmations
- Error messages

## 📚 Block Categories

### 🟣 Entities (Purple)
For spawning and controlling NPCs:
- Spawn Entity
- Move Entity
- Walk To

### 🟢 Blocks (Green)
For world building:
- Place Block

### 🟠 Control (Orange)
For programming logic:
- Repeat Loop
- Wait

## 🧑 Available Entities

### People (6)
- 🧑 Player → `PLAYER`
- 👨‍🌾 Villager → `VILLAGER`
- ⚔️ Knight → `KNIGHT`
- 🧙 Wizard → `WIZARD`
- 👷 Builder → `BUILDER`
- 🔬 Scientist → `SCIENTIST`

### Animals (10)
- 🐄 Cow → `COW`
- 🐷 Pig → `PIG`
- 🐑 Sheep → `SHEEP`
- 🐔 Chicken → `CHICKEN`
- 🐴 Horse → `HORSE`
- 🐺 Wolf → `WOLF`
- 🐱 Cat → `CAT`
- 🐰 Rabbit → `RABBIT`
- 🐝 Bee → `BEE`
- 🐢 Turtle → `TURTLE`

### Monsters (4)
- 🧟 Zombie → `ZOMBIE`
- 💀 Skeleton → `SKELETON`
- 🕷️ Spider → `SPIDER`
- 🐉 Dragon → `DRAGON`

## 🧱 Available Blocks

1. Grass → `GRASS` (#7cbd42)
2. Dirt → `DIRT` (#8B6F47)
3. Stone → `STONE` (#7D7D7D)
4. Wood Planks → `WOOD` (#9C7F4C)
5. Cobblestone → `COBBLE` (#7A7A7A)
6. Water → `WATER` (#2E5FBF) 💧
7. Lava → `LAVA` (#FF6B1A) 🔥
8. Redstone → `REDSTONE` (#C00000) ⚡
9. Gold Block → `GOLD` (#FCEE4B) ✨
10. Diamond Block → `DIAMOND` (#5DEDD8) 💎
11. Glass → `GLASS` (#E0F7FA)
12. TNT → `TNT` (#FF3333) 💣
13. Iron Block → `IRON` (#D8D8D8)
14. Emerald → `EMERALD` (#17DD62)
15. Obsidian → `OBSIDIAN` (#0F0D14)

## 🎯 Learning Progression

### Lesson 1: First Steps
**Challenge:** Spawn a player and make them move
```
[spawn PLAYER at 5, 5]
└─[move PLAYER right 3 steps]
```

### Lesson 2: Animals
**Challenge:** Spawn 3 different animals
```
[spawn COW at 3, 3]
└─[spawn PIG at 5, 5]
  └─[spawn SHEEP at 7, 7]
```

### Lesson 3: Movement Patterns
**Challenge:** Make entity move in a square
```
[spawn KNIGHT at 5, 5]
└─[move KNIGHT right 4 steps]
  └─[move KNIGHT down 4 steps]
    └─[move KNIGHT left 4 steps]
      └─[move KNIGHT up 4 steps]
```

### Lesson 4: Loops
**Challenge:** Spawn multiple entities with repeat
```
[repeat 5 times]
  do:
    [spawn COW at 5, 5]
```

### Lesson 5: Pathfinding
**Challenge:** Make entities walk to different positions
```
[spawn VILLAGER at 0, 0]
└─[spawn BUILDER at 11, 15]
  └─[make VILLAGER walk to 11, 15]
    └─[make BUILDER walk to 0, 0]
```

### Lesson 6: Build & Populate
**Challenge:** Build a house and add villagers
```
[repeat 5 times]
  do:
    [place block 0, 0 Wood]
└─[spawn VILLAGER at 5, 5]
  └─[make VILLAGER walk to 2, 2]
```

## 🚀 Technical Implementation

### Blockly Integration
- **Library**: Blockly v10.0.0 (already in dependencies)
- **Theme**: Dark theme for Minecraft aesthetic
- **Toolbox**: 3 categories (Entities, Blocks, Control)
- **Custom Blocks**: 6 custom block definitions
- **Code Generation**: JavaScript generators for all blocks

### Execution Engine
1. **Generate Code**: Blockly → JavaScript code
2. **Parse Commands**: Extract place_block, spawn_entity, move_entity calls
3. **Execute**: Update grid and entity state
4. **Animate**: Smooth movement with intervals
5. **Feedback**: Console output for each action

### State Management
- Grid state (12×16 array)
- Entity array with positions
- Blockly workspace state
- Output console messages

## 🎨 Minecraft Aesthetics

### Visual Design
- Pixelated graphics (imageRendering: pixelated)
- Blocky 3D borders (no border-radius)
- Dark stone textures (#2D2D2D, #3D3D3D)
- Drop shadows for depth
- Minecraft font styling

### Colors
- Background: Dark stone (#1a1a1a)
- UI: Stone textures (#2D2D2D, #3D3D3D)
- Sky: Light blue (#87CEEB)
- Buttons: 3D with dark bottom/right edges
- Highlights: Gold (#FCEE4B)

### Animations
- Bounce effect on moving entities
- Smooth grid placement
- Button hover effects
- Scale transforms on hover

## 📊 Advantages of Block Coding

1. **No Syntax Errors**: Blocks always fit together correctly
2. **Visual Feedback**: See structure at a glance
3. **Discoverable**: Dropdown shows all options
4. **Beginner-Friendly**: No typing required
5. **Teaches Logic**: Focus on algorithms, not syntax
6. **Minecraft Education Standard**: Matches what students expect

## 🔧 Technical Details

### Bundle Size
- Main bundle: 2.48 MB (includes full Blockly library)
- Gzipped: 653 KB
- Lazy loading recommended for future optimization

### Browser Support
- Chrome, Edge, Firefox, Safari
- Requires JavaScript enabled
- Works on tablets (touch-friendly)

### Performance
- Smooth animations at 200ms per step
- Efficient React state updates
- Grid renders 432 cells without lag
- Entity limit: Recommended 50 max

## 📝 Future Enhancements

### Phase 1 (Quick Wins)
- Add "Remove Entity" block
- Add "Say" block (speech bubbles)
- Add "If touching" conditional block
- Add sound effects

### Phase 2 (Advanced)
- Custom block creator
- Variables and data blocks
- Math and logic blocks
- Entity behavior programming

### Phase 3 (Expert)
- Multiplayer coding challenges
- Code sharing/remixing
- Leaderboards
- Real-time collaboration

## 🎓 Educational Value

### Computer Science Concepts
- **Sequencing**: Stack blocks in order
- **Loops**: Repeat block for iteration
- **Coordinates**: Row/col positioning
- **Pathfinding**: walk_to algorithm
- **State Management**: Entity positions
- **Event-driven**: Block execution

### Minecraft Education Alignment
- Visual block coding (exact match)
- Entity spawning and control
- World building + coding
- Challenge-based learning
- Progressive difficulty
- Achievement system

## ✅ Deployment Status

**Live URL:** https://bytebuddies.technology/#codecraft

**What's New:**
- ✅ Blockly visual coding workspace
- ✅ 6 custom coding blocks
- ✅ Drag-and-drop interface
- ✅ Real-time entity animation
- ✅ 20 spawnable entities
- ✅ 15 placeable blocks
- ✅ Loop and control blocks
- ✅ Output console feedback

**Removed:**
- ❌ Text-based Python editor (replaced with blocks)
- ❌ Manual code typing (now visual)

**Students can now:**
1. Drag blocks from toolbox
2. Connect them together
3. Configure dropdowns and numbers
4. Run to see entities move!

---

**Ready to Use!** Students can start building and coding with visual blocks immediately! 🎮🧩⛏️
