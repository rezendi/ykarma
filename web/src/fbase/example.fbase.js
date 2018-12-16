import firebase from 'firebase/app';
import 'firebase/auth';

// General config
const devConfig = {
  apiKey: "YOUR-FIREBASE-API-KEY",
  authDomain: "your-domain.firebaseapp.com",
  databaseURL: "https://your-domain.firebaseio.com",
  projectId: "your-domain",
  storageBucket: "your-domain.appspot.com",
  messagingSenderId: "1234567890"
};

const prodConfig = devConfig; // for now

const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;
    
if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const auth = firebase.auth();

export {
  auth,
};
