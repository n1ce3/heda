import React, { Component }    from 'react';
import { Switch, Route, Link } from 'react-router-dom'

import HomeMenu                from './homemenu'
import Footer                  from '../createFooter.js'
import Header                  from '../createHeader.js'

import createRoutesArray       from '../createRoutes.js'


import '../../style/main.scss'

// fetch menu
var menus = require('../menuArray.json');


export default class MainMenu extends Component {

  constructor(props) {
    super(props)
    this.state = {
      routes: createRoutesArray(menus),
    }
  }

  render() {
    console.log(this.state.route);
    return(
      <main>
        <div className="mainContainer">
          <div className="mainContent">
            <Header/>
            <Switch>
              <Route exact path={`/`} render={(props)=><HomeMenu {...props} values={{title: "Home"}} submenus={menus}/>}/>
              {this.state.routes.map(( routes ) => {return routes})}
            </Switch>
          </div>
        <Footer/>
        </div>
      </main>
    )
  }
}
