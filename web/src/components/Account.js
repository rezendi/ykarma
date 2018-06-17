import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { loadAccount, toggleEditing } from '../store/data/actions'
import AccountForm from './AccountForm';

class Account extends React.Component {
  componentDidMount() {
    this.props.loadAccount(this.props.match.params.id);
  }

  render() {
   if (this.props.account === undefined) {
      return (
        <div>Loading...</div>
      );
    }
   if (this.props.account.metadata === undefined) {
      return (
        <div>Server error...</div>
      );
    }
    if (this.props.editing) {
      return (
        <AccountForm account = {this.props.account}/>
      );
    }
    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                {this.props.account.metadata.name} <Button bsStyle="link" onClick={this.props.toggleEditing}>edit</Button>
              </Panel.Heading>
              <Panel.Body>
                <form onSubmit={this.submitForm}>
                  <Row>
                    {this.props.account.metadata.description}
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
    editing: state.editing,
    account: state.account
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadAccount: (accountId) => dispatch(loadAccount(accountId)),
    toggleEditing: () => dispatch(toggleEditing()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Account);
