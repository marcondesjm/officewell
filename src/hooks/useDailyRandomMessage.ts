const getDateKey = () => new Date().toISOString().split('T')[0];

interface UsedMessages {
  date: string;
  eye: { descriptions: number[]; tipSets: number[] };
  stretch: { descriptions: number[]; tipSets: number[] };
  water: { descriptions: number[]; tipSets: number[] };
}

const STORAGE_KEY = "usedDailyMessages";

const loadUsedMessages = (): UsedMessages => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === getDateKey()) {
        return data;
      }
    }
  } catch {
    // ignore
  }
  // Reset for new day
  return {
    date: getDateKey(),
    eye: { descriptions: [], tipSets: [] },
    stretch: { descriptions: [], tipSets: [] },
    water: { descriptions: [], tipSets: [] },
  };
};

const saveUsedMessages = (data: UsedMessages) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getRandomIndex = (
  type: "eye" | "stretch" | "water",
  category: "descriptions" | "tipSets",
  totalItems: number
): number => {
  const used = loadUsedMessages();
  const usedIndices = used[type][category];

  // If all have been used, reset for this category
  if (usedIndices.length >= totalItems) {
    used[type][category] = [];
  }

  // Get available indices
  const available = Array.from({ length: totalItems }, (_, i) => i)
    .filter(i => !used[type][category].includes(i));

  // Pick random from available
  const randomIdx = available[Math.floor(Math.random() * available.length)];

  // Mark as used
  used[type][category].push(randomIdx);
  used.date = getDateKey();
  saveUsedMessages(used);

  return randomIdx;
};
