import React, { Component } from 'react';
import Menu                 from '../createMenu.js'
import ParentPath           from '../createParentPath.js'

import '../../style/box.scss'


export default class SubMenu extends Component {

  constructor(props) {
    super(props)
    this.state = {
      submenus: this.props.submenus,
      paths:    this.props.parentPath,
      titles:   this.props.parentTitle,
      //menuHidden: this.props.route.hideMenu,
    }
  }


  componentWillReceiveProps(nextProps){
    if(nextProps.submenus !== this.props.submenus){
      this.setState({
        submenus:   nextProps.submenus,
        paths:      nextProps.parentPath,
        titles:     nextProps.parentTitle,
      });
    }
  }

  render() {
    return(
      <div>
        <div className="titleContainer">
          {ParentPath(this.state.titles, this.state.paths)}
        </div>
        <div className="wrapper">
          {Menu(this.state.submenus)}
        </div>
      </div>
    )
  }
}
