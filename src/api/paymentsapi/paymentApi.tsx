const BASE_URL =
  (import.meta as any).env?.VITE_API_URL
    ? String((import.meta as any).env.VITE_API_URL).replace(/\/api\/?$/i, '').replace(/\/+$/, '')
    : 'http://localhost:8080';

export const getPaypalClientId = async () => {
  const res = await fetch(`${BASE_URL}/payment/config`);
  const json = await res.json();

  if (!res.ok) throw new Error(json?.message || 'Failed to get PayPal config');
  return json.data; // CLIENT_ID
};
