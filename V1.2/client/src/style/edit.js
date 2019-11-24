import { createMuiTheme } from '@material-ui/core'

export const theme = createMuiTheme({
    shadows: ["none"],
    overrides: {
        MuiFormControlLabel: {
            label: {
                fontSize: 12,
            }
        },
        MuiTableRow: {
            root: {
                "&:last-child td": {
                    borderBottom: 0,
                },
        }
        },
       /**MuiInputBase: {
            '&disabled': {
                color: '#2B2B2B!important'
        }
        },**/
        MuiSwitch: {
            switchBase: {
                color: '#6C6C6C',
                '&$checked': {
                    color: '#f59926',
                }
            }
        }
    },
    typography: {
        "fontFamily": "\'Rubik\', sans-serif",
        "fontSize": 12,
        'color': '#E95555'
        },
        palette: {
            primary: {
                light: '#f59926',
                main: '#f59926',
                dark: '#f59926'
            },
            error: {
                main: '#E95555'
            },
            text: {
                primary: '#2B2B2B',
            }
        },
        shape: {
            borderRadius: 2,
    }
});
  
// styles for material UI
export const styles = theme => ({
    disabledTextField: {
        marginRight: 7,
        paddingRight: 0,
    },
    textField: {
        marginRight: 7,
    },
    formControl: {
        marginTop: 15,
    },
    dropdownStyle: {
        maxHeight: 300,
        width: 50,
        paddingLeft: -10,
        marginTop: 5,
        //boxSizing: 'border-box',
        boxShadow: '0px 0px 18px #DCDCDC'
    },
    switchLabel: {
        height: 20,
        fontSize: 20,
        marginLeft: 0
    },
    switch: {
        marginRight: 0
    },
    root: {
        width: 42,
        padding: 0,
    },
    paper: {
        width: '100%',
        //height: '100%',
        maxHeight: 91,
        overflow: 'auto',
        backgroundColor: 'transparent'
    },
    table: {
        minWidth: 10,
    },
    input: {
        display: 'none'
    },
    button: {
        maxwidth: 20,
        minwidth: 20,
        marginTop: 16,
        height: 36,
        display: 'inline-block',
        paddingLeft:8,
        paddingRight:8,
        paddingTop:8,
    },
    menu: {
        height: 400,
      },
    bottom: {
    color: '#65C96A',
    animationDuration: '1000ms',
    //position: 'absolute',
    //left: 0,
    },
    searchBar: {
        height: 48,
    },
});