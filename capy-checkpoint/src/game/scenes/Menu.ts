import Phaser from 'phaser';

/**
 * Menu scene - start screen with play button
 */
export class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    // Background
    this.add.image(400, 300, 'background');

    // Title
    const title = this.add.text(400, 150, 'Capy-Checkpoint', {
      fontFamily: 'Fredoka',
      fontSize: '56px',
      color: '#5E503F',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(400, 210, 'Math Adventure!', {
      fontFamily: 'Nunito',
      fontSize: '24px',
      color: '#5E503F',
    });
    subtitle.setOrigin(0.5);

    // Capybara mascot
    const capy = this.add.image(400, 350, 'capybara');
    capy.setScale(1.5);

    // Floating animation
    this.tweens.add({
      targets: capy,
      y: capy.y - 20,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Play button
    const playBtn = this.add.rectangle(400, 480, 200, 60, 0xFFD6E0);
    playBtn.setStrokeStyle(4, 0x5E503F);
    playBtn.setInteractive({ useHandCursor: true });

    const playText = this.add.text(400, 480, 'PLAY', {
      fontFamily: 'Baloo 2',
      fontSize: '32px',
      color: '#5E503F',
    });
    playText.setOrigin(0.5);

    // Button hover effects
    playBtn.on('pointerover', () => {
      playBtn.setFillStyle(0xFFE4EC);
      playBtn.setScale(1.05);
      playText.setScale(1.05);
    });

    playBtn.on('pointerout', () => {
      playBtn.setFillStyle(0xFFD6E0);
      playBtn.setScale(1);
      playText.setScale(1);
    });

    // Start game on click
    playBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => {
        this.scene.start('Game');
      });
    });

    // Fade in
    this.cameras.main.fadeIn(500);
  }
}
