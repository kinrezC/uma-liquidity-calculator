const rpcCall = require("kool-makerpccall");
const emasm = require("emasm");
const addrs = require("./addresses");
const BN = require("bn.js");
const lodash = require("lodash");
const Web3 = require("web3");

const web3 = new Web3();

const selector =
  "0x70a0823100000000000000000000000000000000000000000000000000000000";

const addresses = addrs.map(addr => addr.id);

const macros = addrs
  .map(addr => addr.id)
  .map((addr, i) =>
    i === 0
      ? [
          selector,
          "0x0",
          "mstore",
          addr,
          "0x4",
          "mstore",
          "0x20",
          "0x0",
          "0x24",
          "0x0",
          "0x0",
          "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa",
          "gas",
          "call",
          "pop"
        ]
      : [
          selector,
          "0x" + (i * 36).toString(16),
          "mstore",
          addr,
          "0x" + (i * 36 + 4).toString(16),
          "mstore",
          "0x20",
          "0x" + (i * 32).toString(16),
          "0x24",
          "0x" + (i * 36).toString(16),
          "0x0",
          "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa",
          "gas",
          "call",
          "pop"
        ]
  );

(async () => {
  let ret = await rpcCall("https://rinkeby.infura.io/mew", "eth_call", [
    {
      data: emasm([
        macros,
        "0x" + (addresses.length * 32).toString(16),
        "0x0",
        "return"
      ])
    },
    "latest"
  ]);

  ret = ret.substr(2);
  const values = lodash.words(ret, /.{64}/g).map(v => new BN(v, 16));
  const total = values.reduce((a, c) => {
    return a.add(c);
  }, new BN(0, 10));
  const liquidityInContracts = lodash.zipObject(
    addresses,
    values.map(v => web3.utils.fromWei(v.toString(10), "ether"))
  );
  console.log(
    "Total DAI Deposited across all contracts: ",
    web3.utils.fromWei(total.toString(10), "ether")
  );
  console.log(liquidityInContracts);
})();
