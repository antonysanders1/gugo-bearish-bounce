import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  Grid,
  TextField,
  Divider,
} from "@mui/material";
import { rtdb } from "../config/firebaseConfig";
import { VS_STATUS, shortAddr, vsMatchPath, makeLobbyCode } from "./vsConstants";
import {
  createPrivateMatch,
  createPublicMatch,
  joinMatch,
  leaveMatch,
  setReady,
  kickPlayer,
  startCountdown,
  finalizeStartIfReady,
  joinPublicQueue,
  leavePublicQueue,
} from "./vsApi";

const panelStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "min(720px, 92vw)",
  bgcolor: "#0f0f14",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  p: 3,
  color: "white",
};

export default function VsLobbyModal({
  open,
  onClose,
  playerId,
  onStartMatch, // ({ matchId, seed, lockedPlayers }) => void
}) {
  const [tab, setTab] = useState("private"); // private | public
  const [matchId, setMatchId] = useState("");
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [match, setMatch] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [queueing, setQueueing] = useState(false);
  const [countdownLeft, setCountdownLeft] = useState(null);

  const isHost = useMemo(
    () => !!match && match.hostId === playerId,
    [match, playerId]
  );

  const playersArr = useMemo(() => {
    const p = match?.players || {};
    return Object.keys(p).map((id) => p[id]).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
  }, [match]);

  // subscribe to match when activeMatchId changes
  useEffect(() => {
    if (!activeMatchId) return;
    const ref = rtdb.ref(vsMatchPath(activeMatchId));
    const onVal = (snap) => {
      const v = snap.val();
      setMatch(v);

      // if we got kicked (we're not in players)
      const players = v?.players || {};
      if (v && !players[playerId] && v.status !== VS_STATUS.ENDED) {
        setActiveMatchId(null);
        setMatch(null);
      }
    };
    ref.on("value", onVal);
    return () => ref.off("value", onVal);
  }, [activeMatchId, playerId]);

  // countdown timer UI
  useEffect(() => {
    if (!match || match.status !== VS_STATUS.COUNTDOWN) {
      setCountdownLeft(null);
      return;
    }
    const endsAt = match.countdown?.endsAt;
    if (!endsAt) return;

    const tick = () => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setCountdownLeft(left);
    };

    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [match]);

  // finalize countdown when it hits 0 (host-authoritative MVP)
  useEffect(() => {
    if (!match || !isHost) return;
    if (match.status !== VS_STATUS.COUNTDOWN) return;
    if (countdownLeft == null) return;
    if (countdownLeft > 0) return;

    (async () => {
      const res = await finalizeStartIfReady({ matchId: activeMatchId });
      if (res.ok) {
        onStartMatch({
          matchId: activeMatchId,
          seed: match.seed,
          lockedPlayers: res.lockedPlayers,
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdownLeft]);

  // if match becomes in_progress, start
  useEffect(() => {
    if (!match) return;
    if (match.status !== VS_STATUS.IN_PROGRESS) return;

    const lockedPlayers = match.settings?.lockedPlayers || [];
    onStartMatch({
      matchId: activeMatchId,
      seed: match.seed,
      lockedPlayers,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.status]);

  const me = match?.players?.[playerId];

  const handleCreatePrivate = async () => {
    const { matchId: id } = await createPrivateMatch({ hostId: playerId, maxPlayers });
    setActiveMatchId(id);
    setJoinCode(id);
  };

  const handleCreatePublic = async () => {
    const { matchId: id } = await createPublicMatch({ hostId: playerId, maxPlayers });
    setActiveMatchId(id);
    setJoinCode(id);
  };

  const handleJoin = async (code) => {
    const id = String(code || "").trim().toUpperCase();
    if (!id) return;
    const res = await joinMatch({ matchId: id, playerId });
    if (res.ok) {
      setActiveMatchId(id);
      setJoinCode(id);
    } else {
      alert(
        res.reason === "kicked"
          ? "You were kicked from this lobby."
          : res.reason === "full"
          ? "Lobby is full."
          : res.reason === "already_started"
          ? "Match already started."
          : "Lobby not found."
      );
    }
  };

  const handleLeave = async () => {
    if (!activeMatchId) return;
    await leaveMatch({ matchId: activeMatchId, playerId });
    setActiveMatchId(null);
    setMatch(null);
  };

  const handleReadyToggle = async () => {
    if (!activeMatchId) return;
    await setReady({ matchId: activeMatchId, playerId, ready: !me?.ready });
  };

  const handleKick = async (targetId) => {
    if (!activeMatchId) return;
    await kickPlayer({ matchId: activeMatchId, hostId: playerId, targetPlayerId: targetId });
  };

  const handleStart = async () => {
    if (!activeMatchId || !match) return;
    const players = match.players || {};
    const ids = Object.keys(players);

    if (ids.length < 2) {
      alert("Need at least 2 players to start.");
      return;
    }

    // if full OR everyone ready, start immediately; else countdown 10 seconds
    const max = match.settings?.maxPlayers ?? 2;
    const everyoneReady = ids.every((id) => !!players[id]?.ready);
    const isFull = ids.length >= max;

    if (isFull || everyoneReady) {
      const res = await finalizeStartIfReady({ matchId: activeMatchId });
      if (res.ok) {
        onStartMatch({ matchId: activeMatchId, seed: match.seed, lockedPlayers: res.lockedPlayers });
      }
    } else {
      await startCountdown({ matchId: activeMatchId, hostId: playerId });
    }
  };

  const handleFindPublic = async () => {
    // MVP: queue, then create a public lobby for now (we’ll enhance to join existing open lobbies next)
    setQueueing(true);
    await joinPublicQueue({ playerId });

    // small delay so you can see “queueing”
    setTimeout(async () => {
      await leavePublicQueue({ playerId });
      const { matchId: id } = await createPublicMatch({ hostId: playerId, maxPlayers });
      setActiveMatchId(id);
      setJoinCode(id);
      setQueueing(false);
    }, 600);
  };

  const renderLobby = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6">VS Lobby</Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Code: <b>{joinCode || activeMatchId}</b>
            {match?.settings?.isPublic ? " (Public)" : " (Private)"}
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={handleLeave} sx={{ color: "white", borderColor: "rgba(255,255,255,0.2)" }}>
            Leave
          </Button>
          {isHost && (
            <Button variant="contained" onClick={handleStart}>
              {match?.status === VS_STATUS.COUNTDOWN ? "Starting..." : "Start"}
            </Button>
          )}
        </Box>
      </Box>

      {match?.status === VS_STATUS.COUNTDOWN && (
        <Box mt={2} p={2} sx={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2 }}>
          <Typography variant="body1">
            Match starting in <b>{countdownLeft ?? "…"}</b>
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Roster will lock at 0 (must be at least 2 players).
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.12)" }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1">
          Players ({playersArr.length}/{match?.settings?.maxPlayers ?? 2})
        </Typography>

        <Button variant="outlined" onClick={handleReadyToggle} sx={{ color: "white", borderColor: "rgba(255,255,255,0.2)" }}>
          {me?.ready ? "Unready" : "Ready"}
        </Button>
      </Box>

      <Box mt={1}>
        {playersArr.map((p) => {
          const id = p.playerId;
          const isMe = id === playerId;
          const isPHost = id === match.hostId;

          return (
            <Box
              key={id}
              mt={1}
              p={1.5}
              sx={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="body1">
                  {isMe ? "You" : shortAddr(id)} {isPHost ? " (Host)" : ""}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {p.ready ? "✅ Ready" : "⏳ Not Ready"}
                </Typography>
              </Box>

              {isHost && !isMe && (
                <Button
                  variant="outlined"
                  onClick={() => handleKick(id)}
                  sx={{ color: "white", borderColor: "rgba(255,255,255,0.2)" }}
                >
                  Kick
                </Button>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  const renderStart = () => (
    <Box>
      <Typography variant="h6">VS Mode</Typography>
      <Typography variant="body2" sx={{ opacity: 0.85, mb: 2 }}>
        Private lobbies (code) or Public matchmaking (ready-up lobby).
      </Typography>

      <Box display="flex" gap={1} mb={2}>
        <Button
          variant={tab === "private" ? "contained" : "outlined"}
          onClick={() => setTab("private")}
          sx={tab !== "private" ? { color: "white", borderColor: "rgba(255,255,255,0.2)" } : {}}
        >
          Private
        </Button>
        <Button
          variant={tab === "public" ? "contained" : "outlined"}
          onClick={() => setTab("public")}
          sx={tab !== "public" ? { color: "white", borderColor: "rgba(255,255,255,0.2)" } : {}}
        >
          Public
        </Button>
      </Box>

      <Box mb={2}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Max Players (Host)
        </Typography>
        <Box display="flex" gap={1}>
          {[2, 3, 4].map((n) => (
            <Button
              key={n}
              variant={maxPlayers === n ? "contained" : "outlined"}
              onClick={() => setMaxPlayers(n)}
              sx={maxPlayers !== n ? { color: "white", borderColor: "rgba(255,255,255,0.2)" } : {}}
            >
              {n}
            </Button>
          ))}
        </Box>
      </Box>

      <Grid container spacing={2}>
        {tab === "private" ? (
          <>
            <Grid item xs={12} md={6}>
              <Box p={2} sx={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2 }}>
                <Typography variant="subtitle1">Create Private Lobby</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Share the code with friends.
                </Typography>
                <Box mt={2}>
                  <Button fullWidth variant="contained" onClick={handleCreatePrivate}>
                    Create
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box p={2} sx={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2 }}>
                <Typography variant="subtitle1">Join Private Lobby</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Enter lobby code.
                </Typography>
                <Box mt={2} display="flex" gap={1}>
                  <TextField
                    value={matchId}
                    onChange={(e) => setMatchId(e.target.value.toUpperCase())}
                    size="small"
                    placeholder="AB12CD"
                    fullWidth
                    InputProps={{ sx: { color: "white" } }}
                  />
                  <Button variant="contained" onClick={() => handleJoin(matchId)}>
                    Join
                  </Button>
                </Box>
              </Box>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} md={6}>
              <Box p={2} sx={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2 }}>
                <Typography variant="subtitle1">Find Public Match</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  You’ll enter a lobby and ready up (no auto-start).
                </Typography>
                <Box mt={2}>
                  <Button fullWidth variant="contained" onClick={handleFindPublic} disabled={queueing}>
                    {queueing ? "Finding..." : "Find Match"}
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box p={2} sx={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2 }}>
                <Typography variant="subtitle1">Create Public Lobby</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Host a public lobby others can join (we’ll add browsing next).
                </Typography>
                <Box mt={2}>
                  <Button fullWidth variant="outlined" onClick={handleCreatePublic} sx={{ color: "white", borderColor: "rgba(255,255,255,0.2)" }}>
                    Create Public Lobby
                  </Button>
                </Box>
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={panelStyle}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">VS</Typography>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ color: "white", borderColor: "rgba(255,255,255,0.2)" }}
          >
            Close
          </Button>
        </Box>

        {!activeMatchId ? renderStart() : renderLobby()}
      </Box>
    </Modal>
  );
}
