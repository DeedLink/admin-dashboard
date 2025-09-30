import { useWallet } from "../contexts/WalletContext";
import { useState } from "react";

const Header = () => {
  const { account, connect } = useWallet();
  const [isHovering, setIsHovering] = useState(false);

  const formatAccount = (acc: string | null) => {
    if (!acc) return "Connect Wallet";
    return acc.slice(0, 6) + "..." + acc.slice(-4);
  };

  return (
    <header className="w-full bg-black text-white px-6 sm:px-12 py-4 flex justify-between items-center border-b border-gray-800 shadow-md">
      <h1 className="text-xl sm:text-2xl font-bold tracking-wide select-none">
        DeedLink Admin
      </h1>

      <div className="flex items-center space-x-4">
        <button
          onClick={connect}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`cursor-pointer relative px-5 py-2 rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 overflow-hidden border-2 border-transparent
            ${account ? "bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-indigo-500 hover:to-blue-600 shadow-lg" : "bg-gray-800 hover:bg-gray-700"}
          `}
        >
          <span className="relative z-10">{formatAccount(account)}</span>
          {account && (
            <span
              className={`absolute inset-0 bg-white opacity-0 ${
                isHovering ? "opacity-10" : "opacity-0"
              } rounded-2xl transition-opacity duration-300`}
            />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
