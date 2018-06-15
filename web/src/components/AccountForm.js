import React from 'react';
import { Redirect } from 'react-router-dom';
import { Grid, Row, Col, Panel, FormControl, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import { accountReducer } from '../store/data/reducer'

class AccountForm extends React.Component {

  submitForm = async (values) => {
    console.log("Submitting form", values);
    fetch(values.id===0 ? '/accounts/create' : '/accounts/update', {
      method: values.id===0 ? 'POST' : 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: {
          id: values.id,
          communityId: values.communityId,
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
                {this.props.initialValues ? this.props.initialValues.name : "New Account"}
              </Panel.Heading>
              <Panel.Body>
                <form onSubmit={this.props.handleSubmit(this.submitForm)}>
                  <Row>
                    <label htmlFor="name">Name</label>
                    <Field name="name" component="input" type="text"/>
                  </Row>
                  <Row>
                    <label htmlFor="url">URL</label>
                    <Field name="url" component="input" type="text"/>
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

AccountForm = reduxForm({
  form: 'account',
})(AccountForm);

AccountForm = connect(
  state => ({
    initialValues: {
      id: state.account.id || 0,
      communityId: state.account.communityId || 0,
      url: state.account.urls,
      name: state.account.metadata.name,
    }
  }),
  {account: accountReducer}
)(AccountForm)

export default AccountForm;