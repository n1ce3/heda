import React, { Component } from 'react';
import PropTypes            from 'prop-types';
import classNames           from 'classnames';
import Select               from 'react-select';
import { withStyles }       from '@material-ui/core/styles';
import Typography           from '@material-ui/core/Typography';
import NoSsr                from '@material-ui/core/NoSsr';
import TextField            from '@material-ui/core/TextField';
import Paper                from '@material-ui/core/Paper';
import Chip                 from '@material-ui/core/Chip';
import MenuItem             from '@material-ui/core/MenuItem';
import CancelIcon           from '@material-ui/icons/Cancel';
import { emphasize }        from '@material-ui/core/styles/colorManipulator';

const suggestions = [
  { label: 'Afghanistan' },
  { label: 'Aland Islands' },
  { label: 'Albania' },
  { label: 'Algeria' },
  { label: 'American Samoa' },
  { label: 'Andorra' },
  { label: 'Angola' },
  { label: 'Anguilla' },
  { label: 'Antarctica' },
  { label: 'Antigua and Barbuda' },
  { label: 'Argentina' },
  { label: 'Armenia' },
  { label: 'Aruba' },
  { label: 'Australia' },
  { label: 'Austria' },
  { label: 'Azerbaijan' },
  { label: 'Bahamas' },
  { label: 'Bahrain' },
  { label: 'Bangladesh' },
  { label: 'Barbados' },
  { label: 'Belarus' },
  { label: 'Belgium' },
  { label: 'Belize' },
  { label: 'Benin' },
  { label: 'Bermuda' },
  { label: 'Bhutan' },
  { label: 'Bolivia, Plurinational State of' },
  { label: 'Bonaire, Sint Eustatius and Saba' },
  { label: 'Bosnia and Herzegovina' },
  { label: 'Botswana' },
  { label: 'Bouvet Island' },
  { label: 'Brazil' },
  { label: 'British Indian Ocean Territory' },
  { label: 'Brunei Darussalam' },
].map(suggestion => ({
  value: suggestion.label,
  label: suggestion.label,
}));

// styles dropdown menü
const customStyles = {
  option: (styles, { isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      color: isDisabled
        ? null
        : isSelected ? '#f59926' : isFocused ? '#f59926' : '#2B2B2B',
      backgroundColor: isDisabled
        ? null
        : isSelected ? '#F0F0F0' : isFocused ? '#F8F8F8' : null,
    };
  },
}

const DropdownIndicator = (props) => {
  return (
      <div></div>
  );
};

const indicatorSeparatorStyle = {
  display: 'none',
};

const IndicatorSeparator = ({ innerProps }) => {
  return (
    <span style={indicatorSeparatorStyle} {...innerProps}/>
  );
};

const components = {
  IndicatorSeparator,
  DropdownIndicator,
};


class SearchBar extends React.Component {
  state = {
    value:    null,
    openMenu: false,
  };

  handleChange = input => {
    this.setState({
      value: input,
    });
  };

  handleInputChange = (query, { action }) => {
    if (action === "input-change") {
        this.setState({ openMenu: true });
    }
  };

  hideMenu = () => {
      this.setState({ openMenu: false });
  };

// if empty close menu and if not empty open menu again when selected
  setStateHideMenu = input => {
      this.handleChange(input);
      this.hideMenu();
  };

  render() {
    return (
      <NoSsr>
        <Select
          styles        ={customStyles}
          options       ={suggestions}
          components    ={components}

          // changes state if something is selected and closes dropdown
          onChange      ={this.setStateHideMenu}

          // opens menu if something is typed in
          onInputChange ={this.handleInputChange}

          // cloeses dropdown if menubar is not selected
          onBlur        ={this.hideMenu}

          // determines whether menu is open or not
          menuIsOpen    ={this.state.openMenu}

          // keeps selected value in searchbar, set to null if you doesnt want to keep selected value
          // otherwise just pass state.value in
          value         ={null}

          placeholder   ="Suche..."
          isClearable   ={true}
          theme         ={(theme) => ({
           ...theme,
           borderRadius: 3,
           colors: {
             ...theme.colors,
             // border
             // selected color
             primary:   'neutral20',
             // color if not selected
             neutral20: 'neutral20',
             // color at hover
             neutral30: 'neutral20',
           },
         })}
        />
      </NoSsr>
    );
  }
}


export default SearchBar;
