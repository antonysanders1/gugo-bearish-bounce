import Phaser from "phaser";
import bearishBear from "../../assets/bear-sprite.png";
import platforms from "../../assets/platform-sprite.png";
import trees from "../../assets/backgrounds_0001_trees.png";
import sky from "../../assets/backgrounds_0000_sky.png";
import space from "../../assets/backgrounds_0002_space.png";
import righttreeBranch from "../../assets/righttreebranch.png";
import lefttreeBranch from "../../assets/lefttreebranch.png";
import cloud1 from "../../assets/clouds.png"; // or whichever cloud image you’re using
import fallingItemsprite from "../../assets/falling-items.png"; // or whichever cloud image you’re using
import babies from "../../assets/babys.png"; // or whichever cloud image you’re using
import jumpsound from "../../assets/jump.mp3"; // or whichever cloud image you’re using
import landsound from "../../assets/land.mp3"; // or whichever cloud image you’re using
import fallingitem from "../../assets/fallingitem.mp3";
import collectbaby from "../../assets/collectduck.mp3";
import anvilsound from "../../assets/anvilsound.mp3";
import combosound from "../../assets/combosound.mp3";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    this.onHealthChange = data.onHealthChange; // ✅ Pass in via init()
    this.setMessage = data.setMessage;
    this.mobileDirection = 0;
  }

  preload() {
    this.load.spritesheet("bearishBear", bearishBear, {
      frameWidth: 350,
      frameHeight: 512,
    });

    this.load.spritesheet("babies", babies, {
      frameWidth: 512,
      frameHeight: 512,
    });

    this.load.spritesheet("platforms", platforms, {
      frameWidth: 500, // 7674 / 4
      frameHeight: 100, // 2055 / 3
    });

    this.load.spritesheet("fallingItems", fallingItemsprite, {
      frameWidth: 512,
      frameHeight: 512,
    });

    this.load.image("trees", trees);
    this.load.image("sky", sky);
    this.load.image("space", space);
    this.load.image("rightBranch", righttreeBranch);
    this.load.image("leftBranch", lefttreeBranch);
    this.load.image("cloud", cloud1); // import cloud1 from "../path-to-image.png"

    this.load.audio("jump", jumpsound);
    this.load.audio("land", landsound);
    this.load.audio("fallingitem", fallingitem);
    this.load.audio("collectduck", collectbaby);
    this.load.audio("anvilsound", anvilsound);
    this.load.audio("combosound", combosound);
  }

  create() {
    this.registry.set("health", 4); // start health value

    // 🌄 background layers

    //! testing backgrounds ======================
    // this.bgTrees = this.add
    //   .image(200, 600, "trees")
    //   .setScrollFactor(0)
    //   .setDepth(-5);
    // this.bgSky = this.add
    //   .image(200, 600, "sky")
    //   .setScrollFactor(0)
    //   .setDepth(-5);
    // this.bgSpace = this.add
    //   .image(200, 600, "space")
    //   .setScrollFactor(0)
    //   .setDepth(-5);

    this.bgTrees = this.add
      .image(this.scale.width / 2, this.scale.height / 2, "trees")
      .setScrollFactor(0)
      .setDepth(-5)
      .setDisplaySize(this.scale.width, this.scale.height);

    this.bgSky = this.add
      .image(this.scale.width / 2, this.scale.height / 2, "sky")
      .setScrollFactor(0)
      .setDepth(-5)
      .setDisplaySize(this.scale.width, this.scale.height);

    this.bgSpace = this.add
      .image(this.scale.width / 2, this.scale.height / 2, "space")
      .setScrollFactor(0)
      .setDepth(-5)
      .setDisplaySize(this.scale.width, this.scale.height);

    // 🔁 Handle resizing the background layers
    this.scale.on("resize", (gameSize) => {
      const width = gameSize.width;
      const height = gameSize.height;

      this.bgTrees.setDisplaySize(width, height).setPosition(width / 2, height / 2);
      this.bgSky.setDisplaySize(width, height).setPosition(width / 2, height / 2);
      this.bgSpace.setDisplaySize(width, height).setPosition(width / 2, height / 2);
    });

    //! ====================== end




    this.branches = this.add.group();
    this.lastBranchSpawn = 0;
    this.clouds = this.add.group();
    this.lastCloudSpawn = 0;

    this.nextBranchSide = "left";

    this.landedPlatformIds = new Set(); // Track unique platforms landed on
    this.lastPlatformId = null; // Track the last platform landed on

    this.score = 0;
    this.multiplier = 1;
    this.onScoreChange = this.sys.settings.data.onScoreChange; // passed from init()

    this.fallTime = 0;
    this.isRotated = false;

    // 🐻 Player block (will be Bearish Bear later)
    this.block = this.physics.add
      .sprite(this.scale.width / 2, 300, "bearishBear", 1)
      .setDisplaySize(44, 64)
      .setOrigin(0.3);


    this.block.body.setSize(100, 320);     //! width, height of collision box
    // this.block.body.setOffset(8, 10);  

    this.block.setTint(0xffff00); // Yellow
    this.block.body.setGravityY(800);
    this.block.body.setBounce(0);

    this.jumpSound = this.sound.add("jump");
    this.landSound = this.sound.add("land");
    this.fallingItemSound = this.sound.add("fallingitem");
    this.collectbaby = this.sound.add("collectduck");
    this.anvilSound = this.sound.add("anvilsound");
    this.comboSound = this.sound.add("combosound");

    // 🧱 Platform groups
    this.oneWayPlatforms = this.physics.add.staticGroup();
    this.impassablePlatforms = this.physics.add.staticGroup();

    // 🧩 Generate 1000 platforms
    let nextImpassableAt = Phaser.Math.Between(3, 10); // Set first impassable

    this.babys = this.physics.add.group(); // group for babys
    let nextbabyAt = Phaser.Math.Between(10, 20);
    let nextBranchAt = Phaser.Math.Between(5, 7);

    this.fallingItems = this.physics.add.group();

    // 🍼 Baby Bear crawl animations
    this.anims.create({
      key: "babies-crawl-right",
      frames: this.anims.generateFrameNumbers("babies", { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: "babies-crawl-left",
      frames: this.anims.generateFrameNumbers("babies", { start: 4, end: 7 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: "duck-crawl-right",
      frames: this.anims.generateFrameNumbers("babies", { start: 8, end: 11 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: "duck-crawl-left",
      frames: this.anims.generateFrameNumbers("babies", { start: 12, end: 15 }),
      frameRate: 6,
      repeat: -1,
    });



    let lastPlatformX = this.scale.width / 2; // Start centered

    for (let i = 0; i < 1000; i++) {
      const y = 600 - i * 125;

      // 📈 Difficulty scaling (cap at +80 extra horizontal gap by platform 1000)
      const difficultyFactor = Phaser.Math.Clamp(i / 1000, 0, 1);
      const baseGap = 160;
      const extraGap = 80 * difficultyFactor;
      const maxHorizontalDistance = baseGap + extraGap;

      const minX = Math.max(40, lastPlatformX - maxHorizontalDistance);
      const maxX = Math.min(this.scale.width - 40, lastPlatformX + maxHorizontalDistance);
      const x = i === 0 ? this.scale.width / 2 : Phaser.Math.Between(minX, maxX);


      lastPlatformX = x;

      // 🎯 Impassable logic
      const isImpassable = i === nextImpassableAt;
      if (isImpassable) {
        nextImpassableAt += Phaser.Math.Between(3, 10);
      }

      // 🎯 Determine theme based on height (platform index)
      let oneWayFrame = 0;
      let oneWayFrameOnContact = 1;
      let impassableFrame = 8;

      if (i >= 150 && i < 300) {
        oneWayFrame = 2;
        oneWayFrameOnContact = 3;
        impassableFrame = 8;
      }
      if (i >= 300 && i < 500) {
        oneWayFrame = 6;
        oneWayFrameOnContact = 7;
        impassableFrame = 8;
      } else if (i >= 500) {
        oneWayFrame = 4;
        oneWayFrameOnContact = 5;
        impassableFrame = 9;
      }

      // 🎮 Create platform
      const group = isImpassable ? this.impassablePlatforms : this.oneWayPlatforms;
      const platform = group
        .create(x, y, "platforms", isImpassable ? impassableFrame : oneWayFrame)
        .setDisplaySize(100, 30)
        .setOrigin(0.5);

      platform.baseFrame = isImpassable ? impassableFrame : oneWayFrame;
      platform.contactFrame = isImpassable ? impassableFrame : oneWayFrameOnContact;
      platform.customId = `platform-${i}`;
      platform.refreshBody();

      // 🌲 Tree branches (only in first 150 platforms)
      if (i < 150 && i === nextBranchAt) {
        const side = this.nextBranchSide;
        const branchX = side === "left"
          ? 0 - Phaser.Math.Between(80, 120)
          : this.scale.width + Phaser.Math.Between(80, 120);
        const branchY = y - Phaser.Math.Between(100, 300);
        const textureKey = side === "left" ? "leftBranch" : "rightBranch";

        const branch = this.add.image(branchX, branchY, textureKey);
        branch.setScale(0.15 + Math.random() * 0.05);
        branch.setOrigin(side === "left" ? 0 : 1, 0.5);
        branch.setDepth(-1);
        branch.parallaxFactor = 0.5 + Math.random() * 0.3;

        this.branches.add(branch);
        nextBranchAt += Phaser.Math.Between(5, 7);
        this.nextBranchSide = side === "left" ? "right" : "left";
        console.log(`🌿 Spawning ${side} branch at y=${branchY}`);
      }

      // ☁️ Clouds (only in sky section)
      if (i >= 150 && i < 500 && Math.random() < 0.1) {
        const cloudX = Phaser.Math.Between(30, this.scale.width - 30);
        const cloudY = y - Phaser.Math.Between(150, 300);

        const cloud = this.add.image(cloudX, cloudY, "cloud");
        cloud.setScale(0.08 + Math.random() * 0.05);
        cloud.setDepth(-2);
        cloud.parallaxFactor = 0.3 + Math.random() * 0.2;

        this.clouds.add(cloud);
      }

      // 🦆 Baby spawn logic
      if (i === nextbabyAt) {
        const isDuck = Phaser.Math.Between(0, 1) === 1;
        const startFrame = isDuck
          ? Phaser.Math.Between(8, 10)
          : Phaser.Math.Between(0, 2);

        const bear = this.babys
          .create(x, y - 26, "babies", startFrame)
          .setDisplaySize(40, 40)
          .setOrigin(0.5);

        bear.body.setAllowGravity(false);
        bear.setVelocityX(40);
        bear.setCollideWorldBounds(false);
        bear.minX = x - 40;
        bear.maxX = x + 40;
        bear.isDuck = isDuck;
        bear.play(isDuck ? "duck-crawl-right" : "babies-crawl-right");

        nextbabyAt += Phaser.Math.Between(8, 15);
      }
    }


    // 🦆 Collect babys on touch
    this.physics.add.overlap(this.block, this.babys, (block, baby) => {
      if (!baby.collected) {
        baby.collected = true; // prevent double collection
        this.collectbaby?.play();
        this.score += 1000;
        this.setMessage(`+1000 Points!`);
        if (this.onScoreChange) {
          this.onScoreChange(this.score, this.multiplier);
        }

        baby.disableBody(true, true); // hide + remove from physics

        this.tweens.add({
          targets: baby,
          scale: 1.5,
          alpha: 0,
          duration: 300,
          ease: "Power2",
          onComplete: () => baby.destroy(),
        });
      }
    });

    //Falling Items
    this.physics.add.overlap(this.block, this.fallingItems, (block, item) => {
      if (item.collected) return; // ✅ Prevent double-processing
      item.collected = true;

      const currentHealth = this.registry.get("health");
      switch (item.frameIndex) {
        case 0: // 🪓 Anvil
          if (this.onHealthChange) this.onHealthChange(-1);
          this.registry.set("health", Math.max(0, currentHealth - 1));
          this.cameras.main.shake(250, 0.01); // duration (ms), intensity
          this.anvilSound?.play(); // 👈 play anvil sound here
          this.block.setFrame(4);
          this.block.setVelocityY(0); // 🛑 Stop upward motion
          this.multiplier = 1;
          this.setMessage(`BOINK!`);

          break;

        case 1: // 🍇 Grapes
          this.multiplier += 5;
          this.fallingItemSound?.play(); // ✅ play sound effect
          this.setMessage(`+5x Mulitplier!`);
          break;

        case 2: // 🍯 Honey
          this.score += 500;
          if (this.onScoreChange) {
            this.onScoreChange(this.score, this.multiplier);
          }
          this.fallingItemSound?.play(); // ✅ play sound effect
          this.setMessage(`+500 Points`);
          break;

        case 3: // 🐟 Fish
          this.registry.set("health", Math.min(4, currentHealth + 1));
          if (this.onHealthChange) this.onHealthChange(1);
          this.fallingItemSound?.play(); // ✅ play sound effect
          this.setMessage(`+1 Health!`);
          break;
      }

      // Tween out and destroy
      this.tweens.add({
        targets: item,
        alpha: 0,
        scale: 1.5,
        duration: 250,
        ease: "Power2",
        onComplete: () => item.destroy(),
      });
    });

    // 🟩 One-way bounce logic
    this.physics.add.overlap(
      this.block,
      this.oneWayPlatforms,
      (block, platform) => {
        const blockBottom = block.body.y + block.body.height;
        const platformTop = platform.y - platform.displayHeight / 2;
        const isFalling = block.body.velocity.y > 0;
        const closeEnough = Math.abs(blockBottom - platformTop) <= 10;

        if (isFalling && closeEnough) {
          this.jumpSound?.play();
          block.setVelocityY(-500);

          platform.setFrame(platform.contactFrame); // 🌟 Set contact frame
          block.setFrame(0);
          this.time.delayedCall(100, () => {
            block.setFrame(1); // 🔁 Switch to idle frame after short delay
            platform.setFrame(platform.baseFrame); // Reset after bounce

            if (this.multiplier % 25 === 0) {
              // 🔥 Show hype frame and spin!
              this.setMessage(`${this.multiplier}x Combo!`);
              this.comboSound?.play();
              block.setFrame(2);

              // Spin animation
              this.tweens.add({
                targets: block,
                angle: 360,
                duration: 300,
                ease: "Cubic.easeOut",
                onComplete: () => {
                  block.setAngle(0); // reset angle to avoid compounding
                },
              });
            }
          });

          const platformId = platform.customId;
          // const platformId = this.score; //make this the score
          //if the platfomrId score is lower than current score, add no points and remove multiplier...

          if (!this.landedPlatformIds.has(platformId)) {
            // ✅ NEW PLATFORM
            this.landedPlatformIds.add(platformId);
            this.multiplier += 1;
            this.score += 103 * this.multiplier;
            this.lastPlatformId = platformId;
            console.log("CONDITION 1 PLATFORM ID", platformId);
          } else if (this.lastPlatformId) {
            if (platformId === this.lastPlatformId) {
              console.log("1st - reset the mulitplier");
              this.score += 0;
              this.multiplier = 1;
              // return
            } else if (platformId !== this.lastPlatformId) {
              const currentPIDNumber = platformId.split("-")[1];
              const prevPIDNumber = this.lastPlatformId.split("-")[1];
              if (currentPIDNumber <= prevPIDNumber) {
                console.log("reset the mulitplier");
                this.score += 0;
                this.multiplier = 1;
                // return
              } else {
                this.score += 103 * this.multiplier;
                this.lastPlatformId = platformId;
                this.multiplier += 1;
                console.log("CONDITION 2  PLATFORM ID", this.lastPlatformId);
              }
            }
          }
          // else if (platformId !== this.lastPlatformId) {
          //   // ✅ REPEATED PLATFORM (but first time returning to it)
          //   this.score += 103 * this.multiplier;
          //   this.lastPlatformId = platformId;
          //   this.multiplier = 1;
          //   console.log('CONDITION 2  PLATFORM ID', this.lastPlatformId)
          // }
          else {
            // ⛔ ALREADY SCORED this platform, no points again
            console.log("ALREADY SCORED this platform, no points again");
            return;
          }

          if (this.onScoreChange) {
            console.log("changing the score");
            this.onScoreChange(this.score, this.multiplier);
          }
        }
      }
    );

    // 🔴 Impassable bounce logic
    this.physics.add.collider(
      this.block,
      this.impassablePlatforms,
      (block, platform) => {
        // still handle bounce from top
        const blockBottom = block.body.y + block.body.height;
        const platformTop = platform.y - platform.displayHeight / 2;
        const isFalling = block.body.velocity.y > 0;
        const landed = Math.abs(blockBottom - platformTop) <= 10;

        if (isFalling && landed) {
          this.jumpSound?.play();
          setTimeout(() => block.setVelocityY(-500), 0);
        }
      }
    );

    // 🎮 Input
    this.cursors = this.input.keyboard.createCursorKeys();

    window.addEventListener("sliderMove", (e) => {
      this.mobileDirection = e.detail.direction;
    });
  }

  update(time, delta) {
    const block = this.block;
    const cursors = this.cursors;

    // Detect movement keys
    const movingLeft = cursors.left.isDown || this.mobileDirection < -0.2;
    const movingRight = cursors.right.isDown || this.mobileDirection > 0.2;

    if (!this.nextItemSpawnTime || time > this.nextItemSpawnTime) {
      const itemX = Phaser.Math.Between(50, this.scale.width - 50);
      const itemY = this.cameras.main.scrollY - 100;
      const weightedFrames = [
        0,
        0,
        0,
        0, // 🪓 Anvil (more frequent)
        1,
        1, // 🍇 Grapes
        2,
        2, // 🍯 Honey
        3, // 🐟 Fish (less frequent)
      ];
      const frame = Phaser.Utils.Array.GetRandom(weightedFrames);

      const item = this.fallingItems
        .create(itemX, itemY, "fallingItems", frame)
        .setDisplaySize(40, 40)
        .setOrigin(0.5);

      item.setBounce(0);
      item.setCollideWorldBounds(false);
      item.setVelocityY(Phaser.Math.Between(100, 200));
      item.setAngularVelocity(Phaser.Math.Between(-50, 50));
      item.frameIndex = frame;

      // 🔁 Schedule next spawn
      const platformsLanded = this.landedPlatformIds.size;
      const minDelay = 2000; // fastest possible (2s)
      const maxDelay = 8000; // slowest at start
      const speedFactor = Math.min(platformsLanded / 150, 1); // ⏩ capped at 150 platforms

      const delay = Phaser.Math.Between(
        maxDelay - speedFactor * (maxDelay - minDelay) - 500,
        maxDelay - speedFactor * (maxDelay - minDelay) + 500
      );

      this.nextItemSpawnTime = time + delay;
    }

    // Handle horizontal movement
    if (movingLeft) {
      block.setVelocityX(-200);
    } else if (movingRight) {
      block.setVelocityX(200);
    } else {
      block.setVelocityX(0);
    }

    // 🧠 Check for head collisions with impassable platforms
    this.impassablePlatforms.children.iterate((platform) => {
      const blockTop = this.block.body.y;
      const blockBottom = this.block.body.y + this.block.body.height;
      const platformTop = platform.y - platform.displayHeight / 2;
      const platformBottom = platform.y + platform.displayHeight / 2;

      const isRising = this.block.body.velocity.y < 0;
      const closeVertically = Math.abs(blockTop - platformBottom) <= 10;
      const alignedHorizontally =
        Math.abs(this.block.x - platform.x) <= platform.displayWidth / 2;

      // If rising and close to the bottom of platform
      if (
        isRising &&
        closeVertically &&
        alignedHorizontally &&
        !platform.hitRecently
      ) {
        console.log("💥 Head bonk detected (via update)");
        this.block.setFrame(3);
        this.landSound?.play();
        if (this.onHealthChange) this.onHealthChange(-1);
        this.multiplier = 1;

        const currentHealth = this.registry.get("health");
        this.registry.set("health", Math.max(0, currentHealth - 1));

        platform.hitRecently = true; // Prevent spamming
        this.time.delayedCall(500, () => {
          platform.hitRecently = false;
        });
      }

      this.babys.children.iterate((bear) => {
        if (!bear) return;

        const rightAnim = bear.isDuck
          ? "duck-crawl-right"
          : "babies-crawl-right";
        const leftAnim = bear.isDuck ? "duck-crawl-left" : "babies-crawl-left";

        if (bear.x <= bear.minX) {
          bear.setVelocityX(40);
          bear.play(rightAnim, true);
        } else if (bear.x >= bear.maxX) {
          bear.setVelocityX(-40);
          bear.play(leftAnim, true);
        }
      });
    });

    // Bounce if on impassable platform and L/R is pressed
    if (movingLeft || movingRight) {
      this.impassablePlatforms.children.iterate((platform) => {
        const blockBottom = block.body.y + block.body.height;
        const platformTop = platform.y - platform.displayHeight / 2;
        const closeEnough = Math.abs(blockBottom - platformTop) <= 10;
        const horizontallyAligned =
          Math.abs(block.x - platform.x) <= platform.displayWidth / 2;

        if (closeEnough && horizontallyAligned && block.body.velocity.y === 0) {
          block.setVelocityY(-500); // Bounce
          block.setFrame(0);
          this.jumpSound?.play();
          this.time.delayedCall(100, () => {
            block.setFrame(1);
          });
        }
      });
    }

    // Camera follows upward
    if (block.y < 300) {
      this.cameras.main.scrollY = block.y - 300;
    }

    // 🌌 Theme background switching based on block height
    const playerY = block.y;

    const y = this.block.y;

    // Smooth fade between themes (based on your thresholds)
    const fadeStart1 = -18000; // Trees to Sky
    const fadeEnd1 = -18700;

    const fadeStart2 = -61000; // Sky to Space
    const fadeEnd2 = -62500;

    // Clamp helper
    const clamp = Phaser.Math.Clamp;

    // Calculate alpha values
    const treesAlpha = clamp((fadeEnd1 - y) / (fadeEnd1 - fadeStart1), 0, 1);
    const skyAlpha =
      clamp((y - fadeStart1) / (fadeEnd1 - fadeStart1), 0, 1) *
      clamp((fadeEnd2 - y) / (fadeEnd2 - fadeStart2), 0, 1);
    const spaceAlpha = clamp((y - fadeStart2) / (fadeEnd2 - fadeStart2), 0, 1);

    // Set alphas
    this.bgTrees.setAlpha(treesAlpha);
    this.bgSky.setAlpha(skyAlpha);
    this.bgSpace.setAlpha(spaceAlpha);

    // 🌲 Parallax Branch Spawning
    const isInTreeSection = block.y < 0 && block.y > -18000;

    // if (isInTreeSection && time - this.lastBranchSpawn > 500) {
    //   console.log("🌲 Spawning branch", block.y);
    //   const side = Math.random() > 0.5 ? "left" : "right";
    //   const x = side === "left"
    //     ? this.cameras.main.scrollX + 100
    //     : this.cameras.main.scrollX + this.scale.width - 100;
    //   const y = this.block.y - 300;

    //   const branch = this.add.image(x, y, "treebranch");
    //   branch.setDepth(1); // or adjust if needed
    //   branch.setScale(0.75);
    //   branch.parallaxFactor = 0.5 + Math.random() * 0.3;

    //   this.branches.add(branch);
    //   this.lastBranchSpawn = time;
    // }

    // Move branches upward at parallax speed
    this.branches?.getChildren()?.forEach((branch) => {
      branch.y +=
        (block.body.velocity.y || -150) * -0.0025 * branch.parallaxFactor;

      // Clean up branches that fall off screen
      if (branch.y > this.cameras.main.scrollY + 800) {
        branch.destroy();
      }
    });

    this.clouds?.getChildren()?.forEach((cloud) => {
      cloud.y +=
        (block.body.velocity.y || -150) * -0.0025 * cloud.parallaxFactor;

      if (cloud.y > this.cameras.main.scrollY + 800) {
        cloud.destroy();
      }
    });

    // 🧹 Remove platforms more than 3 behind
    if (this.lastPlatformId) {
      const lastIndex = parseInt(this.lastPlatformId.split("-")[1]);

      this.oneWayPlatforms.children.iterate((plat) => {
        if (!plat || !plat.customId) return;
        const index = parseInt(plat.customId.split("-")[1]);
        if (index < lastIndex - 9) {
          plat.destroy(); // remove from display and physics
        }
      });

      this.impassablePlatforms.children.iterate((plat) => {
        if (!plat || !plat.customId) return;
        const index = parseInt(plat.customId.split("-")[1]);
        if (index < lastIndex - 9) {
          plat.destroy();
        }
      });
    }

    this.fallingItems.getChildren().forEach((item) => {
      item.setAngularVelocity(Phaser.Math.Between(-100, 100)); // ✅ Rotates gently

      if (item.y > this.cameras.main.scrollY + this.scale.height + 100) {
        item.destroy();
      }
    });

    // 🚮 Remove branches that fall too far below the viewport
    // this.branches.getChildren().forEach((branch) => {
    //   if (branch.y > this.cameras.main.scrollY + 800) {
    //     branch.destroy();
    //   }
    // });

    const isFalling = this.block.body.velocity.y > 0;

    // ⏱️ Track fall time
    if (isFalling && this.block.body.velocity.y > 50) {
      this.fallTime += delta;

      if (this.fallTime >= 1250 && !this.isRotated) {
        this.isRotated = true;

        this.tweens.add({
          targets: this.block,
          angle: 180,
          duration: 250,
          ease: "Power2",
        });
      }
    } else {
      // Reset fall state if we're not falling anymore
      this.fallTime = 0;
      if (this.isRotated) {
        this.tweens.add({
          targets: this.block,
          angle: 0,
          duration: 200,
          ease: "Power2",
        });
        this.isRotated = false;
      }
    }

    // 🧠 Game Over check
    if (this.block.active && this.registry.get("health") === 0) {
      this.block.setActive(false).setVisible(false);
      this.scene.pause();
    }

    // 🧠 Game Over if Bear falls too low
    // 🧠 Game Over if Bear falls too low
    if (this.block.active && this.block.y > this.cameras.main.scrollY + 700) {
      this.block.setActive(false).setVisible(false);
      this.scene.pause();
      if (this.onHealthChange) this.onHealthChange(-4); // Kill all health
    }
  }
}
