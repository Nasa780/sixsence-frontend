export async function isAuthenticated() {
  try {
    const token = localStorage.getItem("session");
    if (!token) return false;

    const res = await fetch("https://sixsence-backend.onrender.com/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return false;

    const user = await res.json();
    return !!user;
  } catch {
    return false;
  }
}

export async function getUser() {
  const token = localStorage.getItem("session");
  if (!token) return null;

  const res = await fetch("https://sixsence-backend.onrender.com/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;

  return await res.json();
}
