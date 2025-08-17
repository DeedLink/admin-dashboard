const Header = () => {
  return (
    <header className="w-full bg-black text-white px-8 py-4 flex justify-between items-center border-b border-gray-800">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <button className="px-4 py-2 rounded-xl bg-primary_bold hover:bg-primary_light transition-all">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;