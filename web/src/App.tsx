import { useEffect, useState, type JSX } from 'react';
import { DifficultySelect } from '@/components/DifficultySelect';
import { TypingGame } from '@/components/TypingGame';
import { ModeSelect } from '@/components/ModeSelect';
import { MatchView } from '@/components/MatchView';
import { AuthBar } from '@/components/AuthBar';
import { useGameStore } from '@/store/gameStore';
import { useMatchStore } from '@/store/matchStore';

type Mode = 'none' | 'solo' | 'match';

function getModeFromPath(pathname: string): Mode {
  if (pathname.startsWith('/solo')) return 'solo';
  if (pathname.startsWith('/match') || pathname.startsWith('/room/')) return 'match';
  return 'none';
}

function extractRoomId(pathname: string): string | null {
  if (pathname.startsWith('/room/')) {
    const parts = pathname.split('/');
    return parts[2] ?? null;
  }
  return null;
}

function App() {
  const initialPath = window.location.pathname;
  const [mode, setMode] = useState<Mode>(() => getModeFromPath(initialPath));
  const [initialRoomId, setInitialRoomId] = useState<string | null>(() => extractRoomId(initialPath));
  const isPlaying = useGameStore(state => state.isPlaying);
  const resetGame = useGameStore(state => state.resetGame);
  const leaveRoom = useMatchStore(state => state.leaveRoom);

  const handleSelectSolo = () => {
    resetGame();
    leaveRoom();
    window.history.pushState(null, '', '/solo');
    setMode('solo');
  };

  const handleSelectMatch = () => {
    resetGame();
    leaveRoom();
    window.history.pushState(null, '', '/match');
    setMode('match');
  };

  const handleExitSolo = () => {
    resetGame();
    window.history.pushState(null, '', '/');
    setMode('none');
  };

  const handleBackToMode = () => {
    resetGame();
    window.history.pushState(null, '', '/');
    setInitialRoomId(null);
    setMode('none');
  };

  useEffect(() => {
    const handlePopState = () => {
      const { pathname } = window.location;
      setMode(getModeFromPath(pathname));
      setInitialRoomId(extractRoomId(pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  let content: JSX.Element;

  if (mode === 'solo') {
    content = (
      <div className="min-h-screen">
        {isPlaying ? <TypingGame onExit={handleExitSolo} /> : <DifficultySelect onBack={handleBackToMode} />}
      </div>
    );
  } else if (mode === 'match') {
    content = <MatchView onBack={handleBackToMode} initialRoomId={initialRoomId ?? undefined} />;
  } else {
    content = <ModeSelect onSelectSolo={handleSelectSolo} onSelectMatch={handleSelectMatch} />;
  }

  return (
    <>
      <AuthBar />
      {content}
    </>
  );
}

export default App;
