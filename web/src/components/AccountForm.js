import React from 'react';
import { Grid, Row, Col, Panel, FormControl, Button } from 'react-bootstrap';

class AccountForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleURLsChange = this.handleURLsChange.bind(this);
    const { match: { params } } = this.props;
    this.state = {
      redirect: false,
      account: props.accountFromParent || {
        id: 0,
        communityId: params.communityId,
        userAddress: '',
        metadata: {},
        urls: '',
        rewardIds: [],
      }
    };
  }

  handleNameChange(e) {
    var metadata = Object.assign(this.state.account.metadata, {});
    metadata.name = e.target.value;
    this.setState({ account: { ...this.state.account, metadata: metadata} });
  }

  handleURLsChange(e) {
    this.setState({ account: { ...this.state.account, urls: e.target.value} });
  }

  submitForm = async (event) => {
    event.preventDefault();
    console.log("Submitting form");
    fetch(this.state.account.id===0 ? '/accounts/create' : '/accounts/update', {
      method: this.state.account.id===0 ? 'POST' : 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: this.state.account
      })
    })
    .then(res => {
      if (res.ok) {
        this.setState({ redirect:true });
      } else {
        alert("Server error!");
      }
    });
  }


  render() {
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                New Account
              </Panel.Heading>
              <Panel.Body>
                <form onSubmit={this.submitForm}>
                  <Row>
                    <FormControl type="text" value={this.state.account.metadata.name} placeholder="Enter account name" onChange={this.handleNameChange} />
                  </Row>
                  <Row>
                    <FormControl type="text" value={this.state.account.metadata.urls} placeholder="Enter URLs" onChange={this.handleURLsChange} />
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

export default AccountForm;