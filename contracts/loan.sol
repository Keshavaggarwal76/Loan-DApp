//SPDX-License-Identifier: UNLICENSED
// We're going to build a loan contract for P2P lending
//we add an identifier to the contract
pragma solidity 0.8.17;

contract Loan {
    //We build the different structures we need
    struct Garantor {
        address garantorAddress;
        uint256 garantorAmount;
    }

    struct LoanStruct {
        address borrower;
        uint256 amount;
        uint256 end; //in timestamp
        uint256 start; //in timestamp
        uint256 interest; //in wei
        address garantor;
        uint256 garantorInterest;
        address lender;
        bool repaid;
    }

    //We create a list to store the loans
    LoanStruct[] private loans;

    //We create a mapping on borrower address to store the garantors
    mapping(address => Garantor) private garantors;

    //We store the admin address
    address private admin;

    //We create useful events
    event FoundGarantor(address garantor, uint256 garantorInterest);

    event LoanRequest(address borrower, uint256 amount, uint256 end, uint256 interest);

    event GarantorRefund(address garantor, uint256 amount);

    event ValidateGarantor(address garantor, uint256 amount);

    event LoanFunded(address lender, uint256 amount);

    event LoanRepay(address borrower, uint256 amount);

    event GarantyClaimed(address garantor, uint256 amount);

    //Constructor
    constructor() {
        admin = msg.sender;
    }

    //function to request a loan
    function requestLoan(uint256 _amount, uint256 _end, uint256 _interest) public {
        //We check that the values are correct
        require(_amount > 0, "You must request a positive amount");
        require(_end > block.timestamp, "You must request a future date");
        require(_interest > 0, "You must request a positive interest");

        //We check that the borrower doesn't have a loan
        bool inArray = false;
        for (uint256 i = 0; i < loans.length; i++) {
            if (loans[i].borrower == msg.sender) {
                inArray = true;
            }
        }
        require(inArray == false, "You already have a loan");

        //We create a new loan
        LoanStruct memory newLoan;
        newLoan.borrower = msg.sender;
        newLoan.amount = _amount;
        newLoan.start = block.timestamp;
        newLoan.end = _end;
        newLoan.interest = _interest;
        newLoan.repaid = false;
        newLoan.garantor = address(0);

        //We add the loan to the array
        loans.push(newLoan);

        //We emit the event
        emit LoanRequest(msg.sender, _amount, _end, _interest);
    }

    //function to provide a garanty
    function provideGaranty(uint256 _garantyinterest, address _borrower) public payable {
        //We check that the borrower is not the garantor
        require(msg.sender != _borrower, "You can't be the borrower and the garantor");

        //We check that the borrower has a loan
        bool inArray = false;
        uint256 index;
        for (uint256 i = 0; i < loans.length; i++) {
            if (loans[i].borrower == _borrower) {
                inArray = true;
                index = i;
            }
        }
        require(inArray == true, "The borrower must have a loan");

        //We check if the loan garantor is not already found
        assert(garantors[_borrower].garantorAddress == address(0));

        //We check if the amount of the garanty is correct
        require(
            msg.value == loans[index].amount,
            //We log the amount of the loan$
            "You must pay the right amount"
        );

        //We check that the garantor interest is not higher than the amount of the loan
        require(
            _garantyinterest <= loans[index].amount,
            "The garantor interest must be lower than the amount of the loan"
        );

        //We store the garantor
        Garantor memory newGarantor;
        newGarantor.garantorAddress = msg.sender;
        newGarantor.garantorAmount = _garantyinterest;
        garantors[_borrower] = newGarantor;

        //We emit the event
        emit FoundGarantor(msg.sender, _garantyinterest);
    }

    //function to get the garantor information
    function getGarantor(address _borrower) public view returns (address, uint256) {
        //We check that the caller is the borrower
        require(msg.sender == _borrower, "You must be the borrower");
        //We check that the borrower has a loan
        bool inArray = false;
        for (uint256 i = 0; i < loans.length; i++) {
            if (loans[i].borrower == _borrower) {
                inArray = true;
            }
        }
        require(inArray == true, "The borrower must have a loan");

        return (garantors[_borrower].garantorAddress, garantors[_borrower].garantorAmount);
    }

    //function to validate a garanty
    function validateGaranty(address _garantor, bool accept) public {
        //We check that the caller is the borrower
        address _borrower = msg.sender;

        //We check that the borrower has a loan
        bool inArray = false;
        uint256 index;
        for (uint256 i = 0; i < loans.length; i++) {
            if (loans[i].borrower == _borrower) {
                inArray = true;
                index = i;
            }
        }
        require(inArray == true, "You must have a loan to validate a garanty");

        //We check that the garantor exists
        garantors[_borrower].garantorAddress == _garantor;

        if (accept == true) {
            //We add the garantor interest to the loan
            loans[index].garantorInterest = garantors[_borrower].garantorAmount;
            loans[index].garantor = _garantor;
            //We emit the event
            emit ValidateGarantor(_garantor, loans[index].garantorInterest);
        } else {
            //We transfer the money back to the garantor
            payable(_garantor).transfer(garantors[_borrower].garantorAmount);
            //We emit the event
            emit GarantorRefund(_garantor, garantors[_borrower].garantorAmount);
            //We delete the garantor
            garantors[_borrower] = Garantor(address(0), 0);
        }
    }

    //function to fund a loan
    function fundLoan(address _borrower) public payable {
        //We find the loan
        uint256 index;
        bool inArray = false;
        for (uint256 i = 0; i < loans.length; i++) {
            if (loans[i].borrower == _borrower) {
                inArray = true;
                index = i;
            }
        }
        require(inArray == true, "The borrower must have a loan");

        //We check that the loan is not already funded
        require(loans[index].lender == address(0), "The loan must not be already funded");

        //We check that the loan is not expired
        require(loans[index].end > block.timestamp, "The loan must not be expired");

        //We check that the borrower is not the lender
        require(msg.sender != _borrower, "You can't be the borrower and the lender");

        //We check that the lender paid the right amount
        require(msg.value == loans[index].amount, "You must pay the right amount");

        //We check that the loan has a garantor
        require(loans[index].garantor != address(0), "The loan must have a garantor");

        //We fund the loan
        loans[index].lender = msg.sender;
        //We transfer the money to the borrower
        payable(loans[index].borrower).transfer(loans[index].amount);
        //We emit the event
        emit LoanFunded(msg.sender, loans[index].amount);
    }

    //function to repay a loan
    function repayLoan(address _borrower) public payable {
        //We find the loan
        uint256 index;
        bool inArray = false;
        for (uint256 i = 0; i < loans.length; i++) {
            if (loans[i].borrower == _borrower) {
                inArray = true;
                index = i;
            }
        }
        require(inArray == true, "The borrower must have a loan");

        uint256 total_amount = loans[index].amount + loans[index].interest + loans[index].garantorInterest;

        //We check that the borrower paid the right amount
        require(
            msg.value == total_amount,
            "You must pay the right amount, interest and garantor interest. The total amount is : "
        );

        //We check that the loan is not already repaid
        require(loans[index].repaid == false, "The loan is already repaid");

        //We check that the loan is not overdue
        require(block.timestamp < loans[index].end, "You can't repay a loan that is overdue");

        //We check that the borrower is the caller
        require(msg.sender == loans[index].borrower, "You must be the borrower to repay the loan");
        //We repay the loan
        loans[index].repaid = true;
        //We transfer the money to the lender
        payable(loans[index].lender).transfer(loans[index].amount);
        //We transfer the money to the garantor for the interest
        payable(loans[index].garantor).transfer(loans[index].garantorInterest);
        //We transfer the money to the garantor for the garanty
        payable(loans[index].garantor).transfer(loans[index].amount);
        //We emit the event
        emit LoanRepay(msg.sender, loans[index].amount);
    }

    //function to claim money from a loan overdue
    function claimGaranty(address _borrower) public payable {
        //We find the loan
        uint256 index;
        bool inArray = false;
        for (uint256 i = 0; i < loans.length; i++) {
            if (loans[i].borrower == _borrower) {
                inArray = true;
                index = i;
            }
        }
        require(inArray == true, "The borrower must have a loan");

        //We check that the loan is overdue
        require(block.timestamp > loans[index].end, "You can't claim a loan that is not overdue");

        //We check that the loan is not repaid
        require(loans[index].repaid == false, "The loan is already repaid");

        //We check that the caller is the lender
        require(msg.sender == loans[index].lender, "You must be the lender to claim the loan");

        //We claim the loan
        loans[index].repaid = true;
        //We transfer the money to the lender
        payable(loans[index].lender).transfer(loans[index].amount);
        //We emit the event
        emit GarantyClaimed(msg.sender, loans[index].amount);
    }

    //function to view all the loans
    function viewLoans() public view returns (LoanStruct[] memory) {
        LoanStruct[] memory allLoans = new LoanStruct[](loans.length);
        for (uint256 i = 0; i < loans.length; i++) {
            allLoans[i] = loans[i];
        }
        return allLoans;
    }
}
