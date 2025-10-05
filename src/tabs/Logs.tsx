import { useEffect, useState } from "react";
import { ethers, EventLog } from "ethers";
import PropertyNFTABI from "../web3.0/abis/PropertyNFT.json";
import FractionalTokenFactoryABI from "../web3.0/abis/FractionTokenFactory.json";

const PROPERTY_NFT_ADDRESS = import.meta.env.VITE_PROPERTY_NFT_ADDRESS as string;
const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS as string;

type LogEntry = {
  event: string;
  args: any;
  txHash: string;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  logIndex: number;
  timestamp?: number;
  gasUsed?: string;
  gasPrice?: string;
  from?: string | null;
  to?: string | null;
};

function replacer(_key: string, value: any) {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
}

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  useEffect(() => {
    if (!PROPERTY_NFT_ADDRESS || !FACTORY_ADDRESS) return;

    const provider = new ethers.BrowserProvider((window as any).ethereum);

    let nftContract: ethers.Contract;
    let factoryContract: ethers.Contract;

    async function init() {
      const signer = await provider.getSigner();
      nftContract = new ethers.Contract(PROPERTY_NFT_ADDRESS, PropertyNFTABI.abi, signer);
      factoryContract = new ethers.Contract(FACTORY_ADDRESS, FractionalTokenFactoryABI.abi, signer);

      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latestBlock - 2000);

      const pastTransfers = await nftContract.queryFilter("Transfer", fromBlock, latestBlock);
      const pastFractions = await factoryContract.queryFilter("FractionTokenCreated", fromBlock, latestBlock);

      const formattedPast = await Promise.all([
        ...pastTransfers.map(async (e) => {
          const ev = e as EventLog;
          const tx = await provider.getTransaction(ev.transactionHash);
          const receipt = await provider.getTransactionReceipt(ev.transactionHash);
          const block = await provider.getBlock(ev.blockNumber);
          
          return {
            event: ev.eventName,
            args: ev.args,
            txHash: ev.transactionHash,
            blockNumber: ev.blockNumber,
            blockHash: ev.blockHash,
            transactionIndex: ev.transactionIndex,
            logIndex: ev.index,
            timestamp: block?.timestamp,
            gasUsed: receipt?.gasUsed.toString(),
            gasPrice: tx?.gasPrice?.toString(),
            from: tx?.from,
            to: tx?.to
          };
        }),
        ...pastFractions.map(async (e) => {
          const ev = e as EventLog;
          const tx = await provider.getTransaction(ev.transactionHash);
          const receipt = await provider.getTransactionReceipt(ev.transactionHash);
          const block = await provider.getBlock(ev.blockNumber);
          
          return {
            event: ev.eventName,
            args: ev.args,
            txHash: ev.transactionHash,
            blockNumber: ev.blockNumber,
            blockHash: ev.blockHash,
            transactionIndex: ev.transactionIndex,
            logIndex: ev.index,
            timestamp: block?.timestamp,
            gasUsed: receipt?.gasUsed.toString(),
            gasPrice: tx?.gasPrice?.toString(),
            from: tx?.from,
            to: tx?.to
          };
        })
      ]);

      setLogs(prev => [...formattedPast.reverse(), ...prev]);

      nftContract.on("Transfer", async (from, to, tokenId, event) => {
        const ev = event as EventLog;
        const tx = await provider.getTransaction(ev.transactionHash);
        const receipt = await provider.getTransactionReceipt(ev.transactionHash);
        const block = await provider.getBlock(ev.blockNumber);
        
        setLogs(prev => [
          {
            event: ev.eventName,
            args: { from, to, tokenId: tokenId.toString() },
            txHash: ev.transactionHash,
            blockNumber: ev.blockNumber,
            blockHash: ev.blockHash,
            transactionIndex: ev.transactionIndex,
            logIndex: ev.index,
            timestamp: block?.timestamp,
            gasUsed: receipt?.gasUsed.toString(),
            gasPrice: tx?.gasPrice?.toString(),
            from: tx?.from,
            to: tx?.to
          },
          ...prev
        ]);
      });

      factoryContract.on("FractionTokenCreated", async (propertyId, tokenAddress, event) => {
        const ev = event as EventLog;
        const tx = await provider.getTransaction(ev.transactionHash);
        const receipt = await provider.getTransactionReceipt(ev.transactionHash);
        const block = await provider.getBlock(ev.blockNumber);
        
        setLogs(prev => [
          {
            event: ev.eventName,
            args: { propertyId: propertyId.toString(), tokenAddress },
            txHash: ev.transactionHash,
            blockNumber: ev.blockNumber,
            blockHash: ev.blockHash,
            transactionIndex: ev.transactionIndex,
            logIndex: ev.index,
            timestamp: block?.timestamp,
            gasUsed: receipt?.gasUsed.toString(),
            gasPrice: tx?.gasPrice?.toString(),
            from: tx?.from,
            to: tx?.to
          },
          ...prev
        ]);
      });
    }

    init();

    return () => {
      nftContract?.removeAllListeners();
      factoryContract?.removeAllListeners();
    };
  }, []);

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatGas = (gas?: string) => {
    if (!gas) return "N/A";
    return parseInt(gas).toLocaleString();
  };

  const formatGwei = (wei?: string) => {
    if (!wei) return "N/A";
    return (parseInt(wei) / 1e9).toFixed(4) + " Gwei";
  };

  const toggleExpand = (idx: number) => {
    setExpandedLog(expandedLog === idx ? null : idx);
  };

  return (
    <div className="text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Blockchain Event Logs</h2>
      <div className="mb-4 text-sm text-gray-400">
        Total Events: {logs.length}
      </div>
      <div className="space-y-3 max-h-[700px] overflow-y-auto border border-gray-700 rounded-lg p-3">
        {logs.length === 0 ? (
          <p className="text-gray-400">No logs yet...</p>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-lg text-blue-400">{log.event}</p>
                  <p className="text-xs text-gray-500">
                    {formatTimestamp(log.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => toggleExpand(idx)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                >
                  {expandedLog === idx ? "Show Less" : "Show More"}
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="bg-gray-900 p-3 rounded">
                  <p className="font-semibold text-green-400 mb-2">Event Arguments:</p>
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(log.args, replacer, 2)}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">Block:</span>
                    <span className="ml-2 text-yellow-400">#{log.blockNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Log Index:</span>
                    <span className="ml-2">{log.logIndex}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tx Index:</span>
                    <span className="ml-2">{log.transactionIndex}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gas Used:</span>
                    <span className="ml-2 text-orange-400">{formatGas(log.gasUsed)}</span>
                  </div>
                </div>

                {expandedLog === idx && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-gray-700">
                    <div>
                      <span className="text-gray-500">Gas Price:</span>
                      <span className="ml-2 text-purple-400">{formatGwei(log.gasPrice)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">From:</span>
                      {log.from ? (
                        <a
                          href={`https://sepolia.etherscan.io/address/${log.from}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 text-blue-300 hover:underline text-xs break-all"
                        >
                          {log.from}
                        </a>
                      ) : (
                        <span className="ml-2 text-gray-500">N/A</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">To:</span>
                      {log.to ? (
                        <a
                          href={`https://sepolia.etherscan.io/address/${log.to}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 text-blue-300 hover:underline text-xs break-all"
                        >
                          {log.to}
                        </a>
                      ) : (
                        <span className="ml-2 text-gray-500">Contract Creation</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Block Hash:</span>
                      <a
                        href={`https://sepolia.etherscan.io/block/${log.blockHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-cyan-300 hover:underline text-xs break-all"
                      >
                        {log.blockHash}
                      </a>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <span className="text-gray-500">Transaction:</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${log.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-green-400 hover:underline text-xs break-all"
                  >
                    {log.txHash}
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Logs;