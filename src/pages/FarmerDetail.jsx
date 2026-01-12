import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { FiCheckCircle, FiFileText, FiAlertTriangle } from "react-icons/fi";

export default function FarmerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");

  useEffect(() => {
    fetchFarmerDetails();
  }, [id]);

  async function fetchFarmerDetails() {
    let timeoutId;

    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await api.get(`/farmers/${id}`, {
          signal: controller.signal,
        });
        setFarmer(res.data);
      } catch {
        // fallback: fetch all farmers
        const allRes = await api.get(`/farmers`, {
          signal: controller.signal,
        });

        const found = allRes.data.find((f) => String(f.id) === String(id));
        if (!found) throw new Error("Farmer not found");
        setFarmer(found);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load farmer details"
        );
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  async function handleViewCertificate() {
    try {
      const win = window.open("", "Certificate", "width=800,height=600");

      win.document.write(`
        <html>
          <head>
            <title>Certificate</title>
            <style>
              body {
                font-family: Georgia, serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: #f5f5f5;
              }
              .certificate {
                background: white;
                padding: 40px;
                border: 3px solid #2c3e50;
                text-align: center;
                width: 700px;
              }
              h1 { margin-bottom: 30px; }
              .name { font-size: 26px; color: #27ae60; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="certificate">
              <h1>Certificate of Approval</h1>
              <p>This certifies that</p>
              <div class="name">${farmer.first_name} ${farmer.last_name}</div>
              <p>is a verified ${
                farmer.crop_type ? "Crop" : "Livestock"
              } Farmer</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `);

      win.document.close();
      win.print();
    } catch {
      setActionError("Failed to open certificate");
    }
  }

  async function handleRevokeCertificate() {
    if (!farmer?.id) {
      setActionError("Farmer ID missing");
      return;
    }

    if (!revokeReason.trim()) {
      setActionError("Revocation reason is required");
      return;
    }

    try {
      setActionLoading(true);

      await api.patch(`/farmers/${farmer.id}/revoke`, {
        reason: revokeReason,
      });

      await fetchFarmerDetails();
      setShowRevokeModal(false);
      setRevokeReason("");
      alert("Certificate revoked successfully");
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to revoke certificate"
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <p>Loading farmer details...</p>;

  if (error)
    return (
      <div className="card">
        <button onClick={() => navigate(-1)}>← Back</button>
        <p className="error">{error}</p>
      </div>
    );

  return (
    <div className="card">
      <button onClick={() => navigate(-1)}>← Back</button>

      <h2>Farmer Details</h2>

      <p>
        <strong>Name:</strong> {farmer.first_name} {farmer.last_name}
      </p>

      <p>
        <strong>Farm Size:</strong> {farmer.farm_size || "N/A"} acres
      </p>

      <p>
        <strong>Crop Type:</strong> {farmer.crop_type || "N/A"}
      </p>

      <p>
        <strong>Livestock Type:</strong> {farmer.livestock_type || "N/A"}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        <span className={`status ${farmer.status}`}>{farmer.status}</span>
      </p>

      {farmer.status === "certified" && (
        <div className="certificate">
          <FiCheckCircle /> Certified Farmer
          <div className="cert-actions">
            <button onClick={handleViewCertificate}>
              <FiFileText /> View Certificate
            </button>
            <button onClick={() => setShowRevokeModal(true)}>
              <FiAlertTriangle /> Revoke Certificate
            </button>
          </div>
        </div>
      )}

      {showRevokeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Revoke Certificate</h3>

            {actionError && <p className="error">{actionError}</p>}

            <textarea
              placeholder="Reason for revocation"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
            />

            <div className="modal-actions">
              <button
                onClick={handleRevokeCertificate}
                disabled={actionLoading}
              >
                {actionLoading ? "Revoking..." : "Confirm"}
              </button>
              <button onClick={() => setShowRevokeModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
