import { ethers } from "ethers";
import { connectWallet } from "./wallet";
import PropertyNFTABI from "./abis/PropertyNFT.json";
import FractionalTokenFactoryABI from "./abis/FractionTokenFactory.json";
import FractionalTokenABI from "./abis/FractionalToken.json";

// Deployed contract addresses
const PROPERTY_NFT_ADDRESS = import.meta.env.VITE_PROPERTY_NFT_ADDRESS as string;
const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS as string;

// if (!PROPERTY_NFT_ADDRESS || !FACTORY_ADDRESS) {
//   throw new Error("Contract addresses not set in environment variables");
// } later I will check here (note)

// -------------------- Helpers --------------------
async function getSigner() {
  const wallet = await connectWallet();
  if (!wallet) throw new Error("Wallet not connected");
  return wallet.signer;
}

// -------------------- Contract Instances --------------------
async function getPropertyNFTContract() {
  const signer = await getSigner();
  return new ethers.Contract(PROPERTY_NFT_ADDRESS, PropertyNFTABI.abi, signer);
}

async function getFactoryContract() {
  const signer = await getSigner();
  return new ethers.Contract(FACTORY_ADDRESS, FractionalTokenFactoryABI.abi, signer);
}

async function getFractionalTokenContract(address: string) {
  const signer = await getSigner();
  return new ethers.Contract(address, FractionalTokenABI.abi, signer);
}

// -------------------- PropertyNFT Functions --------------------
export async function mintNFT(to: string, uri: string) {
  const nft = await getPropertyNFTContract();
  const tx = await nft.mintProperty(to, uri);
  return await tx.wait();
}

export async function approveNFT(to: string, tokenId: number) {
  const nft = await getPropertyNFTContract();
  const tx = await nft.approve(to, tokenId);
  return await tx.wait();
}

export async function getNFTPropertyDetails(tokenId: number) {
  const nft = await getPropertyNFTContract();
  const [owner, ipfsURI, dbURI] = await nft.getProperty(tokenId);
  return { owner, ipfsURI, dbURI };
}

export async function getNFTURI(tokenId: number) {
  const nft = await getPropertyNFTContract();
  return await nft.tokenURI(tokenId);
}

export async function getNFTOwner(tokenId: number) {
  const nft = await getPropertyNFTContract();
  return await nft.ownerOf(tokenId);
}

// -------------------- FractionalTokenFactory Functions --------------------
export async function createFractionalToken(nftId: number, name: string, symbol: string, supply: number) {
  const factory = await getFactoryContract();
  const tx = await factory.createFractionToken(nftId, name, symbol, supply);
  const receipt = await tx.wait();

  // get token address from event
  const event = receipt.events?.find((e: any) => e.event === "FractionTokenCreated");
  return event?.args?.tokenAddress;
}

export async function getFractionalTokenAddress(nftId: number) {
  const factory = await getFactoryContract();
  return await factory.propertyToFractionToken(nftId);
}

// -------------------- FractionalToken (ERC20) Functions --------------------
export async function transferFT(tokenAddress: string, to: string, amount: number) {
  const ft = await getFractionalTokenContract(tokenAddress);
  const tx = await ft.transfer(to, amount);
  return await tx.wait();
}

export async function getFTBalance(tokenAddress: string, account: string) {
  const ft = await getFractionalTokenContract(tokenAddress);
  return await ft.balanceOf(account);
}

// After Multisig

// Sign property (surveyor, notary, ivsl depending on role)
export async function signProperty(tokenId: number) {
  const nft = await getPropertyNFTContract();
  const tx = await nft.signProperty(tokenId);
  return await tx.wait();
}

// Get signing status
export async function getSignatures(tokenId: number) {
  const nft = await getPropertyNFTContract();
  const surveyor = await nft.isSignedBySurveyor(tokenId);
  const notary = await nft.isSignedByNotary(tokenId);
  const ivsl = await nft.isSignedByIVSL(tokenId);
  const fully = await nft.isFullySigned(tokenId);

  return { surveyor, notary, ivsl, fully };
}

// Get Metadata
export async function getMetadata(tokenId: number): Promise<{ ipfsHash: string; dbHash: string }> {
  const nft = await getPropertyNFTContract();
  const [ipfsHash, dbHash] = await nft.getMetadata(tokenId);
  return { ipfsHash, dbHash };
}
