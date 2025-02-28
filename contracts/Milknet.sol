// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract MilkSupplyChain {
    enum DisputeStatus { Open, Resolved, Rejected }
    
    address public owner;
    uint256 private constant MAX_EXPIRY_DAYS = 365;

    // Counters with initial value 1 to save gas on first increment
    uint256 public farmerCounter = 1;
    uint256 public orderCounter = 1;
    uint256 public batchCounter = 1;
    uint256 public disputeCounter = 1;
    uint256 public refundCounter = 1;

    struct Farmer {
        uint256 id;
        address farmerAddress;
        string name;
        string location;
        bytes16 certificationHash;  // Store hash instead of full certification
        bool isRegistered;
    }

    struct MilkBatch {
        uint256 batchId;
        address farmerAddress;
        uint64 quantity;        // Packed storage
        uint64 pricePerLiter;   // Packed storage
        uint32 expiryDate;      // Packed storage
        bool isAvailable;
    }

    struct Order {
        uint256 orderId;
        address buyer;
        address payable farmer;
        uint256 batchId;
        uint64 quantity;
        uint128 totalPrice;     // Packed storage
        bool isDelivered;
        bool isPaid;
    }

    struct Dispute {
        uint256 disputeId;
        address consumer;
        uint256 orderId;
        string reason;
        DisputeStatus status;
    }

    struct RefundRequest {
        uint256 refundId;
        uint256 orderId;
        uint128 amount;
        bool isApproved;
    }

    struct Review {
        uint8 rating;           // Packed storage
        uint40 timestamp;       // Packed storage
        string comment;
    }

    struct Consumer {
        string name;
        string location;
        uint40 lastLogin;
    }

    // Mappings with packed storage
    mapping(address => Farmer) public farmers;
    mapping(uint256 => MilkBatch) public milkBatches;
    mapping(uint256 => Order) public orders;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => RefundRequest) public refunds;
    mapping(uint256 => Review) public reviews;
    
    // Optimized tracking
    mapping(address => uint256[]) public farmerOrders;
    mapping(address => uint256[]) public consumerOrders;
    mapping(address => Consumer) public consumers;

    // Events with indexed parameters
    event FarmerRegistered(address indexed farmer, string name, string location);
    event MilkBatchRegistered(uint256 indexed batchId, address indexed farmer, uint64 quantity);
    event OrderPlaced(uint256 indexed orderId, address indexed buyer, uint256 indexed batchId);
    event PaymentReleased(uint256 indexed orderId, address indexed farmer, uint256 amount);
    event DisputeFiled(uint256 indexed disputeId, uint256 indexed orderId, string reason);
    event RefundApproved(uint256 indexed refundId, address indexed buyer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerFarmer(
        string calldata _name,
        string calldata _location,
        bytes16 _certificationHash
    ) external {
        require(!farmers[msg.sender].isRegistered, "Already registered");
        
        farmers[msg.sender] = Farmer({
            id: farmerCounter++,
            farmerAddress: msg.sender,
            name: _name,
            location: _location,
            certificationHash: _certificationHash,
            isRegistered: true
        });
        
        emit FarmerRegistered(msg.sender, _name, _location);
    }

    function registerMilkBatch(
        uint64 _quantity,
        uint64 _pricePerLiter,
        uint32 _expiryDays
    ) external {
        require(farmers[msg.sender].isRegistered, "Not registered");
        require(_expiryDays <= MAX_EXPIRY_DAYS, "Exceeds max expiry");
        
        uint32 expiryDate = uint32(block.timestamp + _expiryDays * 1 days);
        
        milkBatches[batchCounter] = MilkBatch({
            batchId: batchCounter,
            farmerAddress: msg.sender,
            quantity: _quantity,
            pricePerLiter: _pricePerLiter,
            expiryDate: expiryDate,
            isAvailable: true
        });
        
        emit MilkBatchRegistered(batchCounter++, msg.sender, _quantity);
    }

    function placeOrder(uint256 _batchId, uint64 _quantity) external payable {
        MilkBatch storage batch = milkBatches[_batchId];
        require(batch.isAvailable, "Batch unavailable");
        require(_quantity <= batch.quantity, "Insufficient quantity");

        uint128 totalPrice = uint128(_quantity * batch.pricePerLiter);
        require(msg.value >= totalPrice, "Insufficient payment");

        Order memory newOrder = Order({
            orderId: orderCounter,
            buyer: msg.sender,
            farmer: payable(batch.farmerAddress),
            batchId: _batchId,
            quantity: _quantity,
            totalPrice: totalPrice,
            isDelivered: false,
            isPaid: false
        });

        orders[orderCounter] = newOrder;
        farmerOrders[batch.farmerAddress].push(orderCounter);
        consumerOrders[msg.sender].push(orderCounter);
        batch.quantity -= _quantity;

        emit OrderPlaced(orderCounter++, msg.sender, _batchId);
    }

    function confirmDelivery(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        require(msg.sender == order.buyer, "Unauthorized");
        require(!order.isPaid, "Already paid");

        order.isDelivered = true;
        order.isPaid = true;
        order.farmer.transfer(order.totalPrice);

        emit PaymentReleased(_orderId, order.farmer, order.totalPrice);
    }

    // Additional optimized functions and dispute resolution logic...
    
    function requestRefund(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        require(msg.sender == order.buyer, "Unauthorized");
        require(!order.isDelivered, "Already delivered");

        refunds[refundCounter] = RefundRequest({
            refundId: refundCounter,
            orderId: _orderId,
            amount: order.totalPrice,
            isApproved: false
        });

        refundCounter++;
    }

    // Pull-pattern refund approval
    function claimRefund(uint256 _refundId) external {
        RefundRequest storage refund = refunds[_refundId];
        require(refund.isApproved, "Refund not approved");
        
        payable(msg.sender).transfer(refund.amount);
        delete refunds[_refundId];
        
        emit RefundApproved(_refundId, msg.sender);
    }
}