const assert = require('assert');
const Loan = artifacts.require('Loan');
//const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');

contract('Loan', (accounts) => {
    let loan;
    const [borrower1, borrower2, guarantor1, guarantor2, lender1, lender2] = accounts;

    // create a new instance of the Loan contract before each test
    beforeEach(async () => {
        loan = await Loan.new();
    });

    // test the requestLoan function
    describe('requestLoan', async () => {
        it('should request a loan', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            const result = await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            assert.equal(result.logs[0].event, 'LoanRequest');
        });

        it('should not request a loan if the user has already requested a loan', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await truffleAssert.reverts(loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 }));
        })

        it('should not request a loan if the amount is not greater than 0', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await truffleAssert.reverts(loan.requestLoan(0, nowtimestamp, 10, { from: borrower1 }));
        })

        it('should not request a loan if the timestamp is not greater than the current timestamp', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) - 1000;
            await truffleAssert.reverts(loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 }));
        })

        it('should not request a loan if the interest is not greater than 0', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await truffleAssert.reverts(loan.requestLoan(100, nowtimestamp, 0, { from: borrower1 }));
        })

        it('should request a loan if the user is different', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            const result = await loan.requestLoan(100, nowtimestamp, 10, { from: borrower2 });
            assert.equal(result.logs[0].event, 'LoanRequest');

        })

    })

    // test the provideGaranty function
    describe('provideGaranty', async () => {
        it('should provide a garanty', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            const result = await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            assert.equal(result.logs[0].event, 'FoundGarantor');
        });

        it('should not provide a garanty if the user is the borrower', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await truffleAssert.reverts(loan.provideGaranty(1, borrower1, { from: borrower1, value: 100 }));
        })

        it('should not provide a garanty if the loan is not requested', async () => {
            await truffleAssert.reverts(loan.provideGaranty(1, borrower2, { from: guarantor1, value: 100 }));
        })

        it('should not provide a garanty if the loan already has a pending garantor', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await truffleAssert.reverts(loan.provideGaranty(1, borrower1, { from: guarantor2, value: 100 }));
        })

        it('should not provide a garanty if the amount sent is not the amount of the loan', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await truffleAssert.reverts(loan.provideGaranty(1, borrower1, { from: guarantor1, value: 200 }));
        })
    })

    //test getGarantors function
    describe('getGarantor', async () => {
        it('should get the pending garantor of a loan', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            const result = await loan.getGarantor(borrower1);
            assert.equal(result[0], guarantor1);
        });

        it('should not get the pending garantor of a loan if the sender is not the borrower', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await truffleAssert.reverts(loan.getGarantor(borrower1, { from: borrower2 }));
        })

        it('should not get the pending garantor of a loan if the loan is not requested', async () => {
            await truffleAssert.reverts(loan.getGarantor(borrower1));
        })
    })

    //test validateGaranty function
    describe('validateGaranty', async () => {
        it('should validate the garanty of a loan', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            const result = await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            assert.equal(result.logs[0].event, 'ValidateGarantor');
        });

        it('should not validate the garanty of a loan if the sender is not the borrower', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await truffleAssert.reverts(loan.validateGaranty(guarantor1, true, { from: borrower2 }));
        })

        it('should not validate the garanty if the borrower use false as a parameter', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            //We check if the garantor is deleted
            const result = await loan.validateGaranty(guarantor1, false, { from: borrower1 });
            assert.equal(result.logs[0].event, 'GarantorRefund');
            //We check if the garantor of the loan is back at 0x0
            const result2 = await loan.getGarantor(borrower1);
            assert.equal(result2[0], 0x0);
        })

    })

    // test fundLoan function

    describe('fundLoan', async () => {
        it('should fund a loan', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            const result = await loan.fundLoan(borrower1, { from: lender1, value: 100 });
            assert.equal(result.logs[0].event, 'LoanFunded');
        });

        it('should not fund the loan if the amount sent is not the amount of the loan', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            await truffleAssert.reverts(loan.fundLoan(borrower1, { from: lender1, value: 200 }));
        })

        it('should not fund the loan if there is no garanty', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await truffleAssert.reverts(loan.fundLoan(borrower1, { from: lender1, value: 100 }));
        })

        it('should not fund the loan if the loan is expired', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            //We wait 2 seconds to be sure that the loan is expired
            await new Promise(r => setTimeout(r, 2000));

            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            await truffleAssert.reverts(loan.fundLoan(borrower1, { from: lender1, value: 100 }));
        })

        it('should not fund the loan if the loan is already funded', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            await loan.fundLoan(borrower1, { from: lender1, value: 100 });
            await truffleAssert.reverts(loan.fundLoan(borrower1, { from: lender1, value: 100 }));
        })





    })

    //test repayLoan function
    describe('repayLoan', async () => {
        it('should repay a loan', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            await loan.fundLoan(borrower1, { from: lender1, value: 100 });
            const result = await loan.repayLoan(borrower1, { from: borrower1, value: 111 });
            assert.equal(result.logs[0].event, 'LoanRepay');
        });

        it('should not repay the loan if the amount sent is not the amount of the loan', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            await loan.fundLoan(borrower1, { from: lender1, value: 100 });
            await truffleAssert.reverts(loan.repayLoan(borrower1, { from: borrower1, value: 110 }));
        })

        it('should not repay the loan if the loan is not funded', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            await truffleAssert.reverts(loan.repayLoan(borrower1, { from: borrower1, value: 100 }));
        })

        it('should not repay the loan if the loan is expired', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            await loan.fundLoan(borrower1, { from: lender1, value: 100 });
            //We wait 1 seconds to be sure that the loan is expired
            await new Promise(r => setTimeout(r, 1000));
            await truffleAssert.reverts(loan.repayLoan(borrower1, { from: borrower1, value: 100 }));
        })

        it('should not repay the loan if the loan is already repaid', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            await loan.fundLoan(borrower1, { from: lender1, value: 100 });
            await loan.repayLoan(borrower1, { from: borrower1, value: 111 });
            await truffleAssert.reverts(loan.repayLoan(borrower1, { from: borrower1, value: 100 }));
        })

        it('should not repay the loan if the caller is not the borrower', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            await loan.fundLoan(borrower1, { from: lender1, value: 100 });
            await truffleAssert.reverts(loan.repayLoan(borrower1, { from: borrower2, value: 100 }));
        })

    })


    //test claimGaranty function
    describe('claimGaranty', async () => {
        it('should not claim the garanty if the loan is not expired', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            await loan.fundLoan(borrower1, { from: lender1, value: 100 });
            await truffleAssert.reverts(loan.claimGaranty(borrower1, { from: lender1 }));
        })

        it('should not claim the garanty if the caller is not the funder', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            await loan.fundLoan(borrower1, { from: lender1, value: 100 });
            //We wait 1 seconds to be sure that the loan is expired
            await new Promise(r => setTimeout(r, 1000));
            await truffleAssert.reverts(loan.claimGaranty(borrower1, { from: lender2 }));

        })

        it('should not claim the garanty if the loan is already repaid', async () => {
            let nowtimestamp = Math.floor(Date.now() / 1000) + 1000;
            await loan.requestLoan(100, nowtimestamp, 10, { from: borrower1 });
            await loan.provideGaranty(1, borrower1, { from: guarantor1, value: 100 })
            await loan.validateGaranty(guarantor1, true, { from: borrower1 });
            await loan.fundLoan(borrower1, { from: lender1, value: 100 });
            await loan.repayLoan(borrower1, { from: borrower1, value: 111 });
            //We wait 1 seconds to be sure that the loan is expired
            await new Promise(r => setTimeout(r, 1000));
            await truffleAssert.reverts(loan.claimGaranty(borrower1, { from: lender1 }));
        })

    })

})