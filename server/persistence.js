const SUPABASE_URL = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
// Supabase now recommends the server-only secret key. The legacy
// service_role variable remains supported as a fallback for older projects.
const SUPABASE_SECRET_KEY = String(
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ""
);
const GAME_STATE_ID = "active";

function isEnabled() {
  return Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY);
}

function headers() {
  return {
    apikey: SUPABASE_SECRET_KEY,
    Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
    "Content-Type": "application/json"
  };
}

async function loadGameState() {
  if (!isEnabled()) return null;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/game_state?select=state&id=eq.${GAME_STATE_ID}`,
    { headers: headers() }
  );

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(
      `Supabase load failed: HTTP ${response.status} ${responseBody.slice(0, 500)}`
    );
  }

  const rows = responseBody ? JSON.parse(responseBody) : [];
  return rows[0]?.state || null;
}

async function saveGameState(state) {
  if (!isEnabled()) return { enabled: false };

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/game_state?on_conflict=id`,
    {
      method: "POST",
      headers: {
        ...headers(),
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify({
        id: GAME_STATE_ID,
        state,
        updated_at: new Date().toISOString()
      })
    }
  );

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(
      `Supabase save failed: HTTP ${response.status} ${responseBody.slice(0, 500)}`
    );
  }

  return { enabled: true };
}

module.exports = {
  isEnabled,
  loadGameState,
  saveGameState
};
