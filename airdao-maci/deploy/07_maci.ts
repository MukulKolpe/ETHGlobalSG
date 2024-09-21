import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { GatekeeperContractName, InitialVoiceCreditProxyContractName, stateTreeDepth } from "../constants";
import { MACIWrapper, SignUpGatekeeper } from "../typechain-types";
import { genEmptyBallotRoots } from "maci-contracts";

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();

  const poseidonT3 = await hre.ethers.getContract("PoseidonT3", deployer);
  const poseidonT4 = await hre.ethers.getContract("PoseidonT4", deployer);
  const poseidonT5 = await hre.ethers.getContract("PoseidonT5", deployer);
  const poseidonT6 = await hre.ethers.getContract("PoseidonT6", deployer);
  const initialVoiceCreditProxy = await hre.ethers.getContract(InitialVoiceCreditProxyContractName, deployer);
  const gatekeeper = await hre.ethers.getContract<SignUpGatekeeper>(GatekeeperContractName, deployer);
  const pollFactory = await hre.ethers.getContract("PollFactory", deployer);
  const messageProcessorFactory = await hre.ethers.getContract("MessageProcessorFactory", deployer);
  const tallyFactory = await hre.ethers.getContract("TallyFactory", deployer);
  const emptyBallotRoots = genEmptyBallotRoots(stateTreeDepth);
  console.log("Deployer is", deployer);
  console.log("PoseidonT3 is", await poseidonT3.getAddress());
  console.log("PoseidonT4 is", await poseidonT4.getAddress());
  console.log("PoseidonT5 is", await poseidonT5.getAddress());
  console.log("PoseidonT6 is", await poseidonT6.getAddress());
  console.log("InitialVoiceCreditProxy is", await initialVoiceCreditProxy.getAddress());
  console.log("Gatekeeper is", await gatekeeper.getAddress());
  console.log("PollFactory is", await pollFactory.getAddress());
  console.log("MessageProcessorFactory is", await messageProcessorFactory.getAddress());
  console.log("TallyFactory is", await tallyFactory.getAddress());

  try {
    await hre.deployments.deploy("DAOManager", {
      from: deployer,
      args: [
        await pollFactory.getAddress(),
        await messageProcessorFactory.getAddress(),
        await tallyFactory.getAddress(),
        await gatekeeper.getAddress(),
        await initialVoiceCreditProxy.getAddress(),
        stateTreeDepth,
        emptyBallotRoots,
      ],
      log: true,
      libraries: {
        PoseidonT3: await poseidonT3.getAddress(),
        PoseidonT4: await poseidonT4.getAddress(),
        PoseidonT5: await poseidonT5.getAddress(),
        PoseidonT6: await poseidonT6.getAddress(),
      },
      autoMine: true,
      gasLimit: 30000000,
    });

    const maci = await hre.ethers.getContract("DAOManager", deployer);

    console.log(`The DAO Manager MACI contract is deployed at ${await maci.getAddress()}`);

    const tx = await gatekeeper.setMaciInstance(await maci.getAddress());
    await tx.wait(1);
  } catch (error) {
    console.error(error);
  }
};

export default deployContracts;

deployContracts.tags = ["MACI"];
