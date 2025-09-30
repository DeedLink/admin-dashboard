import { useWallet } from "../contexts/WalletContext";
import { useState } from "react";

const Header = () => {
  const { account, connect, disconnect } = useWallet();
  const [isHovering, setIsHovering] = useState(false);

  const formatAccount = (acc: string | null) => {
    if (!acc) return "Connect Wallet";
    return acc.slice(0, 6) + "..." + acc.slice(-4);
  };

  return (
    <header className="w-full bg-black text-white px-6 sm:px-12 py-4 flex justify-end items-center border-b border-gray-800 shadow-md">
      <div className="flex items-center">
        {!account ? (
          <button
            onClick={connect}
            className="w-40 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors bg-green-600 hover:bg-green-700 text-white"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={disconnect}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors w-40 ${
              isHovering
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-white"
            }`}
          >
            {isHovering ? "Disconnect" : formatAccount(account)}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
