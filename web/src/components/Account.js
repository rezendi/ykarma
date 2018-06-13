import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import AccountForm from './AccountForm';

class Account extends React.Component {
  state = {account: { metadata: {}}, isEditing: false}
  
  componentDidMount() {
    const { match: { params } } = this.props;
    fetch(`/accounts/${params.id}`)
      .then(res => res.json())
      .then(account => this.setState({ account: account } ) && console.log(JSON.stringify(account)) );
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
        <AccountForm accountFromParent = {this.state.account}/>
      );
    }
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                {this.state.account.metadata.name} <Button bsStyle="link" onClick={this.toggleEditing}>edit</Button>
              </Panel.Heading>
              <Panel.Body>
                <form onSubmit={this.submitForm}>
                  <Row>
                    {this.state.account.metadata.description}
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

export default Account