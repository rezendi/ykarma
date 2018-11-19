To get running:
 - pull code from github
 - populate .firebase.json and fbase.js
 - run tests:
   - note that YKarma.sol will break if much larger.
 - local:
   - cd server && cp .example.env .env.production
   - cd web && cp .example.env .env.production
   - change admin email
   - ganache-cli -u 0
   - cd ethereum && truffle deploy
   - set YKarma address in server .env
   - cd server && npm start
   - cd web && npm start
 - production:
   - cp .example.env .env.production
   - populate .env.production in server and web
   - docker-compose build & docker-compose up -d

To avoid deploying/using a new contract next time:
 - write ykarma address to .env.production

Briefly mentioned:
 - Firewalls https://www.digitalocean.com/community/tutorials/ufw-essentials-common-firewall-rules-and-commands
 - HTTPS via Let's Encrypt https://medium.com/bros/enabling-https-with-lets-encrypt-over-docker-9cad06bdb82b

Forthcoming:
 - Cron jobs
