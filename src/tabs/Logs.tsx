import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { Activity, RefreshCcw, Blocks, Cpu, GaugeCircle, Zap } from "lucide-react";

type BlockEntry = {
  number: number;
  hash: string;
  timestamp: number;
  miner: string;
  gasUsed: bigint;
  gasLimit: bigint;
  baseFeePerGas?: bigint;
  difficulty?: bigint;
  transactions: string[];
};

const BLOCK_COUNT = 15;
const REFRESH_INTERVAL = 15000;

const Logs = () => {
  const [blocks, setBlocks] = useState<BlockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const hydrateBlocks = useCallback(async () => {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    try {
      setLoading(true);
      setError(null);
      const latest = await provider.getBlockNumber();
      const blockNumbers = Array.from({ length: BLOCK_COUNT }, (_, idx) => latest - idx).filter((n) => n >= 0);
      const fetched = await Promise.all(blockNumbers.map(async (num) => provider.getBlock(num)));

      const normalized: BlockEntry[] = fetched
        .filter((block): block is NonNullable<typeof block> => !!block)
        .map((block) => ({
          number: block.number,
          hash: block.hash,
          timestamp: block.timestamp,
          miner: block.miner,
          gasUsed: block.gasUsed,
          gasLimit: block.gasLimit,
          baseFeePerGas: block.baseFeePerGas,
          difficulty: block.difficulty,
          transactions: block.transactions.map((tx) => (typeof tx === "string" ? tx : tx.hash)),
        }));

      setBlocks(normalized);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Failed to fetch blocks", err);
      setError(err.message ?? "Failed to load blocks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (mounted) await hydrateBlocks();
    };
    run();
    const interval = setInterval(run, REFRESH_INTERVAL);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [hydrateBlocks]);

  const sortedBlocks = useMemo(() => [...blocks].sort((a, b) => b.number - a.number), [blocks]);

  const toggleBlock = (number: number) => {
    setExpandedBlock((prev) => (prev === number ? null : number));
  };

  const handleManualRefresh = () => {
    hydrateBlocks();
  };

  const totalTx = sortedBlocks.reduce((acc, block) => acc + block.transactions.length, 0);
  const avgGas = sortedBlocks.length
    ? sortedBlocks.reduce((acc, block) => acc + Number(block.gasUsed)) / sortedBlocks.length
    : 0;

  return (
    <div className="text-white p-6 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-400/80">Network Health</p>
          <h2 className="text-3xl font-semibold">Live Block Stream</h2>
          <p className="text-sm text-white/60">Latest {BLOCK_COUNT} blocks pulled directly from your connected RPC.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/60">
          {loading ? (
            <span className="inline-flex items-center gap-1 text-emerald-300">
              <Activity className="animate-spin" size={14} /> Syncing…
            </span>
          ) : (
            <span>
              Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : "just now"}
            </span>
          )}
          <button
            onClick={handleManualRefresh}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-white hover:border-emerald-400/60 hover:text-emerald-300 transition"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Blocks className="text-emerald-300" size={18} />}
          title="Tracked Blocks"
          value={sortedBlocks.length}
          hint="Latest finalized"
        />
        <MetricCard
          icon={<Cpu className="text-sky-300" size={18} />}
          title="Avg. Gas Used"
          value={avgGas ? `${(avgGas / 1e3).toFixed(0)}k` : "—"}
          hint="per block"
        />
        <MetricCard
          icon={<Zap className="text-amber-300" size={18} />}
          title="Total Tx"
          value={totalTx}
          hint={`~${(totalTx / Math.max(sortedBlocks.length, 1)).toFixed(1)} / block`}
        />
        <MetricCard
          icon={<GaugeCircle className="text-purple-300" size={18} />}
          title="Base Fee"
          value={
            sortedBlocks[0]?.baseFeePerGas
              ? `${Number(sortedBlocks[0].baseFeePerGas) / 1e9} gwei`
              : "—"
          }
          hint="Latest head"
        />
      </section>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {sortedBlocks.map((block) => (
          <div
            key={block.hash}
            className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-lg shadow-black/30"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Block</p>
                <h3 className="text-2xl font-semibold text-emerald-300">#{block.number}</h3>
                <p className="text-xs text-white/60">{formatTimestamp(block.timestamp)}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <span>{block.transactions.length} txs</span>
                <span>•</span>
                <span>{formatPercentage(block.gasUsed, block.gasLimit)} gas</span>
                <button
                  onClick={() => toggleBlock(block.number)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs hover:border-emerald-400/60 hover:text-emerald-300 transition"
                >
                  {expandedBlock === block.number ? "Hide" : "Inspect"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <InfoRow label="Hash" value={block.hash} type="hash" />
              <InfoRow label="Miner" value={block.miner} type="address" />
              <InfoRow label="Gas Used" value={`${formatBigInt(block.gasUsed)} / ${formatBigInt(block.gasLimit)}`} />
              <InfoRow
                label="Base Fee"
                value={block.baseFeePerGas ? `${Number(block.baseFeePerGas) / 1e9} gwei` : "—"}
              />
            </div>

            {expandedBlock === block.number && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-3">Transactions</p>
                {block.transactions.length === 0 ? (
                  <p className="text-sm text-white/60">No transactions.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-auto pr-1">
                    {block.transactions.map((tx) => (
                      <a
                        key={tx}
                        href={`https://sepolia.etherscan.io/tx/${tx}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-emerald-300 hover:text-emerald-200 underline decoration-dotted"
                      >
                        {tx}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Logs;

const MetricCard = ({
  icon,
  title,
  value,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  hint?: string;
}) => (
  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4">
    <div className="flex items-center gap-3">
      <div className="rounded-xl border border-white/10 bg-black/30 p-3">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
        {hint && <p className="text-xs text-white/50">{hint}</p>}
      </div>
    </div>
  </div>
);

const InfoRow = ({ label, value, type }: { label: string; value: string; type?: "hash" | "address" }) => {
  const isLink = type === "hash" || type === "address";
  const href =
    type === "hash"
      ? `https://sepolia.etherscan.io/block/${value}`
      : type === "address"
      ? `https://sepolia.etherscan.io/address/${value}`
      : undefined;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-white/40">{label}</p>
      {isLink ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-emerald-300 font-mono hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-white/80">{value}</p>
      )}
    </div>
  );
};

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString();
};

const formatPercentage = (gasUsed: bigint, gasLimit: bigint) => {
  if (!gasLimit) return "—";
  const pct = Number(gasUsed) / Number(gasLimit);
  return `${(pct * 100).toFixed(1)}%`;
};

const formatBigInt = (value: bigint) => {
  return Number(value).toLocaleString();
};