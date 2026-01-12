import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function FarmerTable({ farmers, refresh }) {
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  async function updateStatus(id, status) {
    try {
      setUpdatingId(id);
      await api.patch(`/farmers/${id}/status`, { status });
      refresh();
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }
  return (
    <table className="farmer-table">
      <thead>
        <tr>
          <th>Farmes Names</th>
          <th>Farm Type</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {farmers.map((f) => (
          <tr key={f.id}>
            <td>
              {f.first_name} {f.last_name}
            </td>
            <td>{f.crop_type || f.livestock_type}</td>
            <td>
              <span className={`status ${f.status}`}>{f.status}</span>
            </td>
            <td>
              <button
                className="btn approve"
                disabled={updatingId === f.id}
                onClick={() => updateStatus(f.id, "certified")}
              >
                {updatingId === f.id ? "Updating..." : "Approve"}
              </button>
              <button
                className="btn reject"
                disabled={updatingId === f.id}
                onClick={() => updateStatus(f.id, "declined")}
              >
                Reject
              </button>
              <button
                className="btn details"
                onClick={() => navigate(`/dashboard/farmers/${f.id}`)}
              >
                View Details
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
