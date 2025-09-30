import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Loader=()=>{
    return(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="animate-spin text-6xl text-green-400">
            <AiOutlineLoading3Quarters />
          </div>
        </div>
    )
}

export default Loader;