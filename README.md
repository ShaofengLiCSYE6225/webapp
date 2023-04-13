# webapp
CSYE 6225 Assignment7
## Prerequisites for building and deploying your application locally.
1. install Node.js
2. install Mysql
3. install run `npm install i`
4. set up a .env file and set up your own MYSQL_HOST,MYSQL_USER,MYSQL_PASSWORD,MYSQL_DATABASE
5. intall a postman if you like
## Build and Deploy instructions for the web application.
1. run `npm run devStart`
## Command to import SSL certificate
aws --profile prod acm import-certificate --certificate fileb://prod_shaofengli_me.crt \
      --certificate-chain fileb://prod_shaofengli_me.ca-bundle \
      --private-key fileb://private.key

