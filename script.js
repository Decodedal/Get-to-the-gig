       // ============================================
        // CONFIGURATION OBJECT - All Visual Constants
        // ============================================
        const CONFIG = {
            // Canvas
            canvas: {
                width: 1200,
                height: 600
            },

            // Colors - Punk Aesthetic
            colors: {
                background: {
                    base: '#0a0a0a',        // Deep black
                    overlay: '#1a1a1a'      // Slightly lighter for pattern
                },
                ground: '#000000ff',          // Hot pink
                player: '#00ff41',          // Neon green
                playerOutline: '#000000',   // Black outline
                obstacles: {
                    cop: '#ffff00',         // Bright yellow
                    copOutline: '#000000',
                    fascist: '#ff006e',     // Hot pink
                    fascistOutline: '#000000'
                },
                ui: {
                    text: '#00ff41',        // Neon green
                    shadow: '#000000',
                    accent: '#ff006e'       // Hot pink accent
                },
                effects: {
                    scanline: 'rgba(0, 0, 0, 0.1)',
                    vignette: 'rgba(0, 0, 0, 0.7)'
                }
            },

            // Visual Effects
            effects: {
                scanlines: true,
                scanlineSpacing: 4,
                logoPattern: true,
                logoOpacity: 0.15,
                logoSize: 100  // Size of each logo tile
            },

            // Assets
            assets: {
                logoPath: '/Lostdog-logo-white.jpg' // User will replace this
            },

            // Player
            player: {
                width: 60, // Visual width
                height: 80,
                hitboxWidth: 30, // Narrower hitbox for collision
                hitboxOffset: 15, // Center the hitbox
                x: 150, // Fixed x position (centered-ish)
                groundY: 450, // Y position when on ground
                jumpForce: -15,
                gravity: 0.65,
                maxFallSpeed: 18,
                jumpCutMultiplier: 0.25 // Multiply upward velocity by this when jump key released early
            },

            // Ground
            ground: {
                y: 510,
                height: 90
            },

            // Obstacles
            obstacles: {
                fireCan: {
                    // Burning trash can - instant death
                    width: 40, // Visual width
                    height: 60,
                    hitboxWidth: 22, // Narrower hitbox
                    hitboxOffset: 9, // Center the hitbox
                    color: '#ff6600', // Orange/red
                    outline: '#000000',
                    outlineWidth: 2,
                    isPlatform: false, // Always dangerous
                    isDestructible: false
                },
                cop: {
                    // Cop sprites - can jump on to destroy, or take damage
                    width: 60, // Visual width
                    height: 80,
                    hitboxWidth: 30, // Narrower hitbox
                    hitboxOffset: 15, // Center the hitbox
                    hitboxHeight: 70, // Slightly shorter hitbox from top
                    hitboxTopOffset: 10, // Start hitbox lower from top
                    color: '#00ff41', // Neon green (cop uniform) - fallback
                    outline: '#000000',
                    outlineWidth: 3,
                    isPlatform: true, // Can land on top to destroy
                    isDestructible: true,
                    damageOnSide: true,
                    pointValue: 10
                },
                obstacle: {
                    // Yellow squares - trash cans, barriers, etc.
                    width: 45, // Visual width
                    height: 60,
                    hitboxWidth: 25, // Narrower hitbox
                    hitboxOffset: 10, // Center the hitbox
                    hitboxHeight: 50, // Slightly shorter hitbox from top
                    hitboxTopOffset: 10, // Start hitbox lower from top
                    color: '#ffff00', // Yellow
                    outline: '#000000',
                    outlineWidth: 3,
                    isPlatform: true, // Can land on
                    isDestructible: false
                },

                // ===== SPACING TWEAKS - Adjust these to change difficulty! =====
                spawnDistance: 250,        // Minimum gap between obstacle groups (lower = harder)
                maxSpawnDistance: 400,     // Maximum gap for variety (higher = easier)
                minDistanceFloor: 150,     // Minimum distance won't go below this (safety floor)

                tripleStackDistance: 180,  // Distance from single platform to triple-stack (lower = harder to clear)
                stackHeight: 90,           // Vertical pixels between stacked obstacles (affects jump arc needed)

                // Difficulty scaling (how fast obstacles get closer together as game progresses)
                difficultySpacing: 10,     // How much to reduce minDistance per difficulty level (higher = gets harder faster)
                difficultyMaxSpacing: 15,  // How much to reduce maxDistance per difficulty level

                // Triple-stack spawning
                tripleStackMinDifficulty: 2,    // Difficulty level needed before triple-stacks appear
                tripleStackMinDistance: 200,    // Minimum distance since last triple-stack before spawning another
                tripleStackChance: 0.15,        // 15% chance to spawn when eligible

                initialSpeed: 4,
                speedIncrease: 0.0005 // Speed increase per frame
            },

            // Power-ups
            powerups: {
                weed: {
                    // Health replenishment
                    width: 60,
                    height: 60,
                    healthRestore: 1,
                    spawnChance: 0.015 // 1.5% chance per frame when eligible
                },
                git: {
                    // Invincibility + speed boost
                    width: 60,
                    height: 60,
                    duration: 240, // 4 seconds at 60fps (3-5 seconds range)
                    speedMultiplier: 3,
                    spawnChance: 0.008 // 0.8% chance per frame when eligible
                }
            },

            // Game
            game: {
                scrollSpeed: 4,
                maxScrollSpeed: 10,
                distanceMultiplier: 0.1 // For converting frames to distance
            },

            // Audio
            audio: {
                musicFolder: 'songs/', // Folder containing music files
                musicFiles: [
                    '2Bros.mp3',
                    'Calico.mp3',
                    'Coagulate.mp3',
                    'Deteriorate.mp3',
                    'English.mp3',
                    'French.mp3',
                    'Piss-Phantom-II.mp3',
                    'RadioactiveBabies.mp3',
                    'too-long.mp3',
                    'War.mp3'
                ],
                volume: 0.5
            }
        };

        // ============================================
        // GAME SETUP
        // ============================================
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = CONFIG.canvas.width;
        canvas.height = CONFIG.canvas.height;

        // Game state
        let gameState = 'start'; // 'start', 'playing', 'gameOver'
        let animationId = null;
        let jumpKeyHeld = false; // Track if jump key/touch is being held

        // Logo image for background pattern
        const logoImage = new Image();
        logoImage.src = CONFIG.assets.logoPath;
        let logoLoaded = false;
        logoImage.onload = () => {
            logoLoaded = true;
        };
        logoImage.onerror = () => {
            console.log('Logo image not found - will use solid background');
        };

        // ============================================
        // SPRITE LOADING
        // ============================================

        // Player animation sprites
        const punkRunFrames = [];
        let punkFramesLoaded = 0;
        const totalPunkFrames = 8;

        for (let i = 0; i < totalPunkFrames; i++) {
            const img = new Image();
            img.src = `assets/Punk_Run/run${i}.png`;
            img.onload = () => {
                punkFramesLoaded++;
                if (punkFramesLoaded === totalPunkFrames) {
                    console.log('Player sprites loaded');
                }
            };
            img.onerror = () => {
                console.log(`Failed to load run${i}.png`);
            };
            punkRunFrames.push(img);
        }

        // Cop sprite sheet
        const copSprite = new Image();
        copSprite.src = 'assets/policeman_walk_gif (256×256).gif';
        let copSpriteLoaded = false;
        copSprite.onload = () => {
            copSpriteLoaded = true;
            console.log('Cop sprite loaded');
        };
        copSprite.onerror = () => {
            console.log('Failed to load cop sprite');
        };

        // Trash can sprite
        const trashCanSprite = new Image();
        trashCanSprite.src = 'assets/trash.png';
        let trashCanLoaded = false;
        trashCanSprite.onload = () => {
            trashCanLoaded = true;
            console.log('Trash can sprite loaded');
        };
        trashCanSprite.onerror = () => {
            console.log('Failed to load trash can sprite');
        };

        // Fire gif for burning trash cans
        const fireGif = new Image();
        fireGif.src = 'assets/fire.gif'; // User will add this
        let fireGifLoaded = false;
        fireGif.onload = () => {
            fireGifLoaded = true;
            console.log('Fire gif loaded');
        };
        fireGif.onerror = () => {
            console.log('Fire gif not found - will use trash cans without fire');
        };

        // Power-up sprites
        const weedSprite = new Image();
        weedSprite.src = 'assets/weed.png';
        let weedSpriteLoaded = false;
        weedSprite.onload = () => {
            weedSpriteLoaded = true;
            console.log('Weed power-up sprite loaded');
        };
        weedSprite.onerror = () => {
            console.log('Failed to load weed sprite');
        };

        const gitSprite = new Image();
        gitSprite.src = 'assets/git.png';
        let gitSpriteLoaded = false;
        gitSprite.onload = () => {
            gitSpriteLoaded = true;
            console.log('Git power-up sprite loaded');
        };
        gitSprite.onerror = () => {
            console.log('Failed to load git sprite');
        };

        // Animation state
        let animationFrame = 0;
        let animationCounter = 0;
        const animationSpeed = 5; // Change frame every 5 game frames

        // Audio - select random song
        let backgroundMusic = null;
        let currentSongIndex = -1;

        function loadRandomSong() {
            // Select a random song
            const randomIndex = Math.floor(Math.random() * CONFIG.audio.musicFiles.length);
            currentSongIndex = randomIndex;
            const songPath = CONFIG.audio.musicFolder + CONFIG.audio.musicFiles[randomIndex];

            backgroundMusic = new Audio(songPath);
            backgroundMusic.loop = true;
            backgroundMusic.volume = CONFIG.audio.volume;

            console.log('Loading song:', CONFIG.audio.musicFiles[randomIndex]);
        }

        // Load initial song
        loadRandomSong();

        // Player object
        const player = {
            x: CONFIG.player.x,
            y: CONFIG.player.groundY,
            width: CONFIG.player.width,
            height: CONFIG.player.height,
            velocityY: 0,
            isJumping: false,
            isOnGround: true,
            isOnPlatform: false,
            currentPlatform: null,
            health: 3, // Player health
            maxHealth: 3,
            invulnerable: false, // Brief invulnerability after taking damage
            invulnerableTime: 0,
            gitPowerActive: false, // Git power-up (invincibility + speed)
            gitPowerTime: 0
        };

        // Game data
        let obstacles = [];
        let powerups = []; // Active power-ups
        let scrollSpeed = CONFIG.game.scrollSpeed;
        let distance = 0;
        let frameCount = 0;
        let lastObstacleX = CONFIG.canvas.width;
        let score = 0; // Points from destroying cops
        let lastTripleStackDistance = -500; // Track when we last spawned a triple stack

        // ============================================
        // POWER-UP MANAGEMENT
        // ============================================
        function createPowerup(type) {
            const powerupConfig = CONFIG.powerups[type];
            // Spawn power-ups at a random height (floating in air)
            const yPosition = CONFIG.ground.y - 100 - Math.random() * 150; // Between 100-250 pixels above ground

            return {
                type: type,
                x: CONFIG.canvas.width,
                y: yPosition,
                width: powerupConfig.width,
                height: powerupConfig.height
            };
        }

        function spawnPowerup() {
            // Don't spawn if there are already power-ups on screen
            if (powerups.length > 0) return;

            // Only spawn if player is below max health (for weed) or randomly (for git)
            const weedChance = player.health < player.maxHealth ? CONFIG.powerups.weed.spawnChance : 0;
            const gitChance = CONFIG.powerups.git.spawnChance;

            const random = Math.random();

            if (random < weedChance) {
                powerups.push(createPowerup('weed'));
                console.log('Spawned weed power-up');
            } else if (random < weedChance + gitChance) {
                powerups.push(createPowerup('git'));
                console.log('Spawned git power-up');
            }
        }

        function updatePowerups() {
            // Get current scroll speed (accounting for git power-up)
            const currentScrollSpeed = player.gitPowerActive
                ? scrollSpeed * CONFIG.powerups.git.speedMultiplier
                : scrollSpeed;

            // Move power-ups left
            powerups.forEach(powerup => {
                powerup.x -= currentScrollSpeed;
            });

            // Remove off-screen power-ups
            powerups = powerups.filter(powerup => powerup.x + powerup.width > 0);

            // Try to spawn new power-ups
            if (frameCount % 20 === 0) { // Check every 20 frames
                spawnPowerup();
            }
        }

        // ============================================
        // OBSTACLE MANAGEMENT
        // ============================================
        function createObstacle(type, heightLevel = 0, xOffset = 0, isBurning = false) {
            const obstacleConfig = CONFIG.obstacles[type];
            // Height levels: 0 = ground, 1 = medium, 2 = high
            // Use CONFIG.obstacles.stackHeight so you can tweak vertical spacing!
            const yOffset = heightLevel * CONFIG.obstacles.stackHeight;

            return {
                type: type,
                x: CONFIG.canvas.width + xOffset,
                y: CONFIG.ground.y - obstacleConfig.height - yOffset,
                width: obstacleConfig.width,
                height: obstacleConfig.height,
                hitboxWidth: obstacleConfig.hitboxWidth || obstacleConfig.width,
                hitboxOffset: obstacleConfig.hitboxOffset || 0,
                hitboxHeight: obstacleConfig.hitboxHeight || obstacleConfig.height,
                hitboxTopOffset: obstacleConfig.hitboxTopOffset || 0,
                color: obstacleConfig.color,
                isPlatform: obstacleConfig.isPlatform,
                heightLevel: heightLevel,
                isBurning: isBurning // Burning trash cans do damage
            };
        }

        function spawnTripleStackSequence() {
            // Spawn a single yellow platform
            obstacles.push(createObstacle('obstacle', 0, 0));

            // Spawn triple-stack yellows further ahead (player must jump from the single to clear these)
            // Use CONFIG value so you can easily tweak this!
            const tripleStackX = CONFIG.obstacles.tripleStackDistance;
            obstacles.push(createObstacle('obstacle', 0, tripleStackX));
            obstacles.push(createObstacle('obstacle', 1, tripleStackX));
            obstacles.push(createObstacle('obstacle', 2, tripleStackX));

            lastTripleStackDistance = distance;
            console.log('Spawned triple-stack sequence at distance:', distance);
        }

        function spawnObstacle() {
            // Difficulty increases over time
            const difficultyLevel = Math.floor(distance / 50); // Increases every 50m

            // Calculate spawn probabilities based on difficulty
            let types = ['fireCan', 'cop', 'obstacle'];
            let weights = [20, 30, 50]; // Start with more obstacles, fewer fire cans

            // As difficulty increases, add more fire cans and cops
            if (difficultyLevel > 2) {
                weights = [25, 35, 40]; // More enemies
            }
            if (difficultyLevel > 5) {
                weights = [35, 40, 25]; // Much more dangerous
            }

            // Weighted random selection
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            let random = Math.random() * totalWeight;
            let randomType = types[0];

            for (let i = 0; i < types.length; i++) {
                if (random < weights[i]) {
                    randomType = types[i];
                    break;
                }
                random -= weights[i];
            }

            // Create base obstacle at ground level
            obstacles.push(createObstacle(randomType, 0, 0));

            // STACKING LOGIC: Objects on bottom, people on top
            // Fire cans never stack - they're instant death obstacles

            if (randomType === 'obstacle' && difficultyLevel > 1) {
                // Yellow obstacle (trash can, etc.) - can have stacks
                const stackChance = Math.random();

                // 40% chance for something stacked on top
                if (stackChance < 0.4) {
                    // 50/50 chance: another trash can or a cop
                    if (Math.random() < 0.5) {
                        obstacles.push(createObstacle('obstacle', 1)); // Trash can on trash can

                        // 20% chance for a third level
                        if (Math.random() < 0.2 && difficultyLevel > 3) {
                            obstacles.push(createObstacle('obstacle', 2));
                        }
                    } else {
                        obstacles.push(createObstacle('cop', 1)); // Cop on trash can

                        // 10% chance for another cop stacked even higher
                        if (Math.random() < 0.1 && difficultyLevel > 3) {
                            obstacles.push(createObstacle('cop', 2));
                        }
                    }
                }
            } else if (randomType === 'cop' && difficultyLevel > 2) {
                // Cop on ground - can have another cop on top (piggyback)
                const stackChance = Math.random();

                // 20% chance for stacked cops
                if (stackChance < 0.2) {
                    obstacles.push(createObstacle('cop', 1));
                }
            }
        }

        function updateObstacles() {
            // Get current scroll speed (accounting for git power-up)
            const currentScrollSpeed = player.gitPowerActive
                ? scrollSpeed * CONFIG.powerups.git.speedMultiplier
                : scrollSpeed;

            // Move obstacles left
            obstacles.forEach(obstacle => {
                obstacle.x -= currentScrollSpeed;
            });

            // Remove off-screen obstacles
            obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

            // Spawn new obstacles with dynamic spacing
            const rightmostObstacle = obstacles.length > 0
                ? Math.max(...obstacles.map(o => o.x))
                : 0;

            // Variable spawn distance based on difficulty
            // Use CONFIG values so you can easily tweak difficulty progression!
            const difficultyLevel = Math.floor(distance / 50);
            const minDistance = Math.max(CONFIG.obstacles.minDistanceFloor, CONFIG.obstacles.spawnDistance - (difficultyLevel * CONFIG.obstacles.difficultySpacing));
            const maxDistance = Math.max(minDistance + 50, CONFIG.obstacles.maxSpawnDistance - (difficultyLevel * CONFIG.obstacles.difficultyMaxSpacing));
            const spawnDistance = minDistance + Math.random() * (maxDistance - minDistance);

            if (rightmostObstacle < CONFIG.canvas.width - spawnDistance) {
                // Check if we should spawn a triple-stack sequence
                // All values from CONFIG so you can tweak them!
                const distanceSinceLastTriple = distance - lastTripleStackDistance;
                const shouldSpawnTriple = difficultyLevel > CONFIG.obstacles.tripleStackMinDifficulty &&
                                         distanceSinceLastTriple > CONFIG.obstacles.tripleStackMinDistance &&
                                         Math.random() < CONFIG.obstacles.tripleStackChance;

                if (shouldSpawnTriple) {
                    spawnTripleStackSequence();
                } else {
                    spawnObstacle();
                }
            }
        }

        // ============================================
        // PLAYER PHYSICS
        // ============================================
        function updatePlayer() {
            // Apply gravity if not on ground or platform
            if (!player.isOnGround && !player.isOnPlatform) {
                player.velocityY += CONFIG.player.gravity;

                // Cap fall speed
                if (player.velocityY > CONFIG.player.maxFallSpeed) {
                    player.velocityY = CONFIG.player.maxFallSpeed;
                }
            }

            // If on platform, check if still above it
            if (player.isOnPlatform && player.currentPlatform) {
                const platform = player.currentPlatform;
                // Check if player moved off the platform horizontally
                if (player.x + player.width < platform.x || player.x > platform.x + platform.width) {
                    player.isOnPlatform = false;
                    player.currentPlatform = null;
                    player.velocityY = 0; // Start falling
                }
            }

            // Update position
            player.y += player.velocityY;

            // Ground collision
            if (player.y >= CONFIG.player.groundY) {
                player.y = CONFIG.player.groundY;
                player.velocityY = 0;
                player.isJumping = false;
                player.isOnGround = true;
                player.isOnPlatform = false;
                player.currentPlatform = null;
                jumpKeyHeld = false; // Reset jump key state on landing
            } else {
                player.isOnGround = false;
            }
        }

        function jump() {
            // Only allow jumping when on ground or platform - no air jumps
            if (player.isOnGround || player.isOnPlatform) {
                player.velocityY = CONFIG.player.jumpForce;
                player.isJumping = true;
                player.isOnGround = false;
                player.isOnPlatform = false;
                player.currentPlatform = null;
                jumpKeyHeld = true; // Mark that jump key is being held
            }
        }

        function releaseJump() {
            // Cut the jump short if player is still moving upward
            if (jumpKeyHeld && player.velocityY < 0) {
                player.velocityY *= CONFIG.player.jumpCutMultiplier;
            }
            jumpKeyHeld = false;
        }

        // ============================================
        // COLLISION DETECTION (AABB with platform support)
        // ============================================

        // Helper function to get hitbox for player
        function getPlayerHitbox() {
            return {
                x: player.x + CONFIG.player.hitboxOffset,
                y: player.y,
                width: CONFIG.player.hitboxWidth,
                height: player.height
            };
        }

        // Helper function to get hitbox for obstacle
        function getObstacleHitbox(obstacle) {
            return {
                x: obstacle.x + (obstacle.hitboxOffset || 0),
                y: obstacle.y + (obstacle.hitboxTopOffset || 0),
                width: obstacle.hitboxWidth || obstacle.width,
                height: obstacle.hitboxHeight || obstacle.height
            };
        }

        function checkCollision(rect1, rect2) {
            // If rect1 is player or obstacle, use hitbox
            const hitbox1 = rect1 === player ? getPlayerHitbox() :
                           (rect1.hitboxWidth ? getObstacleHitbox(rect1) : rect1);
            const hitbox2 = rect2 === player ? getPlayerHitbox() :
                           (rect2.hitboxWidth ? getObstacleHitbox(rect2) : rect2);

            return hitbox1.x < hitbox2.x + hitbox2.width &&
                   hitbox1.x + hitbox1.width > hitbox2.x &&
                   hitbox1.y < hitbox2.y + hitbox2.height &&
                   hitbox1.y + hitbox1.height > hitbox2.y;
        }

        function checkPlatformLanding(player, platform) {
            // Use hitboxes for more accurate collision
            const playerHitbox = getPlayerHitbox();
            const platformHitbox = getObstacleHitbox(platform);

            // Check if player is falling onto the platform from above
            const wasAbove = playerHitbox.y + playerHitbox.height - player.velocityY <= platformHitbox.y + 5;
            const isOnTop = playerHitbox.y + playerHitbox.height >= platformHitbox.y &&
                           playerHitbox.y + playerHitbox.height <= platformHitbox.y + platformHitbox.height / 2;
            const horizontalOverlap = playerHitbox.x < platformHitbox.x + platformHitbox.width &&
                                     playerHitbox.x + playerHitbox.width > platformHitbox.x;

            return wasAbove && isOnTop && horizontalOverlap && player.velocityY >= 0;
        }

        function checkSideCollision(player, obstacle) {
            // Use hitboxes for more accurate collision
            const playerHitbox = getPlayerHitbox();
            const obstacleHitbox = getObstacleHitbox(obstacle);

            // Check if player is hitting the sides or bottom of obstacle
            const horizontalOverlap = playerHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
                                     playerHitbox.x + playerHitbox.width > obstacleHitbox.x;
            const verticalOverlap = playerHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
                                   playerHitbox.y + playerHitbox.height > obstacleHitbox.y;

            if (!horizontalOverlap || !verticalOverlap) return false;

            // Determine collision side
            const fromLeft = playerHitbox.x + playerHitbox.width - player.velocityY <= obstacleHitbox.x + 10;
            const fromRight = playerHitbox.x >= obstacleHitbox.x + obstacleHitbox.width - 10;
            const fromBottom = playerHitbox.y <= obstacleHitbox.y + obstacleHitbox.height - 10;

            return fromLeft || fromRight || fromBottom;
        }

        function checkCollisions() {
            player.isOnPlatform = false;
            player.currentPlatform = null;

            // Update invulnerability timer
            if (player.invulnerable) {
                player.invulnerableTime--;
                if (player.invulnerableTime <= 0) {
                    player.invulnerable = false;
                }
            }

            // Update git power-up timer
            if (player.gitPowerActive) {
                player.gitPowerTime--;
                if (player.gitPowerTime <= 0) {
                    player.gitPowerActive = false;
                    console.log('Git power-up expired');
                }
            }

            // Check power-up collisions
            for (let i = powerups.length - 1; i >= 0; i--) {
                const powerup = powerups[i];
                if (checkCollision(player, powerup)) {
                    // Collect the power-up
                    if (powerup.type === 'weed') {
                        // Restore health
                        if (player.health < player.maxHealth) {
                            player.health++;
                            console.log('Health restored! Current health:', player.health);
                        }
                    } else if (powerup.type === 'git') {
                        // Activate git power (invincibility + speed boost)
                        player.gitPowerActive = true;
                        player.gitPowerTime = CONFIG.powerups.git.duration;
                        console.log('Git power activated! Invincible and speedy!');
                    }
                    // Remove the power-up
                    powerups.splice(i, 1);
                }
            }

            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obstacle = obstacles[i];
                const obstacleConfig = CONFIG.obstacles[obstacle.type];

                // If git power is active, destroy all obstacles on contact
                if (player.gitPowerActive && checkCollision(player, obstacle)) {
                    // Destroy obstacle and give points if it's a cop
                    if (obstacleConfig.isDestructible) {
                        score += obstacleConfig.pointValue;
                    }
                    obstacles.splice(i, 1);
                    continue; // Skip further collision checks for this obstacle
                }

                // Fire cans do damage (not instant kill)
                if (obstacle.type === 'fireCan') {
                    if (checkCollision(player, obstacle) && !player.invulnerable) {
                        player.health--;
                        player.invulnerable = true;
                        player.invulnerableTime = 60; // 1 second at 60fps

                        if (player.health <= 0) {
                            return 'death'; // Game over
                        }
                    }
                }
                // Platforms and cops can be landed on
                else if (obstacleConfig.isPlatform) {
                    if (checkPlatformLanding(player, obstacle)) {
                        // Land on platform - use hitbox y position for more accurate landing
                        const obstacleHitbox = getObstacleHitbox(obstacle);
                        player.y = obstacleHitbox.y - player.height;
                        player.velocityY = 0;
                        player.isOnGround = false;
                        player.isOnPlatform = true;
                        player.currentPlatform = obstacle;
                        player.isJumping = false;
                        jumpKeyHeld = false; // Reset jump key state on landing

                        // If it's a destructible cop, destroy it and give points
                        if (obstacleConfig.isDestructible) {
                            score += obstacleConfig.pointValue;
                            obstacles.splice(i, 1); // Remove the cop
                            player.velocityY = CONFIG.player.jumpForce * 0.2; // Minimal bounce
                        }
                    } else if (checkCollision(player, obstacle)) {
                        // Hit from side or bottom
                        if (!player.invulnerable) {
                            // Take damage from any side collision (cops or obstacles)
                            player.health--;
                            player.invulnerable = true;
                            player.invulnerableTime = 60; // 1 second at 60fps

                            if (player.health <= 0) {
                                return 'death'; // Game over
                            }
                        }
                    }
                }
            }
            return false;
        }

        // ============================================
        // RENDERING FUNCTIONS
        // ============================================
        function drawBackground() {
            // Solid black background
            ctx.fillStyle = CONFIG.colors.background.base;
            ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

            // Draw repeating logo pattern if loaded
            if (CONFIG.effects.logoPattern && logoLoaded) {
                ctx.globalAlpha = CONFIG.effects.logoOpacity;
                const logoSize = CONFIG.effects.logoSize;

                for (let x = 0; x < CONFIG.canvas.width; x += logoSize) {
                    for (let y = 0; y < CONFIG.canvas.height; y += logoSize) {
                        ctx.drawImage(logoImage, x, y, logoSize, logoSize);
                    }
                }

                ctx.globalAlpha = 1.0;
            }

            // Scanlines effect for gritty punk aesthetic
            if (CONFIG.effects.scanlines) {
                ctx.fillStyle = CONFIG.colors.effects.scanline;
                for (let i = 0; i < CONFIG.canvas.height; i += CONFIG.effects.scanlineSpacing) {
                    ctx.fillRect(0, i, CONFIG.canvas.width, 2);
                }
            }

            // Subtle vignette effect
            const gradient = ctx.createRadialGradient(
                CONFIG.canvas.width / 2, CONFIG.canvas.height / 2, 0,
                CONFIG.canvas.width / 2, CONFIG.canvas.height / 2, CONFIG.canvas.width / 1.5
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, CONFIG.colors.effects.vignette);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        }

        function drawGround() {
            // Black asphalt
            ctx.fillStyle = '#1a1a1a';  // Dark gray/black for street
            ctx.fillRect(0, CONFIG.ground.y, CONFIG.canvas.width, CONFIG.ground.height);

            // Yellow dashed center line
            ctx.strokeStyle = '#ffff00';  // Yellow
            ctx.lineWidth = 4;
            ctx.setLineDash([30, 20]);  // 30px dash, 20px gap
            ctx.beginPath();
            ctx.moveTo(0, CONFIG.ground.y + 50);  // Adjust vertical position
            ctx.lineTo(CONFIG.canvas.width, CONFIG.ground.y + 40);
            ctx.stroke();
            ctx.setLineDash([]);  // Reset to solid lines
        }

        function drawPlayer() {
            // Update animation frame (faster when git power is active)
            if (gameState === 'playing') {
                const currentAnimSpeed = player.gitPowerActive ? animationSpeed / 3 : animationSpeed;
                animationCounter++;
                if (animationCounter >= currentAnimSpeed) {
                    animationCounter = 0;
                    animationFrame = (animationFrame + 1) % totalPunkFrames;
                }
            }

            // Add rainbow trail effect when git power is active
            if (player.gitPowerActive) {
                const trailLength = 5;
                for (let i = 0; i < trailLength; i++) {
                    const alpha = (trailLength - i) / trailLength * 0.3;
                    const hue = (frameCount * 10 + i * 30) % 360;
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                    ctx.fillRect(
                        player.x - i * 8,
                        player.y,
                        player.width,
                        player.height
                    );
                }
                ctx.globalAlpha = 1.0;

                // Pulsing glow effect around player
                const glowSize = 10 + Math.sin(frameCount * 0.2) * 5;
                const gradient = ctx.createRadialGradient(
                    player.x + player.width / 2,
                    player.y + player.height / 2,
                    0,
                    player.x + player.width / 2,
                    player.y + player.height / 2,
                    player.width + glowSize
                );
                const hue = (frameCount * 5) % 360;
                gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.6)`);
                gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
                ctx.fillStyle = gradient;
                ctx.fillRect(
                    player.x - glowSize,
                    player.y - glowSize,
                    player.width + glowSize * 2,
                    player.height + glowSize * 2
                );
            }

            // Draw sprite if loaded, otherwise draw rectangle
            if (punkFramesLoaded === totalPunkFrames && punkRunFrames[animationFrame].complete) {
                // Draw player sprite (flash when invulnerable, unless git power is active)
                const shouldFlash = player.invulnerable && !player.gitPowerActive;
                if (!shouldFlash || Math.floor(player.invulnerableTime / 5) % 2 === 0) {
                    // Apply color tint when git power is active
                    if (player.gitPowerActive) {
                        ctx.save();
                        ctx.globalCompositeOperation = 'multiply';
                        const hue = (frameCount * 5) % 360;
                        ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
                        ctx.fillRect(player.x, player.y, player.width, player.height);
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.restore();
                    }

                    ctx.drawImage(
                        punkRunFrames[animationFrame],
                        player.x,
                        player.y,
                        player.width,
                        player.height
                    );
                }
            } else {
                // Fallback to rectangle if sprites not loaded
                ctx.fillStyle = CONFIG.colors.playerOutline;
                ctx.fillRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);

                const shouldFlash = player.invulnerable && !player.gitPowerActive;
                if (!shouldFlash || Math.floor(player.invulnerableTime / 5) % 2 === 0) {
                    if (player.gitPowerActive) {
                        const hue = (frameCount * 5) % 360;
                        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                    } else {
                        ctx.fillStyle = CONFIG.colors.player;
                    }
                    ctx.fillRect(player.x, player.y, player.width, player.height);
                }
            }
        }

        function drawObstacle(obstacle) {
            const obstacleConfig = CONFIG.obstacles[obstacle.type];

            if (obstacle.type === 'fireCan') {
                // Draw fire trash can (instant death!)
                if (trashCanLoaded && trashCanSprite.complete) {
                    ctx.drawImage(
                        trashCanSprite,
                        obstacle.x, obstacle.y,
                        obstacle.width, obstacle.height
                    );

                    // Always draw fire on top
                    if (fireGifLoaded && fireGif.complete) {
                        // Draw fire gif on top of trash can
                        const fireWidth = obstacle.width * 1.2;
                        const fireHeight = obstacle.height * 0.8;
                        const fireX = obstacle.x - (fireWidth - obstacle.width) / 2;
                        const fireY = obstacle.y - fireHeight * 0.6; // Position above trash can

                        ctx.drawImage(
                            fireGif,
                            fireX, fireY,
                            fireWidth, fireHeight
                        );
                    }
                } else {
                    // Fallback: Draw orange/red square
                    ctx.fillStyle = obstacleConfig.outline;
                    const outlineWidth = obstacleConfig.outlineWidth;
                    ctx.fillRect(
                        obstacle.x - outlineWidth,
                        obstacle.y - outlineWidth,
                        obstacle.width + (outlineWidth * 2),
                        obstacle.height + (outlineWidth * 2)
                    );

                    ctx.fillStyle = obstacle.color;
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
            } else if (obstacle.type === 'cop') {
                // Draw cop gif if loaded, otherwise green square
                if (copSpriteLoaded && copSprite.complete) {
                    // Draw the animated gif flipped horizontally
                    ctx.save();
                    ctx.scale(-1, 1); // Flip horizontally
                    ctx.drawImage(
                        copSprite,
                        -obstacle.x - obstacle.width, obstacle.y,
                        obstacle.width, obstacle.height
                    );
                    ctx.restore();
                } else {
                    // Fallback: Draw green square
                    ctx.fillStyle = obstacleConfig.outline;
                    const outlineWidth = obstacleConfig.outlineWidth;
                    ctx.fillRect(
                        obstacle.x - outlineWidth,
                        obstacle.y - outlineWidth,
                        obstacle.width + (outlineWidth * 2),
                        obstacle.height + (outlineWidth * 2)
                    );

                    ctx.fillStyle = obstacle.color;
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
            } else if (obstacle.type === 'obstacle') {
                // Draw safe trash can platform
                if (trashCanLoaded && trashCanSprite.complete) {
                    ctx.drawImage(
                        trashCanSprite,
                        obstacle.x, obstacle.y,
                        obstacle.width, obstacle.height
                    );
                } else {
                    // Fallback: Draw yellow square
                    ctx.fillStyle = obstacleConfig.outline;
                    const outlineWidth = obstacleConfig.outlineWidth;
                    ctx.fillRect(
                        obstacle.x - outlineWidth,
                        obstacle.y - outlineWidth,
                        obstacle.width + (outlineWidth * 2),
                        obstacle.height + (outlineWidth * 2)
                    );

                    ctx.fillStyle = obstacle.color;
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
            }
        }

        function drawObstacles() {
            obstacles.forEach(obstacle => drawObstacle(obstacle));
        }

        function drawPowerup(powerup) {
            const sprite = powerup.type === 'weed' ? weedSprite : gitSprite;
            const spriteLoaded = powerup.type === 'weed' ? weedSpriteLoaded : gitSpriteLoaded;

            if (spriteLoaded && sprite.complete) {
                // Add a floating/bobbing animation
                const bobOffset = Math.sin(frameCount * 0.1 + powerup.x * 0.01) * 5;

                // Add glow effect
                ctx.save();
                ctx.shadowBlur = 15;
                ctx.shadowColor = powerup.type === 'weed' ? '#00ff00' : '#ff00ff';

                ctx.drawImage(
                    sprite,
                    powerup.x,
                    powerup.y + bobOffset,
                    powerup.width,
                    powerup.height
                );

                ctx.restore();
            } else {
                // Fallback: draw colored rectangle with glow
                ctx.save();
                ctx.shadowBlur = 15;
                ctx.shadowColor = powerup.type === 'weed' ? '#00ff00' : '#ff00ff';
                ctx.fillStyle = powerup.type === 'weed' ? '#00ff00' : '#ff00ff';

                const bobOffset = Math.sin(frameCount * 0.1 + powerup.x * 0.01) * 5;
                ctx.fillRect(
                    powerup.x,
                    powerup.y + bobOffset,
                    powerup.width,
                    powerup.height
                );

                ctx.restore();
            }
        }

        function drawPowerups() {
            powerups.forEach(powerup => drawPowerup(powerup));
        }

        function drawUI() {
            ctx.font = 'bold 20px Courier New';
            ctx.textAlign = 'left';

            // Distance counter
            const distanceText = `Distance: ${Math.floor(distance)}m`;
            ctx.fillStyle = CONFIG.colors.ui.shadow;
            ctx.fillText(distanceText, 21, 31);
            ctx.fillStyle = CONFIG.colors.ui.text;
            ctx.fillText(distanceText, 20, 30);

            // Score
            const scoreText = `Score: ${score}`;
            ctx.fillStyle = CONFIG.colors.ui.shadow;
            ctx.fillText(scoreText, 21, 56);
            ctx.fillStyle = CONFIG.colors.ui.text;
            ctx.fillText(scoreText, 20, 55);

            // Difficulty level indicator
            const difficultyLevel = Math.floor(distance / 50);
            const difficultyText = `Level: ${difficultyLevel}`;
            ctx.fillStyle = CONFIG.colors.ui.shadow;
            ctx.fillText(difficultyText, 21, 81);

            // Color based on difficulty
            if (difficultyLevel < 3) {
                ctx.fillStyle = CONFIG.colors.ui.text; // Green - easy
            } else if (difficultyLevel < 6) {
                ctx.fillStyle = '#ffff00'; // Yellow - medium
            } else {
                ctx.fillStyle = CONFIG.colors.ui.accent; // Pink - hard
            }
            ctx.fillText(difficultyText, 20, 80);

            // Health bar (hearts)
            ctx.textAlign = 'right';
            ctx.font = 'bold 24px Courier New';
            const healthX = CONFIG.canvas.width - 20;

            for (let i = 0; i < player.maxHealth; i++) {
                const x = healthX - (i * 30);
                if (i < player.health) {
                    // Full heart
                    ctx.fillStyle = CONFIG.colors.ui.accent;
                    ctx.fillText('♥', x, 30);
                } else {
                    // Empty heart
                    ctx.fillStyle = '#444444';
                    ctx.fillText('♡', x, 30);
                }
            }

            // Git power indicator
            if (player.gitPowerActive) {
                ctx.textAlign = 'center';
                ctx.font = 'bold 28px Courier New';
                const timeLeft = (player.gitPowerTime / 60).toFixed(1); // Convert frames to seconds
                const hue = (frameCount * 10) % 360;

                // Animated background
                ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.3)`;
                ctx.fillRect(CONFIG.canvas.width / 2 - 100, 55, 200, 40);

                // Text with glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
                ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
                ctx.fillText(`⚡ GIT POWER: ${timeLeft}s ⚡`, CONFIG.canvas.width / 2, 80);
                ctx.shadowBlur = 0;
            }
        }

        function drawStartScreen() {
            drawBackground();
            drawGround();

            ctx.font = 'bold 40px Courier New';
            ctx.textAlign = 'center';

            // Title with glitchy outline effect
            ctx.fillStyle = CONFIG.colors.ui.accent;
            ctx.fillText('GET TO THE GIG', CONFIG.canvas.width / 2 + 3, 67);
            ctx.fillStyle = CONFIG.colors.ui.shadow;
            ctx.fillText('GET TO THE GIG', CONFIG.canvas.width / 2 + 2, 66);
            ctx.fillStyle = CONFIG.colors.ui.text;
            ctx.fillText('GET TO THE GIG', CONFIG.canvas.width / 2, 65);

            // Game instructions
            ctx.font = 'bold 15px Courier New';
            ctx.fillStyle = CONFIG.colors.ui.text;
            ctx.fillText('👮 COPS: Jump on to destroy (+10pts)', CONFIG.canvas.width / 2, 120);
            ctx.fillText('   Hit from side = damage', CONFIG.canvas.width / 2, 137);
            ctx.fillText('🗑️ TRASH CANS: Jump over or land on top', CONFIG.canvas.width / 2, 157);
            ctx.fillText('🔥 BURNING TRASH CANS: Avoid or take damage!', CONFIG.canvas.width / 2, 177);
            ctx.fillText('Watch for stacked obstacles!', CONFIG.canvas.width / 2, 197);

            // Instructions
            ctx.font = 'bold 22px Courier New';
            ctx.fillStyle = CONFIG.colors.ui.accent;
            ctx.fillText('Press SPACE to Jump', CONFIG.canvas.width / 2 + 2, 241);
            ctx.fillStyle = CONFIG.colors.ui.shadow;
            ctx.fillText('Press SPACE to Jump', CONFIG.canvas.width / 2 + 1, 242);
            ctx.fillStyle = CONFIG.colors.ui.text;
            ctx.fillText('Press SPACE to Jump', CONFIG.canvas.width / 2, 240);

            // Start instruction
            ctx.font = 'bold 18px Courier New';
            ctx.fillStyle = CONFIG.colors.ui.accent;
            ctx.fillText('Press SPACE to Start', CONFIG.canvas.width / 2 + 2, 281);
            ctx.fillStyle = CONFIG.colors.ui.shadow;
            ctx.fillText('Press SPACE to Start', CONFIG.canvas.width / 2 + 1, 282);
            ctx.fillStyle = CONFIG.colors.ui.text;
            ctx.fillText('Press SPACE to Start', CONFIG.canvas.width / 2, 280);

            // Mobile instruction
            ctx.font = 'bold 12px Courier New';
            ctx.fillStyle = CONFIG.colors.ui.text;
            ctx.fillText('(or tap on mobile)', CONFIG.canvas.width / 2, 300);
        }

        function drawGameOverScreen() {
            drawBackground();
            drawGround();

            ctx.font = 'bold 40px Courier New';
            ctx.textAlign = 'center';

            // Game Over text with glitch effect
            ctx.fillStyle = CONFIG.colors.ui.accent;
            ctx.fillText('GAME OVER', CONFIG.canvas.width / 2 + 3, CONFIG.canvas.height / 2 - 57);
            ctx.fillStyle = CONFIG.colors.ui.shadow;
            ctx.fillText('GAME OVER', CONFIG.canvas.width / 2 + 2, CONFIG.canvas.height / 2 - 58);
            ctx.fillStyle = CONFIG.colors.ui.accent;
            ctx.fillText('GAME OVER', CONFIG.canvas.width / 2, CONFIG.canvas.height / 2 - 60);

            // Score
            ctx.font = 'bold 24px Courier New';
            ctx.fillStyle = CONFIG.colors.ui.shadow;
            const scoreText = `Score: ${score}`;
            ctx.fillText(scoreText, CONFIG.canvas.width / 2 + 2, CONFIG.canvas.height / 2 - 12);
            ctx.fillStyle = CONFIG.colors.ui.text;
            ctx.fillText(scoreText, CONFIG.canvas.width / 2, CONFIG.canvas.height / 2 - 15);

            // Distance
            ctx.fillStyle = CONFIG.colors.ui.shadow;
            const distanceText = `Distance: ${Math.floor(distance)}m`;
            ctx.fillText(distanceText, CONFIG.canvas.width / 2 + 2, CONFIG.canvas.height / 2 + 22);
            ctx.fillStyle = CONFIG.colors.ui.text;
            ctx.fillText(distanceText, CONFIG.canvas.width / 2, CONFIG.canvas.height / 2 + 20);

            // Restart instruction
            ctx.font = 'bold 20px Courier New';
            ctx.fillStyle = CONFIG.colors.ui.accent;
            ctx.fillText('Press SPACE to Restart', CONFIG.canvas.width / 2 + 2, CONFIG.canvas.height / 2 + 61);
            ctx.fillStyle = CONFIG.colors.ui.shadow;
            ctx.fillText('Press SPACE to Restart', CONFIG.canvas.width / 2 + 1, CONFIG.canvas.height / 2 + 62);
            ctx.fillStyle = CONFIG.colors.ui.text;
            ctx.fillText('Press SPACE to Restart', CONFIG.canvas.width / 2, CONFIG.canvas.height / 2 + 60);
        }

        function drawGame() {
            drawBackground();
            drawGround();
            drawObstacles();
            drawPowerups();
            drawPlayer();
            drawUI();
        }

        // ============================================
        // GAME LOGIC
        // ============================================
        function resetGame() {
            // Reset player
            player.x = CONFIG.player.x;
            player.y = CONFIG.player.groundY;
            player.velocityY = 0;
            player.isJumping = false;
            player.isOnGround = true;
            player.isOnPlatform = false;
            player.currentPlatform = null;
            player.health = player.maxHealth;
            player.invulnerable = false;
            player.invulnerableTime = 0;
            player.gitPowerActive = false;
            player.gitPowerTime = 0;

            // Reset game data
            obstacles = [];
            powerups = [];
            scrollSpeed = CONFIG.game.scrollSpeed;
            distance = 0;
            frameCount = 0;
            lastObstacleX = CONFIG.canvas.width;
            score = 0;
            lastTripleStackDistance = -500; // Reset triple stack tracking

            // Spawn initial obstacles (start easy with platforms)
            obstacles.push(createObstacle('obstacle', 0));
        }

        function startGame() {
            resetGame();
            gameState = 'playing';

            // Load a new random song each time the game starts
            if (backgroundMusic) {
                backgroundMusic.pause();
            }
            loadRandomSong();

            // Start music
            backgroundMusic.currentTime = 0;
            backgroundMusic.play().catch(err => {
                console.log('Audio playback failed:', err);
            });
        }

        function endGame() {
            gameState = 'gameOver';

            // Stop music
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }

        function updateGame() {
            if (gameState !== 'playing') return;

            frameCount++;

            // Update distance (faster when git power is active)
            const distanceMultiplier = player.gitPowerActive
                ? CONFIG.game.distanceMultiplier * CONFIG.powerups.git.speedMultiplier
                : CONFIG.game.distanceMultiplier;
            distance += distanceMultiplier;

            // Gradually increase scroll speed
            scrollSpeed = Math.min(
                CONFIG.game.scrollSpeed + (frameCount * CONFIG.obstacles.speedIncrease),
                CONFIG.game.maxScrollSpeed
            );

            // Update game objects
            updatePlayer();
            updateObstacles();
            updatePowerups();

            // Check collisions
            const collisionResult = checkCollisions();
            if (collisionResult === 'death') {
                endGame();
            }
        }

        // ============================================
        // GAME LOOP
        // ============================================
        function gameLoop() {
            // Update
            if (gameState === 'playing') {
                updateGame();
            }

            // Render
            switch (gameState) {
                case 'start':
                    drawStartScreen();
                    break;
                case 'playing':
                    drawGame();
                    break;
                case 'gameOver':
                    drawGameOverScreen();
                    break;
            }

            // Continue loop
            animationId = requestAnimationFrame(gameLoop);
        }

        // ============================================
        // INPUT HANDLING
        // ============================================
        function handleInput() {
            if (gameState === 'start') {
                startGame();
            } else if (gameState === 'playing') {
                jump();
            } else if (gameState === 'gameOver') {
                startGame();
            }
        }

        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleInput();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                releaseJump();
            }
        });

        // Touch/Click input
        canvas.addEventListener('click', () => {
            handleInput();
        });

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleInput();
        });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            releaseJump();
        });

        // ============================================
        // START THE GAME
        // ============================================
        gameLoop();