import React from 'react';
import { Grid, Row, Col, Panel, FormControl, Button } from 'react-bootstrap';

class VendorForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.state = {
      id: 0,
      communityId: 0,
      vendorAddress: '',
      metadata: {},
      rewards: [],
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
                New Vendor
              </Panel.Heading>
              <Panel.Body>
                <form onSubmit={this.submitForm}>
                  <Row>
                    <FormControl type="text" value={this.state.name} placeholder="Enter vendor name" onChange={this.handleNameChange} />
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

export default VendorForm;