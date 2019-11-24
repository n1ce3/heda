import React, { Component }         from 'react';
import { Link, withRouter }         from 'react-router-dom'
import { ReactiveBase, DataSearch } from '@appbaseio/reactivesearch';

import TextField                    from '@material-ui/core/TextField';
import InputAdornment               from '@material-ui/core/InputAdornment';
import { withStyles }               from '@material-ui/core/styles';
import '../style/header.scss'

const styles = theme => ({
  textField: {
    //maxWidth: 400,
    //maxLength: 400,
    marginLeft: 0
  },

  input: {
    color: "#2B2B2B !important"
  },

  textField: {
    [`& fieldset`]: {
      borderRadius: 8,
    },
  },

  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {
      borderColor: '#f59926 !important',
      borderWidth: '1px',
    }
  },

  cssFocused: {},

  notchedOutline: {
    borderWidth: '1px',
    borderColor: '#F1F1F1 !important'
  },

});


class Header extends Component {

  constructor(props) {
    super(props)
    this.state = {
      searchResult: null,
      searchInput: ''
    }
  }

  handleRoute = (newRoute) => {
    this.props.history.push('/');
    this.props.history.push(newRoute);
  }

  handleChange = (e) => {
    // set state
    this.setState({
      searchInput: e.target.value
    });
    // send request to database
    fetch('/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(e.target.value)
    }).then(async (result) => {
      result.json().then( (data) => {
        this.props.searchResult(data.result);
        this.setState({
          searchResult: data.result
        })
        })
      });    
  }

  handleFocus = () => {
    this.props.hideMenu(true, this.state.searchResult);
  }

  handleBlur = () => {
    this.props.hideMenu(false, this.state.searchResult);
  }

  clearInput = () => {
    this.setState({
      searchInput: '',
      searchResult: null
    });
    this.handleBlur();
  }


  render() {
    const { classes } = this.props;
    return(
        <div className="header">
          <Link to={{ pathname: '/'}}>
            <div className="headerTitle" onClick={this.props.onClick}>
              {'HEDA'}
            </div>
          </Link>
          <div className="searchContainer">
            <div className="headerSearch">
              <TextField
                id="outlined-bare"
                placeholder="Suche..."
                margin="normal"
                variant="outlined"
                // style
                className={classes.textField}
                style={{marginTop: 0}}
                inputProps={{
                  'aria-label': 'bare',
                  style: {
                    height: 48,
                    padding: '0px 0px 0px 0px',
                    marginRight: '20px'
                  },
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><i className="material-icons searchBar">search</i></InputAdornment>,
                  endAdornment: <InputAdornment position="start"><i className="material-icons clearSearch" onClick={this.clearInput}>clear</i></InputAdornment>,
                  classes: {
                    root: classes.cssOutlinedInput,
                    focused: classes.cssFocused,
                    notchedOutline: classes.notchedOutline,
                    input: classes.input
                  }
                }}
                fullWidth
                // skills
                onChange={this.handleChange}
                onFocus={this.handleFocus}
                //onBlur={this.handleBlur}
                value={this.state.searchInput}
              />
              
            </div>
          </div>
          <div className="headerLogo">
            <Link to={{ pathname: '/' }}>
              <img src={ require('../images/arundio.png') } alt="arundioLogo" onClick={this.props.onClick}/>
            </Link>
          </div>
        </div>
    )
  }
}

export default  withStyles(styles)(withRouter(Header))


/*
<ReactiveBase
  app="heda_content_index"
  type="heda_content"
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
    dataField={['content', 'title', 'description']}
    showIcon={true}
    showClear={true}
    autosuggest={true}
    placeholder="Suche..."
    renderNoSuggestion="Leider nichts gefunden..."
    onValueSelected={
      (value, cause, source) => {if (cause === "SUGGESTION_SELECT") {this.handleRoute(source.path)}}
    }
    parseSuggestion={(suggestion) => ({
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
*/