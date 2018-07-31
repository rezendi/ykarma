import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import { accountReducer } from '../store/data/reducer'
import { setLoading } from '../store/data/actions'
import Api from '../store/Api';

class AccountForm extends React.Component {

  submitForm = (values) => {
    //console.log("Submitting form", values);
    this.props.setLoading(true);
    Api.updateAccount(values).then((res) => {
      if (!res.ok) {
       this.props.setLoading(false);
       return alert("Server error!");
      }
      res.json().then((json) => {
        this.props.setLoading(false);
        if (json.success) {
          window.location.reload();
        } else {
          alert("Server failure! " + JSON.stringify(json));
        }
      });
    });
  }

  render() {
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

function mapStateToProps(state, ownProps) {
  return { initialValues: {
      id: state.account.id || 0,
      url: state.account.urls,
      name: state.account.metadata.name,
    }
  }
}

function mapDispatchToProps(dispatch) {
  return {
    account: accountReducer,
    setLoading: (active) => dispatch(setLoading(active)),
  }
}

AccountForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountForm)

export default withRouter(AccountForm);