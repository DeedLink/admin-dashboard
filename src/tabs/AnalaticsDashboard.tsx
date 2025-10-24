import DeedCard from "../components/analaticcards/DeedCard";
import UsersCard from "../components/analaticcards/UsersCard";

const AnalaticsDashboard = () => {
  return(
    <div className="text-white flex md:flex-row flex-col gap-6 w-full">
        <div className="w-full"><UsersCard/></div>
        <div className="w-full"><DeedCard/></div>
    </div>
  );
}

export default AnalaticsDashboard;