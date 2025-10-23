import { useState } from "react";
import { registerDepartmentUser } from "../api/api";
import { useLoader } from "../contexts/LoaderContext";
import { useToast } from "../contexts/ToastContext";

const Regitration = () => {
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
    <div className="w-full h-full text-white flex items-center flex-col p-8 justify-start">
        <h1 className="text-2xl font-bold mb-6">Department User Registration</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full">
            <div>
                <label className="block mb-1">Name:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                />
            </div>
            <div>
                <label className="block mb-1">Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                />
            </div>
            <div>
                <label className="block mb-1">NIC:</label>
                <input
                    type="text"
                    value={nic}
                    onChange={(e) => setNic(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                />
            </div>
            <div>
                <label className="block mb-1">Wallet Address:</label>
                <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                />
            </div>
            <div>
                <label className="block mb-1">Role:</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as "notary" | "surveyor" | "IVSL")}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                >
                    <option value="notary">Notary</option>
                    <option value="surveyor">Surveyor</option>
                    <option value="IVSL">IVSL</option>
                </select>
            </div>
            <button
                type="submit"
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition"
            >
                Register User
            </button>
        </form>
    </div>
  );
};

export default Regitration;