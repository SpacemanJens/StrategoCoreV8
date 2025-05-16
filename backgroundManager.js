class StarObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    drawStarEffect(x, y, hsb2, hsb3, hsb4, hsb5, fill1, fill2, fill3, fill4, cr, coronaEffect) {
        // Apply supernova effect parameters if active
        if (coronaEffect !== 1) {
            fill1 = 50;
            fill2 = 550;
            fill3 = 300;
            fill4 = 400;
        }

        push();
        blendMode(BLEND);
        colorMode(HSB, hsb2, hsb3, hsb4, hsb5);
        blendMode(ADD);
        for (let d = 0; d < 1; d += 0.01) {
            fill(fill1, fill2, fill3, (1.1 - d * 1.2) * fill4);
            circle(x, y, cr * d + random(0, coronaEffect));
        }
        pop();
    }
}

class DecorativeOrangeStar extends StarObject {
    constructor(x, y) {
        super(x, y);
        this.isButtonHovered = false;
        this.crSize = random(30, 60);
        this.maxSize = random(15, 30); // Different max sizes for variety
        this.animationSpeed = random(0.01, 0.03);
        this.size = random(8, 15); // For collision detection
    }

    draw() {
        // Animate cr size smoothly when button is hovered
        this.crSize = lerp(
            this.crSize,
            this.isButtonHovered ? this.maxSize : 4,
            this.animationSpeed
        );

        // Draw the star effect
        this.drawStarEffect(this.x, this.y, 430, 800, 1500, 1010, 50, 550, 300, 400, this.crSize, 1);
    }

    setButtonHovered(isHovered) {
        this.isButtonHovered = isHovered;
    }
}

class DecorativeStar extends DecorativeOrangeStar {
    constructor(x, y) {
        super(x, y);
        this.initStarParameters();
        this.setupSupernovaProperties();
    }

    initStarParameters() {
        // Choose star type based on random value
        const randomValue = random(1);
        let params;

        if (randomValue > 0.9) {
            params = { hsb2: 0, hsb3: 0, hsb4: 0, hsb5: 10000, fill1: 50, fill2: 550, fill3: 300, fill4: 400, sizeFactor: random(1, 1.5) };  // red
        } else if (randomValue > 0.8) {
            params = { hsb2: 600, hsb3: 645, hsb4: 2000, hsb5: 1010, fill1: 550, fill2: 550, fill3: 300, fill4: 400, sizeFactor: random(0.8, 1.5) }; // pink
        } else if (randomValue > 0.7) {
            params = { hsb2: 71, hsb3: 645, hsb4: 2000, hsb5: 1010, fill1: 50, fill2: 550, fill3: 300, fill4: 400, sizeFactor: random(1, 1.5) };  //spacecraftPurpleImages
        } else if (randomValue > 0.6) {
            params = { hsb2: 87, hsb3: 645, hsb4: 2000, hsb5: 1010, fill1: 50, fill2: 550, fill3: 300, fill4: 400, sizeFactor: random(0.8, 1.5) };  // light blue
        } else if (randomValue > 0.5) {
            params = { hsb2: 160, hsb3: 645, hsb4: 2000, hsb5: 1010, fill1: 50, fill2: 550, fill3: 300, fill4: 400, sizeFactor: random(0.8, 1.5) }; // green
        } else if (randomValue > 0.4) {
            params = { hsb2: 65, hsb3: 0, hsb4: 65, hsb5: 300, fill1: 50, fill2: 122, fill3: 500, fill4: 56, sizeFactor: random(0.8, 1.5) }; // Purple giant
        } else if (randomValue > 0.3) {
            params = { hsb2: 181, hsb3: 181, hsb4: 2000, hsb5: 300, fill1: 50, fill2: 122, fill3: 500, fill4: 181, sizeFactor: random(0.8, 1.5) }; // Green giant
        } else {
            params = { hsb2: 1600, hsb3: 645, hsb4: 2000, hsb5: 1010, fill1: 50, fill2: 1600, fill3: 1600, fill4: 400, sizeFactor: random(0.5, 5.5) }; // Red giant
        }

        // Assign parameters to this star
        Object.assign(this, params);
    }

    setupSupernovaProperties() {
        this.isSupernova = false;
        this.supernovaStartFrame = 0;
        this.supernovaDuration = ANIMATION_FRAMES;
        this.disappearThreshold = SUPERNOVA_THRESHOLD;
        this.isDead = false;
        this.supernovaMaxSize = SUPERNOVA_MAX_SIZE;
    }

    draw() {
        // If star is dead (post-supernova), don't draw it
        //    if (this.isDead) return;

        if (this.isSupernova) {
            this.drawSupernova();
        } else {
            this.drawNormalStar();
        }
    }

    drawSupernova() {
        // Calculate progress of supernova animation
        const progress = (frameCount - this.supernovaStartFrame) / this.supernovaDuration;
        const normalizedProgress = progress / this.disappearThreshold;

        // Growth calculation
        const growthFactor = pow(normalizedProgress, 12.2);
        const currentSize = lerp(this.crSize, this.supernovaMaxSize, growthFactor);

        // Calculate fade effect
        const fadeFactor = this.calculateFadeFactor(normalizedProgress);
        const currentFill1 = lerp(this.fill1, 0, fadeFactor);
        const currentFill2 = lerp(this.fill2, 0, fadeFactor);

        // Draw with supernova effect
        this.drawStarEffect(
            this.x, this.y,
            this.hsb2, this.hsb3, this.hsb4, this.hsb5,
            currentFill1, currentFill2,
            this.fill3 * (1 - fadeFactor * 0.7),
            this.fill4 * (1 + normalizedProgress * 2.5 - fadeFactor),
            currentSize,
            6 * normalizedProgress
        );

        // Trigger flash effect at the end of the supernova animation
        if (currentSize >= this.supernovaMaxSize / 4) {
            backgroundManager.setFlashEffect(60);
            this.isDead = true;
        }
    }

    calculateFadeFactor(progress) {
        // Start fading at 30% progress, complete by 70% jens
        const rawFade = constrain(map(progress, 0.3, 0.7, 0, 1), 0, 1);
        // Apply non-linear fade curve
        return pow(rawFade, 0.7);
    }

    drawNormalStar() {
        if (this.isButtonHovered) {
            this.crSize = lerp(this.crSize, this.maxSize, this.animationSpeed);
        } else {
            this.crSize = lerp(this.crSize, 4, this.animationSpeed);
        }

        this.drawStarEffect(
            this.x, this.y,
            this.hsb2, this.hsb3, this.hsb4, this.hsb5,
            this.fill1, this.fill2, this.fill3, this.fill4,
            this.crSize, 1
        );
    }

    triggerSupernova() {
        console.log("triggerSupernova called");
        if (!this.isSupernova) {
            this.isSupernova = true;
            this.supernovaStartFrame = frameCount;
        }
    }
}
// Background class to manage stars and scene elements
class BackgroundManager {
    constructor() {
        this.stars = [];
        this.decorativeStars = [];
        this.targetStar = null;
        this.flashEffect = 0;
    }

    // Initialize background elements
    initialize() {
        // Create stars
        this.createBackgroundStars();

        // Create target star at predefined position
        this.targetStar = new DecorativeOrangeStar(1300, 300);

        // Create decorative stars
        this.createDecorativeStars();
    }

    // Create background stars
    createBackgroundStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: random(width),
                y: random(height),
                size: random(1, 3),
                twinkle: random(0.01, 0.05)
            });
        }
    }

    // Create decorative stars
    createDecorativeStars() {
        this.decorativeStars = [];

        // Create 12 decorative stars. One of each character type as they are enlarged when characters are hovered
        for (let i = 0; i < 12; i++) {
            // Find valid position for the star
            const position = this.findValidStarPosition();
            this.decorativeStars.push(new DecorativeStar(position.x, position.y));
        }
    }

    findValidStarPosition() {
        let x, y;
        let attempts = 0;
        const maxAttempts = 500; // Safety break to prevent potential infinite loops

        do {
            x = random(width); // Use full canvas width
            y = random(height); // Use full canvas height
            attempts++;

            // A position is valid if it's outside the game area.
            // Game area is defined by:
            // x >= GAME_AREA_X && x <= GAME_AREA_RIGHT &&
            // y >= GAME_AREA_Y && y <= GAME_AREA_BOTTOM
            const isInsideGameArea = (x >= GAME_AREA_X && x <= GAME_AREA_RIGHT &&
                y >= GAME_AREA_Y && y <= GAME_AREA_BOTTOM);

            if (!isInsideGameArea) {
                return { x, y }; // Valid position found
            }
        } while (attempts < maxAttempts);

        // Fallback if maxAttempts reached (should be rare if canvas is larger than game area)
        // Place it in a default safe corner (e.g., top-left), ensuring it's outside typical game areas.
        console.warn(`Max attempts (${maxAttempts}) reached in findValidStarPosition. Placing star at default (0,0).`);
        return { x: 0, y: 0 }; // Default to top-left corner
    }

    // Draw all stars in the background
    drawStars() {
        fill(255);
        noStroke();
        this.stars.forEach(star => {
            let drawThisStar = true;

            // Check if shared and game area constants are available
            if (typeof shared !== 'undefined' && typeof GAME_AREA_X !== 'undefined') {
                if (shared.gameState === "IN-GAME") {
                    // If game state is IN-GAME, check if the star is inside the game area
                    if (star.x >= GAME_AREA_X && star.x <= GAME_AREA_RIGHT &&
                        star.y >= GAME_AREA_Y && star.y <= GAME_AREA_BOTTOM) {
                        drawThisStar = false; // Do not draw stars inside the game area during IN-GAME state
                    }
                }
            }

            if (shared.showGraphics || drawThisStar) {
                const brightness = 150 + 105 * sin(frameCount * star.twinkle);
                fill(brightness);
                ellipse(star.x, star.y, star.size);
            }
        });
    }

    // Draw all scene elements
    drawBackground() {

        if (!shared.showBackroundStarts) return; // Skip if background stars are disabled

        // Draw decorative stars
        this.decorativeStars.forEach(star => star.draw());

        if (me.isReady) return

        // Draw background stars
        this.drawStars();

        // Draw target star
        //if (this.targetStar) {
        //    this.targetStar.draw();
        //}


        // Add flash effect on top if active
        if (this.flashEffect > 0) {
            fill(255, 255, 255, this.flashEffect * 8);
            rectMode(CORNER);
            rect(0, 0, width, height);
            this.flashEffect--;
        }
    }

    // Set the hover state of the target star
    setTargetStarHovered(isHovered) {
        if (this.targetStar) {
            this.targetStar.setButtonHovered(isHovered);
        }
    }

    // Handle supernova trigger for a specific decorative star
    triggerSupernova(index) {
        if (index < this.decorativeStars.length) {
            this.decorativeStars[index].triggerSupernova();
        }
    }

    // Set flash effect
    setFlashEffect(intensity) {
        this.flashEffect = intensity;
    }

    // Get the target star
    getTargetStar() {
        return this.targetStar;
    }

    // Get all decorative stars
    getDecorativeStars() {
        return this.decorativeStars;
    }

    // Reset hover state for all decorative stars
    resetStarHoverStates() {
        this.decorativeStars.forEach(star => star.setButtonHovered(false));
    }
}