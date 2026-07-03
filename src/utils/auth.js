export async function isAuthenticated() {
  try {
    const res = await fetch("https://sixsence-backend.onrender.com/me", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) return false;

    const user = await res.json();
    return !!user;
  } catch {
    return false;
  }
}

export async function getUser() {
  const res = await fetch("https://sixsence-backend.onrender.com/me", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) return null;

  return await res.json();
}
