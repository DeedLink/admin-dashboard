import { useEffect, useState } from "react";
import { useLoader } from "../contexts/LoaderContext";
import {
  getRegistrationFees,
  getAllRegistrationFeeDefinitions,
  createRegistrationFee,
  updateRegistrationFee,
  deleteRegistrationFee,
  getAllStampFeeTiers,
  getAllStampFeeTierDefinitions,
  createStampFeeTier,
  updateStampFeeTier,
  deleteStampFeeTier,
  calculateStampFee,
} from "../api/api";
import type {
  RegistrationFeeDefinition,
  RegistrationFeesResponse,
  StampFeeTierDefinition,
  AllStampFeeTiersResponse,
  CalculateStampFeeResponse,
} from "../types/definitions";
import { Settings, DollarSign, Percent, Plus, Edit, Trash2, Calculator, X } from "lucide-react";

const TRANSACTION_TYPES = ["Sale", "Gift", "Transfer", "Exchange", "Lease", "Mortgage", "Default"];

const DefinitionsManagement = () => {
  const [activeTab, setActiveTab] = useState<"registration" | "stamp">("registration");
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader } = useLoader();

  // Registration Fees State
  const [registrationFees, setRegistrationFees] = useState<RegistrationFeesResponse | null>(null);
  const [registrationFeeDefinitions, setRegistrationFeeDefinitions] = useState<RegistrationFeeDefinition[]>([]);
  const [editingRegistrationFee, setEditingRegistrationFee] = useState<RegistrationFeeDefinition | null>(null);
  const [showRegistrationFeeForm, setShowRegistrationFeeForm] = useState(false);

  // Stamp Fee Tiers State
  const [stampFeeTiers, setStampFeeTiers] = useState<AllStampFeeTiersResponse | null>(null);
  const [stampFeeTierDefinitions, setStampFeeTierDefinitions] = useState<StampFeeTierDefinition[]>([]);
  const [editingStampFeeTier, setEditingStampFeeTier] = useState<StampFeeTierDefinition | null>(null);
  const [showStampFeeTierForm, setShowStampFeeTierForm] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>("Sale");

  // Calculator State
  const [calculatorAmount, setCalculatorAmount] = useState<string>("");
  const [calculatorType, setCalculatorType] = useState<string>("Sale");
  const [calculatorResult, setCalculatorResult] = useState<CalculateStampFeeResponse | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    showLoader();
    setLoading(true);
    try {
      const [fees, feeDefs, tiers, tierDefs] = await Promise.all([
        getRegistrationFees(),
        getAllRegistrationFeeDefinitions(),
        getAllStampFeeTiers(),
        getAllStampFeeTierDefinitions(),
      ]);
      setRegistrationFees(fees);
      setRegistrationFeeDefinitions(feeDefs);
      setStampFeeTiers(tiers);
      setStampFeeTierDefinitions(tierDefs);
    } catch (error) {
      console.error("Failed to fetch definitions:", error);
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const handleCreateRegistrationFee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createRegistrationFee({
        id: formData.get("id") as string,
        name: formData.get("name") as string,
        value: parseFloat(formData.get("value") as string),
        description: formData.get("description") as string || undefined,
        is_active: formData.get("is_active") === "true",
      });
      await fetchData();
      setShowRegistrationFeeForm(false);
    } catch (error) {
      console.error("Failed to create registration fee:", error);
      alert("Failed to create registration fee");
    }
  };

  const handleUpdateRegistrationFee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRegistrationFee) return;
    const formData = new FormData(e.currentTarget);
    try {
      await updateRegistrationFee(editingRegistrationFee.id, {
        name: formData.get("name") as string || undefined,
        value: formData.get("value") ? parseFloat(formData.get("value") as string) : undefined,
        description: formData.get("description") as string || undefined,
        is_active: formData.get("is_active") === "true",
      });
      await fetchData();
      setEditingRegistrationFee(null);
    } catch (error) {
      console.error("Failed to update registration fee:", error);
      alert("Failed to update registration fee");
    }
  };

  const handleDeleteRegistrationFee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this registration fee?")) return;
    try {
      await deleteRegistrationFee(id);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete registration fee:", error);
      alert("Failed to delete registration fee");
    }
  };

  const handleCreateStampFeeTier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createStampFeeTier({
        transaction_type: formData.get("transaction_type") as string,
        min_amount: parseFloat(formData.get("min_amount") as string),
        max_amount: formData.get("max_amount") ? parseFloat(formData.get("max_amount") as string) : null,
        percentage: parseFloat(formData.get("percentage") as string),
        is_active: formData.get("is_active") === "true",
      });
      await fetchData();
      setShowStampFeeTierForm(false);
    } catch (error) {
      console.error("Failed to create stamp fee tier:", error);
      alert("Failed to create stamp fee tier");
    }
  };

  const handleUpdateStampFeeTier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStampFeeTier) return;
    const formData = new FormData(e.currentTarget);
    try {
      await updateStampFeeTier(editingStampFeeTier.id, {
        transaction_type: formData.get("transaction_type") as string || undefined,
        min_amount: formData.get("min_amount") ? parseFloat(formData.get("min_amount") as string) : undefined,
        max_amount: formData.get("max_amount") ? parseFloat(formData.get("max_amount") as string) || null : undefined,
        percentage: formData.get("percentage") ? parseFloat(formData.get("percentage") as string) : undefined,
        is_active: formData.get("is_active") === "true",
      });
      await fetchData();
      setEditingStampFeeTier(null);
    } catch (error) {
      console.error("Failed to update stamp fee tier:", error);
      alert("Failed to update stamp fee tier");
    }
  };

  const handleDeleteStampFeeTier = async (id: number) => {
    if (!confirm("Are you sure you want to delete this stamp fee tier?")) return;
    try {
      await deleteStampFeeTier(id);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete stamp fee tier:", error);
      alert("Failed to delete stamp fee tier");
    }
  };

  const handleCalculateStampFee = async () => {
    const amount = parseFloat(calculatorAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    try {
      const result = await calculateStampFee({
        amount_in_eth: amount,
        transaction_type: calculatorType || undefined,
      });
      setCalculatorResult(result);
    } catch (error) {
      console.error("Failed to calculate stamp fee:", error);
      alert("Failed to calculate stamp fee");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-lg">Loading definitions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="text-green-500" size={28} />
          <h1 className="text-3xl font-bold text-white">Fee Management</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/20">
        <button
          onClick={() => setActiveTab("registration")}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === "registration"
              ? "text-green-500 border-b-2 border-green-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <DollarSign className="inline mr-2" size={18} />
          Registration Fees
        </button>
        <button
          onClick={() => setActiveTab("stamp")}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === "stamp"
              ? "text-green-500 border-b-2 border-green-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Percent className="inline mr-2" size={18} />
          Stamp Fee Tiers
        </button>
      </div>

      {/* Registration Fees Tab */}
      {activeTab === "registration" && (
        <div className="space-y-6">
          {/* Current Fees Summary */}
          {registrationFees && (
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg border border-white/10">
                <div className="text-gray-400 text-sm">Government Fee</div>
                <div className="text-2xl font-bold text-white">{registrationFees.government_fee.toFixed(4)} ETH</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-white/10">
                <div className="text-gray-400 text-sm">IVSL Fee</div>
                <div className="text-2xl font-bold text-white">{registrationFees.ivsl_fee.toFixed(4)} ETH</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-white/10">
                <div className="text-gray-400 text-sm">Survey Fee</div>
                <div className="text-2xl font-bold text-white">{registrationFees.survey_fee.toFixed(4)} ETH</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-white/10">
                <div className="text-gray-400 text-sm">Notary Fee</div>
                <div className="text-2xl font-bold text-white">{registrationFees.notary_fee.toFixed(4)} ETH</div>
              </div>
              <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/50">
                <div className="text-green-400 text-sm">Total</div>
                <div className="text-2xl font-bold text-green-500">
                  {registrationFees.total_registration_fee.toFixed(4)} ETH
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Registration Fee Definitions</h2>
            <button
              onClick={() => {
                setEditingRegistrationFee(null);
                setShowRegistrationFeeForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              <Plus size={18} />
              Add New Fee
            </button>
          </div>

          {/* Registration Fees Table */}
          <div className="bg-gray-900 rounded-lg border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-300 font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-semibold">Value (ETH)</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-semibold">Description</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrationFeeDefinitions.map((fee) => (
                  <tr key={fee.id} className="border-t border-white/10 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-white">{fee.id}</td>
                    <td className="px-4 py-3 text-white">{fee.name}</td>
                    <td className="px-4 py-3 text-green-400 font-semibold">{fee.value.toFixed(4)}</td>
                    <td className="px-4 py-3 text-gray-400">{fee.description || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          fee.is_active ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {fee.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingRegistrationFee(fee);
                            setShowRegistrationFeeForm(true);
                          }}
                          className="p-1.5 text-blue-400 hover:bg-blue-900/20 rounded transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRegistrationFee(fee.id)}
                          className="p-1.5 text-red-400 hover:bg-red-900/20 rounded transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Registration Fee Form Modal */}
          {showRegistrationFeeForm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg border border-white/20 p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">
                    {editingRegistrationFee ? "Edit" : "Create"} Registration Fee
                  </h3>
                  <button
                    onClick={() => {
                      setShowRegistrationFeeForm(false);
                      setEditingRegistrationFee(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form
                  onSubmit={editingRegistrationFee ? handleUpdateRegistrationFee : handleCreateRegistrationFee}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">ID</label>
                    <input
                      type="text"
                      name="id"
                      defaultValue={editingRegistrationFee?.id}
                      required={!editingRegistrationFee}
                      disabled={!!editingRegistrationFee}
                      className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingRegistrationFee?.name}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Value (ETH)</label>
                    <input
                      type="number"
                      name="value"
                      step="0.0001"
                      defaultValue={editingRegistrationFee?.value}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Description</label>
                    <textarea
                      name="description"
                      defaultValue={editingRegistrationFee?.description || ""}
                      className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded text-white"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={editingRegistrationFee?.is_active ?? true}
                        className="w-4 h-4"
                      />
                      Active
                    </label>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                    >
                      {editingRegistrationFee ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegistrationFeeForm(false);
                        setEditingRegistrationFee(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stamp Fee Tiers Tab */}
      {activeTab === "stamp" && (
        <div className="space-y-6">
          {/* Calculator */}
          <div className="bg-gray-900 p-6 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="text-green-500" size={20} />
              <h3 className="text-lg font-bold text-white">Stamp Fee Calculator</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Amount (ETH)</label>
                <input
                  type="number"
                  value={calculatorAmount}
                  onChange={(e) => setCalculatorAmount(e.target.value)}
                  step="0.0001"
                  className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded text-white"
                  placeholder="0.0000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Transaction Type</label>
                <select
                  value={calculatorType}
                  onChange={(e) => setCalculatorType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded text-white"
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCalculateStampFee}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                >
                  Calculate
                </button>
              </div>
            </div>
            {calculatorResult && (
              <div className="mt-4 p-4 bg-green-900/20 border border-green-500/50 rounded">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Percentage</div>
                    <div className="text-green-400 font-bold text-lg">{calculatorResult.percentage}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Fee Amount</div>
                    <div className="text-green-400 font-bold text-lg">{calculatorResult.fee_amount.toFixed(4)} ETH</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Type</div>
                    <div className="text-white font-semibold">{calculatorResult.transaction_type}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transaction Type Filter */}
          <div className="flex items-center gap-4">
            <label className="text-white font-semibold">Filter by Type:</label>
            <select
              value={selectedTransactionType}
              onChange={(e) => setSelectedTransactionType(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-white/10 rounded text-white"
            >
              <option value="all">All Types</option>
              {TRANSACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setEditingStampFeeTier(null);
                setShowStampFeeTierForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              <Plus size={18} />
              Add New Tier
            </button>
          </div>

          {/* Stamp Fee Tiers Display */}
          {stampFeeTiers && (
            <div className="space-y-4">
              {Object.entries(stampFeeTiers.tiers_by_type)
                .filter(([type]) => selectedTransactionType === "all" || type === selectedTransactionType)
                .map(([type, tiers]) => (
                  <div key={type} className="bg-gray-900 rounded-lg border border-white/10 overflow-hidden">
                    <div className="bg-gray-800 px-4 py-3 border-b border-white/10">
                      <h3 className="text-lg font-bold text-white">{type} Transaction Tiers</h3>
                    </div>
                    <table className="w-full">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-300 font-semibold">Min Amount (ETH)</th>
                          <th className="px-4 py-2 text-left text-gray-300 font-semibold">Max Amount (ETH)</th>
                          <th className="px-4 py-2 text-left text-gray-300 font-semibold">Percentage (%)</th>
                          <th className="px-4 py-2 text-left text-gray-300 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tiers.map((tier, idx) => {
                          const tierDef = stampFeeTierDefinitions.find(
                            (t) =>
                              t.transaction_type === type &&
                              t.min_amount === tier.min_amount &&
                              t.max_amount === tier.max_amount &&
                              t.percentage === tier.percentage
                          );
                          return (
                            <tr key={idx} className="border-t border-white/10 hover:bg-gray-800/50">
                              <td className="px-4 py-2 text-white">{tier.min_amount.toFixed(4)}</td>
                              <td className="px-4 py-2 text-white">{tier.max_amount?.toFixed(4) || "∞"}</td>
                              <td className="px-4 py-2 text-green-400 font-semibold">{tier.percentage}%</td>
                              <td className="px-4 py-2">
                                {tierDef && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingStampFeeTier(tierDef);
                                        setShowStampFeeTierForm(true);
                                      }}
                                      className="p-1.5 text-blue-400 hover:bg-blue-900/20 rounded transition"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteStampFeeTier(tierDef.id)}
                                      className="p-1.5 text-red-400 hover:bg-red-900/20 rounded transition"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
            </div>
          )}

          {/* Stamp Fee Tier Form Modal */}
          {showStampFeeTierForm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg border border-white/20 p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">
                    {editingStampFeeTier ? "Edit" : "Create"} Stamp Fee Tier
                  </h3>
                  <button
                    onClick={() => {
                      setShowStampFeeTierForm(false);
                      setEditingStampFeeTier(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form
                  onSubmit={editingStampFeeTier ? handleUpdateStampFeeTier : handleCreateStampFeeTier}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Transaction Type</label>
                    <select
                      name="transaction_type"
                      defaultValue={editingStampFeeTier?.transaction_type}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded text-white"
                    >
                      {TRANSACTION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Min Amount (ETH)</label>
                    <input
                      type="number"
                      name="min_amount"
                      step="0.0001"
                      defaultValue={editingStampFeeTier?.min_amount}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Max Amount (ETH) - Leave empty for Infinity</label>
                    <input
                      type="number"
                      name="max_amount"
                      step="0.0001"
                      defaultValue={editingStampFeeTier?.max_amount || ""}
                      className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Percentage (%)</label>
                    <input
                      type="number"
                      name="percentage"
                      step="0.01"
                      defaultValue={editingStampFeeTier?.percentage}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={editingStampFeeTier?.is_active ?? true}
                        className="w-4 h-4"
                      />
                      Active
                    </label>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                    >
                      {editingStampFeeTier ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowStampFeeTierForm(false);
                        setEditingStampFeeTier(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DefinitionsManagement;

