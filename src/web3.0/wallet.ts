import { BrowserProvider } from "ethers";

export async function connectWallet(onAlert?: (message: string, type?: "success" | "error" | "warning" | "info") => void) {
  if (!(window as any).ethereum) {
    if (onAlert) {
      onAlert("Please install MetaMask!", "warning");
    }
    return null;
  }

  try {
    const provider = new BrowserProvider((window as any).ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    return { provider, signer, account: accounts[0] };
  } catch (err) {
    console.error("Wallet connection failed", err);
    return null;
  }
}
