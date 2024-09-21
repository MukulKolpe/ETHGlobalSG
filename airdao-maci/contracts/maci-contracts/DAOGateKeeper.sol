pragma solidity ^0.8.20;

import { SignUpGatekeeper } from "maci-contracts/contracts/gatekeepers/SignUpGatekeeper.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DAOGatekeeper is SignUpGatekeeper {
  /// @notice Create a new instance of the gatekeeper
  constructor() payable {
    // store the token address so it can be used
  }

  /// @notice Adds an uninitialised MACI instance to allow for token signups
  /// @param _maci The MACI contract interface to be stored
  function setMaciInstance(address _maci) public override {}

  // sigupgatekeeperData can be 0 byte 0x000000000
  // // initialVoiceCreditProxyData can be 0 byte 0x000000000

  // keypair
  // import {Keypair} from "maci-domaibobjs";
  // const keypair = new Keypair()

  function register(address _user, bytes memory _data) public view override {
    address tokenAddress = abi.decode(_data, (address));
    
    require(
      IERC20(tokenAddress).balanceOf(_user) > 0,
      "DAOGatekeeper: user has no token"
    );
    // no return just throw or not
  }

  function getTrait() public pure override returns (string memory) {
    return "DAOGatekeeper";
  }
}
