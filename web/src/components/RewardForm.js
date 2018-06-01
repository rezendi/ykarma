import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Row, Col, Panel, FormControl, Button, Alert } from 'react-bootstrap';

class RewardForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.state = {
      id: 0,
      vendorId: 0,
      ownerId: 0,
      cost: 0,
      tags: [],
      metadata: {},
    };
  }

  handleNameChange(e) {
    this.setState({ metadata: {'name':e.target.name} });
  }

  submitForm = async (event) => {
    event.preventDefault();
    console.log("Submitting form");
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                New Reward
              </Panel.Heading>
              <Panel.Body>
                <form onSubmit={this.submitForm}>
                  <Row>
                    <FormControl type="text" value={this.state.name} placeholder="Enter reward name" onChange={this.handleNameChange} />
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

export default RewardForm;