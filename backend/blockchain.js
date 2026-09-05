const { ethers } = require("ethers");
const VeriChainArtifact = require("./abi/VeriChain.json");

const RPC_URL = "http://127.0.0.1:8545";

const CONTRACT_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  VeriChainArtifact.abi,
  wallet
);

async function registerCredential(documentId, sha256Hash) {
  const documentHash = ethers.utils.hexlify(
    ethers.utils.arrayify("0x" + sha256Hash)
  );

  const tx = await contract.registerCredential(
    documentId,
    documentHash
  );

  const receipt = await tx.wait();

  return {
    txHash: receipt.transactionHash,
    contractAddress: CONTRACT_ADDRESS,
  };
}

async function verifyCredential(documentId, sha256Hash) {
  const documentHash = ethers.utils.hexlify(
    ethers.utils.arrayify("0x" + sha256Hash)
  );

  return await contract.verifyCredential(
    documentId,
    documentHash
  );
}

module.exports = {
  registerCredential,
  verifyCredential,
  CONTRACT_ADDRESS,
};