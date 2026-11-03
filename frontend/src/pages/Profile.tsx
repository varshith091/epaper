import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Profile() {
  const [savedCount, setSavedCount] = useState(0);
  const [userName, setUserName] = useState("Krishna Sai");
  const [userEmail, setUserEmail] = useState("user@gmail.com");
  const [preferredCategory, setPreferredCategory] = useState("Business");
  const [readingSpeed, setReadingSpeed] = useState("1.0x");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Fetch real saved articles count
    fetch("http://localhost:8080/api/saved")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSavedCount(data.length);
      })
      .catch((err) => console.error("Error loading saved count:", err));

    // Load any stored preferences
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.fullName) setUserName(parsed.fullName);
        if (parsed.email) setUserEmail(parsed.email);
      } catch (e) {
        // use defaults
      }
    }
  }, []);

  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        padding: "30px 40px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Top Navbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "35px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>📰</span>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            AI e-Paper Reader Profile
          </h1>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            to="/home"
            style={{
              padding: "10px 18px",
              backgroundColor: "#2563eb",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            ← Back to ePaper
          </Link>
          <Link
            to="/saved"
            style={{
              padding: "10px 18px",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Saved Articles ({savedCount})
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "850px", margin: "0 auto" }}>
        {/* Profile Card Header */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "35px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
            marginBottom: "25px",
            display: "flex",
            alignItems: "center",
            gap: "25px",
            flexWrap: "wrap",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "36px",
              color: "white",
              fontWeight: "bold",
              boxShadow: "0 4px 10px rgba(59, 130, 246, 0.35)",
            }}
          >
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>

          {/* Details */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                {userName}
              </h2>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  backgroundColor: "#dbeafe",
                  color: "#1d4ed8",
                }}
              >
                PRO MEMBER
              </span>
            </div>
            <p style={{ color: "#64748b", margin: "0 0 10px 0", fontSize: "15px" }}>
              {userEmail}
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "#475569", backgroundColor: "#f1f5f9", padding: "4px 10px", borderRadius: "6px" }}>
                Active Since: Oct 2026
              </span>
              <span style={{ fontSize: "13px", color: "#059669", backgroundColor: "#d1fae5", padding: "4px 10px", borderRadius: "6px" }}>
                ✓ Multilingual AI Enabled
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            🚪 Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "18px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>🔖</span>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a" }}>{savedCount}</div>
            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>Saved Articles</div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>🌐</span>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a" }}>3</div>
            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>Languages (EN, TE, HI)</div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>🧠</span>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a" }}>Gemini 3</div>
            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>AI Engine</div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>📚</span>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a" }}>UPSC / SSC</div>
            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>Exam Mode Active</div>
          </div>
        </div>

        {/* AI & Reading Preferences */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "30px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "20px" }}>
            ⚙️ AI e-Paper Reader Preferences
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontWeight: "600", fontSize: "14px", color: "#334155", marginBottom: "8px" }}>
                Primary News Category:
              </label>
              <select
                value={preferredCategory}
                onChange={(e) => setPreferredCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#f8fafc",
                  fontSize: "14px",
                }}
              >
                <option value="General">General / Front Page</option>
                <option value="Business">Business & Economy</option>
                <option value="Politics">Politics & Governance</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "600", fontSize: "14px", color: "#334155", marginBottom: "8px" }}>
                TTS Speech Speed:
              </label>
              <select
                value={readingSpeed}
                onChange={(e) => setReadingSpeed(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#f8fafc",
                  fontSize: "14px",
                }}
              >
                <option value="0.85x">0.85x (Slow)</option>
                <option value="1.0x">1.0x (Standard)</option>
                <option value="1.25x">1.25x (Fast)</option>
                <option value="1.5x">1.5x (Speed Read)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
            {savedSuccess ? (
              <span style={{ color: "#15803d", fontWeight: "600", fontSize: "14px" }}>
                ✓ Preferences updated successfully!
              </span>
            ) : <span />}

            <button
              onClick={handleSavePreferences}
              style={{
                padding: "10px 22px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
