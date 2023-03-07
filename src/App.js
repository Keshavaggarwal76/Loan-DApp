import "./App.css"
import React, { useState, useEffect, useRef } from "react"
import Button from "./components/Button"
import Input from "./components/Input"
import Checkbox from "./components/Checkbox"
import getWeb3 from "./getWeb3"
import Loan from "./contracts/loan.json"

function App() {
    const [inputs, setInputs] = useState({
        amount: "",
        end: "",
        interest: "",
        garanty: "",
        garantor: "",
        borrower1: "",
        borrower2: "",
        borrower3: "",
        borrower4: "",
        borrower5: "",
    })
    const [checked, setChecked] = useState(false)

    const handleCheck = () => setChecked(!checked)
    const onChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value })

    const loanContractRef = useRef(null)
    const web3 = useRef(null)
    const [accounts, setAccounts] = useState([])

    useEffect(() => {
        async function fetchData() {
            try {
                const web = await getWeb3()
                web3.current = web
                const accounts = await web.eth.getAccounts()
                setAccounts(accounts)
                const networkId = await web.eth.net.getId()
                const loanContract = new web.eth.Contract(
                    Loan.abi,
                    Loan.networks[networkId] && Loan.networks[networkId].address
                )
                loanContractRef.current = loanContract
            } catch (error) {
                alert(`Failed to load web3, accounts, or contract. Check console for details.`)
                console.error(error)
            }
        }
        fetchData()
    }, [])

    const viewLoans = async () => {
        const viewLoan = await loanContractRef.current.methods.viewLoans().call()
        console.log(viewLoan)
    }

    const requestLoan = async () => {
        const end = web3.current.utils.toBN(new Date(inputs.end).getTime() / 1000)
        await loanContractRef.current.methods
            .requestLoan(inputs.amount, end, inputs.interest)
            .send({ from: accounts[0] })
            .on("receipt", function (receipt) {
                console.log("Transaction receipt: ", receipt)
            })
            .on("error", function (error) {
                console.error("Error: ", error)
            })
            .on("myEvent", function (event) {
                console.log("My event: ", event)
            })
    }

    const provideGaranty = async () => {
        await loanContractRef.current.methods
            .provideGaranty(inputs.garanty, inputs.borrower1)
            .send({ from: accounts[0] })
            .on("receipt", function (receipt) {
                console.log("Transaction receipt: ", receipt)
            })
            .on("error", function (error) {
                console.error("Error: ", error)
            })
            .on("myEvent", function (event) {
                console.log("My event: ", event)
            })
    }

    const validateGaranty = async () => {
        await loanContractRef.current.methods
            .validateGaranty(inputs.garantor, checked)
            .send({ from: accounts[0] })
            .on("receipt", function (receipt) {
                console.log("Transaction receipt: ", receipt)
            })
            .on("error", function (error) {
                console.error("Error: ", error)
            })
            .on("myEvent", function (event) {
                console.log("My event: ", event)
            })
    }

    const getGarantor = async () => {
        await loanContractRef.current.methods
            .getGarantor(inputs.borrower2)
            .send({ from: accounts[0] })
            .on("receipt", function (receipt) {
                console.log("Transaction receipt: ", receipt)
            })
            .on("error", function (error) {
                console.error("Error: ", error)
            })
            .on("myEvent", function (event) {
                console.log("My event: ", event)
            })
    }

    const fundLoan = async () => {
        await loanContractRef.current.methods
            .fundLoan(inputs.borrower3)
            .send({ from: accounts[0] })
            .on("receipt", function (receipt) {
                console.log("Transaction receipt: ", receipt)
            })
            .on("error", function (error) {
                console.error("Error: ", error)
            })
            .on("myEvent", function (event) {
                console.log("My event: ", event)
            })
    }

    const repayLoan = async () => {
        await loanContractRef.current.methods
            .repayLoan(inputs.borrower4)
            .send({ from: accounts[0] })
            .on("receipt", function (receipt) {
                console.log("Transaction receipt: ", receipt)
            })
            .on("error", function (error) {
                console.error("Error: ", error)
            })
            .on("myEvent", function (event) {
                console.log("My event: ", event)
            })
    }

    const claimGaranty = async () => {
        await loanContractRef.current.methods
            .claimGaranty(inputs.borrower5)
            .send({ from: accounts[0] })
            .on("receipt", function (receipt) {
                console.log("Transaction receipt: ", receipt)
            })
            .on("error", function (error) {
                console.error("Error: ", error)
            })
            .on("myEvent", function (event) {
                console.log("My event: ", event)
            })
    }

    return (
        <>
            <div className="container m-3">
                <h1>Loan App</h1>

                <Button success onClick={viewLoans}>
                    View Loans
                </Button>

                <div className="btn">
                    <Input
                        inputs={inputs}
                        onChange={onChange}
                        type="number"
                        name="amount"
                        placeholder="Amount"
                    ></Input>
                    <Input
                        inputs={inputs}
                        onChange={onChange}
                        type="date"
                        name="end"
                        placeholder="End"
                    ></Input>
                    <Input
                        inputs={inputs}
                        onChange={onChange}
                        type="number"
                        name="interest"
                        placeholder="Interest %"
                    ></Input>
                    <Button primary onClick={requestLoan}>
                        Request Loan
                    </Button>
                </div>

                <div className="btn">
                    <Input
                        inputs={inputs}
                        onChange={onChange}
                        name="garanty"
                        type="number"
                        placeholder="Garanty Interest %"
                    ></Input>
                    <Input
                        inputs={inputs}
                        onChange={onChange}
                        name="borrower1"
                        placeholder="Borrower Address"
                    ></Input>
                    <Button secondary onClick={provideGaranty}>
                        Provide Garanty
                    </Button>
                </div>

                <div className="btn">
                    <Input
                        inputs={inputs}
                        onChange={onChange}
                        name="garantor"
                        placeholder="Garantor Address"
                    ></Input>
                    <Checkbox label="Access" value={checked} onChange={handleCheck} />
                    <Button success outline onClick={validateGaranty}>
                        Validate Garanty
                    </Button>
                </div>

                <div className="btn">
                    <Input
                        inputs={inputs}
                        onChange={onChange}
                        name="borrower2"
                        placeholder="Borrower Address"
                    ></Input>
                    <Button warning outline onClick={getGarantor}>
                        Get Garantor
                    </Button>
                </div>

                <div className="btn">
                    <Input
                        inputs={inputs}
                        onChange={onChange}
                        name="borrower3"
                        placeholder="Borrower Address"
                    ></Input>
                    <Button danger outline onClick={fundLoan}>
                        Fund Loan
                    </Button>
                </div>

                <div className="btn">
                    <Input
                        inputs={inputs}
                        onChange={onChange}
                        name="borrower4"
                        placeholder="Borrower Address"
                    ></Input>
                    <Button dark outline onClick={repayLoan}>
                        Repay Loan
                    </Button>
                </div>

                <div className="btn">
                    <Input
                        inputs={inputs}
                        onChange={onChange}
                        name="borrower5"
                        placeholder="Borrower Address"
                    ></Input>
                    <Button outline onClick={claimGaranty}>
                        Claim Garant
                    </Button>
                </div>
            </div>
        </>
    )
}

export default App
