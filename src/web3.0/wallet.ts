import { BrowserProvider } from "ethers";

export async function connectWallet() {
  if (!(window as any).ethereum) {
    alert("Please install MetaMask!");
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
