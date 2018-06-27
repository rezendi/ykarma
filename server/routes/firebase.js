const admin = require('firebase-admin');

var serviceAccount = require('../.firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

module.exports = {
    db: db,
};