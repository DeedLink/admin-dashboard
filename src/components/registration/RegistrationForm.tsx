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

const roleLabels: Record<"notary" | "surveyor" | "IVSL", string> = {
  notary: "Notary",
  surveyor: "Surveyor",
  IVSL: "IVSL Analyst",
};

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
    <div className="w-full rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-black/40 p-6 shadow-2xl">
      <div className="flex flex-col gap-2 text-center md:text-left mb-6">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-300/80">Issue Credentials</p>
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Register Department User</h2>
        <p className="text-sm text-white/60">
          Provision notarized access for ministry staff and align their wallet identity with registry permissions.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField
          label="Full Name"
          type="text"
          value={username}
          placeholder="Dr. Tharindu Jayasekara"
          onChange={setUsername}
        />
        <InputField
          label="Official Email"
          type="email"
          value={email}
          placeholder="name@dept.gov.lk"
          onChange={setEmail}
        />
        <InputField label="NIC" type="text" value={nic} placeholder="200012345678" onChange={setNic} />
        <InputField label="Wallet Address" type="text" value={walletAddress} placeholder="0x..." onChange={setWalletAddress} />

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-semibold text-white/80">Assign Role</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["notary", "surveyor", "IVSL"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                  role === option
                    ? "border-emerald-400 bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/30"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-white/40"
                }`}
              >
                {roleLabels[option]}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/50">Roles control signing authority and dashboard scope.</p>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 py-3.5 text-center text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition"
          >
            Issue Access Pass
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
