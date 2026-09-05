// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VeriChain {

    struct Credential {
        string documentId;
        bytes32 documentHash;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Credential) private credentials;

    event CredentialRegistered(
        string documentId,
        bytes32 documentHash,
        uint256 timestamp
    );

    function registerCredential(
        string calldata documentId,
        bytes32 documentHash
    ) external {
        require(
            !credentials[documentId].exists,
            "Credential already exists"
        );

        credentials[documentId] = Credential({
            documentId: documentId,
            documentHash: documentHash,
            timestamp: block.timestamp,
            exists: true
        });

        emit CredentialRegistered(
            documentId,
            documentHash,
            block.timestamp
        );
    }

    function verifyCredential(
        string calldata documentId,
        bytes32 documentHash
    ) external view returns (bool) {
        Credential memory credential = credentials[documentId];

        if (!credential.exists) {
            return false;
        }

        return credential.documentHash == documentHash;
    }

    function getCredential(
        string calldata documentId
    )
        external
        view
        returns (
            string memory,
            bytes32,
            uint256,
            bool
        )
    {
        Credential memory credential = credentials[documentId];

        return (
            credential.documentId,
            credential.documentHash,
            credential.timestamp,
            credential.exists
        );
    }
}