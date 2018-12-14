import firebase from 'firebase/app'
import { auth } from './fbase';

// Action and link code settings
const actionCodeSettings = {
  url: `${process.env.REACT_APP_ROOT}/finishSignIn`,
  handleCodeInApp: true,
};

const linkCodeSettings = {
  url: `${process.env.REACT_APP_ROOT}/linkEmail`,
  handleCodeInApp: true,
};

// Send sign in link
export const sendSignInLinkToEmail = (email, onSuccess, onError) => {
  auth.sendSignInLinkToEmail(email, actionCodeSettings)
  .then(function() {
    window.localStorage.setItem('emailForSignIn', email);
    onSuccess();
  })
  .catch(function(error) {
    console.log("Firebase sign-in link error", error);
    onError();
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
