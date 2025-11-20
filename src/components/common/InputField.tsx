interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}

const InputField = ({ label, type, value, placeholder, onChange }: InputFieldProps) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-white/80">{label}</label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
      required
    />
  </div>
);

export default InputField;
