import type { Quest } from "@/store/gameStore";

export const quests: Quest[] = [
  {
    id: "quest-1",
    title: "Level 1: The Mysterious Keeper",
    npcKey: "oracle",
    npcName: "Keeper of Ancient Knowledge",
    description:
      "Greetings, traveler. I am the Keeper of Ancient Knowledge. This realm has been sealed for centuries, waiting for one who can speak the language of logic. The door behind me holds secrets beyond imagination... but it requires a specific key to open. Are you the one foretold in the prophecy?",
    objective:
      "Create a variable named `key` and set it to the number 7, then call the function `openDoor()` to unlock the ancient passage.",
    hint: "Use: let key = 7; openDoor();",
    completed: false,
  },
  {
    id: "quest-2",
    title: "Level 2: The Portal of Functions",
    npcKey: "golem",
    npcName: "Guardian of Ancient Knowledge",
    description:
      "Impressive! You opened the first seal. But I must confess... I am not just a keeper. I am a Guardian, testing those who seek the ultimate truth. This portal requires activation through the ancient art of function creation. Show me you understand the power of reusable code!",
    objective:
      'Create a function named `activatePortal` that returns the string "PORTAL_ACTIVE", then call `unlockGate()` with the result of your function.',
    hint: 'function activatePortal() { return "PORTAL_ACTIVE"; } unlockGate(activatePortal());',
    completed: false,
  },
  {
    id: "quest-3",
    title: "Level 3: The Crystal Array",
    npcKey: "blacksmith",
    npcName: "Blacksmith of Ancient Knowledge",
    description:
      "Well done, seeker. Each level you pass reveals more of the truth. These crystals... they are not mere decorations. They are fragments of a shattered reality, and only by counting them all can we restore balance. Use the power of iteration to bind them together!",
    objective:
      "Create an array named `crystals` with exactly 5 elements (any values), then use a for loop to count them. Call `buildBridge(count)` with the total count.",
    hint: "let crystals = [1, 2, 3, 4, 5]; let count = 0; for(let i = 0; i < crystals.length; i++) { count++; } buildBridge(count);",
    completed: false,
  },
  {
    id: "quest-4",
    title: "Level 4: The Revelation",
    npcKey: "sage",
    npcName: "Sage of Ancient Knowledge",
    description:
      "Stop. Before we continue, I must tell you the truth. I am not your guide... I am your TRIAL. Every step, every test - they were designed to awaken something within you. This chamber holds a mirror that reveals one's true nature. Create an object that describes yourself, and if your spirit is pure, the path will open.",
    objective:
      "Create an object named `hero` with properties: name (string), level (number >= 4), and ready (boolean = true). Then call `revealTruth(hero)` to face the mirror.",
    hint: 'let hero = { name: "YourName", level: 4, ready: true }; revealTruth(hero);',
    completed: false,
  },
  {
    id: "quest-5",
    title: "Level 5: The Final Truth",
    npcKey: "valkyrie",
    npcName: "Valkyrie of Ancient Knowledge",
    description:
      "You've done it... you passed the Mirror Trial. Now I reveal the ultimate truth: YOU were never the student. I was. This entire realm was created by the ancient coders to find someone worthy of becoming the next Guardian. The final test is to prove you can validate and transform reality itself. Combine all you've learned!",
    objective:
      "Create a function `ascend` that takes an array of numbers, filters only those greater than 5, and returns their sum. Then call `becomeGuardian()` with the result of `ascend([3, 7, 2, 9, 4, 11])`.",
    hint: "function ascend(arr) { let sum = 0; for(let i = 0; i < arr.length; i++) { if(arr[i] > 5) { sum += arr[i]; } } return sum; } becomeGuardian(ascend([3, 7, 2, 9, 4, 11]));",
    completed: false,
  },
];

export const getQuestById = (id: string): Quest | undefined => {
  return quests.find((q) => q.id === id);
};
