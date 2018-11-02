import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
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
    firebase.auth().currentUser.linkWithPopup(provider).then(function(result) {
      console.log("result", result);
      localStorage.setItem("additionalTwitterInfo", JSON.stringify(result.additionalUserInfo));
      Api.addUrl(result.additionalUserInfo.username).then(() => {
        window.location.reload();
      });
    }).catch(function(error) {
      var errorMessage = error.message;
      console.log("twitter error", errorMessage);
      alert("Error: " + errorMessage);
    });
  }

  removeTwitter = () => {
    firebase.auth().currentUser.unlink("twitter.com").then(function(result) {
      localStorage.setItem("additionalTwitterInfo", "{}");
      Api.removeUrl("twitter").then(() => {
        window.location.reload();
      });
    }).catch(function(error) {
      var errorMessage = error.message;
      console.log("twitter error", errorMessage);
    });
  }
  
  addEmail = async (values) => {
    auth.sendLinkToLinkEmail(values.email);
    alert("Email sent!");
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
      rw: values.rw ? 1 : 0,
      wk: values.wk ? 1 : 0,
      mt: values.mt ? 1 : 0
    };
    console.log("Submitting form", toSubmit);
    this.props.setLoading(true);
    Api.updateAccount(this.props.user.ykid, toSubmit).then((res) => {
      this.props.setLoading(false);
      !res.ok ? alert("Server error!") : window.location.reload();
    });
  }

  editEmailPrefs = async (values) => {
    console.log("Submitting email prefs form", JSON.stringify(values));
  }

  getName = (user) => {
    if (!user || !user.uid)
      return "Nameless One";
    if (!user.metadata || !user.metadata.name)
      return user.displayName || "Nameless One";
    return user.metadata.name;
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                Home
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  <Col md={8}>
                    Howdy, <b>{ this.getName(this.props.user) }</b>
                    { false && JSON.stringify(this.props.user)}
                    <div>
                      <i>{ this.props.user.email }</i>
                    </div>
                    { this.props.user.handle &&
                    <div>
                      <i>@{ this.props.user.handle}</i>
                    </div> }
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
                    <Button bsStyle="info" type="submit" onClick={this.addTwitter}>Add Twitter</Button>
                  </Col> }

                  { this.props.user.email &&
                  (this.props.user.handle || JSON.parse(localStorage.getItem("additionalTwitterInfo") || '{}').username ||
                   (this.props.user.providerData.length > 0 && this.props.user.providerData[0].providerId==="twitter.com")) &&
                  <Col md={4}>
                    <Button bsStyle="info" type="submit" onClick={this.removeTwitter}>Remove Twitter</Button>
                  </Col> }

                  { this.props.user.uid && !this.props.user.email &&
                  <Col md={8}>
                    <form onSubmit={this.props.handleSubmit(this.addEmail)}>
                      <label htmlFor="email">Email</label>
                      <Field name="email" component="input" type="text"/>
                      <Button bsStyle="info" type="submit">Add Email</Button>
                    </form>
                  </Col> }

                  { this.props.user.email && this.props.user.handle &&
                  <Col md={4}>
                    <Button bsStyle="info" type="submit" onClick={this.removeEmail}>Remove Email</Button>
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
                Edit Profile
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  <Col md={12}>
                    <form onSubmit={this.props.handleSubmit(this.editMetadata)}>
                        <label htmlFor="name">Name</label>
                        &nbsp;
                        <Field name="name" component="input" type="text"/>
                        <br/>
                        <label htmlFor="pref1">Email Preferences</label>
                        <br/>
                        <Field name='kr' id='kr' component="input" type="checkbox"/>Whenever you receive karma
                        <br/>
                        <Field name='rw' id='rw' component="input" type="checkbox"/>Whenever you create, buy, or sell a reward
                        <br/>
                        <Field name='mt' id='mt' component="input" type="checkbox"/>Weekly updates, when your karma is replenished
                        <br/>
                        <Field name='yr' id='yr' component="input" type="checkbox"/>Monthly updates
                        <br/>
                        <Button bsStyle="info" type="submit">Edit</Button>
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
                Offered Rewards
              </Panel.Heading>
              <Panel.Body>
                {this.props.vendedRewards.map(reward =>
                  <RewardRow key={reward.id} reward={reward} showAvailable={true} />
                )}
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                Owned Rewards
              </Panel.Heading>
              <Panel.Body>
                {this.props.ownedRewards.map(reward =>
                  <RewardRow key={reward.id} reward={reward}/>
                )}
              </Panel.Body>
            </Panel>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                My Given Karma
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
                My Received Karma
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
  return {
    user: state.user,
    initialValues: state.user.metadata,
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

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
