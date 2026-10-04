import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { QrCode } from "lucide-react";
import {
  LogOut,
  FileText,
  Download,
  Clock3,
  Printer,
  CircleCheckBig,
  BadgeCheck,
} from "lucide-react";

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 
const navigate = useNavigate();
  

  const updateStatus = async (jobId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.patch(
        `/jobs/${jobId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setJobs((currentJobs) =>
        currentJobs.map((job) => (job._id === jobId ? response.data.job : job)),
      );
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Failed to update status.");
    }
  };

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

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login first.");
          setLoading(false);
          return;
        }

        const response = await api.get("/jobs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error && !cafe) {
    return (
      <div className="dashboard-error">
        <div className="error-box">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  const pendingCount = jobs.filter((job) => job.status === "pending").length;

  const printingCount = jobs.filter((job) => job.status === "printing").length;

  const readyCount = jobs.filter((job) => job.status === "ready").length;

  const completedCount = jobs.filter(
    (job) => job.status === "completed",
  ).length;
  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="dashboard-logo">P</div>

          <div>
            <h1>PrintCafe</h1>
            <span>Owner Dashboard</span>
          </div>
        </div>

        <button className="logout-button">
          <LogOut size={16} />
          Logout
        </button>
        <button
    className="pricing-button"
    onClick={() => navigate("/pricing")}
>
    <Printer size={16} />
    Pricing
</button>

<button
    className="pricing-button"
    onClick={() => navigate("/qr-code")}
>
    <QrCode size={16} />
    My QR Code
</button>
      </header>

      <main className="dashboard-container">
        {/* Welcome */}
        <section className="dashboard-intro">
          <div>
            <span className="dashboard-label">CYBERCAFÉ</span>

            <h2>{cafe?.name || "Your Cybercafé"}</h2>

            <p>Manage incoming print orders and documents.</p>
          </div>
        </section>

        {/* Error notification */}
        {error && <div className="dashboard-notification">{error}</div>}

        {/* Statistics */}
        <section className="stats-grid">
          {/* Pending */}
          <div className="stat-card">
            <span className="stat-icon">
              <Clock3 size={20} />
            </span>

            <div>
              <span className="stat-number">{pendingCount}</span>

              <span className="stat-label">Pending</span>
            </div>
          </div>

          {/* Printing */}
          <div className="stat-card">
            <span className="stat-icon">
              <Printer size={20} />
            </span>

            <div>
              <span className="stat-number">{printingCount}</span>

              <span className="stat-label">Printing</span>
            </div>
          </div>

          {/* Ready */}
          <div className="stat-card">
            <span className="stat-icon">
              <CircleCheckBig size={20} />
            </span>

            <div>
              <span className="stat-number">{readyCount}</span>

              <span className="stat-label">Ready</span>
            </div>
          </div>

          {/* Completed */}
          <div className="stat-card">
            <span className="stat-icon">
              <BadgeCheck size={20} />
            </span>

            <div>
              <span className="stat-number">{completedCount}</span>

              <span className="stat-label">
              Completed
              </span>
            </div>
          </div>
        </section>

        {/* Print jobs */}
        <section className="jobs-section">
          <div className="jobs-heading">
            <div>
              <h2>Print Jobs</h2>

              <p>Documents submitted by customers</p>
            </div>

            <span className="jobs-count">
              {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
            </span>
          </div>

          {jobs.length === 0 ? (
            /* Empty state */
            <div className="empty-jobs">
              <div className="document-icon">
                <FileText size={20} />
              </div>

              <h3>No print jobs yet</h3>

              <p>Customer documents will appear here when they upload them.</p>
            </div>
          ) : (
            <div className="jobs-list">
              {jobs.map((job) => (
                <div className="dashboard-job-card" key={job._id}>
                  {/* Job header */}
                  <div className="job-top">
                    <div className="job-document">
                      <div className="document-icon">
                        <FileText size={20} />
                      </div>

                      <div>
                        <h3 title={job.originalName}>{job.originalName}</h3>

                        <span>
                          Received {new Date(job.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <span className={`status-badge status-${job.status}`}>
                      {job.status}
                    </span>
                  </div>

                  {/* Job details */}
                  <div className="job-details">
                    <div className="job-detail">
                      <span>Copies</span>

                      <strong>{job.copies}</strong>
                    </div>

                    <div className="job-detail">
                      <span>Print Type</span>

                      <strong>
                        {job.printType === "bw" ? "Black & White" : "Colour"}
                      </strong>
                    </div>

                    <div className="job-detail">
                      <span>Paper</span>

                      <strong>{job.paperSize}</strong>
                    </div>

                    <div className="job-detail">
                      <span>Price</span>

                      <strong>₹{job.price}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="job-actions">
                    <button
                      className="download-button"
                      onClick={() => downloadFile(job)}
                    >
                      <Download size={16} />
                      Download Document
                    </button>

                    <select
                      className="status-select"
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
        </section>
      </main>

      <footer className="dashboard-footer">
        PrintCafe • Document printing management
      </footer>
    </div>
  );
}

export default Dashboard;
