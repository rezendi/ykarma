import React from 'react';
import { auth } from '../fbase';

class SignOut extends React.Component {

  componentDidMount() {
    auth.doSignOut();
    this.props.history.push("/");
  }

  render() {
    return (
      <div>Logging you out...</div>
    )
  }
}

export default SignOut