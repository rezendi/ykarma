import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import * as firebase from 'firebase'
import Api from '../store/Api';

class Profile extends React.Component {

  addTwitter = () => {
    var provider = new firebase.auth.TwitterAuthProvider();
    firebase.auth().currentUser.linkWithPopup(provider).then(function(result) {
      localStorage.setItem("additionalUserInfo", JSON.stringify(result.additionalUserInfo));
      Api.addTwitterHandle(result.additionalUserInfo.username).then(() => {
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
      Api.removeTwitterHandle().then(() => {
        window.location.reload();
      });
    }).catch(function(error) {
      var errorMessage = error.message;
      console.log("twitter error", errorMessage);
    });
  }
  
  addEmail = async (values) => {
    console.log("Adding email", values);
  }

  removeEmail = () => {
    console.log("Removing email");
  }

  render() {
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
                  Howdy { JSON.stringify(this.props.user) }
                </Row>
                <Row>
                  <Button type="submit" onClick={this.addTwitter}>Add Twitter</Button>
                  <Button type="submit" onClick={this.removeTwitter}>Remove Twitter</Button>
                </Row>
                <form onSubmit={this.props.handleSubmit(this.addEmail)}>
                  <Row>
                    <label htmlFor="email">Email</label>
                    <Field name="email" component="input" type="text"/>
                    <Button type="submit">Submit</Button>
                  </Row>
                </form>
                <Row>
                  <Button type="submit" onClick={this.removeEmail}>Remove Email</Button>
                </Row>
                <Row>
                  Also { localStorage.getItem("additionalUserInfo") } and localStorage.getItem("additionalEmailInfo")
                </Row>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
  }
}

Profile = reduxForm({
  form: 'profile',
})(Profile);

export default connect(mapStateToProps, null)(Profile);
