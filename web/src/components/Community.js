import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import CommunityForm from './CommunityForm';

class Community extends React.Component {
  state = {community: { metadata: {}}, isEditing: false}
  
  componentDidMount() {
    const { match: { params } } = this.props;
    fetch(`/communities/${params.id}`)
      .then(res => res.json())
      .then(community => this.setState({ community: community } ) && console.log(JSON.stringify(community)) );
  }

  constructor(props, context) {
    super(props, context);
    this.toggleEditing = this.toggleEditing.bind(this);
  }

  toggleEditing(e) {
    this.setState({ isEditing: !this.state.isEditing});
  }

  submitForm = async (event) => {
    event.preventDefault();
    console.log("Submitting form");
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
                <form onSubmit={this.submitForm}>
                  <Row>
                    {this.state.community.metadata.description}
                  </Row>
                  <Row>
                    <Button type="submit">Submit</Button>
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

export default Community;