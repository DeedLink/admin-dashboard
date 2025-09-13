import { CheckCircle, XCircle } from "lucide-react";

const kycRequests = [
  { id: "KYC001", user: "Alice Johnson", document: "Passport", status: "Pending" },
  { id: "KYC002", user: "Bob Smith", document: "Driver's License", status: "Pending" },
];

const KYCQueue = () => {
  return (
    <div className="bg-gray-900 text-white rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-semibold mb-4">KYC Verification</h2>
      <div className="space-y-4">
        {kycRequests.map((req) => (
          <div
            key={req.id}
            className="flex justify-between items-center bg-black rounded-xl p-4 hover:bg-gray-800 transition-all"
          >
            <div>
              <h3 className="font-semibold">{req.user}</h3>
              <p className="text-sm text-gray-400">
                Document: {req.document}
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-green-600 p-2 rounded-lg hover:opacity-80">
                <CheckCircle size={18} />
              </button>
              <button className="bg-red-600 p-2 rounded-lg hover:opacity-80">
                <XCircle size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KYCQueue;
