# CLAUDE.md - AI Assistant Reference for "Get to the Gig"

## Project Overview

**Get to the Gig** is a punk-themed endless runner game built with vanilla JavaScript and HTML5 Canvas. The player is a punk rocker trying to reach their gig while avoiding cops, trash cans, and burning obstacles on city streets.

### Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5 Canvas
- **Styling**: CSS3 with mobile-first responsive design
- **Assets**: PNG sprites, animated GIFs, MP3 audio files
- **Hosting**: Static site (GitHub Pages compatible)

### Game Mechanics
- Endless runner with platforming elements
- Variable jump height (hold/release space for control)
- Health system (3 hearts)
- Power-ups (weed for health, git for invincibility + speed)
- Score system (points for destroying cops)
- Progressive difficulty scaling
- Stacked obstacles and triple-stack sequences

---

## Repository Structure

```
/Get-to-the-gig/
├── index.html              # Main HTML entry point
├── script.js               # Core game logic (~1400 lines)
├── style.css               # Responsive styling and mobile support
├── background.jpg          # Page background image
├── Lostdog-logo-white.jpg  # Logo for in-game background pattern
├── CNAME                   # GitHub Pages custom domain config
├── README.md               # Project readme
├── /assets/                # Game sprites and graphics
│   ├── /Punk_Run/          # Player animation frames (run0.png - run7.png)
│   │   ├── run0.png - run7.png (8 frames)
│   │   └── *.svg files (vector source files)
│   ├── policeman_walk_gif (256×256).gif  # Animated cop sprite
│   ├── trash.png           # Trash can obstacle sprite
│   ├── fire.gif            # Fire animation for burning trash cans
│   ├── weed.png            # Health power-up sprite
│   └── git.png             # Invincibility power-up sprite
└── /songs/                 # Background music tracks
    ├── 2Bros.mp3
    ├── Calico.mp3
    ├── Coagulate.mp3
    ├── Deteriorate.mp3
    ├── English.mp3
    ├── French.mp3
    ├── Piss-Phantom-II.mp3
    ├── RadioactiveBabies.mp3
    ├── too-long.mp3
    └── War.mp3
```

---

## Core Files Reference

### 1. `index.html` (script.js:1-25)
Minimal HTML structure with:
- Canvas element for game rendering
- Meta tags for mobile optimization and landscape orientation
- Rotate message overlay for portrait mode on mobile
- Links to `style.css` and `script.js`

**Key Features**:
- Mobile web app capable
- Forces landscape orientation on mobile
- Touch action disabled for better game control

### 2. `script.js` (Main Game Logic)
**File Size**: ~1400 lines
**Structure**: Well-organized with clear section comments

#### Major Sections:
1. **CONFIG Object** (script.js:4-180) - Central configuration system
2. **Game Setup** (script.js:184-193) - Canvas initialization
3. **Sprite Loading** (script.js:209-313) - Asset management
4. **Player Physics** (script.js:554-612) - Movement and jumping
5. **Collision Detection** (script.js:616-789) - AABB with platform support
6. **Rendering** (script.js:793-1247) - Draw functions
7. **Game Loop** (script.js:1338-1359) - Main update/render cycle
8. **Input Handling** (script.js:1364-1402) - Keyboard and touch controls

### 3. `style.css` (script.js:1-118)
Responsive styling with:
- Mobile-first approach
- Landscape/portrait orientation handling
- Rotate message for portrait mode
- Glowing border effects around canvas
- Background image support

---

## Configuration System (CONFIG Object)

**Location**: script.js:4-180

The CONFIG object is the **single source of truth** for all game parameters. This centralized approach makes balancing and tweaking easy.

### Key Configuration Categories:

#### Canvas (script.js:6-9)
```javascript
canvas: {
    width: 1200,
    height: 600
}
```

#### Colors - Punk Aesthetic (script.js:12-35)
- Background: Deep blacks (#0a0a0a, #1a1a1a)
- Player: Neon green (#00ff41)
- Obstacles: Yellow (#ffff00), hot pink (#ff006e)
- UI: Neon green with hot pink accents

#### Player Configuration (script.js:52-63)
```javascript
player: {
    width: 60,              // Visual width
    height: 80,
    hitboxWidth: 30,        // Narrower collision box
    hitboxOffset: 15,       // Center alignment
    x: 150,                 // Fixed horizontal position
    groundY: 450,           // Y when on ground
    jumpForce: -15,         // Negative = upward
    gravity: 0.65,
    maxFallSpeed: 18,
    jumpCutMultiplier: 0.4  // Variable jump height
}
```

#### Obstacle Spacing & Difficulty (script.js:116-135)
**IMPORTANT**: These values control game difficulty progression!

```javascript
obstacles: {
    spawnDistance: 250,           // Min gap between obstacles
    maxSpawnDistance: 400,        // Max gap for variety
    minDistanceFloor: 150,        // Absolute minimum
    tripleStackDistance: 180,     // Jump challenge spacing
    stackHeight: 90,              // Vertical stack spacing
    difficultySpacing: 10,        // Reduction per level
    difficultyMaxSpacing: 15,     // Max reduction per level
    // ...
}
```

**Difficulty Scaling**: Every 50m of distance increases difficulty level (script.js:443)

#### Power-up Configuration (script.js:138-154)
- **Weed**: Health restoration (1.5% spawn chance when damaged)
- **Git**: Invincibility + 3x speed for 4 seconds (0.8% spawn chance)

---

## Game Mechanics Deep Dive

### Physics System

#### Jumping (script.js:593-611)
- **Jump Initiation**: Only when grounded or on platform (no air jumps)
- **Variable Height**: Hold space for full jump, release early for short hop
- **Jump Cut Multiplier**: 0.4 (40% of upward velocity retained on release)
- **No Jump Buffering**: Must be on solid surface to jump

#### Gravity & Falling (script.js:556-564)
- Constant gravity: 0.65 pixels/frame²
- Max fall speed: 18 pixels/frame
- Gravity only applies when airborne (not on ground/platform)

#### Platform Landing (script.js:650-663)
- AABB collision detection with hitboxes
- Landing requires: falling from above, vertical overlap, horizontal overlap
- Snaps player to platform top surface
- Destroys cops when landed on (script.js:768-772)

### Collision System

#### Hitbox Architecture (script.js:618-635)
**Visual vs Collision Separation**: All entities have narrower hitboxes than their visual sprites for forgiving gameplay.

**Player Hitbox**:
- Visual: 60×80 pixels
- Hitbox: 30×80 pixels (centered with 15px offset)

**Obstacle Hitboxes**:
- Cops: 30px wide (from 60px visual), 70px tall (from 80px)
- Trash cans: 25px wide (from 45px visual), 50px tall (from 60px)
- Fire cans: 22px wide (from 40px visual)

#### Collision Types (script.js:686-789)
1. **Platform Landing**: Top-down collision → Land on obstacle
2. **Side Collision**: Left/right/bottom → Take damage
3. **Power-up Collection**: Simple AABB overlap → Collect
4. **Git Power Active**: Any collision → Destroy obstacle

### Obstacle System

#### Obstacle Types (script.js:72-114)
1. **Fire Can** (fireCan): Instant damage, not destructible
2. **Cop** (cop): Can be destroyed by landing on top (+10 points), damages on side hit
3. **Obstacle** (obstacle): Yellow trash cans, platforms only

#### Stacking Logic (script.js:473-507)
- **Objects on bottom, people on top**
- Yellow obstacles can stack 2-3 high
- Cops can stack on trash cans or piggyback
- Fire cans never stack (always dangerous)

#### Triple-Stack Sequences (script.js:426-438)
Special challenge pattern:
1. Single yellow platform
2. Gap of 180 pixels (CONFIG.obstacles.tripleStackDistance)
3. Triple-stacked yellows (requires jump from first platform)

**Spawn Conditions**:
- Difficulty level > 2 (script.js:540)
- 200 pixels since last triple-stack (script.js:541)
- 15% random chance (script.js:542)

### Power-up System (script.js:346-398)

#### Weed Power-up
- **Effect**: Restore 1 health point
- **Spawn Condition**: Only when player health < max
- **Spawn Rate**: 1.5% per frame check (every 20 frames)
- **Visual**: Green glow, floating/bobbing animation

#### Git Power-up
- **Effect**: Invincibility + 3x speed multiplier
- **Duration**: 240 frames (4 seconds at 60fps)
- **Spawn Rate**: 0.8% per frame check
- **Visual**: Rainbow trail, pulsing glow, cycling hue
- **Gameplay**: Destroys all obstacles on contact, faster animation

### Health & Damage (script.js:326-332)
- **Max Health**: 3 hearts
- **Invulnerability Frames**: 60 frames (1 second) after damage
- **Visual Feedback**: Flashing sprite during invulnerability
- **Death**: Health reaches 0 → Game Over

### Scoring System
- **Distance**: Automatic (script.js:1315)
- **Points**: +10 per cop destroyed (script.js:769)
- **Display**: Top-left UI (script.js:1092-1096)

---

## Rendering & Visual Effects

### Background Effects (script.js:794-830)
1. **Solid Black Base**: #0a0a0a
2. **Logo Pattern**: Repeating Lostdog logo at 15% opacity (100px tiles)
3. **Scanlines**: Horizontal lines every 4 pixels (gritty CRT effect)
4. **Vignette**: Radial gradient darkening edges

### Player Animation (script.js:848-938)
- **Frames**: 8 sprite frames (run0.png → run7.png)
- **Animation Speed**: 5 game frames per sprite frame
- **Git Power Speed**: 3x faster animation when powered up
- **Effects**: Rainbow trail + pulsing glow during git power

### Ground Rendering (script.js:832-846)
- Dark gray asphalt (#1a1a1a)
- Yellow dashed center line (30px dash, 20px gap)
- Positioned at y=510 (script.js:67)

### UI Elements (script.js:1080-1150)
- **Distance Counter**: Top-left (green text with black shadow)
- **Score**: Below distance
- **Difficulty Level**: Color-coded (green→yellow→pink)
- **Health Bar**: Heart icons, top-right
- **Git Power Timer**: Center screen, animated background

### Sprite Loading System (script.js:209-313)
- **Lazy Loading**: All sprites load asynchronously
- **Fallbacks**: Colored rectangles if sprites fail to load
- **Console Logging**: Tracks load success/failure
- **Random Music**: Selects 1 of 10 tracks on game start

---

## Game States & Flow

### State Machine (script.js:192)
```javascript
gameState = 'start' | 'playing' | 'gameOver'
```

### State Transitions:
1. **start** → Press Space → **playing** (script.js:1281-1296)
2. **playing** → Health = 0 → **gameOver** (script.js:1298-1304)
3. **gameOver** → Press Space → **playing** (restart)

### Game Loop (script.js:1338-1359)
```javascript
function gameLoop() {
    if (gameState === 'playing') {
        updateGame();  // Physics, collisions, spawning
    }

    switch (gameState) {
        case 'start': drawStartScreen(); break;
        case 'playing': drawGame(); break;
        case 'gameOver': drawGameOverScreen(); break;
    }

    requestAnimationFrame(gameLoop);
}
```

### Update Cycle (script.js:1306-1333)
1. Increment frame counter
2. Update distance (faster with git power)
3. Increase scroll speed (0.0005 per frame, max 10)
4. Update player physics
5. Update obstacles (movement + spawning)
6. Update power-ups (movement + spawning)
7. Check collisions
8. Handle death condition

---

## Input Handling

### Supported Inputs (script.js:1364-1402)
1. **Keyboard**: Space bar (keydown/keyup)
2. **Mouse**: Click on canvas
3. **Touch**: touchstart/touchend on canvas

### Jump Mechanics:
- **Press**: Initiate jump (if grounded/on platform)
- **Release**: Cut jump short (variable height)
- **Hold**: Full jump height

### Input State Tracking:
- `jumpKeyHeld` flag prevents multi-jump exploits (script.js:194)
- No jump buffering (must be on surface to jump)

---

## Mobile Optimization

### Responsive Design (style.css:33-68)

#### Breakpoints:
- **Max-width 1250px**: Full-width canvas
- **Max-height 650px**: Full-height canvas
- **Max-width 900px**: Mobile-specific rules

#### Landscape Mode (style.css:51-56)
- Forces full-height rendering
- Optimal for gameplay

#### Portrait Mode (style.css:59-118)
- Shows rotate message overlay
- Hides game canvas
- Animated rotation icon
- Encourages landscape play

### Mobile Meta Tags (index.html:4-10)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="screen-orientation" content="landscape">
```

### Touch Optimization
- `touch-action: none` prevents scroll/zoom (style.css:26)
- Touch event preventDefault (script.js:1394-1402)
- Immediate response (no 300ms tap delay)

---

## Development Workflows

### Making Changes

#### Difficulty Tuning
**Location**: script.js:116-135 (CONFIG.obstacles)

To make the game **easier**:
- Increase `spawnDistance` (more space between obstacles)
- Decrease `difficultySpacing` (slower difficulty ramp)
- Increase `tripleStackMinDifficulty` (delays hard patterns)

To make the game **harder**:
- Decrease `spawnDistance`
- Increase `difficultySpacing`
- Decrease `tripleStackMinDifficulty`

#### Jump Feel Adjustment
**Location**: script.js:52-63 (CONFIG.player)

- **Higher jumps**: Decrease `jumpForce` (more negative)
- **Floatier feel**: Decrease `gravity`
- **More control**: Decrease `jumpCutMultiplier`
- **Faster falling**: Increase `gravity` or `maxFallSpeed`

#### Adding New Obstacle Types

1. **Define in CONFIG** (script.js:72-114):
```javascript
obstacles: {
    newType: {
        width: 50,
        height: 70,
        hitboxWidth: 30,
        hitboxOffset: 10,
        color: '#ff00ff',
        isPlatform: true/false,
        isDestructible: true/false
    }
}
```

2. **Add to spawn weights** (script.js:446-455):
```javascript
let types = ['fireCan', 'cop', 'obstacle', 'newType'];
let weights = [20, 30, 40, 10];  // Total = 100
```

3. **Add rendering logic** (script.js:940-1029):
```javascript
else if (obstacle.type === 'newType') {
    // Draw sprite or fallback rectangle
}
```

#### Adding New Power-ups

1. **Define in CONFIG.powerups** (script.js:138-154)
2. **Update spawnPowerup logic** (script.js:361-378)
3. **Add collision effect** (script.js:708-727)
4. **Add sprite loading** (script.js:267-288)
5. **Update rendering** (script.js:1035-1078)

### Asset Management

#### Adding Sprites
**Requirements**:
- PNG format recommended (supports transparency)
- GIF format for animations
- Place in `/assets/` directory
- Update sprite paths in script.js (lines 218-288)

#### Adding Music
**Format**: MP3
**Location**: `/songs/` directory
**Update**: CONFIG.audio.musicFiles array (script.js:166-177)

**Important**: Random song selection happens on game start (script.js:299-313)

### Testing Checklist

When making changes, test:
- [ ] Desktop: Chrome, Firefox, Safari
- [ ] Mobile: iOS Safari, Chrome Android
- [ ] Portrait orientation warning appears
- [ ] Touch controls responsive
- [ ] Sprites load correctly (check console)
- [ ] Music plays (check console for errors)
- [ ] Hitboxes feel fair (not too punishing)
- [ ] Difficulty progression feels smooth
- [ ] Power-ups spawn at reasonable rates
- [ ] Game performance smooth (60fps target)

---

## Code Conventions & Patterns

### Naming Conventions
- **Variables**: camelCase (e.g., `scrollSpeed`, `lastObstacleX`)
- **Constants**: UPPER_SNAKE_CASE in CONFIG object
- **Functions**: camelCase verbs (e.g., `updatePlayer`, `drawObstacles`)
- **Game Objects**: Lowercase properties (e.g., `player.health`, `obstacle.type`)

### Code Organization
- **Section Headers**: Clear ASCII comment blocks
```javascript
// ============================================
// SECTION NAME
// ============================================
```
- **Related Functions Grouped**: Physics together, rendering together, etc.
- **Helper Functions First**: getPlayerHitbox before checkCollision

### Comment Style
- **Inline Comments**: Explain "why" not "what"
- **Section Comments**: Describe purpose of code blocks
- **CONFIG Comments**: Document units and effects

Examples:
```javascript
// Good: Explains reasoning
player.velocityY *= CONFIG.player.jumpCutMultiplier; // Cut jump short

// Bad: States the obvious
player.velocityY *= CONFIG.player.jumpCutMultiplier; // Multiply velocityY
```

### Design Patterns

#### Configuration-Driven Design
All magic numbers live in CONFIG object. Never hardcode values in logic.

**Bad**:
```javascript
if (player.y >= 450) {  // What is 450?
```

**Good**:
```javascript
if (player.y >= CONFIG.player.groundY) {  // Clear intent
```

#### Separation of Visual and Collision
Always separate visual size from hitbox size for forgiving gameplay.

#### Fallback Rendering
All sprites have colored rectangle fallbacks for load failures.

#### State Machine Pattern
Single `gameState` variable controls rendering and update logic.

---

## Recent Changes & Git History

### Latest Commits (0d37717 - 1a50cbb)

#### Variable Jump Height (052daf4)
- Added `jumpCutMultiplier` to CONFIG
- Implemented jump release detection
- `jumpKeyHeld` flag tracking

#### Landscape Orientation (768dbaf)
- Mobile meta tags for forced landscape
- Rotate message for portrait mode
- CSS media queries for orientation

#### Spacing/Difficulty Controls (5e81c55)
- Centralized spacing in CONFIG
- `spawnDistance`, `maxSpawnDistance` tunables
- `difficultySpacing` and `difficultyMaxSpacing`
- Triple-stack controls

#### Jump Buffering Removal (1a50cbb)
- Removed jump queuing system
- Only allow jumps on ground/platforms
- More precise platforming control

### Development Philosophy

Based on git history, the project values:
1. **Tight Controls**: Removed jump buffering for precision
2. **Mobile-First**: Landscape orientation, touch optimization
3. **Tunability**: CONFIG-driven design for easy balancing
4. **Forgiving Hitboxes**: Visual ≠ collision for player-friendly feel
5. **Progressive Difficulty**: Smooth scaling, not sudden spikes

---

## Common Tasks for AI Assistants

### 1. Balancing Difficulty
**When asked to make the game easier/harder:**
- Modify CONFIG.obstacles spacing values (script.js:116-135)
- Adjust CONFIG.player jump physics (script.js:52-63)
- Test by checking distance reached in playthroughs
- Document changes in git commit message

### 2. Adding Visual Effects
**When asked to enhance graphics:**
- Check if sprite exists in `/assets/` first
- Add sprite loading in script.js:209-313
- Create fallback rectangle rendering
- Test on both desktop and mobile
- Verify performance (check FPS)

### 3. Fixing Collision Bugs
**When collision feels wrong:**
- Check hitbox dimensions in CONFIG (script.js:72-114)
- Verify getPlayerHitbox and getObstacleHitbox (script.js:618-635)
- Test landing vs side collision logic (script.js:650-684)
- Ensure invulnerability frames working (script.js:691-696)

### 4. Mobile Issues
**When mobile controls don't work:**
- Check touch event preventDefault (script.js:1394-1402)
- Verify touch-action: none in CSS (style.css:26)
- Test orientation detection (style.css:110-118)
- Check viewport meta tags (index.html:5-10)

### 5. Performance Optimization
**When game lags:**
- Check sprite load errors (console logs)
- Verify requestAnimationFrame usage (script.js:1358)
- Look for expensive operations in game loop
- Test on target devices (mobile more constrained)

### 6. Audio Problems
**When music doesn't play:**
- Check browser autoplay policies (requires user interaction)
- Verify MP3 files in `/songs/` directory
- Check CONFIG.audio.musicFiles paths (script.js:166-177)
- Test volume levels (script.js:178)
- Look for console errors in music loading (script.js:293-310)

---

## Architecture Decisions & Rationale

### Why Vanilla JavaScript?
- **Zero Dependencies**: No build step, instant development
- **Performance**: Direct Canvas API access
- **Simplicity**: Easy to understand, modify, and debug
- **Portability**: Runs anywhere with a browser

### Why CONFIG Object?
- **Game Designer Friendly**: Non-programmers can tune gameplay
- **Centralized Control**: One place for all parameters
- **Documentation**: Self-documenting through property names
- **Version Control**: Easy to see balance changes in git diffs

### Why Separate Hitboxes?
- **Player Experience**: Forgiving collision = fun gameplay
- **Visual Freedom**: Art can be expressive without punishing players
- **Industry Standard**: Common in platformers and action games

### Why No Frameworks?
- **Learning**: Great example of pure JavaScript game dev
- **Performance**: No framework overhead
- **Control**: Full understanding of every line
- **Maintenance**: No dependency updates needed

---

## Debugging Guide

### Common Issues

#### "Sprites Not Loading"
**Symptom**: Colored rectangles instead of graphics
**Check**:
1. File paths in script.js:218-288
2. Actual files in `/assets/` directory
3. Browser console for 404 errors
4. Case sensitivity in filenames

#### "Can't Jump"
**Symptom**: Space bar doesn't work
**Check**:
1. `player.isOnGround` or `player.isOnPlatform` is true
2. No jump buffering (script.js:593-603)
3. Game state is 'playing'
4. Event listeners attached (script.js:1375-1387)

#### "Collision Detection Wrong"
**Symptom**: Hits when shouldn't, or vice versa
**Check**:
1. Hitbox dimensions in CONFIG
2. getPlayerHitbox and getObstacleHitbox return correct values
3. Invulnerability frames active (check `player.invulnerable`)
4. Git power active (destroys all obstacles)

#### "Game Runs Slow"
**Symptom**: Low FPS, stuttering
**Check**:
1. Too many obstacles on screen? (check spawn logic)
2. Heavy operations in game loop?
3. Browser developer tools Performance tab
4. Mobile device capabilities

#### "Music Won't Play"
**Symptom**: No audio
**Check**:
1. Browser autoplay policy (needs user interaction first)
2. Volume not muted (CONFIG.audio.volume)
3. MP3 files exist in `/songs/`
4. Console errors (script.js:294)

### Debugging Tools

#### Console Logging
Key events already logged:
- Sprite loading (script.js:222, 237, 249, etc.)
- Power-up spawning (script.js:373, 376)
- Power-up activation (script.js:716, 722)
- Triple-stack spawning (script.js:438)

#### Browser DevTools
- **Elements**: Inspect canvas sizing
- **Console**: Check for errors and logs
- **Network**: Verify asset loading
- **Performance**: Profile frame rates

#### Visual Debugging
To debug hitboxes, add to drawGame():
```javascript
// Draw hitboxes (add after drawPlayer)
ctx.strokeStyle = '#ff0000';
const playerHitbox = getPlayerHitbox();
ctx.strokeRect(playerHitbox.x, playerHitbox.y, playerHitbox.width, playerHitbox.height);

obstacles.forEach(obstacle => {
    const hitbox = getObstacleHitbox(obstacle);
    ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
});
```

---

## Performance Considerations

### Target Performance
- **Frame Rate**: 60 FPS (requestAnimationFrame)
- **Resolution**: 1200×600 canvas
- **Mobile**: Should run smoothly on devices from 2019+

### Optimization Strategies Used

#### Asset Loading
- Asynchronous image loading (script.js:216-288)
- Fallback rendering prevents blocking
- Single audio instance (script.js:296-313)

#### Rendering
- Canvas API (hardware accelerated)
- Single draw call per sprite
- No DOM manipulation during gameplay

#### Game Logic
- Fixed timestep (60 FPS target)
- Efficient AABB collision (O(n) where n = obstacles)
- Culling: Off-screen obstacles removed (script.js:522)

#### Memory Management
- Obstacles array filtered, not reallocated (script.js:522)
- Sprite reuse (loaded once, drawn many times)
- No garbage creation in game loop

### Potential Bottlenecks
1. **Too Many Obstacles**: Spawning too fast → increase spacing
2. **Large Sprite Sheets**: Keep sprites small (<200KB each)
3. **Audio Files**: Large MP3s (>10MB) may impact loading
4. **Mobile Rendering**: Test on mid-range devices

---

## Extending the Game

### Ideas for Future Development

#### New Features
- **Combo System**: Bonus points for consecutive cop stomps
- **Leaderboard**: Local storage high scores
- **Multiple Characters**: Unlock different punks
- **More Power-ups**: Shield, magnet (attract coins), slow-mo
- **Obstacles**: Dogs, barriers, potholes
- **Environments**: Change background/obstacles by distance

#### Technical Improvements
- **WebGL Renderer**: For advanced effects
- **Service Worker**: Offline play support
- **WebAudio API**: Better sound control, SFX
- **Sprite Atlases**: Reduce HTTP requests
- **Touch Joystick**: Alternative mobile controls

#### Content Additions
- **More Music**: Expandable songs folder
- **Sprite Variants**: Different cop designs
- **Seasonal Themes**: Holiday decorations
- **Story Mode**: Level progression with goals

### Modding Support
The CONFIG object makes modding easy:
1. Fork the repo
2. Modify CONFIG values
3. Add assets to `/assets/` and `/songs/`
4. Update sprite paths
5. Test and deploy

---

## Git Workflow

### Branch Strategy
- **main**: Stable, production-ready code
- **claude/***: Feature branches created by AI assistants
- **Development**: Make changes on feature branch, PR to main

### Commit Message Format
Based on history, use clear, descriptive commits:
- ✅ "Add variable jump height control"
- ✅ "Fix hitboxes, jump delay, and power-up sizes"
- ✅ "Remove jump buffering - only allow jumps on ground/platforms"
- ❌ "Update script.js"
- ❌ "Fix bug"

### Before Committing
1. Test on desktop and mobile
2. Check console for errors
3. Verify sprites load
4. Playtest for 2-3 minutes
5. Write descriptive commit message

---

## Key Files Line Reference

### Quick Navigation

**Configuration**:
- Canvas size: script.js:6-9
- Colors: script.js:12-35
- Player physics: script.js:52-63
- Obstacles: script.js:72-135
- Power-ups: script.js:138-154

**Core Systems**:
- Game loop: script.js:1338-1359
- Update cycle: script.js:1306-1333
- Player physics: script.js:554-612
- Collision detection: script.js:616-789
- Obstacle spawning: script.js:401-550

**Rendering**:
- Background: script.js:794-830
- Ground: script.js:832-846
- Player: script.js:848-938
- Obstacles: script.js:940-1033
- UI: script.js:1080-1150

**Input**:
- Keyboard: script.js:1375-1387
- Touch/Click: script.js:1390-1402

**Mobile**:
- HTML meta tags: index.html:4-10
- Rotate message: index.html:17-21
- CSS media queries: style.css:33-118

---

## Summary for AI Assistants

When working on this codebase:

1. **Always modify CONFIG first** before touching game logic
2. **Test on mobile** - landscape orientation is critical
3. **Maintain hitbox separation** - keep gameplay forgiving
4. **Use console logs** for debugging new features
5. **Follow naming conventions** - camelCase for variables/functions
6. **Add fallbacks** for any new sprites
7. **Update this file** when making architectural changes
8. **Check git history** to understand recent patterns
9. **Preserve the punk aesthetic** - neon colors, gritty effects
10. **Keep it performant** - vanilla JS, no framework bloat

### Quick Config Access Pattern
```javascript
// To change jump height
CONFIG.player.jumpForce = -18;  // Higher jump

// To make game easier
CONFIG.obstacles.spawnDistance = 300;  // More space

// To add color
CONFIG.colors.newElement = '#ff00ff';  // Use in rendering
```

### Common Tasks Time Estimates
- Add new obstacle type: 30-45 minutes
- Add new power-up: 45-60 minutes
- Tweak difficulty: 5-10 minutes
- Add new sprite: 15-20 minutes
- Fix collision bug: 20-40 minutes
- Mobile optimization: 30-60 minutes

---

## Contact & Resources

### Repository
- **GitHub**: Decodedal/Get-to-the-gig
- **Live Demo**: Check CNAME file for deployment URL

### Documentation
- This file (CLAUDE.md) for AI assistant reference
- README.md for user-facing information
- Code comments for implementation details

### Technologies
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [HTML5 Audio](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio)
- [Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)

---

**Last Updated**: 2025-11-14
**Version**: Based on commit 0d37717
**Maintained By**: AI Assistants working with Decodedal
