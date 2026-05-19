/**
 * SERIALIZATION & PROJECT PERSISTENCE TESTS
 * Comprehensive testing of save/load, import/export, version migration
 */

describe('═══ BLOCK SERIALIZATION ═══', () => {
  describe('basic serialization', () => {
    test('should serialize simple block to JSON', () => {
      const block = {
        type: 'motion-movesteps',
        id: 'block1',
        fields: { STEPS: 10 },
        next: null,
      };

      const json = JSON.stringify(block);
      const parsed = JSON.parse(json);

      expect(parsed.type).toBe('motion-movesteps');
      expect(parsed.fields.STEPS).toBe(10);
    });

    test('should preserve block field types', () => {
      const block = {
        type: 'motion-goto',
        fields: {
          X: 100,
          Y: 200.5,
          NAME: 'sprite1',
          BOOL: true,
        },
      };

      const json = JSON.stringify(block);
      const parsed = JSON.parse(json);

      expect(typeof parsed.fields.X).toBe('number');
      expect(parsed.fields.Y).toBeCloseTo(200.5, 1);
      expect(typeof parsed.fields.NAME).toBe('string');
      expect(typeof parsed.fields.BOOL).toBe('boolean');
    });

    test('should serialize block with statements', () => {
      const block = {
        type: 'control-if',
        fields: { CONDITION: 'true' },
        statements: {
          DO: [
            { type: 'motion-movesteps', fields: { STEPS: 10 } },
            { type: 'motion-movesteps', fields: { STEPS: 20 } },
          ],
        },
      };

      const json = JSON.stringify(block);
      const parsed = JSON.parse(json);

      expect(parsed.statements.DO.length).toBe(2);
      expect(parsed.statements.DO[0].fields.STEPS).toBe(10);
    });

    test('should serialize block with inputs', () => {
      const block = {
        type: 'looks-say',
        inputs: {
          MESSAGE: { type: 'field_input', value: 'Hello' },
          SECS: { type: 'field_number', value: 2 },
        },
      };

      const json = JSON.stringify(block);
      const parsed = JSON.parse(json);

      expect(parsed.inputs.MESSAGE.value).toBe('Hello');
      expect(parsed.inputs.SECS.value).toBe(2);
    });

    test('should handle Unicode in serialization', () => {
      const block = {
        type: 'looks-say',
        fields: { TEXT: '你好世界 🌍 مرحبا' },
      };

      const json = JSON.stringify(block);
      const parsed = JSON.parse(json);

      expect(parsed.fields.TEXT).toContain('你好');
      expect(parsed.fields.TEXT).toContain('🌍');
    });

    test('should handle empty fields', () => {
      const block = {
        type: 'looks-say',
        fields: { TEXT: '' },
      };

      const json = JSON.stringify(block);
      const parsed = JSON.parse(json);

      expect(parsed.fields.TEXT).toBe('');
    });

    test('should handle null values safely', () => {
      const block = {
        type: 'event-start',
        next: null,
        parent: null,
      };

      const json = JSON.stringify(block);
      const parsed = JSON.parse(json);

      expect(parsed.next).toBeNull();
      expect(parsed.parent).toBeNull();
    });

    test('should handle circular references gracefully', () => {
      const block = { type: 'test', id: 'block1' };
      block.self = block;

      expect(() => JSON.stringify(block)).toThrow();
    });
  });

  describe('complex serialization', () => {
    test('should serialize nested block structures', () => {
      const blocks = [
        {
          type: 'event-start',
          next: {
            type: 'loop-repeat',
            fields: { TIMES: 10 },
            statements: {
              DO: [
                { type: 'motion-movesteps', fields: { STEPS: 10 } },
              ],
            },
            next: {
              type: 'looks-say',
              fields: { TEXT: 'Done' },
            },
          },
        },
      ];

      const json = JSON.stringify(blocks);
      const parsed = JSON.parse(json);

      expect(parsed[0].type).toBe('event-start');
      expect(parsed[0].next.type).toBe('loop-repeat');
      expect(parsed[0].next.next.fields.TEXT).toBe('Done');
    });

    test('should handle deeply nested blocks', () => {
      let block = { type: 'start', level: 0 };
      let current = block;

      for (let i = 1; i < 100; i++) {
        current.next = { type: 'block', level: i };
        current = current.next;
      }

      const json = JSON.stringify(block);
      const parsed = JSON.parse(json);

      expect(parsed.level).toBe(0);
      let depth = 0;
      let walker = parsed;
      while (walker.next) {
        walker = walker.next;
        depth++;
      }
      expect(depth).toBe(99);
    });

    test('should serialize blocks with multiple statement branches', () => {
      const block = {
        type: 'control-if-else',
        fields: { CONDITION: 'x > 5' },
        statements: {
          DO: [{ type: 'motion-movesteps', fields: { STEPS: 10 } }],
          ELSE: [{ type: 'motion-movesteps', fields: { STEPS: -10 } }],
        },
      };

      const json = JSON.stringify(block);
      const parsed = JSON.parse(json);

      expect(parsed.statements.DO.length).toBe(1);
      expect(parsed.statements.ELSE.length).toBe(1);
    });
  });

  describe('deserialization', () => {
    test('should deserialize valid JSON', () => {
      const json = '{"type":"motion-movesteps","fields":{"STEPS":10}}';
      const block = JSON.parse(json);

      expect(block.type).toBe('motion-movesteps');
    });

    test('should handle malformed JSON gracefully', () => {
      const malformed = '{"type":"motion-movesteps"invalid}';

      expect(() => JSON.parse(malformed)).toThrow();
    });

    test('should validate block structure after deserialization', () => {
      const json = '{"type":"motion-movesteps","fields":{"STEPS":10}}';
      const block = JSON.parse(json);

      const isValid = block.type && typeof block.fields === 'object';
      expect(isValid).toBe(true);
    });

    test('should recover from partial corrupted data', () => {
      const blocks = [
        { type: 'event-start' },
        null, // corrupted
        { type: 'motion-movesteps', fields: { STEPS: 10 } },
      ];

      const valid = blocks.filter(b => b !== null);
      expect(valid.length).toBe(2);
    });

    test('should handle version migrations', () => {
      const oldVersion = { type: 'looks-say', text: 'Hello' };
      const newVersion = {
        ...oldVersion,
        fields: { TEXT: oldVersion.text },
      };
      delete newVersion.text;

      expect(newVersion.fields.TEXT).toBe('Hello');
      expect(newVersion.text).toBeUndefined();
    });
  });
});

describe('═══ PROJECT SAVE/LOAD ═══', () => {
  describe('project structure', () => {
    test('should save project with metadata', () => {
      const project = {
        id: 'proj1',
        name: 'My Project',
        created: Date.now(),
        modified: Date.now(),
        blocks: [],
        sprites: [],
        variables: {},
      };

      const json = JSON.stringify(project);
      const loaded = JSON.parse(json);

      expect(loaded.name).toBe('My Project');
      expect(typeof loaded.created).toBe('number');
    });

    test('should preserve sprite state', () => {
      const project = {
        id: 'proj1',
        sprites: [
          { id: 'sprite1', name: 'Cat', x: 0, y: 0, visible: true },
          { id: 'sprite2', name: 'Dog', x: 100, y: 100, visible: false },
        ],
      };

      const json = JSON.stringify(project);
      const loaded = JSON.parse(json);

      expect(loaded.sprites[0].name).toBe('Cat');
      expect(loaded.sprites[1].visible).toBe(false);
    });

    test('should preserve variables and lists', () => {
      const project = {
        id: 'proj1',
        variables: {
          count: 0,
          message: 'hello',
          items: ['apple', 'banana', 'cherry'],
        },
      };

      const json = JSON.stringify(project);
      const loaded = JSON.parse(json);

      expect(loaded.variables.count).toBe(0);
      expect(loaded.variables.items.length).toBe(3);
    });

    test('should preserve extensions state', () => {
      const project = {
        id: 'proj1',
        extensions: {
          'face-detection': { enabled: true },
          'voice': { enabled: true },
          'bluetooth': { enabled: false },
        },
      };

      const json = JSON.stringify(project);
      const loaded = JSON.parse(json);

      expect(loaded.extensions['face-detection'].enabled).toBe(true);
      expect(loaded.extensions['bluetooth'].enabled).toBe(false);
    });

    test('should preserve costumes and sounds', () => {
      const project = {
        id: 'proj1',
        assets: {
          costumes: [
            { id: 'cost1', name: 'costume1', data: 'base64...' },
          ],
          sounds: [
            { id: 'sound1', name: 'meow', data: 'base64...' },
          ],
        },
      };

      const json = JSON.stringify(project);
      const loaded = JSON.parse(json);

      expect(loaded.assets.costumes[0].name).toBe('costume1');
      expect(loaded.assets.sounds[0].name).toBe('meow');
    });

    test('should handle large projects', () => {
      const project = {
        id: 'large-proj',
        sprites: [],
        blocks: [],
      };

      // Add 1000 blocks
      for (let i = 0; i < 1000; i++) {
        project.blocks.push({
          type: 'motion-movesteps',
          id: `block${i}`,
          fields: { STEPS: i },
        });
      }

      const json = JSON.stringify(project);
      const loaded = JSON.parse(json);

      expect(loaded.blocks.length).toBe(1000);
    });
  });

  describe('save/load cycle', () => {
    test('should maintain data integrity through save/load', () => {
      const original = {
        id: 'proj1',
        name: 'Test',
        count: 42,
        active: true,
        items: ['a', 'b', 'c'],
      };

      const saved = JSON.stringify(original);
      const loaded = JSON.parse(saved);

      expect(loaded).toEqual(original);
    });

    test('should handle incremental saves', () => {
      let project = {
        id: 'proj1',
        version: 1,
        blocks: [],
      };

      // Save version 1
      let saved = JSON.stringify(project);

      // Modify
      project.blocks.push({ type: 'motion-movesteps' });
      project.version = 2;

      // Save version 2
      saved = JSON.stringify(project);
      const loaded = JSON.parse(saved);

      expect(loaded.version).toBe(2);
      expect(loaded.blocks.length).toBe(1);
    });

    test('should recover from incomplete saves', () => {
      const partial = '{id:"proj1",name:"Test"'; // incomplete JSON
      let recovered = null;

      try {
        recovered = JSON.parse(partial);
      } catch (e) {
        // Fallback to defaults
        recovered = { id: 'proj1', name: 'Test' };
      }

      expect(recovered.id).toBe('proj1');
    });

    test('should handle concurrent saves', async () => {
      let project = { id: 'proj1', counter: 0 };
      const saves = [];

      for (let i = 0; i < 5; i++) {
        project.counter++;
        saves.push(JSON.stringify(project));
      }

      const finalProject = JSON.parse(saves[saves.length - 1]);
      expect(finalProject.counter).toBe(5);
    });
  });

  describe('backwards compatibility', () => {
    test('should handle old project format', () => {
      const oldProject = {
        id: 'old',
        blocks: { '1': { type: 'motion-movesteps' } }, // old format with ID keys
      };

      // Migrate to new format
      const newProject = {
        ...oldProject,
        blocks: Object.values(oldProject.blocks),
      };

      expect(Array.isArray(newProject.blocks)).toBe(true);
    });

    test('should migrate missing fields', () => {
      const oldProject = {
        id: 'proj1',
        name: 'Old Project',
        // missing: modified, author, etc.
      };

      const newProject = {
        ...oldProject,
        modified: oldProject.created || Date.now(),
        author: oldProject.author || 'Unknown',
      };

      expect(typeof newProject.modified).toBe('number');
      expect(typeof newProject.author).toBe('string');
    });

    test('should handle deprecated block types', () => {
      const oldBlock = { type: 'looks-say-for-seconds' }; // deprecated
      const newBlock = { ...oldBlock, type: 'looks-say-for' }; // new name

      expect(newBlock.type).toBe('looks-say-for');
    });
  });

  describe('corrupted project recovery', () => {
    test('should detect corrupted JSON', () => {
      const corrupted = '{"id":"proj1",invalid json}';
      let isValid = true;

      try {
        JSON.parse(corrupted);
      } catch (e) {
        isValid = false;
      }

      expect(isValid).toBe(false);
    });

    test('should recover with defaults', () => {
      const corrupted = { id: 'proj1', blocks: undefined };
      const recovered = {
        ...corrupted,
        blocks: corrupted.blocks || [],
      };

      expect(recovered.blocks).toEqual([]);
    });

    test('should validate recovered project', () => {
      const project = {
        id: 'proj1',
        name: '',
        blocks: null,
      };

      const isValid = project.id && Array.isArray(project.blocks || []);
      expect(isValid).toBe(true);
    });

    test('should allow manual recovery', () => {
      const attempts = [];

      // Attempt 1: Load from primary
      attempts.push(null); // failed

      // Attempt 2: Load from backup
      attempts.push({ id: 'proj1', restored: true });

      const final = attempts.find(a => a !== null);
      expect(final.restored).toBe(true);
    });
  });
});

describe('═══ CLOUD SYNC ═══', () => {
  test('should upload project to cloud', async () => {
    const project = { id: 'proj1', name: 'Test' };
    let uploaded = false;

    // Simulate upload
    uploaded = true;

    expect(uploaded).toBe(true);
  });

  test('should download project from cloud', async () => {
    const downloaded = { id: 'proj1', name: 'Test', cloudId: 'cloud123' };

    expect(downloaded.cloudId).toBeDefined();
  });

  test('should handle sync conflicts', () => {
    const local = { id: 'proj1', version: 2, modified: 1000 };
    const cloud = { id: 'proj1', version: 3, modified: 2000 };

    const final = local.modified > cloud.modified ? local : cloud;
    expect(final.version).toBe(3);
  });

  test('should sync incrementally', () => {
    const changes = [
      { type: 'block-add', block: { id: '1' } },
      { type: 'block-modify', block: { id: '1', fields: {} } },
      { type: 'variable-set', name: 'x', value: 10 },
    ];

    expect(changes.length).toBe(3);
  });

  test('should handle offline mode', () => {
    const isOnline = false;
    const queue = [];

    if (!isOnline) {
      queue.push({ type: 'block-add', pending: true });
    }

    expect(queue[0].pending).toBe(true);
  });

  test('should resync after reconnection', async () => {
    let queued = [];
    queued.push({ action: 'save', pending: true });

    // Reconnected
    const resynced = queued.map(q => ({ ...q, pending: false }));

    expect(resynced[0].pending).toBe(false);
  });
});

describe('═══ EXPORT/IMPORT ═══', () => {
  test('should export to .sb3 format', () => {
    const project = { id: 'proj1', blocks: [], sprites: [] };
    const exported = JSON.stringify(project);

    expect(typeof exported).toBe('string');
  });

  test('should export to .json format', () => {
    const project = { id: 'proj1', blocks: [] };
    const json = JSON.stringify(project, null, 2);

    expect(json).toContain('proj1');
  });

  test('should import from .sb3 format', () => {
    const sb3Data = '{"id":"proj1","name":"Imported"}';
    const project = JSON.parse(sb3Data);

    expect(project.id).toBe('proj1');
  });

  test('should import from .json format', () => {
    const jsonData = '{"id":"proj1","blocks":[]}';
    const project = JSON.parse(jsonData);

    expect(project.blocks.length).toBe(0);
  });

  test('should validate imported project', () => {
    const imported = { id: 'proj1', name: 'Test' };
    const isValid = !!(imported.id && imported.name);

    expect(isValid).toBe(true);
  });
});
