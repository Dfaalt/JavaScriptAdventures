import { create } from "zustand";

export interface Quest {
  id: string;
  title: string;
  description: string;
  objective: string;
  hint: string;
  completed: boolean;
  npcKey: "oracle" | "golem" | "blacksmith" | "sage" | "valkyrie";
  npcName: string;
}

interface GameState {
  currentLevel: number;
  currentQuest: Quest | null;
  showDialog: boolean;
  dialogText: string;
  doorOpen: boolean;
  showEditor: boolean;
  editorFocused: boolean;
  codeOutput: string;
  codeError: string | null;

  setCurrentLevel: (level: number) => void;
  setCurrentQuest: (quest: Quest | null) => void;
  setShowDialog: (show: boolean) => void;
  setDialogText: (text: string) => void;
  setDoorOpen: (open: boolean) => void;
  setShowEditor: (show: boolean) => void;
  setEditorFocused: (focused: boolean) => void;
  setCodeOutput: (output: string) => void;
  setCodeError: (error: string | null) => void;
  completeQuest: () => void;
  nextLevel: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentLevel: 1,
  currentQuest: null,
  showDialog: false,
  dialogText: "",
  doorOpen: false,
  showEditor: false,
  editorFocused: false,
  codeOutput: "",
  codeError: null,

  setCurrentLevel: (level) => set({ currentLevel: level }),
  setCurrentQuest: (quest) => set({ currentQuest: quest }),
  setShowDialog: (show) => set({ showDialog: show }),
  setDialogText: (text) => set({ dialogText: text }),
  setDoorOpen: (open) => set({ doorOpen: open }),
  setShowEditor: (show) => set({ showEditor: show }),
  setEditorFocused: (focused) => set({ editorFocused: focused }),
  setCodeOutput: (output) => set({ codeOutput: output }),
  setCodeError: (error) => set({ codeError: error }),

  completeQuest: () =>
    set((state) => ({
      currentQuest: state.currentQuest
        ? { ...state.currentQuest, completed: true }
        : null,
    })),

  nextLevel: () =>
    set((state) => ({
      currentLevel: state.currentLevel + 1,
      doorOpen: false,
      codeOutput: "",
      codeError: null,
    })),
}));
