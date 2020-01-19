# planr
## How to run:
Create an account in Google's API console [here](https://console.developers.google.com/apis/dashboard). 
Then, create an OAuth 2.0 Client ID, and a Google service account for use with Google Search. Put the JSON file for the service client in the root directory of planr and replace the private key in the `start.sh` file with your own. Replace the secrets in `main.js` with your own secret and the OAuth client ID with your own. 
```
npm install
./start.sh
```
