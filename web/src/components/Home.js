import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form';
import { fetchUser } from '../store/data/actions'

class Home extends React.Component {

  componentDidMount() {
    this.props.fetchUser();
  }
  
  submitForm = async (values) => {
    console.log("Submitting form", values);
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                Home
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  Howdy { this.props.user.email } { this.props.user.ykid } { this.props.user.givable } { this.props.user.spendable }
                </Row>
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={6}>
            <Panel>
              <Panel.Heading>
                Give
              </Panel.Heading>
              <Panel.Body>
                <form onSubmit={this.props.handleSubmit(this.submitForm)}>
                  <Row>
                    <Field name="coins" component="input" type="text" placeholder="Number of coins"/>
                    <label htmlFor="coins">coins</label>
                  </Row>
                  <Row>
                    <label htmlFor="email">to</label>
                    <Field name="email" component="input" type="text" placeholder="Recipient's email address"/>
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

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchUser: () => dispatch(fetchUser()),
  }
}

Home = reduxForm({
  form: 'give',
})(Home);


export default connect(mapStateToProps, mapDispatchToProps)(Home);
