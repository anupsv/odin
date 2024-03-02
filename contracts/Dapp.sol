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


    


    
