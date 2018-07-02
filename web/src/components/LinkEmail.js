import React from 'react';
import { auth } from '../firebase';

class LinkEmail extends React.Component {

  componentDidMount() {
    auth.linkEmailViaEmailLink(window.location.href).then(authUser => {
      this.props.history.push("/profile");
    });
  }

  render() {
    return (
      <div>Linking your email...</div>
    )
  }
}

export default LinkEmail