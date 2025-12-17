export const VS_STATUS = {
  LOBBY: "lobby",
  COUNTDOWN: "countdown",
  IN_PROGRESS: "in_progress",
  ENDED: "ended",
};

export const vsMatchPath = (matchId) => `/vs/matches/${matchId}`;
export const vsPlayersPath = (matchId) => `/vs/matches/${matchId}/players`;
export const vsPlayerPath = (matchId, playerId) =>
  `/vs/matches/${matchId}/players/${playerId}`;
export const vsKicksPath = (matchId) => `/vs/matches/${matchId}/kicks`;
export const vsKickPath = (matchId, playerId) =>
  `/vs/matches/${matchId}/kicks/${playerId}`;

export const vsQueuePath = () => `/vs/queues/public`;
export const vsQueuePlayerPath = (playerId) => `/vs/queues/public/${playerId}`;

export const makePlayerId = (agwAddress) =>
  String(agwAddress || "").toLowerCase().trim();

export const shortAddr = (addr = "") =>
  addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;

// short lobby code
export const makeLobbyCode = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase();
