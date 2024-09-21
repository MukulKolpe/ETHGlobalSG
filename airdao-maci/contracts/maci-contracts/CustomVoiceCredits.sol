// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import { InitialVoiceCreditProxy } from "maci-contracts/contracts/initialVoiceCreditProxy/InitialVoiceCreditProxy.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ConstantInitialVoiceCreditProxy
/// @notice This contract allows to set a constant initial voice credit balance
/// for MACI's voters.
contract TokenBalanceVoiceCredits is InitialVoiceCreditProxy {
  /// @notice the balance to be returned by getVoiceCredits
  uint256 internal immutable balance;

  /// @notice creates a new ConstantInitialVoiceCreditProxy
  /// @param _balance the balance to be returned by getVoiceCredits
  constructor(uint256 _balance) payable {
    balance = _balance;
  }

  /// @notice Returns the constant balance for any new MACI's voter
  /// @return balance
  function getVoiceCredits(address _user, bytes memory _erc20ContractAddressBytes) public view override returns (uint256) {    
    address erc20ContractAddress = abi.decode(_erc20ContractAddressBytes, (address));
    ERC20 token = ERC20(erc20ContractAddress);
    
    uint256 userBalance = token.balanceOf(_user);
    uint256 decimals = token.decimals();
    
    return userBalance / (10**decimals);
}

 
}
