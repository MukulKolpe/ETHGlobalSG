import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ContractStorage, EContracts } from "maci-contracts";
import { InitialVoiceCreditProxyContractName } from "../constants";

import type { ConstantInitialVoiceCreditProxy } from "../typechain-types";

const storage = ContractStorage.getInstance();

const DEFAULT_INITIAL_VOICE_CREDITS = 99;

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  await hre.deployments.deploy(InitialVoiceCreditProxyContractName, {
    from: deployer,
    args: [DEFAULT_INITIAL_VOICE_CREDITS],
    log: true,
    autoMine: true,
  });

  const initialVoiceCreditProxy = await hre.ethers.getContract<ConstantInitialVoiceCreditProxy>(
    InitialVoiceCreditProxyContractName,
    deployer,
  );
  console.log(`The initial voice credit proxy is deployed at ${await initialVoiceCreditProxy.getAddress()}`);

  await storage.register({
    id: EContracts.ConstantInitialVoiceCreditProxy,
    contract: initialVoiceCreditProxy,
    args: [DEFAULT_INITIAL_VOICE_CREDITS.toString()],
    network: hre.network.name,
  });
};

export default deployContracts;

deployContracts.tags = ["InitialVoiceCreditProxy"];
