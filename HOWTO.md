To get running:
 - pull code from github
 - populate .env.production in server and web
 - populate .firebase.json and fbase.js
 - docker-compose build & docker-compose up -d

To avoid deploying/using a new contract next time:
 - write ykarma address to .env.production

Left as an exercise:
 - Firewalls
 - HTTPS vs. Let's Encrypt
   https://medium.com/bros/enabling-https-with-lets-encrypt-over-docker-9cad06bdb82b

Forthcoming:
 - Cron jobs
