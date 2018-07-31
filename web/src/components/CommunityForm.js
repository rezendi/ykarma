import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import { setLoading } from '../store/data/actions'
import Api from '../store/Api';

class CommunityForm extends React.Component {

  submitForm = async (values) => {
    //console.log("Submitting form", values);
    this.props.setLoading(true);
    Api.upsertCommunity(values).then((res) => {
      this.props.setLoading(false);
      if (!res.ok) {
        alert("Server error!");
      } else {
        res.json().then(json => {
          json.success ? this.props.history.push('/admin') : alert("Server failure! " + JSON.stringify(json));
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

function mapDispatchToProps(dispatch) {
  return {
    setLoading: (active) => dispatch(setLoading(active)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommunityForm);
