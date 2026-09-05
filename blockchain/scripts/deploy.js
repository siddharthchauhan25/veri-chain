const hre = require("hardhat");

async function main() {
  const VeriChain = await hre.ethers.getContractFactory("VeriChain");

  const veriChain = await VeriChain.deploy();

  await veriChain.deployed();

  console.log("=================================");
  console.log("VERI CHAIN CONTRACT DEPLOYED");
  console.log("=================================");
  console.log("Contract Address:", veriChain.address);
  console.log("=================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});