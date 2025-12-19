# Track Spec: Core Gameplay Loop with Firebase Integration

## Overview
This track implements the primary "Flappy Bird" style gameplay loop for Capy-Checkpoint, integrating it with the existing question bank in Firebase.

## Objectives
- Connect the Phaser game client to Firebase Firestore.
- Implement a service to fetch and cache math questions.
- Create the core "Fly-through-Gate" mechanic.
- Implement the Capybara character with "Cheerful Explorer" personality.
- Integrate basic game state (score, life, progression).

## Requirements
- **Firebase Connection:** Securely fetch questions from the 'questions' collection.
- **Adaptive Selection:** Initial implementation of simple level-based selection from the question bank.
- **Game Physics:** Smooth Flappy Bird-style flight mechanics using Phaser Arcade Physics.
- **Answer Gates:** A 3-path gate system where one path is correct and two are incorrect.
- **Visual Feedback:** Sparkles for correct answers, immediate tumble and respawn for incorrect ones.

## Success Criteria
- Player can control the Capybara using click/tap.
- Correct answers allow passage; incorrect answers trigger a respawn.
- Questions are dynamically loaded from Firebase.
- Basic HUD shows current score and math problem.
