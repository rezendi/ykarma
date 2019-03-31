import React from 'react';
import { connect } from 'react-redux'
import { Grid, Row, Col, Panel, Button } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import { withTranslation } from 'react-i18next';
import { loadCommunity, loadAccountsFor, setLoading } from '../store/data/actions'
import CommunityForm from './CommunityForm';
import CommunityMember from './CommunityMember';
import Api from '../store/Api';

class Community extends React.Component {
  
  submitForm = async (formValues) => {
    console.log("Submitting form", formValues);
    var values = {};
    for (var key in formValues) {
      const pieces = key.split("-");
      const newKey = pieces[1];
      var innerDict = values[newKey] || {};
      innerDict[pieces[0]] = formValues[key];
      values[newKey] = innerDict;
    }

    for (var key2 in values) {
      var args = {
        // FIXME note incredibly ugly hack because no dots allowed in forms, see also CommunityMember.js
        recipient: key2.replace("|||","."),
        coins: values[key2]['coins'],
        message: values[key2]['message'],
      }

      var callbacks = 0;
      this.props.setLoading(true);
      // eslint-disable-next-line
      Api.giveKarma(this.props.user.ykid, args).then((res) => {
        console.log("res", res);
        if (++callbacks === Object.keys(values).length) {
          this.props.setLoading(false);
          res.ok ? window.location = "/" : alert("Server error!");
        }
      });
    }
  }

  componentDidMount() {
    const communityId = this.props.match.params.id;
    this.props.loadCommunity(communityId);
    this.props.loadAccountsFor(communityId);
    this.setState({editing: false});
  }

  toggleEditing = () => {
    if (!this.props.user.isAdmin) return;
    this.setState({editing: this.state.editing ? false : true});
  }

  render() {
    const { t } = this.props;
    if ((this.props.community === undefined || this.props.accounts === undefined) && this.props.user === undefined) {
      return (
        <div>{t('Loading…')}</div>
      );
    }
    if (this.props.community.metadata === undefined) {
      return (
        <div>{t('Server error…')}.</div>
      );
    }
    if (this.state && this.state.editing) {
      return (
        <CommunityForm community = {this.props.community} />
      );
    }

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                {this.props.community.metadata.name}
                {this.props.user.isAdmin && <Button bsStyle="link" onClick={this.toggleEditing}>edit</Button>}
                &nbsp; &nbsp;
                {this.props.accounts.length} {t('members')}
              </Panel.Heading>
              <Panel.Body>
                <Row><Col md={12}>
                  {this.props.community.metadata.description}
                </Col></Row>
                <Row><Col md={12}>
                  {t('You have')} { this.props.user.givable } {t('karma available to give')}
                  <hr/>
                </Col></Row>
                <form onSubmit={this.props.handleSubmit(this.submitForm)}>
                  {this.props.accounts.sort((a,b) => { return a.id < b.id }).map((account,idx) =>
                    <CommunityMember key={idx} member={account} senderId={this.props.user.ykid}/>
                  )}
                  <Row>
                    <hr/>
                  </Row>
                  <Row>
                    <Col md={8}>&nbsp;</Col>
                    <Col md={4}><input type="submit" value="Give"/></Col>
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
    user: state.user,
    community: state.community,
    accounts: state.accounts,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadCommunity: (communityId) => dispatch(loadCommunity(communityId)),
    loadAccountsFor: (communityId) => dispatch(loadAccountsFor(communityId)),
    setLoading: (active) => dispatch(setLoading(active)),
  }
}

Community = reduxForm({
  form: 'community-give',
})(Community);


const connected = connect(mapStateToProps, mapDispatchToProps)(Community);
export default withTranslation()(connected);
