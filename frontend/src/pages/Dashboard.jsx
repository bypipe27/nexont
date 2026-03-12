import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch {
        // El interceptor de api.js maneja el redirect a /login en caso de 401
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignorar error en logout
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px" }}><p>Cargando...</p></div>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard</h1>

      {user && (
        <p>Bienvenido, {user.firstName} {user.lastName} ({user.email})</p>
      )}

      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}

export default Dashboard;