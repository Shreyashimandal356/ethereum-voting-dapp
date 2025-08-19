// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    address public admin;

    enum State {
        Created,
        Voting,
        Ended
    }

    State public state;
    string[] private _candidates;
    mapping(uint256 => uint256) public votes; // candidate index => votes
    mapping(address => bool) public hasVoted;

    event CandidateAdded(string name);
    event VoteCast(address indexed voter, uint256 indexed candidate);
    event StateChanged(State state);

    modifier onlyAdmin() {
        require(msg.sender == admin, "not admin");
        _;
    }

    modifier inState(State s) {
        require(state == s, "invalid state");
        _;
    }

    constructor(string[] memory candidates_) {
        admin = msg.sender;
        for (uint256 i = 0; i < candidates_.length; i++) {
            _candidates.push(candidates_[i]);
            emit CandidateAdded(candidates_[i]);
        }
        state = State.Created;
    }

    function start() external onlyAdmin inState(State.Created) {
        state = State.Voting;
        emit StateChanged(state);
    }

    function end() external onlyAdmin inState(State.Voting) {
        state = State.Ended;
        emit StateChanged(state);
    }

    function totalCandidates() external view returns (uint256) {
        return _candidates.length;
    }

    function getCandidates() external view returns (string[] memory) {
        return _candidates;
    }

    function results() external view returns (uint256[] memory) {
        uint256 len = _candidates.length;
        uint256[] memory r = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            r[i] = votes[i];
        }
        return r;
    }

    function vote(uint256 index) external inState(State.Voting) {
        require(index < _candidates.length, "bad index");
        require(!hasVoted[msg.sender], "already voted");
        hasVoted[msg.sender] = true;
        votes[index] += 1;
        emit VoteCast(msg.sender, index);
    }
}
