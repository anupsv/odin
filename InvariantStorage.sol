// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InvariantStorage {
    // Enumeration for condition types
    enum ConditionType { None, BalanceOf, TotalSupply, BridgeBalance }
    // Enumeration for action types
    enum ActionType { None, LessThan, EqualTo, GreaterThan }

    // Define a struct to hold the tuple data
    struct Data {
        address owner;
        ConditionType condition;
        ActionType action;
        uint value;
    }

    // Mapping from an address to its Data
    mapping(address => Data) public dataStore;

    // Event for logging data storage
    event DataStored(address indexed dataOwner, ConditionType condition, ActionType action, uint value);

    // Function to store data
    function storeData(address _key, ConditionType _condition, ActionType _action, uint _value) external {
        // Only allow the owner or a new entry to store data
        require(dataStore[_key].owner == address(0) || dataStore[_key].owner == msg.sender, "Not authorized or key already in use by another owner.");
        require(_condition != ConditionType.None, "Invalid condition type.");
        require(_action != ActionType.None, "Invalid action type.");

        // Update the dataStore mapping
        dataStore[_key] = Data(msg.sender, _condition, _action, _value);

        // Emit an event for the stored data
        emit DataStored(msg.sender, _condition, _action, _value);
    }

    // Function to retrieve data (excluding the owner)
    function retrieveData(address _key) external view returns (ConditionType condition, ActionType action, uint value) {
        // Ensure the caller is the owner of the data
        require(dataStore[_key].owner == msg.sender, "Caller is not the owner.");

        // Return the data tuple, excluding the owner
        Data storage data = dataStore[_key];
        return (data.condition, data.action, data.value);
    }
}
