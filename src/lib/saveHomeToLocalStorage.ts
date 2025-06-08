const PREFIX = 'currentHome:';

export function saveCurrentHome(homeId: number, staffId: number) {
  const key = PREFIX + staffId;
  localStorage.setItem(key, JSON.stringify({ id: homeId, savedAt: Date.now() }));
}
export function getSavedHome(staffId: number, maxAgeMs = 8 * 60 * 60 * 1000) {
  const raw = localStorage.getItem(PREFIX + staffId);
  if (!raw) return null;
  try {
    const { id, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt < maxAgeMs) return id; // still fresh
  } catch (_) {}
  return null;
}

// housekeeping, only for this staff member
export function clearSavedHome(staffId: number) {
  localStorage.removeItem(PREFIX + staffId);
}
