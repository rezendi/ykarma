import React from 'react';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import { connect } from 'react-redux'
import { fetchUser } from '../store/data/actions'

class Profile extends React.Component {

  componentDidMount() {
    this.props.fetchUser();
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
                  Howdy { this.props.user.email }
                </Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
