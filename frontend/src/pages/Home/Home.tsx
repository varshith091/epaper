import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import { cleanArticleData } from "../../utils/articleCleaner";
import { generateStudySheetPDF } from "../../utils/studySheetGenerator";

interface ArticleItem {
  id: number;
  headline: string;
  content: string;
  category: string;
  sentiment: "Positive" | "Neutral" | "Critical";
  entities: string[];
  newspaper?: {
    id: number;
    title: string;
    edition?: string;
  };
}

interface NewspaperItem {
  id: number;
  title: string;
  publisher?: string;
  edition?: string;
  uploadedAt?: string;
}

function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Front Page");
  const [keyword, setKeyword] = useState("");
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [newspapers, setNewspapers] = useState<NewspaperItem[]>([]);
  const [selectedNewspaperId, setSelectedNewspaperId] = useState<string>("ALL");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // Audio Briefing Playlist State
  const [isBriefingPlaying, setIsBriefingPlaying] = useState(false);
  const [briefingIndex, setBriefingIndex] = useState(0);
  const [briefingSpeed, setBriefingSpeed] = useState<number>(1.0);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);

  // Modal / Detail state
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<"English" | "Telugu" | "Hindi">("English");
  const [translatedContent, setTranslatedContent] = useState("");
  const [translatedHeadline, setTranslatedHeadline] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [examLoading, setExamLoading] = useState(false);
  const [examNotes, setExamNotes] = useState("");

  const [question, setQuestion] = useState("");
  const [quiz, setQuiz] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("The Times of India");
  const [uploadEdition, setUploadEdition] = useState("Delhi City Edition");
  const [uploadPublisher, setUploadPublisher] = useState("Bennett, Coleman & Co.");
  const [uploadCategory, setUploadCategory] = useState("General");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const processArticles = (data: any[]): ArticleItem[] => {
    if (!Array.isArray(data)) return [];
    return data.map((art) => {
      const cleaned = cleanArticleData(art.content, art.headline, art.category);
      return {
        ...art,
        headline: cleaned.headline,
        content: cleaned.content,
        category: cleaned.category,
        sentiment: cleaned.sentiment,
        entities: cleaned.entities,
      };
    });
  };

  const loadNewspapers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/newspapers");
      if (response.ok) {
        const data = await response.json();
        setNewspapers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error loading newspapers:", error);
    }
  };

  const fetchArticles = async (newspaperId: string = selectedNewspaperId) => {
    try {
      let url = "http://localhost:8080/api/articles";
      if (newspaperId !== "ALL") {
        url = `http://localhost:8080/api/articles/newspaper/${newspaperId}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        const fallbackRes = await fetch("http://localhost:8080/api/articles");
        const fallbackData = await fallbackRes.json();
        setArticles(processArticles(fallbackData));
        return;
      }
      const data = await response.json();
      setArticles(processArticles(data));
    } catch (error) {
      console.error("Error loading articles:", error);
    }
  };

  useEffect(() => {
    loadNewspapers();
    fetchArticles("ALL");
  }, []);

  const handleNewspaperChange = (nId: string) => {
    setSelectedNewspaperId(nId);
    setSelectedCategory("Front Page");
    setSelectedEntity(null);
    setKeyword("");
    fetchArticles(nId);
  };

  const searchArticles = async () => {
    if (!keyword.trim()) {
      fetchArticles(selectedNewspaperId);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/api/articles/search/keyword?keyword=${encodeURIComponent(
          keyword
        )}`
      );
      const data = await response.json();
      setArticles(processArticles(data));
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // 1. Audio Briefing Playlist Logic (Plays top 5 headlines back-to-back)
  const playBriefingTrack = (index: number, speed: number = briefingSpeed) => {
    const topArticles = filteredArticles.slice(0, 5);
    if (index >= topArticles.length) {
      window.speechSynthesis.cancel();
      setIsBriefingPlaying(false);
      setBriefingIndex(0);
      return;
    }

    window.speechSynthesis.cancel();
    setBriefingIndex(index);
    setIsBriefingPlaying(true);

    const art = topArticles[index];
    const textToSpeak = `Briefing story ${index + 1} of ${topArticles.length}. ${art.headline}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "en-US";
    utterance.rate = speed;

    utterance.onend = () => {
      playBriefingTrack(index + 1, speed);
    };

    utterance.onerror = () => {
      setIsBriefingPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startBriefing = () => {
    if (isBriefingPlaying) {
      window.speechSynthesis.cancel();
      setIsBriefingPlaying(false);
    } else {
      playBriefingTrack(0);
    }
  };

  const stopBriefing = () => {
    window.speechSynthesis.cancel();
    setIsBriefingPlaying(false);
    setBriefingIndex(0);
  };

  const nextBriefingTrack = () => {
    playBriefingTrack(briefingIndex + 1);
  };

  // 2. Multi-Language Translation
  const switchLanguage = async (targetLang: "English" | "Telugu" | "Hindi") => {
    if (!selectedArticle) return;
    setActiveLanguage(targetLang);
    setSummary("");

    if (targetLang === "English") {
      setTranslatedContent("");
      setTranslatedHeadline("");
      return;
    }

    try {
      setIsTranslating(true);
      const res = await fetch("http://localhost:8080/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedArticle.headline + "\n\n" + selectedArticle.content,
          language: targetLang,
        }),
      });

      const translated = await res.text();
      const parts = translated.split("\n\n");
      if (parts.length > 1) {
        setTranslatedHeadline(parts[0]);
        setTranslatedContent(parts.slice(1).join("\n\n"));
      } else {
        setTranslatedContent(translated);
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // 3. Multi-Language Summary
  const generateSummary = async () => {
    if (!selectedArticle) return;
    try {
      setSummaryLoading(true);
      const currentText = translatedContent || selectedArticle.content;
      const response = await fetch("http://localhost:8080/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentText,
          language: activeLanguage,
        }),
      });

      const data = await response.text();
      setSummary(data);
    } catch (error) {
      console.error("Summary error:", error);
    } finally {
      setSummaryLoading(false);
    }
  };

  // 4. Multi-Language Audio Speech with Speed
  const speakCurrentText = (text: string, speed: number = speechSpeed) => {
    if (!text) return;
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    if (activeLanguage === "Telugu") {
      speech.lang = "te-IN";
      const teVoice = voices.find((v) => v.lang.startsWith("te"));
      if (teVoice) speech.voice = teVoice;
    } else if (activeLanguage === "Hindi") {
      speech.lang = "hi-IN";
      const hiVoice = voices.find((v) => v.lang.startsWith("hi"));
      if (hiVoice) speech.voice = hiVoice;
    } else {
      speech.lang = "en-US";
      const enVoice = voices.find((v) => v.lang.startsWith("en"));
      if (enVoice) speech.voice = enVoice;
    }

    speech.rate = speed;
    speech.onend = () => setIsSpeaking(false);
    speech.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(speech);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // 5. Save Article
  const saveCurrentArticle = async () => {
    if (!selectedArticle) return;
    try {
      const headlineToSave = translatedHeadline || selectedArticle.headline;
      const contentToSave = translatedContent || selectedArticle.content;

      await fetch("http://localhost:8080/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: headlineToSave,
          content: contentToSave,
          category: selectedArticle.category,
        }),
      });

      alert(`Article saved successfully in ${activeLanguage}!`);
    } catch (error) {
      console.error(error);
    }
  };

  const generateExamNotes = async () => {
    if (!selectedArticle) return;
    setExamLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article: translatedContent || selectedArticle.content,
        }),
      });

      const data = await response.text();
      setExamNotes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setExamLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!selectedArticle) return;
    try {
      const response = await fetch("http://localhost:8080/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article: translatedContent || selectedArticle.content,
        }),
      });

      const data = await response.text();
      setQuiz(data);
    } catch (error) {
      console.error(error);
    }
  };

  const askAI = async () => {
    if (!selectedArticle || !question.trim()) return;
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article: translatedContent || selectedArticle.content,
          question: question,
        }),
      });

      const data = await response.text();
      setAnswer(data);
    } catch (error) {
      console.error("AI error:", error);
      setAnswer("AI service is unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStudySheet = () => {
    if (!selectedArticle) return;
    generateStudySheetPDF({
      headline: translatedHeadline || selectedArticle.headline,
      category: selectedArticle.category,
      sentiment: selectedArticle.sentiment,
      entities: selectedArticle.entities,
      content: translatedContent || selectedArticle.content,
      summary: summary || undefined,
      examNotes: examNotes || undefined,
      quiz: quiz || undefined,
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);
    formData.append("publisher", uploadPublisher);
    formData.append("edition", uploadEdition);
    formData.append("category", uploadCategory);

    try {
      setIsUploading(true);
      setUploadMessage("Uploading and extracting news articles... Please wait.");
      const response = await fetch("http://localhost:8080/api/newspapers/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadMessage("Uploaded successfully!");
        setUploadFile(null);
        setTimeout(() => {
          setIsUploadOpen(false);
          setUploadMessage("");
          loadNewspapers();
          fetchArticles("ALL");
        }, 1200);
      } else {
        setUploadMessage("Upload failed. Please check the backend console.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadMessage("Upload failed. Backend connection error.");
    } finally {
      setIsUploading(false);
    }
  };

  // Filter articles based on Tab + Clicked Hashtag
  const filteredArticles = articles.filter((art) => {
    if (selectedEntity && (!art.entities || !art.entities.includes(selectedEntity))) {
      return false;
    }
    if (selectedCategory === "Front Page") return true;
    if (selectedCategory === "Business") return art.category?.toUpperCase() === "BUSINESS";
    if (selectedCategory === "Politics" || selectedCategory === "Nation")
      return art.category?.toUpperCase() === "POLITICS" || art.category?.toUpperCase() === "GENERAL";
    if (selectedCategory === "Sports") return art.category?.toUpperCase() === "SPORTS";
    if (selectedCategory === "Times City") return art.category?.toUpperCase() === "GENERAL";
    return true;
  });

  const heroArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const secondaryArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  const getBadgeClass = (category?: string) => {
    const c = category?.toUpperCase();
    if (c === "BUSINESS") return "toi-badge toi-badge-business";
    if (c === "POLITICS") return "toi-badge toi-badge-politics";
    if (c === "SPORTS") return "toi-badge toi-badge-sports";
    return "toi-badge toi-badge-general";
  };

  const activeNewspaperName =
    selectedNewspaperId === "ALL"
      ? "THE TIMES OF INDIA"
      : newspapers.find((n) => String(n.id) === String(selectedNewspaperId))?.title?.toUpperCase() ||
        "THE TIMES OF INDIA";

  return (
    <div className="home-container">
      {/* 1. Times of India Top Header Bar */}
      <header className="toi-topbar">
        <div className="toi-brand">
          <Link to="/" className="toi-epaper-logo" style={{ textDecoration: "none", color: "inherit" }}>
            ePaper
          </Link>
          <span className="toi-divider">|</span>
          <select
            className="toi-newspaper-select"
            value={selectedNewspaperId}
            onChange={(e) => handleNewspaperChange(e.target.value)}
          >
            <option value="ALL">{activeNewspaperName} ▾</option>
            {newspapers.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title.toUpperCase()} - {n.edition || "Main Edition"} (ID: {n.id})
              </option>
            ))}
          </select>
        </div>

        {/* Right: Home, Saved, Profile, Date & Upload Newspaper */}
        <div className="toi-right-tools">
          <Link to="/" className="toi-nav-link active-home">
            Home
          </Link>
          <Link to="/saved" className="toi-nav-link">
            Saved
          </Link>
          <Link to="/profile" className="toi-nav-link">
            Profile
          </Link>

          <div className="toi-date-pill">
            <span>📅</span>
            <span>29 Oct 2026 ▾</span>
          </div>

          <button className="toi-upload-btn" onClick={() => setIsUploadOpen(true)}>
            + Upload Newspaper
          </button>
        </div>
      </header>

      {/* 2. Times of India Category Tab Bar with Red Underline */}
      <nav className="toi-category-bar">
        {["Front Page", "Times City", "Nation", "Business", "Editorial", "World", "Sports"].map((cat) => (
          <button
            key={cat}
            className={`toi-cat-btn ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory(cat);
              setSelectedEntity(null);
            }}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* 3. Main Dashboard Body */}
      <main className="toi-main-content">
        {/* Today's 60-Second Audio Briefing Podcast Widget */}
        <div className="briefing-widget">
          <div className="briefing-left">
            <div className="briefing-icon-box">🎙️</div>
            <div>
              <div className="briefing-title">
                Today's 60-Second Audio Briefing
                {isBriefingPlaying && (
                  <span className="sound-bars">
                    <span className="sound-bar" />
                    <span className="sound-bar" />
                    <span className="sound-bar" />
                    <span className="sound-bar" />
                  </span>
                )}
              </div>
              <p className="briefing-subtitle">
                {isBriefingPlaying
                  ? `Now Playing (${briefingIndex + 1} of ${Math.min(filteredArticles.length, 5)}): ${
                      filteredArticles[briefingIndex]?.headline.substring(0, 70) || ""
                    }...`
                  : "Listen to the top 5 morning headlines sequentially like an AI radio podcast"}
              </p>
            </div>
          </div>

          <div className="briefing-controls">
            {/* Speed Toggle */}
            <div className="speed-toggle-group">
              {[1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  className={`speed-btn ${briefingSpeed === speed ? "active" : ""}`}
                  onClick={() => {
                    setBriefingSpeed(speed);
                    if (isBriefingPlaying) playBriefingTrack(briefingIndex, speed);
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Play/Pause Button */}
            <button className="briefing-play-btn" onClick={startBriefing}>
              {isBriefingPlaying ? "⏸ Pause Briefing" : "▶ Play 60s Briefing"}
            </button>

            {isBriefingPlaying && (
              <>
                <button
                  className="briefing-play-btn"
                  style={{ backgroundColor: "#334155" }}
                  onClick={nextBriefingTrack}
                  title="Next headline"
                >
                  ⏩ Next
                </button>
                <button
                  className="briefing-play-btn"
                  style={{ backgroundColor: "#475569" }}
                  onClick={stopBriefing}
                >
                  ⏹ Stop
                </button>
              </>
            )}
          </div>
        </div>

        {/* Section Heading & Entity Filter Notice */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 className="toi-section-title" style={{ margin: 0 }}>
            {selectedCategory}
          </h1>

          {selectedEntity && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                color: "#1d4ed8",
                fontWeight: "600",
              }}
            >
              <span>Filtering by: <strong>{selectedEntity}</strong></span>
              <button
                onClick={() => setSelectedEntity(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#1d4ed8",
                  fontWeight: "bold",
                  fontSize: "15px",
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Keyword Search Bar */}
        <div className="toi-search-section">
          <input
            className="toi-search-input"
            type="text"
            placeholder="Search news by keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchArticles()}
          />
          <button
            className="toi-read-btn"
            style={{ padding: "10px 18px", borderRadius: "24px" }}
            onClick={searchArticles}
          >
            Search
          </button>
          {keyword && (
            <button
              className="toi-read-btn"
              style={{ padding: "10px 16px", borderRadius: "24px", backgroundColor: "#94a3b8" }}
              onClick={() => {
                setKeyword("");
                fetchArticles(selectedNewspaperId);
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Empty State / Fallback */}
        {filteredArticles.length === 0 && (
          <div
            style={{
              backgroundColor: "white",
              padding: "50px 20px",
              borderRadius: "16px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <span style={{ fontSize: "45px", display: "block", marginBottom: "12px" }}>📰</span>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
              No articles found in {selectedCategory} for this edition.
            </h3>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>
              Try selecting "All Editions", choosing "Front Page", or uploading a new newspaper PDF.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("Front Page");
                setSelectedEntity(null);
                if (articles.length === 0) {
                  handleNewspaperChange("ALL");
                }
              }}
              className="toi-read-btn"
            >
              {articles.length > 0 ? "Show All Articles for This Edition" : "View All Newspaper Articles"}
            </button>
          </div>
        )}

        {/* 4. Featured Hero Story Card */}
        {heroArticle && (
          <div className="toi-hero-card">
            {/* Visual Image / Thumbnail */}
            <div className="toi-hero-image-box">
              <img
                src={
                  heroArticle.category?.toUpperCase() === "BUSINESS"
                    ? "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60"
                    : heroArticle.category?.toUpperCase() === "SPORTS"
                    ? "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=60"
                    : "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=60"
                }
                alt="News Hero"
                className="toi-hero-img"
              />
            </div>

            {/* Headline, Bias Indicator, Entities & Read More */}
            <div className="toi-hero-content">
              <div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
                  <span className={getBadgeClass(heroArticle.category)}>
                    {heroArticle.category || "General"}
                  </span>

                  {/* Sentiment / Tone Indicator */}
                  <span
                    className={`sentiment-badge sentiment-${heroArticle.sentiment.toLowerCase()}`}
                  >
                    ● {heroArticle.sentiment} Tone
                  </span>
                </div>

                <h2 className="toi-hero-headline">{heroArticle.headline}</h2>

                <p className="toi-hero-snippet">
                  {heroArticle.content.substring(0, 260)}...
                </p>

                {/* Clickable Entity Hashtags */}
                <div className="entity-tags-row">
                  {heroArticle.entities?.map((tag) => (
                    <span
                      key={tag}
                      className="entity-chip"
                      onClick={() => setSelectedEntity(tag)}
                      title={`Filter by ${tag}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "18px" }}>
                <button
                  className="toi-read-btn"
                  onClick={() => {
                    setSelectedArticle(heroArticle);
                    setActiveLanguage("English");
                    setTranslatedContent("");
                    setTranslatedHeadline("");
                    setSummary("");
                    setQuiz("");
                    setExamNotes("");
                    setQuestion("");
                    setAnswer("");
                  }}
                >
                  Read More
                </button>

                <button
                  onClick={() => speakCurrentText(heroArticle.headline)}
                  style={{
                    padding: "9px 16px",
                    backgroundColor: "#f1f5f9",
                    color: "#0f172a",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  🔊 Listen Headline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Secondary Articles Grid */}
        {secondaryArticles.length > 0 && (
          <div className="toi-articles-grid">
            {secondaryArticles.map((article) => (
              <div key={article.id} className="toi-card">
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span className={getBadgeClass(article.category)}>
                      {article.category || "General"}
                    </span>

                    {/* Sentiment / Tone Indicator */}
                    <span className={`sentiment-badge sentiment-${article.sentiment.toLowerCase()}`}>
                      ● {article.sentiment}
                    </span>
                  </div>

                  <h3 className="toi-card-headline">{article.headline}</h3>

                  <p className="toi-card-snippet">
                    {article.content.substring(0, 180)}...
                  </p>

                  {/* Clickable Entity Hashtags */}
                  <div className="entity-tags-row">
                    {article.entities?.map((tag) => (
                      <span
                        key={tag}
                        className="entity-chip"
                        onClick={() => setSelectedEntity(tag)}
                        title={`Filter by ${tag}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <button
                    className="toi-read-btn"
                    style={{ fontSize: "13px", padding: "7px 14px" }}
                    onClick={() => {
                      setSelectedArticle(article);
                      setActiveLanguage("English");
                      setTranslatedContent("");
                      setTranslatedHeadline("");
                      setSummary("");
                      setQuiz("");
                      setExamNotes("");
                      setQuestion("");
                      setAnswer("");
                    }}
                  >
                    Read More
                  </button>

                  <button
                    onClick={() => speakCurrentText(article.headline)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#6d28d9",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    🔊 Listen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 6. Multi-Language Interactive Reading Modal */}
      {selectedArticle && (
        <div className="popup-overlay">
          <button
            className="close-button"
            onClick={() => {
              stopSpeech();
              setSelectedArticle(null);
            }}
          >
            ×
          </button>

          <div className="popup-container">
            {/* Category, Tone & Language Selection Pills */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span className={getBadgeClass(selectedArticle.category)}>
                  {selectedArticle.category || "General"}
                </span>
                <span className={`sentiment-badge sentiment-${selectedArticle.sentiment.toLowerCase()}`}>
                  ● {selectedArticle.sentiment} Tone
                </span>
              </div>

              {/* Language Pills */}
              <div style={{ display: "flex", gap: "6px", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "20px" }}>
                {(["English", "Telugu", "Hindi"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => switchLanguage(lang)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "16px",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      backgroundColor: activeLanguage === lang ? "#d9232d" : "transparent",
                      color: activeLanguage === lang ? "white" : "#475569",
                      transition: "all 0.2s",
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Headline */}
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "14px", lineHeight: "1.35" }}>
              {isTranslating ? "Translating headline..." : translatedHeadline || selectedArticle.headline}
            </h2>

            {/* Entity Tags */}
            <div className="entity-tags-row" style={{ marginBottom: "18px" }}>
              {selectedArticle.entities?.map((t) => (
                <span key={t} className="entity-chip">{t}</span>
              ))}
            </div>

            {/* Multi-Language Action Buttons: Summary, Save, Listen, Speed, Exam Notes, Quiz, Download PDF */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", marginBottom: "20px" }}>
              <button
                className="action-btn-pill"
                onClick={generateSummary}
                style={{ backgroundColor: summary ? "#0284c7" : "#0ea5e9", color: "white" }}
              >
                {summaryLoading ? "Generating..." : `📌 Summary (${activeLanguage})`}
              </button>

              <button
                className="action-btn-pill"
                onClick={() =>
                  speakCurrentText(
                    (translatedHeadline || selectedArticle.headline) +
                      ". " +
                      (translatedContent || selectedArticle.content),
                    speechSpeed
                  )
                }
                style={{ backgroundColor: "#8b5cf6", color: "white" }}
              >
                {isSpeaking ? "🔊 Speaking..." : `🔊 Listen (${activeLanguage})`}
              </button>

              {/* Speech Speed Selector */}
              <div style={{ display: "flex", backgroundColor: "#f1f5f9", borderRadius: "16px", padding: "2px" }}>
                {[1.0, 1.25, 1.5].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSpeechSpeed(s);
                      if (isSpeaking) {
                        speakCurrentText(
                          (translatedHeadline || selectedArticle.headline) +
                            ". " +
                            (translatedContent || selectedArticle.content),
                          s
                        );
                      }
                    }}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "14px",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: "700",
                      backgroundColor: speechSpeed === s ? "#0f172a" : "transparent",
                      color: speechSpeed === s ? "white" : "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {isSpeaking && (
                <button
                  className="action-btn-pill"
                  onClick={stopSpeech}
                  style={{ backgroundColor: "#ef4444", color: "white" }}
                >
                  ⏹ Stop
                </button>
              )}

              <button
                className="action-btn-pill"
                onClick={saveCurrentArticle}
                style={{ backgroundColor: "#10b981", color: "white" }}
              >
                💾 Save ({activeLanguage})
              </button>

              <button
                className="action-btn-pill"
                onClick={generateQuiz}
                style={{ backgroundColor: "#f59e0b", color: "white" }}
              >
                📝 Quiz
              </button>

              <button
                className="action-btn-pill"
                onClick={generateExamNotes}
                style={{ backgroundColor: "#6366f1", color: "white" }}
              >
                📚 Exam Notes
              </button>

              {/* Download UPSC Study Sheet PDF Button */}
              <button
                className="action-btn-pill"
                onClick={handleDownloadStudySheet}
                style={{ backgroundColor: "#047857", color: "white" }}
                title="Download formatted UPSC / Competitive Exam Study Sheet PDF"
              >
                📄 Download Study PDF
              </button>
            </div>

            {/* AI Summary Box */}
            {summaryLoading && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  backgroundColor: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  color: "#0369a1",
                  fontWeight: "600",
                  marginBottom: "16px",
                }}
              >
                Generating AI summary in {activeLanguage}...
              </div>
            )}
            {summary && (
              <div
                style={{
                  padding: "20px",
                  borderRadius: "12px",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #86efac",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h3 style={{ color: "#166534", margin: 0, fontSize: "17px", fontWeight: "bold" }}>
                    📌 Key Highlights ({activeLanguage})
                  </h3>
                  <button
                    onClick={() => speakCurrentText(summary)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#15803d",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    🔊 Listen Summary
                  </button>
                </div>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.7",
                    fontSize: "15px",
                    fontFamily: "inherit",
                    color: "#1e293b",
                    margin: 0,
                  }}
                >
                  {summary}
                </pre>
              </div>
            )}

            {/* Exam Notes Box */}
            {examLoading && <p style={{ color: "#6366f1" }}>Generating competitive exam notes...</p>}
            {examNotes && (
              <div
                style={{
                  padding: "20px",
                  borderRadius: "10px",
                  backgroundColor: "#faf5ff",
                  border: "1px solid #e9d5ff",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ color: "#7e22ce", margin: "0 0 10px 0" }}>📚 UPSC / Competitive Exam Notes</h3>
                <pre style={{ whiteSpace: "pre-wrap", lineHeight: "1.7", fontSize: "15px", fontFamily: "inherit" }}>
                  {examNotes}
                </pre>
              </div>
            )}

            {/* Quiz Box */}
            {quiz && (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "10px",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ color: "#b45309", margin: "0 0 10px 0" }}>📝 Quiz Questions</h3>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: "15px", fontFamily: "inherit" }}>{quiz}</pre>
              </div>
            )}

            {/* Article Body Content */}
            <div
              className="article-content"
              style={{
                fontSize: "16px",
                color: "#1e293b",
                lineHeight: "1.8",
                marginTop: "15px",
                padding: "10px 0",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              {isTranslating ? (
                <div style={{ color: "#64748b", fontStyle: "italic", padding: "20px 0" }}>
                  Translating article into {activeLanguage}...
                </div>
              ) : (
                translatedContent || selectedArticle.content
              )}
            </div>

            {/* AI Interactive Chat */}
            <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "10px" }}>
                🤖 Ask AI About This Article
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Ask any question regarding this news story..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askAI()}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                />
                <button
                  onClick={askAI}
                  disabled={loading}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#0f172a",
                    color: "white",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {loading ? "Thinking..." : "Ask"}
                </button>
              </div>

              {answer && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "14px",
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    lineHeight: "1.6",
                  }}
                >
                  <strong>Answer:</strong> {answer}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Newspaper PDF Modal */}
      {isUploadOpen && (
        <div className="popup-overlay">
          <button
            className="close-button"
            onClick={() => {
              if (!isUploading) setIsUploadOpen(false);
            }}
          >
            ×
          </button>
          <div className="popup-container" style={{ maxWidth: "500px", width: "90%" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "15px" }}>
              Upload New Newspaper (PDF)
            </h2>

            <form onSubmit={handleUploadSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>
                  Select PDF File:
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                    }
                  }}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>
                  Newspaper Title:
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  required
                  onChange={(e) => setUploadTitle(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Edition:</label>
                <input
                  type="text"
                  value={uploadEdition}
                  required
                  onChange={(e) => setUploadEdition(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Publisher:</label>
                <input
                  type="text"
                  value={uploadPublisher}
                  required
                  onChange={(e) => setUploadPublisher(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>
                  Default Category:
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                >
                  <option value="General">General</option>
                  <option value="Business">Business</option>
                  <option value="Politics">Politics</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              {uploadMessage && (
                <div
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    backgroundColor: uploadMessage.includes("success") ? "#dcfce7" : "#e0f2fe",
                    color: uploadMessage.includes("success") ? "#15803d" : "#0369a1",
                    fontSize: "14px",
                  }}
                >
                  {uploadMessage}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="submit"
                  disabled={isUploading}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: isUploading ? "#94a3b8" : "#d9232d",
                    color: "white",
                    fontWeight: "bold",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isUploading ? "not-allowed" : "pointer",
                  }}
                >
                  {isUploading ? "Uploading & Extracting..." : "Upload Newspaper"}
                </button>

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setIsUploadOpen(false)}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#e2e8f0",
                    color: "#334155",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
