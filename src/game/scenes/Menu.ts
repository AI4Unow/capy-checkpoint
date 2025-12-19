import Phaser from "phaser";

/**
 * Menu scene - start screen
 */
export class Menu extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    this.add.image(400, 300, "background");

    // Title
    const title = this.add.text(400, 150, "Capy-Checkpoint", {
      fontFamily: "Fredoka",
      fontSize: "56px",
      color: "#5E503F",
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(400, 210, "Math Adventure!", {
      fontFamily: "Nunito",
      fontSize: "24px",
      color: "#5E503F",
    });
    subtitle.setOrigin(0.5);

    // Capybara
    const capy = this.add.image(400, 350, "capybara");
    capy.setScale(1.5);
    this.tweens.add({
      targets: capy,
      y: capy.y - 20,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Play button
    const playBtn = this.add.rectangle(400, 480, 200, 60, 0xffd6e0);
    playBtn.setStrokeStyle(4, 0x5e503f);
    playBtn.setInteractive({ useHandCursor: true });

    const playText = this.add.text(400, 480, "PLAY", {
      fontFamily: "Baloo 2",
      fontSize: "32px",
      color: "#5E503F",
    });
    playText.setOrigin(0.5);

    playBtn.on("pointerover", () => {
      playBtn.setFillStyle(0xffe4ec);
      playBtn.setScale(1.05);
      playText.setScale(1.05);
    });

    playBtn.on("pointerout", () => {
      playBtn.setFillStyle(0xffd6e0);
      playBtn.setScale(1);
      playText.setScale(1);
    });

    playBtn.on("pointerdown", () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start("Game"));
    });

    this.cameras.main.fadeIn(500);
  }
}
