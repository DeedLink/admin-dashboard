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
};

function replacer(_key: string, value: any) {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
}

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

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

      const formattedPast = [
        ...pastTransfers.map(e => {
          const ev = e as EventLog;
          return {
            event: ev.eventName,
            args: ev.args,
            txHash: ev.transactionHash,
            blockNumber: ev.blockNumber
          };
        }),
        ...pastFractions.map(e => {
          const ev = e as EventLog;
          return {
            event: ev.eventName,
            args: ev.args,
            txHash: ev.transactionHash,
            blockNumber: ev.blockNumber
          };
        })
      ];

      setLogs(prev => [...formattedPast.reverse(), ...prev]);

      nftContract.on("Transfer", (from, to, tokenId, event) => {
        const ev = event as EventLog;
        setLogs(prev => [
          {
            event: ev.eventName,
            args: { from, to, tokenId: tokenId.toString() },
            txHash: ev.transactionHash,
            blockNumber: ev.blockNumber
          },
          ...prev
        ]);
      });

      factoryContract.on("FractionTokenCreated", (propertyId, tokenAddress, event) => {
        const ev = event as EventLog;
        setLogs(prev => [
          {
            event: ev.eventName,
            args: { propertyId: propertyId.toString(), tokenAddress },
            txHash: ev.transactionHash,
            blockNumber: ev.blockNumber
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

  return (
    <div className="text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Blockchain Logs</h2>
      <div className="space-y-3 max-h-[600px] overflow-y-auto border border-gray-700 rounded-lg p-3">
        {logs.length === 0 ? (
          <p className="text-gray-400">No logs yet...</p>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="bg-gray-800 p-3 rounded-lg shadow">
              <p className="font-semibold text-blue-400">{log.event}</p>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(log.args, replacer, 2)}
              </pre>
              <p className="text-xs text-gray-500">
                Block: {log.blockNumber} | Tx:{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${log.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-400 underline"
                >
                  {log.txHash.slice(0, 10)}...
                </a>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Logs;
