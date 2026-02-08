export const API_BASE_URL = "http://localhost:5000";

export const getConfidenceColor = (level: string) => {
  switch (level) {
    case "High":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "Medium":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    default:
      return "text-red-400 bg-red-500/10 border-red-500/20";
  }
};

export const getOffenceIcon = (offenceType: string) => {
  switch (offenceType) {
    case "Theft":
      return "🔓";
    case "Assault":
      return "⚔️";
    case "Cyber Crime":
      return "💻";
    case "Cheating":
      return "🎭";
    case "Harassment":
      return "⚠️";
    default:
      return "📋";
  }
};
