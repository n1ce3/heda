import React, { Component }         from 'react';
import { Route, Link, Redirect }    from 'react-router-dom'
import { ReactiveBase, DataSearch } from '@appbaseio/reactivesearch';

import '../style/header.css'

var redirectRoute = (path) => {
  return <Redirect to={`/${path}`} />
}

export default class Header extends Component {

  constructor(props) {
    super(props)
    this.state = {
      route: "",
    }
  }

  handleRoute = (newRoute) => {
    if(newRoute!==this.state.route){
      this.setState({
        route: newRoute,
      });
    }
  }

  render() {
    console.log(this.state.route);
    return(
        <div className="header">
          <Link to={{ pathname: '/' }}>
            <div className="headerTitle">
              {'HEDA'}
            </div>
          </Link>
          <div className="searchContainer">
            <div className="headerSearch">
              <ReactiveBase
                app="heda"
                type="content"
                url="http://192.168.178.31:9200"
                theme={{
                  typography: {
                    fontFamily: 'Rubik, sans-serif',
                  },
                  colors: {
                    primaryColor: '#f59926',
                    backgroundColor: '#f59926',
                  },
                }}
                >
                <DataSearch
                  className="search-box"
                  componentId="SearchSensor"
                  dataField={["pdfContent"]}
                  showIcon={true}
                  showClear={true}
                  autosuggest={true}
                  placeholder="Suche..."
                  renderNoSuggestion="Leider nichts gefunden..."
                  onValueSelected={
                    (value, cause, source) => {if (cause === "SUGGESTION_SELECT") {this.handleRoute(source.route)}}
                  }
                  renderSuggestion={(suggestion) => ({
                    title:        suggestion.source.title,
                    description:  suggestion.source.description,
                    value:        suggestion.source.title,  // required
                    source:       suggestion.source  // for onValueSelected to work with onSuggestion
                  })}
                  innerClass={{
                      input: 'text-input',
                      list: 'list-input',
                  }}
                />
              </ReactiveBase>
              {redirectRoute(this.state.route)}
            </div>
          </div>
          <div className="headerLogo">
            <Link to={{ pathname: '/' }}>
              <img src={ require('../images/arundio.png') } alt="arundioLogo"/>
            </Link>
          </div>
        </div>
    )
  }
}
