import Phaser from "phaser";
import { EventBus, GameEvents } from "../EventBus";
import questionsData from "@/data/questions.json";
import type { Question } from "@/types/question";

const FLAP_VELOCITY = -350;
const SCROLL_SPEED = 180;
const GATE_SPAWN_INTERVAL = 4000;
const GROUND_Y = 520;
const PATH_HEIGHT = 120; // Height of each answer path

interface AnswerGate {
  container: Phaser.GameObjects.Container;
  pathIndex: number;
  answered: boolean;
}

// Question selector function passed from React
type QuestionSelector = (questions: Question[]) => Question;
type AnswerRecorder = (
  question: Question,
  isCorrect: boolean,
  responseTimeMs?: number
) => void;

/**
 * Main gameplay scene with 3-path answer gates
 */
export class Game extends Phaser.Scene {
  private capybara!: Phaser.Physics.Arcade.Sprite;
  private background!: Phaser.GameObjects.TileSprite;
  private ground!: Phaser.GameObjects.Rectangle;
  private score = 0;
  private lives = 3;
  private isGameOver = false;
  private gateTimer!: Phaser.Time.TimerEvent;
  private activeGates: AnswerGate[] = [];
  private questions: Question[] = [];
  private currentQuestion: Question | null = null;
  private questionText!: Phaser.GameObjects.Text;
  private answeredIds: Set<string> = new Set();

  // Adaptive learning integration
  private questionSelector: QuestionSelector | null = null;
  private answerRecorder: AnswerRecorder | null = null;
  private questionStartTime = 0;

  constructor() {
    super("Game");
  }

  init(): void {
    // Load questions
    this.questions = questionsData as Question[];
  }

  /**
   * Set the adaptive question selector from React
   */
  setQuestionSelector(selector: QuestionSelector): void {
    this.questionSelector = selector;
  }

  /**
   * Set the answer recorder from React
   */
  setAnswerRecorder(recorder: AnswerRecorder): void {
    this.answerRecorder = recorder;
  }

  create(): void {
    this.score = 0;
    this.lives = 3;
    this.isGameOver = false;
    this.activeGates = [];
    this.answeredIds.clear();

    // Background
    this.background = this.add.tileSprite(400, 300, 800, 600, "background");

    // Ground
    this.ground = this.add.rectangle(400, GROUND_Y + 40, 800, 80, 0xdde5b6);
    this.physics.add.existing(this.ground, true);

    // Capybara
    this.capybara = this.physics.add.sprite(120, 300, "capybara");
    this.capybara.setCollideWorldBounds(true);
    this.capybara.setDepth(10);
    const capyBody = this.capybara.body as Phaser.Physics.Arcade.Body;
    capyBody.setSize(60, 50);
    capyBody.allowGravity = false; // Disable gravity until first flap

    // Ground collision
    this.physics.add.collider(this.capybara, this.ground, () => {
      if (!this.isGameOver) this.gameOver();
    });

    // Input
    this.input.on("pointerdown", () => this.flap());
    this.input.keyboard?.on("keydown-SPACE", () => this.flap());

    // Question text
    this.questionText = this.add.text(400, 80, "", {
      fontFamily: "Fredoka",
      fontSize: "28px",
      color: "#5E503F",
      backgroundColor: "#FFFFFF",
      padding: { x: 20, y: 12 },
    });
    this.questionText.setOrigin(0.5);
    this.questionText.setDepth(20);

    // Spawn gates periodically
    this.gateTimer = this.time.addEvent({
      delay: GATE_SPAWN_INTERVAL,
      callback: this.spawnAnswerGate,
      callbackScope: this,
      loop: true,
    });

    // First gate after delay
    this.time.delayedCall(1000, () => {
      this.selectNextQuestion();
      this.spawnAnswerGate();
    });

    // Emit events
    EventBus.emit(GameEvents.GAME_START);
    EventBus.emit(GameEvents.SCORE_UPDATE, this.score);
    EventBus.emit(GameEvents.LIVES_UPDATE, this.lives);

    this.cameras.main.fadeIn(300);
  }

  update(): void {
    if (this.isGameOver) return;

    // Scroll background
    this.background.tilePositionX += SCROLL_SPEED * 0.016;

    // Move gates and check collisions
    for (let i = this.activeGates.length - 1; i >= 0; i--) {
      const gate = this.activeGates[i];
      gate.container.x -= SCROLL_SPEED * 0.016;

      // Check if capybara passed through gate
      if (!gate.answered && gate.container.x < this.capybara.x) {
        gate.answered = true;
        this.checkAnswer(gate);
      }

      // Remove off-screen gates
      if (gate.container.x < -150) {
        gate.container.destroy();
        this.activeGates.splice(i, 1);
      }
    }

    // Rotation based on velocity
    const velocityY = (this.capybara.body as Phaser.Physics.Arcade.Body)
      .velocity.y;
    this.capybara.setAngle(Phaser.Math.Clamp(velocityY * 0.05, -30, 30));

    // Ceiling check
    if (this.capybara.y < 50) {
      this.capybara.y = 50;
      (this.capybara.body as Phaser.Physics.Arcade.Body).velocity.y = 0;
    }
  }

  private flap(): void {
    if (this.isGameOver) return;

    const capyBody = this.capybara.body as Phaser.Physics.Arcade.Body;

    // Enable gravity on first flap
    if (!capyBody.allowGravity) {
      capyBody.allowGravity = true;
    }

    capyBody.velocity.y = FLAP_VELOCITY;
  }

  private selectNextQuestion(): void {
    // Use adaptive selector if available
    if (this.questionSelector) {
      this.currentQuestion = this.questionSelector(this.questions);
    } else {
      // Fallback to random selection
      const available = this.questions.filter(
        (q) => !this.answeredIds.has(q.id)
      );

      if (available.length === 0) {
        this.answeredIds.clear();
        this.currentQuestion =
          this.questions[Math.floor(Math.random() * this.questions.length)];
      } else {
        this.currentQuestion =
          available[Math.floor(Math.random() * available.length)];
      }
    }

    if (this.currentQuestion) {
      this.questionText.setText(this.currentQuestion.text);
      EventBus.emit(GameEvents.SHOW_HINT, this.currentQuestion);
      this.questionStartTime = Date.now(); // Track response time
    }
  }

  private spawnAnswerGate(): void {
    if (this.isGameOver || !this.currentQuestion) return;

    const question = this.currentQuestion;
    const container = this.add.container(850, 0);
    container.setDepth(5);

    // 3 answer paths (top, middle, bottom)
    const pathYPositions = [180, 300, 420];
    const colors = [0xffd6e0, 0xdde5b6, 0xa2d2ff]; // pink, sage, sky

    question.options.forEach((option, index) => {
      const y = pathYPositions[index];

      // Answer box
      const box = this.add.rectangle(0, y, 140, PATH_HEIGHT - 20, colors[index]);
      box.setStrokeStyle(4, 0x5e503f);

      // Answer text
      const text = this.add.text(0, y, option, {
        fontFamily: "Baloo 2",
        fontSize: "32px",
        color: "#5E503F",
      });
      text.setOrigin(0.5);

      container.add([box, text]);
    });

    // Store gate info
    this.activeGates.push({
      container,
      pathIndex: question.correctIndex,
      answered: false,
    });
  }

  private checkAnswer(gate: AnswerGate): void {
    if (!this.currentQuestion) return;

    // Determine which path capybara is in
    const capyY = this.capybara.y;
    let selectedPath: number;

    if (capyY < 240) {
      selectedPath = 0; // Top
    } else if (capyY < 360) {
      selectedPath = 1; // Middle
    } else {
      selectedPath = 2; // Bottom
    }

    const isCorrect = selectedPath === this.currentQuestion.correctIndex;
    const responseTimeMs = Date.now() - this.questionStartTime;

    if (isCorrect) {
      this.handleCorrect();
    } else {
      this.handleWrong();
      // Emit wrong answer event with details for AI hint
      EventBus.emit(GameEvents.WRONG_ANSWER, {
        question: this.currentQuestion,
        studentAnswerIndex: selectedPath,
      });
    }

    // Record answer with adaptive learning system
    if (this.answerRecorder) {
      this.answerRecorder(this.currentQuestion, isCorrect, responseTimeMs);
    }

    // Mark answered and get next question
    this.answeredIds.add(this.currentQuestion.id);
    EventBus.emit(GameEvents.ANSWER, {
      isCorrect,
      question: this.currentQuestion,
      responseTimeMs,
    });
    this.selectNextQuestion();
  }

  private handleCorrect(): void {
    this.score++;
    EventBus.emit(GameEvents.SCORE_UPDATE, this.score);

    // Visual feedback
    this.cameras.main.flash(200, 100, 255, 100, false); // Green flash

    // Floating "+10" text
    const coinText = this.add.text(this.capybara.x + 50, this.capybara.y - 30, "+10", {
      fontFamily: "Fredoka",
      fontSize: "24px",
      color: "#FFD60A",
    });
    coinText.setDepth(30);
    this.tweens.add({
      targets: coinText,
      y: coinText.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => coinText.destroy(),
    });
  }

  private handleWrong(): void {
    this.lives--;
    EventBus.emit(GameEvents.LIVES_UPDATE, this.lives);

    // Visual feedback
    this.cameras.main.shake(200, 0.015);
    this.cameras.main.flash(200, 255, 77, 109, false); // Red flash

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.isGameOver = true;
    this.gateTimer.destroy();

    const capyBody = this.capybara.body as Phaser.Physics.Arcade.Body;
    capyBody.velocity.y = 0;
    capyBody.allowGravity = false;

    EventBus.emit(GameEvents.GAME_OVER, this.score);

    // Dark overlay
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.5);
    overlay.setDepth(40);

    // Game over text
    const gameOverText = this.add.text(400, 220, "Game Over!", {
      fontFamily: "Fredoka",
      fontSize: "56px",
      color: "#FFFFFF",
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(50);

    const scoreText = this.add.text(400, 290, `Score: ${this.score}`, {
      fontFamily: "Nunito",
      fontSize: "32px",
      color: "#FFFFFF",
    });
    scoreText.setOrigin(0.5);
    scoreText.setDepth(50);

    // Retry button
    const retryBtn = this.add.rectangle(400, 380, 200, 60, 0xdde5b6);
    retryBtn.setStrokeStyle(4, 0x5e503f);
    retryBtn.setInteractive({ useHandCursor: true });
    retryBtn.setDepth(50);
    const retryText = this.add.text(400, 380, "Try Again", {
      fontFamily: "Baloo 2",
      fontSize: "28px",
      color: "#5E503F",
    });
    retryText.setOrigin(0.5);
    retryText.setDepth(50);
    retryBtn.on("pointerdown", () => this.scene.restart());

    // Menu button
    const menuBtn = this.add.rectangle(400, 460, 200, 60, 0xffd6e0);
    menuBtn.setStrokeStyle(4, 0x5e503f);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.setDepth(50);
    const menuText = this.add.text(400, 460, "Menu", {
      fontFamily: "Baloo 2",
      fontSize: "28px",
      color: "#5E503F",
    });
    menuText.setOrigin(0.5);
    menuText.setDepth(50);
    menuBtn.on("pointerdown", () => this.scene.start("Menu"));
  }
}
