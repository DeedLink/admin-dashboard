import { ChartBar ,CircleUser, ShieldCheck, MapPin, FileSignature, Building2, Book, GitBranch, Wallet } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

const navItems = [
  { id: "analatics", label: "Analytics Dashboard", icon: ChartBar },
  { id: "nft-tracker", label: "NFT Tracker", icon: GitBranch },
  { id: "payments", label: "Payments", icon: Wallet },
  { id: "kyc", label: "KYC Verification", icon: ShieldCheck },
  { id: "Regitration", label: "Registration", icon: CircleUser },
  { id: "surveyor", label: "Surveyor Requests", icon: MapPin },
  { id: "ivsl", label: "IVSL Requests", icon: Building2 },
  { id: "notary", label: "Notary Requests", icon: FileSignature },
  { id: "logs", label: "Logs", icon: Book },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => (
  <div className="h-screen w-64 bg-black text-gray-100 flex flex-col justify-between p-4 border-r-[1px] border-r-white/20">
    <div>
      <h2 className="text-lg font-bold mb-8 px-2">Registrar Admin</h2>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === item.id
                  ? "bg-green-600 text-white"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
    <footer className="text-xs text-gray-500 px-2">
      © {new Date().getFullYear()} DeedLink Admin
    </footer>
  </div>
);

export default Sidebar;
