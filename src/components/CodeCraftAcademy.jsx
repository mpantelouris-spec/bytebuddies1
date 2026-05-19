import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import Blockly from 'blockly';
import 'blockly/blocks';
import * as BlocklyJS from 'blockly/javascript';

/**
 * CodeCraft Academy - Minecraft Education-style Learning Environment
 * 
 * Features:
 * - Immersive 3D block world interface with Minecraft aesthetics
 * - Block-based visual coding (like Scratch/Blockly)
 * - Real programming challenges with drag-and-drop blocks
 * - NPCs and entities students can spawn and control
 * - Achievement/progression system
 * - Interactive coding tutorials
 */

// Minecraft-style fonts
const minecraftFont = "'Press Start 2P', 'Courier New', monospace";
const minecraftBoldFont = "'Minecraft', 'Press Start 2P', monospace";

// Define custom Blockly blocks for CodeCraft (will be called after Blockly loads)
const defineCodeCraftBlocks = () => {
  // Safety check
  if (!Blockly || !Blockly.Blocks) {
    console.warn('Blockly not ready yet');
    return false;
  }

  try {
    // Place Block
    Blockly.Blocks['codecraft_place_block'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("place block")
          .appendField(new Blockly.FieldNumber(0, 0, 11), "ROW")
          .appendField(",")
          .appendField(new Blockly.FieldNumber(0, 0, 15), "COL")
          .appendField(new Blockly.FieldDropdown([
            ["Grass", "GRASS"], ["Dirt", "DIRT"], ["Stone", "STONE"],
            ["Wood", "WOOD"], ["Cobble", "COBBLE"], ["Water", "WATER"],
            ["Lava", "LAVA"], ["Redstone", "REDSTONE"], ["Gold", "GOLD"],
            ["Diamond", "DIAMOND"], ["Glass", "GLASS"], ["TNT", "TNT"]
          ]), "BLOCK");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Place a block at row, col");
    }
  };

  // Spawn Entity
  Blockly.Blocks['codecraft_spawn_entity'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("spawn")
          .appendField(new Blockly.FieldDropdown([
            ["👨‍🌾 Villager", "VILLAGER"], ["🧑 Player", "PLAYER"],
            ["⚔️ Knight", "KNIGHT"], ["🧙 Wizard", "WIZARD"],
            ["👷 Builder", "BUILDER"], ["🔬 Scientist", "SCIENTIST"],
            ["🐄 Cow", "COW"], ["🐷 Pig", "PIG"],
            ["🐑 Sheep", "SHEEP"], ["🐔 Chicken", "CHICKEN"],
            ["🐴 Horse", "HORSE"], ["🐺 Wolf", "WOLF"],
            ["🐱 Cat", "CAT"], ["🐰 Rabbit", "RABBIT"],
            ["🧟 Zombie", "ZOMBIE"], ["💀 Skeleton", "SKELETON"]
          ]), "ENTITY")
          .appendField("at")
          .appendField(new Blockly.FieldNumber(0, 0, 11), "ROW")
          .appendField(",")
          .appendField(new Blockly.FieldNumber(0, 0, 15), "COL");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip("Spawn an entity at position");
    }
  };

  // Move Entity
  Blockly.Blocks['codecraft_move_entity'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("move")
          .appendField(new Blockly.FieldTextInput("PLAYER"), "ENTITY")
          .appendField(new Blockly.FieldDropdown([
            ["↑ up", "up"], ["↓ down", "down"],
            ["← left", "left"], ["→ right", "right"]
          ]), "DIRECTION")
          .appendField(new Blockly.FieldNumber(1, 1, 10), "STEPS")
          .appendField("steps");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip("Move entity in direction");
    }
  };

  // Walk To
  Blockly.Blocks['codecraft_walk_to'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("make")
          .appendField(new Blockly.FieldTextInput("PLAYER"), "ENTITY")
          .appendField("walk to")
          .appendField(new Blockly.FieldNumber(0, 0, 11), "ROW")
          .appendField(",")
          .appendField(new Blockly.FieldNumber(0, 0, 15), "COL");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(200);
      this.setTooltip("Make entity walk to position");
    }
  };

  // Repeat Loop
  Blockly.Blocks['codecraft_repeat'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("repeat")
          .appendField(new Blockly.FieldNumber(10, 1, 100), "TIMES")
          .appendField("times");
      this.appendStatementInput("DO")
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Repeat commands");
    }
  };

  // Wait
  Blockly.Blocks['codecraft_wait'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("wait")
          .appendField(new Blockly.FieldNumber(1, 0.1, 10), "SECONDS")
          .appendField("seconds");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip("Pause execution");
    }
  };

  // Code generators
  if (BlocklyJS) {
    BlocklyJS.javascriptGenerator.forBlock['codecraft_place_block'] = function(block) {
      const row = block.getFieldValue('ROW');
      const col = block.getFieldValue('COL');
      const blockType = block.getFieldValue('BLOCK');
      return `place_block(${row}, ${col}, "${blockType}");\n`;
    };

    BlocklyJS.javascriptGenerator.forBlock['codecraft_spawn_entity'] = function(block) {
      const entity = block.getFieldValue('ENTITY');
      const row = block.getFieldValue('ROW');
      const col = block.getFieldValue('COL');
      return `spawn_entity(${row}, ${col}, "${entity}");\n`;
    };

    BlocklyJS.javascriptGenerator.forBlock['codecraft_move_entity'] = function(block) {
      const entity = block.getFieldValue('ENTITY');
      const direction = block.getFieldValue('DIRECTION');
      const steps = block.getFieldValue('STEPS');
      return `move_entity("${entity}", "${direction}", ${steps});\n`;
    };

    BlocklyJS.javascriptGenerator.forBlock['codecraft_walk_to'] = function(block) {
      const entity = block.getFieldValue('ENTITY');
      const row = block.getFieldValue('ROW');
      const col = block.getFieldValue('COL');
      return `walk_to("${entity}", ${row}, ${col});\n`;
    };

    BlocklyJS.javascriptGenerator.forBlock['codecraft_repeat'] = function(block) {
      const times = block.getFieldValue('TIMES');
      const statements = BlocklyJS.javascriptGenerator.statementToCode(block, 'DO');
      return `for(let i = 0; i < ${times}; i++) {\n${statements}}\n`;
    };

    BlocklyJS.javascriptGenerator.forBlock['codecraft_wait'] = function(block) {
      const seconds = block.getFieldValue('SECONDS');
      return `wait(${seconds});\n`;
    };
  }
  
  return true;
} catch (error) {
  console.error('Error defining Blockly blocks:', error);
  return false;
}
};

const WORLDS = [
  {
    id: 'redstone',
    name: 'Redstone Logic Lab',
    emoji: '⚡',
    theme: 'Engineering & Circuits',
    color: '#ef4444',
    bg: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #991b1b 100%)',
    description: 'Learn logic gates, circuits, and automation using redstone-style mechanics',
    unlocked: true,
    lessons: [
      { id: 'r1', title: 'Basic Circuits', blocks: 120, xp: 50, time: '15 min' },
      { id: 'r2', title: 'Logic Gates', blocks: 180, xp: 75, time: '20 min' },
      { id: 'r3', title: 'Automated Farm', blocks: 250, xp: 100, time: '30 min' },
      { id: 'r4', title: 'Elevator System', blocks: 320, xp: 150, time: '40 min' },
    ],
    builds: ['Auto-Sorter', 'Secret Door', 'Trap System', 'Elevator']
  },
  {
    id: 'village',
    name: 'Village Builder',
    emoji: '🏘️',
    theme: 'Architecture & Design',
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, #78350f 0%, #f59e0b 50%, #b45309 100%)',
    description: 'Design and code interactive villages with NPCs and quests',
    unlocked: true,
    lessons: [
      { id: 'v1', title: 'House Builder', blocks: 150, xp: 50, time: '20 min' },
      { id: 'v2', title: 'NPC Shop System', blocks: 200, xp: 80, time: '25 min' },
      { id: 'v3', title: 'Quest Creator', blocks: 280, xp: 120, time: '35 min' },
      { id: 'v4', title: 'Trading Network', blocks: 350, xp: 180, time: '45 min' },
    ],
    builds: ['Marketplace', 'Town Hall', 'Library', 'Trading Post']
  },
  {
    id: 'adventure',
    name: 'Adventure Quest',
    emoji: '⚔️',
    theme: 'Game Design & AI',
    color: '#8b5cf6',
    bg: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 50%, #6d28d9 100%)',
    description: 'Create adventure games with AI enemies, puzzles, and boss battles',
    unlocked: true,
    lessons: [
      { id: 'a1', title: 'Dungeon Generator', blocks: 200, xp: 90, time: '30 min' },
      { id: 'a2', title: 'Enemy AI', blocks: 250, xp: 110, time: '35 min' },
      { id: 'a3', title: 'Puzzle Mechanisms', blocks: 300, xp: 140, time: '40 min' },
      { id: 'a4', title: 'Boss Battle', blocks: 400, xp: 200, time: '50 min' },
    ],
    builds: ['Dungeon', 'Boss Arena', 'Puzzle Temple', 'Treasure Vault']
  },
  {
    id: 'underwater',
    name: 'Ocean Explorer',
    emoji: '🌊',
    theme: 'Marine Biology & Ecosystems',
    color: '#06b6d4',
    bg: 'linear-gradient(135deg, #164e63 0%, #06b6d4 50%, #0891b2 100%)',
    description: 'Explore underwater worlds while learning about ecosystems and science',
    unlocked: false,
    unlockRequirement: 'Complete 2 worlds',
    lessons: [
      { id: 'u1', title: 'Submarine Builder', blocks: 180, xp: 70, time: '25 min' },
      { id: 'u2', title: 'Coral Reef Ecosystem', blocks: 220, xp: 100, time: '30 min' },
      { id: 'u3', title: 'Deep Sea Station', blocks: 280, xp: 130, time: '35 min' },
      { id: 'u4', title: 'Treasure Hunt', blocks: 350, xp: 170, time: '45 min' },
    ],
    builds: ['Submarine', 'Research Station', 'Coral Garden', 'Underwater City']
  },
  {
    id: 'space',
    name: 'Space Station',
    emoji: '🚀',
    theme: 'Astronomy & Physics',
    color: '#6366f1',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #6366f1 50%, #4f46e5 100%)',
    description: 'Build orbital stations and program rovers on alien planets',
    unlocked: false,
    unlockRequirement: 'Complete 3 worlds',
    lessons: [
      { id: 's1', title: 'Launch Pad', blocks: 200, xp: 80, time: '25 min' },
      { id: 's2', title: 'Orbital Station', blocks: 280, xp: 120, time: '35 min' },
      { id: 's3', title: 'Rover Programming', blocks: 320, xp: 150, time: '40 min' },
      { id: 's4', title: 'Colony Builder', blocks: 450, xp: 220, time: '60 min' },
    ],
    builds: ['Rocket', 'Space Station', 'Mars Rover', 'Moon Base']
  },
  {
    id: 'fantasy',
    name: 'Magic Academy',
    emoji: '🔮',
    theme: 'Algorithms & Procedural Generation',
    color: '#ec4899',
    bg: 'linear-gradient(135deg, #831843 0%, #ec4899 50%, #be185d 100%)',
    description: 'Cast spells using code and generate magical procedural worlds',
    unlocked: false,
    unlockRequirement: 'Complete 4 worlds',
    lessons: [
      { id: 'm1', title: 'Spell Casting', blocks: 150, xp: 90, time: '20 min' },
      { id: 'm2', title: 'Potion Brewing', blocks: 200, xp: 110, time: '30 min' },
      { id: 'm3', title: 'Magical Creatures', blocks: 280, xp: 140, time: '35 min' },
      { id: 'm4', title: 'World Generator', blocks: 400, xp: 200, time: '50 min' },
    ],
    builds: ['Wizard Tower', 'Potion Lab', 'Enchanted Forest', 'Castle']
  }
];

const ACHIEVEMENTS = [
  { id: 'first_block', title: 'First Block', desc: 'Place your first block', icon: '🧱', xp: 10 },
  { id: 'builder', title: 'Builder', desc: 'Place 100 blocks', icon: '🏗️', xp: 50 },
  { id: 'architect', title: 'Architect', desc: 'Complete your first build', icon: '🏛️', xp: 100 },
  { id: 'coder', title: 'Coder', desc: 'Write your first program', icon: '💻', xp: 50 },
  { id: 'engineer', title: 'Engineer', desc: 'Complete 5 coding challenges', icon: '⚙️', xp: 150 },
  { id: 'explorer', title: 'Explorer', desc: 'Visit all worlds', icon: '🗺️', xp: 200 },
  { id: 'master', title: 'Master Crafter', desc: 'Complete all lessons', icon: '🏆', xp: 500 },
];

export default function CodeCraftAcademy({ onNavigate }) {
  const { user, updateUserData } = useUser();
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [grid, setGrid] = useState(Array(12).fill().map(() => Array(16).fill(null)));
  const [selectedBlock, setSelectedBlock] = useState('grass');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [mode, setMode] = useState('blocks'); // 'blocks' or 'entities'
  const [entities, setEntities] = useState([]);
  const [blocklyWorkspace, setBlocklyWorkspace] = useState(null);
  const blocklyDiv = useRef(null);
  const [achievements, setAchievements] = useState(user.codeCraftAchievements || []);
  const [stats, setStats] = useState(user.codeCraftStats || {
    blocksPlaced: 0,
    worldsCompleted: 0,
    lessonsCompleted: 0,
    totalXP: 0,
  });
  const [codeOutput, setCodeOutput] = useState('Ready to run code...\n\n💡 TIP: Drag blocks from the toolbox!\n💡 Use "spawn" blocks to add NPCs!\n💡 Use "move" blocks to make them walk!');
  const resizeHandlerRef = useRef(null);

  // Initialize Blockly when builder opens
  useEffect(() => {
    if (showBuilder && blocklyDiv.current && !blocklyWorkspace) {
      // Wait for Blockly to be fully loaded
      const initBlockly = async () => {
        try {
          // Ensure Blockly is available
          if (!window.Blockly && typeof Blockly !== 'undefined') {
            window.Blockly = Blockly;
          }
          
          // Define custom blocks
          const success = defineCodeCraftBlocks();
          if (!success) {
            console.error('Failed to define blocks');
            setCodeOutput('❌ Block system failed to initialize. Please refresh the page.');
            return;
          }
          
          const workspace = Blockly.inject(blocklyDiv.current, {
            toolbox: `<xml xmlns="https://developers.google.com/blockly/xml">
              <sep gap="16"></sep>
              <label text="🧑 SPAWN ENTITIES" web-class="toolboxLabel"></label>
              <block type="codecraft_spawn_entity">
                <field name="ENTITY">PLAYER</field>
              </block>
              <block type="codecraft_spawn_entity">
                <field name="ENTITY">VILLAGER</field>
              </block>
              <block type="codecraft_spawn_entity">
                <field name="ENTITY">COW</field>
              </block>
              <block type="codecraft_spawn_entity">
                <field name="ENTITY">PIG</field>
              </block>
              <block type="codecraft_spawn_entity">
                <field name="ENTITY">SHEEP</field>
              </block>
              <block type="codecraft_spawn_entity">
                <field name="ENTITY">ZOMBIE</field>
              </block>
              <sep gap="32"></sep>
              <label text="🚶 MOVE ENTITIES" web-class="toolboxLabel"></label>
              <block type="codecraft_move_entity">
                <field name="ENTITY">PLAYER</field>
                <field name="DIRECTION">right</field>
                <field name="STEPS">1</field>
              </block>
              <block type="codecraft_move_entity">
                <field name="ENTITY">PLAYER</field>
                <field name="DIRECTION">up</field>
                <field name="STEPS">1</field>
              </block>
              <block type="codecraft_walk_to">
                <field name="ENTITY">PLAYER</field>
                <field name="ROW">5</field>
                <field name="COL">5</field>
              </block>
              <sep gap="32"></sep>
              <label text="🧱 BUILD BLOCKS" web-class="toolboxLabel"></label>
              <block type="codecraft_place_block">
                <field name="BLOCK">GRASS</field>
              </block>
              <block type="codecraft_place_block">
                <field name="BLOCK">STONE</field>
              </block>
              <block type="codecraft_place_block">
                <field name="BLOCK">WOOD</field>
              </block>
              <block type="codecraft_place_block">
                <field name="BLOCK">WATER</field>
              </block>
              <block type="codecraft_place_block">
                <field name="BLOCK">DIAMOND</field>
              </block>
              <sep gap="32"></sep>
              <label text="⚙️ CONTROL" web-class="toolboxLabel"></label>
              <block type="codecraft_repeat">
                <field name="TIMES">10</field>
              </block>
              <block type="codecraft_wait">
                <field name="SECONDS">1</field>
              </block>
              <sep gap="16"></sep>
            </xml>`,
            grid: {
              spacing: 20,
              length: 3,
              colour: '#ccc',
              snap: true
            },
            zoom: {
              controls: true,
              wheel: true,
              startScale: 1.0,
              maxScale: 3,
              minScale: 0.3,
              scaleSpeed: 1.2
            },
            trashcan: true,
            media: '/blockly-media/'
          });
          
          setBlocklyWorkspace(workspace);
          
          // Resize workspace to fit container - multiple attempts to catch layout changes
          setTimeout(() => {
            Blockly.svgResize(workspace);
            setTimeout(() => Blockly.svgResize(workspace), 100);
            setTimeout(() => Blockly.svgResize(workspace), 300);
          }, 50);
          
          // Handle window resize
          resizeHandlerRef.current = () => {
            if (workspace) {
              Blockly.svgResize(workspace);
            }
          };
          window.addEventListener('resize', resizeHandlerRef.current);
          
          // Load starter blocks for lesson
          loadStarterBlocks(workspace);
        } catch (error) {
          console.error('Blockly initialization error:', error);
          setCodeOutput(`❌ Failed to initialize block editor: ${error.message}\n\nPlease refresh the page and try again.`);
        }
      };
      
      // Small delay to ensure DOM is ready
      setTimeout(initBlockly, 100);
    }
    
    return () => {
      if (blocklyWorkspace && !showBuilder) {
        try {
          blocklyWorkspace.dispose();
          if (resizeHandlerRef.current) {
            window.removeEventListener('resize', resizeHandlerRef.current);
          }
        } catch (e) {
          console.warn('Workspace cleanup warning:', e);
        }
        setBlocklyWorkspace(null);
      }
    };
  }, [showBuilder]);

  const loadStarterBlocks = (workspace) => {
    const starterXml = `
      <xml>
        <block type="codecraft_spawn_entity" x="20" y="20">
          <field name="ENTITY">PLAYER</field>
          <field name="ROW">5</field>
          <field name="COL">5</field>
          <next>
            <block type="codecraft_move_entity">
              <field name="ENTITY">PLAYER</field>
              <field name="DIRECTION">right</field>
              <field name="STEPS">3</field>
            </block>
          </next>
        </block>
      </xml>
    `;
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(starterXml), workspace);
  };

  const BLOCKS = [
    { id: 'grass', name: 'Grass', color: '#7cbd42', pattern: 'grass', code: 'GRASS' },
    { id: 'dirt', name: 'Dirt', color: '#8B6F47', pattern: 'dirt', code: 'DIRT' },
    { id: 'stone', name: 'Stone', color: '#7D7D7D', pattern: 'stone', code: 'STONE' },
    { id: 'wood', name: 'Wood Planks', color: '#9C7F4C', pattern: 'wood', code: 'WOOD' },
    { id: 'cobble', name: 'Cobblestone', color: '#7A7A7A', pattern: 'cobble', code: 'COBBLE' },
    { id: 'water', name: 'Water', color: '#2E5FBF', pattern: 'water', code: 'WATER', animated: true },
    { id: 'lava', name: 'Lava', color: '#FF6B1A', pattern: 'lava', code: 'LAVA', animated: true },
    { id: 'redstone', name: 'Redstone', color: '#C00000', pattern: 'redstone', code: 'REDSTONE', powered: true },
    { id: 'gold', name: 'Gold Block', color: '#FCEE4B', pattern: 'gold', code: 'GOLD' },
    { id: 'diamond', name: 'Diamond Block', color: '#5DEDD8', pattern: 'diamond', code: 'DIAMOND' },
    { id: 'glass', name: 'Glass', color: '#E0F7FA', pattern: 'glass', code: 'GLASS', transparent: true },
    { id: 'tnt', name: 'TNT', color: '#FF3333', pattern: 'tnt', code: 'TNT', explosive: true },
    { id: 'iron', name: 'Iron Block', color: '#D8D8D8', pattern: 'iron', code: 'IRON' },
    { id: 'emerald', name: 'Emerald', color: '#17DD62', pattern: 'emerald', code: 'EMERALD' },
    { id: 'obsidian', name: 'Obsidian', color: '#0F0D14', pattern: 'obsidian', code: 'OBSIDIAN' },
  ];

  const ENTITIES = [
    // People
    { id: 'player', name: 'Player', emoji: '🧑', code: 'PLAYER', category: 'people', color: '#3b82f6' },
    { id: 'villager', name: 'Villager', emoji: '👨‍🌾', code: 'VILLAGER', category: 'people', color: '#92400e' },
    { id: 'wizard', name: 'Wizard', emoji: '🧙', code: 'WIZARD', category: 'people', color: '#8b5cf6' },
    { id: 'knight', name: 'Knight', emoji: '⚔️', code: 'KNIGHT', category: 'people', color: '#64748b' },
    { id: 'builder', name: 'Builder', emoji: '👷', code: 'BUILDER', category: 'people', color: '#f59e0b' },
    { id: 'scientist', name: 'Scientist', emoji: '🔬', code: 'SCIENTIST', category: 'people', color: '#06b6d4' },
    
    // Animals
    { id: 'cow', name: 'Cow', emoji: '🐄', code: 'COW', category: 'animals', color: '#78350f' },
    { id: 'pig', name: 'Pig', emoji: '🐷', code: 'PIG', category: 'animals', color: '#ec4899' },
    { id: 'sheep', name: 'Sheep', emoji: '🐑', code: 'SHEEP', category: 'animals', color: '#f3f4f6' },
    { id: 'chicken', name: 'Chicken', emoji: '🐔', code: 'CHICKEN', category: 'animals', color: '#fef3c7' },
    { id: 'horse', name: 'Horse', emoji: '🐴', code: 'HORSE', category: 'animals', color: '#92400e' },
    { id: 'wolf', name: 'Wolf', emoji: '🐺', code: 'WOLF', category: 'animals', color: '#64748b' },
    { id: 'cat', name: 'Cat', emoji: '🐱', code: 'CAT', category: 'animals', color: '#f59e0b' },
    { id: 'rabbit', name: 'Rabbit', emoji: '🐰', code: 'RABBIT', category: 'animals', color: '#fef3c7' },
    { id: 'bee', name: 'Bee', emoji: '🐝', code: 'BEE', category: 'animals', color: '#fbbf24' },
    { id: 'turtle', name: 'Turtle', emoji: '🐢', code: 'TURTLE', category: 'animals', color: '#22c55e' },
    
    // Monsters (for adventure mode)
    { id: 'zombie', name: 'Zombie', emoji: '🧟', code: 'ZOMBIE', category: 'monsters', color: '#16a34a' },
    { id: 'skeleton', name: 'Skeleton', emoji: '💀', code: 'SKELETON', category: 'monsters', color: '#f3f4f6' },
    { id: 'spider', name: 'Spider', emoji: '🕷️', code: 'SPIDER', category: 'monsters', color: '#7c2d12' },
    { id: 'dragon', name: 'Dragon', emoji: '🐉', code: 'DRAGON', category: 'monsters', color: '#dc2626' },
  ];

  const placeBlock = (row, col) => {
    if (mode === 'entities') {
      placeEntity(row, col);
      return;
    }
    
    const newGrid = [...grid];
    newGrid[row][col] = newGrid[row][col] === selectedBlock ? null : selectedBlock;
    setGrid(newGrid);
    
    const newStats = { ...stats, blocksPlaced: stats.blocksPlaced + 1 };
    setStats(newStats);
    
    // Play Minecraft-style sound effect (if available)
    playBlockSound(selectedBlock);
    
    // Check achievements
    if (stats.blocksPlaced === 0 && !achievements.includes('first_block')) {
      unlockAchievement('first_block');
    }
    if (stats.blocksPlaced >= 99 && !achievements.includes('builder')) {
      unlockAchievement('builder');
    }
  };

  const placeEntity = (row, col) => {
    if (!selectedEntity) return;
    
    // Check if entity already exists at this position
    const existingIndex = entities.findIndex(e => e.row === row && e.col === col);
    if (existingIndex !== -1) {
      // Remove entity
      setEntities(entities.filter((_, i) => i !== existingIndex));
      return;
    }
    
    const entityType = ENTITIES.find(e => e.id === selectedEntity);
    const newEntity = {
      id: `${selectedEntity}_${Date.now()}`,
      type: selectedEntity,
      name: entityType.name,
      emoji: entityType.emoji,
      code: entityType.code,
      color: entityType.color,
      row,
      col,
      direction: 'right', // right, left, up, down
      moving: false,
    };
    
    setEntities([...entities, newEntity]);
    setCodeOutput(prev => prev + `\n✓ Spawned ${entityType.name} at (${row}, ${col}) [ID: ${newEntity.id.split('_')[1]}]`);
  };

  const playBlockSound = (blockType) => {
    // Placeholder for block placement sound
    // In production, add actual Minecraft-style sound effects
    console.log(`🔊 Placed ${blockType} block`);
  };

  const runCode = async () => {
    if (!blocklyWorkspace) {
      setCodeOutput('❌ No workspace found. Please refresh the page.');
      return;
    }

    // Save current scroll position
    const scrollY = window.scrollY;

    try {
      // Generate code from blocks
      const code = BlocklyJS.javascriptGenerator.workspaceToCode(blocklyWorkspace);
      
      console.log('Generated code:', code);
      
      if (!code || code.trim() === '') {
        setCodeOutput('⚠️ No blocks in workspace! Drag blocks from the left to build your program.');
        return;
      }

      const output = [];
      let commandCount = 0;
      
      // Parse generated code
      const lines = code.split('\n').filter(l => l.trim());
      
      for (const line of lines) {
        // Parse place_block
        const placeMatch = line.match(/place_block\((\d+),\s*(\d+),\s*"(\w+)"\)/);
        if (placeMatch) {
          const [, row, col, blockType] = placeMatch;
          const r = parseInt(row);
          const c = parseInt(col);
          const block = BLOCKS.find(b => b.code === blockType);
          
          if (block && r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
            const newGrid = [...grid];
            newGrid[r][c] = block.id;
            setGrid(newGrid);
            output.push(`✓ Placed ${block.name} at (${r}, ${c})`);
            commandCount++;
          }
        }
        
        // Parse spawn_entity
        const spawnMatch = line.match(/spawn_entity\((\d+),\s*(\d+),\s*"(\w+)"\)/);
        if (spawnMatch) {
          const [, row, col, entityType] = spawnMatch;
          const r = parseInt(row);
          const c = parseInt(col);
          const entity = ENTITIES.find(e => e.code === entityType);
          
          if (entity && r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) {
            const newEntity = {
              id: `${entity.id}_${Date.now()}_${commandCount}`,
              type: entity.id,
              name: entity.name,
              emoji: entity.emoji,
              code: entity.code,
              color: entity.color,
              row: r,
              col: c,
              direction: 'right',
              moving: false,
            };
            setEntities(prev => [...prev, newEntity]);
            output.push(`✓ Spawned ${entity.name} at (${r}, ${c})`);
            commandCount++;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // Parse move_entity
        const moveMatch = line.match(/move_entity\("(\w+)",\s*"(\w+)",\s*(\d+)\)/);
        if (moveMatch) {
          const [, entityCode, direction, steps] = moveMatch;
          const entity = entities.find(e => e.code === entityCode);
          
          if (entity) {
            await moveEntityAnimated(entity.id, direction, parseInt(steps), output);
            commandCount++;
          }
        }
        
        // Parse walk_to
        const walkMatch = line.match(/walk_to\("(\w+)",\s*(\d+),\s*(\d+)\)/);
        if (walkMatch) {
          const [, entityCode, targetRow, targetCol] = walkMatch;
          const entity = entities.find(e => e.code === entityCode);
          
          if (entity) {
            await walkEntityTo(entity.id, parseInt(targetRow), parseInt(targetCol), output);
            commandCount++;
          }
        }
        
        // Parse wait
        const waitMatch = line.match(/wait\(([\d.]+)\)/);
        if (waitMatch) {
          await new Promise(resolve => setTimeout(resolve, parseFloat(waitMatch[1]) * 1000));
        }
      }
      
      if (commandCount === 0) {
        output.push('⚠️ No blocks found!');
        output.push('');
        output.push('💡 Drag blocks from the toolbox on the left');
        output.push('💡 Connect blocks together');
        output.push('💡 Click RUN to execute your code');
      } else {
        output.push(`\n✅ Executed ${commandCount} blocks successfully!`);
      }
      
      setCodeOutput(output.join('\n'));
      
      // Restore scroll position
      setTimeout(() => window.scrollTo(0, scrollY), 0);
    } catch (error) {
      setCodeOutput(`❌ Error: ${error.message}`);
      setTimeout(() => window.scrollTo(0, scrollY), 0);
    }
  };

  const moveEntityAnimated = async (entityId, direction, steps, output) => {
    return new Promise((resolve) => {
      const entity = entities.find(e => e.id === entityId);
      if (!entity) {
        output.push(`✗ Entity not found: ${entityId}`);
        resolve();
        return;
      }
      
      let currentRow = entity.row;
      let currentCol = entity.col;
      let stepsTaken = 0;
      
      const interval = setInterval(() => {
        if (stepsTaken >= steps) {
          clearInterval(interval);
          output.push(`✓ ${entity.name} moved ${direction} ${steps} steps to (${currentRow}, ${currentCol})`);
          resolve();
          return;
        }
        
        let newRow = currentRow;
        let newCol = currentCol;
        
        switch (direction) {
          case 'up': newRow = Math.max(0, currentRow - 1); break;
          case 'down': newRow = Math.min(grid.length - 1, currentRow + 1); break;
          case 'left': newCol = Math.max(0, currentCol - 1); break;
          case 'right': newCol = Math.min(grid[0].length - 1, currentCol + 1); break;
        }
        
        if (newRow !== currentRow || newCol !== currentCol) {
          currentRow = newRow;
          currentCol = newCol;
          
          setEntities(prev => prev.map(e => 
            e.id === entityId 
              ? { ...e, row: newRow, col: newCol, direction, moving: true }
              : e
          ));
          
          stepsTaken++;
        } else {
          clearInterval(interval);
          output.push(`⚠️ ${entity.name} hit boundary after ${stepsTaken} steps`);
          resolve();
        }
      }, 200);
    });
  };

  const walkEntityTo = async (entityId, targetRow, targetCol, output) => {
    return new Promise((resolve) => {
      const entity = entities.find(e => e.id === entityId);
      if (!entity) {
        output.push(`✗ Entity not found: ${entityId}`);
        resolve();
        return;
      }
      
      const path = [];
      let currentRow = entity.row;
      let currentCol = entity.col;
      
      // Simple pathfinding (move vertically then horizontally)
      while (currentRow !== targetRow) {
        currentRow += currentRow < targetRow ? 1 : -1;
        path.push({ row: currentRow, col: currentCol });
      }
      
      while (currentCol !== targetCol) {
        currentCol += currentCol < targetCol ? 1 : -1;
        path.push({ row: currentRow, col: currentCol });
      }
      
      let step = 0;
      const interval = setInterval(() => {
        if (step >= path.length) {
          clearInterval(interval);
          output.push(`✓ ${entity.name} walked to (${targetRow}, ${targetCol})`);
          resolve();
          return;
        }
        
        const pos = path[step];
        const dir = pos.col > (step > 0 ? path[step-1].col : entity.col) ? 'right' :
                    pos.col < (step > 0 ? path[step-1].col : entity.col) ? 'left' :
                    pos.row > (step > 0 ? path[step-1].row : entity.row) ? 'down' : 'up';
        
        setEntities(prev => prev.map(e => 
          e.id === entityId 
            ? { ...e, row: pos.row, col: pos.col, direction: dir, moving: true }
            : e
        ));
        
        step++;
      }, 200);
    });
  };

  const unlockAchievement = (id) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (!achievement || achievements.includes(id)) return;
    
    setAchievements([...achievements, id]);
    const newStats = { ...stats, totalXP: stats.totalXP + achievement.xp };
    setStats(newStats);
    
    // Show notification
    alert(`🎉 Achievement Unlocked: ${achievement.title}!\n+${achievement.xp} XP`);
  };

  const startLesson = (world, lesson) => {
    setSelectedWorld(world);
    setSelectedLesson(lesson);
    setShowBuilder(true);
  };

  const generateLessonCode = (lesson, world) => {
    // Not needed anymore since we're using Blockly blocks
    return '';
  };

  const completeLesson = () => {
    const newStats = {
      ...stats,
      lessonsCompleted: stats.lessonsCompleted + 1,
      totalXP: stats.totalXP + selectedLesson.xp
    };
    setStats(newStats);
    
    if (stats.lessonsCompleted === 0 && !achievements.includes('coder')) {
      unlockAchievement('coder');
    }
    
    alert(`✅ Lesson Complete!\n+${selectedLesson.xp} XP earned`);
    setShowBuilder(false);
    setSelectedLesson(null);
  };

  // World selection view
  if (!showBuilder) {
    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>
              <span style={styles.logo}>⛏️</span>
              CodeCraft Academy
              <span style={styles.subtitle}>Block coding in 3D worlds</span>
            </h1>
            <div style={styles.stats}>
              <div style={styles.statBadge}>
                <span style={styles.statIcon}>🎯</span>
                <div>
                  <div style={styles.statValue}>{stats.totalXP}</div>
                  <div style={styles.statLabel}>Total XP</div>
                </div>
              </div>
              <div style={styles.statBadge}>
                <span style={styles.statIcon}>📚</span>
                <div>
                  <div style={styles.statValue}>{stats.lessonsCompleted}</div>
                  <div style={styles.statLabel}>Lessons</div>
                </div>
              </div>
              <div style={styles.statBadge}>
                <span style={styles.statIcon}>🏆</span>
                <div>
                  <div style={styles.statValue}>{achievements.length}/{ACHIEVEMENTS.length}</div>
                  <div style={styles.statLabel}>Achievements</div>
                </div>
              </div>
              <div style={styles.statBadge}>
                <span style={styles.statIcon}>🧱</span>
                <div>
                  <div style={styles.statValue}>{stats.blocksPlaced}</div>
                  <div style={styles.statLabel}>Blocks</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Worlds Grid */}
        <div style={styles.content}>
          <h2 style={styles.sectionTitle}>🌍 Choose Your World</h2>
          <div style={styles.worldsGrid}>
            {WORLDS.map(world => (
              <div
                key={world.id}
                style={{
                  ...styles.worldCard,
                  background: world.bg,
                  opacity: world.unlocked ? 1 : 0.6,
                  cursor: world.unlocked ? 'pointer' : 'not-allowed'
                }}
                onClick={() => world.unlocked && setSelectedWorld(selectedWorld?.id === world.id ? null : world)}
              >
                <div style={styles.worldEmoji}>{world.emoji}</div>
                <div style={styles.worldInfo}>
                  <h3 style={styles.worldName}>{world.name}</h3>
                  <div style={styles.worldTheme}>{world.theme}</div>
                  <div style={styles.worldDesc}>{world.description}</div>
                  {!world.unlocked && (
                    <div style={styles.locked}>
                      🔒 {world.unlockRequirement}
                    </div>
                  )}
                </div>
                
                {selectedWorld?.id === world.id && world.unlocked && (
                  <div style={styles.lessonsList}>
                    <div style={styles.lessonsHeader}>📖 Lessons</div>
                    {world.lessons.map(lesson => (
                      <div
                        key={lesson.id}
                        style={styles.lessonItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          startLesson(world, lesson);
                        }}
                      >
                        <div style={styles.lessonTitle}>{lesson.title}</div>
                        <div style={styles.lessonMeta}>
                          <span>🧱 {lesson.blocks} blocks</span>
                          <span>⏱️ {lesson.time}</span>
                          <span style={styles.xpBadge}>+{lesson.xp} XP</span>
                        </div>
                      </div>
                    ))}
                    
                    <div style={styles.buildsList}>
                      <div style={styles.buildsHeader}>🏗️ Builds to Complete</div>
                      <div style={styles.buildTags}>
                        {world.builds.map(build => (
                          <span key={build} style={styles.buildTag}>{build}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Achievements Section */}
          <h2 style={styles.sectionTitle}>🏆 Achievements</h2>
          <div style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map(ach => {
              const unlocked = achievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  style={{
                    ...styles.achievementCard,
                    opacity: unlocked ? 1 : 0.4,
                  }}
                >
                  <div style={styles.achievementIcon}>{ach.icon}</div>
                  <div style={styles.achievementName}>{ach.title}</div>
                  <div style={styles.achievementDesc}>{ach.desc}</div>
                  {unlocked && <div style={styles.achievementXP}>+{ach.xp} XP</div>}
                  {!unlocked && <div style={styles.achievementLocked}>🔒</div>}
                </div>
              );
            })}
          </div>

          {/* Quick Start Guide */}
          <div style={styles.guideCard}>
            <h3 style={styles.guideTitle}>🎮 How to Play</h3>
            <div style={styles.guideSteps}>
              <div style={styles.guideStep}>
                <span style={styles.guideNumber}>1</span>
                <div>
                  <strong>Choose a World</strong>
                  <p>Click any world to see its lessons</p>
                </div>
              </div>
              <div style={styles.guideStep}>
                <span style={styles.guideNumber}>2</span>
                <div>
                  <strong>Start a Lesson</strong>
                  <p>Each lesson has block coding challenges</p>
                </div>
              </div>
              <div style={styles.guideStep}>
                <span style={styles.guideNumber}>3</span>
                <div>
                  <strong>Drag & Drop Blocks</strong>
                  <p>Use visual coding blocks to control NPCs</p>
                </div>
              </div>
              <div style={styles.guideStep}>
                <span style={styles.guideNumber}>4</span>
                <div>
                  <strong>Watch Them Move!</strong>
                  <p>Click RUN to see your code in action</p>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: 20, padding: 14, background: 'rgba(0,0,0,0.3)', borderRadius: 0, border: '2px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#FCEE4B', fontFamily: minecraftBoldFont }}>
                🧩 VISUAL BLOCK CODING
              </div>
              <div style={{ fontSize: 10, color: '#CCC', lineHeight: 1.6, fontFamily: minecraftFont }}>
                No typing needed! Drag blocks to spawn people and animals, then make them move around the world.
                Perfect for beginners and visual learners!
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Builder view (when lesson is active)
  return (
    <div style={styles.builderContainer}>
      {/* Add CSS animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-4px); }
        }
      `}</style>
      
      {/* Builder Header */}
      <div style={styles.builderHeader}>
        <button style={styles.backButton} onClick={() => setShowBuilder(false)}>
          ← Back to Worlds
        </button>
        <div style={styles.builderTitle}>
          <span style={styles.worldEmoji}>{selectedWorld.emoji}</span>
          {selectedLesson.title}
        </div>
        <button style={styles.completeButton} onClick={completeLesson}>
          ✓ Complete Lesson (+{selectedLesson.xp} XP)
        </button>
      </div>

      {/* Main Builder Interface */}
      <div style={styles.builderMain}>
        {/* Top Section: Grid and Palette */}
        <div style={{
          display: 'flex',
          height: '500px',
          minHeight: '500px',
          maxHeight: '500px',
          borderBottom: '4px solid #1a1a1a',
          overflow: 'hidden',
        }}>
          {/* Left: Block & Entity Palette */}
          <div style={styles.palette}>
          {/* Mode Switcher */}
          <div style={{ marginBottom: 12, display: 'flex', gap: 4 }}>
            <button
              style={{
                ...styles.modeButton,
                background: mode === 'blocks' ? '#6366f1' : '#2D2D2D',
                borderColor: mode === 'blocks' ? '#4f46e5' : '#3D3D3D',
              }}
              onClick={() => setMode('blocks')}
            >
              🧱
            </button>
            <button
              style={{
                ...styles.modeButton,
                background: mode === 'entities' ? '#22c55e' : '#2D2D2D',
                borderColor: mode === 'entities' ? '#16a34a' : '#3D3D3D',
              }}
              onClick={() => setMode('entities')}
            >
              🧑
            </button>
          </div>
          
          <div style={styles.paletteTitle}>
            {mode === 'blocks' ? '🎨 BLOCKS' : '👥 ENTITIES'}
          </div>
          <div style={{ fontSize: 9, color: '#888', textAlign: 'center', marginBottom: 10, fontFamily: minecraftFont }}>
            {mode === 'blocks' ? 'Click to select block' : 'Click to spawn entity'}
          </div>
          
          {mode === 'blocks' ? (
            // Blocks
            BLOCKS.map(block => (
              <div
                key={block.id}
                style={{
                  ...styles.paletteBlock,
                  borderColor: selectedBlock === block.id ? block.color : '#3D3D3D',
                  background: selectedBlock === block.id 
                    ? `linear-gradient(135deg, ${block.color}88 0%, ${block.color}44 100%)` 
                    : '#1a1a1a',
                  color: selectedBlock === block.id ? '#FFF' : '#AAA',
                }}
                onClick={() => setSelectedBlock(block.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `2px 2px 0 rgba(0,0,0,0.7), 0 0 0 2px ${block.color}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '2px 2px 0 rgba(0,0,0,0.5)';
                }}
              >
                <div style={{ 
                  width: 28, 
                  height: 28, 
                  background: block.color,
                  margin: '0 auto 6px',
                  boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.2)',
                  border: '2px solid rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 8,
                  fontWeight: 700,
                  color: '#000',
                  textShadow: '1px 1px 0 rgba(255,255,255,0.3)',
                  fontFamily: minecraftBoldFont,
                }}>
                  {block.code.slice(0, 2)}
                </div>
                <span style={{ fontSize: 9, fontFamily: minecraftFont, textAlign: 'center', display: 'block' }}>
                  {block.name}
                </span>
              </div>
            ))
          ) : (
            // Entities
            ENTITIES.map(entity => (
              <div
                key={entity.id}
                style={{
                  ...styles.paletteBlock,
                  borderColor: selectedEntity === entity.id ? entity.color : '#3D3D3D',
                  background: selectedEntity === entity.id 
                    ? `linear-gradient(135deg, ${entity.color}88 0%, ${entity.color}44 100%)` 
                    : '#1a1a1a',
                  color: selectedEntity === entity.id ? '#FFF' : '#AAA',
                }}
                onClick={() => setSelectedEntity(entity.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `2px 2px 0 rgba(0,0,0,0.7), 0 0 0 2px ${entity.color}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '2px 2px 0 rgba(0,0,0,0.5)';
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{entity.emoji}</div>
                <span style={{ fontSize: 9, fontFamily: minecraftFont, textAlign: 'center', display: 'block' }}>
                  {entity.name}
                </span>
                <span style={{ fontSize: 7, opacity: 0.6, fontFamily: minecraftFont }}>
                  {entity.code}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Center: 3D World Grid */}
        <div style={styles.worldView}>
          <div style={styles.gridContainer}>
            {grid.map((row, i) => (
              <div key={i} style={styles.gridRow}>
                {row.map((cell, j) => {
                  const block = BLOCKS.find(b => b.id === cell);
                  const entityHere = entities.find(e => e.row === i && e.col === j);
                  
                  return (
                    <div
                      key={j}
                      style={{
                        ...styles.gridCell,
                        background: block ? block.color : '#0D0D0D',
                        borderColor: block ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.05)',
                        position: 'relative',
                      }}
                      onClick={() => placeBlock(i, j)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.zIndex = '10';
                        e.currentTarget.style.boxShadow = block 
                          ? `inset -2px -2px 0 rgba(0,0,0,0.5), inset 2px 2px 0 rgba(255,255,255,0.2), 0 0 0 2px ${block.color}`
                          : 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.zIndex = '1';
                        e.currentTarget.style.boxShadow = 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.1)';
                      }}
                      title={`${block ? block.name : 'Empty'} (${i}, ${j})${entityHere ? ` - ${entityHere.name}` : ''}`}
                    >
                      {block && !entityHere && (
                        <div style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textShadow: '1px 1px 0 rgba(0,0,0,0.8)',
                          fontFamily: minecraftFont,
                          pointerEvents: 'none',
                        }}>
                          {block.code.slice(0, 3)}
                        </div>
                      )}
                      {entityHere && (
                        <div style={{
                          fontSize: 26,
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) ${entityHere.moving ? 'scale(1.1)' : 'scale(1)'}`,
                          transition: 'all 0.2s ease',
                          pointerEvents: 'none',
                          filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.8))',
                          animation: entityHere.moving ? 'bounce 0.3s ease infinite' : 'none',
                        }}>
                          {entityHere.emoji}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          
          <div style={styles.entityInfo}>
            {entities.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, fontFamily: minecraftBoldFont }}>
                  👥 ENTITIES ({entities.length})
                </div>
                {entities.slice(0, 5).map(entity => (
                  <div key={entity.id} style={{ fontSize: 9, fontFamily: minecraftFont, marginBottom: 4, color: '#AAA' }}>
                    {entity.emoji} {entity.name} @ ({entity.row}, {entity.col})
                  </div>
                ))}
                {entities.length > 5 && (
                  <div style={{ fontSize: 9, color: '#666', fontFamily: minecraftFont }}>
                    +{entities.length - 5} more...
                  </div>
                )}
              </>
            )}
          </div>
          
          <div style={styles.controls}>
            <button style={styles.controlBtn} onClick={() => {
              setGrid(Array(12).fill().map(() => Array(16).fill(null)));
              setEntities([]);
            }}>
              🗑️ Clear All
            </button>
            <button style={styles.controlBtn}>
              💾 Save Build
            </button>
            <button style={styles.controlBtn}>
              📤 Export Code
            </button>
            <button style={styles.controlBtn} onClick={() => setEntities([])}>
              👥 Clear Entities
            </button>
          </div>
        </div>
        </div>

        {/* Bottom Section: Block Code Panel */}
        <div style={{
          height: '500px',
          minHeight: '450px',
          display: 'flex',
          flexDirection: 'column',
        }}>
        {/* Right: Block Code Panel */}
        <div style={styles.codePanel}>
          <div style={styles.codePanelHeader}>
            🧩 BLOCK CODE
            <button style={styles.runButton} onClick={runCode}>▶ RUN CODE</button>
          </div>
          
          {/* Blockly Workspace */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#1a1a1a',
            minHeight: '600px',
          }}>
            <div style={{
              padding: '10px 14px',
              background: '#2D2D2D',
              borderBottom: '3px solid #1a1a1a',
              fontSize: 11,
              fontWeight: 600,
              color: '#8B8B8B',
              fontFamily: minecraftFont,
            }}>
              ⬅️ DRAG BLOCKS HERE TO BUILD YOUR PROGRAM
            </div>
            <div 
              ref={blocklyDiv}
              style={{
                flex: 1,
                background: '#1a1a1a',
                position: 'relative',
                width: '100%',
                minHeight: '300px',
                border: '3px solid #3D3D3D',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
              }}
            />
          </div>
          
          <div style={styles.codeOutput}>
            <div style={styles.outputTitle}>📟 OUTPUT CONSOLE</div>
            <div style={styles.outputContent}>
              {codeOutput}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#1a1a1a',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23222222\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    color: '#fff',
    fontFamily: minecraftFont,
    imageRendering: 'pixelated',
  },
  header: {
    background: 'linear-gradient(135deg, #2D2D2D 0%, #1a1a1a 100%)',
    borderBottom: '4px solid #3D3D3D',
    padding: '20px',
    boxShadow: '0 4px 0 rgba(0,0,0,0.5)',
  },
  headerContent: {
    maxWidth: 1400,
    margin: '0 auto',
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    textShadow: '4px 4px 0 rgba(0,0,0,0.5)',
    fontFamily: minecraftBoldFont,
  },
  logo: {
    fontSize: 42,
    filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.5))',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 400,
    color: '#AAA',
    marginLeft: 12,
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    fontFamily: minecraftFont,
  },
  stats: {
    display: 'flex',
    gap: 12,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  statBadge: {
    background: '#2D2D2D',
    padding: '10px 14px',
    borderRadius: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: '3px solid #3D3D3D',
    borderBottom: '4px solid #1a1a1a',
    borderRight: '4px solid #1a1a1a',
    boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    imageRendering: 'pixelated',
  },
  statIcon: {
    fontSize: 24,
    filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.5))',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#FCEE4B',
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    fontFamily: minecraftBoldFont,
  },
  statLabel: {
    fontSize: 9,
    color: '#AAA',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: minecraftFont,
  },
  content: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '24px 20px',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: '24px 0 14px',
    color: '#FFF',
    textShadow: '3px 3px 0 rgba(0,0,0,0.5)',
    fontFamily: minecraftBoldFont,
  },
  worldsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: 16,
    marginBottom: 32,
  },
  worldCard: {
    borderRadius: 0,
    padding: 20,
    cursor: 'pointer',
    transition: 'all 0.1s ease',
    border: '4px solid rgba(255,255,255,0.15)',
    borderBottom: '6px solid rgba(0,0,0,0.5)',
    borderRight: '6px solid rgba(0,0,0,0.5)',
    boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
    imageRendering: 'pixelated',
  },
  worldEmoji: {
    fontSize: 56,
    marginBottom: 10,
    filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.5))',
  },
  worldInfo: {
    marginBottom: 14,
  },
  worldName: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    marginBottom: 6,
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    fontFamily: minecraftBoldFont,
  },
  worldTheme: {
    fontSize: 11,
    color: '#FCEE4B',
    marginBottom: 6,
    fontWeight: 600,
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    fontFamily: minecraftFont,
  },
  worldDesc: {
    fontSize: 11,
    color: '#CCC',
    lineHeight: 1.6,
    fontFamily: minecraftFont,
  },
  locked: {
    marginTop: 10,
    padding: '6px 10px',
    background: 'rgba(0,0,0,0.6)',
    borderRadius: 0,
    fontSize: 10,
    color: '#FCEE4B',
    border: '2px solid rgba(251,191,36,0.5)',
    fontFamily: minecraftFont,
  },
  lessonsList: {
    marginTop: 20,
    padding: 16,
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  lessonsHeader: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 12,
    color: '#fbbf24',
  },
  lessonItem: {
    padding: 12,
    background: '#1e293b',
    borderRadius: 8,
    marginBottom: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '2px solid #334155',
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 6,
  },
  lessonMeta: {
    fontSize: 12,
    color: '#94a3b8',
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  xpBadge: {
    background: '#fbbf24',
    color: '#1e293b',
    padding: '2px 8px',
    borderRadius: 4,
    fontWeight: 700,
    fontSize: 11,
  },
  buildsList: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  buildsHeader: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
    color: '#94a3b8',
  },
  buildTags: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  buildTag: {
    background: '#334155',
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 12,
    color: '#cbd5e1',
  },
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: 16,
    marginBottom: 40,
  },
  achievementCard: {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    borderRadius: 12,
    padding: 20,
    textAlign: 'center',
    border: '2px solid #475569',
  },
  achievementIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 8,
  },
  achievementXP: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: 700,
  },
  achievementLocked: {
    fontSize: 20,
    color: '#64748b',
  },
  guideCard: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    borderRadius: 16,
    padding: 32,
    marginTop: 40,
    border: '2px solid #3b82f6',
  },
  guideTitle: {
    fontSize: 24,
    fontWeight: 700,
    margin: '0 0 24px 0',
  },
  guideSteps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
  },
  guideStep: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  guideNumber: {
    width: 32,
    height: 32,
    background: '#3b82f6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    flexShrink: 0,
  },
  builderContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#1a1a1a',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23222222\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")',
    color: '#fff',
    fontFamily: minecraftFont,
    imageRendering: 'pixelated',
    overflowAnchor: 'none',
  },
  builderHeader: {
    background: '#2D2D2D',
    padding: '14px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '4px solid #1a1a1a',
    boxShadow: '0 4px 0 rgba(0,0,0,0.5)',
  },
  backButton: {
    padding: '10px 16px',
    background: '#3D3D3D',
    border: '3px solid #4D4D4D',
    borderBottom: '4px solid #2D2D2D',
    borderRight: '4px solid #2D2D2D',
    borderRadius: 0,
    color: '#FFF',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: minecraftFont,
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
  },
  builderTitle: {
    fontSize: 18,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textShadow: '3px 3px 0 rgba(0,0,0,0.5)',
    fontFamily: minecraftBoldFont,
  },
  completeButton: {
    padding: '10px 18px',
    background: '#22c55e',
    border: '3px solid #16a34a',
    borderBottom: '4px solid #15803d',
    borderRight: '4px solid #15803d',
    borderRadius: 0,
    color: '#FFF',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: minecraftFont,
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
  },
  builderMain: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 80px)',
  },
  palette: {
    width: 140,
    background: '#2D2D2D',
    borderRight: '4px solid #1a1a1a',
    padding: 10,
    overflowY: 'auto',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
    maxHeight: '100vh',
  },
  modeButton: {
    flex: 1,
    padding: 8,
    border: '3px solid',
    borderRadius: 0,
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 700,
    transition: 'all 0.1s ease',
    borderBottom: '4px solid rgba(0,0,0,0.5)',
    borderRight: '4px solid rgba(0,0,0,0.5)',
  },
  paletteTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 10,
    textAlign: 'center',
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    fontFamily: minecraftBoldFont,
    color: '#FFF',
  },
  paletteBlock: {
    padding: 10,
    marginBottom: 6,
    borderRadius: 0,
    border: '3px solid',
    cursor: 'pointer',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    transition: 'all 0.1s ease',
    boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    imageRendering: 'pixelated',
  },
  worldView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    background: '#87CEEB',
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
      linear-gradient(135deg, #87CEEB 0%, #5DADE2 50%, #3498DB 100%)
    `,
    backgroundSize: '20px 20px, 20px 20px, 100% 100%',
    position: 'relative',
    imageRendering: 'pixelated',
    overflow: 'auto',
  },
  gridContainer: {
    display: 'inline-block',
    background: '#1a1a1a',
    padding: 6,
    borderRadius: 0,
    boxShadow: '4px 4px 0 rgba(0,0,0,0.8), inset 0 0 0 4px #3D3D3D',
    border: '4px solid #2D2D2D',
    imageRendering: 'pixelated',
  },
  gridRow: {
    display: 'flex',
    height: 36,
  },
  gridCell: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.05s ease',
    border: '1px solid rgba(0,0,0,0.3)',
    position: 'relative',
    imageRendering: 'pixelated',
    boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.1)',
  },
  controls: {
    marginTop: 14,
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  entityInfo: {
    marginTop: 12,
    padding: 12,
    background: 'rgba(0,0,0,0.6)',
    border: '3px solid #3D3D3D',
    borderRadius: 0,
    minWidth: 200,
    maxWidth: 300,
    height: 150,
    overflowY: 'auto',
  },
  controlBtn: {
    padding: '10px 16px',
    background: '#2D2D2D',
    border: '3px solid #3D3D3D',
    borderBottom: '4px solid #1a1a1a',
    borderRight: '4px solid #1a1a1a',
    borderRadius: 0,
    color: '#FFF',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: minecraftFont,
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    transition: 'all 0.05s ease',
    imageRendering: 'pixelated',
  },
  codePanel: {
    flex: 1,
    background: '#2D2D2D',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
  },
  codePanelHeader: {
    padding: 14,
    background: '#2D2D2D',
    borderBottom: '3px solid #1a1a1a',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    fontFamily: minecraftBoldFont,
  },
  runButton: {
    padding: '8px 14px',
    background: '#22c55e',
    border: '3px solid #16a34a',
    borderBottom: '4px solid #15803d',
    borderRight: '4px solid #15803d',
    borderRadius: 0,
    color: '#FFF',
    fontSize: 10,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: minecraftFont,
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
  },
  codeEditor: {
    flex: 1,
    background: '#1a1a1a',
    color: '#f8fafc',
    border: 'none',
    padding: 14,
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontSize: 12,
    lineHeight: 1.6,
    resize: 'none',
    outline: 'none',
    imageRendering: 'auto',
  },
  codeOutput: {
    height: 160,
    background: '#0D0D0D',
    borderTop: '3px solid #1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Fira Code', monospace",
  },
  outputTitle: {
    padding: '8px 14px',
    background: '#2D2D2D',
    fontSize: 11,
    fontWeight: 700,
    borderBottom: '2px solid #1a1a1a',
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    fontFamily: minecraftBoldFont,
  },
  outputContent: {
    flex: 1,
    padding: 14,
    fontFamily: "'Fira Code', monospace",
    fontSize: 11,
    color: '#AAA',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.5,
  },
};
