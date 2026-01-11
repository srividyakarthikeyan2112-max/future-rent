// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InvestmentRegistry {
    struct Investment {
        uint256 tokenId;
        address investor;
        uint256 sharePercent;
        uint256 investedAmount;
        uint256 timestamp;
    }

    mapping(address => Investment[]) private investmentsByInvestor;

    event InvestmentCreated(address indexed investor, uint256 tokenId, uint256 sharePercent, uint256 investedAmount);

    function recordInvestment(uint256 tokenId, address investor, uint256 sharePercent, uint256 investedAmount) public {
        Investment memory inv = Investment({
            tokenId: tokenId,
            investor: investor,
            sharePercent: sharePercent,
            investedAmount: investedAmount,
            timestamp: block.timestamp
        });
        investmentsByInvestor[investor].push(inv);
        emit InvestmentCreated(investor, tokenId, sharePercent, investedAmount);
    }

    function getInvestments(address investor) public view returns (Investment[] memory) {
        return investmentsByInvestor[investor];
    }
}
