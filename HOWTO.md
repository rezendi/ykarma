
YKarma HOWTO
============

Architectural Overview
----------------------

This is a three-tier web app: a React front end talking to a Node API which in turn uses a private Ethereum blockchain as its datastore.
Most of the actual business logic consists of on-chain smart contracts.

The technical downsides to this are obvious: blockchains and blockchain development are both far less efficient than databases and database
development; any refactoring which involves production data is extremely difficult, as, rather than, say, running a simple ALTER TABLE, you
have to either add to the existing, immutable, on-chain data, or transform it all with a long list of blockchain transactions, or launch a
new chain, copy the old data over, and transform it en route; pulling data from the chain can be surprisingly convoluted; etc etc etc.

Only two third-party services are used: Firebase for authentication, and SendGrid for email. Authentication is either via email link or
Sign In With Twitter; this app does not use (or store) passwords.

All these services have been Dockerized so that they can be launched via a single docker-compose statement, after the various configuration
files have been appropriately populated. Automated integration tests exist for the smart contracts and the API. Details on how to launch
the various tiers of the app below.


Prerequisites
-------------
 - code from github
 - docker and docker-compose to launch
 - node / truffle to develop
 - Firebase project for auth
 - Sengrid to send emails


Quick Launch
------------
 - pull code from github
 - populate .firebase.json and fbase.js
 - cd server && cp .example.env .env.production
 - cd web && cp .example.env .env.production
 - docker-compose build
 - docker-compose up
 - note you'll need to rebuild after any code changes


Smart Contract Development
--------------------------
 - run ganache
 - run truffle test
 - run truffle deploy
 - note that YKarma.sol will break if much larger.

API Development
---------------
 - cd server && cp .example.env .env.production
 - change admin email etc.
 - ganache-cli -u 0
 - cd ethereum && truffle deploy (this should set the YKarma address)
 - cd server && NODE_ENV=test npm start
 - cd server && mocha


Web Development
---------------
 - API development as above
 - populate .firebase.json and fbase.js
 - cd web && cp .example.env .env.production
 - change admin email etc.
 - cd ethereum && truffle deploy (this should set the YKarma address)
 - cd server && npm start
 - cd web && npm start


In Production
-------------
 - populate .env.production in server and web
 - docker-compose build & docker-compose up -d
 - set up cron job
 - note chain data in /cbdata; delete if you want to start from scratch
 - Let's Encrypt and nginx.conf.ssl https://medium.com/bros/enabling-https-with-lets-encrypt-over-docker-9cad06bdb82b
 - Firewalls on DO https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands
