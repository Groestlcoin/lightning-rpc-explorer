const hashjs = require('hash.js');

var express = require('express');
var router = express.Router();
var util = require('util');
var moment = require('moment');
var utils = require('./../app/utils');
var bitcoinCore = require("bitcoin-core");
var rpcApi = require("./../app/rpcApi.js");
var qrcode = require('qrcode');

router.get("/", function(req, res) {
	rpcApi.getFullNetworkDescription().then(function(fnd) {
		res.locals.fullNetworkDescription = fnd;

		res.locals.homepage = true;

		res.render("index");
	});
});

router.get("/node/:nodePubKey", function(req, res) {
	var nodePubKey = req.params.nodePubKey;

	rpcApi.getFullNetworkDescription().then(function(fnd) {
		res.locals.fullNetworkDescription = fnd;
		res.locals.nodeInfo = fnd.nodeInfoByPubkey[nodePubKey];


		res.locals.nodeChannels = [];
		fnd.channels.sortedByLastUpdate.forEach(function(channel) {
			if (channel.node1_pub == nodePubKey || channel.node2_pub == nodePubKey) {
				res.locals.nodeChannels.push(channel);
			}
		});

		var qrcodeStrings = [];
		qrcodeStrings.push(nodePubKey);

		if (res.locals.nodeInfo.node.addresses) {
			for (var i = 0; i < res.locals.nodeInfo.node.addresses.length; i++) {
				if (res.locals.nodeInfo.node.addresses[i].network == "tcp") {
					res.locals.nodeUri = nodePubKey + "@" + res.locals.nodeInfo.node.addresses[i].addr;

					qrcodeStrings.push(res.locals.nodeUri);

					break;
				}
			}
		}

		utils.buildQrCodeUrls(qrcodeStrings).then(function(qrcodeUrls) {
			res.locals.qrcodeUrls = qrcodeUrls;

			res.render("node");

		}).catch(function(err) {
			utils.logError("3e0ufhdhfsdss", err);
			
			res.render("node");
		});
	});
});

router.get("/channel/:channelId", function(req, res) {
	var channelId = req.params.channelId;

	rpcApi.getFullNetworkDescription().then(function(fnd) {
		res.locals.fullNetworkDescription = fnd;

		res.locals.channel = fnd.channelsById[channelId];

		res.locals.node1 = fnd.nodeInfoByPubkey[res.locals.channel.node1_pub];
		res.locals.node2 = fnd.nodeInfoByPubkey[res.locals.channel.node2_pub];

		rpcApi.getLocalChannels().then(function(localChannels) {
			res.locals.localChannels = localChannels;

			res.render("channel");

		}).catch(function(err) {
			utils.logError("37921hdasudfgd", err);

			res.render("channel");
		});
	});
});

router.get("/node-status", function(req, res) {
	var promises = [];

	promises.push(new Promise(function(resolve, reject) {
		lightning.getInfo({}, function(err, response) {
			if (err) {
				utils.logError("3u1rh2yugfew0fwe", err);

				reject(err);

				return;
			}

			res.locals.getInfo = response;
			res.locals.qrcodeUrls = {};

			var qrcodeStrings = [response.identity_pubkey];
			if (response.uris && response.uris.length > 0) {
				qrcodeStrings.push(response.uris[0]);
			}

			utils.buildQrCodeUrls(qrcodeStrings).then(function(qrcodeUrls) {
				res.locals.qrcodeUrls = qrcodeUrls;

				resolve();

			}).catch(function(err) {
				utils.logError("37ufdhewfhedd", err);

				// no need to reject, we can fail gracefully without qrcodes
				resolve();
			});
		});
	}));

	promises.push(new Promise(function(resolve, reject) {
		lightning.listPeers({}, function(err, response) {
			if (err) {
				utils.logError("u3rhgqfdygews", err);

				reject(err);

				return;
			}

			res.locals.listPeers = response;

			resolve();
		});
	}));

	promises.push(new Promise(function(resolve, reject) {
		rpcApi.getFullNetworkDescription().then(function(fnd) {
			res.locals.fullNetworkDescription = fnd;

			resolve();
		});
	}));

	Promise.all(promises).then(function() {
		res.render("node-status");
		res.end();

	}).catch(function(err) {
		req.session.userErrors.push(err);

		utils.logError("322u0rh2urf", err);

		res.render("node-status");
	});
});

router.get("/login", function(req, res) {
	if (req.session.admin) {
		res.redirect("/");

		return;
	}

	req.session.loginRedirect = req.headers.referer;

	res.render("login");
});

router.post("/login", function(req, res) {
	if (req.session.admin) {
		res.redirect("/");

		return;
	}

	// debug use for setting new password config
	var pwdHash = hashjs.sha256().update(req.body.password).digest('hex');
	console.log("password.sha256: " + pwdHash);
	
	if (req.body.username == config.credentials.adminUsername) {
		if (pwdHash == config.credentials.adminPasswordSha256) {
			req.session.admin = true;

			if (req.session.loginRedirect) {
				res.redirect(req.session.loginRedirect);

				return;
			}

			res.redirect("/");

			return;
		}
	}

	req.session.userMessage = "Login failed.";
	req.session.userMessageType = "danger";

	res.locals.userMessage = "Login failed.";
	res.locals.userMessageType = "danger";

	res.render("login");
});

router.get("/logout", function(req, res) {
	req.session.admin = false;

	res.redirect("/");
});

router.get("/changeSetting", function(req, res) {
	if (req.query.name) {
		req.session[req.query.name] = req.query.value;

		res.cookie('user-setting-' + req.query.name, req.query.value);
	}

	res.redirect(req.headers.referer);
});

router.get("/nodes", function(req, res) {
	var limit = 20;
	var offset = 0;
	var sort = "last_update-desc";

	if (req.query.limit) {
		limit = parseInt(req.query.limit);
	}

	if (req.query.offset) {
		offset = parseInt(req.query.offset);
	}

	if (req.query.sort) {
		sort = req.query.sort;
	}

	res.locals.limit = limit;
	res.locals.offset = offset;
	res.locals.sort = sort;
	res.locals.paginationBaseUrl = "/nodes";

	var sortProperty = sort.substring(0, sort.indexOf("-"));
	var sortDirection = sort.substring(sort.indexOf("-") + 1);

	rpcApi.getFullNetworkDescription().then(function(fnd) {
		res.locals.fullNetworkDescription = fnd;

		if (sortProperty == "last_update") {
			res.locals.nodeInfos = fnd.nodes.sortedByLastUpdate;

		} else if (sortProperty == "num_channels") {
			res.locals.nodeInfos = fnd.nodes.sortedByChannelCount;

		} else if (sortProperty == "channel_capacity") {
			res.locals.nodeInfos = fnd.nodes.sortedByTotalCapacity;

		} else {
			res.locals.nodeInfos = fnd.nodes.sortedByLastUpdate;
		}

		res.locals.nodeInfos = res.locals.nodeInfos.slice(offset, offset + limit);

		res.render("nodes");
	});
});

router.get("/channels", function(req, res) {
	var limit = 20;
	var offset = 0;
	var sort = "last_update-desc";

	if (req.query.limit) {
		limit = parseInt(req.query.limit);
	}

	if (req.query.offset) {
		offset = parseInt(req.query.offset);
	}

	if (req.query.sort) {
		sort = req.query.sort;
	}

	res.locals.limit = limit;
	res.locals.offset = offset;
	res.locals.sort = sort;
	res.locals.paginationBaseUrl = "/channels";

	var sortProperty = sort.substring(0, sort.indexOf("-"));
	var sortDirection = sort.substring(sort.indexOf("-") + 1);

	rpcApi.getFullNetworkDescription().then(function(fnd) {
		res.locals.fullNetworkDescription = fnd;

		if (sortProperty == "last_update") {
			res.locals.channels = fnd.channels.sortedByLastUpdate;

		} else if (sortProperty == "capacity") {
			res.locals.channels = fnd.channels.sortedByCapacity;

		} else {
			res.locals.channels = fnd.channels.sortedByLastUpdate;
		}

		res.locals.channels = res.locals.channels.slice(offset, offset + limit);

		res.render("channels");
	});
});

router.get("/local-channels", function(req, res) {
	var limit = 20;
	var offset = 0;
	var sort = "last_update-desc";

	if (req.query.limit) {
		limit = parseInt(req.query.limit);
	}

	if (req.query.offset) {
		offset = parseInt(req.query.offset);
	}

	if (req.query.sort) {
		sort = req.query.sort;
	}

	res.locals.limit = limit;
	res.locals.offset = offset;
	res.locals.sort = sort;
	res.locals.paginationBaseUrl = "/channels";

	var sortProperty = sort.substring(0, sort.indexOf("-"));
	var sortDirection = sort.substring(sort.indexOf("-") + 1);

	rpcApi.getFullNetworkDescription().then(function(fnd) {
		res.locals.fullNetworkDescription = fnd;

		rpcApi.getLocalChannels().then(function(localChannels) {
			res.locals.localChannels = localChannels;

			res.render("local-channels");

		}).catch(function(err) {
			utils.logError("37921hdasudfgd", err);

			res.render("local-channels");
		});
	});
});

router.get("/search", function(req, res) {
	if (!req.query.query) {
		req.session.userMessage = "Enter a public key, alias, address, or channel id.";

		res.redirect("/");

		return;
	}

	var query = req.query.query.toLowerCase().trim();

	res.locals.query = query;

	rpcApi.getFullNetworkDescription().then(function(fnd) {
		res.locals.fullNetworkDescription = fnd;

		if (fnd.nodeInfoByPubkey[query]) {
			res.redirect("/node/" + query);

			return;
		}

		if (fnd.channelsById[query]) {
			res.redirect("/channel/" + query);

			return;
		}

		res.locals.searchResults = {};
		res.locals.searchResults.nodes = [];

		fnd.nodes.sortedByLastUpdate.forEach(function(nodeInfo) {
			if (nodeInfo.node.alias.toLowerCase().indexOf(query) > -1) {
				res.locals.searchResults.nodes.push(nodeInfo);
			}

			if (nodeInfo.node.pub_key.toLowerCase().indexOf(query) > -1) {
				res.locals.searchResults.nodes.push(nodeInfo);
			}

			if (nodeInfo.node.color.indexOf(query) > -1) {
				res.locals.searchResults.nodes.push(nodeInfo);
			}

			nodeInfo.node.addresses.forEach(function(address) {
				if (address.addr.indexOf(query) > -1) {
					res.locals.searchResults.nodes.push(nodeInfo);
				}
			});
		});

		res.render("search");
	});
});

router.get("/about", function(req, res) {
	res.render("about");
});

router.get("/connectToPeer", function(req, res) {
	if (!req.query.pubKey) {
		req.session.userMessage = "Unable to connect to peer: missing pubKey";

		res.redirect(req.headers.referer);
	}

	if (!req.query.address) {
		req.session.userMessage = "Unable to connect to peer: missing address";

		res.redirect(req.headers.referer);
	}

	rpcApi.connectToPeer(req.query.pubKey, req.query.address).then(function(response) {
		req.session.userMessage = "Success! Connected to new peer.";
		req.session.userMessageType = "success";

		res.redirect(req.headers.referer);

	}).catch(function(err) {
		req.session.userErrors.push(err);

		utils.logError("397gedgfgggsgsgs", err);

		req.session.userMessage = "Error connecting to peer: " + err + "(" + JSON.stringify(err) + ")";
		req.session.userMessageType = "danger";

		res.redirect(req.headers.referer);
	});
});

router.get("/payment-history", function(req, res) {
	rpcApi.listPayments().then(function(listPaymentsResponse) {
		res.locals.payments = listPaymentsResponse;

		res.render("payment-history");

	}).catch(function(err) {
		req.session.userErrors.push(err);

		utils.logError("397gedgfgggsgsgs", err);

		res.render("payment-history");
	});
});

router.get("/send-payment", function(req, res) {
	var promises = [];

	if (req.query.invoice) {
		res.locals.invoice = req.query.invoice;

		promises.push(new Promise(function(resolve, reject) {
			rpcApi.decodeInvoiceString(req.query.invoice).then(function(decodeInvoiceResponse) {
				res.locals.decodedInvoice = decodeInvoiceResponse;

				resolve();

			}).catch(function(err) {
				req.session.userErrors.push(err);

				utils.logError("8yf0342ywe", err);

				reject(err);
			});
		}));
	}

	Promise.all(promises).then(function() {
		res.render("send-payment");

	}).catch(function(err) {
		req.session.userErrors.push(err);

		req.session.userMessage = "Unable to decode payment request: " + err + " (" + JSON.stringify(err) + ")";

		utils.logError("4379t2347g", err);

		res.render("send-payment");
	})
});

router.post("/send-payment", function(req, res) {
	rpcApi.payInvoice(req.query.invoice).then(function(response) {
		console.log("SendPayment response: " + response + ", json: " + JSON.stringify(response));

		req.session.userMessage = "Payment sent successfully!";
		req.session.userMessageType = "success";

		res.render("send-payment");

	}).catch(function(err) {
		req.session.userErrors.push(err);

		req.session.userMessage = "Error sending payment: " + err + " (" + JSON.stringify(err) + ")";
		req.session.userMessageType = "danger";

		utils.logError("8usedghvcf072g", err);

		res.render("send-payment");
	});
});

router.get("/on-chain-transactions", function(req, res) {
	rpcApi.getOnChainTransactions().then(function(onChainTransactionsResponse) {
		res.locals.onChainTransactions = onChainTransactionsResponse;
		
		res.render("on-chain-transactions");

	}).catch(function(err) {
		req.session.userErrors.push(err);

		utils.logError("32u7rthwe96yfg", err);

		res.render("on-chain-transactions");
	});
});

router.get("/invoices", function(req, res) {
	rpcApi.getInvoices().then(function(invoicesResponse) {
		res.locals.invoices = invoicesResponse;
		
		res.render("invoices");

	}).catch(function(err) {
		req.session.userErrors.push(err);

		utils.logError("3214r97y2gwefy", err);

		res.render("invoices");
	});
});

module.exports = router;
