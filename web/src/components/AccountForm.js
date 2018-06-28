import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import { accountReducer } from '../store/data/reducer'

class AccountForm extends React.Component {

  submitForm = async (values) => {
    console.log("Submitting form", values);
    fetch('/accounts/update', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: {
          id: values.id,
          communityId: this.props.match.params.communityId,
          urls: values.url,
          metadata: {
            name: values.name,
          }
        }
      })
    })
    .then(res => {
      if (!res.ok) {
        alert("Server error!");
      } else {
        window.location.reload();
      }
    });
  }

  render() {
    let secondRow;
    if (this.props.initialValues.id === 0) {
      secondRow =  <Row><label htmlFor="url">URL</label><Field name="url" component="input" type="text"/></Row>;
    }

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                {this.props.initialValues.name}
              </Panel.Heading>
              <Panel.Body>
                <form onSubmit={this.props.handleSubmit(this.submitForm)}>
                  <Row>
                    <label htmlFor="name">Name</label>
                    <Field name="name" component="input" type="text"/>
                  </Row>
                  {secondRow}
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

AccountForm = reduxForm({
  form: 'account',
})(AccountForm);

AccountForm = connect(
  state => ({
    initialValues: {
      id: state.account.id || 0,
      url: state.account.urls,
      name: state.account.metadata.name,
    }
  }),
  {account: accountReducer}
)(AccountForm)

export default withRouter(AccountForm);