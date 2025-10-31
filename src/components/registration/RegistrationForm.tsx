import { useState } from "react";

interface RegistrationFormProps {
  onSubmit: (formData: {
    username: string;
    email: string;
    nic: string;
    walletAddress: string;
    role: "notary" | "surveyor" | "IVSL";
  }) => Promise<boolean>;
}

const RegistrationForm = ({ onSubmit }: RegistrationFormProps) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [nic, setNic] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [role, setRole] = useState<"notary" | "surveyor" | "IVSL">("notary");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await onSubmit({
      username,
      email,
      nic,
      walletAddress,
      role,
    });

    if (success) {
      setUsername("");
      setEmail("");
      setNic("");
      setWalletAddress("");
      setRole("notary");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white text-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200">
      <h2 className="text-2xl font-semibold mb-8 text-center">
        Department User Registration
      </h2>

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
  );
};

export default RegistrationForm;