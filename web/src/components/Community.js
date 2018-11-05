import React from 'react';
import { connect } from 'react-redux'
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import { loadCommunity, loadAccountsFor, setLoading } from '../store/data/actions'
import CommunityForm from './CommunityForm';
import CommunityMember from './CommunityMember';

class Community extends React.Component {
  
  submitForm = async (values) => {
    console.log("Submitting form", values);
    //this.props.setLoading(true);
    /*
    Api.giveKarma(this.props.user.ykid, values).then((res) => {
      this.props.setLoading(false);
      res.ok ? window.location.reload() : alert("Server error!");
    });
    */
  }

  componentDidMount() {
    const communityId = this.props.match.params.id;
    this.props.loadCommunity(communityId);
    this.props.loadAccountsFor(communityId);
    this.setState({editing: false});
  }

  toggleEditing = () => {
    if (!this.props.user.isAdmin) return;
    this.setState({editing: this.state.editing ? false : true});
  }

  render() {
    if ((this.props.community === undefined || this.props.accounts === undefined) && this.props.user === undefined) {
      return (
        <div>Loading...</div>
      );
    }
    if (this.props.community.metadata === undefined) {
      return (
        <div>Server error...</div>
      );
    }
    if (this.state && this.state.editing) {
      return (
        <CommunityForm community = {this.props.community} />
      );
    }

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                {this.props.community.metadata.name}
                {this.props.user.isAdmin && <Button bsStyle="link" onClick={this.toggleEditing}>edit</Button>}
                &nbsp; &nbsp;
                {this.props.accounts.length} members
              </Panel.Heading>
              <Panel.Body>
                <Row><Col md={12}>
                  {this.props.community.metadata.description}
                </Col></Row>
                <Row><Col md={12}>
                  You have { this.props.user.givable } karma available to give.
                  <hr/>
                </Col></Row>
                <form onSubmit={this.props.handleSubmit(this.submitForm)}>
                  {this.props.accounts.map((account,idx) =>
                    <CommunityMember key={idx} member={account} senderId={this.props.user.ykid}/>
                  )}
                  <Row>
                    <Col md={8}>&nbsp;</Col>
                    <Col md={4}><input type="submit" value="Give"/></Col>
                  </Row>
                </form>
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
    editing: state.editing,
    user: state.user,
    community: state.community,
    accounts: state.accounts,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadCommunity: (communityId) => dispatch(loadCommunity(communityId)),
    loadAccountsFor: (communityId) => dispatch(loadAccountsFor(communityId)),
    setLoading: (active) => dispatch(setLoading(active)),
  }
}

Community = reduxForm({
  form: 'community-give',
})(Community);


export default connect(mapStateToProps, mapDispatchToProps)(Community);
