import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import CommunityForm from './CommunityForm';

class Community extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.state = {
      isEditing: false,
      community: {
        id: 0,
        adminAddress: '',
        isClosed: false,
        domain: '',
        metadata: {},
        tags: [],
        accounts: [],
      }
    };
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
        <CommunityForm community = {this.state.community}/>
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