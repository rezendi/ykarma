import React from 'react';
import { auth } from '../firebase';

class FinishSignIn extends React.Component {

  componentDidMount() {
    auth.signInViaEmailLink(window.location.href).then(authUser => {
      sessionStorage.setItem("authProvider", "email");
      this.props.history.push("/");
    });
  }

  render() {
    return (
      <div>Logging you in...</div>
    )
  }
}

export default FinishSignIn