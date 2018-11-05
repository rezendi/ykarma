import React from 'react';
import { connect } from 'react-redux'
import { Switch, Route, withRouter } from 'react-router-dom';
import Home from './Home';
import Profile from './Profile';
import Login from './Login';
import FinishSignIn from './FinishSignIn';
import LinkEmail from './LinkEmail';
import SignOut from './SignOut';
import Admin from './Admin';
import Community from './Community';
import CommunityForm from './CommunityForm';
import Account from './Account';
import Reward from './Reward';
import RewardForm from './RewardForm';
import Rewards from './Rewards';
import Loadable from 'react-loading-overlay';
import GA from '../utils/GoogleAnalytics'

class Main extends React.Component {

  render() {
    return (
      <main>
        { GA.init() && <GA.RouteTracker /> }
        <Switch>
          <Loadable active={this.props.loading} color={'red'} background='white' spinner={true} animate={true} text={'Stacking another block on the chain...'} >
            <Route exact path='/' component={Home}/>
            <Route exact path='/login' component={Login}/>
            <Route exact path='/finishSignIn' component={FinishSignIn}/>
            <Route exact path='/linkEmail' component={LinkEmail}/>
            <Route exact path='/signOut' component={SignOut}/>
            <Route exact path='/profile' component={Profile}/>
            <Route exact path='/admin' component={Admin}/>
            <Route exact path='/community/new' component={CommunityForm}/>
            <Route exact path='/community/:id' component={Community}/>
            <Route exact path='/community' component={Community}/>
            <Route exact path='/account/:id' component={Account}/>
            <Route exact path='/user' component={Account}/>
            <Route exact path='/reward/new' component={RewardForm}/>
            <Route exact path='/reward/:id' component={Reward}/>
            <Route exact path='/user/rewards' component={Rewards}/>
          </Loadable>
        </Switch>
      </main>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    loading: state.loading,
  }
}

Main = connect(mapStateToProps, null)(Main);

export default withRouter(Main)
