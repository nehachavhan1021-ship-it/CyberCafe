import { useEffect, useState, useCallback } from "react";
import api from "../services/api";

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Define handler functions BEFORE the return statement
  const updateStatus = async (jobId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.patch(
        `/jobs/${jobId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update state efficiently using the functional update form
      setJobs((currentJobs) =>
        currentJobs.map((job) => (job._id === jobId ? response.data.job : job)),
      );
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to update status.");
    }
  };

  // 2. Data fetching lifecycle
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login first.");
          return;
        }

        const response = await api.get("/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setJobs(response.data.jobs || []);
        setCafe(response.data.cafe);
      } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || "Failed to load print jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 3. Early exit return paths for clean rendering states
  if (loading) return <h2>Loading dashboard...</h2>;
  if (error) return <h2>{error}</h2>;

  const downloadFile = async (job) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(`/jobs/${job._id}/file`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", job.originalName);

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);

      setError(error.response?.data?.message || "Failed to download document.");
    }
  };

  // 4. Main UI Render path
  return (
    <div className="dashboard">
      <h1>Owner Dashboard</h1>

      {cafe && (
        <p>
          Cybercafé: <strong>{cafe.name}</strong>
        </p>
      )}

      <h2>Print Jobs</h2>

      {jobs.length === 0 ? (
        <p>No print jobs yet.</p>
      ) : (
        <div className="jobs-list">
          {jobs.map((job) => (
            <div className="job-card" key={job._id}>
              <h3>{job.originalName}</h3>
              <p>Copies: {job.copies}</p>
              <p>
                Print Type:{" "}
                {job.printType === "bw" ? "Black & White" : "Colour"}
              </p>
              <p>Paper Size: {job.paperSize}</p>
              <p>Price: ₹{job.price}</p>
              <p>
                Status: <strong>{job.status}</strong>
              </p>
              <p>Received: {new Date(job.createdAt).toLocaleString()}</p>

              <div className="job-actions">
                <button onClick={() => downloadFile(job)}>
                  Download Document
                </button>

                <select
                  value={job.status}
                  onChange={(e) => updateStatus(job._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="printing">Printing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
