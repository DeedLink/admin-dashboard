interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}

const InputField = ({ label, type, value, onChange }: InputFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-black mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 rounded-lg bg-gray-200 border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none text-black"
      required
    />
  </div>
);

export default InputField;
