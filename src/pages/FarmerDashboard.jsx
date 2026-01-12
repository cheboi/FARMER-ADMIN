import { useEffect, useState } from "react";
import api from "../api/axios";

import {
  FiLogOut,
  FiUser,
  FiMap,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { GiPlantSeed, GiWheat, GiCow } from "react-icons/gi";

export default function FarmerDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/farmers/me")
      .then((res) => setData(res.data))
      .catch(() => logout());
  }, []);

  async function getMyStatus(req, res) {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        `SELECT
        first_name,
        last_name,
        farm_size,
        crop_type,
        livestock_type,
        status,
        revoke_reason,
        revoked_at
      FROM farmers
      WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Farmer profile not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  if (!data) return <p style={{ padding: 24 }}>Loading dashboard...</p>;

  return (
    <div className="farmer-card">
      {/* HEADER */}
      <div className="farmer-header">
        <h2>
          <GiPlantSeed /> Ukulima Sahi – Farmer Dashboard
        </h2>

        <button className="logout-btn" onClick={logout}>
          <FiLogOut /> Logout
        </button>
      </div>

      {/* DETAILS */}
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
          {data.status === "pending" && (
            <>
              <FiClock /> Pending
            </>
          )}
          {data.status === "certified" && (
            <>
              <FiCheckCircle /> Certified
            </>
          )}
          {data.status === "revoked" && (
            <>
              <FiAlertTriangle /> Revoked
            </>
          )}
        </span>
      </p>

      {/* CERTIFICATION MESSAGE */}
      {data.status === "revoked" && (
        <div className="certificate error">
          <FiAlertTriangle size={20} />
          <h3>Certification Revoked</h3>
          <p>Your certification has been revoked.</p>

          {data.revoke_reason && (
            <p>
              <strong>Reason:</strong> {data.revoke_reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
