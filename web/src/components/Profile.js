import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import * as firebase from 'firebase'
import { auth } from '../firebase';
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
    console.log("Submitting form", values);
    this.props.setLoading(true);
    Api.updateAccount(this.props.user.ykid, values).then((res) => {
      this.props.setLoading(false);
      !res.ok ? alert("Server error!") : window.location.reload();
    });
  }

  render() {
    if (!this.props.user.uid || !this.props.user.metadata) {
      return (<div>Loading...</div>)
    }
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
                    Howdy, <b>{ this.props.user.metadata.name || this.props.user.displayName || "Nameless One" }</b>
                    { false && JSON.stringify(this.props.user)}
                    <div>
                      { this.props.user.email}
                    </div>
                    { this.props.user.handle &&
                    <div>
                      @{ this.props.user.handle}
                    </div> }
                  </Col>
                  { this.props.user.providerData.length > 0 && this.props.user.providerData[0].photoURL &&
                  <Col md={4}>
                    <img style={{float:"right"}} src={this.props.user.providerData[0].photoURL}/>
                  </Col> }
                </Row>
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
                        <Field name="name" component="input" type="text"/>
                        <Button bsStyle="info" type="submit">Edit</Button>
                    </form>
                  </Col>
                </Row>
                <hr/>
                <Row>
                  <Col md={12}>
                    { !this.props.user.handle && <Button bsStyle="info" type="submit" onClick={this.addTwitter}>Add Twitter</Button> }
                    { this.props.user.email &&
                    (this.props.user.handle || JSON.parse(localStorage.getItem("additionalTwitterInfo") || '{}').username) &&
                    <Button type="submit" onClick={this.removeTwitter}>Remove Twitter</Button> }
                    { !this.props.user.email &&
                    <form onSubmit={this.props.handleSubmit(this.addEmail)}>
                      <label htmlFor="email">Email</label>
                      <Field name="email" component="input" type="text"/>
                      <Button bsStyle="info" type="submit">Add Email</Button>
                    </form> }
                      </Col>
                </Row>
                { this.props.user.email && this.props.user.handle &&
                <Row>
                  <Col md={12}>
                    <Button bsStyle="info" type="submit" onClick={this.removeEmail}>Remove Email</Button>
                  </Col>
                </Row> }
                { false &&
                <Row>
                  <p>
                  { JSON.stringify(this.props.user) }
                  &nbsp;
                  { (localStorage.getItem("additionalTwitterInfo") || '') }
                  &nbsp;
                  { (localStorage.getItem("additionalEmailInfo") || '') }
                  </p>
                </Row> }
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
                  <RewardRow reward={reward} showAvailable={true} />
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
                  <RewardRow reward={reward}/>
                )}
              </Panel.Body>
            </Panel>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                My Received
              </Panel.Heading>
              <Panel.Body>
                {this.props.user.received.map((tranche, idx) =>
                  <Tranche idx={idx} json={tranche}/>
                )}
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                My Giving
              </Panel.Heading>
              <Panel.Body>
                {this.props.user.given.map((tranche, idx) =>
                  <Tranche idx={idx} json={tranche}/>
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

Profile = connect(
  state => ({
    initialValues: state.user.metadata
  }),
)(Profile)

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
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
