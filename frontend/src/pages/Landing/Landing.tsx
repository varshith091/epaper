import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-5 border-b border-slate-800">

        <h1 className="text-3xl font-bold text-blue-500">
          AI ePaper
        </h1>

        <div className="space-x-4">

          <Link to="/login">
            <button className="px-5 py-2 border border-blue-500 rounded-lg hover:bg-blue-500 transition">
              Login
            </button>
          </Link>

          <Link to="/register">
            <button className="px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
              Register
            </button>
          </Link>

        </div>

      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center h-[85vh] text-center px-6">

        <h1 className="text-6xl font-bold max-w-5xl">
          Smart Interactive AI ePaper
        </h1>

        <p className="mt-8 text-xl text-gray-400 max-w-3xl">
          Transform traditional newspapers into an intelligent,
          searchable and multilingual platform powered by
          OCR, NLP, RAG and Artificial Intelligence.
        </p>

        <div className="mt-10 flex gap-5">

          <Link to="/register">
            <button className="bg-blue-600 px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition">
              Get Started
            </button>
          </Link>

          <button className="border border-gray-600 px-8 py-3 rounded-lg text-lg hover:bg-gray-800 transition">
            Learn More
          </button>

        </div>

      </section>

    </div>
  );
}

export default Landing;