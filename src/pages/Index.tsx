import Game from '@/game/Game';
import CodeEditor from '@/editor/CodeEditor';
import QuestDialog from '@/components/QuestDialog';
import GameHeader from '@/components/GameHeader';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GameHeader />
      <main className="flex-1 flex items-center justify-center">
        <Game />
      </main>
      <QuestDialog />
      <CodeEditor />
    </div>
  );
};

export default Index;
