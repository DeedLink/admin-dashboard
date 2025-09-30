import { ShieldCheck, MapPin, FileSignature, Building2 } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

const navItems = [
  { id: "kyc", label: "KYC Verification", icon: ShieldCheck },
  { id: "surveyor", label: "Surveyor Requests", icon: MapPin },
  { id: "ivsl", label: "IVSL Requests", icon: Building2 },
  { id: "notary", label: "Notary Requests", icon: FileSignature }
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => (
  <aside className="w-72 bg-gradient-to-b from-black via-gray-900 to-black text-white h-screen shadow-2xl p-6 rounded-tr-3xl rounded-br-3xl flex flex-col justify-between border-r border-gray-800">
    <div>
      <h2 className="text-3xl font-extrabold mb-12 text-center tracking-wide bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-transparent bg-clip-text drop-shadow-md">
        Registrar Admin
      </h2>
      <ul className="space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`group flex items-center gap-4 p-2 rounded-xl cursor-pointer transition-all duration-300 font-medium relative overflow-hidden ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg scale-[1.02]"
                  : "hover:bg-gray-800/60"
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                  activeTab === item.id
                    ? "bg-white/20"
                    : "bg-gray-800 group-hover:bg-gray-700"
                }`}
              >
                <Icon size={20} />
              </div>
              <span className="tracking-wide">{item.label}</span>
              {activeTab === item.id && (
                <span className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-green-400 to-emerald-600 rounded-r-lg" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
    <div className="text-xs text-gray-500 text-center mt-8">
      © {new Date().getFullYear()} DeedLink Admin
    </div>
  </aside>
);

export default Sidebar;
