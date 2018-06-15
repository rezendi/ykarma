import React from 'react';
import { Redirect } from 'react-router-dom';
import { auth } from '../firebase';

class FinishSignIn extends React.Component {

  componentDidMount() {
    auth.signInViaEmailLink(window.location.href).then(authUser => {
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