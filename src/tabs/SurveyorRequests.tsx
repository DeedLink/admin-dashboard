import { addSigner } from "../web3.0/contractService";

const SurveyorRequests=()=>{

    async function handleAddSigner(address: string) {
    try {
        const tx = await addSigner("SURVEYOR", address);
        console.log("Signer added:", tx);
    } catch (err) {
        console.error("Error adding signer:", err);
    }
    }

    return(
        <div className="border w-full h-full bg-green-500 flex items-center justify-center text-white">
            <button onClick={()=>handleAddSigner('0x976EA74026E726554dB657fA54763abd0C3a0aa9')} className="bg-red-500 p-2 rounded-xl cursor-pointer">add surveyor signer as {'0x976EA74026E726554dB657fA54763abd0C3a0aa9'}</button>
        </div>
    )
}

export default SurveyorRequests;