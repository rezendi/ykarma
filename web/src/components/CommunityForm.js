import React from 'react';
import { Grid, Row, Col, Panel, FormControl, Button } from 'react-bootstrap';

class CommunityForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.state = {
      community: {
        id: 0,
        adminAddress: '',
        isClosed: false,
        domain: '',
        metadata: { name: '', description:''},
        tags: [],
        accounts: [],
      }
    };
  }

  handleNameChange(e) {
    var metadata = Object.assign(this.state.community.metadata, {});
    metadata.name = e.target.value;
    this.setState({ community: { ...this.state.community, metadata: metadata} });
  }

  handleDescriptionChange(e) {
    var metadata = Object.assign(this.state.community.metadata, {});
    metadata.description = e.target.value;
    this.setState({ community: { ...this.state.community, metadata: metadata} });
  }

  submitForm = async (event) => {
    event.preventDefault();
    console.log("Submitting form");
    fetch('/communities/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        community: this.state.community
      })
    })
    .then(res => res.json())
    .then(community => this.setState({ community }));
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                {this.state.community.metadata.name ? this.state.community.metadata.name : "New Community"}
              </Panel.Heading>
              <Panel.Body>
                <form onSubmit={this.submitForm}>
                  <Row>
                    <FormControl type="text" value={this.state.community.name} placeholder="Enter community name" onChange={this.handleNameChange} />
                  </Row>
                  <Row>
                    <FormControl type="text" value={this.state.community.description} placeholder="Enter community description" onChange={this.handleDescriptionChange} />
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

export default CommunityForm;