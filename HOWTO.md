
YKarma HOWTO
============

Architectural Overview
----------------------

This is a three-tier web app: a React/Redux front end talking to a Node API
which in turn uses a private Geth PoA Ethereum blockchain as its datastore.
Most of the actual business logic consists of on-chain smart contracts. It
all (optionally) runs inside Docker containers.

Only two third-party services are used: Firebase for authentication, and
Sendgrid for email. Authentication is either via email link or Sign In With
Twitter -- this app does not use (or store) passwords.

All these services have been Dockerized so that they can be launched via a
single docker-compose statement, after the various configuration files have
been appropriately populated. Automated integration tests exist for the smart
contracts and the API. Details on how to build & launch the app below.

Prerequisites
-------------

To get this code up and running locally, you're going to need:
1. The code, obviously, cloned from this repo.
2. [Docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/) installed locally, to run it in containers, or
3. [Node](https://nodejs.org/en/) and [truffle](https://truffleframework.com/) installed locally, to run it directly
4. A [new Firebase project](https://console.firebase.google.com/) with `Email/Password` enabled as [authentication provider](https://console.firebase.google.com/project/_/authentication/providers)
5. A [Sendgrid](https://signup.sendgrid.com/) API key to send emails (this is not essential, skip it for quick launch)

Note also that the instructions here assume a Unix environment (and it was developed in OS X) so any necessary
operating-system adjustments are, I'm afraid, left as an exercise for the reader.

Quick Launch with Docker
------------------------

1. Ensure you have the prerequisites mentioned above -- Docker, docker-compose, and your new Firebase project.

2. Populate the two Firebase config files: one for the React front end, one for the API service
    1. Firebase configuration for React
        1. There exists a file `web/src/fbase/example.fbase.js`
        2. Rename it to `web/src/fbase/fbase.js`
        3. Get the Firebase web config values per the [Firebase documentation](https://firebase.google.com/docs/web/setup)
        4. Replace the placeholder values in the fbase.js file with those real ones.
    2. Firebase configuration for the API service
        1. Get the JSON file containing your Firebase service account's credentials per the [Firebase documentation](https://firebase.google.com/docs/admin/setup)
        2. Save that file as `.firebase.json` inside the "server" top-level directory for this project

3. Populate the YKarma configuration files -- again, one for the React front end, one for the API service
    1. YKarma configuration for React
        1. Copy the `.example.env.production` file in the "web" top-level directory to `.env.production`
        2. Edit the values there per your needs. In particular, change the admin email to your email address.
    1. YKarma configuration for the API service
        1. Copy the `.example.env.production` file in the "server" top-level directory to `.env.production`
        2. Edit the values there per your needs. In particular, **change the admin email to your email address**.
        3. Note that the Sendgrid API key goes there too, if you want to be able to send emails.

4. Breathe a sigh of relief that the annoying config-file stuff is now done and you shouldn't need to deal with it again.

5. Build the app with docker-compose
    1. From a shell in the project root directory, run `docker-compose build`
    2. Note you'll need to repeat this step after code changes for those to be promoted into the containers.

6. Run the app with docker-compose
    1. From a shell in the project root directory, run `docker-compose up`
    2. A lot of stuff happens on first run: launching the blockchain, compiling all the smart contracts and
    migrating them into the blockchain, communicating the contract address to the API server, etc. This can
    take a few minutes. Wait for it to settle down into a steady stream of mining empty blocks, and/or
    wait for a "hostname" log message from the "node_1" container, before you...
    3. Open a browser and point it to "localhost"

7. Profit!
    1. Log in with your admin email
    2. Send karma to other email addresses / Twitter handles to add them to the built-in test community
    3. Create rewards, purchase rewards, etc.
    4. Use this code as a basis for your own experimentation!

Note that when running the blockchain via Docker, the actual data directory is
the "geth/cbdata" directory under the project root, which is shared with (and
written to by) Docker as a volume. If you want to restart with a brand-new,
unsullied blockchain, just delete that directory, delete the YKARMA_ADDRESS
line in server/.env.production, and run "docker-compose up" again.



Local Development
=================

Docker deployment is relatively fast (other than the configuration-file dance,
but that's software for you these days) but is a little too arms-length for a
development environment. If you want to build on this code, or if for some
reason Docker isn't cooperating, here's how to get it up and running directly
on your machine, with no container abstraction:


Smart Contract Development
--------------------------

1. Open a shell and run `ganache-cli -u 0` (installed as part of Truffle) to
get a local blockchain up and running. For extra debug info you may wish to
run `ganache-cli -u 0 --noVMErrorsOnRPCResponse`

2. Open another shell, navigate to the "ethereum" top-level directory of this
repo, and run `truffle test`

This should compile the YKarma smart contracts, write them to the local blockchain,
and run some JavaScript test code against them. The result should output the admin
email in the file `server/.env` and also the results of the "Paces" integration
test, which should pass.

Note that the fundamental smart contract interface with which the JavaScript
code interfaces, YKarma.sol, is very nearly at the maximum size limit for an
Ethereum smart contract; if you want to add to it you may need to split it up.

API Development
---------------

Both the API server and the React client have a configuration file. Their use
is slightly confusing because this code can run in two environments: Docker and
local. The Docker environment uses the `.env.production` files to set its
environment variables; the local environment simply uses `.env` files.

So, to get the Node API up and running locally:

1. If you haven't already, get the JSON file containing your Firebase service account'
credentials per the [Firebase documentation](https://firebase.google.com/docs/admin/setup)
and save that file as `.firebase.json` inside the "server" top-level directory for this project

2. Copy the `.example.env.development` file in the "server" top-level directory to `.env`
3. Edit the values there per your needs. In particular, *change the admin email to your email address*.
4. Note that the Sendgrid API key goes there too, if you want to be able to send emails.
5. Open a shell and run `ganache-cli -u 0` as above.

6. Open another shell, navigate to the "ethereum" top-level directory of this
repo, and run `truffle deploy` (this should compile and write the smart
contracts, again, and write the address of the resulting YKarma interface
contract to `server/.env` for use by the Node code.)

7. Open a third shell, navigate to the "server" top-level directory of this
repo, and run `npm run test` to get the API running in test mode

8. Open a fourth shell, navigate to the "server" top-level directory of this
repo, and run `mocha` to run the API tests. They should pass.

9. Once you've established that tests are passing, stop `npm run test` and
instead just run `npm start`. Voila! The API is running locally on port 3001.


Web Development
---------------

Running the actual web site locally is fairly straightforward once you have the
API service up and running:

1. If you haven't already, rename `web/src/fbase/example.fbase.js` to `web/src/fbase/fbase.js`
and replace its placeholder values with your Firebase web config values per the
[Firebase documentation](https://firebase.google.com/docs/web/setup).

2. Copy the `.example.env.development` file in the "web" top-level directory to `.env`

3. Edit the values there per your needs. In particular, change the admin email to your email address.

4. With Ganache running, the smart contracts deployed to the blockchain via
Truffle, and the API running, open a fourth shell, navigate to the "web"
top-level directory of this repo, and run `npm start`.


Running Locally
---------------

The above looks more painful and difficult than it is because of all the config
files. Once those are set up, running locally consists of opening four shell
windows and running, in this order:

1. (in the "ethereum" directory) `ganache-cli -u 0`
2. (in the "ethereum" directory) `truffle deploy`
3. (in the "server" directory) `npm start`
4. (in the "web" directory) `npm start`

That's all. You get hot refreshes from the React code, but you'll need to
restart both Node and React if you change the API code, and obviously you'll
need to restart 2, 3, and 4 if you change the smart contracts.


In Production
-------------

If you want to run this in production, eg on a DigitalOcean droplet, you should
obviously use the Docker configuration. You should be able to run it well on a
fairly small instance (eg 4GB memory). All of the Quick Launch instructions
above apply, along with a few other notes:

* Again, when running under Docker the actual blockchain data is the local "geth/cbdata"
directory, shared with and written to by Docker as a volume

* To run on Linux behind Nginx, there's a line you'll want to uncomment in docker-compose.yml

* If you want your site secured via TLS, you probably want to use Let's Encrypt via docker;
here's a [good guide](https://medium.com/bros/enabling-https-with-lets-encrypt-over-docker-9cad06bdb82b)
to doing that. If you have SSL set up, you want to replace nginx.conf in "server" with nginx.conf.https,
and there are two more lines to uncomment in docker-compose.yml

* You'll want to set up a cron job to refresh users' karma every week, and another to refresh the
Let's Encrypt cert. An example crontab for your server can be found in the "cron" directory under "server".

* One gotcha on Digital Ocean: don't use their UFW firewall, as Docker containers ignore UFW rules(!)
per https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands


Some Notes On The Architecture
------------------------------

The hard parts, technically, are yet to come, but much of the tedious work is
now done. (Not counting the inevitable bug fixes and/or design changes which
will necessitate the hair-tearing idea of updating smart contracts and data in
a production blockchain, but we'll burn those bridges when we come to them.)

The technical downsides to this architecture are obvious. Blockchains and
blockchain development are both far less efficient than databases and database
development. As mentioned, refactoring which involves production data is very
difficult, as, rather than, say, running a simple ALTER TABLE statement, you
have to either add to the existing, immutable, on-chain data; or transform it
all with a long list of blockchain transactions; or launch a new chain, copy
the old data over, and transform it en route. Even fetching data from the chain
can be surprisingly convoluted. Etc etc etc.

I was tempted to add more abstraction layers beyond React / API / blockchain,
eg some kind of ORM data layer between the API and the blockchain, but the idea
was for this to be illustrative as well as useful, so I went with just trying
to make the code simple, readable, and straightforward.

I'm a polyglot programmer and neither Javascript nor Solidity is my first or
even my fifth language of choice (though like many I have warmed to JS over the
years) which will probably be very apparent to serious JS/React/Node developers
when they look at the code.

If I was building this to seriously scale I ... well, I wouldn't have used a
blockchain. Given its necessity, I'd probably add that ORM data layer and
also use it to cache data for reads, along with a messaging queue for writes,
and maybe Kubernetes to support an arbitrary number of blockchain nodes and web
servers, and then worry about how/when to invalidate the cache(s) ... but
obviously caching would add a great deal of complexity to the system. (There's
a little Redis caching in there now, but only a little.)
