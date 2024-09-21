import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ContractStorage, EContracts } from "maci-contracts";
import { GatekeeperContractName } from "../constants";
import { FreeForAllGatekeeper } from "../typechain-types/";

const storage = ContractStorage.getInstance();

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  console.log("deployer", deployer);
  await hre.deployments.deploy(GatekeeperContractName, {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const gatekeeper = await hre.ethers.getContract<FreeForAllGatekeeper>(GatekeeperContractName, deployer);
  console.log(`The gatekeeper is deployed at ${await gatekeeper.getAddress()}`);

  await storage.register({
    id: EContracts.FreeForAllGatekeeper,
    contract: gatekeeper,
    network: hre.network.name,
    args: [],
  });
};

export default deployContracts;

deployContracts.tags = ["Gatekeeper"];
