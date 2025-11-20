import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ResponsiveContainer, Treemap } from "recharts";
import { getDeeds, getTransactionsByDeedId } from "../api/api";
import type { IDeed } from "../types/responseDeed";
import type { ITransaction } from "../types/transaction";
import { useLoader } from "../contexts/LoaderContext";
import { useToast } from "../contexts/ToastContext";
import { getStampPercentage } from "../constants/stampfee";
import { Activity, Coins, GitBranch, Layers3, Search, ShieldCheck, Spline } from "lucide-react";

type FilterMode = "all" | "minted" | "fractional";

const NFTTracker = () => {
  const [deeds, setDeeds] = useState<IDeed[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [transactionCache, setTransactionCache] = useState<Record<string, ITransaction[]>>({});
  const [selectedDeedId, setSelectedDeedId] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState(false);
  const fetchedDeedIds = useRef<Set<string>>(new Set());

  const { showLoader, hideLoader } = useLoader();
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      showLoader();
      try {
        const res = await getDeeds();
        setDeeds(res || []);
        setSelectedDeedId(res?.[0]?._id ?? null);
      } catch (error) {
        console.error("Failed to fetch deeds", error);
        showToast("Unable to load deeds", "error");
      } finally {
        hideLoader();
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!deeds.length) return;
    const pending = deeds.filter((deed) => deed._id && !fetchedDeedIds.current.has(deed._id));
    if (!pending.length) return;

    let cancelled = false;
    setHydrating(true);

    const fetchTransactions = async () => {
      await Promise.allSettled(
        pending.map(async (deed) => {
          if (!deed._id) return;
          try {
            const txs = await getTransactionsByDeedId(deed._id);
            if (!cancelled) {
              fetchedDeedIds.current.add(deed._id);
              setTransactionCache((prev) => ({
                ...prev,
                [deed._id as string]: sortTransactions(txs),
              }));
            }
          } catch (error) {
            console.error(`Failed to fetch transactions for deed ${deed._id}`, error);
            if (!cancelled) {
              fetchedDeedIds.current.add(deed._id);
              setTransactionCache((prev) => ({
                ...prev,
                [deed._id as string]: [],
              }));
            }
          }
        })
      );
      if (!cancelled) {
        setHydrating(false);
      }
    };

    fetchTransactions();
    return () => {
      cancelled = true;
    };
  }, [deeds]);

  const selectedDeed = useMemo(
    () => deeds.find((deed) => deed._id === selectedDeedId) ?? null,
    [deeds, selectedDeedId]
  );

  const selectedTransactions = selectedDeedId ? transactionCache[selectedDeedId] ?? [] : [];

  const filteredDeeds = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return deeds
      .filter((deed) => {
        if (!lowerQuery) return true;
        return (
          deed.deedNumber.toLowerCase().includes(lowerQuery) ||
          deed.ownerFullName.toLowerCase().includes(lowerQuery) ||
          deed.ownerAddress.toLowerCase().includes(lowerQuery) ||
          deed.owners.some((owner) => owner.address.toLowerCase().includes(lowerQuery))
        );
      })
      .filter((deed) => {
        if (filter === "minted") {
          return deed.tokenId !== undefined;
        }
        if (filter === "fractional") {
          return deed.tokenId !== undefined && hasFractionalTokens(deed._id, transactionCache);
        }
        return true;
      })
      .sort((a, b) => {
        const aTime = typeof a.timestamp === "number" ? a.timestamp : new Date(a.timestamp).getTime();
        const bTime = typeof b.timestamp === "number" ? b.timestamp : new Date(b.timestamp).getTime();
        return bTime - aTime;
      });
  }, [deeds, query, filter, transactionCache]);

  const stats = useMemo(() => {
    const minted = deeds.filter((deed) => deed.tokenId !== undefined).length;
    const fractional = deeds.filter((deed) => deed._id && hasFractionalTokens(deed._id, transactionCache)).length;
    const totalStampFees = Object.values(transactionCache)
      .flat()
      .reduce((acc, tx) => acc + (calculateStampFee(tx)?.value ?? 0), 0);

    return { minted, fractional, totalStampFees };
  }, [deeds, transactionCache]);

  const treeData = useMemo(() => {
    if (!selectedDeed) return [];
    if (!selectedDeed.owners?.length) {
      return [
        {
          name: selectedDeed.ownerFullName,
          size: 100,
          type: "owner",
        },
      ];
    }

    return [
      {
        name: selectedDeed.deedNumber,
        children: selectedDeed.owners.map((owner) => ({
          name: shortAddress(owner.address),
          size: owner.share,
          type: "owner",
        })),
      },
    ];
  }, [selectedDeed]);

  return (
    <div className="space-y-8 text-white">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-widest text-emerald-400/80">Registry Oversight</p>
        <h1 className="text-3xl md:text-4xl font-semibold">NFT & Fractional Tracking</h1>
        <p className="text-gray-300">
          Monitor every deed minted as an NFT, understand fractional splits, and audit stamp-fee-backed transfers.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Minted NFTs"
          value={stats.minted}
          subtitle="Fully tokenized deeds"
          icon={<Layers3 className="h-5 w-5 text-emerald-300" />}
        />
        <StatCard
          title="Fractional Sets"
          value={stats.fractional}
          subtitle="NFTs with live FTs"
          icon={<GitBranch className="h-5 w-5 text-sky-300" />}
          loading={hydrating}
        />
        <StatCard
          title="Stamp Fees (ETH)"
          value={stats.totalStampFees.toFixed(3)}
          subtitle="Tracked via client flows"
          icon={<Coins className="h-5 w-5 text-amber-300" />}
        />
      </section>

      <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60 placeholder:text-white/40"
              placeholder="Search by deed number, owner or wallet"
            />
          </div>

          <div className="flex rounded-xl border border-white/10 p-1 bg-black/30 overflow-hidden">
            {(["all", "minted", "fractional"] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                  filter === mode ? "bg-emerald-500 text-white" : "text-white/70 hover:text-white"
                }`}
              >
                {mode === "all" ? "All" : mode === "minted" ? "NFTs" : "With FTs"}
              </button>
            ))}
          </div>
        </div>

        {hydrating && (
          <div className="text-xs text-emerald-300 flex items-center gap-2">
            <Activity size={14} className="animate-pulse" />
            Syncing transaction trees from client flows…
          </div>
        )}

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
            {filteredDeeds.length === 0 && (
              <div className="text-white/60 text-sm border border-white/10 rounded-xl p-6 text-center">
                No deeds match the current filters.
              </div>
            )}

            {filteredDeeds.map((deed) => {
              const fractional = deed._id ? hasFractionalTokens(deed._id, transactionCache) : false;
              const minted = deed.tokenId !== undefined;
              return (
                <button
                  key={deed._id}
                  onClick={() => setSelectedDeedId(deed._id ?? null)}
                  className={`w-full text-left rounded-2xl border transition-all duration-300 p-4 bg-black/40 ${
                    selectedDeedId === deed._id
                      ? "border-emerald-400/60 shadow-emerald-500/30 shadow-lg"
                      : "border-white/10 hover:border-emerald-300/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Deed</p>
                      <p className="text-lg font-semibold">{deed.deedNumber}</p>
                      <p className="text-sm text-white/70">{deed.ownerFullName}</p>
                      <p className="text-xs text-white/50 mt-1">{deed.landTitleNumber}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <StatusBadge active={minted} label={minted ? "NFT Minted" : "Pending NFT"} />
                      {minted && <StatusBadge active={!!fractional} label={fractional ? "FTs Live" : "No FTs"} tone="sky" />}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-white/60 flex items-center gap-3">
                    <span>{selectedDeedDate(deed)}</span>
                    <span>•</span>
                    <span>{deed.district}, {deed.division}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {selectedDeed ? (
              <>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-white/50">Selected Deed</p>
                      <h2 className="text-2xl font-semibold">{selectedDeed.deedNumber}</h2>
                      <p className="text-white/70">{selectedDeed.ownerFullName}</p>
                    </div>
                    <div className="flex gap-2">
                      <StatusBadge active={selectedDeed.tokenId !== undefined} label="NFT" />
                      <StatusBadge
                        active={!!(selectedDeed._id && hasFractionalTokens(selectedDeed._id, transactionCache))}
                        label="FTs"
                        tone="sky"
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoChip label="Land Type" value={selectedDeed.landType} />
                    <InfoChip label="Land Area" value={`${selectedDeed.landArea} ${selectedDeed.landSizeUnit ?? "perches"}`} />
                    <InfoChip label="Registered" value={selectedDeedDate(selectedDeed)} />
                    <InfoChip label="Token ID" value={selectedDeed.tokenId?.toString() ?? "—"} />
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <GitBranch size={18} className="text-sky-300" />
                      <h3 className="font-semibold text-lg">Ownership Tree</h3>
                    </div>
                    {treeData.length === 0 ? (
                      <p className="text-sm text-white/60">No ownership data available.</p>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <Treemap
                            data={treeData}
                            dataKey="size"
                            stroke="#1f2937"
                            fill="#34d399"
                            animationDuration={400}
                            content={<CustomTreemapContent />}
                          />
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck size={18} className="text-emerald-300" />
                      <h3 className="font-semibold text-lg">Stamp Fee Ledger</h3>
                    </div>
                    <div className="text-sm text-white/70">
                      <p className="mb-2">
                        Every transfer recorded in the client app pushes its stamp-fee hash here. Use it to audit treasury inflows.
                      </p>
                      <p className="text-xs text-white/50">Data source: transaction-service + client transfer flows.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Spline size={18} className="text-amber-300" />
                    <h3 className="font-semibold text-lg">Transaction Tree</h3>
                  </div>
                  <TransactionTree transactions={selectedTransactions} />
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/20 p-10 text-center text-white/60">
                Select a deed to inspect its NFT lineage and stamp-fee-backed transfers.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  loading,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: ReactNode;
  loading?: boolean;
}) => (
  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 backdrop-blur">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">{title}</p>
        <p className="text-3xl font-semibold mt-2">{loading ? "..." : value}</p>
      </div>
      <div className="p-3 rounded-xl bg-black/30 border border-white/10">{icon}</div>
    </div>
    <p className="text-white/60 text-sm mt-4">{subtitle}</p>
  </div>
);

const StatusBadge = ({
  active,
  label,
  tone = "emerald",
}: {
  active: boolean;
  label: string;
  tone?: "emerald" | "sky";
}) => {
  const palette =
    tone === "emerald"
      ? active
        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
        : "bg-white/5 text-white/60 border border-white/10"
      : active
      ? "bg-sky-500/20 text-sky-200 border border-sky-400/40"
      : "bg-white/5 text-white/60 border border-white/10";

  return <span className={`text-xs px-3 py-1 rounded-full font-semibold ${palette}`}>{label}</span>;
};

const InfoChip = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
    <p className="text-xs uppercase tracking-[0.2em] text-white/40">{label}</p>
    <p className="mt-1 text-white font-medium">{value}</p>
  </div>
);

const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, value = 0 } = props;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} style={{ fill: "rgba(16, 185, 129, 0.2)", stroke: "rgba(16, 185, 129, 0.6)" }} />
      {width > 40 && height > 40 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#e5e7eb" fontSize={12}>
          {name}
          <tspan x={x + width / 2} y={y + height / 2 + 14} fontSize={11} fill="#9ca3af">
            {value}%
          </tspan>
        </text>
      )}
    </g>
  );
};

const TransactionTree = ({ transactions }: { transactions: ITransaction[] }) => {
  if (!transactions || transactions.length === 0) {
    return <p className="text-sm text-white/60">No recorded transactions yet.</p>;
  }

  return (
    <div className="relative pl-6">
      <div className="absolute top-2 bottom-2 left-2 border-l-2 border-emerald-500/30" />
      <div className="space-y-5">
        {transactions.map((tx, index) => {
          const stampFee = calculateStampFee(tx);
          return (
            <div key={tx._id ?? `${tx.hash}-${index}`} className="relative ml-2">
              <span className="absolute -left-[11px] top-3 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold">
                {transactions.length - index}
              </span>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-white/50">
                  <span>{formatTxType(tx.type)}</span>
                  <span>•</span>
                  <span>{formatDate(tx)}</span>
                  {tx.status && (
                    <>
                      <span>•</span>
                      <span className={tx.status === "completed" ? "text-emerald-300" : "text-amber-300"}>{tx.status}</span>
                    </>
                  )}
                </div>
                <div className="mt-2 text-sm font-semibold">
                  {shortAddress(tx.from)} → {shortAddress(tx.to)}
                </div>
                <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-white/50 text-xs mb-1">Transferred Share</p>
                    <p className="font-semibold">{tx.share}%</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs mb-1">Amount</p>
                    <p className="font-semibold">{tx.amount ? `${tx.amount} ETH` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs mb-1">Stamp Fee</p>
                    <p className="font-semibold">
                      {stampFee ? `${stampFee.value.toFixed(3)} ETH (${stampFee.percent}%)` : "Recorded in escrow"}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs mb-1">Hash</p>
                    <p className="font-mono text-xs break-all">{tx.hash ? shortHash(tx.hash) : "—"}</p>
                  </div>
                </div>
                {tx.description && <p className="mt-3 text-xs text-white/60">{tx.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const sortTransactions = (txs: ITransaction[]) => {
  return [...(txs || [])].sort((a, b) => {
    const aDate = dateValue(a);
    const bDate = dateValue(b);
    return bDate - aDate;
  });
};

const dateValue = (tx: ITransaction) => {
  if (tx.date) return new Date(tx.date).getTime();
  if (tx.createdAt) return new Date(tx.createdAt).getTime();
  return Date.now();
};

const calculateStampFee = (tx: ITransaction) => {
  if (!tx.amount || tx.amount <= 0) return null;
  const percent = getStampPercentage(tx.amount, inferStampType(tx.type));
  const value = (tx.amount * percent) / 100;
  return { percent, value };
};

const hasFractionalTokens = (deedId: string | undefined, cache: Record<string, ITransaction[]>) => {
  if (!deedId) return false;
  const txs = cache[deedId];
  if (!txs) return false;
  return txs.some(
    (tx) => tx.type === "init" || tx.description?.toLowerCase().includes("fractional") || tx.description?.toLowerCase().includes("1,000,000 tokens")
  );
};

const shortAddress = (address: string) => {
  if (!address) return "—";
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
};

const shortHash = (hash: string) => {
  if (!hash) return "—";
  return hash.length > 16 ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : hash;
};

const formatDate = (tx: ITransaction) => {
  const date = tx.date || tx.createdAt;
  if (!date) return "—";
  return new Date(date).toLocaleString();
};

const formatTxType = (type: ITransaction["type"]) => {
  const map: Record<ITransaction["type"], string> = {
    gift: "Gift Transfer",
    open_market: "Market Listing",
    direct_transfer: "Direct Transfer",
    closed: "Closed",
    init: "Fractional Init",
    sale_transfer: "Sale Transfer",
    escrow_sale: "Escrow Sale",
  };
  return map[type] ?? type;
};

const inferStampType = (type: ITransaction["type"]) => {
  switch (type) {
    case "gift":
      return "Gift";
    case "direct_transfer":
    case "sale_transfer":
    case "escrow_sale":
      return "Sale";
    default:
      return "Transfer";
  }
};

const selectedDeedDate = (deed: IDeed) => {
  if (!deed.timestamp) return "—";
  const ts = typeof deed.timestamp === "number" ? deed.timestamp : new Date(deed.timestamp).getTime();
  return new Date(ts).toLocaleDateString();
};

export default NFTTracker;

