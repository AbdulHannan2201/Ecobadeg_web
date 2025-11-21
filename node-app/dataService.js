export const getDashboardData = () => {
  return {
    ecoScore: 85,
    trend: "+5pts week over week",
    wallet: {
      points: 1540,
      nextReward: "Master Tuner Badge",
    },
    trips: [
      { name: "Morning Commute", score: 92, tone: "positive" },
      { name: "Weekend Highway", score: 78, tone: "neutral" },
      { name: "City Errands", score: 88, tone: "positive" },
    ],
    metrics: [
      {
        label: "CO₂ per km",
        value: "1.2 kg",
        trend: "-3% vs avg",
        icon: "cloud",
        accent: "green",
      },
      {
        label: "NOₓ per km",
        value: "0.05 g",
        trend: "+15% vs last trip",
        icon: "flame",
        accent: "amber",
      },
    ],
    badges: [
      { label: "Green Driver", status: "Achieved", icon: "leaf", accent: "green" },
      { label: "Bronze Commuter", status: "Achieved", icon: "award", accent: "amber" },
      { label: "Carbon Champion", status: "Locked", icon: "lock", accent: "slate" },
    ],
    emissionsHistory: [
      { label: "Mon", co2: 1.3, co: 0.06 },
      { label: "Tue", co2: 1.1, co: 0.05 },
      { label: "Wed", co2: 1.4, co: 0.07 },
      { label: "Thu", co2: 1.0, co: 0.04 },
      { label: "Fri", co2: 1.2, co: 0.05 },
      { label: "Sat", co2: 1.5, co: 0.08 },
      { label: "Sun", co2: 1.1, co: 0.05 },
    ],
    gasLevels: {
      co2: 1.2,
      co: 0.05,
    },
  };
};
