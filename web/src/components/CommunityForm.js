import React from 'react';
import { Redirect } from 'react-router-dom';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import { communityReducer } from '../store/data/reducer'

class CommunityForm extends React.Component {

  submitForm = async (values) => {
    console.log("Submitting form",values);
    fetch(values.id===0 ? '/communities/create' : '/communities/update', {
      method: values.id===0 ? 'POST' : 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        community: {
          id: values.id,
          metadata: {
            name: values.name,
            description: values.description
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
                {this.props.initialValues ? this.props.initialValues.name : "New Community"}
              </Panel.Heading>
              <Panel.Body>
                <form onSubmit={this.props.handleSubmit(this.submitForm)}>
                  <Row>
                    <label htmlFor="name">Community Name</label>
                    <Field name="name" component="input" type="text"/>
                  </Row>
                  <Row>
                    <label htmlFor="description">Community Description</label>
                    <Field name="description" component="input" type="text"/>
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

CommunityForm = reduxForm({
  form: 'community',
})(CommunityForm);

CommunityForm = connect(
  state => ({
    initialValues: {
      id: state.community.id || 0,
      name: state.community.metadata.name,
      description: state.community.metadata.description,
    }
  }),
  {community: communityReducer}
)(CommunityForm)

export default CommunityForm;