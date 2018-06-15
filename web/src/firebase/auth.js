import { auth } from './firebase';

// Action code settings
var devActionCodeSettings = {
  url: 'http://localhost:3000/finishSignIn',
  handleCodeInApp: true,
};

const prodActionCodeSettings = devActionCodeSettings;

const actionCodeSettings = process.env.NODE_ENV === 'production' ? prodActionCodeSettings : devActionCodeSettings;

// Send sign in link
export const sendSignInLinkToEmail = (email) => {
  auth.sendSignInLinkToEmail(email, actionCodeSettings)
  .then(function() {
    window.localStorage.setItem('emailForSignIn', email);
  })
  .catch(function(error) {
    console.log("Firebase sign-in link error", error);
  });
};

// Sign in
export const signInViaEmailLink = async (href) => {
  if (auth.isSignInWithEmailLink(href)) {
    var email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }
    auth.signInWithEmailLink(email, href)
      .then(function(result) {
        window.localStorage.removeItem('emailForSignIn');
        console.log("Logged in as user", result.user);
        console.log("Additional info", result.additionalUserInfo);
      })
      .catch(function(error) {
        console.log("Firebase sign-in error", error);
      });
  }
};

// Sign out
export const doSignOut = () =>
  auth.signOut();


// Current user
export const getUser = function (store) {
  return new Promise(function (resolve, reject) {
    auth.onAuthStateChanged(function (user) {
      if (user) {
        resolve(user);
      } else {
        resolve(null);
      }
    });
  });
};

// TODO: linking credentials at the Firebase level per https://firebase.google.com/docs/auth/web/email-link-auth etc.
