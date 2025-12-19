import { PhaserGame } from './game/PhaserGame';
import { GameHUD } from './components/GameHUD';

function App() {
  return (
    <div className="relative w-full max-w-[800px] aspect-[4/3] rounded-[40px] border-[12px] border-text overflow-hidden shadow-2xl">
      <GameHUD />
      <PhaserGame className="w-full h-full" />
    </div>
  );
}

export default App;
