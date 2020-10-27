# Lightning RPC Explorer

Simple, database-free Lightning network explorer, via gRPC. Built with Node.js, express, bootstrap-v4.

This tool is intended to be a simple, self-hosted explorer for the Lightning network, driven by RPC calls to your own lightning node.

A live demo of the tool is available at https://lightningexplorer.groestlcoin.org

# Features

* Network summary
* Browse nodes and channels, sorted by last update or capacity
* View node and channel details
* Search by node or channel

# Getting started

## Prerequisites

1. Install and run a full, archiving node. Ensure that your node has full transaction indexing enabled (`txindex=1`) and the RPC server enabled (`server=1`).
2. Synchronize your node with the Groestlcoin network.
3. [Install LND](https://github.com/groestlcoin/lnd/blob/master/docs/INSTALL.md)

## Instructions

1. Clone this repo
2. `npm install`
3. `npm start`
4. Open [http://127.0.0.1:3004/](http://127.0.0.1:3004/)
