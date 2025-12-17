import firebase from "../config/firebaseConfig"; // default export is firebase compat instance
import { rtdb } from "../config/firebaseConfig";
import {
  VS_STATUS,
  vsMatchPath,
  vsPlayersPath,
  vsPlayerPath,
  vsKickPath,
  vsQueuePlayerPath,
  makeLobbyCode,
} from "./vsConstants";

const now = () => Date.now();

const ref = (path) => rtdb.ref(path);

export async function createPrivateMatch({ hostId, maxPlayers }) {
  const matchId = makeLobbyCode();
  const seed = Math.floor(Math.random() * 2_000_000_000);

  const match = {
    status: VS_STATUS.LOBBY,
    hostId,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    seed,
    settings: {
      maxPlayers,
      lockedPlayers: [],
      isPublic: false,
    },
    countdown: { active: false, endsAt: null, startedBy: null },
    players: {
      [hostId]: {
        playerId: hostId,
        joinedAt: firebase.database.ServerValue.TIMESTAMP,
        connected: true,
        ready: false,
        lastSeen: firebase.database.ServerValue.TIMESTAMP,
        score: 0,
        highestY: 0,
        gameOver: false,
      },
    },
    kicks: {},
  };

  await ref(vsMatchPath(matchId)).set(match);
  return { matchId, seed };
}

export async function createPublicMatch({ hostId, maxPlayers }) {
  const matchId = makeLobbyCode();
  const seed = Math.floor(Math.random() * 2_000_000_000);

  const match = {
    status: VS_STATUS.LOBBY,
    hostId,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    seed,
    settings: {
      maxPlayers,
      lockedPlayers: [],
      isPublic: true,
    },
    countdown: { active: false, endsAt: null, startedBy: null },
    players: {
      [hostId]: {
        playerId: hostId,
        joinedAt: firebase.database.ServerValue.TIMESTAMP,
        connected: true,
        ready: false,
        lastSeen: firebase.database.ServerValue.TIMESTAMP,
        score: 0,
        highestY: 0,
        gameOver: false,
      },
    },
    kicks: {},
  };

  await ref(vsMatchPath(matchId)).set(match);
  return { matchId, seed };
}

export async function joinMatch({ matchId, playerId }) {
  // block if kicked
  const kickSnap = await ref(vsKickPath(matchId, playerId)).get();
  if (kickSnap.exists()) {
    return { ok: false, reason: "kicked" };
  }

  const matchSnap = await ref(vsMatchPath(matchId)).get();
  if (!matchSnap.exists()) return { ok: false, reason: "not_found" };

  const match = matchSnap.val();
  if (match.status !== VS_STATUS.LOBBY && match.status !== VS_STATUS.COUNTDOWN) {
    return { ok: false, reason: "already_started" };
  }

  const players = match.players || {};
  const count = Object.keys(players).length;
  const maxPlayers = match.settings?.maxPlayers ?? 2;

  if (!players[playerId] && count >= maxPlayers) {
    return { ok: false, reason: "full" };
  }

  await ref(vsPlayerPath(matchId, playerId)).update({
    playerId,
    joinedAt: firebase.database.ServerValue.TIMESTAMP,
    connected: true,
    ready: false,
    lastSeen: firebase.database.ServerValue.TIMESTAMP,
    score: 0,
    highestY: 0,
    gameOver: false,
  });

  return { ok: true };
}

export async function leaveMatch({ matchId, playerId }) {
  await ref(vsPlayerPath(matchId, playerId)).remove();
}

export async function setReady({ matchId, playerId, ready }) {
  await ref(vsPlayerPath(matchId, playerId)).update({
    ready: !!ready,
    lastSeen: firebase.database.ServerValue.TIMESTAMP,
  });
}

export async function kickPlayer({ matchId, hostId, targetPlayerId }) {
  // remove from players + add kick record
  const updates = {};
  updates[`${vsPlayersPath(matchId)}/${targetPlayerId}`] = null;
  updates[`/vs/matches/${matchId}/kicks/${targetPlayerId}`] = {
    by: hostId,
    at: firebase.database.ServerValue.TIMESTAMP,
    reason: "kicked_by_host",
  };
  await rtdb.ref().update(updates);
}

export async function startCountdown({ matchId, hostId }) {
  const endsAt = now() + 10_000;
  await ref(vsMatchPath(matchId)).update({
    status: VS_STATUS.COUNTDOWN,
    countdown: {
      active: true,
      endsAt,
      startedBy: hostId,
    },
  });
}

export async function cancelCountdown({ matchId }) {
  await ref(vsMatchPath(matchId)).update({
    status: VS_STATUS.LOBBY,
    countdown: { active: false, endsAt: null, startedBy: null },
  });
}

export async function finalizeStartIfReady({ matchId }) {
  // host-authoritative MVP: lock roster at countdown end
  const snap = await ref(vsMatchPath(matchId)).get();
  if (!snap.exists()) return { ok: false, reason: "not_found" };

  const match = snap.val();
  const players = match.players || {};
  const playerIds = Object.keys(players);

  const connectedIds = playerIds.filter((id) => players[id]?.connected !== false);
  if (connectedIds.length < 2) {
    await cancelCountdown({ matchId });
    return { ok: false, reason: "not_enough_players" };
  }

  await ref(vsMatchPath(matchId)).update({
    status: VS_STATUS.IN_PROGRESS,
    "settings.lockedPlayers": connectedIds,
    "settings.maxPlayers": connectedIds.length,
    countdown: { active: false, endsAt: null, startedBy: null },
  });

  return { ok: true, lockedPlayers: connectedIds, seed: match.seed };
}

// Public matchmaking MVP: join queue (no auto-start; ends by joining/creating lobby)
export async function joinPublicQueue({ playerId }) {
  await ref(vsQueuePlayerPath(playerId)).set({
    playerId,
    joinedAt: firebase.database.ServerValue.TIMESTAMP,
  });
}

export async function leavePublicQueue({ playerId }) {
  await ref(vsQueuePlayerPath(playerId)).remove();
}
