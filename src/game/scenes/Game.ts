import Phaser from "phaser";
import { EventBus, GameEvents, type QuestionReason } from "../EventBus";
import { synthSounds } from "../audio/SynthSounds";
import questionsData from "@/data/all-questions.json";
import type { Question } from "@/types/question";
import type { QuestionSelection } from "@/engine/questionSelector";
import { getDifficultyLabel } from "@/engine/questionSelector";

const FLAP_VELOCITY = -400; // Faster upward flap
const SCROLL_SPEED = 120; // pixels per second (multiplied by delta ~0.016)
const GATE_SPAWN_INTERVAL = 30000;
const GROUND_Y = 650;
const PATH_HEIGHT = 150; // Height of each answer path
const GATE_SPAWN_X = 3750; // Spawn far right for ~30s answer time at 120 speed

// Game dimensions
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

interface AnswerGate {
  container: Phaser.GameObjects.Container;
  pathIndex: number;
  answered: boolean;
}

// Question selector function passed from React (now returns QuestionSelection)
type QuestionSelector = (questions: Question[]) => QuestionSelection;
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
  private lives = 6;
  private isGameOver = false;
  private isPaused = false;
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
  private studentRating = 800; // Updated from React via setter

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

  /**
   * Set the student rating for difficulty calculation
   */
  setStudentRating(rating: number): void {
    this.studentRating = rating;
  }

  /**
   * Pause the game - stops physics, timers, and emits event
   */
  pauseGame(): void {
    if (this.isGameOver || this.isPaused) return;

    this.isPaused = true;
    this.physics.pause();
    this.time.paused = true;
    EventBus.emit(GameEvents.PAUSE);
  }

  /**
   * Resume the game - restarts physics, timers, and emits event
   */
  resumeGame(): void {
    if (!this.isPaused) return;

    this.isPaused = false;
    this.physics.resume();
    this.time.paused = false;
    EventBus.emit(GameEvents.RESUME);
  }

  /**
   * Toggle pause state
   */
  togglePause(): void {
    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  create(): void {
    this.score = 0;
    this.lives = 6;
    this.isGameOver = false;
    this.activeGates = [];
    this.answeredIds.clear();

    // Background (centered for new dimensions)
    this.background = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, "background");

    // Ground
    this.ground = this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 40, GAME_WIDTH, 80, 0xdde5b6);
    this.physics.add.existing(this.ground, true);

    // Capybara
    this.capybara = this.physics.add.sprite(150, GAME_HEIGHT / 2, "capybara");
    this.capybara.setCollideWorldBounds(true);
    this.capybara.setDepth(10);
    const capyBody = this.capybara.body as Phaser.Physics.Arcade.Body;
    capyBody.setSize(60, 50);
    // Gravity enabled from start - capy will fall immediately
    // Player must flap to stay airborne

    // Create wing flap animation
    if (!this.anims.exists("flap")) {
      this.anims.create({
        key: "flap",
        frames: this.anims.generateFrameNumbers("capybara", { start: 0, end: 2 }),
        frameRate: 12,
        repeat: -1,
        yoyo: true,
      });
    }
    this.capybara.play("flap");

    // Ground collision - lose a life but continue if lives remain
    this.physics.add.collider(this.capybara, this.ground, () => {
      if (!this.isGameOver && !this.isPaused) this.handleGroundHit();
    });

    // Input - flap controls (space or tap on LEFT side of screen only)
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // Only register flap if tap is on left half of screen (near capy)
      if (pointer.x < GAME_WIDTH / 2) {
        this.flap();
      }
    });
    this.input.keyboard?.on("keydown-SPACE", () => this.flap());

    // ESC key to pause/resume
    this.input.keyboard?.on("keydown-ESC", () => this.togglePause());

    // Listen for pause/resume events from React
    EventBus.on(GameEvents.PAUSE, () => {
      if (!this.isPaused) this.pauseGame();
    });
    EventBus.on(GameEvents.RESUME, () => {
      if (this.isPaused) this.resumeGame();
    });

    // Question text (positioned below HUD area)
    this.questionText = this.add.text(GAME_WIDTH / 2, 110, "", {
      fontFamily: "Fredoka",
      fontSize: "32px",
      color: "#5E503F",
      backgroundColor: "#FFFFFF",
      padding: { x: 24, y: 14 },
      wordWrap: { width: GAME_WIDTH - 100 },
      align: "center",
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
    if (this.isGameOver || this.isPaused) return;

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
    if (this.isGameOver || this.isPaused) return;

    const capyBody = this.capybara.body as Phaser.Physics.Arcade.Body;
    capyBody.velocity.y = FLAP_VELOCITY;
    synthSounds.playFlap();
  }

  private selectNextQuestion(): void {
    // Use adaptive selector if available
    if (this.questionSelector) {
      const selection = this.questionSelector(this.questions);
      this.currentQuestion = selection.question;

      // Emit question reason event
      EventBus.emit(GameEvents.QUESTION_REASON, {
        reason: selection.reason,
        subtopic: selection.question.subtopic,
      });

      // Emit difficulty change event
      const difficultyLevel = getDifficultyLabel(
        selection.question.difficulty,
        this.studentRating
      );
      EventBus.emit(GameEvents.DIFFICULTY_CHANGE, { level: difficultyLevel });
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

      // Emit events for fallback selection
      if (this.currentQuestion) {
        EventBus.emit(GameEvents.QUESTION_REASON, {
          reason: "random" as QuestionReason,
          subtopic: this.currentQuestion.subtopic,
        });
        const difficultyLevel = getDifficultyLabel(
          this.currentQuestion.difficulty,
          this.studentRating
        );
        EventBus.emit(GameEvents.DIFFICULTY_CHANGE, { level: difficultyLevel });
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

    // Don't spawn if there's already an unanswered gate on screen
    const hasActiveGate = this.activeGates.some(gate => !gate.answered);
    if (hasActiveGate) return;

    const question = this.currentQuestion;
    const container = this.add.container(GATE_SPAWN_X, 0);
    container.setDepth(5);

    // 3 answer paths (top, middle, bottom) - adjusted for 720p height
    const pathYPositions = [220, 380, 540];
    const colors = [0xffd6e0, 0xdde5b6, 0xa2d2ff]; // pink, sage, sky

    question.options.forEach((option, index) => {
      const y = pathYPositions[index];

      // Answer box (wider for bigger text)
      const box = this.add.rectangle(0, y, 280, PATH_HEIGHT - 10, colors[index]);
      box.setStrokeStyle(4, 0x5e503f);

      // Answer text (very large font for easy reading)
      const text = this.add.text(0, y, option, {
        fontFamily: "Fredoka, Arial, sans-serif",
        fontSize: "64px",
        fontStyle: "bold",
        color: "#5E503F",
        wordWrap: { width: 260 },
        align: "center",
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

  private checkAnswer(_gate: AnswerGate): void {
    if (!this.currentQuestion) return;

    // Determine which path capybara is in (adjusted for 720p)
    const capyY = this.capybara.y;
    let selectedPath: number;

    if (capyY < 300) {
      selectedPath = 0; // Top
    } else if (capyY < 460) {
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

    // Spawn new gate after a short delay for the answered gate to clear
    this.time.delayedCall(500, () => {
      this.spawnAnswerGate();
    });
  }

  private handleCorrect(): void {
    this.score++;
    EventBus.emit(GameEvents.SCORE_UPDATE, this.score);
    synthSounds.playCorrect();

    // Emit capy reaction
    EventBus.emit(GameEvents.CAPY_REACT, { type: "happy" });

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
    synthSounds.playWrong();

    // Emit capy reaction
    EventBus.emit(GameEvents.CAPY_REACT, { type: "sad" });

    // Visual feedback
    this.cameras.main.shake(200, 0.015);
    this.cameras.main.flash(200, 255, 77, 109, false); // Red flash

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  /**
   * Handle ground hit - lose a life, show continue if lives remain
   */
  private handleGroundHit(): void {
    this.lives--;
    EventBus.emit(GameEvents.LIVES_UPDATE, this.lives);
    synthSounds.playWrong();

    // Emit capy reaction
    EventBus.emit(GameEvents.CAPY_REACT, { type: "sad" });

    if (this.lives <= 0) {
      this.gameOver();
      return;
    }

    // Pause game and show continue overlay
    this.isPaused = true;
    this.physics.pause();
    this.time.paused = true;

    const capyBody = this.capybara.body as Phaser.Physics.Arcade.Body;
    capyBody.velocity.y = 0;

    // Visual feedback
    this.cameras.main.shake(200, 0.015);
    this.cameras.main.flash(200, 255, 77, 109, false);

    // Create continue overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.4);
    overlay.setDepth(40);

    // "Oops!" text
    const oopsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, "Oops!", {
      fontFamily: "Fredoka, Arial, sans-serif",
      fontSize: "56px",
      color: "#FFFFFF",
    });
    oopsText.setOrigin(0.5);
    oopsText.setDepth(50);

    // Lives remaining text
    const livesText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `${this.lives} ❤️ remaining`, {
      fontFamily: "Fredoka, Arial, sans-serif",
      fontSize: "36px",
      color: "#FFFFFF",
    });
    livesText.setOrigin(0.5);
    livesText.setDepth(50);

    // Continue button
    const continueBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 280, 70, 0xdde5b6);
    continueBtn.setStrokeStyle(4, 0x5e503f);
    continueBtn.setInteractive({ useHandCursor: true });
    continueBtn.setDepth(50);
    const continueText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, "Continue", {
      fontFamily: "Fredoka, Arial, sans-serif",
      fontSize: "40px",
      fontStyle: "bold",
      color: "#5E503F",
    });
    continueText.setOrigin(0.5);
    continueText.setDepth(50);

    continueBtn.on("pointerover", () => {
      continueBtn.setFillStyle(0xe8f0c0);
      continueBtn.setScale(1.05);
    });
    continueBtn.on("pointerout", () => {
      continueBtn.setFillStyle(0xdde5b6);
      continueBtn.setScale(1);
    });
    continueBtn.on("pointerdown", () => {
      // Remove overlay elements
      overlay.destroy();
      oopsText.destroy();
      livesText.destroy();
      continueBtn.destroy();
      continueText.destroy();

      // Reset capy position and resume
      this.capybara.y = GAME_HEIGHT / 2;
      capyBody.velocity.y = 0;

      // Resume game
      this.isPaused = false;
      this.physics.resume();
      this.time.paused = false;
    });
  }

  private gameOver(): void {
    this.isGameOver = true;
    this.gateTimer.destroy();

    const capyBody = this.capybara.body as Phaser.Physics.Arcade.Body;
    capyBody.velocity.y = 0;
    capyBody.allowGravity = false;

    EventBus.emit(GameEvents.GAME_OVER, this.score);

    // Dark overlay (centered for new dimensions)
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5);
    overlay.setDepth(40);

    // Game over text
    const gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, "Game Over!", {
      fontFamily: "Fredoka, Arial, sans-serif",
      fontSize: "72px",
      color: "#FFFFFF",
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(50);

    const scoreText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Score: ${this.score}`, {
      fontFamily: "Fredoka, Arial, sans-serif",
      fontSize: "44px",
      color: "#FFFFFF",
    });
    scoreText.setOrigin(0.5);
    scoreText.setDepth(50);

    // Retry button
    const retryBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, 280, 70, 0xdde5b6);
    retryBtn.setStrokeStyle(4, 0x5e503f);
    retryBtn.setInteractive({ useHandCursor: true });
    retryBtn.setDepth(50);
    const retryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, "Try Again", {
      fontFamily: "Fredoka, Arial, sans-serif",
      fontSize: "40px",
      fontStyle: "bold",
      color: "#5E503F",
    });
    retryText.setOrigin(0.5);
    retryText.setDepth(50);

    retryBtn.on("pointerover", () => {
      retryBtn.setFillStyle(0xe8f0c0);
      retryBtn.setScale(1.05);
    });
    retryBtn.on("pointerout", () => {
      retryBtn.setFillStyle(0xdde5b6);
      retryBtn.setScale(1);
    });
    retryBtn.on("pointerdown", () => this.scene.restart());

    // Menu button
    const menuBtn = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 180, 280, 70, 0xffd6e0);
    menuBtn.setStrokeStyle(4, 0x5e503f);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.setDepth(50);
    const menuText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 180, "Menu", {
      fontFamily: "Fredoka, Arial, sans-serif",
      fontSize: "40px",
      fontStyle: "bold",
      color: "#5E503F",
    });
    menuText.setOrigin(0.5);
    menuText.setDepth(50);

    menuBtn.on("pointerover", () => {
      menuBtn.setFillStyle(0xffe4ec);
      menuBtn.setScale(1.05);
    });
    menuBtn.on("pointerout", () => {
      menuBtn.setFillStyle(0xffd6e0);
      menuBtn.setScale(1);
    });
    menuBtn.on("pointerdown", () => this.scene.start("Menu"));
  }
}
