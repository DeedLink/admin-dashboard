import { useState } from "react";
import InputField from "../common/InputField";

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
    const success = await onSubmit({ username, email, nic, walletAddress, role });
    if (success) {
      setUsername("");
      setEmail("");
      setNic("");
      setWalletAddress("");
      setRole("notary");
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-8 shadow-xl border border-gray-700">
      <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center text-black">
        Register Department User
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField label="Name" type="text" value={username} onChange={setUsername} />
        <InputField label="Email" type="email" value={email} onChange={setEmail} />
        <InputField label="NIC" type="text" value={nic} onChange={setNic} />
        <InputField label="Wallet Address" type="text" value={walletAddress} onChange={setWalletAddress} />

        <div>
          <label className="block text-sm font-medium text-black mb-2">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "notary" | "surveyor" | "IVSL")}
            className="w-full px-4 py-2 rounded-lg bg-gray-200 border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none text-black"
          >
            <option value="notary">Notary</option>
            <option value="surveyor">Surveyor</option>
            <option value="IVSL">IVSL</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 active:bg-green-800 font-semibold text-white tracking-wide transition"
        >
          Register User
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
