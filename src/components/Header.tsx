import { useWallet } from "../contexts/WalletContext";
import { useState } from "react";
import PassPopup from "./PassPopup";
import { useLogin } from "../contexts/LoginContext";

const Header = () => {
  const { account, connect, disconnect } = useWallet();
  const [isHovering, setIsHovering] = useState(false);
  const [isPassOpen, setIsPassOpen] = useState(false);
  const { user } = useLogin();

  const formatAccount = (acc: string | null) => {
    if (!acc) return "Connect Wallet";
    return acc.slice(0, 6) + "..." + acc.slice(-4);
  };

  return (
    <header className="w-full bg-black text-white px-6 sm:px-12 py-4 flex justify-between items-center border-b border-gray-800 shadow-md">
      <button
        disabled={user?.role === "admin"}
        onClick={() => setIsPassOpen(true)}
        className={`px-2 py-1 rounded-xl w-32 h-10 ${
          user?.role === "admin" ? "bg-gray-500 text-white" : "cursor-pointer hover:bg-gray-300 bg-gray-200 text-black"
        }`}
      >
        {user?.role === "admin" ? "MFA Logged" : "Get Pass"}
      </button>
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
      {
        isPassOpen && (
          <PassPopup onClose={()=>setIsPassOpen(false)}/>
        )
      }
    </header>
  );
};

export default Header;
