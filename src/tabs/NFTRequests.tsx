import { useState, useEffect } from "react";

interface Request {
  id: string;
  user: string;
  landId: string;
  status: "pending" | "minted";
}

const dummyRequests: Request[] = [
  { id: "1", user: "John Doe", landId: "LAND-101", status: "pending" },
  { id: "2", user: "Jane Smith", landId: "LAND-102", status: "pending" },
];

const NFTRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    // In real app, fetch pending requests from backend
    setRequests(dummyRequests);
  }, []);

  const handleMint = (id: string) => {
    // Call your minting function/API here
    alert(`Minting NFT for request ${id}`);

    // Update UI status
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "minted" } : req
      )
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-white">
      <h3 className="text-xl font-bold mb-4">NFT Minting Requests</h3>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left border-b border-gray-600">
            <th className="py-2 px-4">User</th>
            <th className="py-2 px-4">Land ID</th>
            <th className="py-2 px-4">Status</th>
            <th className="py-2 px-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="border-b border-gray-700">
              <td className="py-2 px-4">{req.user}</td>
              <td className="py-2 px-4">{req.landId}</td>
              <td className="py-2 px-4 capitalize">{req.status}</td>
              <td className="py-2 px-4">
                {req.status === "pending" && (
                  <button
                    onClick={() => handleMint(req.id)}
                    className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-lg"
                  >
                    Mint NFT
                  </button>
                )}
                {req.status === "minted" && (
                  <span className="text-gray-400">Minted</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NFTRequests;
