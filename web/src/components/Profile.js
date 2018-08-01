import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router-dom';
import * as firebase from 'firebase'
import { auth } from '../firebase';
import { loadMyRewards, setLoading } from '../store/data/actions'
import Api from '../store/Api';

class Profile extends React.Component {

  addTwitter = () => {
    var provider = new firebase.auth.TwitterAuthProvider();
    firebase.auth().currentUser.linkWithPopup(provider).then(function(result) {
      localStorage.setItem("additionalUserInfo", JSON.stringify(result.additionalUserInfo));
      Api.addUrl(result.additionalUserInfo.username).then(() => {
        window.location.reload();
      });
    }).catch(function(error) {
      var errorMessage = error.message;
      console.log("twitter error", errorMessage);
    });
  }

  removeTwitter = () => {
    firebase.auth().currentUser.unlink("twitter.com").then(function(result) {
      localStorage.setItem("additionalUserInfo", "{}");
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
    Api.updateAccount(values).then((res) => {
      this.props.setLoading(false);
      !res.ok ? alert("Server error!") : window.location.reload();
    });
  }

  render() {
    if (!this.props.user.uid) {
      return (<div>Loading...</div>)
    }
    if (this.props.myRewards.length === 0 && !this.loadedRewards) {
      this.props.loadMyRewards();
      this.loadedRewards = true;
    }
    const myRewards = this.props.myRewards || [];
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                Home
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  Howdy <b>{ this.props.user.metadata.name || this.props.user.displayName || "Nameless One" }</b>
                  <p>
                  { JSON.stringify(this.props.user) }
                  </p>
                  <p>
                  { localStorage.getItem("additionalUserInfo") }
                  &nbsp;
                  { localStorage.getItem("additionalEmailInfo") }
                  </p>
                </Row>
              </Panel.Body>
            </Panel>

            <Panel>
              <Panel.Heading>
                Edit Profile
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  { !this.props.user.handle && <Button type="submit" onClick={this.addTwitter}>Add Twitter</Button> }
                  { this.props.user.email && this.props.user.handle &&
                  <Button type="submit" onClick={this.removeTwitter}>Remove Twitter</Button> }
                </Row>
                { !this.props.user.email &&
                <form onSubmit={this.props.handleSubmit(this.addEmail)}>
                  <Row>
                    <label htmlFor="email">Email</label>
                    <Field name="email" component="input" type="text"/>
                    <Button type="submit">Submit</Button>
                  </Row>
                </form> }
                { this.props.user.email && this.props.user.handle &&
                <Row>
                  <Button type="submit" onClick={this.removeEmail}>Remove Email</Button>
                </Row> }
                <Row>
                  Edit Metadata
                </Row>
                <form onSubmit={this.props.handleSubmit(this.editMetadata)}>
                  <Row>
                    <label htmlFor="name">Name</label>
                    <Field name="name" component="input" type="text"/>
                    <Button type="submit">Submit</Button>
                  </Row>
                </form>
              </Panel.Body>
            </Panel>

            <Panel>
              <Panel.Heading>
                My Rewards
              </Panel.Heading>
              <Panel.Body>
                {myRewards.map(reward =>
                  <Row key={reward.id}>
                    <Link to={`/reward/${reward.id}`}>{reward.metadata.name || 'n/a'}</Link>
                    <span> {reward.metadata.description} {reward.cost} {reward.quantity}</span>
                  </Row>
                )}
              </Panel.Body>
            </Panel>

            <Panel>
              <Panel.Heading>
                My Giving
              </Panel.Heading>
              <Panel.Body>
                {this.props.user.given.map((tranche, idx) =>
                  <Row key={"gift"+idx}>
                    {JSON.stringify(tranche)}
                  </Row>
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
    myRewards: state.myRewards || [],
    myGifts: state.myGifts || [],
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadMyRewards: () => dispatch(loadMyRewards()),
    setLoading: (active) => dispatch(setLoading(active)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
