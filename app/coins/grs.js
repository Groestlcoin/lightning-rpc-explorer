var Decimal = require("decimal.js");
Decimal8 = Decimal.clone({ precision:8, rounding:8 });

var currencyUnits = [
	{
		type:"native",
		name:"GRS",
		multiplier:1,
		default:true,
		values:["", "grs", "GRS"],
		decimalPlaces:8
	},
	{
		type:"native",
		name:"mGRS",
		multiplier:1000,
		values:["mgrs"],
		decimalPlaces:5
	},
	{
		type:"native",
		name:"groestls",
		multiplier:1000000,
		values:["groestls"],
		decimalPlaces:2
	},
	{
		type:"native",
		name:"gro",
		multiplier:100000000,
		values:["gro"],
		decimalPlaces:0
	},
	{
		type:"exchanged",
		name:"USD",
		multiplier:"usd",
		values:["usd"],
		decimalPlaces:2,
		symbol:"$"
	},
	{
		type:"exchanged",
		name:"EUR",
		multiplier:"eur",
		values:["eur"],
		decimalPlaces:2,
		symbol:"€"
  },
];

module.exports = {
	name:"Groestlcoin",
	ticker:"GRS",
	logoUrl:"/img/logo/grs.svg",
	siteTitle:"Groestlcoin Explorer",
	siteDescriptionHtml:"<b>GRS Explorer</b> is <a href='https://github.com/groestlcoin/btc-rpc-explorer). If you run your own [Groestlcoin Full Node](https://www.groestlcoin.org/groestlcoin-core-wallet/), **GRS Explorer** can easily run alongside it, communicating via RPC calls. See the project [ReadMe](https://github.com/groestlcoin/btc-rpc-explorer) for a list of features and instructions for running.",
	nodeTitle:"Groestlcoin Full Node",
	nodeUrl:"https://www.groestlcoin.org/groestlcoin-core-wallet/",
	demoSiteUrl: "https://rpcexplorer.groestlcoin.org",
	miningPoolsConfigUrls:[
		"https://raw.githubusercontent.com/blockchain/Blockchain-Known-Pools/master/pools.json",
		"https://raw.githubusercontent.com/btccom/Blockchain-Known-Pools/master/pools.json"
	],
	maxBlockWeight: 4000000,
	currencyUnits:currencyUnits,
	currencyUnitsByName:{"GRS":currencyUnits[0], "mGRS":currencyUnits[1], "groestls":currencyUnits[2], "gro":currencyUnits[3]},
	baseCurrencyUnit:currencyUnits[3],
	defaultCurrencyUnit:currencyUnits[0],
	feeSatoshiPerByteBucketMaxima: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 50, 75, 100, 150],
	genesisBlockHash: "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
	genesisCoinbaseTransactionId: "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
	genesisCoinbaseTransaction: {
		"hex": "01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0804ffff001d02fd04ffffffff0100f2052a01000000434104f5eeb2b10c944c6b9fbcfff94c35bdeecd93df977882babc7f3a2cf7f5c81d3b09a68db7f0e04f21de5d4230e75e6dbe7ad16eefe0d4325a62067dc6f369446aac00000000",
		"txid": "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
		"hash": "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
		"size": 204,
		"vsize": 204,
		"version": 1,
		"confirmations":475000,
		"vin": [
			{
				"coinbase": "04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73",
				"sequence": 4294967295
			}
		],
		"vout": [
			{
				"value": 50,
				"n": 0,
				"scriptPubKey": {
					"asm": "04f5eeb2b10c944c6b9fbcfff94c35bdeecd93df977882babc7f3a2cf7f5c81d3b09a68db7f0e04f21de5d4230e75e6dbe7ad16eefe0d4325a62067dc6f369446a OP_CHECKSIG",
					"hex": "4104f5eeb2b10c944c6b9fbcfff94c35bdeecd93df977882babc7f3a2cf7f5c81d3b09a68db7f0e04f21de5d4230e75e6dbe7ad16eefe0d4325a62067dc6f369446aac",
					"reqSigs": 1,
					"type": "pubkey",
					"addresses": [
						"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
					]
				}
			}
		],
		"blockhash": "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
		"time": 1230988505,
		"blocktime": 1230988505
	},
	genesisCoinbaseOutputAddressScripthash:"8b01df4e368ea28f8dc0423bcf7a4923e3a12d307c875e47a0cfbf90b5c39161",
	historicalData: [
		{
			type: "blockheight",
			date: "2014-03-22",
			blockHeight: 0,
			blockHash: "00000ac5927c594d49cc0bdb81759d0da8297eb614683d3acb62f0703b639023",
			summary: "The Groestlcoin Genesis Block.",
			alertBodyHtml: "This is the first block in the Groestlcoin blockchain, known as the 'Genesis Block'.",
			referenceUrl: "https://en.bitcoin.it/wiki/Genesis_block"
		}
	],
	exchangeRateData:{
				jsonUrl:"https://api.coingecko.com/api/v3/simple/price?ids=groestlcoin&vs_currencies=usd,eur",
				responseBodySelectorFunction:function(responseBody) {
								//console.log("Exchange Rate Response: " + JSON.stringify(responseBody));

								var exchangedCurrencies = ["usd", "eur"];

								if (responseBody.groestlcoin) {
												var exchangeRates = {};

												for (var i = 0; i < exchangedCurrencies.length; i++) {
																if (responseBody.groestlcoin[exchangedCurrencies[i]]) {
																				exchangeRates[exchangedCurrencies[i].toLowerCase()] = responseBody.groestlcoin[exchangedCurrencies[i]];
																}
												}

												return exchangeRates;
								}
								return null;
				}
  },
	blockRewardFunction:function(blockHeight) {
		var eras = [ new Decimal8(50) ];
		for (var i = 1; i < 34; i++) {
			var previous = eras[i - 1];
			eras.push(new Decimal8(previous).dividedBy(2));
		}

		var index = Math.floor(blockHeight / 210000);

		return eras[index];
	}
};
