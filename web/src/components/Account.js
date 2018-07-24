import React from 'react';
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { loadAccount } from '../store/data/actions'
import AccountForm from './AccountForm';

class Account extends React.Component {
  componentDidMount() {
    this.props.loadAccount(this.props.match.params.id);
    this.setState({editing: false});
  }
  
  toggleEditing = () => {
    this.setState({editing: this.state.editing ? false : true});
  }

  render() {
   if (this.props.account.id === undefined) {
      return (
        <div>Loading...</div>
      );
    }
    if (this.state && this.state.editing) {
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
                {this.props.account.metadata.name} <Button bsStyle="link" onClick={this.toggleEditing}>edit</Button>
              </Panel.Heading>
              <Panel.Body>
                <Row>
                  {this.props.account.metadata.description}
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
    account: state.account
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadAccount: (accountId) => dispatch(loadAccount(accountId)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Account);
