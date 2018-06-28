import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import CommunityForm from './CommunityForm';
import { connect } from 'react-redux'
import { loadCommunity, loadAccountsFor, toggleEditing } from '../store/data/actions'

class Community extends React.Component {
  
  componentDidMount() {
    this.props.loadCommunity(this.props.match.params.id);
    this.props.loadAccountsFor(this.props.match.params.id);
  }

  render() {
    if (this.props.community === undefined || this.props.accounts === undefined) {
      return (
        <div>Loading...</div>
      );
    }
    if (this.props.community.metadata === undefined) {
      return (
        <div>Server error...</div>
      );
    }
    if (this.props.editing) {
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
                {this.props.community.metadata.name} <Button bsStyle="link" onClick={this.props.toggleEditing}>edit</Button>
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  {this.props.community.metadata.description} ({this.props.accounts.length} accounts)
                </Row>
                {this.props.accounts.map(account =>
                  <Row key={account.id}>
                    <Link to={`/account/${account.id}`}>{account.metadata.name || account.metadata.email}</Link>
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

function mapStateToProps(state, ownProps) {
  return {
    editing: state.editing,
    community: state.community,
    accounts: state.accounts
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadCommunity: (communityId) => dispatch(loadCommunity(communityId)),
    loadAccountsFor: (communityId) => dispatch(loadAccountsFor(communityId)),
    toggleEditing: () => dispatch(toggleEditing()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Community);
