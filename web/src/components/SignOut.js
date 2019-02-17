import React from 'react';
import { withTranslation } from 'react-i18next';
import { auth } from '../fbase';

class SignOut extends React.Component {

  componentDidMount() {
    auth.doSignOut();
    this.props.history.push("/");
  }

  render() {
    const { t } = this.props;
    return (
      <div>{t('Logging you out...')}</div>
    )
  }
}

export default withTranslation()(SignOut)