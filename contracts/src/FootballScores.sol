// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FootballScores {
    // Struct to store score details
    struct Score {
        uint256 score;
        uint256 timestamp;
        string metadata;
    }

    // Mapping from user address to their scores
    mapping(address => Score[]) public userScores;
    
    // Mapping to track total scores per user
    mapping(address => uint256) public userScoreCount;
    
    // Event emitted when a new score is recorded
    event ScoreRecorded(
        address indexed user,
        uint256 score,
        uint256 timestamp,
        string metadata
    );

    // Function to record a new score
    function recordScore(uint256 _score, string memory _metadata) public {
        Score memory newScore = Score({
            score: _score,
            timestamp: block.timestamp,
            metadata: _metadata
        });
        
        userScores[msg.sender].push(newScore);
        userScoreCount[msg.sender]++;
        
        emit ScoreRecorded(
            msg.sender,
            _score,
            block.timestamp,
            _metadata
        );
    }

    // Function to get all scores for a user
    function getUserScores(address _user) public view returns (Score[] memory) {
        return userScores[_user];
    }

    // Function to get the latest score for a user
    function getLatestScore(address _user) public view returns (Score memory) {
        require(userScoreCount[_user] > 0, "No scores found for user");
        return userScores[_user][userScoreCount[_user] - 1];
    }

    // Function to get the highest score for a user
    function getHighestScore(address _user) public view returns (uint256) {
        require(userScoreCount[_user] > 0, "No scores found for user");
        
        uint256 highestScore = 0;
        for (uint256 i = 0; i < userScoreCount[_user]; i++) {
            if (userScores[_user][i].score > highestScore) {
                highestScore = userScores[_user][i].score;
            }
        }
        return highestScore;
    }
}