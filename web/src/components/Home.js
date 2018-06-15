import React from 'react';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import { connect } from 'react-redux'
import { auth } from '../firebase'

class Home extends React.Component {
  
  // TODO Reduxify the user state
  componentDidMount() {
      auth.getUser().then((user) => {
      if (user) {
        this.setState({user: user});
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
                Home
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  Howdy { this.state && this.state.user ? this.state.user.email : ""}
                </Row>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default Home;
