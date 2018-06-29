import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';

class CommunityForm extends React.Component {

  submitForm = async (values) => {
    console.log("Submitting form", values);
    fetch(values.id===0 ? '/communities/create' : '/communities/update', {
      method: values.id===0 ? 'POST' : 'PUT',
      credentials: 'include',
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
      } else {
        res.json().then((json) => {
          if (json.success) {
            values.id===0 ? this.props.history.push('/admin') : window.location.reload();
          } else {
            alert("Server failure! " + JSON.stringify(json));
          }
        });
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

function mapStateToProps(state, ownProps) {
  return {
    initialValues: {
      id: ownProps.community ? ownProps.community.id : 0,
      name: ownProps.community ? ownProps.community.metadata.name : '',
      description: ownProps.community ? ownProps.community.metadata.description : '',
    }
  };
}

export default connect(mapStateToProps, null)(CommunityForm);
