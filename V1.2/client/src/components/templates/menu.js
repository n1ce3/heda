import React, { Component}    from 'react';
import { Switch, Route, Link } from 'react-router-dom'

import HomeMenu                from './homemenu'
import Footer                  from '../createFooter.js'
import Header                  from '../createHeader.js'
import MaiPage                 from './maintenance.js'

import createRoutesArray       from '../createRoutes.js'
import Truncate                from 'react-truncate'
import { Textfit }              from 'react-textfit'


import '../../style/main.scss' 
import '../../style/menuContent.scss'


const hideMenuContainer = (hidden) => {
  let activeStyle = (hidden===true) ? "selectionWrapper hidden" : "selectionWrapper";
  return(activeStyle);
}

const hideSearchContentContainer = (hidden) => {
  let activeStyle = (hidden===true) ? "searchContentWrapper visible" : "searchContentWrapper";
  return(activeStyle);
}

const setLineNumbers = (width) => {
  if (width<280) {
    return 1
  }
  if (width>=280 && width<350) {
    return 2
  }
  if (width>=350 && width<410) {
    return 3
  }
  else {
    return 4
  }
}

const resizeText = (className) => {
  var divs = document.getElementsByClassName(className);
  for(var i = 0; i < divs.length; i++) {
    var relFontsize = divs[i].offsetWidth*0.07;
    divs[i].style.fontSize = relFontsize+'px';
}
}

class MainMenu extends Component {

  constructor(props) {
    super(props)
    this.state = {
      array: [],
      routes: [],
      maintenance: [],
      status: 'loading...',
      loading: true,
      state: false,

      willUpdate: false,
      doUpdate: false,

      searchResult: null,
      menuHidden: false,

      element: false,

      divWidth: 0,
      lines: 1
    }
  }

  // check wheather reload or not
  handleUpdate = () => {
    this.setState({
      willUpdate: true
    })
  }

  // trigger reload
  triggerReload = () => {
    if (this.state.willUpdate) {
      // reset state
      this.setState({
        doUpdate: true,
      });
    }
    this.setState({
      menuHidden: false
    });
  }

  refreshPage = () => {
    if (this.state.doUpdate) {
      // reset state
      this.setState({
        willUpdate: false,
        doUpdate: false
      });
      // reload page
      window.location.reload();
    }
  }

  searchResult = (data) => {
    this.setState({
      searchResult: data
    });
  }

  hideMenu = (isHidden, data) => {
    this.setState({
      menuHidden: isHidden,
      searchResult: data
    });
  }

  handleHide = () => {
    this.setState({
      menuHidden: false,
    });
  }

  handleResize = () => {
    if (document.getElementById("searchResultBox") && this.state.windowWidth!==window.innerWidth) {
      this.setState({
        lines: setLineNumbers(document.getElementById("searchResultBox").clientWidth),
        windowWidth: window.innerWidth
      });
    }
  }


  // fetch menu
  componentDidMount() {
    fetch("/getMenu").then(response => response.json().then(data => {
      // cannot load data from database --> no menu existant
      if (data.status===false) {
        this.setState({
          status: 'ElasticSearch nicht erreichbar',
          maintenance: data.data,
          loading: false,
          state: false
        });
      }
      // does load menu data from database
      else {
        this.setState({
          routes: createRoutesArray(data.data, this.handleUpdate, this.state.menuHidden, this.state.menuHidden),
          maintenance: data.data[data.data.length-1],
          array: data.data.slice(0,data.data.length-1),
          loading: false,
          status: 'Menü erstellen...',
          state: true
        });
      }}
      ));
    this.handleResize();
    window.addEventListener('resize', this.handleResize)
    //resizeText('menuBox')
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    //resizeText('menuBox')
  }

  refCallback = element => {
    if (element) {
      this.setState({
        lines: setLineNumbers(element.getBoundingClientRect().width)
      });
    }
  };

  render() {
    console.log('Current Menu', this.state.array)
    var createSearchContent = (result) => {
      if (result!==null && result.length!==0) {
        return(
          <div className='searchBoxWrapper'>
            {result.map( ( res ) => {
              return(
                <Link to={{pathname:`/${res.path}`, pdfIndex: res.index}} key={res.id}>
                  <div key={res.title} className='searchBox' onClick={this.handleHide}>
                      <div className='searchEndpageTitle'>
                        {res.endpageTitle}
                      </div>
                    <div className='searchTitle'>
                        {res.title}
                    </div>
                    <div className='searchDescription' ref={this.refCallback} id='searchResultBox'>
                      <Truncate lines={this.state.lines}>
                        {res.description}
                      </Truncate>
                    </div>
                  </div>
                </Link>
                );
            })}
          </div>
        )
      }
      else {
        return(
          <div className='noSearchResult'>
            Leider nichts gefunden...
          </div>
        );
      }
    }

    this.refreshPage()
    // data not loaded yet or cannot reach database
    if (this.state.state===false) {
      // still loading or database noch reachable
      return(
        <main>
          <div className="mainContainer" id="mainContainer">
            <div className="mainContent">
              <Header onClick={this.triggerReload} searchResult={() => {}} hideMenu={this.hideMenu}/>
              <div className='maintain'>
                <a>{this.state.status}</a>
              </div>
            </div>
            {Footer(this.state.maintenance, this.state.state)}
          </div>
        </main>
      ); 
    }
    // did reach databased, menu is fetched and gets rendered now
    else {
      // if menu is empty
      if (this.state.array.length===0) {
        return(
          <main>
            <div className="mainContainer" id="mainContainer">
              <div className="mainContent">
                <Header onClick={this.triggerReload} searchResult={() => {}} hideMenu={this.hideMenu}/>
                <Switch>
                  <Route exact path={`/${this.state.maintenance.path}`} render={(props)=><MaiPage {...props} onClick={this.handleUpdate}/>}/>
                  <Link to={`/${this.state.maintenance.path}`} key={this.state.maintenance.id}>
                    <div className='maintain'>
                      <a>{this.state.status}</a>
                    </div>
                </Link>
                </Switch>
              </div>
              {Footer(this.state.maintenance, this.state.state)}
            </div>
          </main>
        )
      }
      else {
        return(
          <main>
            <div className="mainContainer" id="mainContainer">
              <div className="mainContent">
                <Header onClick={this.triggerReload} searchResult={this.searchResult} hideMenu={this.hideMenu}/>
                <div className='contentWrapper' onClick={this.handleHide}>
                  <div className={hideMenuContainer(this.state.menuHidden)}>
                    <Switch>
                      <Route exact path={`/`} render={(props)=><HomeMenu {...props} values={{title: "Home"}} submenus={this.state.array} searchResult={this.state.searchResult}/>}/>
                      {this.state.routes.map(( routes ) => {return routes})}
                    </Switch>
                  </div>
                  <div className={hideSearchContentContainer(this.state.menuHidden)} onClick={this.handleHide}>
                    <div className="titleContainer" onClick={this.handleHide}>
                      <div className="subTitleContainer" onClick={this.handleHide}>
                        <div className="subTitle isActive" onClick={this.handleHide}>
                          Gefunden
                        </div>
                      </div>
                    </div>
                    {createSearchContent(this.state.searchResult)}
                  </div>
                </div>
              </div>
              {Footer(this.state.maintenance, this.state.state, this.handleHide)}
            </div>
          </main>
        )
      }
    }
  }
}

export default MainMenu
