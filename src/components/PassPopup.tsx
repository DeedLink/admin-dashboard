import { useState } from "react";
import { requestAdminOTP, verifyAdminOTP } from "../api/api";
import { useWallet } from "../contexts/WalletContext";

const PassPopup = ({ onClose }: { onClose: () => void }) => {
  const [pin, setPin] = useState<string>("");
  const {account} = useWallet();
  const [error, setError] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const pinValidation = (value: string) => /^\d{6}$/.test(value);

  const handleRequestOTP = async () => {
    if (!account) {
      setError("Please enter your wallet address.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await requestAdminOTP(account);
      if (res.status === "otp_sent") {
        setOtpSent(true);
      } else {
        setError("Wallet not registered as admin.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!pinValidation(pin)) {
      setError("Please enter a valid 6-digit PIN.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await verifyAdminOTP(account || "", pin);
      console.log("Admin token:", res.token);
      localStorage.setItem("token", `"${res.token}"`);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
      <div className="w-80 bg-white/10 border border-white/30 rounded-2xl flex flex-col items-center justify-center p-4 shadow-lg backdrop-blur-md">
        {!otpSent ? (
          <>
            <input
              type="text"
              value={account || ""}
              disabled={true}
              placeholder="Enter admin wallet"
              className="w-full mb-2 p-2 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 text-center text-xs cursor-not-allowed"
            />
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <button
              onClick={handleRequestOTP}
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition-all"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              className="w-full mb-2 p-2 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 text-center tracking-widest"
            />
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition-all"
            >
              {loading ? "Verifying..." : "Get Access"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PassPopup;
