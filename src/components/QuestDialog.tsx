import { useEffect } from "react";
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

const QuestDialog = () => {
  const { showDialog, dialogText, setShowDialog, currentQuest, setShowEditor } =
    useGameStore();

  const isQuestDialog = !!currentQuest;

  // Selalu panggil hook; perilaku dikondisikan di dalam effect
  useEffect(() => {
    if (!showDialog) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showDialog]);

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

        {/* Kotak dialog transparan bergaya retro */}
        <div className="relative flex-1 min-h-[96px]">
          <div
            className="relative w-full bg-black/65 border-2 border-white px-5 py-4 md:px-7 md:py-6 shadow-[0_0_0_4px_rgba(0,0,0,0.5)]"
            /* kalau mau benar-benar kotak, jangan pakai rounded */
          >
            {/* Ornamen sudut kiri-atas */}
            <span className="pointer-events-none absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-white" />
            {/* Ornamen sudut kanan-atas */}
            <span className="pointer-events-none absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-white" />
            {/* Ornamen sudut kiri-bawah */}
            <span className="pointer-events-none absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-white" />
            {/* Ornamen sudut kanan-bawah */}
            <span className="pointer-events-none absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-white" />

            {/* Judul/NPC name (opsional) */}
            <h3 className="font-bold text-base sm:text-lg md:text-xl mb-2 text-white/95 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">
              {currentQuest?.npcName || " "}
            </h3>

            {/* Isi dialog */}
            <p className="text-white/95 text-sm sm:text-base leading-relaxed tracking-wide [text-shadow:0_2px_0_rgba(0,0,0,0.35)]">
              {dialogText}
            </p>

            {/* Objective (hanya saat quest) */}
            {!!currentQuest?.objective && (
              <div className="mt-3 p-3 border border-white/30 bg-white/5 text-white/90">
                <p className="text-xs font-semibold mb-1 text-white/80">
                  Your Objective:
                </p>
                <p className="text-xs">{currentQuest.objective}</p>
              </div>
            )}

            {/* Tombol aksi */}
            <div className="mt-3 md:mt-4 flex gap-2 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium border-2 border-white/80 text-white bg-white/5 hover:bg-white/10 transition"
              >
                Got it!
              </button>

              {isQuestDialog && (
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

        {/* Player portrait (kanan, dibalik supaya menghadap NPC) */}
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
