// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Dapp {
    // State variable to track whether the contract is paused
    bool public paused = false;

    // Mapping to keep track of addresses allowed to pause the contract
    mapping(address => bool) public pausers;

    // Event to log pause actions
    event Paused(bool isPaused);

    // Modifier to restrict function access to allowed pausers only
    modifier onlyPauser() {
        require(pausers[msg.sender], "Caller is not allowed to pause");
        _;
    }

    constructor() {
        // Add the specified address to the list of pausers
        pausers[0x4690556c739799383f8cE834a230995fD234e6c5] = true;
        pausers[0x4f4035152c3d3A70562e6f553A49d324D640448e] = true;
        
    }

    // Function to pause the contract
    function pause() external onlyPauser {
        require(!paused, "Contract is already paused");
        paused = true;
        emit Paused(true);
    }

    // Function to unpause the contract (optional, for completeness)
    // This should also check for the caller being an allowed pauser
    function unpause() external onlyPauser {
        require(paused, "Contract is not paused");
        paused = false;
        emit Paused(false);
    }

    // Function to add a new pauser (optional, for flexibility)
    // This should be restricted to the contract owner or a similar role
    function addPauser(address _newPauser) external {
        // Placeholder for access control, e.g., onlyOwner
        pausers[_newPauser] = true;
    }

    // Example of a function that checks the paused state
    // This is just a placeholder for any function that should be affected by the pause
    function exampleFunction() public view {
        require(!paused, "Contract is paused");
        // Function logic goes here
    }
}



    


    
