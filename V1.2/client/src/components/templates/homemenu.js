import React, { Component } from 'react';
import Menu                 from '../createMenu.js'

import '../../style/menuContent.scss'

// create

export default class HomeMenu extends Component {

  constructor(props) {
    super(props)
    this.state = {
      submenus: this.props.submenus,
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.submenus !== this.props.submenus){
      this.setState({submenus: nextProps.submenus});
    }
  }

  render() {
    return(
      <div>
        <div className="titleContainer">
          <div className="subTitleContainer">
            <div className="subTitle isActive">
              {this.props.values.title}
            </div>
          </div>
        </div>
        <div className="wrapper">
          {Menu(this.state.submenus)}
        </div>
      </div>
    )
  }
}
