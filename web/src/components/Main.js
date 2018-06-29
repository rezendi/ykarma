import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './Home';
import Profile from './Profile';
import Login from './Login';
import FinishSignIn from './FinishSignIn';
import SignOut from './SignOut';
import Admin from './Admin';
import Community from './Community';
import CommunityForm from './CommunityForm';
import Account from './Account';
import Reward from './Reward';
import RewardForm from './RewardForm';
import Spend from './Spend';

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/' component={Home}/>
      <Route exact path='/login' component={Login}/>
      <Route exact path='/finishSignIn' component={FinishSignIn}/>
      <Route exact path='/signOut' component={SignOut}/>
      <Route exact path='/profile' component={Profile}/>
      <Route exact path='/admin' component={Admin}/>
      <Route exact path='/community/new' component={CommunityForm}/>
      <Route exact path='/community/:id' component={Community}/>
      <Route exact path='/account/:id' component={Account}/>
      <Route exact path='/reward/new' component={RewardForm}/>
      <Route exact path='/reward/:id' component={Reward}/>
      <Route exact path='/user' component={Account}/>
      <Route exact path='/user/rewards' component={Spend}/>
    </Switch>
  </main>
)

export default Main