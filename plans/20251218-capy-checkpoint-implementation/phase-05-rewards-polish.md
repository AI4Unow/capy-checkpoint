# Phase 5: Rewards & Polish

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Depends On:** [Phase 4 - Supabase](./phase-04-supabase-integration.md)
- **Design Guidelines:** [design-guidelines.md](../../docs/design-guidelines.md)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-12-18 |
| Priority | P1 - High |
| Status | pending |
| Description | Yuzu Coins, boutique shop, sound effects, animations, power-ups, PWA |

---

## Key Insights

- Reward frequency: coins on every correct answer (immediate gratification)
- Boutique unlocks: motivate continued play
- Power-ups: provide tactical gameplay variety
- Audio: subtle, not distracting (cottagecore vibes)
- PWA: offline capability, installable, push notifications later

---

## Requirements

### Functional
- F1: Yuzu Coins earned on correct answers (+10 base, bonuses)
- F2: Boutique shop with purchasable items (skins, hats, capes)
- F3: Power-ups: Shield (block 1 wrong), Slow-Mo (5s), Hint
- F4: Sound effects: flap, correct, wrong, coin, level-up
- F5: Animations: Capybara emotions, gate transitions
- F6: PWA manifest + service worker

### Non-Functional
- NF1: Audio loads < 500KB total
- NF2: PWA works offline for core gameplay
- NF3: Shop UI responsive on mobile
- NF4: Animations at 60fps

---

## Architecture

### Coin Economy

```typescript
interface CoinReward {
  baseCorrect: 10;
  streakBonus: 2; // +2 per streak question
  speedBonus: 5; // Answer < 3s
  masteryBonus: 20; // First time mastering subtopic
}

// Total per correct = 10 + (streak * 2) + (fast ? 5 : 0)
// Example: 5th correct in a row, fast = 10 + 10 + 5 = 25 coins
```

### Shop Items

| Category | Item | Cost | Effect |
|----------|------|------|--------|
| Hats | Strawberry | 100 | Cosmetic |
| Hats | Crown | 500 | Cosmetic |
| Hats | Pilot Goggles | 200 | Cosmetic |
| Skins | Golden Capy | 1000 | Cosmetic |
| Skins | Rainbow Capy | 2000 | Cosmetic |
| Capes | Leaf Cape | 300 | Cosmetic |
| Power-up | Shield x3 | 50 | Block 1 wrong answer |
| Power-up | Slow-Mo x3 | 75 | 5s slow motion |
| Power-up | Hint Token x5 | 100 | Show hint on demand |

### Power-Up Implementation

```typescript
interface PowerUp {
  type: 'shield' | 'slowmo' | 'hint';
  count: number;
}

// Shield: Consume on wrong answer, prevent heart loss
// Slow-Mo: Tap to activate, timeScale = 0.5 for 5s
// Hint: Tap to reveal hint text for current question
```

### Audio Files

| Sound | File | Duration | Notes |
|-------|------|----------|-------|
| Flap | flap.mp3 | <100ms | Soft whoosh |
| Correct | correct.mp3 | 300ms | Cheerful chime |
| Wrong | wrong.mp3 | 400ms | Soft "boop" |
| Coin | coin.mp3 | 200ms | Ting! |
| Level Up | levelup.mp3 | 1s | Achievement fanfare |
| BGM | bgm-forest.mp3 | Loop | Calm, cottagecore |

### PWA Configuration

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Capy-Checkpoint',
        short_name: 'CapyMath',
        theme_color: '#FFD6E0',
        background_color: '#FEFAE0',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,mp3,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*supabase.*\/rest/,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 50 } }
          }
        ]
      }
    })
  ]
});
```

### Component Structure
```
src/
├── components/
│   ├── shop/
│   │   ├── Boutique.tsx      # Shop main page
│   │   ├── ShopItem.tsx      # Item card
│   │   └── PurchaseModal.tsx # Confirm purchase
│   ├── PowerUpBar.tsx        # Active power-ups
│   └── CoinDisplay.tsx       # Animated coin counter
├── stores/
│   └── shopStore.ts          # Inventory, purchases
├── assets/
│   ├── audio/               # Sound files
│   └── sprites/             # Capybara variants
└── hooks/
    └── useAudio.ts          # Sound manager
```

---

## Related Code Files

| File | Purpose |
|------|---------|
| `src/components/shop/Boutique.tsx` | Shop UI page |
| `src/components/shop/ShopItem.tsx` | Individual item card |
| `src/components/PowerUpBar.tsx` | Power-up activation UI |
| `src/components/CoinDisplay.tsx` | Coin counter with animation |
| `src/stores/shopStore.ts` | Shop state + inventory |
| `src/hooks/useAudio.ts` | Sound loading + playback |
| `public/manifest.json` | PWA manifest |
| `vite.config.ts` | PWA plugin config |
| `src/game/scenes/Game.ts` | Power-up integration |

---

## Implementation Steps

1. **Implement coin rewards**
   - Update gameStore with coin balance
   - Add coin reward on correct answer
   - Implement streak tracking
   - Show "+10" floating text animation

2. **Create CoinDisplay component**
   ```tsx
   function CoinDisplay({ count }: { count: number }) {
     return (
       <div className="flex items-center gap-2 font-baloo text-2xl text-yellow-500">
         <CoinIcon />
         <AnimatedNumber value={count} />
       </div>
     );
   }
   ```

3. **Create shopStore**
   ```typescript
   interface ShopState {
     ownedItems: string[];
     equippedAvatar: { skin: string; hat: string; cape: string };
     powerUps: { shield: number; slowmo: number; hint: number };

     purchaseItem: (itemId: string, cost: number) => boolean;
     equipItem: (itemId: string, slot: 'skin' | 'hat' | 'cape') => void;
     usePowerUp: (type: 'shield' | 'slowmo' | 'hint') => boolean;
   }
   ```

4. **Create Boutique page**
   - Tab navigation: Hats, Skins, Capes, Power-ups
   - Item grid with lock/owned state
   - Purchase flow with confirmation
   - Equip button for owned items

5. **Create ShopItem component**
   - Item image/preview
   - Name + cost
   - Buy/Equip/Equipped button states
   - Disabled if insufficient coins

6. **Implement power-ups in Game scene**
   ```typescript
   // Shield
   if (isWrong && this.hasShield()) {
     this.consumeShield();
     this.showShieldEffect();
     return; // Don't lose heart
   }

   // Slow-Mo
   activateSlowMo() {
     this.time.timeScale = 0.5;
     this.time.delayedCall(5000, () => {
       this.time.timeScale = 1;
     });
   }

   // Hint
   showHint() {
     EventBus.emit('show-hint', currentQuestion.hint);
   }
   ```

7. **Create PowerUpBar component**
   - 3 buttons: Shield, Slow-Mo, Hint
   - Show count badge
   - Disabled when count = 0
   - Tap to activate

8. **Implement audio system**
   ```typescript
   // src/hooks/useAudio.ts
   const sounds = {
     flap: new Howl({ src: ['/audio/flap.mp3'] }),
     correct: new Howl({ src: ['/audio/correct.mp3'] }),
     wrong: new Howl({ src: ['/audio/wrong.mp3'] }),
     coin: new Howl({ src: ['/audio/coin.mp3'] })
   };

   export function useAudio() {
     const play = (sound: keyof typeof sounds) => sounds[sound].play();
     return { play };
   }
   ```

9. **Add audio to game events**
   - Flap: on pointer down
   - Correct: on correct answer
   - Wrong: on wrong answer
   - Coin: with coin reward display

10. **Create Capybara animation variants**
    - Idle: gentle bob
    - Flapping: wing animation
    - Happy: smile + sparkles (correct)
    - Sad: droopy ears (wrong)
    - Thinking: question mark bubble

11. **Add gate transition animations**
    - Gate approach: subtle glow
    - Correct pass: gate dissolves with particles
    - Wrong pass: gate flashes red

12. **Configure PWA**
    - Install vite-plugin-pwa
    - Create manifest.json with app metadata
    - Add service worker for offline caching
    - Create app icons (192x192, 512x512)

13. **Test PWA installation**
    - Chrome: "Add to Home Screen" prompt
    - iOS Safari: "Add to Home Screen"
    - Verify offline gameplay works

14. **Add mute toggle**
    - Button in HUD/settings
    - Persist preference to localStorage

---

## Todo List

- [ ] Implement coin reward system
- [ ] Create CoinDisplay component with animation
- [ ] Create shopStore for inventory
- [ ] Build Boutique page UI
- [ ] Create ShopItem component
- [ ] Add purchase flow with confirmation
- [ ] Implement Shield power-up
- [ ] Implement Slow-Mo power-up
- [ ] Implement Hint power-up
- [ ] Create PowerUpBar component
- [ ] Implement useAudio hook
- [ ] Source/create sound effects
- [ ] Add audio to game events
- [ ] Create Capybara animation variants
- [ ] Add gate transition effects
- [ ] Configure vite-plugin-pwa
- [ ] Create app icons
- [ ] Test PWA installation
- [ ] Add mute toggle

---

## Success Criteria

- [ ] Coins increment on correct answers
- [ ] Shop displays items with correct states
- [ ] Can purchase and equip items
- [ ] Power-ups work correctly in gameplay
- [ ] Sound effects play appropriately
- [ ] Mute toggle persists
- [ ] PWA installs on mobile/desktop
- [ ] Game works offline after first load

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Audio files too large | Medium | Medium | Compress to 64kbps, use Howler.js sprite |
| Power-ups unbalanced | Medium | Low | Limit purchases, tune costs |
| PWA cache stale | Low | Medium | Force update on version change |
| Shop items not motivating | Medium | Medium | Ask user which items they want |

---

## Security Considerations

- Coin balance validated on server before purchase
- Prevent client-side coin manipulation (future: server validation)
- Service worker only caches public assets

---

## Next Steps

After Phase 5 complete:
1. Proceed to **Phase 6: Content & Testing**
2. Expand question bank to 150+
3. Add all 5 themed worlds
4. Deploy to Vercel
