import React from 'react';
import { withTranslation } from 'react-i18next';
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
    const { t } = this.props;
    return (
      <div>{t('Logging you in...')}</div>
    )
  }
}

export default withTranslation()(FinishSignIn)