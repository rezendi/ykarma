import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './Home';
import Profile from './Profile';
import Login from './Login';
import Admin from './Admin';
import Community from './Community';
import Account from './Account';
import Vendor from './Vendor';
import Reward from './Reward';
import Give from './Give';
import Spend from './Spend';

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/' component={Home}/>
      <Route path='/profile' component={Profile}/>
      <Route path='/login' component={Login}/>
      <Route path='/admin' component={Admin}/>
      <Route path='/admin/community/new' component={Community}/>
      <Route path='/admin/community/:id' component={Community}/>
      <Route path='/community' component={Community}/>
      <Route path='/community/account/new' component={Account}/>
      <Route path='/community/account/:id' component={Account}/>
      <Route path='/community/vendor/new' component={Vendor}/>
      <Route path='/community/vendor/:id' component={Vendor}/>
      <Route path='/vendor' component={Vendor}/>
      <Route path='/vendor/reward/new' component={Reward}/>
      <Route path='/vendor/reward/:id' component={Reward}/>
      <Route path='/user' component={Account}/>
      <Route path='/user/give' component={Give}/>
      <Route path='/user/reward/:id' component={Spend}/>
    </Switch>
  </main>
)

export default Main