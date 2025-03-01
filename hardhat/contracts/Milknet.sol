// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

error Unauthorized();
error InvalidInput();
error Expired();
error InsufficientBalance();
error TransferFailed();
error OrderExpired();
error InvalidOrder();

contract MilkSupplyChain {
    enum DisputeStatus { Open, Resolved, Rejected }
    
    address public owner;
    uint256 private constant MAX_EXPIRY_DAYS = 365;
    bool private locked;
    bool public paused;

    // Upgradeability State
    address public implementation;
    uint256 public version = 1;

    // Price Oracle State
    struct PriceData {
        uint64 pricePerLiter;
        uint40 timestamp;
    }
    PriceData public currentPrice;
    address public oracle;

    // Counters
    uint256 public farmerCounter = 1;
    uint256 public orderCounter = 1;
    uint256 public batchCounter = 1;
    uint256 public disputeCounter = 1;
    uint256 public refundCounter = 1;

    // Structs
    struct Farmer {
        uint256 id;
        address farmerAddress;
        string name;
        bytes32 location;
        bytes32 certificationHash;
        uint40 lastActivity;
        uint8 flags;
    }

    struct MilkBatch {
        uint256 batchId;
        address farmerAddress;
        uint64 quantity;
        uint64 pricePerLiter;
        uint32 expiryDate;
        uint8 flags;
    }

    struct Order {
        uint256 orderId;
        address buyer;
        address payable farmer;
        uint256 batchId;
        uint64 quantity;
        uint128 totalPrice;
        bool isDelivered;
        bool isPaid;
        uint40 completionDeadline;
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
        uint8 rating;
        uint40 timestamp;
        string comment;
    }

    struct Consumer {
        string name;
        string location;
        uint40 lastLogin;
    }

    // Mappings
    mapping(address => Farmer) public farmers;
    mapping(uint256 => MilkBatch) public milkBatches;
    mapping(uint256 => Order) public orders;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => RefundRequest) public refunds;
    mapping(uint256 => Review) public reviews;
    mapping(address => uint256[]) public farmerOrders;
    mapping(address => uint256[]) public consumerOrders;
    mapping(address => Consumer) public consumers;

    // Events
    event FarmerRegistered(address indexed farmer, string name, string location);
    event MilkBatchRegistered(uint256 indexed batchId, address indexed farmer, uint64 quantity);
    event OrderPlaced(uint256 indexed orderId, address indexed buyer, uint256 indexed batchId);
    event PaymentReleased(uint256 indexed orderId, address indexed farmer, uint256 amount);
    event DisputeFiled(uint256 indexed disputeId, uint256 indexed orderId, string reason);
    event RefundApproved(uint256 indexed refundId, address indexed buyer);
    event ConsumerRegistered(address indexed consumer, string name, string location);
    event ReviewSubmitted(uint256 indexed orderId, address indexed buyer, uint8 rating);
    event BatchAvailabilityChanged(uint256 indexed batchId, bool status);
    event DisputeResolved(uint256 indexed disputeId, DisputeStatus resolution);
    event ContractUpgraded(address indexed newImplementation, uint256 version);
    event EmergencyStateChanged(bool paused);

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }

    modifier onlyOwnerOrArbitrator() {
        require(msg.sender == owner || msg.sender == arbitrator, "Unauthorized access");
        _;
    }

    modifier noReentrant() {
        require(!locked, "Reentrancy detected");
        locked = true;
        _;
        locked = false;
    }

    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid address");
        _;
    }

    address public arbitrator;
    mapping(address => bool) public governors;
    mapping(uint256 => uint256) public escrowedFunds;
    uint256 public lastActivity;

    constructor(address _arbitrator) validAddress(_arbitrator) {
        owner = msg.sender;
        arbitrator = _arbitrator;
        lastActivity = block.timestamp;
    }

    // Emergency Stop Functions
    function emergencyPause() external onlyOwner {
        paused = true;
        emit EmergencyStateChanged(true);
    }

    function emergencyUnpause() external onlyOwner {
        paused = false;
        emit EmergencyStateChanged(false);
    }

    // Withdrawal Pattern
    function withdrawFunds(address payable _to, uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        _to.transfer(_amount);
    }

    // Upgradeability Pattern
    function upgradeImplementation(address _newImplementation) external onlyOwner {
        implementation = _newImplementation;
        version++;
        emit ContractUpgraded(_newImplementation, version);
    }

    // Price Oracle Implementation
    function updatePrice(uint64 _newPrice) external {
        require(msg.sender == oracle, "Unauthorized oracle");
        currentPrice = PriceData({
            pricePerLiter: _newPrice,
            timestamp: uint40(block.timestamp)
        });
    }

    // Core Functions
    function registerFarmer(
        string calldata _name,
        string calldata _location,
        bytes32 _certificationHash
    ) external whenNotPaused validAddress(msg.sender) {
        require((farmers[msg.sender].flags & 0x1) == 0, "Already registered");
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_name).length >= 2 && bytes(_name).length <= 64,
            "Invalid name length");
        require(bytes(_location).length > 0 && bytes(_location).length <= 32,
            "Invalid location (max 32 bytes)");
        
        farmers[msg.sender] = Farmer({
            id: farmerCounter++,
            farmerAddress: msg.sender,
            name: _name,
            location: bytes32(bytes(_location)),
            certificationHash: _certificationHash,
            lastActivity: uint40(block.timestamp),
            flags: 0x1
        });
        
        emit FarmerRegistered(msg.sender, _name, _location);
    }

    function registerMilkBatch(
        uint64 _quantity,
        uint64 _pricePerLiter,
        uint32 _expiryDays
    ) external whenNotPaused {
        require((farmers[msg.sender].flags & 0x1) != 0, "Unregistered farmer");
        require(_expiryDays <= MAX_EXPIRY_DAYS, "Exceeds max expiry");
        
        milkBatches[batchCounter] = MilkBatch({
            batchId: batchCounter,
            farmerAddress: msg.sender,
            quantity: _quantity,
            pricePerLiter: _pricePerLiter,
            expiryDate: uint32(block.timestamp + _expiryDays * 1 days),
            flags: 0x1
        });
        
        emit MilkBatchRegistered(batchCounter++, msg.sender, _quantity);
    }

    // Batch Deletion Functionality
    function deleteBatch(uint256 _batchId) external {
        MilkBatch storage batch = milkBatches[_batchId];
        require(msg.sender == batch.farmerAddress || msg.sender == owner, 
            "Unauthorized deletion");
        batch.flags |= 0x2;
    }

    // Time-based Order Completion
    function _checkOrderDeadline(uint256 _orderId) internal view {
        Order storage order = orders[_orderId];
        if (order.completionDeadline == 0) revert InvalidOrder();
        if (block.timestamp > order.completionDeadline) revert OrderExpired();
    }

    function placeOrder(uint256 _batchId, uint64 _quantity) external payable noReentrant whenNotPaused {
        MilkBatch storage batch = milkBatches[_batchId];
        
        require((batch.flags & 0x1) != 0, "Batch unavailable");
        require((batch.flags & 0x2) == 0, "Batch deleted");
        
        require(_batchId > 0 && _batchId < batchCounter, "Invalid batch ID");
        require(_quantity <= batch.quantity, "Insufficient quantity");
        require(_quantity > 0, "Invalid quantity");
        
        // Use oracle price if available
        uint64 effectivePrice = currentPrice.timestamp > block.timestamp - 1 days 
            ? currentPrice.pricePerLiter 
            : batch.pricePerLiter;
            
        // Safe math check
        require(uint256(_quantity) * uint256(effectivePrice) <= type(uint128).max, "Amount overflow");
        
        uint128 totalPrice = uint128(_quantity * effectivePrice);
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Create order with proper validation
        Order memory newOrder = Order({
            orderId: orderCounter,
            buyer: msg.sender,
            farmer: payable(batch.farmerAddress),
            batchId: _batchId,
            quantity: _quantity,
            totalPrice: totalPrice,
            isDelivered: false,
            isPaid: false,
            completionDeadline: uint40(block.timestamp + 7 days)
        });

        // Update state
        orders[orderCounter] = newOrder;
        farmerOrders[batch.farmerAddress].push(orderCounter);
        consumerOrders[msg.sender].push(orderCounter);
        
        // Update batch quantity
        batch.quantity -= _quantity;

        emit OrderPlaced(orderCounter++, msg.sender, _batchId);
        
        // Return excess payment if any
        uint256 excess = msg.value - totalPrice;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
    }

    // Enhanced Order Completion with Time Constraints
    function confirmDelivery(uint256 _orderId) external noReentrant whenNotPaused {
        Order storage order = orders[_orderId];
        
        // Validate transaction
        require(msg.sender == order.buyer, "Only buyer can confirm");
        require(!order.isPaid, "Payment already processed");
        require(order.isDelivered == false, "Already marked delivered");
        _checkOrderDeadline(_orderId);

        // Store amount locally before state changes
        uint256 amount = order.totalPrice;
        address payable recipient = order.farmer;
        
        // Check contract balance
        require(amount <= address(this).balance, "Insufficient contract balance");
        
        // Update order state before transfer (CEI pattern - Checks, Effects, Interactions)
        order.isDelivered = true;
        order.isPaid = true;
        
        // Update farmer's last activity timestamp
        farmers[recipient].lastActivity = uint40(block.timestamp);
        
        // Secure fund transfer with checks - last operation (follows CEI pattern)
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        emit PaymentReleased(_orderId, recipient, amount);
    }

    // Dispute & Refund System
    function fileDispute(uint256 _orderId, string calldata _reason) external whenNotPaused {
        require(orders[_orderId].buyer == msg.sender, "Unauthorized");
        require(bytes(_reason).length > 0, "Reason required");
        
        disputes[disputeCounter] = Dispute({
            disputeId: disputeCounter,
            consumer: msg.sender,
            orderId: _orderId,
            reason: _reason,
            status: DisputeStatus.Open
        });
        
        emit DisputeFiled(disputeCounter++, _orderId, _reason);
    }

    function resolveDispute(
        uint256 _disputeId, 
        DisputeStatus _resolution, 
        bool _approveRefund
    ) external onlyOwnerOrArbitrator whenNotPaused {
        Dispute storage dispute = disputes[_disputeId];
        require(dispute.status == DisputeStatus.Open, "Dispute closed");

        dispute.status = _resolution;
        emit DisputeResolved(_disputeId, _resolution);

        if (_approveRefund && _resolution == DisputeStatus.Resolved) {
            RefundRequest storage refund = refunds[dispute.orderId];
            refund.isApproved = true;
        }
    }

    // Consumer Functions
    function registerConsumer(string calldata _name, string calldata _location) external whenNotPaused {
        require(bytes(consumers[msg.sender].name).length == 0, "Already registered");
        require(bytes(_name).length > 0, "Name required");
        
        consumers[msg.sender] = Consumer({
            name: _name,
            location: _location,
            lastLogin: uint40(block.timestamp)
        });
        
        emit ConsumerRegistered(msg.sender, _name, _location);
    }

    function submitReview(
        uint256 _orderId, 
        uint8 _rating, 
        string calldata _comment
    ) external whenNotPaused {
        require(_rating > 0 && _rating <= 5, "Invalid rating");
        Order storage order = orders[_orderId];
        
        require(order.isDelivered, "Order not delivered");
        require(msg.sender == order.buyer, "Unauthorized");
        
        reviews[_orderId] = Review({
            rating: _rating,
            timestamp: uint40(block.timestamp),
            comment: _comment
        });
        
        emit ReviewSubmitted(_orderId, msg.sender, _rating);
    }

    // Utility Functions
    function checkBatchExpiry(uint256 _batchId) public {
        MilkBatch storage batch = milkBatches[_batchId];
        if (block.timestamp >= batch.expiryDate) {
            batch.flags &= 0xFE;
            emit BatchAvailabilityChanged(_batchId, false);
        }
    }

    function toggleBatchAvailability(uint256 _batchId) external whenNotPaused {
        MilkBatch storage batch = milkBatches[_batchId];
        require(msg.sender == batch.farmerAddress, "Unauthorized");
        
        batch.flags ^= 0x1;
        emit BatchAvailabilityChanged(_batchId, (batch.flags & 0x1) != 0);
    }

    function changeArbitrator(address _newArbitrator) external onlyOwner validAddress(_newArbitrator) {
        arbitrator = _newArbitrator;
    }

    // View Functions
    function getActiveBatches() external view returns (MilkBatch[] memory) {
        MilkBatch[] memory activeBatches = new MilkBatch[](batchCounter);
        uint256 count;
        
        for (uint256 i = 1; i < batchCounter; i++) {
            if ((milkBatches[i].flags & 0x1) != 0 && (milkBatches[i].flags & 0x2) == 0) {
                activeBatches[count++] = milkBatches[i];
            }
        }
        
        // Resize array to remove empty elements
        MilkBatch[] memory result = new MilkBatch[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeBatches[i];
        }
        
        return result;
    }

    function getFarmerOrders(address _farmer) external view returns (uint256[] memory) {
        return farmerOrders[_farmer];
    }

    // Governance functions
    function addGovernor(address _addr) external onlyOwner {
        governors[_addr] = true;
    }

    modifier onlyGovernor() {
        require(governors[msg.sender], "Not governor");
        _;
    }

    function releaseEscrow(uint256 _orderId) internal {
        uint256 amount = escrowedFunds[_orderId];
        delete escrowedFunds[_orderId];
        payable(orders[_orderId].farmer).transfer(amount);
    }
}