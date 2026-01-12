import { useEffect, useState } from "react";
import {
  FiLogOut,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiFileText,
  FiEye,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import StatsChart from "../components/StatsChart";
import api from "../api/axios.js";
import "./dashboard.css";

import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

export default function Dashboard() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFarmers();
  }, []);

  async function fetchFarmers() {
    setLoading(true);
    const res = await api.get("/farmers");
    setFarmers(res.data);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await api.patch(`/farmers/${id}/status`, { status });
    fetchFarmers();
  }

  const pending = farmers.filter((f) => f.status === "pending");
  const certified = farmers.filter((f) => f.status === "certified");
  const declined = farmers.filter((f) => f.status === "declined");

  return (
    <div className="dashboard-page">
      {/* Navbar */}
      <div className="navbar">
        <div className="logo">
          <MdDashboard /> Ukulima Sahi Certification Dashboard
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
          }}
        >
          <FiLogOut /> Logout
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Farmers"
          value={farmers.length}
          icon={<FiUsers />}
        />
        <StatCard
          title="Pending Approvals"
          value={pending.length}
          icon={<FiClock />}
        />
        <StatCard
          title="Certified Farmers"
          value={certified.length}
          icon={<FiCheckCircle />}
          green
        />
        <StatCard
          title="Rejected Applications"
          value={declined.length}
          icon={<FiXCircle />}
          red
        />
      </div>

      <div className="main-grid">
        <div className="card">
          <h3>Pending Applications</h3>
          {loading ? (
            "Loading..."
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Farm Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((f) => (
                  <tr key={f.id}>
                    <td>
                      {f.first_name} {f.last_name}
                    </td>
                    <td>{f.crop_type || f.livestock_type}</td>
                    <td>
                      <span className="status pending">Pending</span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn view"
                        onClick={() => {
                          setSelectedFarmer(f);
                          setShowModal(true);
                        }}
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* QUICK STATS */}
        <div className="card quick-stats">
          <h3>Quick Stats</h3>
          <p>
            Active Farmers <span>{certified.length}</span>
          </p>
          <p>
            Awaiting Approval <span>{pending.length}</span>
          </p>
          <p className="danger">
            Rejected <span>{declined.length}</span>
          </p>
          <StatsChart
            certified={certified.length}
            pending={pending.length}
            declined={declined.length}
          />
        </div>
      </div>
      {/* CERTIFIED FARMERS */}
      <div className="card">
        <h3>Certified Farmers</h3>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Farm Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {farmers
              .filter((f) => f.status === "certified")
              .map((f) => (
                <tr key={f.id}>
                  <td>
                    {f.first_name} {f.last_name}
                  </td>
                  <td>{f.crop_type || f.livestock_type}</td>
                  <td>
                    <span className="status certified">Certified</span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn view"
                      onClick={() =>
                        (window.location.href = `/dashboard/farmers/${f.id}`)
                      }
                    >
                      <FiFileText /> View Certificate
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {showModal && selectedFarmer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Farmer Details</h3>

            <p>
              <strong>Name:</strong> {selectedFarmer.first_name}{" "}
              {selectedFarmer.last_name}
            </p>

            <p>
              <strong>Farm Size:</strong> {selectedFarmer.farm_size || "N/A"}{" "}
              acres
            </p>

            <p>
              <strong>Crop Type:</strong> {selectedFarmer.crop_type || "N/A"}
            </p>

            <p>
              <strong>Livestock Type:</strong>{" "}
              {selectedFarmer.livestock_type || "N/A"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className="status pending">Pending</span>
            </p>

            <div className="modal-actions">
              <button
                className="btn approve"
                onClick={() => {
                  updateStatus(selectedFarmer.id, "certified");
                  setShowModal(false);
                }}
              >
                <FiCheck /> Certify
              </button>

              <button
                className="btn reject"
                onClick={() => {
                  updateStatus(selectedFarmer.id, "declined");
                  setShowModal(false);
                }}
              >
                <FiX /> Reject
              </button>

              <button
                className="btn cancel"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, green, red }) {
  return (
    <div className={`stat-card ${green ? "green" : ""} ${red ? "red" : ""}`}>
      <div className="stat-header">
        {icon}
        <p>{title}</p>
      </div>
      <h2>{value}</h2>
    </div>
  );
}
