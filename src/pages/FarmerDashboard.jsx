import { useEffect, useState } from "react";
import api from "../api/axios.js";

import {
  FiLogOut,
  FiUser,
  FiMap,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { GiPlantSeed, GiWheat, GiCow } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      try {
        const res = await api.get("/farmers/me");
        if (mounted) setData(res.data);
      } catch (err) {
        console.error("Failed to fetch farmer data:", err);

        if (err.response?.status === 401) {
          logout();
        }
      }
    };
    fetchStatus();

    return () => {
      mounted = false;
    };
  }, []);

  function logout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  if (!data) return <p style={{ padding: 24 }}>Loading dashboard...</p>;

  return (
    <div className="farmer-card">
      <div className="farmer-header">
        <h2>
          <GiPlantSeed /> Ukulima Sahi Certification Dashboard
        </h2>
        <button className="logout-btn" onClick={logout}>
          <FiLogOut /> Logout
        </button>
      </div>

      <p>
        <FiUser /> <strong>Name:</strong> {data.first_name} {data.last_name}
      </p>

      <p>
        <FiMap /> <strong>Farm Size:</strong> {data.farm_size}
      </p>

      <p>
        {data.crop_type ? (
          <>
            <GiWheat /> <strong>Crop Type:</strong> {data.crop_type}
          </>
        ) : (
          <>
            <GiCow /> <strong>Livestock Type:</strong> {data.livestock_type}
          </>
        )}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        <span className={`status ${data.status}`}>
          {data.status === "pending" && <FiClock />}
          {data.status === "certified" && <FiCheckCircle />}
          {data.status === "revoked" && <FiAlertTriangle />}
          {data.status}
        </span>
      </p>

      {data.status === "revoked" && (
        <div className="certificate error">
          <FiAlertTriangle size={20} />
          <h3>Certification Revoked</h3>
          <p>
            <strong>Reason:</strong> {data.revoke_reason}
          </p>
        </div>
      )}
    </div>
  );
}
