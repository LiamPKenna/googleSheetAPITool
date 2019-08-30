
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// Read/Write privelages for editing Google Spreadsheets.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './keys/token.json';

// Load client secrets from a local file.
const CREDENTIALS = new Promise((resolve, reject) => {
  fs.readFile('./keys/credentials.json', (err, content) => {
    if (err) {
      console.log('Error loading client secret file:', err);
      reject(err);
    };
    resolve(JSON.parse(content));
  });
});

/**
 * Create an OAuth2 client with the given credentials, and then set credentials
 * from token file.  If no token exists, return error.
 * @param {Object} credentials The authorization client credentials.
 * @return {object} oAuth2Client containing token credentials.
 */
const authorize = async (credentials) => {
  return new Promise((resolve, reject) => {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        console.log('NO TOKEN FOUND!!!!!! Please run getNewToken prior to attempting to edit Google Sheets');
        reject();
      }; ;
      oAuth2Client.setCredentials(JSON.parse(token));
      resolve(oAuth2Client);
    });
  });
}


const writeToSheet = async (sheetId, cellsRange, data) => {
  const theseCredentials = await CREDENTIALS;
  const auth = await authorize(theseCredentials);
  const sheets = google.sheets({version: 'v4', auth});
  const values = await data;
  const resource = {values,};
  sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${cellsRange}`,
    valueInputOption: 'USER_ENTERED',
    resource,
  }, (err, result) => {
    if (err) {
      // Handle error
      console.log(err);
    } else {
      console.log(`${result['data']['updatedCells']} cells updated.`);
    }
  });
}



module.exports.writeToSheet = writeToSheet;
