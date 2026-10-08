import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import api from "../services/api";


import {
  Upload,
  X,
  FileText,
  
} from "lucide-react";

function UploadPage() {
  const { qrCodeId } = useParams();

  const [cafe, setCafe] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [files, setFiles] = useState([]);

  const [customerName, setCustomerName] = useState("");
  

  const [copies, setCopies] = useState(1);

  const [printType, setPrintType] = useState("bw");
  const [paperSize, setPaperSize] = useState("A4");
  const [printSides, setPrintSides] = useState("single");

  

  const [order, setOrder] = useState(null);

  // ------------------------------------
  // Fetch cafe
  // ------------------------------------

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

  // ------------------------------------
  // File selection
  // ------------------------------------

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    setError("");
    setSuccess("");

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    const newFiles = [];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError(
          `${file.name}: Only PDF, JPG and PNG files are allowed.`,
        );

        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(
          `${file.name}: File size must be less than 10 MB.`,
        );

        continue;
      }

      let pages = 1;

      try {
        if (file.type === "application/pdf") {
          const arrayBuffer = await file.arrayBuffer();

          const pdfDoc = await PDFDocument.load(arrayBuffer);

          pages = pdfDoc.getPageCount();
        }

        newFiles.push({
          file,
          pages,
        });
      } catch (error) {
        console.error("PDF page count error:", error);

        setError(`${file.name}: Unable to read this PDF.`);
      }
    }

    setFiles((previousFiles) => [
      ...previousFiles,
      ...newFiles,
    ]);

    event.target.value = "";
  };

  // ------------------------------------
  // Remove file
  // ------------------------------------

  const removeFile = (index) => {
    setFiles((previousFiles) =>
      previousFiles.filter(
        (_, fileIndex) => fileIndex !== index,
      ),
    );
  };

  // ------------------------------------
  // Price calculation
  // ------------------------------------

  const totalPages = files.reduce(
    (total, item) => total + item.pages,
    0,
  );

  const getPricePerSheet = () => {
    if (!cafe?.pricing) {
      return 0;
    }

    if (paperSize === "A4" && printType === "bw") {
      return cafe.pricing.a4Bw;
    }

    if (paperSize === "A4" && printType === "color") {
      return cafe.pricing.a4Color;
    }

    if (paperSize === "A3" && printType === "bw") {
      return cafe.pricing.a3Bw;
    }

    if (paperSize === "A3" && printType === "color") {
      return cafe.pricing.a3Color;
    }

    return 0;
  };

  const totalSheets =
    printSides === "double"
      ? Math.ceil(totalPages / 2)
      : totalPages;

  const calculatePrice = () => {
    const pricePerSheet = getPricePerSheet();

    return pricePerSheet * totalSheets * copies;
  };

  // ------------------------------------
  // Copy UPI ID
  // ------------------------------------

  
  // ------------------------------------
  // Upload / create order
  // ------------------------------------

  const handleUpload = async () => {
    if (!files.length) {
      setError("Please select at least one file.");

      return;
    }

    if (copies < 1) {
      setError("Copies must be at least 1.");

      return;
    }

    if (!customerName.trim()) {
      setError("Please enter customer name.");

      return;
    }

    try {
      setUploading(true);

      setError("");
      setSuccess("");

      const formData = new FormData();

      files.forEach((item) => {
        formData.append("files", item.file);
      });

      formData.append("qrCodeId", qrCodeId);
      formData.append("copies", copies);
      formData.append("printType", printType);
      formData.append("paperSize", paperSize);
      formData.append("printSides", printSides);
      formData.append("customerName", customerName);
     
      

      const response = await api.post("/upload", formData);

      console.log("Order response:", response.data);

      const createdOrder = response.data.order;

      if (!createdOrder) {
        throw new Error("Order details were not returned.");
      }

      setOrder(createdOrder);

      setSuccess("Print order created successfully!");

      // Clear form after order creation
      setFiles([]);
      setCustomerName("");
     
      setCopies(1);
      setPrintType("bw");
      setPaperSize("A4");
      setPrintSides("single");
    } catch (error) {
      console.error("Upload error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create print order.",
      );
    } finally {
      setUploading(false);
    }
  };

  // ------------------------------------
  // Loading
  // ------------------------------------

  if (loading) {
    return <h2>Loading...</h2>;
  }

  // ------------------------------------
  // Cafe not found
  // ------------------------------------

  if (error && !cafe) {
    return <h2>{error}</h2>;
  }

  // ------------------------------------
  // UI
  // ------------------------------------

  return (
    <div className="upload-page">
      <div className="upload-container">

        {/* Header */}

        <header className="upload-header">
          <div className="brand">
            <div className="brand-icon">CC</div>

            <span>CyberCafe</span>
          </div>
        </header>

        <main className="upload-card">

          {/* Customer Details */}

          <div className="form-section">
            <label className="section-label">
              Customer Details
            </label>

            <input
              type="text"
              placeholder="Customer name"
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
              className="customer-input"
            />

           
          </div>

          {/* Cafe Information */}

          <div className="cafe-info">
            <span className="cafe-label">
              PRINT SERVICE
            </span>

            <h1>Send your documents</h1>

            <p>
              Upload one or multiple documents and choose
              your printing preferences.
            </p>

            <div className="cafe-name">
              {cafe?.name}
            </div>
          </div>

          {/* Documents */}

          <div className="form-section">
            <label className="section-label">
              Documents
            </label>

            <label className="file-upload">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={handleFileChange}
              />

              <div className="upload-icon">
                <Upload size={23} />
              </div>

              <strong>Choose documents</strong>

              <span>
                PDF, JPG or PNG • Maximum 10MB per file
              </span>
            </label>
          </div>

          {/* Selected Files */}

          {files.length > 0 && (
            <div className="form-section">
              <label className="section-label">
                Selected documents
              </label>

              <div className="selected-files">
                {files.map((item, index) => (
                  <div
                    className="selected-file"
                    key={`${item.file.name}-${index}`}
                  >
                    <div className="file-info">
                      <FileText size={20} />

                      <div>
                        <strong>
                          {item.file.name}
                        </strong>

                        <span>
                          {item.pages}{" "}
                          {item.pages === 1
                            ? "page"
                            : "pages"}{" "}
                          •{" "}
                          {(
                            item.file.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Copies */}

          <div className="form-section">
            <label className="section-label">
              Copies
            </label>

            <div className="copies-control">
              <button
                type="button"
                onClick={() =>
                  setCopies(Math.max(1, copies - 1))
                }
              >
                −
              </button>

              <span>{copies}</span>

              <button
                type="button"
                onClick={() =>
                  setCopies(copies + 1)
                }
              >
                +
              </button>
            </div>
          </div>

          {/* Print Type */}

          <div className="form-section">
            <label className="section-label">
              Print type
            </label>

            <div className="option-grid">
              <button
                type="button"
                className={
                  printType === "bw"
                    ? "option active"
                    : "option"
                }
                onClick={() => setPrintType("bw")}
              >
                <span>●</span>
                Black & White
              </button>

              <button
                type="button"
                className={
                  printType === "color"
                    ? "option active"
                    : "option"
                }
                onClick={() => setPrintType("color")}
              >
                <span>◉</span>
                Color
              </button>
            </div>
          </div>

          {/* Paper Size */}

          <div className="form-section">
            <label className="section-label">
              Paper size
            </label>

            <div className="option-grid">
              <button
                type="button"
                className={
                  paperSize === "A4"
                    ? "option active"
                    : "option"
                }
                onClick={() => setPaperSize("A4")}
              >
                A4
              </button>

              <button
                type="button"
                className={
                  paperSize === "A3"
                    ? "option active"
                    : "option"
                }
                onClick={() => setPaperSize("A3")}
              >
                A3
              </button>
            </div>
          </div>

          {/* Printing Sides */}

          <div className="form-section">
            <label className="section-label">
              Printing sides
            </label>

            <div className="option-grid">
              <button
                type="button"
                className={
                  printSides === "single"
                    ? "option active"
                    : "option"
                }
                onClick={() =>
                  setPrintSides("single")
                }
              >
                Single Side
              </button>

              <button
                type="button"
                className={
                  printSides === "double"
                    ? "option active"
                    : "option"
                }
                onClick={() =>
                  setPrintSides("double")
                }
              >
                Front & Back
              </button>
            </div>
          </div>

          {/* Price */}

          <div className="price-box">
            <div>
              <span>Estimated price</span>

              <small>
                {files.length}{" "}
                {files.length === 1
                  ? "document"
                  : "documents"}{" "}
                • {totalPages}{" "}
                {totalPages === 1
                  ? "page"
                  : "pages"}{" "}
                • {totalSheets}{" "}
                {totalSheets === 1
                  ? "sheet"
                  : "sheets"}{" "}
                • {copies}{" "}
                {copies === 1
                  ? "copy"
                  : "copies"}
              </small>
            </div>

            <strong>
              ₹{calculatePrice()}
            </strong>
          </div>

          {/* Payment Method */}

          

          {/* Error */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          {/* Send Order */}

          {!order && (
            <button
              className="submit-button"
              onClick={handleUpload}
              disabled={!files.length || uploading}
            >
              {uploading
                ? "Sending..."
                : "Send for Printing"}
            </button>
          )}

          {/* Payment Section */}

          {order && (
  <div className="payment-section">
    <div className="payment-info">
      <span>Order Created</span>
      <strong>₹{Number(order.totalPrice).toFixed(2)}</strong>
    </div>

    <div className="payment-order-info">
      <p>
        Order ID: <strong>{order.id}</strong>
      </p>

      <p>
        Customer: <strong>{order.customerName}</strong>
      </p>

      <p>
        Please pay at the cafe counter.
      </p>
    </div>

    <button
      type="button"
      className="submit-button"
      onClick={() => {
        setOrder(null);
        setSuccess("");
        setError("");
      }}
    >
      Create Another Order
    </button>
  </div>
)}

        </main>

        <footer className="upload-footer">
          Your documents are securely handled for printing.
        </footer>

      </div>
    </div>
  );
}

export default UploadPage;