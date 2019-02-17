import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import { withTranslation } from 'react-i18next';
import firebase from 'firebase/app'
import 'firebase/auth';
import { auth } from '../fbase';
import { loadOwnedRewards, loadVendedRewards, setLoading } from '../store/data/actions'
import Api from '../store/Api';
import Tranche from './Tranche';
import RewardRow from './RewardRow';

class Profile extends React.Component {

  componentDidMount() {
    this.props.loadOwnedRewards();
    this.props.loadVendedRewards();
  }

  addTwitter = () => {
    var provider = new firebase.auth.TwitterAuthProvider();
    firebase.auth().currentUser.linkWithPopup(provider).then((result) => {
      console.log("result", result);
      localStorage.setItem("additionalTwitterInfo", JSON.stringify(result.additionalUserInfo));
      this.props.setLoading(true);
      Api.addUrl(result.additionalUserInfo.username).then(() => {
        window.location.reload();
        this.props.setLoading(false);
      });
    }).catch(function(error) {
      var errorMessage = error.message;
      console.log("twitter error", errorMessage);
      localStorage.removeItem("additionalTwitterInfo");
      firebase.auth().currentUser.unlink("twitter.com");
      alert(this.props.t("Error:") + " " + errorMessage);
    });
  }

  removeTwitter = () => {
    firebase.auth().currentUser.unlink("twitter.com").then((result) => {
      localStorage.removeItem("additionalTwitterInfo");
      this.props.setLoading(true);
      Api.removeUrl("twitter").then(() => {
        this.props.setLoading(false);
        window.location.reload();
      });
    }).catch(function(error) {
      var errorMessage = error.message;
      console.log("twitter error", errorMessage);
      localStorage.removeItem("additionalTwitterInfo");
      alert(this.props.t("Error:") + " " + errorMessage);
      Api.removeUrl("twitter").then(() => {
        window.location.reload();
      });
    });
  }
  
  addEmail = async (values) => {
    auth.sendLinkToLinkEmail(values.email);
    alert(this.props.t("Email sent!"));
  }

  removeEmail = () => {
    Api.removeUrl("email").then(() => {
      window.location.reload();
    });
  }

  editMetadata = async (values) => {
    var toSubmit = { };
    toSubmit.name = values.name;
    toSubmit.prefs = {
      kr: values.kr ? 1 : 0,
      wk: values.wk ? 1 : 0,
    };
    console.log("Submitting form", toSubmit);
    this.props.setLoading(true);
    Api.updateAccount(this.props.user.ykid, toSubmit).then((res) => {
      this.props.setLoading(false);
      !res.ok ? alert(this.props.t("Server error!")) : window.location.reload();
    });
  }

  editEmailPrefs = async (values) => {
    console.log("Submitting email prefs form", JSON.stringify(values));
  }

  getName = (user) => {
    if (!user || !user.uid)
      return this.props.t("Nameless One");
    if (!user.metadata || !user.metadata.name)
      return user.displayName || this.props.t("Nameless One");
    return user.metadata.name;
  }
  
  totalSpendable() {
    var total = 0;
    const spendable = this.props.user.received || [];
    for (var i=0; i < spendable.length; i++) {
      total += parseInt(spendable[i].available, 10);
    }
    return total;
  }

  karmaBreakdown() {
    if (this.totalSpendable() === 0) {
      return 0;
    }
    var myTags = {};
    const spendable = this.props.user.received || [];
    for (var i=0; i < spendable.length; i++) {
      const tags = spendable[i].tags.split(",");
      for (var j in tags) {
        var tag = tags[j];
        myTags[tag] = myTags[tag] ? myTags[tag] + spendable[i].available : spendable[i].available;
      }
    }

    var sortedTags = [];
    for (var key in myTags) {
      sortedTags.push({tag: key, avail: myTags[key]});
    }
    sortedTags = sortedTags.sort(function(a,b) {return (a.avail > b.avail) ? 1 : ((b.avail > a.avail) ? -1 : 0);} );
    sortedTags = sortedTags.reverse();

    var retval = "";
    for (var k in sortedTags) {
      retval+= `${sortedTags[k].avail} "${sortedTags[k].tag}"`;
      retval += k < sortedTags.length - 1 ? ", " : "";
    }
    return retval;
  }
  
  getTotalSoldRewards = (offered) => {
    return offered.filter(offer => offer.ownerId > 0).reduce((acc, offer) => {
      return acc + offer.quantity;
    }, 0);
  }

  getTotalSoldKarma = (offered) => {
    return offered.filter(offer => offer.ownerId > 0).reduce((acc, offer) => {
      return acc + offer.cost;
    }, 0);
  }

  render() {
    const { t } = this.props;
    return (
      <Grid>
        <Row>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                {t('Home')}
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  <Col md={8}>
                    {t('Howdy,')} <b>{ this.getName(this.props.user) }</b>
                    { false && JSON.stringify(this.props.user)}
                    <div>
                      <i>{ this.props.user.email }</i>
                    </div>
                    { this.props.user.handle &&
                    <div>
                      <i>@{ this.props.user.handle}</i>
                    </div> }
                    <div>
                      {t('You have')} { this.props.user.givable } {t('karma available to give.')}
                    </div>
                    {t('You have')} { this.totalSpendable() } {t('karma to spend.')} ({ this.karmaBreakdown() })
                  </Col>
                  { this.props.user.providerData && this.props.user.providerData.length > 0 && this.props.user.providerData[0].photoURL &&
                  <Col md={4}>
                    <img alt="avatar" style={{float:"right"}} width={64} height={64} src={this.props.user.providerData[0].photoURL}/>
                  </Col> }
                </Row>
                <hr/>
                <Row>
                  { !this.props.user.handle &&
                  <Col md={4}>
                    <Button bsStyle="info" type="submit" onClick={this.addTwitter}>{t('Add Twitter')}</Button>
                  </Col> }

                  { this.props.user.email &&
                  (this.props.user.handle || JSON.parse(localStorage.getItem("additionalTwitterInfo") || '{}').username ||
                   (this.props.user.providerData.length > 0 && this.props.user.providerData[0].providerId==="twitter.com")) &&
                  <Col md={4}>
                    <Button bsStyle="info" type="submit" onClick={this.removeTwitter}>{t('Remove Twitter')}</Button>
                  </Col> }

                  { this.props.user.uid && !this.props.user.email &&
                  <Col md={8}>
                    <form onSubmit={this.props.handleSubmit(this.addEmail)}>
                      <label htmlFor="email">{t('Email')}</label>
                      <Field name="email" component="input" type="text"/>
                      <Button bsStyle="info" type="submit">{t('Add Email')}</Button>
                    </form>
                  </Col> }

                  { this.props.user.email && this.props.user.handle &&
                  <Col md={4}>
                    <Button bsStyle="info" type="submit" onClick={this.removeEmail}>{t('Remove Email')}</Button>
                  </Col> }
                </Row>
                { false &&
                <Row>
                  <p>
                  { JSON.stringify(this.props.user) }
                  <hr/>
                  { (localStorage.getItem("additionalTwitterInfo") || '') }
                  <hr/>
                  { (localStorage.getItem("additionalEmailInfo") || '') }
                  </p>
                </Row> }
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                {t('Edit Profile')}
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  <Col md={12}>
                    <form onSubmit={this.props.handleSubmit(this.editMetadata)}>
                        <label htmlFor="name">{t('Name')}</label>
                        &nbsp;
                        <Field name="name" component="input" type="text"/>
                        <br/>
                        <label htmlFor="pref1">{t('Email Preferences')}</label>
                        <br/>
                        <Field name='kr' id='kr' component="input" type="checkbox"/>{t('Whenever you receive karma')}
                        <br/>
                        <Field name='wk' id='wk' component="input" type="checkbox"/>{t('Weekly updates, when your karma is replenished')}
                        <hr/>
                        <Button bsStyle="info" type="submit">{t('Edit')}</Button>
                    </form>
                  </Col>
                </Row>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                {t('Offered Rewards')}
              </Panel.Heading>
              <Panel.Body>
                {this.props.vendedRewards.map(reward =>
                  <RewardRow key={reward.id} reward={reward} showAvailable={true} />
                )}
                {t('You have sold')} {this.getTotalSoldRewards(this.props.vendedRewards)} {t('rewards for a total of')} {this.getTotalSoldKarma(this.props.vendedRewards)} {t('karma.')}
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                {t('Owned Rewards')}
              </Panel.Heading>
              <Panel.Body>
                {this.props.ownedRewards.map(reward =>
                  <RewardRow key={reward.id} reward={reward}/>
                )}
                {this.props.ownedRewards.length === 0 && <span>You have purchased 0 rewards.</span>}
              </Panel.Body>
            </Panel>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                {t('My Given Karma')}
              </Panel.Heading>
              <Panel.Body>
                {this.props.user.given && this.props.user.given.map((tranche, idx) =>
                  <Tranche key={idx} json={tranche}/>
                )}
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                {t('My Received Karma')}
              </Panel.Heading>
              <Panel.Body>
                {this.props.user.received && this.props.user.received.map((tranche, idx) =>
                  <Tranche key={idx} json={tranche}/>
                )}
              </Panel.Body>
            </Panel>
          </Col>
        </Row>

      </Grid>
    );
  }
}

Profile = reduxForm({
  form: 'profile',
})(Profile);

function mapStateToProps(state, ownProps) {
  var metadata = state.user.metadata || {}
  var prefs = metadata.emailPrefs || {}
  return {
    user: state.user,
    initialValues: state.user.metadata ?
    {
      name: state.user.metadata ? state.user.metadata.name : undefined,
      kr: prefs.kr !== 0,
      wk: prefs.wk !== 0
    } : undefined,
    ownedRewards: state.rewards.owned || [],
    vendedRewards: state.rewards.vended || [],
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadVendedRewards: () => dispatch(loadVendedRewards()),
    loadOwnedRewards: () => dispatch(loadOwnedRewards()),
    setLoading: (active) => dispatch(setLoading(active)),
  }
}

Profile = connect(mapStateToProps, mapDispatchToProps)(Profile);

export default withTranslation()(Profile);
