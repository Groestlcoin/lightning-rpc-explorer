var coins = require("./coins.js");

var currentCoin = "GRS";

var credentials = require("./defaultCredentials.js");
var overwriteCredentials = require("./credentials.js");

for (var key in overwriteCredentials) {
	credentials[key] = overwriteCredentials[key];
}

module.exports = {
	cookiePassword: credentials.cookiePassword,
	coin: currentCoin,

	siteInfo: {
		title: "Lightning Explorer",
		sourceUrl: "https://github.com/Groestlcoin/lightning-rpc-explorer",
		demoSiteUrl: "https://lightningexplorer.groestlcoin.org"
	},

	demoSite: true,

	rpcBlacklist:[
		"stop"
	],

	credentials: credentials,

	site: {
		pubkeyMaxDisplayLength: 22,
		aliasMaxDisplayLength: 25,
		addressMaxDisplayLength: 25,
		txidMaxDisplayLength: 22,
	},

	donationAddresses:{
		coins:["GRS"],

		"GRS":{address:"FWN1qdiRrymSR6jbpbanLYqZpjkEaZouHN", urlPrefix:"groestlcoin:"}
	},

	blockExplorerUrl:"https://lightningexplorer.groestlcoin.org",

	headerDropdownLinks: {
		title:"Related Sites",
		links:[
			{name: "Lightning Explorer", url:"https://lightningexplorer.groestlcoin.org", imgUrl:"/img/logo/lightning.svg"},
		]
	}
};
