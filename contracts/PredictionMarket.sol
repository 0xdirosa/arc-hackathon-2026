// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PredictionMarket {
    address public oracle;
    uint256 public marketId;
    string public question;
    uint256 public outcomeA;
    uint256 public outcomeB;
    uint256 public totalSharesA;
    uint256 public totalSharesB;
    bool public resolved;
    uint256 public winningOutcome;
    uint256 public constant USDC_DECIMALS = 6;

    mapping(address => uint256) public sharesA;
    mapping(address => uint256) public sharesB;
    mapping(address => bool) public claimed;

    event SharesBought(address indexed buyer, uint256 outcome, uint256 amount, uint256 shares);
    event Resolved(uint256 winningOutcome);
    event Claimed(address indexed claimant, uint256 amount);

    constructor(string memory _question, address _oracle) {
        question = _question;
        oracle = _oracle;
        marketId = uint256(keccak256(abi.encodePacked(block.timestamp, _question)));
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Not oracle");
        _;
    }

    function buyOutcome(uint256 outcome, uint256 usdcAmount) external {
        require(outcome == 0 || outcome == 1, "Invalid outcome");
        require(!resolved, "Resolved");
        require(usdcAmount > 0, "Zero amount");

        uint256 shares = usdcAmount;

        if (outcome == 0) {
            sharesA[msg.sender] += shares;
            totalSharesA += shares;
        } else {
            sharesB[msg.sender] += shares;
            totalSharesB += shares;
        }

        emit SharesBought(msg.sender, outcome, usdcAmount, shares);
    }

    function resolve(uint256 _winningOutcome) external onlyOracle {
        require(!resolved, "Already resolved");
        require(_winningOutcome == 0 || _winningOutcome == 1, "Invalid");
        resolved = true;
        winningOutcome = _winningOutcome;
        emit Resolved(_winningOutcome);
    }

    function claim() external {
        require(resolved, "Not resolved");
        require(!claimed[msg.sender], "Already claimed");

        uint256 shareBalance;
        if (winningOutcome == 0) {
            shareBalance = sharesA[msg.sender];
        } else {
            shareBalance = sharesB[msg.sender];
        }
        require(shareBalance > 0, "No winning shares");

        uint256 totalWinningShares = winningOutcome == 0 ? totalSharesA : totalSharesB;
        uint256 totalPool = (totalSharesA + totalSharesB) * 1e12;
        uint256 payout = (shareBalance * totalPool) / totalWinningShares;

        claimed[msg.sender] = true;
        emit Claimed(msg.sender, payout);
    }

    function getPrice(uint256 outcome) external view returns (uint256) {
        uint256 total = totalSharesA + totalSharesB;
        if (total == 0) return 0.5e6;
        if (outcome == 0) return (totalSharesA * 1e6) / total;
        return (totalSharesB * 1e6) / total;
    }
}
