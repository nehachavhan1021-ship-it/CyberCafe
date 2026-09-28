import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

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
            try {
                const response = await api.get(`/cafes/${qrCodeId}`);

                setCafe(response.data.cafe);
            } catch (error) {
                console.error(error);
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

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png"
        ];

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
                `Print job created successfully! Job ID: ${response.data.job.id}`
            );

            setFile(null);
            setCopies(1);
            setPrintType("bw");
            setPaperSize("A4");

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to create print job."
            );
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
    let pricePerCopy = 0;

    if (paperSize === "A4" && printType === "bw") {
        pricePerCopy = 2;
    } else if (paperSize === "A4" && printType === "color") {
        pricePerCopy = 10;
    } else if (paperSize === "A3" && printType === "bw") {
        pricePerCopy = 5;
    } else if (paperSize === "A3" && printType === "color") {
        pricePerCopy = 20;
    }

    return pricePerCopy * copies;
};

    return (
        <div className="upload-page">
            <div className="upload-container">

                <h1>Send Document</h1>

                <p className="cafe-name">
                    {cafe.name}
                </p>

                <p>
                    Upload your document for printing.
                </p>

                <div className="upload-box">
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                    />

                    {file && (
                        <p>
                            Selected: <strong>{file.name}</strong>
                        </p>
                    )}
                </div>

                <div className="print-options">

                    <label>
                        Copies
                        <input
                            type="number"
                            min="1"
                            value={copies}
                            onChange={(e) =>
                                setCopies(Number(e.target.value))
                            }
                        />
                    </label>

                    <label>
                        Print Type
                        <select
                            value={printType}
                            onChange={(e) =>
                                setPrintType(e.target.value)
                            }
                        >
                            <option value="bw">
                                Black & White
                            </option>

                            <option value="color">
                                Colour
                            </option>
                        </select>
                    </label>

                    <label>
                        Paper Size
                        <select
                            value={paperSize}
                            onChange={(e) =>
                                setPaperSize(e.target.value)
                            }
                        >
                            <option value="A4">A4</option>
                            <option value="A3">A3</option>
                        </select>
                    </label>

                </div>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="success-message">
                        {success}
                    </p>
                )}
                <div className="price">
    Estimated Price: ₹{calculatePrice()}
</div>

                <button
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading
                        ? "Sending..."
                        : "Send for Printing"}
                </button>

            </div>
        </div>
    );
}

export default UploadPage;