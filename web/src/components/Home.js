import React, { Component } from 'react';
import './App.css';
import { Grid, Row, Col, Panel, FormControl, Button, Alert } from 'react-bootstrap';

class Home extends Component {
  state = {users: []}
  
  componentDidMount() {
    fetch('/users')
      .then(res => res.json())
      .then(users => this.setState({ users }));
  }
  
  render() {
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                Users
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  {this.state.users.map(user =>
                    <Col md={3} key={user.id}>
                      User {user.username}
                    </Col>
                  )}
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
