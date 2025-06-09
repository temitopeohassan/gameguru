// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/FootballQuizNFT.sol";

contract FootballQuizNFTTest is Test {
    FootballQuizNFT public nft;
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);

    function setUp() public {
        vm.prank(owner);
        nft = new FootballQuizNFT(owner);
    }

    function test_Deployment() public {
        assertEq(nft.name(), "Football Quiz Achievement");
        assertEq(nft.symbol(), "FQA");
        assertEq(nft.owner(), owner);
        assertEq(nft.totalSupply(), 0);
    }

    function test_MintNFT() public {
        uint256 score = 15;
        
        vm.prank(owner);
        uint256 tokenId = nft.mint(user1, score);
        
        assertEq(tokenId, 1);
        assertEq(nft.totalSupply(), 1);
        assertEq(nft.ownerOf(tokenId), user1);
        assertEq(nft.getTokenScore(tokenId), score);
        assertEq(nft.highestScores(user1), score);
        assertTrue(nft.getTokenTimestamp(tokenId) > 0);
    }

    function test_MintMultipleNFTs() public {
        vm.startPrank(owner);
        
        uint256 tokenId1 = nft.mint(user1, 10);
        uint256 tokenId2 = nft.mint(user1, 20);
        uint256 tokenId3 = nft.mint(user2, 15);
        
        vm.stopPrank();
        
        assertEq(nft.totalSupply(), 3);
        assertEq(nft.balanceOf(user1), 2);
        assertEq(nft.balanceOf(user2), 1);
        assertEq(nft.highestScores(user1), 20); // Should be updated to highest score
        assertEq(nft.highestScores(user2), 15);
    }

    function test_OnlyOwnerCanMint() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.mint(user2, 10);
    }

    function test_CannotMintWithZeroScore() public {
        vm.prank(owner);
        vm.expectRevert("Score must be greater than 0");
        nft.mint(user1, 0);
    }

    function test_CannotMintToZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("Cannot mint to zero address");
        nft.mint(address(0), 10);
    }

    function test_GetTokensByOwner() public {
        vm.startPrank(owner);
        
        uint256 tokenId1 = nft.mint(user1, 10);
        uint256 tokenId2 = nft.mint(user2, 15);
        uint256 tokenId3 = nft.mint(user1, 20);
        
        vm.stopPrank();
        
        uint256[] memory user1Tokens = nft.getTokensByOwner(user1);
        uint256[] memory user2Tokens = nft.getTokensByOwner(user2);
        
        assertEq(user1Tokens.length, 2);
        assertEq(user2Tokens.length, 1);
        assertEq(user1Tokens[0], tokenId1);
        assertEq(user1Tokens[1], tokenId3);
        assertEq(user2Tokens[0], tokenId2);
    }

    function test_GenerateSVG() public {
        vm.prank(owner);
        uint256 tokenId = nft.mint(user1, 25);
        
        string memory tokenURI = nft.tokenURI(tokenId);
        assertTrue(bytes(tokenURI).length > 0);
    }

    function test_GetTopScores() public {
        vm.startPrank(owner);
        
        nft.mint(user1, 25); // Legendary
        nft.mint(user2, 15); // Epic
        nft.mint(address(0x4), 10); // Rare
        
        vm.stopPrank();
        
        (address[] memory addresses, uint256[] memory scores) = nft.getTopScores(3);
        
        assertEq(addresses.length, 3);
        assertEq(scores.length, 3);
        assertEq(addresses[0], user1);
        assertEq(scores[0], 25);
    }

    function test_GetTopScoresWithLimit() public {
        vm.startPrank(owner);
        
        nft.mint(user1, 25);
        nft.mint(user2, 20);
        nft.mint(address(0x4), 15);
        nft.mint(address(0x5), 10);
        
        vm.stopPrank();
        
        (address[] memory addresses, uint256[] memory scores) = nft.getTopScores(2);
        
        assertEq(addresses.length, 2);
        assertEq(scores[0], 25);
        assertEq(scores[1], 20);
    }

    function test_GetTopScoresInvalidLimit() public {
        vm.expectRevert("Limit must be between 1 and 100");
        nft.getTopScores(0);
        
        vm.expectRevert("Limit must be between 1 and 100");
        nft.getTopScores(101);
    }

    function test_TokenScoreRarityMapping() public {
        vm.startPrank(owner);
        
        // Test different score ranges
        nft.mint(user1, 25); // Legendary (>= 20)
        nft.mint(user1, 18); // Epic (>= 15)
        nft.mint(user1, 12); // Rare (>= 10)
        nft.mint(user1, 7);  // Common (>= 5)
        nft.mint(user1, 3);  // Basic (< 5)
        
        vm.stopPrank();
        
        // Verify all tokens were minted successfully
        assertEq(nft.totalSupply(), 5);
        assertEq(nft.balanceOf(user1), 5);
        
        // Check individual scores
        assertEq(nft.getTokenScore(1), 25);
        assertEq(nft.getTokenScore(2), 18);
        assertEq(nft.getTokenScore(3), 12);
        assertEq(nft.getTokenScore(4), 7);
        assertEq(nft.getTokenScore(5), 3);
    }

    function test_TokenURIGeneration() public {
        vm.prank(owner);
        uint256 tokenId = nft.mint(user1, 20);
        
        string memory uri = nft.tokenURI(tokenId);
        
        // Check that URI is not empty and contains expected base64 prefix
        assertTrue(bytes(uri).length > 0);
        assertTrue(bytes(uri).length > 29); // "data:application/json;base64," is 29 chars
    }

    function test_EventEmission() public {
        vm.expectEmit(true, true, false, true);
        emit FootballQuizNFT.ScoreNFTMinted(user1, 1, 15);
        
        vm.prank(owner);
        nft.mint(user1, 15);
    }

    function test_SupportsInterface() public {
        // ERC721 interface
        assertTrue(nft.supportsInterface(0x80ac58cd));
        // ERC721Metadata interface
        assertTrue(nft.supportsInterface(0x5b5e139f));
        // ERC165 interface
        assertTrue(nft.supportsInterface(0x01ffc9a7));
    }

    function test_GetNonExistentToken() public {
        vm.expectRevert("Token does not exist");
        nft.getTokenScore(999);
        
        vm.expectRevert("Token does not exist");
        nft.getTokenTimestamp(999);
    }

    function test_FuzzMinting(uint256 score) public {
        vm.assume(score > 0 && score <= 1000);
        
        vm.prank(owner);
        uint256 tokenId = nft.mint(user1, score);
        
        assertEq(nft.getTokenScore(tokenId), score);
        assertEq(nft.ownerOf(tokenId), user1);
        assertTrue(nft.getTokenTimestamp(tokenId) > 0);
    }
}