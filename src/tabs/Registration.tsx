import { useState } from "react";
import { registerDepartmentUser } from "../api/api";
import { useLoader } from "../contexts/LoaderContext";
import { useToast } from "../contexts/ToastContext";

const Registration = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [nic, setNic] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [role, setRole] = useState<"notary" | "surveyor" | "IVSL">("notary");
  const { showLoader, hideLoader } = useLoader();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoader();
    try {
      const response = await registerDepartmentUser(
        username,
        email,
        nic,
        walletAddress.toLowerCase(),
        role
      );
      console.log("User registered:", response.user);

      setUsername("");
      setEmail("");
      setNic("");
      setWalletAddress("");
      setRole("notary");

      showToast("User registered successfully!", "success");
    } catch (error) {
      console.error("Error registering user:", error);
      showToast("Failed to register user. Please try again.", "error");
    }
    hideLoader();
  };

  return (
    <div className="w-full h-full text-white flex flex-col items-center justify-start px-6 py-10 bg-black">
      <div className="w-full max-w-xl bg-white text-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200">
        <h1 className="text-2xl font-semibold mb-8 text-center">
          Department User Registration
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-500/30 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-500/30 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIC
            </label>
            <input
              type="text"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-500/30 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-500/30 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "notary" | "surveyor" | "IVSL")
              }
              className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-500/30 outline-none transition"
            >
              <option value="notary">Notary</option>
              <option value="surveyor">Surveyor</option>
              <option value="IVSL">IVSL</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 rounded-lg bg-green-600 hover:bg-green-700 active:bg-green-800 transition font-semibold text-white shadow-md"
          >
            Register User
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
