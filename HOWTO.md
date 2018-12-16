
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

To get this code up and running locally, you're going to need:
1. The code, obviously, cloned from this repo.
2. [Docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/) installed locally, to run it in containers, or
3. [Node](https://nodejs.org/en/) and [truffle](https://truffleframework.com/) installed locally, to run it directly
4. To create a [new Firebase project](https://console.firebase.google.com/) (this is essential in order to log in)
5. A [Sendgrid](https://signup.sendgrid.com/) API key to send emails (this is not essential, skip it for quick launch)

Note also that the instructions here assume a Unix environment (and it was developed in OS X) so any necessary
operating-system adjustments are, I'm afraid, left as an exercise for the reader.

Quick Launch with Docker
------------------------

1. Ensure you have the prerequisites mentioned above.

2. Populate the two Firebase config files: one for the React front end, one for the API service
    1. Firebase configuration for React
        1. There exists a file "web/src/fbase/example.fbase.js"
        2. Rename it to "web/src/fbase/fbase.js"
        3. Get the Firebase web config values per the [Firebase documentation](https://firebase.google.com/docs/web/setup)
        4. Replace the placeholder values in the fbase.js file with those real ones.
    2. Firebase configuration for the API service
        1. Get the JSON file containing your Firebase service account's credentials per the [Firebase documentation](https://firebase.google.com/docs/admin/setup)
        2. Save that file as ".firebase.json" inside the "server" top-level directory for this project

3. Populate the YKarma configuration files -- again, one for the React front end, one for the API service
    1. YKarma configuration for React
        1. Copy the ".example.env.production" file in the "web" top-level directory to ".env.production"
        2. Edit the values there per your needs. In particular, change the admin email to your email address.
    1. YKarma configuration for the API service
        1. Copy the ".example.env.production" file in the "server" top-level directory to ".env.production"
        2. Edit the values there per your needs. In particular, *change the admin email to your email address*.
        3. Note that the Sendgrid API key goes there too, if you want to be able to send emails.

4. Build the app with docker-compose
    1. From a shell in the project root directory, run "docker-compose build"
    2. Note you'll need to repeat this step after code changes for those to be promoted into the containers.

5. Run the app with docker-compose
    1. From a shell in the project root directory, run "docker-compose up"

6. Profit!
    1. Not really.


Local Development
=================

Docker deployment is relatively fast (other than the configuration-file dance, but that's software for you these days)
but is a little too arms-length for a development environment. If you want to build on this code, or if for some reason
Docker isn't cooperating, here's how you can get it up and running directly on your machine, with no container abstraction:

Smart Contract Development
--------------------------
 - run ganache
 - run truffle test
 - run truffle deploy
 - note that YKarma.sol will break if much larger.

API Development
---------------
 - cd server && cp .example.env.production .env.production
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
