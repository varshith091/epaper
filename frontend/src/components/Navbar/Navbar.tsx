function Navbar() {
  return (
    <nav className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 border-b border-slate-800">

      <h1 className="text-2xl font-bold text-blue-500">
        AI ePaper
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-300">
          Welcome, User
        </span>

        <button className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600">
          Logout
        </button>
      </div>

    </nav>
  );
}

export default Navbar;