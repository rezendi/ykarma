import React from 'react';
import { fbase, auth } from '../fbase';

class FinishSignIn extends React.Component {

  componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const customToken = params.get('customToken');
    if (customToken && customToken.length > 0) {
      auth.doSignOut();
      fbase.auth.signInWithCustomToken(customToken).then(() => {
        localStorage.setItem("authProvider", "slack");
        this.props.history.push("/");
      }).catch(function(error) {
        if (error) {
          console.log("slack auth error", error);
        }
      });
    } else {
      auth.signInViaEmailLink(window.location.href).then(authUser => {
        localStorage.setItem("authProvider", "email");
        this.props.history.push("/");
      }).catch(function(error) {
        if (error) {
          console.log("email auth error", error);
        }
      });
    }
  }

  render() {
    return (
      <div>Logging you in...</div>
    )
  }
}

export default FinishSignIn