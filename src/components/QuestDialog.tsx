import { useEffect, useMemo, useRef, useState } from "react";
import { useGameStore } from "@/store/gameStore";

// (Opsional) ganti path sesuai struktur asetmu
const getNpcPortraitSrc = (npcKey?: string) => {
  const map: Record<string, string> = {
    oracle: "/assets/npc/oracle/0_Dark_Oracle_Idle Blinking_000.png",
    golem: "/assets/npc/golem/0_Golem_Idle Blinking_000.png",
    blacksmith: "/assets/npc/blacksmith/0_Blacksmith_Idle Blinking_000.png",
    sage: "/assets/npc/sage/0_Sage_Idle Blinking_000.png",
    valkyrie: "/assets/npc/valkyrie/0_Valkyrie_Idle Blinking_000.png",
  };
  return npcKey && map[npcKey] ? map[npcKey] : "";
};

const PLAYER_PORTRAIT =
  "/assets/characters/viking/Left - Idle Blinking_007.png";

const TYPE_SPEED = 17; // ms per karakter (rasa JRPG)
const FAST_SPEED = 5; // saat user spam buka tutup dialog, masih cepat

const QuestDialog = () => {
  const { showDialog, dialogText, setShowDialog, currentQuest, setShowEditor } =
    useGameStore();

  // Flag untuk aturan tampil UI
  const isHint =
    typeof dialogText === "string" &&
    dialogText.trim().toLowerCase().startsWith("hint:");
  const showObjectiveBox = !!currentQuest && !currentQuest.completed && isHint;
  const showCodeHereBtn = !!currentQuest && !currentQuest.completed;

  // === Typewriter State ===
  const [typed, setTyped] = useState("");
  const timerRef = useRef<number | null>(null);

  // Jika text panjang & muncul lagi cepat, pakai speed cepat
  const speed = useMemo(() => {
    return dialogText.length > 120 ? FAST_SPEED : TYPE_SPEED;
  }, [dialogText]);

  // Mulai ketik ulang tiap dialog baru / dialog dibuka
  useEffect(() => {
    if (!showDialog) return;
    // lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // reset typewriter
    setTyped("");
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const text =
      typeof dialogText === "string" ? dialogText : String(dialogText ?? "");
    let i = 0;
    timerRef.current = window.setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length && timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, speed) as unknown as number;

    return () => {
      document.body.style.overflow = prev;
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [showDialog, dialogText, speed]);

  // CUKUP cek showDialog agar "Welcome to Level X" tetap muncul
  if (!showDialog) return null;

  const npcSrc = currentQuest ? getNpcPortraitSrc(currentQuest.npcKey) : "";

  const handleClose = () => setShowDialog(false);
  const handleOpenEditor = () => {
    setShowDialog(false);
    setShowEditor(true);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 flex items-end justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-6xl flex items-center justify-between gap-3 sm:gap-4">
        {/* NPC portrait (kiri) */}
        {npcSrc ? (
          <img
            src={npcSrc}
            alt={currentQuest?.npcName || "NPC"}
            className="h-24 sm:h-32 md:h-40 object-contain select-none"
            draggable={false}
          />
        ) : (
          <div className="h-24 sm:h-32 md:h-40" />
        )}

        {/* NAMEPLATE + PANEL */}
        <div className="relative flex-1 min-h-[96px]">
          {/* NAMEPLATE (di atas border) */}
          {currentQuest?.npcName && (
            <div className="absolute -top-5 left-6 z-20 flex items-center bg-[#7f2d3a] text-white border-2 border-white px-3 py-1 rounded-md shadow-[0_2px_0_rgba(0,0,0,0.35)]">
              <span className="text-sm font-semibold tracking-wide">
                {currentQuest.npcName}
              </span>
              <span className="ml-2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-[#7f2d3a]" />
            </div>
          )}

          {/* PANEL dialog */}
          <div className="relative z-10 w-full bg-black/65 border-2 border-white px-5 pt-8 pb-5 md:px-7 md:pt-10 md:pb-6 shadow-[0_0_0_4px_rgba(0,0,0,0.5)] overflow-visible">
            {/* ornamen sudut */}
            <span className="pointer-events-none absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-white z-0" />
            <span className="pointer-events-none absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-white z-0" />
            <span className="pointer-events-none absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-white z-0" />
            <span className="pointer-events-none absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-white z-0" />

            {/* isi dialog (TYPEWRITER) */}
            <p className="text-white/95 text-sm sm:text-base leading-relaxed tracking-wide [text-shadow:0_2px_0_rgba(0,0,0,0.35)]">
              {typed}
            </p>

            {/* Objective: hanya saat HINT & belum completed */}
            {showObjectiveBox && (
              <div className="mt-3 p-3 border border-white/30 bg-white/5 text-white/90">
                <p className="text-xs font-semibold mb-1 text-white/80">
                  Your Objective:
                </p>
                <p className="text-xs">{currentQuest!.objective}</p>
              </div>
            )}

            <div className="mt-3 md:mt-4 flex gap-2 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium border-2 border-white/80 text-white bg-white/5 hover:bg-white/10 transition"
              >
                Got it!
              </button>

              {/* Code Here: sembunyikan saat quest completed */}
              {showCodeHereBtn && (
                <button
                  onClick={handleOpenEditor}
                  className="px-4 py-2 text-sm font-medium border-2 border-white text-black bg-white hover:bg-white/90 transition"
                >
                  Code Here!
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Player portrait (kanan) */}
        <img
          src={PLAYER_PORTRAIT}
          alt="Player"
          className="h-24 sm:h-32 md:h-40 object-contain select-none"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default QuestDialog;
