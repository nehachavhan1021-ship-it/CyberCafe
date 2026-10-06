import { useEffect, useState } from "react";
import { Save, ArrowLeft, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Pricing() {
  const navigate = useNavigate();

  const [pricing, setPricing] = useState({
    a4Bw: 2,
    a4Color: 10,
    a3Bw: 5,
    a3Color: 20,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/pricing", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPricing(response.data.pricing);
      } catch (error) {
        console.error(error);

        setError(error.response?.data?.message || "Failed to load pricing.");
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPricing((current) => ({
      ...current,
      [name]: Number(value),
    }));

    setMessage("");
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await api.patch("/pricing", pricing, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPricing(response.data.pricing);
      setMessage("Pricing updated successfully.");
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to update pricing.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="pricing-loading">Loading pricing...</div>;
  }

  return (
    <div className="pricing-page">
      <header className="pricing-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="pricing-title">
          <div className="pricing-logo">
            <Printer size={20} />
          </div>

          <div>
            <h1>CyberCafe</h1>
            <span>Pricing Settings</span>
          </div>
        </div>
      </header>

      <main className="pricing-container">
        <div className="pricing-intro">
          <span className="dashboard-label">SETTINGS</span>

          <h2>Print Pricing</h2>

          <p>
            Set the amount customers will be charged for each type of print.
          </p>
        </div>

        {message && <div className="pricing-success">{message}</div>}

        {error && <div className="pricing-error">{error}</div>}

        <form className="pricing-card" onSubmit={handleSave}>
          <div className="pricing-section">
            <h3>A4 Paper</h3>

            <div className="pricing-grid">
              <div className="price-input">
                <label>Black & White</label>

                <div className="price-field">
                  <span>₹</span>

                  <input
                    type="number"
                    name="a4Bw"
                    min="0"
                    step="0.5"
                    value={pricing.a4Bw}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="price-input">
                <label>Colour</label>

                <div className="price-field">
                  <span>₹</span>

                  <input
                    type="number"
                    name="a4Color"
                    min="0"
                    step="0.5"
                    value={pricing.a4Color}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pricing-section">
            <h3>A3 Paper</h3>

            <div className="pricing-grid">
              <div className="price-input">
                <label>Black & White</label>

                <div className="price-field">
                  <span>₹</span>

                  <input
                    type="number"
                    name="a3Bw"
                    min="0"
                    step="0.5"
                    value={pricing.a3Bw}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="price-input">
                <label>Colour</label>

                <div className="price-field">
                  <span>₹</span>

                  <input
                    type="number"
                    name="a3Color"
                    min="0"
                    step="0.5"
                    value={pricing.a3Color}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="save-pricing-button"
            disabled={saving}
          >
            <Save size={18} />

            {saving ? "Saving..." : "Save Pricing"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default Pricing;
