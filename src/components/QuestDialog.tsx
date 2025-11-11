import { useGameStore } from "@/store/gameStore";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MARGIN = 12;
const OFFSET = 16; // jarak dari NPC

const QuestDialog = () => {
  const {
    showDialog,
    dialogText,
    setShowDialog,
    currentQuest,
    npcPosition,
    setShowEditor,
  } = useGameStore();
  const [pos, setPos] = useState({ x: 0, y: 0, above: false });
  const boxRef = useRef<HTMLDivElement>(null);

  // hitung posisi setelah elemen ter-render agar dapat ukuran aktual
  const recompute = () => {
    const box = boxRef.current;
    if (!box) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const w = box.offsetWidth;
    const h = box.offsetHeight;

    // default: di bawah NPC
    let above = false;
    let x = npcPosition.x - w / 2;
    let y = npcPosition.y + OFFSET;

    // kalau mentok bawah → pindah di atas NPC
    if (y + h + MARGIN > vh) {
      above = true;
      y = npcPosition.y - OFFSET - h;
    }

    // clamp kiri/kanan/atas/bawah
    x = Math.max(MARGIN, Math.min(x, vw - w - MARGIN));
    y = Math.max(MARGIN, Math.min(y, vh - h - MARGIN));

    setPos({ x, y, above });
  };

  useLayoutEffect(() => {
    if (!showDialog) return;
    // hitung saat muncul
    recompute();
  }, [showDialog, npcPosition.x, npcPosition.y]);

  useEffect(() => {
    if (!showDialog) return;
    const onResize = () => recompute();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [showDialog]);

  if (!showDialog) return null;

  return (
    <div
      // gunakan absolute agar patuh ke koordinat layar yang kita hitung
      className="absolute z-40"
      style={{ left: pos.x, top: pos.y }}
      ref={boxRef}
    >
      {/* panah yang menyesuaikan posisi */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-l-transparent border-r-transparent ${
          pos.above
            ? "bottom-[-10px] border-t-[10px]"
            : "-top-[10px] border-b-[10px]"
        }`}
        style={{
          borderTopColor: pos.above ? "#FFC300" : "transparent",
          borderBottomColor: pos.above ? "transparent" : "#FFC300",
        }}
      />

      {/* kotak dialog */}
      <div
        className="relative rounded-lg p-5 shadow-2xl backdrop-blur-sm max-w-[420px]"
        style={{
          backgroundColor: "rgba(0,0,0,0.85)",
          border: "2px solid #FFC300",
        }}
      >
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "#FFC300" }}
            />
            <h3 className="text-lg font-bold" style={{ color: "#FFC300" }}>
              {currentQuest
                ? `Level ${/* optional */ ""} : ${currentQuest.title}`
                : "Quest"}
            </h3>
          </div>
          <p className="text-sm text-white/80">{dialogText}</p>
        </div>

        {currentQuest && (
          <div
            className="mt-3 rounded-md p-3"
            style={{
              backgroundColor: "rgba(255,195,0,0.08)",
              border: "1px solid rgba(255,195,0,0.3)",
            }}
          >
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: "#FFC300" }}
            >
              Your Objective:
            </p>
            <p className="text-xs text-white/80">{currentQuest.objective}</p>
          </div>
        )}

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={() => setShowDialog(false)}
            className="px-4 py-2 rounded text-sm font-medium transition-all hover:brightness-110"
            style={{ backgroundColor: "#FFC300", color: "#000" }}
          >
            Got it!
          </button>
          <button
            onClick={() => {
              setShowEditor(true);
              setShowDialog(false);
            }}
            className="px-4 py-2 rounded text-sm font-medium transition-all hover:brightness-110"
            style={{ backgroundColor: "#FFC300", color: "#000" }}
          >
            Code Here!
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestDialog;
