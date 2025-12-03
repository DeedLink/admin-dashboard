import { useState, useEffect } from "react";
import { requestAdminOTP, verifyAdminOTP } from "../api/api";
import { useWallet } from "../contexts/WalletContext";
import { useLogin } from "../contexts/LoginContext";
import { setItem } from "../storage/storage";

const PassPopup = ({ onClose }: { onClose: () => void }) => {
  const [pin, setPin] = useState<string>("");
  const {account} = useWallet();
  const [error, setError] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const { login } = useLogin();

  const pinValidation = (value: string) => /^\d{6}$/.test(value);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
        setResendCooldown(60);
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

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return; // Prevent resend during cooldown
    
    if (!account) {
      setError("Please enter your wallet address.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await requestAdminOTP(account);
      if (res.status === "otp_sent") {
        setResendCooldown(60); // Reset cooldown timer
        setError(""); // Clear any previous errors
      } else {
        setError("Failed to resend OTP. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to resend OTP. Try again.");
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
      setItem("local", "token", res.token);
      login(res.user);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {!otpSent ? "Admin Authentication" : "Enter OTP Code"}
            </h2>
            <p className="text-white/60 text-sm">
              {!otpSent
                ? "Verify your admin wallet to continue"
                : "We've sent a 6-digit code to your registered email"}
            </p>
          </div>

          {!otpSent ? (
            <>
              <div className="mb-4">
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={account || ""}
                  disabled={true}
                  placeholder="Enter admin wallet"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-sm cursor-not-allowed"
                />
              </div>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                  <p className="text-red-300 text-sm text-center">{error}</p>
                </div>
              )}
              <button
                onClick={handleRequestOTP}
                disabled={loading}
                className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setPin(value);
                  }}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-center text-2xl tracking-widest font-mono"
                  autoFocus
                />
              </div>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                  <p className="text-red-300 text-sm text-center">{error}</p>
                </div>
              )}
              <button
                onClick={handleVerifyOTP}
                disabled={loading || pin.length !== 6}
                className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mb-3"
              >
                {loading ? "Verifying..." : "Verify & Get Access"}
              </button>
              <div className="text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || loading}
                  className="text-white/70 text-sm hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline underline-offset-2"
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend code"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassPopup;
