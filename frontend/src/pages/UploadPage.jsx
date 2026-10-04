import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { Upload } from "lucide-react";

function UploadPage() {
  const { qrCodeId } = useParams();

  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [file, setFile] = useState(null);
  const [copies, setCopies] = useState(1);
  const [printType, setPrintType] = useState("bw");
  const [paperSize, setPaperSize] = useState("A4");

  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");

 useEffect(() => {
  const fetchCafe = async () => {
    console.time("fetchCafe");

    try {
      const response = await api.get(`/cafes/${qrCodeId}`);

      console.timeEnd("fetchCafe");
      console.log("Cafe response:", response.data);

      setCafe(response.data.cafe);
    } catch (error) {
      console.timeEnd("fetchCafe");
      console.error("Cafe fetch error:", error);
      setError("Cybercafé not found");
    } finally {
      setLoading(false);
    }
  };

  fetchCafe();
}, [qrCodeId]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF, JPG and PNG files are allowed.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      setFile(null);
      return;
    }

    setError("");
    setSuccess("");
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    if (copies < 1) {
      setError("Copies must be at least 1.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("file", file);
      formData.append("qrCodeId", qrCodeId);
      formData.append("copies", copies);
      formData.append("printType", printType);
      formData.append("paperSize", paperSize);

      const response = await api.post("/upload", formData);

      console.log(response.data);

      setSuccess(
        `Print job created successfully! Job ID: ${response.data.job.id}`,
      );

      setFile(null);
      setCopies(1);
      setPrintType("bw");
      setPaperSize("A4");
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to create print job.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error && !cafe) {
    return <h2>{error}</h2>;
  }
  const calculatePrice = () => {
  if (!cafe?.pricing) return 0;

  let pricePerCopy = 0;

  if (paperSize === "A4" && printType === "bw") {
    pricePerCopy = cafe.pricing.a4Bw;
  } else if (paperSize === "A4" && printType === "color") {
    pricePerCopy = cafe.pricing.a4Color;
  } else if (paperSize === "A3" && printType === "bw") {
    pricePerCopy = cafe.pricing.a3Bw;
  } else if (paperSize === "A3" && printType === "color") {
    pricePerCopy = cafe.pricing.a3Color;
  }

  return pricePerCopy * copies;
};

  return (
    <div className="upload-page">
      <div className="upload-container">
        <header className="upload-header">
          <div className="brand">
            <div className="brand-icon">P</div>
            <span>PrintCafe</span>
          </div>
        </header>

        <main className="upload-card">
          <div className="cafe-info">
            <span className="cafe-label">PRINT SERVICE</span>

            <h1>Send your document</h1>

            <p>Upload your document and choose your printing preferences.</p>

            <div className="cafe-name">{cafe?.name}</div>
          </div>

          {/* File upload */}
          <div className="form-section">
            <label className="section-label">Document</label>

            <label className="file-upload">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />

              <div className="upload-icon">
    <Upload size={23} />
</div>

              <strong>{file ? file.name : "Choose a document"}</strong>

              <span>
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : "PDF, JPG or PNG • Maximum 10MB"}
              </span>
            </label>
          </div>

          {/* Copies */}
          <div className="form-section">
            <label className="section-label">Copies</label>

            <div className="copies-control">
              <button
                type="button"
                onClick={() => setCopies(Math.max(1, copies - 1))}
              >
                −
              </button>

              <span>{copies}</span>

              <button type="button" onClick={() => setCopies(copies + 1)}>
                +
              </button>
            </div>
          </div>

          {/* Print type */}
          <div className="form-section">
            <label className="section-label">Print type</label>

            <div className="option-grid">
              <button
                type="button"
                className={printType === "bw" ? "option active" : "option"}
                onClick={() => setPrintType("bw")}
              >
                <span>●</span>
                Black & White
              </button>

              <button
                type="button"
                className={printType === "color" ? "option active" : "option"}
                onClick={() => setPrintType("color")}
              >
                <span>◉</span>
                Color
              </button>
            </div>
          </div>

          {/* Paper size */}
          <div className="form-section">
            <label className="section-label">Paper size</label>

            <div className="option-grid">
              <button
                type="button"
                className={paperSize === "A4" ? "option active" : "option"}
                onClick={() => setPaperSize("A4")}
              >
                A4
              </button>

              <button
                type="button"
                className={paperSize === "A3" ? "option active" : "option"}
                onClick={() => setPaperSize("A3")}
              >
                A3
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="price-box">
            <div>
              <span>Estimated price</span>
              <small>
                {copies} {copies === 1 ? "copy" : "copies"}
              </small>
            </div>

            <strong>₹{calculatePrice()}</strong>
          </div>

          {/* Upload button */}
          <button
            className="submit-button"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? "Sending..." : "Send for Printing"}
          </button>

          {success && <div className="success-message">{success}</div>}
        </main>

        <footer className="upload-footer">
          Your document is securely handled for printing.
        </footer>
      </div>
    </div>
  );
}

export default UploadPage;
