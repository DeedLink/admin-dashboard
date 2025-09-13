import { CheckCircle, XCircle } from "lucide-react";

const users = [
  { id: "U001", name: "Alice Johnson", email: "alice@example.com", status: "Active" },
  { id: "U002", name: "Bob Smith", email: "bob@example.com", status: "Pending" },
  { id: "U003", name: "Charlie Brown", email: "charlie@example.com", status: "Suspended" },
];

const UserTable = () => {
  return (
    <div className="bg-gray-900 text-white rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr className="text-gray-400">
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="bg-black hover:bg-gray-800 transition-all rounded-xl">
              <td className="px-3 py-2">{u.id}</td>
              <td className="px-3 py-2">{u.name}</td>
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2">
                <span
                  className={`px-2 py-1 rounded-lg text-xs ${
                    u.status === "Active"
                      ? "bg-green-600"
                      : u.status === "Pending"
                      ? "bg-yellow-600"
                      : "bg-red-600"
                  }`}
                >
                  {u.status}
                </span>
              </td>
              <td className="px-3 py-2 text-right space-x-2">
                <button className="bg-green-600 p-2 rounded-lg hover:opacity-80">
                  <CheckCircle size={16} />
                </button>
                <button className="bg-red-600 p-2 rounded-lg hover:opacity-80">
                  <XCircle size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
