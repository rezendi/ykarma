import firebase from 'firebase/app'
import { auth } from './fbase';

// Action code settings
var devActionCodeSettings = {
  url: 'http://localhost:3000/finishSignIn',
  handleCodeInApp: true,
};

const prodActionCodeSettings = {
  url: `${process.env.REACT_APP_PRODUCTION_ROOT}/finishSignIn`,
  handleCodeInApp: true,
};

// Link code settings
var devLinkCodeSettings = {
  url: 'http://localhost:3000/linkEmail',
  handleCodeInApp: true,
};

const prodLinkCodeSettings = {
  url: `${process.env.REACT_APP_PRODUCTION_ROOT}/linkEmail`,
  handleCodeInApp: true,
};

const actionCodeSettings = process.env.NODE_ENV === 'production' ? prodActionCodeSettings : devActionCodeSettings;
const linkCodeSettings = process.env.NODE_ENV === 'production' ? prodLinkCodeSettings : devLinkCodeSettings;

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
        localStorage.setItem("additionalEmailInfo", JSON.stringify(result.additionalUserInfo));
      })
      .catch(function(error) {
        console.log("Firebase sign-in error", error);
      });
  }
};

// Send link link
export const sendLinkToLinkEmail = (email) => {
  auth.sendSignInLinkToEmail(email, linkCodeSettings)
  .then(function() {
    window.localStorage.setItem('emailForLinkIn', email);
  })
  .catch(function(error) {
    console.log("Firebase sign-in link link error", error);
  });
};

// Sign in
export const linkEmailViaEmailLink = async (user, href) => {
  if (auth.isSignInWithEmailLink(href)) {
    var email = window.localStorage.getItem('emailForLinkIn');
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }
    var credential = firebase.auth.EmailAuthProvider.credentialWithLink(email, window.location.href);
    return user.linkAndRetrieveDataWithCredential(credential);
  }
};

// Current user

export const currentUser = () => {
  return firebase.auth().currentUser;
};

// Sign out

export const doSignOut = () => {
  console.log("Signing out");
  auth.signOut();
  setToken(null);
  sessionStorage.clear();
  localStorage.clear();
}

export const setToken = (idToken) => {
  const additionaTwitterlInfo = JSON.parse(localStorage.getItem("additionalTwitterInfo") || "{}")
  const handle = additionaTwitterlInfo.username ? "@" + additionaTwitterlInfo.username : null;
  return fetch('/api/accounts/token/set', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
    body: JSON.stringify({ token: idToken, handle: handle })
  });
}

// TODO: linking credentials at the Firebase level per https://firebase.google.com/docs/auth/web/email-link-auth etc.
