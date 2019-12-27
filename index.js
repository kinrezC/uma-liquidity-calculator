const rpcCall = require("kool-makerpccall");
const emasm = require("emasm");
const addrs = require("./addresses");
const BN = require("bn.js");
const lodash = require("lodash");

const selector =
  "0x70a0823100000000000000000000000000000000000000000000000000000000";

const addresses = addrs.map(addr => addr.id);

console.log("addr len", addresses.length);

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
  console.log(ret);
  const values = lodash.words(ret, /.{64}/g).map(v => new BN(v, 16).toString());
  const liquidityInContracts = lodash.zipObject(addresses, values);
  console.log(liquidityInContracts);
})();
