import { useEffect, useState } from "react";

export default function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("session");
    if (!token) return;

    fetch("https://sixsence-backend.onrender.com/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return user;
}
