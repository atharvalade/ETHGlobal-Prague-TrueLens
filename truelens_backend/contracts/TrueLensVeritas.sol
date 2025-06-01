// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TrueLensVeritas
 * @dev Main contract for TrueLens news verification system
 * Integrates with vlayer (web proofs), Pyth (price feeds), and Hedera (consensus)
 */
contract TrueLensVeritas is Ownable, ReentrancyGuard {
    
    struct NewsArticle {
        uint256 id;
        string title;
        string url;
        string content;
        address submitter;
        uint256 timestamp;
        bytes32 webProofHash;
        bool isVerified;
        int64 priceAtSubmission;
        int64 currentPrice;
        uint256 truthScore;
        string hederaTopicId;
        bool pythValidated;
    }
    
    struct SourceTrustMetrics {
        string domain;
        uint256 totalSubmissions;
        uint256 verifiedSubmissions;
        uint256 truthScore;
        bool isWhitelisted;
    }
    
    // Events
    event NewsSubmitted(uint256 indexed articleId, address indexed submitter, string title);
    event WebProofGenerated(uint256 indexed articleId, bytes32 proofHash);
    event PythValidationComplete(uint256 indexed articleId, bool validated, int64 price);
    event HederaLogged(uint256 indexed articleId, string topicId);
    event TruthScoreUpdated(uint256 indexed articleId, uint256 newScore);
    event SourceTrustUpdated(string domain, uint256 newTrustScore);
    
    // State variables
    mapping(uint256 => NewsArticle) public articles;
    mapping(string => SourceTrustMetrics) public sourceTrust;
    mapping(address => uint256[]) public userSubmissions;
    
    uint256 public articleCounter;
    uint256 public constant TRUTH_SCORE_THRESHOLD = 70;
    
    // vlayer integration interfaces
    interface IVlayerProver {
        function generateWebProof(string calldata url) external returns (bytes32);
    }
    
    interface IVlayerVerifier {
        function verifyWebProof(bytes32 proofHash, string calldata url) external view returns (bool);
    }
    
    // Pyth integration
    interface IPyth {
        function getPrice(bytes32 id) external view returns (int64 price, uint256 conf, int32 expo, uint256 publishTime);
        function updatePriceFeeds(bytes[] calldata priceUpdateData) external payable;
    }
    
    IVlayerProver public vlayerProver;
    IVlayerVerifier public vlayerVerifier;
    IPyth public pythOracle;
    
    // Placeholder addresses - to be updated with actual deployed contracts
    address public constant VLAYER_PROVER = address(0x1234567890123456789012345678901234567890);
    address public constant VLAYER_VERIFIER = address(0x2345678901234567890123456789012345678901);
    address public constant PYTH_CONTRACT = address(0x3456789012345678901234567890123456789012);
    
    constructor() {
        vlayerProver = IVlayerProver(VLAYER_PROVER);
        vlayerVerifier = IVlayerVerifier(VLAYER_VERIFIER);
        pythOracle = IPyth(PYTH_CONTRACT);
    }
    
    /**
     * @dev Submit a news article for verification
     */
    function submitArticle(
        string calldata title,
        string calldata url,
        string calldata content,
        string calldata sourceDomain
    ) external nonReentrant returns (uint256) {
        articleCounter++;
        uint256 articleId = articleCounter;
        
        articles[articleId] = NewsArticle({
            id: articleId,
            title: title,
            url: url,
            content: content,
            submitter: msg.sender,
            timestamp: block.timestamp,
            webProofHash: bytes32(0),
            isVerified: false,
            priceAtSubmission: 0,
            currentPrice: 0,
            truthScore: 0,
            hederaTopicId: "",
            pythValidated: false
        });
        
        userSubmissions[msg.sender].push(articleId);
        
        // Update source metrics
        if (sourceTrust[sourceDomain].totalSubmissions == 0) {
            sourceTrust[sourceDomain] = SourceTrustMetrics({
                domain: sourceDomain,
                totalSubmissions: 1,
                verifiedSubmissions: 0,
                truthScore: 50, // Starting score
                isWhitelisted: false
            });
        } else {
            sourceTrust[sourceDomain].totalSubmissions++;
        }
        
        emit NewsSubmitted(articleId, msg.sender, title);
        return articleId;
    }
    
    /**
     * @dev Generate web proof for article using vlayer
     */
    function generateWebProof(uint256 articleId) external {
        require(articles[articleId].id != 0, "Article does not exist");
        require(articles[articleId].webProofHash == bytes32(0), "Web proof already generated");
        
        bytes32 proofHash = vlayerProver.generateWebProof(articles[articleId].url);
        articles[articleId].webProofHash = proofHash;
        
        emit WebProofGenerated(articleId, proofHash);
    }
    
    /**
     * @dev Verify web proof using vlayer
     */
    function verifyWebProof(uint256 articleId) external view returns (bool) {
        require(articles[articleId].id != 0, "Article does not exist");
        require(articles[articleId].webProofHash != bytes32(0), "No web proof generated");
        
        return vlayerVerifier.verifyWebProof(
            articles[articleId].webProofHash,
            articles[articleId].url
        );
    }
    
    /**
     * @dev Update price feeds and validate against article claims
     */
    function validateWithPyth(
        uint256 articleId,
        bytes32 priceId,
        bytes[] calldata priceUpdateData
    ) external payable {
        require(articles[articleId].id != 0, "Article does not exist");
        
        // Update price feeds
        pythOracle.updatePriceFeeds{value: msg.value}(priceUpdateData);
        
        // Get current price
        (int64 price, , , ) = pythOracle.getPrice(priceId);
        articles[articleId].currentPrice = price;
        
        // Simple validation logic - can be enhanced with ML
        bool validated = _validatePriceMovement(articleId, price);
        articles[articleId].pythValidated = validated;
        
        emit PythValidationComplete(articleId, validated, price);
    }
    
    /**
     * @dev Set Hedera topic ID for article
     */
    function setHederaTopicId(uint256 articleId, string calldata topicId) external onlyOwner {
        require(articles[articleId].id != 0, "Article does not exist");
        articles[articleId].hederaTopicId = topicId;
        emit HederaLogged(articleId, topicId);
    }
    
    /**
     * @dev Calculate and update truth score based on verifications
     */
    function updateTruthScore(uint256 articleId) external {
        require(articles[articleId].id != 0, "Article does not exist");
        
        uint256 score = 0;
        
        // Web proof verification (30 points)
        if (articles[articleId].webProofHash != bytes32(0) && 
            vlayerVerifier.verifyWebProof(articles[articleId].webProofHash, articles[articleId].url)) {
            score += 30;
        }
        
        // Pyth validation (40 points)
        if (articles[articleId].pythValidated) {
            score += 40;
        }
        
        // Hedera logging (20 points)
        if (bytes(articles[articleId].hederaTopicId).length > 0) {
            score += 20;
        }
        
        // Time factor (10 points - newer articles get higher scores)
        uint256 timeDiff = block.timestamp - articles[articleId].timestamp;
        if (timeDiff < 1 hours) {
            score += 10;
        } else if (timeDiff < 6 hours) {
            score += 5;
        }
        
        articles[articleId].truthScore = score;
        
        if (score >= TRUTH_SCORE_THRESHOLD) {
            articles[articleId].isVerified = true;
        }
        
        emit TruthScoreUpdated(articleId, score);
    }
    
    /**
     * @dev Get article details
     */
    function getArticle(uint256 articleId) external view returns (NewsArticle memory) {
        return articles[articleId];
    }
    
    /**
     * @dev Get source trust metrics
     */
    function getSourceTrust(string calldata domain) external view returns (SourceTrustMetrics memory) {
        return sourceTrust[domain];
    }
    
    /**
     * @dev Get user submissions
     */
    function getUserSubmissions(address user) external view returns (uint256[] memory) {
        return userSubmissions[user];
    }
    
    /**
     * @dev Internal function to validate price movement
     */
    function _validatePriceMovement(uint256 articleId, int64 currentPrice) internal view returns (bool) {
        // Simple validation logic - check if price movement aligns with article sentiment
        // This would be enhanced with proper ML analysis
        NewsArticle memory article = articles[articleId];
        
        // For demo purposes, assume validation if price data is available
        return currentPrice != 0;
    }
    
    /**
     * @dev Update contract addresses (for testing/deployment)
     */
    function updateContractAddresses(
        address _vlayerProver,
        address _vlayerVerifier,
        address _pythOracle
    ) external onlyOwner {
        vlayerProver = IVlayerProver(_vlayerProver);
        vlayerVerifier = IVlayerVerifier(_vlayerVerifier);
        pythOracle = IPyth(_pythOracle);
    }
    
    /**
     * @dev Emergency withdraw function
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {}
} 