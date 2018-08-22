import firebase from 'firebase/app';
import 'firebase/auth';

// General config
const devConfig = {
  apiKey: "AIzaSyBqXixksYzRQD8M2s947cfCQaTLOhZopmE",
  authDomain: "y-karma.firebaseapp.com",
  databaseURL: "https://y-karma.firebaseio.com",
  projectId: "y-karma",
  storageBucket: "y-karma.appspot.com",
  messagingSenderId: "904793566960"
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
