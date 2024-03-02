// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Interface for the external contract with the pauser function
interface IPauserContract {
    function pause() external;
}

contract BondedEthHolder is ReentrancyGuard {
    mapping(address => uint256) public bondedAmounts;
    address[] public bondedAddresses;

    event EthBonded(address indexed depositor, uint256 amount);
    event ContractCalled(address indexed caller, address indexed targetContract);

    receive() external payable {
        require(msg.value > 0, "Must send ETH to bond");
        if (bondedAmounts[msg.sender] == 0) {
            bondedAddresses.push(msg.sender);
        }
        bondedAmounts[msg.sender] += msg.value;
        emit EthBonded(msg.sender, msg.value);
    }

    // Function to call the pauser function on an external contract
    function callPauser(address _contract) external nonReentrant {
        require(bondedAmounts[msg.sender] > 0, "Caller is not bonded");

        // Cast the address to the IPauserContract interface and call the pauser function
        IPauserContract(_contract).pause();

        emit ContractCalled(msg.sender, _contract);
    }

    function isBonded(address _address) public view returns (bool) {
        return bondedAmounts[_address] > 0;
    }
}
