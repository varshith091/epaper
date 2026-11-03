import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-slate-950 text-white p-5">

      <h2 className="text-xl font-bold mb-8">
        Dashboard
      </h2>

      <ul className="space-y-4">

        <li>
          <Link to="/dashboard">
            Home
          </Link>
        </li>

        <li>
          <Link to="/newspaper">
            Today's Newspaper
          </Link>
        </li>

        <li>
          <Link to="/search">
            Search
          </Link>
        </li>

        <li>
          <Link to="/bookmark">
            Bookmarks
          </Link>
        </li>

        <li>
          <Link to="/history">
            History
          </Link>
        </li>

        <li>
          <Link to="/chat">
            AI Chat
          </Link>
        </li>

        <li>
          <Link to="/exam">
            Competitive Exam
          </Link>
        </li>

      </ul>

    </div>
  );
}

export default Sidebar;