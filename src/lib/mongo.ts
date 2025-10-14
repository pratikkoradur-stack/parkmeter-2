export const getMongoApiUrl = () => {
  return import.meta.env.VITE_MONGO_API_URL || '';
};

export const isMongoApiConfigured = () => {
  const u = getMongoApiUrl();
  return !!u && u !== '';
};

export const fetchVehicles = async (search?: string) => {
  const base = getMongoApiUrl();
  if (!base) return null;
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${base.replace(/\/$/, '')}/vehicles${q}`);
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return await res.json();
};

export const insertVehicle = async (record: any) => {
  const base = getMongoApiUrl();
  if (!base) return null;
  const res = await fetch(`${base.replace(/\/$/, '')}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record)
  });
  if (!res.ok) throw new Error('Failed to insert vehicle');
  return await res.json();
};
