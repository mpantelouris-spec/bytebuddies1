/**
 * Kart tracks 11–19 for Rover & Scout (poster "ByteBuddies Kart Tracks 11-19").
 * `base` is the biome circuit that supplies the road layout; the theme replaces all scenery.
 */
export const KART_THEME_TRACKS = [
  {
    mode: 11, id: 'neon_nitro_nights', title: 'Neon Nitro Nights', emoji: '🌃', base: 'neon_metro_01',
    objective: 'Zoom through the rainy neon city at night!',
    landmark: 'Neon arch', gradient: 'linear-gradient(135deg,#ff2bd6,#3b1bff)',
  },
  {
    mode: 12, id: 'desert_dune_drift', title: 'Desert Dune Drift', emoji: '🏜️', base: 'sunset_cove_01',
    objective: 'Drift past the oasis and sandstone towers at sunset!',
    landmark: 'Desert oasis', gradient: 'linear-gradient(135deg,#ffb347,#c2562b)',
  },
  {
    mode: 13, id: 'haunted_hollow_gp', title: 'Haunted Hollow GP', emoji: '🎃', base: 'thunder_ridge_01',
    objective: 'Race under the full moon past friendly ghosts and pumpkins!',
    landmark: 'Haunted gate', gradient: 'linear-gradient(135deg,#3b1a6b,#ff8a1f)',
  },
  {
    mode: 14, id: 'coral_circuit', title: 'Coral Circuit', emoji: '🐠', base: 'cloud_citadel_01',
    objective: 'Cruise the wooden boardwalk over the tropical sea!',
    landmark: 'Flower arch', gradient: 'linear-gradient(135deg,#1fd1c7,#ffd166)',
  },
  {
    mode: 15, id: 'bamboo_thunder_rally', title: 'Bamboo Thunder Rally', emoji: '🎋', base: 'jungle_ruins_01',
    objective: 'Rally through bamboo forests while the thunder rumbles!',
    landmark: 'Pagoda', gradient: 'linear-gradient(135deg,#2f855a,#4a5568)',
  },
  {
    mode: 16, id: 'meteor_mine_madness', title: 'Meteor Mine Madness', emoji: '☄️', base: 'lava_foundry_01',
    objective: 'Dash through the glowing crystal mine!',
    landmark: 'Crystal cave', gradient: 'linear-gradient(135deg,#6b46c1,#7c4a1e)',
  },
  {
    mode: 17, id: 'pinwheel_plaza_sprint', title: 'Pinwheel Plaza Sprint', emoji: '🎡', base: 'fairy_glen_01',
    objective: 'Sprint round the pastel plaza under giant pinwheels!',
    landmark: 'Giant pinwheel', gradient: 'linear-gradient(135deg,#ff9ad5,#7cc6ff)',
  },
  {
    mode: 18, id: 'glacial_gorge_gp', title: 'Glacial Gorge GP', emoji: '🧊', base: 'frost_peak_01',
    objective: 'Slide through the icy gorge under the northern lights!',
    landmark: 'Ice arch', gradient: 'linear-gradient(135deg,#0b3d91,#5ee7df)',
  },
  {
    mode: 19, id: 'safari_stampede_cup', title: 'Safari Stampede Cup', emoji: '🦓', base: 'candy_carnival_01',
    objective: 'Race across the savanna past zebras and giraffes!',
    landmark: 'Watering hole', gradient: 'linear-gradient(135deg,#f6ad55,#8b5a2b)',
  },
];

export const KART_THEME_BY_MODE = Object.fromEntries(KART_THEME_TRACKS.map((t) => [t.mode, t]));
