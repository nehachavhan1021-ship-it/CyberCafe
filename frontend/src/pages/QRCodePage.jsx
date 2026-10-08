import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function QRCodePage() {
  const navigate = useNavigate();

  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get("/cafes/my-qr", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setQrData(response.data);
      } catch (err) {
        console.error("QR loading error:", err);

        setError(err.response?.data?.message || "Could not load your QR code.");
      } finally {
        setLoading(false);
      }
    };

    fetchQR();
  }, [navigate]);

  const downloadQR = () => {
    if (!qrData?.qrCode) return;

    const link = document.createElement("a");
    link.href = qrData.qrCode;
    link.download = "PrintCafe-QR.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const printQR = () => {
    if (!qrData?.qrCode) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setError("Allow pop-ups in your browser to print the QR poster.");
      return;
    }

    const image = printWindow.document.createElement("img");
    image.src = qrData.qrCode;
    image.alt = "PrintCafe customer upload QR code";
    image.style.width = "280px";
    image.style.height = "280px";

    const heading = printWindow.document.createElement("h1");
    heading.textContent = qrData.cafe.name;

    const instruction = printWindow.document.createElement("p");
    instruction.textContent = "Scan to upload your documents for printing.";

    const note = printWindow.document.createElement("p");
    note.textContent = "Choose your print options and submit your file.";

    printWindow.document.body.style.cssText =
      "font-family: Arial, sans-serif; text-align: center; padding: 32px;";

    printWindow.document.body.append(heading, instruction, image, note);

    image.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  if (loading) {
    return <div className="pricing-loading">Loading your QR code...</div>;
  }

  if (error && !qrData) {
    return (
      <div className="qr-page">
        <p className="pricing-error">{error}</p>
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!qrData) return null;

  return (
    <div className="qr-page">
      <header className="qr-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="qr-brand">
          <QrCode size={23} />
          <span>QR Management</span>
        </div>
      </header>

      <main className="qr-container">
        <div className="qr-intro">
          <span className="dashboard-label">CUSTOMER ACCESS</span>
          <h1>Your café QR code</h1>
          <p>
            Let customers scan this code to upload documents directly to your
            PrintCafe.
          </p>
        </div>

        {error && <p className="pricing-error">{error}</p>}

        <section className="qr-card">
          <h2>{qrData.cafe.name}</h2>
          <p className="qr-subtitle">Scan to send documents</p>

          <div className="qr-image-wrapper">
            <img
              src={qrData.qrCode}
              alt="QR code for customer document uploads"
            />
          </div>

          <p className="qr-help">
            Open your phone camera and point it at the QR code.
          </p>

          <div className="qr-actions">
            <button className="save-pricing-button" onClick={downloadQR}>
              <Download size={18} />
              Download QR
            </button>

            <button className="qr-print-button" onClick={printQR}>
              <Printer size={18} />
              Print Poster
            </button>
          </div>

          <a
            className="qr-upload-link"
            href={qrData.uploadUrl}
            target="_blank"
            rel="noreferrer"
          >
            Test customer upload page
            <ExternalLink size={15} />
          </a>
        </section>
      </main>
    </div>
  );
}

export default QRCodePage;
