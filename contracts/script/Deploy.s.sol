// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/FootballQuizNFT.sol";

contract DeployFootballQuizNFT is Script {
    function run() external {
        // Get the deployer's private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying FootballQuizNFT with deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract with the deployer as the initial owner
        FootballQuizNFT nft = new FootballQuizNFT(deployer);
        
        vm.stopBroadcast();
        
        console.log("FootballQuizNFT deployed to:", address(nft));
        console.log("Contract owner:", nft.owner());
        
        // Verify deployment
        console.log("Contract name:", nft.name());
        console.log("Contract symbol:", nft.symbol());
        console.log("Total supply:", nft.totalSupply());
    }
}

contract DeployAndMintExample is Script {
    function run() external {
        // Get the deployer's private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying FootballQuizNFT and minting example NFTs...");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        FootballQuizNFT nft = new FootballQuizNFT(deployer);
        
        // Mint some example NFTs with different scores
        uint256 tokenId1 = nft.mint(deployer, 25); // Legendary
        uint256 tokenId2 = nft.mint(deployer, 18); // Epic
        uint256 tokenId3 = nft.mint(deployer, 12); // Rare
        uint256 tokenId4 = nft.mint(deployer, 7);  // Common
        uint256 tokenId5 = nft.mint(deployer, 3);  // Basic
        
        vm.stopBroadcast();
        
        console.log("FootballQuizNFT deployed to:", address(nft));
        console.log("Minted NFT #1 (Score 25) - Token ID:", tokenId1);
        console.log("Minted NFT #2 (Score 18) - Token ID:", tokenId2);
        console.log("Minted NFT #3 (Score 12) - Token ID:", tokenId3);
        console.log("Minted NFT #4 (Score 7) - Token ID:", tokenId4);
        console.log("Minted NFT #5 (Score 3) - Token ID:", tokenId5);
        console.log("Total supply:", nft.totalSupply());
        console.log("Deployer's highest score:", nft.highestScores(deployer));
    }
}