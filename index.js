require('dotenv').config()

const bodyParser = require('body-parser')
const express = require('express')
const Libra = require('./libra_service.js')
const Faucent = require('./faucet.js')
var cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000
const AMOUNT_TO_MINT = process.env.AMOUNT_TO_MINT || 100

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*")
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
//   next()
// })

var corsOptions = {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(express.static('public'));
app.get('/', function (req, res) {

})

app.post('/createWallet', async function (req, res) {
  const libra = new Libra()
  let wallet = await libra.createAccount(AMOUNT_TO_MINT)
  console.log('wallet', wallet)
  res.send(wallet)
})

app.get('/api/balance/:address', async function (req, res) {
  var address = req.params.address;
  const libra = new Libra()
  let wallet = await libra.getBalance(address)
  console.log('wallet', wallet)
  res.send(wallet.balance)
})


app.post('/transfer', async function (req, res) {
  console.log('req body', req.body)
  const libra = new Libra()
  let fromAddress = req.body.fromAddress
  let mnemonic = req.body.mnemonic
  let toAddress = req.body.toAddress
  let amount = req.body.amount
  let wallet = await libra.transfer(fromAddress, mnemonic, toAddress, amount)
  console.log('wallet', wallet)
  res.send(wallet)
})

app.post('/transactionHistory', async function (req, res) {
  console.log('req body', req.body)
  const libra = new Libra()
  const address = req.body.address
  const event = req.body.event
  const transactions = await libra.queryTransaction(address, event)
  console.log(`query transaction event ${event}`)
  res.send(transactions)
})

app.get('/api/mint/:address/:amount', async function (req, res) {
  try {
    const faucent = new Faucent()
    var address = req.params.address;
    var amount = req.params.amount;
    console.log(`Minting amount ${amount}`)
    await faucent.getFaucetFromKulap(amount, address)

    res.send({
      address: address,
      amount: amount
    })

  } catch (error) {
    console.error(error)
  }
})


app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`)
})
