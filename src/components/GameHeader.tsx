import { Code2, Sword } from "lucide-react";
import { Button } from "./ui/button";
import { useGameStore } from "@/store/gameStore";

const GameHeader = () => {
  const { setShowEditor, currentLevel } = useGameStore();

  return (
    <header className="w-full bg-card border-b-2 border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sword className="w-6 h-6 text-primary" />
              <Code2 className="w-6 h-6 text-quest" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                JavaScript Adventure Quest
              </h1>
              <p className="text-sm text-muted-foreground">
                Learn coding through epic adventures
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-quest/20 border border-quest/30 rounded-full">
              <div className="w-2 h-2 bg-quest rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-quest">
                Level {currentLevel}
              </span>
            </div>
            <Button
              onClick={() => setShowEditor(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Code2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Open Editor</span>
              <span className="sm:hidden">Editor</span>
            </Button>
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-secondary rounded border border-border">
                  WASD
                </kbd>
                <span>Move</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-secondary rounded border border-border">
                  Space
                </kbd>
                <span>Interact</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
