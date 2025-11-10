import Phaser from "phaser";
import { useGameStore } from "@/store/gameStore";
import { quests } from "@/quests/quests";

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private npc!: Phaser.Physics.Arcade.Sprite;
  private door!: Phaser.Physics.Arcade.Sprite;
  private portal!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private playerNearNPC: boolean = false;
  private playerNearPortal: boolean = false;
  private interactPrompt!: Phaser.GameObjects.Text;
  private portalPrompt!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    // Create simple colored rectangles as placeholders
    this.createPlayerGraphic();
    this.createNPCGraphic();
    this.createDoorGraphic();
    this.createPortalGraphic();
    this.createGroundGraphic();
  }

  private createPlayerGraphic() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture("player", 32, 32);
    graphics.destroy();
  }

  private createNPCGraphic() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffaa00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(12, 12, 4);
    graphics.fillCircle(20, 12, 4);
    graphics.generateTexture("npc", 32, 32);
    graphics.destroy();
  }

  private createDoorGraphic() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(0, 0, 64, 96);
    graphics.lineStyle(4, 0x654321);
    graphics.strokeRect(4, 4, 56, 88);
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(48, 48, 6);
    graphics.generateTexture("door-closed", 64, 96);
    graphics.destroy();
  }

  private createPortalGraphic() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9d4edd, 1);
    graphics.fillCircle(32, 32, 32);
    graphics.fillStyle(0xc77dff, 0.7);
    graphics.fillCircle(32, 32, 24);
    graphics.fillStyle(0xe0aaff, 0.5);
    graphics.fillCircle(32, 32, 16);
    graphics.generateTexture("portal", 64, 64);
    graphics.destroy();
  }

  private createGroundGraphic() {
    const graphics = this.add.graphics();

    // Create grass tile
    graphics.fillStyle(0x228b22, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x32cd32, 0.5);
    for (let i = 0; i < 5; i++) {
      graphics.fillRect(Math.random() * 32, Math.random() * 32, 4, 4);
    }
    graphics.generateTexture("grass", 32, 32);

    // Create path tile
    graphics.clear();
    graphics.fillStyle(0xa0826d, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x8b7355, 0.5);
    for (let i = 0; i < 3; i++) {
      graphics.fillRect(Math.random() * 32, Math.random() * 32, 6, 6);
    }
    graphics.generateTexture("path", 32, 32);

    graphics.destroy();
  }

  create() {
    this.createLevel();
    this.setupControls();
    this.setupStoreSubscription();

    // Recompute posisi layar NPC saat canvas di-resize
    this.scale.on("resize", () => {
      if (useGameStore.getState().showDialog) {
        this.updateNpcScreenPosition();
      }
    });
  }

  private createLevel() {
    // Clear existing objects if any
    this.children.removeAll();

    const currentLevel = useGameStore.getState().currentLevel;

    // Create ground based on level
    this.createGround(currentLevel);

    // Level indicator
    this.levelText = this.add.text(16, 16, `Level ${currentLevel}`, {
      fontSize: "20px",
      color: "#ffd700",
      backgroundColor: "#000000",
      padding: { x: 12, y: 6 },
    });
    this.levelText.setScrollFactor(0);
    this.levelText.setDepth(100);

    // Create player
    const playerStartPos = this.getPlayerStartPosition(currentLevel);
    this.player = this.physics.add.sprite(
      playerStartPos.x,
      playerStartPos.y,
      "player"
    );
    this.player.setCollideWorldBounds(true);

    // Create NPC
    const npcPos = this.getNPCPosition(currentLevel);
    this.npc = this.physics.add.sprite(npcPos.x, npcPos.y, "npc");
    this.npc.setImmovable(true);

    // set posisi NPC → screen space untuk dialog
    this.updateNpcScreenPosition();

    // Create door/obstacle
    const doorPos = this.getDoorPosition(currentLevel);
    this.door = this.physics.add.sprite(doorPos.x, doorPos.y, "door-closed");
    this.door.setImmovable(true);

    // Create portal (only visible after completing quest)
    const portalPos = this.getPortalPosition(currentLevel);
    this.portal = this.physics.add.sprite(portalPos.x, portalPos.y, "portal");
    this.portal.setVisible(false);
    this.portal.setAlpha(0.8);
    this.tweens.add({
      targets: this.portal,
      alpha: 1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Create interaction prompts
    this.interactPrompt = this.add.text(400, 180, "Press SPACE to talk", {
      fontSize: "14px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 8, y: 4 },
    });
    this.interactPrompt.setOrigin(0.5);
    this.interactPrompt.setVisible(false);

    this.portalPrompt = this.add.text(400, 80, "Press SPACE to enter portal", {
      fontSize: "14px",
      color: "#9d4edd",
      backgroundColor: "#000000",
      padding: { x: 8, y: 4 },
    });
    this.portalPrompt.setOrigin(0.5);
    this.portalPrompt.setVisible(false);

    // Setup collisions
    this.physics.add.collider(this.player, this.npc);
    this.physics.add.collider(this.player, this.door);
  }

  private createGround(level: number) {
    const colors = [
      { grass: 0x228b22, path: 0xa0826d }, // Level 1 - green
      { grass: 0x8b4513, path: 0xd2b48c }, // Level 2 - brown/desert
      { grass: 0x4a5568, path: 0x718096 }, // Level 3 - gray/mountain
      { grass: 0x2d1b4e, path: 0x5a3a7c }, // Level 4 - purple/mystic
      { grass: 0x1a1625, path: 0x6a4c93 }, // Level 5 - dark/cosmic
    ];

    const levelColors = colors[level - 1] || colors[0];

    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 25; x++) {
        const isPath = x >= 10 && x <= 14 && y >= 6 && y <= 10;
        const graphics = this.add.graphics();
        graphics.fillStyle(isPath ? levelColors.path : levelColors.grass, 1);
        graphics.fillRect(x * 32, y * 32, 32, 32);
        graphics.generateTexture(`tile-${x}-${y}`, 32, 32);
        this.add.image(x * 32, y * 32, `tile-${x}-${y}`).setOrigin(0, 0);
        graphics.destroy();
      }
    }
  }

  private getPlayerStartPosition(level: number) {
    const positions = [
      { x: 400, y: 400 }, // Level 1
      { x: 400, y: 400 }, // Level 2
      { x: 400, y: 400 }, // Level 3
      { x: 400, y: 400 }, // Level 4
      { x: 400, y: 400 }, // Level 5
    ];
    return positions[level - 1] || positions[0];
  }

  private getNPCPosition(level: number) {
    const positions = [
      { x: 400, y: 200 }, // Level 1
      { x: 400, y: 200 }, // Level 2
      { x: 400, y: 200 }, // Level 3
      { x: 400, y: 200 }, // Level 4
      { x: 400, y: 200 }, // Level 5
    ];
    return positions[level - 1] || positions[0];
  }

  private getDoorPosition(level: number) {
    const positions = [
      { x: 400, y: 100 }, // Level 1
      { x: 400, y: 100 }, // Level 2
      { x: 400, y: 100 }, // Level 3
      { x: 400, y: 100 }, // Level 4
      { x: 400, y: 100 }, // Level 5
    ];
    return positions[level - 1] || positions[0];
  }

  private getPortalPosition(level: number) {
    const positions = [
      { x: 400, y: 50 }, // Level 1
      { x: 400, y: 50 }, // Level 2
      { x: 400, y: 50 }, // Level 3
      { x: 400, y: 50 }, // Level 4
      { x: 400, y: 50 }, // Level 5
    ];
    return positions[level - 1] || positions[0];
  }

  private setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  private setupStoreSubscription() {
    useGameStore.subscribe((state) => {
      if (state.doorOpen && this.door.visible) {
        this.openDoor();
      }
    });
  }

  private openDoor() {
    this.tweens.add({
      targets: this.door,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.door.setActive(false);
        this.door.body!.enable = false;
        // Show portal after door opens
        this.portal.setVisible(true);
      },
    });
  }

  // === PATCH: world → screen coord untuk NPC (dipakai dialog React) ===
  private updateNpcScreenPosition() {
    if (!this.npc || !this.cameras?.main) return;

    const rect = this.game.canvas.getBoundingClientRect();

    // skala canvas aktual vs ukuran logic game
    const gameW = this.scale.gameSize.width;
    const gameH = this.scale.gameSize.height;
    const scaleX = rect.width / gameW;
    const scaleY = rect.height / gameH;

    // kompensasi kamera
    const cam = this.cameras.main;
    const worldX = this.npc.x - cam.worldView.x;
    const worldY = this.npc.y - cam.worldView.y;

    // posisi layar absolut (px, relatif ke viewport)
    const screenX = rect.left + worldX * scaleX;
    const screenY = rect.top + worldY * scaleY;

    useGameStore.getState().setNpcPosition({ x: screenX, y: screenY });
  }

  update() {
    // Player movement
    const speed = 160;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // Ketika dialog sedang tampil, perbarui posisi layar NPC setiap frame
    if (useGameStore.getState().showDialog) {
      this.updateNpcScreenPosition();
    }

    // Check distance to NPC
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.npc.x,
      this.npc.y
    );

    this.playerNearNPC = distance < 60;
    this.interactPrompt.setVisible(
      this.playerNearNPC && !useGameStore.getState().showDialog
    );

    // Check distance to portal
    if (this.portal.visible) {
      const portalDistance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.portal.x,
        this.portal.y
      );
      this.playerNearPortal = portalDistance < 60;
      this.portalPrompt.setVisible(this.playerNearPortal);
    } else {
      this.playerNearPortal = false;
      this.portalPrompt.setVisible(false);
    }

    // Handle interaction
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      // Only allow game interactions if editor is not focused
      const editorFocused = useGameStore.getState().editorFocused;

      if (!editorFocused) {
        if (this.playerNearNPC) {
          this.interactWithNPC();
        } else if (this.playerNearPortal) {
          this.enterPortal();
        }
      }
    }
  }

  private interactWithNPC() {
    const store = useGameStore.getState();
    const currentLevel = store.currentLevel;
    const questIndex = currentLevel - 1;

    if (!store.currentQuest) {
      // Give quest for current level
      const quest = quests[questIndex];
      if (quest) {
        store.setCurrentQuest(quest);
        store.setDialogText(quest.description);
        this.updateNpcScreenPosition(); // -- penting: sync posisi sebelum buka dialog
        store.setShowDialog(true);
      }
    } else if (store.currentQuest.completed) {
      if (currentLevel < 5) {
        store.setDialogText(
          "The portal awaits. Step through when you are ready to face the next trial..."
        );
      } else {
        store.setDialogText(
          "You have become the Guardian! The realm is now yours to protect. Thank you, worthy one. 🎉"
        );
      }
      this.updateNpcScreenPosition(); // -- penting
      store.setShowDialog(true);
    } else {
      store.setDialogText(`Hint: ${store.currentQuest.hint}`);
      this.updateNpcScreenPosition(); // -- penting
      store.setShowDialog(true);
    }
  }

  private enterPortal() {
    const store = useGameStore.getState();

    if (store.currentLevel < 5) {
      // Move to next level
      store.nextLevel();
      store.setCurrentQuest(null);
      store.setShowEditor(false);

      // Recreate the level
      this.createLevel();

      // Show welcome message for new level
      setTimeout(() => {
        store.setDialogText(
          `Welcome to Level ${store.currentLevel}! Seek the Keeper to learn what trials await...`
        );
        this.updateNpcScreenPosition(); // -- pastikan dialog nempel di NPC level baru
        store.setShowDialog(true);
      }, 500);
    }
  }
}
