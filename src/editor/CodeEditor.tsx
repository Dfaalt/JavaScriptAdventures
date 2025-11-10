import { useState, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGameStore } from '@/store/gameStore';
import { runCodeInSandbox } from '@/utils/sandbox';
import { Play, Info, CheckCircle2, XCircle } from 'lucide-react';

const CodeEditor = () => {
  const [code, setCode] = useState('// Write your code here\n');
  const [editorFocused, setEditorFocused] = useState(false);

  const {
    showEditor,
    currentQuest,
    currentLevel,
    setDoorOpen,
    completeQuest,
    setCodeOutput,
    setCodeError,
    codeOutput,
    codeError,
    setShowEditor,
    setEditorFocused: setGlobalEditorFocused,
  } = useGameStore();

  // Sinkronkan flag lokal -> global store (fallback)
  useEffect(() => {
    setGlobalEditorFocused(editorFocused);
  }, [editorFocused, setGlobalEditorFocused]);

  // KUNCI: Konfigurasi Monaco agar Space tidak bocor ke Phaser
  const handleEditorMount: OnMount = (editor, monaco) => {
    // Fokus/blur -> update store
    editor.onDidFocusEditorText(() => {
      setEditorFocused(true);
      setGlobalEditorFocused(true);
    });
    editor.onDidBlurEditorText(() => {
      setEditorFocused(false);
      setGlobalEditorFocused(false);
    });

    // Hentikan propagasi Space (dan Enter opsional)
    editor.onKeyDown((e) => {
      if (e.keyCode === monaco.KeyCode.Space || e.keyCode === monaco.KeyCode.Enter) {
        // biarkan editor tetap mengetik, tapi JANGAN teruskan ke window/Phaser
        e.stopPropagation();
      }
    });
  };

  const handleRunCode = () => {
    if (!currentQuest) return;

    // Reset previous output
    setCodeOutput('');
    setCodeError(null);

    // Create sandbox context based on current level
    let context: any = {};

    if (currentLevel === 1) {
      // Level 1: Variables and function calls
      context.openDoor = () => {
        if (code.includes('key') && code.includes('7')) {
          setDoorOpen(true);
          completeQuest();
          setCodeOutput('✨ The ancient door opens! The Keeper nods approvingly as light floods through...');
        } else {
          setCodeError('The door remains sealed. The key must equal 7...');
        }
      };
    } else if (currentLevel === 2) {
      // Level 2: Functions
      context.unlockGate = (result: any) => {
        if (result === 'PORTAL_ACTIVE') {
          setDoorOpen(true);
          completeQuest();
          setCodeOutput('✨ The portal ignites with power! "You understand functions," the Guardian whispers...');
        } else {
          setCodeError('The portal flickers but remains dormant. It needs "PORTAL_ACTIVE"...');
        }
      };
    } else if (currentLevel === 3) {
      // Level 3: Arrays and loops
      context.buildBridge = (count: number) => {
        if (count === 5) {
          setDoorOpen(true);
          completeQuest();
          setCodeOutput('✨ The crystals unite! A bridge of pure light forms across the void!');
        } else {
          setCodeError(`Only ${count} crystals resonate... You need exactly 5 to form the bridge.`);
        }
      };
    } else if (currentLevel === 4) {
      // Level 4: Objects and conditionals
      context.revealTruth = (hero: any) => {
        if (
          hero &&
          typeof hero === 'object' &&
          typeof hero.name === 'string' &&
          typeof hero.level === 'number' &&
          hero.level >= 4 &&
          hero.ready === true
        ) {
          setDoorOpen(true);
          completeQuest();
          setCodeOutput('✨ The mirror glows! Your reflection transforms... "You ARE ready," the voice echoes.');
        } else {
          setCodeError('The mirror remains clouded. Your hero object must have: name (string), level (≥4), and ready (true).');
        }
      };
    } else if (currentLevel === 5) {
      // Level 5: Advanced - filter, loop, and logic
      context.becomeGuardian = (result: number) => {
        // Expected: [7, 9, 11] > 5, sum = 27
        if (result === 27) {
          setDoorOpen(true);
          completeQuest();
          setCodeOutput('✨ ASCENSION COMPLETE! You are now the Guardian of the Realm! The code bends to your will!');
        } else {
          setCodeError(`The cosmic balance shows ${result}, but the answer should be 27 (sum of 7+9+11 from the array).`);
        }
      };
    }

    const result = runCodeInSandbox(code, context);

    if (result.success) {
      if (!codeOutput) {
        setCodeOutput(result.output || 'Code executed');
      }
    } else {
      setCodeError(result.error || 'Error executing code');
    }
  };

  if (!showEditor) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="max-w-4xl w-full mx-4 p-6 border-2 border-primary">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <h3 className="text-xl font-bold text-primary">Code Editor</h3>
            </div>
            <div className="px-3 py-1 bg-quest/20 border border-quest/30 rounded-full">
              <span className="text-sm font-semibold text-quest">Level {currentLevel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRunCode}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Code
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditor(false)}
              className="text-foreground hover:text-primary"
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {currentQuest && !currentQuest.completed && (
          <div className="mb-4 p-3 bg-quest/10 border border-quest/20 rounded-lg flex items-start gap-2">
            <Info className="w-5 h-5 text-quest flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-quest mb-1">Objective:</p>
              <p className="text-sm text-foreground">{currentQuest.objective}</p>
            </div>
          </div>
        )}

        <div
          className="border-2 border-border rounded-lg overflow-hidden mb-4"
          onFocus={() => setEditorFocused(true)}
          onBlur={() => setEditorFocused(false)}
        >
          <Editor
            height="300px"
            defaultLanguage="javascript"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            onMount={handleEditorMount}         
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>

        {codeOutput && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg flex items-start gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{codeOutput}</p>
          </div>
        )}

        {codeError && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2">
            <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{codeError}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CodeEditor;
