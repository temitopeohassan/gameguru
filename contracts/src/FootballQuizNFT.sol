// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/Strings.sol";
import "openzeppelin-contracts/contracts/utils/Base64.sol";

contract FootballQuizNFT is ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    uint256 public constant MINT_PRICE = 0.0001 ether; // 0.05 CELO
    
    // Mapping from token ID to quiz score
    mapping(uint256 => uint256) public tokenScores;
    
    // Mapping from token ID to timestamp when minted
    mapping(uint256 => uint256) public tokenTimestamps;
    
    // Mapping from address to their highest score
    mapping(address => uint256) public highestScores;
    
    // Events
    event ScoreNFTMinted(address indexed to, uint256 indexed tokenId, uint256 score);
    
    constructor(address initialOwner) 
        ERC721("Football Quiz Achievement", "FQA") 
        Ownable(initialOwner) 
    {}

    /**
     * @dev Mint an NFT with the user's quiz score
     * @param to Address to mint the NFT to
     * @param score The quiz score to record
     */
    function mint(address to, uint256 score) public payable returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(score > 0, "Score must be greater than 0");
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        // Store score and timestamp
        tokenScores[tokenId] = score;
        tokenTimestamps[tokenId] = block.timestamp;
        
        // Update highest score if needed
        if (score > highestScores[to]) {
            highestScores[to] = score;
        }
        
        // Mint the NFT
        _safeMint(to, tokenId);
        
        // Set the token URI with generated metadata
        _setTokenURI(tokenId, generateTokenURI(tokenId, score));
        
        // Refund excess payment if any
        if (msg.value > MINT_PRICE) {
            payable(msg.sender).transfer(msg.value - MINT_PRICE);
        }
        
        emit ScoreNFTMinted(to, tokenId, score);
        
        return tokenId;
    }

    /**
     * @dev Withdraw contract balance to owner
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Generate SVG image for the NFT based on score
     */
    function generateSVG(uint256 score) internal pure returns (string memory) {
        string memory bgColor;
        string memory textColor;
        string memory message;
        string memory trophy;
        
        if (score >= 20) {
            bgColor = "#FFD700"; // Gold
            textColor = "#8B4513";
            message = "LEGENDARY!";
            trophy = "\u1F3C6"; // 🏆
        } else if (score >= 15) {
            bgColor = "#C0C0C0"; // Silver
            textColor = "#2F4F4F";
            message = "EXPERT!";
            trophy = "\u1F948"; // 🥈
        } else if (score >= 10) {
            bgColor = "#CD7F32"; // Bronze
            textColor = "#FFFFFF";
            message = "SKILLED!";
            trophy = "\u1F949"; // 🥉
        } else if (score >= 5) {
            bgColor = "#4169E1"; // Royal Blue
            textColor = "#FFFFFF";
            message = "GOOD JOB!";
            trophy = "\u26BD"; // ⚽
        } else {
            bgColor = "#32CD32"; // Lime Green
            textColor = "#FFFFFF";
            message = "KEEP TRYING!";
            trophy = "\u1F3AF"; // 🎯
        }

        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
            '<rect width="400" height="400" fill="', bgColor, '"/>',
            '<circle cx="200" cy="120" r="80" fill="white" opacity="0.9"/>',
            '<text x="200" y="135" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="', textColor, '">', trophy, '</text>',
            '<text x="200" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="', textColor, '">SCORE: ', score.toString(), '</text>',
            '<text x="200" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="', textColor, '">', message, '</text>',
            '<text x="200" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="', textColor, '">Football Quiz</text>',
            '<text x="200" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="', textColor, '">Achievement NFT</text>',
            '</svg>'
        ));
    }

    /**
     * @dev Generate complete token URI with metadata
     */
    function generateTokenURI(uint256 tokenId, uint256 score) internal view returns (string memory) {
        string memory svg = generateSVG(score);
        string memory imageURI = string(abi.encodePacked(
            "data:image/svg+xml;base64,",
            Base64.encode(bytes(svg))
        ));
        
        // Determine rarity based on score
        string memory rarity;
        if (score >= 20) rarity = "Legendary";
        else if (score >= 15) rarity = "Epic";
        else if (score >= 10) rarity = "Rare";
        else if (score >= 5) rarity = "Common";
        else rarity = "Basic";
        
        string memory json = string(abi.encodePacked(
            '{',
            '"name": "Football Quiz Achievement #', tokenId.toString(), '",',
            '"description": "This NFT represents a football quiz achievement with a score of ', score.toString(), ' correct answers in a row. Minted on ', block.timestamp.toString(), '.",',
            '"image": "', imageURI, '",',
            '"attributes": [',
                '{',
                    '"trait_type": "Score",',
                    '"value": ', score.toString(),
                '},',
                '{',
                    '"trait_type": "Rarity",',
                    '"value": "', rarity, '"',
                '},',
                '{',
                    '"trait_type": "Game Type",',
                    '"value": "Football Quiz"',
                '},',
                '{',
                    '"trait_type": "Mint Timestamp",',
                    '"value": ', block.timestamp.toString(),
                '}',
            ']',
            '}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    /**
     * @dev Get the score for a specific token
     */
    function getTokenScore(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenScores[tokenId];
    }

    /**
     * @dev Get the mint timestamp for a specific token
     */
    function getTokenTimestamp(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenTimestamps[tokenId];
    }

    /**
     * @dev Get all token IDs owned by an address
     */
    function getTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _tokenIdCounter; i++) {
            if (_ownerOf(i) == owner) {
                tokens[index] = i;
                index++;
            }
        }
        
        return tokens;
    }

    /**
     * @dev Get leaderboard of top scores
     */
    function getTopScores(uint256 limit) public view returns (address[] memory addresses, uint256[] memory scores) {
        require(limit > 0 && limit <= 100, "Limit must be between 1 and 100");
        
        // This is a simple implementation - for production, consider using a more efficient data structure
        uint256 totalTokens = _tokenIdCounter;
        uint256 resultCount = limit > totalTokens ? totalTokens : limit;
        
        addresses = new address[](resultCount);
        scores = new uint256[](resultCount);
        
        // Find top scores (simplified - in production, maintain sorted list)
        for (uint256 i = 0; i < resultCount; i++) {
            uint256 maxScore = 0;
            address maxAddress = address(0);
            
            for (uint256 j = 1; j <= totalTokens; j++) {
                address tokenOwner = _ownerOf(j);
                if (tokenOwner != address(0)) {
                    uint256 tokenScore = tokenScores[j];
                    
                    // Check if this score is higher and not already included
                    bool alreadyIncluded = false;
                    for (uint256 k = 0; k < i; k++) {
                        if (addresses[k] == tokenOwner && scores[k] >= tokenScore) {
                            alreadyIncluded = true;
                            break;
                        }
                    }
                    
                    if (!alreadyIncluded && tokenScore > maxScore) {
                        maxScore = tokenScore;
                        maxAddress = tokenOwner;
                    }
                }
            }
            
            if (maxAddress != address(0)) {
                addresses[i] = maxAddress;
                scores[i] = maxScore;
            }
        }
    }

    /**
     * @dev Get total number of NFTs minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}