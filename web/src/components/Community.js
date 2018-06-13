import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import CommunityForm from './CommunityForm';

class Community extends React.Component {
  state = {community: { metadata: {}}, accounts: [], isEditing: false}
  
  componentDidMount() {
    const { match: { params } } = this.props;
    fetch(`/communities/${params.id}`)
      .then(res => res.json())
      .then(community => this.setState({ community: community } ) && console.log("community", JSON.stringify(community)) );
    fetch(`/accounts/for/${params.id}`)
      .then(res => res.json())
      .then(accounts => this.setState({ accounts: accounts } ) && console.log("accounts", JSON.stringify(accounts)) );
  }

  constructor(props, context) {
    super(props, context);
    this.toggleEditing = this.toggleEditing.bind(this);
  }

  toggleEditing(e) {
    this.setState({ isEditing: !this.state.isEditing});
  }

  render() {
    if (this.state.isEditing) {
      return (
        <CommunityForm communityFromParent = {this.state.community}/>
      );
    }
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                {this.state.community.metadata.name} <Button bsStyle="link" onClick={this.toggleEditing}>edit</Button>
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  {this.state.community.metadata.description}
                </Row>
                {this.state.accounts.map((account, index) => {
                  <Row>
                    <Link to={`/account/${account.id}`}>{account.metadata.name}</Link>
                  </Row>
                })}
              <Row>
                <Link to={`/account/for/${this.state.community.id}/new`}>New Account</Link>
              </Row>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default Community;