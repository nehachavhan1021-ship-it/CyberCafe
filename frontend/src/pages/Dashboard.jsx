import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  QrCode,
  Menu, X,
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
  const [downloading, setDownloading] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // =========================
  // UPDATE STATUS
  // =========================
  const updateStatus = async (jobId, newStatus) => {
    try {
      setError("");
      setUpdatingStatus(jobId);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        navigate("/login");
        return;
      }

      console.log("Updating status:", jobId, newStatus);

      const response = await api.patch(
        `/jobs/${jobId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Status update response:", response.data);

      if (response.data?.job) {
        setJobs((currentJobs) =>
          currentJobs.map((job) =>
            job._id === jobId ? response.data.job : job
          )
        );
      } else {
        setJobs((currentJobs) =>
          currentJobs.map((job) =>
            job._id === jobId
              ? { ...job, status: newStatus }
              : job
          )
        );
      }
    } catch (error) {
      console.error("Status update error:", error);
      console.error("Server response:", error.response?.data);

      setError(
        error.response?.data?.message ||
          "Failed to update status."
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // =========================
  // DOWNLOAD ONE FILE
  // =========================
  const downloadOneFile = async (job, file) => {
    try {
      setError("");
      setDownloading(`${job._id}-${file.fileName}`);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        navigate("/login");
        return;
      }

      console.log("Downloading:", file.fileName);

      const response = await api.get(
        `/jobs/${job._id}/file/${encodeURIComponent(
          file.fileName
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data]);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = file.originalName;

      document.body.appendChild(link);
      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      console.error("Server response:", error.response);

      setError(
        error.response?.data?.message ||
          "Failed to download document."
      );
    } finally {
      setDownloading(null);
    }
  };

  // =========================
  // DOWNLOAD ALL FILES
  // =========================
  const downloadAllFiles = async (job) => {
    if (!job.files || job.files.length === 0) {
      setError("No files available for this order.");
      return;
    }

    for (const file of job.files) {
      await downloadOneFile(job, file);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // =========================
  // FETCH JOBS
  // =========================
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

        console.log("Jobs response:", response.data);

        setJobs(response.data.jobs || []);
        setCafe(response.data.cafe);
      } catch (error) {
        console.error("Fetch jobs error:", error);
        console.error("Server response:", error.response?.data);

        setError(
          error.response?.data?.message ||
            "Failed to load print jobs."
        );
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

          <button onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = jobs.filter(
    (job) => job.status === "pending"
  ).length;

  const printingCount = jobs.filter(
    (job) => job.status === "printing"
  ).length;

  const readyCount = jobs.filter(
    (job) => job.status === "ready"
  ).length;

  const completedCount = jobs.filter(
    (job) => job.status === "completed"
  ).length;

  return (
    <div className="dashboard-page">

      {/* HEADER */}
      <header className="dashboard-header">

        <div className="dashboard-brand">

          <div className="dashboard-logo">
            CC
          </div>

          <div>
            <h1>CyberCafe</h1>
            <span>Dashboard</span>
          </div>

        </div>

        {/* <div className="dashboard-header-actions">

          <button
            className="pricing-button"
            onClick={() => navigate("/pricing")}
          >
            <Printer size={13} />
            Pricing
          </button>

          <button
            className="pricing-button"
            onClick={() => navigate("/qr-code")}
          >
            <QrCode size={13} />
            My QR Code
          </button>

          <button
            className="pricing-button"
            onClick={logout}
          >
            <LogOut size={13} />
            Logout
          </button>

        </div> */}

        
<div className="dashboard-header-actions">

  {/* Desktop buttons */}
  <div className="desktop-dashboard-actions">
    <button
      className="pricing-button"
      onClick={() => navigate("/pricing")}
    >
      <Printer size={15} />
      Pricing
    </button>

    <button
      className="pricing-button"
      onClick={() => navigate("/qr-code")}
    >
      <QrCode size={15} />
      My QR Code
    </button>

    <button
      className="pricing-button"
      onClick={logout}
    >
      <LogOut size={15} />
      Logout
    </button>
  </div>

  {/* Mobile hamburger */}
  <button
    type="button"
    className="dashboard-menu-toggle"
    onClick={() => setMenuOpen((prev) => !prev)}
    aria-label={menuOpen ? "Close menu" : "Open menu"}
    aria-expanded={menuOpen}
  >
    {menuOpen ? <X size={23} /> : <Menu size={23} />}
  </button>

  {/* Mobile dropdown */}
  {menuOpen && (
    <div className="dashboard-mobile-menu">
      <button
        className="pricing-button"
        onClick={() => {
          setMenuOpen(false);
          navigate("/pricing");
        }}
      >
        <Printer size={16} />
        Pricing
      </button>

      <button
        className="pricing-button"
        onClick={() => {
          setMenuOpen(false);
          navigate("/qr-code");
        }}
      >
        <QrCode size={16} />
        My QR Code
      </button>

      <button
        className="pricing-button"
        onClick={() => {
          setMenuOpen(false);
          logout();
        }}
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  )}

</div>



      </header>

      <main className="dashboard-container">

        {/* WELCOME */}
        <section className="dashboard-intro">

          <div>

            <span className="dashboard-label">
              CYBERCAFÉ
            </span>

            <h2>
              {cafe?.name || "Your Cybercafé"}
            </h2>

            <p>
              Manage incoming print orders and documents.
            </p>

          </div>

        </section>

        {/* ERROR */}
        {error && (
          <div className="dashboard-notification">
            {error}
          </div>
        )}

        {/* STATISTICS */}
        <section className="stats-grid">

          <div className="stat-card">
            <span className="stat-icon">
              <Clock3 size={20} />
            </span>

            <div>
              <span className="stat-number">
                {pendingCount}
              </span>

              <span className="stat-label">
                Pending
              </span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              <Printer size={20} />
            </span>

            <div>
              <span className="stat-number">
                {printingCount}
              </span>

              <span className="stat-label">
                Printing
              </span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              <CircleCheckBig size={20} />
            </span>

            <div>
              <span className="stat-number">
                {readyCount}
              </span>

              <span className="stat-label">
                Ready
              </span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              <BadgeCheck size={20} />
            </span>

            <div>
              <span className="stat-number">
                {completedCount}
              </span>

              <span className="stat-label">
                Completed
              </span>
            </div>
          </div>

        </section>

        {/* PRINT JOBS */}
        <section className="jobs-section">

          <div className="jobs-heading">

            <div>
              <h2>Print Jobs</h2>

              <p>
                Documents submitted by customers
              </p>
            </div>

            <span className="jobs-count">
              {jobs.length}{" "}
              {jobs.length === 1 ? "job" : "jobs"}
            </span>

          </div>

          {jobs.length === 0 ? (

            <div className="empty-jobs">

              <div className="document-icon">
                <FileText size={20} />
              </div>

              <h3>No print jobs yet</h3>

              <p>
                Customer documents will appear here
                when they upload them.
              </p>

            </div>

          ) : (

            <div className="jobs-list">

              {jobs.map((job) => (

                <div
                  className="dashboard-job-card"
                  key={job._id}
                >

                  {/* JOB HEADER */}
                  <div className="job-top">

                    <div className="job-document">

                      <div className="document-icon">
                        <FileText size={20} />
                      </div>

                      <div>

                        <h3>
                          {job.customerName ||
                            "Customer"}
                        </h3>

                        <span>
                          Received{" "}
                          {new Date(
                            job.createdAt
                          ).toLocaleString()}
                        </span>

                        {job.customerPhone && (
                          <span>
                            Phone:{" "}
                            {job.customerPhone}
                          </span>
                        )}

                      </div>

                    </div>

                    <span
                      className={`status-badge status-${job.status}`}
                    >
                      {job.status}
                    </span>

                  </div>

                  {/* FILES */}
                  <div className="job-files">

                    <strong>
                      Documents
                    </strong>

                    {job.files?.map((file) => (

                      <div
                        className="job-file"
                        key={file.fileName}
                      >

                        <div>

                          <FileText size={16} />

                          <span>
                            {file.originalName}
                          </span>

                          <small>
                            {file.pages} page
                            {file.pages !== 1
                              ? "s"
                              : ""}
                          </small>

                        </div>

                        <button
                          className="download-button"
                          onClick={() =>
                            downloadOneFile(
                              job,
                              file
                            )
                          }
                          disabled={
                            downloading ===
                            `${job._id}-${file.fileName}`
                          }
                        >

                          <Download size={16} />

                          {downloading ===
                          `${job._id}-${file.fileName}`
                            ? "Downloading..."
                            : "Download"}

                        </button>

                      </div>

                    ))}

                  </div>

                  {/* JOB DETAILS */}
                  <div className="job-details">

                    <div className="job-detail">
                      <span>Pages</span>

                      <strong>
                        {job.totalPages}
                      </strong>
                    </div>

                    <div className="job-detail">
                      <span>Sheets</span>

                      <strong>
                        {job.totalSheets}
                      </strong>
                    </div>

                    <div className="job-detail">
                      <span>Copies</span>

                      <strong>
                        {job.copies}
                      </strong>
                    </div>

                    <div className="job-detail">
                      <span>Print Type</span>

                      <strong>
                        {job.printType === "bw"
                          ? "Black & White"
                          : "Colour"}
                      </strong>
                    </div>

                    <div className="job-detail">
                      <span>Paper</span>

                      <strong>
                        {job.paperSize}
                      </strong>
                    </div>

                    <div className="job-detail">
                      <span>Sides</span>

                      <strong>
                        {job.printSides === "double"
                          ? "Double"
                          : "Single"}
                      </strong>
                    </div>

                    <div className="job-detail">
                      <span>Price</span>

                      <div className="job-price">
                        ₹{job.totalPrice}
                      </div>
                    </div>

                  </div>

                  {/* ACTIONS */}
                  <div className="job-actions">

                    <button
                      className="download-button"
                      onClick={() =>
                        downloadAllFiles(job)
                      }
                      disabled={
                        downloading !== null
                      }
                    >

                      <Download size={16} />

                      {downloading
                        ? "Downloading..."
                        : "Download All"}

                    </button>

                    <select
                      className="status-select"
                      value={job.status}
                      disabled={
                        updatingStatus === job._id
                      }
                      onChange={(e) =>
                        updateStatus(
                          job._id,
                          e.target.value
                        )
                      }
                    >

                      <option value="pending">
                        Pending
                      </option>

                      <option value="printing">
                        Printing
                      </option>

                      <option value="ready">
                        Ready
                      </option>

                      <option value="completed">
                        Completed
                      </option>

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