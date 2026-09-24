/**
 * Copy Kenney CC0 GLB models into public/assets/tracks/<track_id>/.
 * Sources: Nature Kit + City Kit (Commercial) from OpenGameArt / Kenney.
 * Run after downloading zips to /tmp/kenney-nature.zip and /tmp/kenney-city.zip
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PUBLIC_TRACKS = path.join(ROOT, 'public', 'assets', 'tracks');

const NATURE = '/tmp/kenney-extract/Models/GLTF format';
const CITY = '/tmp/kenney-city/Models/GLB format';

/** dest filename -> source relative path */
const TRACK_COPIES = {
  sunset_cove_01: {
    'palm_tree.glb': 'NATURE:tree_palm.glb',
    'beach_hut.glb': 'NATURE:tent_detailedClosed.glb',
    'tiki_torch.glb': 'NATURE:campfire_logs.glb',
    'beach_umbrella.glb': 'CITY:detail-parasol-a.glb',
    'island_rock.glb': 'NATURE:rock_largeA.glb',
    'checkpoint_arch.glb': 'NATURE:bridge_stone.glb',
    'hibiscus_flower.glb': 'NATURE:flower_redA.glb',
    'distant_palm.glb': 'NATURE:tree_palmBend.glb',
  },
  candy_carnival_01: {
    'circus_tent.glb': 'NATURE:tent_detailedOpen.glb',
    'lollipop.glb': 'NATURE:flower_redB.glb',
    'candy_cane.glb': 'NATURE:statue_column.glb',
    'ticket_booth.glb': 'CITY:building-a.glb',
    'ferris_base.glb': 'NATURE:statue_ring.glb',
    'tent_small.glb': 'NATURE:tent_smallOpen.glb',
  },
  neon_metro_01: {
    'skyscraper_a.glb': 'CITY:building-skyscraper-a.glb',
    'skyscraper_b.glb': 'CITY:building-skyscraper-b.glb',
    'skyscraper_c.glb': 'CITY:building-skyscraper-c.glb',
    'building_block.glb': 'CITY:low-detail-building-a.glb',
    'metro_pillar.glb': 'NATURE:statue_column.glb',
    'neon_awning.glb': 'CITY:detail-awning.glb',
  },
  cloud_citadel_01: {
    'castle_tower.glb': 'NATURE:statue_column.glb',
    'castle_tower_b.glb': 'NATURE:statue_obelisk.glb',
    'cloud_rock.glb': 'NATURE:cliff_block_rock.glb',
    'bridge_piece.glb': 'NATURE:bridge_center_stone.glb',
  },
  jungle_ruins_01: {
    'jungle_tree.glb': 'NATURE:tree_detailed.glb',
    'jungle_tree_b.glb': 'NATURE:tree_oak.glb',
    'temple_pillar.glb': 'NATURE:statue_columnDamaged.glb',
    'statue_jaguar.glb': 'NATURE:statue_head.glb',
    'statue_block.glb': 'NATURE:statue_block.glb',
    'vine_rock.glb': 'NATURE:rock_tallA.glb',
  },
  frost_peak_01: {
    'snow_pine.glb': 'NATURE:tree_pineRoundC.glb',
    'snow_pine_tall.glb': 'NATURE:tree_pineTallA.glb',
    'ice_rock.glb': 'NATURE:cliff_cave_rock.glb',
    'snow_rock.glb': 'NATURE:rock_smallFlatA.glb',
    'ski_cabin.glb': 'NATURE:tent_smallClosed.glb',
  },
  lava_foundry_01: {
    'forge_rock.glb': 'NATURE:rock_largeD.glb',
    'lava_cliff.glb': 'NATURE:cliff_corner_rock.glb',
    'factory_pipe.glb': 'NATURE:statue_column.glb',
    'gear_rock.glb': 'NATURE:rock_tallB.glb',
    'campfire.glb': 'NATURE:campfire_stones.glb',
  },
  star_station_01: {
    'habitat_dome.glb': 'CITY:building-f.glb',
    'habitat_dome_b.glb': 'CITY:building-g.glb',
    'station_tower.glb': 'CITY:building-skyscraper-d.glb',
    'satellite_base.glb': 'NATURE:statue_ring.glb',
    'glass_panel.glb': 'CITY:detail-awning-wide.glb',
  },
  fairy_glen_01: {
    'giant_daisy.glb': 'NATURE:flower_yellowA.glb',
    'toadstool.glb': 'NATURE:mushroom_red.glb',
    'toadstool_tall.glb': 'NATURE:mushroom_redTall.glb',
    'fairy_flower.glb': 'NATURE:flower_purpleA.glb',
    'cottage.glb': 'NATURE:tent_smallClosed.glb',
    'mushroom_group.glb': 'NATURE:mushroom_redGroup.glb',
  },
  thunder_ridge_01: {
    'mountain_pine.glb': 'NATURE:tree_cone.glb',
    'mountain_pine_tall.glb': 'NATURE:tree_pineTallB.glb',
    'barn.glb': 'CITY:building-b.glb',
    'barn_wide.glb': 'CITY:low-detail-building-wide-a.glb',
    'windmill_base.glb': 'NATURE:statue_obelisk.glb',
    'ridge_rock.glb': 'NATURE:rock_tallC.glb',
  },
};

function resolveSrc(ref) {
  const [kind, file] = ref.split(':');
  const base = kind === 'NATURE' ? NATURE : CITY;
  return path.join(base, file);
}

function copyTrackAssets() {
  if (!fs.existsSync(NATURE)) {
    console.error('Missing Nature Kit GLTF folder. Download Nature Kit (2.1).zip to /tmp/kenney-nature.zip and extract to /tmp/kenney-extract');
    process.exit(1);
  }
  if (!fs.existsSync(CITY)) {
    console.error('Missing City Kit GLB folder. Download kenney_city-kit-commercial to /tmp/kenney-city.zip');
    process.exit(1);
  }

  const bundled = {};
  for (const [trackId, files] of Object.entries(TRACK_COPIES)) {
    const destDir = path.join(PUBLIC_TRACKS, trackId);
    fs.mkdirSync(destDir, { recursive: true });
    let count = 0;
    for (const [destName, srcRef] of Object.entries(files)) {
      const src = resolveSrc(srcRef);
      if (!fs.existsSync(src)) {
        console.warn(`  skip missing: ${srcRef}`);
        continue;
      }
      fs.copyFileSync(src, path.join(destDir, destName));
      count++;
    }
    bundled[trackId] = count > 0;
    console.log(`✓ ${trackId}: ${count} GLB files`);
  }

  // Kenney CC0 license note
  const licenseSrc = path.join('/tmp/kenney-extract', 'License.txt');
  if (fs.existsSync(licenseSrc)) {
    fs.copyFileSync(licenseSrc, path.join(PUBLIC_TRACKS, 'KENNEY_CC0_LICENSE.txt'));
  }

  fs.writeFileSync(
    path.join(PUBLIC_TRACKS, 'bundled-tracks.json'),
    JSON.stringify(bundled, null, 2),
  );

  const dataJs = `/** Auto-generated by scripts/install-kenney-track-assets.mjs */\nexport const BUNDLED_TRACKS = ${JSON.stringify(bundled, null, 2)};\n`;
  fs.writeFileSync(
    path.join(ROOT, 'src', 'virtual-robot-designer', 'racing', 'mk-tracks', 'bundled-tracks-data.js'),
    dataJs,
  );
  console.log('Wrote bundled-tracks-data.js');
}

copyTrackAssets();
