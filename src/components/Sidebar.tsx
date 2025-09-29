import { Users, ShieldCheck, Gift } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

const navItems = [
  { id: "users", label: "User Management", icon: Users },
  { id: "kyc", label: "KYC Verification", icon: ShieldCheck },
  { id: "nftRequests", label: "NFT Minting Requests", icon: Gift },
  { id: "surveyor", label: "Surveyor Requests", icon: Users}
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => (
  <aside className="w-64 bg-black text-white h-screen shadow-xl p-5 rounded-tr-2xl rounded-br-2xl">
    <h2 className="text-2xl font-bold mb-10 text-center">Registrar Admin</h2>
    <ul className="space-y-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
              activeTab === item.id
                ? "bg-green-600 text-white shadow-lg"
                : "hover:bg-gray-800"
            }`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </li>
        );
      })}
    </ul>
  </aside>
);

export default Sidebar;
