
// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.4.0 < 0.9.0;

contract FarmerRegistration {
     enum DisputeStatus { Open, Resolved, Rejected }
    //stores the number of registered farmers
    uint public farmerCounter = 0;
    uint public orderCounter = 0;
    uint public refundCounter = 0;
     uint public disputeCounter;
      address public owner;

   //stores information about farmers 
    struct Farmer {
        uint id;
        address farmerAddress;
        string name;
        bool isRegistered;
    }
     uint public batchCounter = 0;

    

    //stores batch details 
    struct MilkBatch {
        uint batchId;
        address farmerAddress;
        uint quantity;
        uint pricePerLiter;
        uint expiryDate;
        bool isAvailable;
    }
    
    struct Order {
        uint orderId;
        address buyer;
        address payable farmer;  // Farmer who will receive payment
        uint batchId;
        uint quantity;
        uint totalPrice;
        bool isDelivered;
        bool isPaid;  // Track if payment has been released
    }
    //stores dispute details
    struct Dispute {
        uint disputeId;
        address consumer;
        address farmer;
        uint batchId;
        string reason;
        DisputeStatus status;

    }
    //stores details concerning refunds
    struct RefundRequest {
        uint refundId;
        uint orderId;
        address buyer;
        address payable farmer;
        uint amount;
        bool isApproved;
        bool isResolved;
    }
    //stores reviews
    struct Review {
        uint orderId;
        address buyer;
        address farmer;
        uint8 rating; // Rating from 1 to 5
        string comment;
        uint timestamp;
    }
    struct Consumer {
        bool isRegistered;
        uint lastLogin; // Stores the last login timestamp
    }


   //stores farmers  registered  using their wallet address
    mapping(address => Farmer) public farmers;
    //stores milk batch with their unique id
     mapping(uint => MilkBatch) public milkBatches;
     //stores orders with their id
    mapping(uint => Order) public orders;
    mapping(uint => uint) public orderPayments; // Store funds in escrow
     //stores disputes with unique id
       mapping(uint => Dispute) public disputes;
       //stores refunds with unique id
       mapping(uint => RefundRequest) public refunds;
       
    mapping(uint => Review) public reviews;
    mapping(address => uint[]) public farmerReviews; // Tracks all reviews for each farmer
    mapping(address => uint) public totalRatings;
    mapping(address => uint) public ratingCount;
     mapping(address => Consumer) public consumers;

    

   //emitted whenever a farmer is registered
    event FarmerRegistered(uint farmerId, address farmerAddress, string name);
    //emitted whenever a batch is registered
    event MilkBatchRegistered(uint batchId, address farmerAddress, uint quantity, uint pricePerLiter, uint expiryDate);
    //emitted whenever an order is placed
    event OrderPlaced(uint orderId, address buyer, address farmer, uint batchId, uint quantity, uint totalPrice);
    //emitted whenever a payment is released
    event PaymentReleased(uint orderId, address farmer, uint amount);
    //emitted whenever order is delivered
    event OrderDelivered(uint orderId);
    //emitted whenever an order is delivered

    
    event DisputeFiled(uint disputeId, address indexed consumer, uint batchId, string reason);
    event DisputeResolved(uint disputeId, address indexed farmer, string resolution);
    event DisputeRejected(uint disputeId, address indexed farmer, string reason);
    
    event RefundRequested(uint refundId, uint orderId, address buyer, uint amount);
    event RefundApproved(uint refundId, uint orderId);
    event RefundRejected(uint refundId, uint orderId);
    event RefundPaid(uint refundId, uint orderId, uint amount);
     event ConsumerRegistered(address consumer);
    event ConsumerLoggedIn(address consumer, uint timestamp);
    
    modifier onlyRegistered() {
        require(consumers[msg.sender].isRegistered, "Not registered");
        _;
    }

    event ReviewSubmitted(uint orderId, address buyer, address farmer, uint8 rating, string comment);

    modifier validRating(uint8 _rating) {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        _;
    }



    function registerFarmer(string memory _name) public {
        require(!farmers[msg.sender].isRegistered, "Farmer is already registered");

        // increases whenever a farmer is registered
        farmerCounter++;
        farmers[msg.sender] = Farmer(farmerCounter, msg.sender, _name, true);

        emit FarmerRegistered(farmerCounter, msg.sender, _name);
    }


    function getFarmer(address _farmer) public view returns (Farmer memory) {
        require(farmers[_farmer].isRegistered, "Farmer is not registered");
        return farmers[_farmer];
    }
    
    function registerMilkBatch(uint _quantity, uint _pricePerLiter, uint _expiryDate) public {
        require(_quantity > 0, "Quantity must be greater than zero");
        require(_expiryDate > block.timestamp, "Expiry date must be in the future");

        batchCounter++;
        milkBatches[batchCounter] = MilkBatch(batchCounter, msg.sender, _quantity, _pricePerLiter, _expiryDate, true);

        emit MilkBatchRegistered(batchCounter, msg.sender, _quantity, _pricePerLiter, _expiryDate);
    }
    
    function getMilkBatch(uint _batchId) public view returns (MilkBatch memory) {
        require(milkBatches[_batchId].isAvailable, "Milk batch is not available");
        return milkBatches[_batchId];
    }
    
   
    function placeOrder(uint _batchId, uint _quantity, uint _pricePerLiter, address payable _farmer) public payable {
        require(_quantity > 0, "Quantity must be greater than zero");
        uint totalPrice = _quantity * _pricePerLiter;
        require(msg.value == totalPrice, "Incorrect payment amount");

        orderCounter++;
        orders[orderCounter] = Order(orderCounter, msg.sender, _farmer, _batchId, _quantity, totalPrice, false, false);
        orderPayments[orderCounter] = totalPrice; // Hold payment in contract

        emit OrderPlaced(orderCounter, msg.sender, _farmer, _batchId, _quantity, totalPrice);
    }
    
    function confirmDelivery(uint _orderId) public {
        require(orders[_orderId].buyer == msg.sender, "Only the buyer can confirm delivery");
        require(!orders[_orderId].isDelivered, "Order already delivered");
        require(!orders[_orderId].isPaid, "Payment already released");

        orders[_orderId].isDelivered = true;
        orders[_orderId].isPaid = true;

        // Release funds to the farmer
        uint amount = orderPayments[_orderId];
        orders[_orderId].farmer.transfer(amount);
        orderPayments[_orderId] = 0; // Clear stored payment

        emit OrderDelivered(_orderId);
        emit PaymentReleased(_orderId, orders[_orderId].farmer, amount);
    }
    function getOrder(uint _orderId) public view returns (Order memory) {
        return orders[_orderId];
    }
      function fileDispute(uint _batchId, address _farmer, string memory _reason) external {
        disputeCounter++;

        disputes[disputeCounter] = Dispute({
            disputeId: disputeCounter,
            consumer: msg.sender,
            farmer: _farmer,
            batchId: _batchId,
            reason: _reason,
            status: DisputeStatus.Open
        });

        emit DisputeFiled(disputeCounter, msg.sender, _batchId, _reason);
    }
    
    // Farmers resolve disputes related to their batches
    function resolveDispute(uint _disputeId, string memory _resolution) external {
        require(disputes[_disputeId].status == DisputeStatus.Open, "Dispute already closed");
        require(msg.sender == disputes[_disputeId].farmer, "Only the farmer can resolve the dispute");

        disputes[_disputeId].status = DisputeStatus.Resolved;

        emit DisputeResolved(_disputeId, msg.sender, _resolution);
    }
       // View dispute details
    function getDispute(uint _disputeId) external view returns (
        uint, address, address, uint, string memory, DisputeStatus
    ) {
        Dispute memory d = disputes[_disputeId];
        return (d.disputeId, d.consumer, d.farmer, d.batchId, d.reason, d.status);
    }
    
    function requestRefund(uint _orderId, address payable _farmer, uint _amount) public {
        require(_amount > 0, "Refund amount must be greater than zero");

        refundCounter++;
        refunds[refundCounter] = RefundRequest(refundCounter, _orderId, msg.sender, _farmer, _amount, false, false);

        emit RefundRequested(refundCounter, _orderId, msg.sender, _amount);
    }
    
    function approveRefund(uint _refundId) public {
    RefundRequest storage refund = refunds[_refundId];
    require(msg.sender == refund.farmer, "Only the farmer can approve the refund");
    require(!refund.isResolved, "Refund is already resolved");

    refund.isApproved = true;
    refund.isResolved = true;

    // Store recipient and amount first (CHECKS & EFFECTS)
    address payable recipient = payable(refund.buyer);
    uint amount = refund.amount;

    // Send Ether last (INTERACTIONS)
    (bool success, ) = recipient.call{value: amount}("");
    require(success, "Refund transfer failed");

    emit RefundApproved(_refundId, refund.orderId);
    emit RefundPaid(_refundId, refund.orderId, amount);
}

    function rejectRefund(uint _refundId) public {
        RefundRequest storage refund = refunds[_refundId];
        require(msg.sender == refund.farmer, "Only the farmer can reject the refund");
        require(!refund.isResolved, "Refund is already resolved");

        refund.isResolved = true;

        emit RefundRejected(_refundId, refund.orderId);
    }
    
    function getRefundRequest(uint _refundId) public view returns (RefundRequest memory) {
        return refunds[_refundId];
    }
     function submitReview(uint _orderId, address _farmer, uint8 _rating, string memory _comment) 
        public validRating(_rating) 
    {
        require(reviews[_orderId].orderId == 0, "Review already exists for this order");

        reviews[_orderId] = Review(_orderId, msg.sender, _farmer, _rating, _comment, block.timestamp);
        farmerReviews[_farmer].push(_orderId);

        totalRatings[_farmer] += _rating;
        ratingCount[_farmer]++;

        emit ReviewSubmitted(_orderId, msg.sender, _farmer, _rating, _comment);
    }
    
    function getReview(uint _orderId) public view returns (Review memory) {
        return reviews[_orderId];
    }
    
   
    function getFarmerAverageRating(address _farmer) public view returns (uint) {
        if (ratingCount[_farmer] == 0) {
            return 0;
        }
        return totalRatings[_farmer] / ratingCount[_farmer];
    }
    
    function getFarmerReviews(address _farmer) public view returns (uint[] memory) {
        return farmerReviews[_farmer];
    }
    
    function registerConsumer() external {
        require(!consumers[msg.sender].isRegistered, "Already registered");
        consumers[msg.sender] = Consumer(true, 0);
        emit ConsumerRegistered(msg.sender);
    }

    function login() external onlyRegistered {
        consumers[msg.sender].lastLogin = block.timestamp; // Store login time
        emit ConsumerLoggedIn(msg.sender, block.timestamp);
    }

    function isConsumerLoggedIn(address _consumer) external view returns (bool) {
        return consumers[_consumer].lastLogin > 0;
    }




}
