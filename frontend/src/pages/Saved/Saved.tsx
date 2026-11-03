import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface SavedArticleItem {
  id: number;
  headline: string;
  content: string;
  category: string;
}

function Saved() {
  const [savedArticles, setSavedArticles] = useState<SavedArticleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activeArticle, setActiveArticle] = useState<SavedArticleItem | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadSavedArticles();
  }, []);

  const loadSavedArticles = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/saved");
      const data = await response.json();
      setSavedArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading saved articles:", error);
    }
  };

  const deleteArticle = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this saved article?")) return;
    try {
      await fetch(`http://localhost:8080/api/saved/${id}`, {
        method: "DELETE",
      });
      setSavedArticles(savedArticles.filter((article) => article.id !== id));
      if (activeArticle && activeArticle.id === id) {
        setActiveArticle(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.onend = () => setIsSpeaking(false);
    speech.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(speech);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const filteredArticles = savedArticles.filter((art) => {
    const matchesCategory =
      selectedCategory === "ALL" ||
      (art.category && art.category.toUpperCase() === selectedCategory.toUpperCase());
    const matchesSearch =
      !searchQuery.trim() ||
      (art.headline && art.headline.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (art.content && art.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "30px 40px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "20px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "28px" }}>🔖</span>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              Saved Articles & Bookmarks
            </h1>
          </div>
          <p style={{ color: "#64748b", margin: "6px 0 0 0", fontSize: "15px" }}>
            Review, read, or listen to all your saved news stories offline anytime.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
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
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ← Back to ePaper
          </Link>
          <Link
            to="/profile"
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
            Profile
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        {/* Categories */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["ALL", "General", "Business", "Sports", "Politics"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "none",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                backgroundColor: selectedCategory.toUpperCase() === cat.toUpperCase() ? "#0f172a" : "#e2e8f0",
                color: selectedCategory.toUpperCase() === cat.toUpperCase() ? "white" : "#475569",
                transition: "all 0.2s",
              }}
            >
              {cat === "ALL" ? "All Saved" : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ minWidth: "260px" }}>
          <input
            type="text"
            placeholder="Search saved articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 14px",
              borderRadius: "20px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "white",
            }}
          />
        </div>
      </div>

      {/* Articles Count */}
      <div style={{ color: "#64748b", fontSize: "14px", marginBottom: "15px" }}>
        Showing <strong>{filteredArticles.length}</strong> saved articles
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "60px 20px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: "50px", display: "block", marginBottom: "12px" }}>📂</span>
          <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px 0" }}>
            No Saved Articles Found
          </h3>
          <p style={{ color: "#64748b", maxWidth: "400px", margin: "0 auto 20px auto", fontSize: "14px" }}>
            {searchQuery
              ? "No articles matched your search query. Try clearing the search."
              : "You haven't bookmarked any news stories yet. Read newspapers and click 'Save' to collect them here!"}
          </p>
          <Link
            to="/home"
            style={{
              padding: "10px 20px",
              backgroundColor: "#2563eb",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Explore Today's ePaper
          </Link>
        </div>
      )}

      {/* Grid of Saved Articles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    backgroundColor:
                      article.category?.toUpperCase() === "BUSINESS"
                        ? "#fef3c7"
                        : article.category?.toUpperCase() === "POLITICS"
                        ? "#fee2e2"
                        : article.category?.toUpperCase() === "SPORTS"
                        ? "#e0e7ff"
                        : "#f1f5f9",
                    color:
                      article.category?.toUpperCase() === "BUSINESS"
                        ? "#92400e"
                        : article.category?.toUpperCase() === "POLITICS"
                        ? "#991b1b"
                        : article.category?.toUpperCase() === "SPORTS"
                        ? "#3730a3"
                        : "#334155",
                    textTransform: "uppercase",
                  }}
                >
                  {article.category || "General"}
                </span>

                <button
                  onClick={() => deleteArticle(article.id)}
                  title="Remove from saved"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: "16px",
                    padding: "4px",
                  }}
                >
                  🗑
                </button>
              </div>

              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "#0f172a",
                  lineHeight: "1.4",
                  marginBottom: "10px",
                }}
              >
                {article.headline}
              </h3>

              <p
                style={{
                  fontSize: "14px",
                  color: "#475569",
                  lineHeight: "1.6",
                  marginBottom: "15px",
                }}
              >
                {article.content ? article.content.substring(0, 160) + "..." : ""}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                paddingTop: "12px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={() => setActiveArticle(article)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  backgroundColor: "#0f172a",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Read Article
              </button>

              <button
                onClick={() => speakText(article.headline)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#ede9fe",
                  color: "#6d28d9",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                🔊 Listen
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Reading Modal */}
      {activeArticle && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "30px",
              width: "90%",
              maxWidth: "750px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  backgroundColor: "#dbeafe",
                  color: "#1e40af",
                  textTransform: "uppercase",
                }}
              >
                {activeArticle.category || "General"}
              </span>

              <button
                onClick={() => {
                  stopSpeech();
                  setActiveArticle(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "26px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "15px", lineHeight: "1.3" }}>
              {activeArticle.headline}
            </h2>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                onClick={() => speakText(activeArticle.headline + ". " + activeArticle.content)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#8b5cf6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {isSpeaking ? "🔊 Speaking..." : "🔊 Read Aloud"}
              </button>

              {isSpeaking && (
                <button
                  onClick={stopSpeech}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ⏹ Stop
                </button>
              )}

              <button
                onClick={() => deleteArticle(activeArticle.id)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#fee2e2",
                  color: "#b91c1c",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                🗑 Remove Bookmark
              </button>
            </div>

            <div style={{ fontSize: "16px", lineHeight: "1.8", color: "#334155", whiteSpace: "pre-wrap" }}>
              {activeArticle.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Saved;
