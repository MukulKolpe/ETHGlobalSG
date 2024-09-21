// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// Imports
import "./GovernanceToken.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { MACI } from "maci-contracts/contracts/MACI.sol";
import { IPollFactory } from "maci-contracts/contracts/interfaces/IPollFactory.sol";
import { IMessageProcessorFactory } from "maci-contracts/contracts/interfaces/IMPFactory.sol";
import { ITallyFactory } from "maci-contracts/contracts/interfaces/ITallyFactory.sol";
import { SignUpGatekeeper } from "maci-contracts/contracts/gatekeepers/SignUpGatekeeper.sol";
import { InitialVoiceCreditProxy } from "maci-contracts/contracts/initialVoiceCreditProxy/InitialVoiceCreditProxy.sol";

// Contract Declaration
contract DAOManager is MACI, Ownable(msg.sender) {
    // State Variables
    address public userSideAdmin;
    uint256 public totalUsers = 0;
    uint256 public totalProposals = 0;
    uint256 public totalDaos = 0;
    uint256 public contractCreationTime = 0;
    uint256 public totalDocuments = 0;
  	TreeDepths public treeDepths;
	PubKey public coordinatorPubKey;
	address public verifier;
	address public vkRegistry;

	

    mapping(uint256 => user) public userIdtoUser;
    mapping(address => uint256) public userWallettoUserId;
    mapping(uint256 => dao) public daoIdtoDao;
    mapping(uint256 => proposal) public proposalIdtoProposal;
    mapping(uint256 => uint256[]) public daoIdtoMembers;
    mapping(uint256 => uint256[]) public daoIdtoProposals;
    mapping(uint256 => uint256[]) public proposalIdtoVoters;
    mapping(uint256 => uint256[]) public proposalIdtoYesVoters;
    mapping(uint256 => uint256[]) public proposalIdtoNoVoters;
    mapping(uint256 => uint256[]) public proposalIdtoAbstainVoters;
    mapping(uint256 => uint256[]) public userIdtoDaos;
    mapping(uint256 => mapping(uint256 => uint256)) public quadraticYesMappings;
    mapping(uint256 => mapping(uint256 => uint256)) public quadraticNoMappings;
    mapping(uint256 => Document) public documentIdtoDocument;
    mapping(uint256 => uint256[]) public daoIdtoDocuments;
    mapping(uint256 => PollData) internal _polls;
    mapping(address => uint256) public pollIds;
    // pubkey.x => pubkey.y => bool
	mapping(uint256 => mapping(uint256 => bool)) public isPublicKeyRegistered;


    // Events
    event UserCreated(uint256 indexed userId, string userName, address userWallet);
    event DAOCreated(uint256 indexed daoId, string daoName, address creatorWallet);
    event ProposalCreated(uint256 indexed proposalId, uint256 daoId, address proposerWallet);
    event MemberAddedToDAO(uint256 indexed daoId, uint256 userId, address userWallet);
    event UserJoinedDAO(uint256 indexed daoId, uint256 userId, address userWallet);
    event DocumentUploaded(uint256 indexed documentId, uint256 daoId, address uploaderWallet);
    event VoteCast(uint256 indexed proposalId, uint256 userId, uint256 voteChoice);
    event QVVoteCast(uint256 indexed proposalId, uint256 userId, uint256 numTokens, uint256 voteChoice);
    event PollCreated(
		uint256 indexed pollId,
		address indexed creator,
		DAOManager.PollContracts pollContracts,
		string name,
		string[] options,
		string metadata,
		uint256 startTime,
		uint256 endTime
	);

	event PollTallyCIDUpdated(uint256 indexed pollId, string tallyJsonCID);

    // Structs
    struct user {
        uint256 userId;
        string userName;
        string userEmail;
        string description;
        string profileImage;
        address userWallet;
    }

    struct dao {
        uint256 daoId;
        uint256 creator;
        string daoName;
        string daoDescription;
        uint256 joiningThreshold;
        uint256 proposingThreshold;
        address governanceTokenAddress;
        bool isPrivate;
        string discordID;
    }

    struct proposal {
        uint256 proposalId;
        uint256 proposalType;
        string proposalTitleAndDesc;
        uint256 proposerId;
        uint256 votingThreshold;
        uint256 daoId;
        address votingTokenAddress;
        uint256 beginningTime;
        uint256 endingTime;
        uint256 passingThreshold;
        bool voteOnce;
    }

    struct Document {
        uint256 documentId;
        string documentTitle;
        string documentDescription;
        string ipfsHash;
        uint256 upoladerId;
        uint256 daoId;
    }

    struct PollData {
		uint256 id;
		string name;
		bytes encodedOptions;
		string metadata;
		DAOManager.PollContracts pollContracts;
		uint256 startTime;
		uint256 endTime;
		uint256 numOfOptions;
		string[] options;
		string tallyJsonCID;
	}

    //Errors 
    error PubKeyAlreadyRegistered();
	error PollAddressDoesNotExist(address _poll);

    // Constructor
    constructor(IPollFactory _pollFactory,
		IMessageProcessorFactory _messageProcessorFactory,
		ITallyFactory _tallyFactory,
		SignUpGatekeeper _signUpGatekeeper,
		InitialVoiceCreditProxy _initialVoiceCreditProxy,
		uint8 _stateTreeDepth,
		uint256[5] memory _emptyBallotRoots)  MACI(
			_pollFactory,
			_messageProcessorFactory,
			_tallyFactory,
			_signUpGatekeeper,
			_initialVoiceCreditProxy,
			_stateTreeDepth,
			_emptyBallotRoots
		) {
        userSideAdmin = msg.sender;
        contractCreationTime = block.timestamp;
       

    }

    // External Functions
    function createUser(
        string memory _userName,
        string memory _userEmail,
        string memory _description,
        string memory _profileImage,
        address _userWalletAddress
    ) public {
        totalUsers++;
        user memory u1 = user(totalUsers, _userName, _userEmail, _description, _profileImage, _userWalletAddress);
        userIdtoUser[totalUsers] = u1;
        userWallettoUserId[_userWalletAddress] = totalUsers;
        
        emit UserCreated(totalUsers, _userName, _userWalletAddress);
    }

    function createDao(
        string memory _daoName,
        string memory _daoDescription,
        uint256 _joiningThreshold,
        uint256 _proposingThreshold,
        address _joiningTokenAddress,
        bool _isPrivate,
        address _userWalletAddress,
        string memory _discordID
    ) public {
        totalDaos++;
        uint256 creatorId = userWallettoUserId[_userWalletAddress];
        require(creatorId != 0, "User is not registered into the system");
        dao memory d1 = dao(
            totalDaos,
            creatorId,
            _daoName,
            _daoDescription,
            _joiningThreshold * 1000000000000000000,
            _proposingThreshold * 1000000000000000000,
            _joiningTokenAddress,
            _isPrivate,
            _discordID
        );
        daoIdtoDao[totalDaos] = d1;
        daoIdtoMembers[totalDaos].push(creatorId);
        userIdtoDaos[creatorId].push(totalDaos);
        
        emit DAOCreated(totalDaos, _daoName, _userWalletAddress);
    }

    function createProposal(
        uint256 _proposalType,
        string memory _proposalTitleAndDesc,
        uint256 _votingThreshold,
        uint256 _daoId,
        address _governanceTokenAddress,
        address _userWalletAddress,
        uint256 _beginningTime,
        uint256 _endingTime,
        uint256 _passingThreshold,
        bool _voteOnce
    ) public {
        address daoGovernanceToken = daoIdtoDao[_daoId].governanceTokenAddress;
        GovernanceToken govtToken = GovernanceToken(daoGovernanceToken);
        require(
            govtToken.balanceOf(_userWalletAddress) >= daoIdtoDao[_daoId].proposingThreshold,
            "You do not have enough tokens"
        );
        totalProposals++;
        uint256 tempProposerId = userWallettoUserId[_userWalletAddress];
        proposal memory p1 = proposal(
            totalProposals,
            _proposalType,
            _proposalTitleAndDesc,
            tempProposerId,
            _votingThreshold * 1000000000000000000,
            _daoId,
            _governanceTokenAddress,
            _beginningTime,
            _endingTime,
            _passingThreshold,
            _voteOnce
        );
        proposalIdtoProposal[totalProposals] = p1;
        daoIdtoProposals[_daoId].push(totalProposals);
        
        emit ProposalCreated(totalProposals, _daoId, _userWalletAddress);
    }

    function addMembertoDao(uint256 _daoId, address _userWalletAddress, address _adminWalletAddress) public {
        uint256 tempUserId = userWallettoUserId[_adminWalletAddress];
        require(tempUserId == daoIdtoDao[_daoId].creator, "Only admin can add users to the dao");
        uint256 newUserId = userWallettoUserId[_userWalletAddress];
        require(newUserId > 0, "User is not registered into the system");
        daoIdtoMembers[_daoId].push(newUserId);
        userIdtoDaos[newUserId].push(_daoId);
        
        emit MemberAddedToDAO(_daoId, newUserId, _userWalletAddress);
    }

    function joinDao(uint256 _daoId, address _callerWalletAddress) public {
        require(daoIdtoDao[_daoId].isPrivate == false, "Dao is Private");
        address tempTokenAddress = daoIdtoDao[_daoId].governanceTokenAddress;
        GovernanceToken govtToken = GovernanceToken(tempTokenAddress);
        uint256 userBalance = govtToken.balanceOf(_callerWalletAddress);
        require(userBalance >= daoIdtoDao[_daoId].joiningThreshold, "Not enough Tokens");
        uint256 newUserId = userWallettoUserId[_callerWalletAddress];
        require(newUserId > 0, "User is not registered into the system");
        daoIdtoMembers[_daoId].push(newUserId);
        userIdtoDaos[newUserId].push(_daoId);
        
        emit UserJoinedDAO(_daoId, newUserId, _callerWalletAddress);
    }

    function uploadDocument(
        string memory _documentTitle,
        string memory _documentDesc,
        uint256 _daoId,
        string memory _ipfsHash
    ) public {
        checkMembership(_daoId, msg.sender);
        totalDocuments++;
        uint256 tempUserId = userWallettoUserId[msg.sender];
        Document memory d1 = Document(totalDocuments, _documentTitle, _documentDesc, _ipfsHash, tempUserId, _daoId);
        documentIdtoDocument[totalDocuments] = d1;
        daoIdtoDocuments[_daoId].push(totalDocuments);
        
        emit DocumentUploaded(totalDocuments, _daoId, msg.sender);
    }


    function setConfig(
		TreeDepths memory _treeDepths,
		PubKey memory _coordinatorPubKey,
		address _verifier,
		address _vkRegistry
	) public onlyOwner {
		treeDepths = _treeDepths;
		coordinatorPubKey = _coordinatorPubKey;
		verifier = _verifier;
		vkRegistry = _vkRegistry;
	}

	/// @notice Allows any eligible user sign up. The sign-up gatekeeper should prevent
	/// double sign-ups or ineligible users from doing so.  This function will
	/// only succeed if the sign-up deadline has not passed. It also enqueues a
	/// fresh state leaf into the state AccQueue.
	/// @param _pubKey The user's desired public key.
	/// @param _signUpGatekeeperData Data to pass to the sign-up gatekeeper's
	///     register() function. For instance, the POAPGatekeeper or
	///     SignUpTokenGatekeeper requires this value to be the ABI-encoded
	///     token ID.
	/// @param _initialVoiceCreditProxyData Data to pass to the
	///     InitialVoiceCreditProxy, which allows it to determine how many voice
	///     credits this user should have.
	function signUp(
		PubKey memory _pubKey,
		bytes memory _signUpGatekeeperData,
		bytes memory _initialVoiceCreditProxyData
	) public override {
		// check if the pubkey is already registered
		if (isPublicKeyRegistered[_pubKey.x][_pubKey.y])
			revert PubKeyAlreadyRegistered();

		super.signUp(
			_pubKey,
			_signUpGatekeeperData,
			_initialVoiceCreditProxyData
		);

		isPublicKeyRegistered[_pubKey.x][_pubKey.y] = true;
	}

	function createPoll(
		string calldata _name,
		string[] calldata _options,
		string calldata _metadata,
		uint256 _duration,
		Mode isQv
	) public onlyOwner {
		// TODO: check if the number of options are more than limit

		uint256 pollId = nextPollId;

		deployPoll(
			_duration,
			treeDepths,
			coordinatorPubKey,
			verifier,
			vkRegistry,
			isQv
		);

		PollContracts memory pollContracts = MACI.polls[pollId];

		pollIds[pollContracts.poll] = pollId;

		// encode options to bytes for retrieval
		bytes memory encodedOptions = abi.encode(_options);

		uint256 endTime = block.timestamp + _duration;

		// create poll
		_polls[pollId] = PollData({
			id: pollId,
			name: _name,
			encodedOptions: encodedOptions,
			numOfOptions: _options.length,
			metadata: _metadata,
			startTime: block.timestamp,
			endTime: endTime,
			pollContracts: pollContracts,
			options: _options,
			tallyJsonCID: ""
		});

		emit PollCreated(
			pollId,
			msg.sender,
			pollContracts,
			_name,
			_options,
			_metadata,
			block.timestamp,
			endTime
		);
	}

	function getPollId(address _poll) public view returns (uint256 pollId) {
		if (pollIds[_poll] >= nextPollId) revert PollAddressDoesNotExist(_poll);
		pollId = pollIds[_poll];
	}

	function updatePollTallyCID(
		uint256 _pollId,
		string calldata _tallyJsonCID
	) public onlyOwner {
		if (_pollId >= nextPollId) revert PollDoesNotExist(_pollId);
		PollData storage poll = _polls[_pollId];
		poll.tallyJsonCID = _tallyJsonCID;

		emit PollTallyCIDUpdated(_pollId, _tallyJsonCID);
	}

	function fetchPolls(
		uint256 _page,
		uint256 _perPage,
		bool _ascending
	) public view returns (PollData[] memory polls_) {
		uint256 start = (_page - 1) * _perPage;
		uint256 end = start + _perPage - 1;

		if (start >= nextPollId) {
			return new PollData[](0);
		}

		if (end >= nextPollId) {
			end = nextPollId - 1;
		}

		polls_ = new PollData[](end - start + 1);

		uint256 index = 0;
		for (uint256 i = start; i <= end; i++) {
			uint256 pollIndex = i;
			if (!_ascending) {
				pollIndex = nextPollId - i - 1;
			}
			polls_[index++] = _polls[pollIndex];
		}
	}

	function fetchPoll(
		uint256 _pollId
	) public view returns (PollData memory poll_) {
		if (_pollId >= nextPollId) revert PollDoesNotExist(_pollId);
		return _polls[_pollId];
	}

    function voteForProposal(uint256 _proposalId, uint256 _voteFor, address _callerWalletAddress) public {
        address funcCaller = _callerWalletAddress;
        uint256 tempDaoId = proposalIdtoProposal[_proposalId].daoId;
        require(checkMembership(tempDaoId, _callerWalletAddress), "Only members of the dao can vote");
        require(block.timestamp >= proposalIdtoProposal[_proposalId].beginningTime, "Voting has not started");
        require(block.timestamp < proposalIdtoProposal[_proposalId].endingTime, "Voting Time has ended");
        require(proposalIdtoProposal[_proposalId].proposalType == 1, "Voting Type is not yes/no");
        address votingTokenAddress = proposalIdtoProposal[_proposalId].votingTokenAddress;
        GovernanceToken govtToken = GovernanceToken(votingTokenAddress);
        uint256 userBalance = govtToken.balanceOf(msg.sender);
        uint256 tempUserId = userWallettoUserId[msg.sender];
        require(userBalance >= proposalIdtoProposal[_proposalId].votingThreshold, "Not enough Tokens");
        bool voteSignal = hasVoted(tempUserId, _proposalId);
        if (proposalIdtoProposal[_proposalId].voteOnce) {
            require(!voteSignal, "User has Voted");
        }
        govtToken.transferFrom(funcCaller, address(this), proposalIdtoProposal[_proposalId].votingThreshold);
        if (_voteFor == 1) {
            proposalIdtoYesVoters[_proposalId].push(tempUserId);
        } else if (_voteFor == 2) {
            proposalIdtoNoVoters[_proposalId].push(tempUserId);
        } else {
            proposalIdtoAbstainVoters[_proposalId].push(tempUserId);
        }
        
        emit VoteCast(_proposalId, tempUserId, _voteFor);
    }

    function qvVoting(uint256 _proposalId, uint256 _numTokens, address _callerWalletAddress, uint256 _voteFor) public {
        address funcCaller = _callerWalletAddress;
        uint256 tempDaoId = proposalIdtoProposal[_proposalId].daoId;
        require(checkMembership(tempDaoId, _callerWalletAddress), "Only members of the dao can vote");
        require(block.timestamp >= proposalIdtoProposal[_proposalId].beginningTime, "Voting has not started");
        require(block.timestamp < proposalIdtoProposal[_proposalId].endingTime, "Voting Time has ended");
        address votingTokenAddress = proposalIdtoProposal[_proposalId].votingTokenAddress;
        GovernanceToken govtToken = GovernanceToken(votingTokenAddress);
        uint256 userBalance = govtToken.balanceOf(msg.sender);
        uint256 tempUserId = userWallettoUserId[msg.sender];
        require(userBalance >= proposalIdtoProposal[_proposalId].votingThreshold, "Not enough Tokens");
        require(_numTokens >= proposalIdtoProposal[_proposalId].votingThreshold, "Not enough Tokens");
        govtToken.transferFrom(funcCaller, address(this), _numTokens);
        uint256 weight = sqrt(_numTokens);
        if (_voteFor == 1) {
            quadraticYesMappings[_proposalId][tempUserId] += weight;
        } else {
            quadraticNoMappings[_proposalId][tempUserId] += weight;
        }
        
        emit QVVoteCast(_proposalId, tempUserId, _numTokens, _voteFor);
    }

    // Internal & Private View & Pure Functions
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function hasVoted(uint256 _userId, uint256 _proposalId) public view returns (bool) {
        for (uint256 i = 0; i < proposalIdtoVoters[_proposalId].length; i++) {
            if (_userId == proposalIdtoVoters[_proposalId][i]) {
                return true;
            }
        }
        return false;
    }

    function checkMembership(uint256 _daoId, address _callerWalletAddress) public view returns (bool) {
        uint256 tempUserId = userWallettoUserId[_callerWalletAddress];
        uint256 totalMembers = daoIdtoMembers[_daoId].length;
        for (uint256 i = 0; i < totalMembers; i++) {
            if (tempUserId == daoIdtoMembers[_daoId][i]) {
                return true;
            }
        }
        return false;
    }

    // External & Public View & Pure Functions
    function getAllDaoMembers(uint256 _daoId) public view returns (uint256[] memory) {
        return daoIdtoMembers[_daoId];
    }

    function getAllDaoProposals(uint256 _daoId) public view returns (uint256[] memory) {
        return daoIdtoProposals[_daoId];
    }

    function getAllVoters(uint256 _proposalId) public view returns (uint256[] memory) {
        return proposalIdtoVoters[_proposalId];
    }

    function getAllYesVotes(uint256 _proposalId) public view returns (uint256[] memory) {
        return proposalIdtoYesVoters[_proposalId];
    }

    function getAllNoVotes(uint256 _proposalId) public view returns (uint256[] memory) {
        return proposalIdtoNoVoters[_proposalId];
    }

    function getAllAbstainVotes(uint256 _proposalId) public view returns (uint256[] memory) {
        return proposalIdtoAbstainVoters[_proposalId];
    }

    function getAllUserDaos(uint256 _userId) public view returns (uint256[] memory) {
        return userIdtoDaos[_userId];
    }

    function getAllDaoDocuments(uint256 _daoId) public view returns (uint256[] memory) {
        return daoIdtoDocuments[_daoId];
    }
}