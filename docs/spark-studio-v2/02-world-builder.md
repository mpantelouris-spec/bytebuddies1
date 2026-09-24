# Spark Studio V2 — World Builder, Environments & Creative Tools (Part 3)

> Source: Spark Studio V2 design vision (user specification, Sep 2026). Implement in phases; see [README](./README.md).

---

PART 3 — WORLD BUILDER, ENVIRONMENTS & CREATIVE TOOLS

THE WORLD BUILDER
The World Builder is the heart of Spark Studio.
This should not feel like placing blocks onto a grid.
It should feel like standing inside your own digital toy box.
Children should be able to imagine a world and bring it to life in minutes.
Every interaction should be visual, immediate, playful, and rewarding. The interface should prioritise drag-and-drop, painting, sculpting, snapping, and live previews over text boxes and complex configuration.
The World Builder should support both complete beginners and advanced creators. Simple tasks should take one click, while advanced users should always have additional tools available through expandable menus rather than overwhelming the default interface.

WORLD TYPES
Users should be able to create different types of worlds from the very beginning.
Each world type should include unique terrain presets, assets, lighting, weather, music, and suggested gameplay mechanics.
Adventure Worlds
Dense forests, mountains, villages, castles, caves, rivers, waterfalls, and ruins designed for exploration and quests.
Sci-Fi Worlds
Space stations, alien planets, futuristic cities, asteroid belts, energy reactors, holographic buildings, and robotic wildlife.
Fantasy Worlds
Magic forests, floating islands, enchanted castles, dragons, giant mushrooms, magical portals, crystal caverns, and ancient temples.
Pirate Worlds
Tropical islands, beaches, harbours, pirate ships, hidden coves, sea caves, treasure maps, and underwater shipwrecks.
Ancient Worlds
Egyptian pyramids, Roman cities, Greek temples, Mayan ruins, Viking villages, medieval castles, samurai towns, and ancient battlefields.
Sports Worlds
Football stadiums, boxing arenas, racing tracks, skate parks, basketball courts, obstacle courses, and training grounds.
Horror Worlds
Abandoned hospitals, haunted mansions, forests at night, underground laboratories, eerie villages, and abandoned amusement parks. These should remain suitable for children with stylised rather than graphic visuals.
Underwater Worlds
Coral reefs, submarines, underwater cities, shipwrecks, giant sea creatures, kelp forests, glowing caves, and deep-sea trenches.
City Worlds
Modern cities, futuristic megacities, suburban neighbourhoods, airports, train stations, shopping districts, parks, and skyscrapers.
Open Sandbox
A completely blank world where the user chooses every aspect from terrain to weather.

WORLD GENERATOR
Instead of forcing users to start from nothing, provide a World Generator.
The generator should ask simple visual questions rather than presenting technical settings.
Examples:
* Do you want mountains?
* Should there be water?
* Is this world peaceful or dangerous?
* Day or night?
* Warm or cold?
* Natural or futuristic?
* Small map or huge map?
* Flat or hilly?
* Lots of trees or very few?
As the user answers, a live preview updates instantly.
Once complete, Spark Studio generates a starting world with terrain, lighting, vegetation, roads, water, and landmarks already in place.

TERRAIN EDITOR
Terrain editing should feel like painting.
Brushes should include:
* Raise terrain
* Lower terrain
* Flatten
* Smooth
* Sharpen
* Noise
* Plateau
* Canyon
* Cliff
* Crater
* Valley
* Ridge
Brush size and strength should update live beneath the cursor.
The cursor should preview exactly how the terrain will change before the user clicks.

TERRAIN MATERIALS
Allow painting multiple terrain materials.
Grass
Dark Grass
Dry Grass
Sand
Desert Sand
Snow
Ice
Mud
Rock
Stone
Gravel
Clay
Lava Rock
Ash
Crystal
Marble
Metal Floor
Cyber Grid
Alien Surface
Moon Dust
Mars Rock
Each material should automatically blend into neighbouring materials with soft transitions.

WATER SYSTEM
Water should be far more than a blue plane.
Users should be able to paint:
Lakes
Rivers
Streams
Oceans
Ponds
Waterfalls
Flood Zones
Swamps
Underground Rivers
Lava Rivers
Acid Pools
Magic Water
Each water type should support:
Depth
Current Speed
Wave Size
Reflection Quality
Colour
Transparency
Foam
Ripples
Sound
Fish
Boats
Swimming

WEATHER SYSTEM
Weather should completely transform the atmosphere.
Include:
Sunny
Cloudy
Rain
Heavy Rain
Storm
Snow
Blizzard
Fog
Mist
Sandstorm
Meteor Shower
Aurora
Volcanic Ash
Acid Rain
Alien Storm
Lightning
Cherry Blossom Petals
Falling Leaves
Fireflies
Butterflies
Each weather type changes:
Lighting
Sky
Ambient sound
Wind
Particles
Ground appearance
NPC behaviour
Wildlife
Music

TIME OF DAY
A simple slider should allow users to move through a full day.
Morning
Midday
Afternoon
Sunset
Golden Hour
Twilight
Night
Midnight
Changing the time should update:
Sun position
Sky colour
Moon
Stars
Street lights
Window lights
NPC schedules
Animals
Ambient sounds

SKYBOXS
Offer dozens of cinematic skyboxes.
Examples:
Blue Sky
Storm Clouds
Galaxy
Nebula
Northern Lights
Alien Sky
Underwater Dome
Fantasy Kingdom
Cyber Grid
Ancient Temple
Volcano
Deep Space
Moon
Mars
Floating Islands
Candy World
Haunted Night

ENVIRONMENT DETAILS
The smallest details make worlds believable.
Automatically add:
Birds
Butterflies
Leaves
Dust
Grass movement
Wind
Cloud shadows
Flying insects
Fish
Falling petals
Moving clouds
Animals wandering
Water reflections
Small rocks
Flowers
Ground clutter
Spark Studio should intelligently populate worlds while allowing users to customise every element.

VEGETATION SYSTEM
Nature should feel alive.
Tree species should include:
Oak
Birch
Pine
Palm
Cherry Blossom
Willow
Redwood
Dead Tree
Crystal Tree
Alien Tree
Glowing Tree
Fantasy Tree
Users should also place:
Bushes
Flowers
Ferns
Tall Grass
Cactus
Mushrooms
Vines
Bamboo
Lily Pads
Seaweed
Coral
Every plant should support colour variations, growth stages, and seasonal appearance.

STRUCTURE LIBRARY
Rather than placing individual walls one by one, offer complete structure kits.
Castle Kit
Village Kit
Modern House Kit
Japanese Village Kit
Sci-Fi Base Kit
Pirate Port Kit
Ancient Temple Kit
Wild West Kit
Cyber City Kit
School Kit
Farm Kit
Factory Kit
Airport Kit
Hospital Kit
Museum Kit
Each kit should include matching walls, roofs, windows, furniture, lighting, decorations, and pathways.

SMART BUILDING TOOLS
Users should never spend time repeatedly placing identical objects.
Include tools for:
Paint Multiple Objects
Fill Area
Replace Materials
Mirror Building
Duplicate Along Path
Random Scatter
Snap to Terrain
Align to Grid
Auto Fence
Auto Road
Auto River
Auto Forest
Auto Village
Auto Castle Walls
Auto Bridges
Auto Street Lights
Auto Pavement
These should generate believable layouts while still allowing manual adjustment.

LIGHTING SYSTEM
Lighting should dramatically change mood.
Offer presets such as:
Bright Day
Soft Morning
Golden Sunset
Moonlight
Haunted
Sci-Fi Blue
Cyberpunk Neon
Warm Village
Cold Arctic
Underwater
Volcanic
Magical Forest
Users should be able to place:
Street Lights
Lanterns
Torches
Campfires
Magic Crystals
Spotlights
Floodlights
Neon Signs
Glowing Mushrooms
Fireflies

SOUND DESIGN
Every world should sound alive.
Allow ambient sound zones such as:
Forest
Beach
Ocean
Rain
Wind
Cave
City
Marketplace
Space Station
Factory
Volcano
Jungle
Temple
Village
Each zone should smoothly blend into neighbouring zones as the player moves around the world.

WORLD EVENTS
Allow creators to add dynamic events.
Examples include:
Volcano erupts
Bridge collapses
Meteor lands
Train arrives
Rocket launches
Castle gate opens
Storm begins
Treasure appears
Boss awakens
Earthquake
Festival starts
Day changes to night
NPC parade
Dragon flies overhead
These events can be triggered by timers, player actions, quests, switches, or achievements, giving creators powerful storytelling tools without requiring complex scripting.

DESIGN PRINCIPLE
Every tool in the World Builder should answer the question:
"How can we make this easier, more visual, and more fun?"
If a feature currently requires typing numbers into a dialog box, replace it with an interactive control wherever possible—a brush, a slider, a visual handle, a live preview, or a drag-and-drop interaction. The goal is to keep children immersed in creating worlds rather than managing settings.

The next chapter should focus on Robot Creator, Characters, NPCs, enemies, animations, combat, AI behaviours, quests, inventories, and customisation, turning robots into memorable companions rather than simple coding avatars.

SPARK STUDIO V2
