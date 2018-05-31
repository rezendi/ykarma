import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => (
  <header>
    <nav>
      <ul>
        <li><Link to='/'>Home</Link></li>
        <li><Link to='/login'>Login</Link></li>
        <li><Link to='/profile'>Profile</Link></li>
        <li><Link to='/admin'>Admin</Link></li>
        <li><Link to='/admin/community/new'>New Community</Link></li>
        <li><Link to='/admin/community/:id'>Community</Link></li>
        <li><Link to='/community'>Community Admin</Link></li>
        <li><Link to='/community/account/new'>New Account</Link></li>
        <li><Link to='/community/account/:id'>Account</Link></li>
        <li><Link to='/community/vendor/new'>New Vendor</Link></li>
        <li><Link to='/community/vendor/:id'>Vendor</Link></li>
        <li><Link to='/vendor'>Vendor Admin</Link></li>
        <li><Link to='/vendor/reward/new'>New Reward</Link></li>
        <li><Link to='/vendor/reward/:id'>Reward</Link></li>
        <li><Link to='/user'>User Dashboard</Link></li>
        <li><Link to='/user/give'>Give</Link></li>
        <li><Link to='/user/reward/:id'>Spend</Link></li>
      </ul>
    </nav>
  </header>
)

export default Header