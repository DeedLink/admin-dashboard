import { useEffect, useState } from "react";
import { getUsers } from "../../api/api";

const UsersCard = () => {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      const filtered = res.filter((user: any) => user.role !== "admin");
      setUsers(filtered);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const roleCounts = users.reduce((acc: Record<string, number>, user: any) => {
    const role = user.role || "unknown";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Users by Role
      </h2>

      <div className="space-y-3">
        {Object.keys(roleCounts).length > 0 ? (
          Object.entries(roleCounts).map(([role, count]) => (
            <div
              key={role}
              className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0"
            >
              <p className="text-sm capitalize text-slate-600">
                {role.replace(/_/g, " ")}
              </p>
              <p className="text-lg font-semibold text-slate-900">{count}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">No users found</p>
        )}
      </div>
    </div>
  );
};

export default UsersCard;
