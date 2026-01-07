const BE_URL = "http://localhost:8080"; // đổi theo BE của bạn

export async function getPaypalClientId() {
  const res = await fetch(`${BE_URL}/payment/config`);
  const json = await res.json();

  if (!res.ok) throw new Error(json?.message || "Failed to get PayPal config");
  return json.data; // CLIENT_ID
}
