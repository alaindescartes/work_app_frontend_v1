export function saveCurrentHome(homeId: number) {
  localStorage.setItem(
    'currentHomeId',
    JSON.stringify({
      id: homeId,
      savedAt: Date.now(),
    })
  );
}

export function getSavedHome(maxAgeMs = 8 * 60 * 60 * 1000) {
  const raw = localStorage.getItem('currentHomeId');
  if (!raw) return null;
  try {
    const { id, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt < maxAgeMs) return id; // still “fresh”
  } catch {
    /* ignore malformed */
  }
  return null;
}

export function clearSavedHome() {
  localStorage.removeItem('currentHomeId');
}
