import React, { Component } from 'react';
import Switch from '@material-ui/core/Switch';
import PropTypes, { element } from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import CircularProgress from '@material-ui/core/CircularProgress';



import { MuiThemeProvider } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import '../../api/maintenance.py';
import '../../style/maintenance.scss';
import {theme, styles} from '../../style/edit.js';

// check if nesting possible
function chechNesting(currentParent, currentTitel, menuArray, childOfItsOwn) {
  if (childOfItsOwn===true) {
    return true;
  }
  else {
    // find all possible objects with title equals current parent
    var objectWithParentTitle = menuArray.filter(obj => {
    return obj.title === currentParent
    });
    // go over each obj
    for (var obj in objectWithParentTitle){
      if (objectWithParentTitle[obj].parent===currentTitel) {
        childOfItsOwn = true;
      }
      return chechNesting(objectWithParentTitle[obj].parent, currentTitel, menuArray, childOfItsOwn);
    }
  }
  return false;
}

// replace vicious chraracters
function replaceViciousCharacters(filename) {
  // space
  filename = filename.replace(/%20/g, "_");
  // umlaute
  filename = filename.replace(/%CC%88/g, "e");
  // ß
  filename = filename.replace(/%C3%9F/g, "ss");
  // /
  filename = filename.replace(/[:!+*();:@&=+$,/?%#]/g, "-");
  return(filename)
}

// create maintenance page to maintain menue
class Maintenance extends Component {

    constructor(props) {
      super(props)
      this.fileInput = React.createRef();

      this.state = {
        menu: [],
        parents: [],
        state: false,
        loading: true,

        editIndex: null,
        editForm: null,
        updateForm: null,

        isSaving: false,

        dragIndex: -1,
        draggedIndex: -1,

        formSetting: {
          isNew: false,
          wasNew: false,
          isEndpage: false,
          isParent: false,
          fileIsSelected: false,
          fileName: '',
          fileTitle: '',
          parentValue: 0,

          // error handling
          titleError: false,
          parentError: false,
          descriptionError: false,
          pdfpathError: false,

          allCheckedIn: false,
          sortMenu: false
        }
      }
    };

    // handle clear
    handleClear() {
      // reset ref
      this.fileInput = {current: null};

      // if is new delete it
      if (this.state.formSetting.isNew) {
        let oldMenu = cloneDeep(this.state.menu);
        oldMenu.pop()
        this.setState({
          menu: oldMenu
        });
      }
      // reset state
      this.setState({
        editIndex: null,
        editForm: null,
        updateForm: null,

        formSetting: {
          isNew: false,
          wasNew: false,
          isEndpage: false,
          fileIsSelected: false,
          fileName: '',
          fileTitle: '',
          parentValue: 0,

          // error handling
          titleError: false,
          parentError: false,
          descriptionError: false,
          pdfpathError: false,

          allCheckedIn: false,
          sortMenu: false
        }
      });
    }

    // handle file name
    handleFileName() {
      let newFormSetting = this.state.formSetting;
      newFormSetting.fileName = replaceViciousCharacters(encodeURI(this.fileInput.current.files[0].name));
      newFormSetting.fileIsSelected = true;

      this.setState({
        formSetting: newFormSetting
      })
    }

    // handel clear file
    handleClearFile() {
      // copy editForm
      let newFormSetting = this.state.formSetting;

      // set title to empty
      newFormSetting.fileName = '';
      newFormSetting.fileIsSelected = false;

      // reset file input
      document.getElementById("outlined-button-file").value = "";

      // set state
      this.setState({
        formSetting: newFormSetting
      });
    }

    // handle clear file pdf table
    handleClearPdfTableRow(i) {
      console.log('delete')
      let newEditForm = this.state.editForm;

      // if old just change status to delete to remember later
      if (newEditForm.pdfpath[i].status==='old'||newEditForm.pdfpath[i].status==='delete') {
        newEditForm.pdfpath[i].status = 'delete';
      }
      // else, just delete corresponding element of pdfpath array
      else {
        newEditForm.pdfpath.splice(i, 1);
      }

      // update state
      this.setState({
        editForm: newEditForm
      });
      console.log(this.state.editForm)
    }

    // handle file title
    handleFileTitle(e) {
      // copy editForm
      let newFormSetting = this.state.formSetting;
      // set new title
      newFormSetting.fileTitle = e.target.value;
      this.setState({
        formSetting: newFormSetting
      });
    }

    // handle change input
    handleChangeInput(prop, e) {
      // copy editForm
      let newEditForm = this.state.editForm;
      // set new title
      newEditForm[prop] = e.target.value;
      this.setState({
        editForm: newEditForm
      });
    }

    // handel change select
    handleChangeSelect(e) {
      // copy editForm
      let newEditForm = this.state.editForm;
      let newFormSetting = this.state.formSetting;

      // set new value in formSetting
      newFormSetting.parentValue = e.target.value;
      console.log(this.state.parents)
      // also set new string in editForm
      newEditForm.parent = this.state.parents[e.target.value].id;

      console.log(newFormSetting.parent)

      this.setState({
        editForm: newEditForm,
        formSetting: newFormSetting
      });

    }

    // handle pdf array
    handleSwitch(e, isChecked) {
      let newFormSetting = this.state.formSetting;
      let newEditForm = this.state.editForm;

      // form setting
      newFormSetting.isEndpage = isChecked;

      // data setting
      if (isChecked) {
        let newPdfpath = [];
        let i = this.state.editIndex;
        for (var k = 0; k < this.state.menu[i].pdfpath.length; k++) {
          newPdfpath.push(
            {
              title: cloneDeep(this.state.menu[i].pdfpath[k].title),
              path: cloneDeep(this.state.menu[i].pdfpath[k].path),
              status: 'old',
              file: null,
              id: cloneDeep(this.state.menu[i].pdfpath[k].id),
            }
          );
        }
        // get original values
        newEditForm.description = cloneDeep(this.state.menu[this.state.editIndex].description);
        newEditForm.pdfpath = newPdfpath;
      }
      else {
        // delete original values in order to replace them in database later on
        newEditForm.description = '';
        newFormSetting.fileTitle = '';
        newFormSetting.fileName = '';
        let newPdfpath = [];
        let i = this.state.editIndex;
        for (var m = 0; m < this.state.menu[i].pdfpath.length; m++) {
          newPdfpath.push(
            {
              title: cloneDeep(this.state.menu[i].pdfpath[m].title),
              path: cloneDeep(this.state.menu[i].pdfpath[m].path),
              status: 'delete',
              file: null,
              id: cloneDeep(this.state.menu[i].pdfpath[m].id),
            }
          );
        }
        newEditForm.pdfpath = newPdfpath;
        newFormSetting.descriptionError = false;
        newFormSetting.pdfpathError = false;
      }

      // set state
      this.setState({
        editForm: newEditForm,
        formSetting: newFormSetting
      });
    }

    // handle edit initialization
    handleEdit(i) {
      let newEditForm = cloneDeep(this.state.menu[i]);
      let newFormSetting = this.state.formSetting;
      newFormSetting.isEndpage = (newEditForm.pdfpath.length!==0);

      // add status to pdfpath
      let newPdfpath = [];
      for (var pdf = 0; pdf < newEditForm.pdfpath.length; pdf++) {
        newPdfpath.push(
          {
            title: newEditForm.pdfpath[pdf].title,
            path: newEditForm.pdfpath[pdf].path,
            status: 'old',
            file: null,
            id: newEditForm.pdfpath[pdf].id,
          }
        );
      }
      newEditForm.pdfpath = newPdfpath;

      // find possible parents
      // if selected row has '' as parent and it is only row with '' --> prevent from changing
      let parents = [];
      parents.push(
        {
          value: 0,
          label: '',
          id: ''
        }
      );

      // count ''
      const numberFlatChildren = this.state.menu.filter(item => item.parent === '').length;
      if ((numberFlatChildren>1)||(this.state.menu[i].parent!=='')) {
        var run = 1;
        for (var l = 0; l < this.state.menu.length; l++) {
          if ((l!==i)&&(this.state.menu[l].pdfpath.length===0)) {
            // for each potential parent check if possible
            var isPossible = true;
            var runningParent = this.state.menu[l].parent;
            while (runningParent!=='') {
              for (var k = 0; k < this.state.menu.length; k++) {
                if ((this.state.menu[k].id === runningParent)) {
                  if (this.state.menu[i].id === runningParent) {
                    isPossible = false;
                    break;
                  }
                  else {
                    runningParent = this.state.menu[k].parent;
                    break;
                  }
                }
              }
              if (!isPossible) {
                break;
              }
            }
            if (isPossible) {
              parents.push(
                {
                  value: run,
                  label: this.state.menu[l].title,
                  id: this.state.menu[l].id
                }
              );
              run++;
            }
          }
        }
      }

      // check if parent
      var isParent = false;
      for (let m = 0; m < this.state.menu.length; ++m) {
        if (this.state.menu[i].id===this.state.menu[m].parent) {
          isParent = true;
          break;
        }
      }

      newFormSetting.parentValue = parents.findIndex(i => i.id === newEditForm.parent);
      newFormSetting.isParent = isParent;

      // set state
      this.setState({
        parents: parents,
        editIndex: i,
        editForm: newEditForm,
        formSetting: newFormSetting
      });
    }

    // handle select file
    handleUploadFile() {
      // get file
      let chosenFile = this.fileInput.current.files[0];

      var blob = chosenFile.slice(0, chosenFile.size, 'application/pdf'); 
      var newFile = new File([blob], replaceViciousCharacters(encodeURI(chosenFile.name)), {type: 'application/pdf'});

      // get edit form
      let newEditForm = cloneDeep(this.state.editForm);
      let newFormSetting = cloneDeep(this.state.formSetting);
      // get pdf array
      let newPdfArray = newEditForm.pdfpath;

      // now clear pdf file textfield and pdf title test field
      newFormSetting.fileName = '';
      newFormSetting.fileTitle = '';
      newFormSetting.fileIsSelected = false;

      // add new pdf to pdf array
      newPdfArray.push(
        {
          title: this.state.formSetting.fileTitle,
          path: this.state.formSetting.fileName,
          status: 'new',
          file: newFile, 
          id: '',
        }
      )

      // write files in state
      newEditForm.pdfpath = newPdfArray;

      this.setState({
        editForm: newEditForm,
        formSetting: newFormSetting
      });

      // reset file input
      document.getElementById("outlined-button-file").value = "";
    }

    // check edit form
    async checkEditForm() {

      var allCheckedIn = true;

      let newFormSetting = this.state.formSetting;
      let newEditForm = this.state.editForm;

      // first check if all information is provided
      // title
      if (newEditForm.title==='') {
        newFormSetting.titleError = true;
        allCheckedIn = false;
      }
      else {
        // take title and parent and check if possible
        // check if title has child with parent
        let testMenu = cloneDeep(this.state.menu);
        testMenu[this.state.editIndex] = newEditForm;

        let childOfItsOwn = chechNesting(newEditForm.parent, newEditForm.title, testMenu, false);

        // check if same title with same parent exists
        let isSameTitle = false;
        for (var i = 0; i < this.state.menu.length; i++) {
          if((i!==this.state.editIndex)&&(this.state.menu[i].title===newEditForm.title)) {
            isSameTitle = true;
          }
        }

        if (childOfItsOwn||(newEditForm.title===newEditForm.parent)||isSameTitle) {
          newFormSetting.titleError = true;
          allCheckedIn = false;
        }
        else {
          newFormSetting.titleError = false;
        }
      }


      // if endpage: check description, and pdfarray
      if (this.state.formSetting.isEndpage) {
        // check description
        if (newEditForm.description==='') {
          newFormSetting.descriptionError = true;
          allCheckedIn = false;
        }
        else {
          newFormSetting.descriptionError = false;
        }
        // check pdfs
        var found = false;
        for(var i = 0; i < newEditForm.pdfpath.length; i++) {
          if (newEditForm.pdfpath[i].status !== 'delete') {
              found = true;
              break;
          }
        };
        if (!found) {
          newFormSetting.pdfpathError = true;
          allCheckedIn = false;
        }
        else {
          newFormSetting.pdfpathError = false;
        }
        
      }

      newFormSetting.allCheckedIn = allCheckedIn;

      this.setState({
        formSetting: newFormSetting
      });

      return(allCheckedIn);
    }

    // handle upload file to database 
    async uploadFile(fileForm) {
      await fetch('/uploadPDF', {
        method: 'POST',
        body: fileForm,
      }).then(async (response) => {
        response.json().then( () => {
          console.log('File uploaded')
          })
        });
    }

    // handle new pdfs
    async handleNewPdfs() {
      for (let i = 0; i < this.state.editForm.pdfpath.length; i++) {
        // current pdf
        let pdf = this.state.editForm.pdfpath[i];
        if (pdf.status=='new') {
          // file to upload
          let formData = new FormData();
          formData.append("file", pdf.file);
          console.log(pdf.file);
          // upload file
          await this.uploadFile(formData);
        }
      }
    }

    async updateEditForm() {

      // prepare editForm (delete all files)
      var newEditForm = this.state.editForm;
      for (let i = 0; i < newEditForm.pdfpath.length; i++) {
        let pdf = newEditForm.pdfpath[i];
        if (pdf.status==='new') {
          pdf.file = null;
        }
      }
      
      // pass to server
      await fetch('/updateEditForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEditForm)
      }).then( (response) => {
        console.log(response)
      });
    }

    // clear everything in form setting
    clearEditForm() {
      let newFormSetting = this.state.formSetting;

      newFormSetting.isNew = false;
      newFormSetting.wasNew = false;
      newFormSetting.isEndpage = false;
      newFormSetting.fileIsSelected = false;
      newFormSetting.allCheckedIn = false;
      newFormSetting.sortMenu = false;

      newFormSetting.fileName = '';
      newFormSetting.fileTitle = '';
      newFormSetting.parentValue = 0;

      // reset file input
      document.getElementById("outlined-button-file").value = "";

      this.setState({
        editForm: null,
        updateForm: null,
        editIndex: null,

        isSaving: false,

        formSetting: newFormSetting
      });
    }

    async fetchMenuTable() {
      await fetch("/getMenuTable").then(response => response.json().then(data => {
        this.setState({
          state: data.status,
          loading: false,
        })
        if (data.status===true) {
          this.setState({
            menu: data.data,
            isSaving: false
          });
        }
        }
      ))
    }

    // sort menu corresponding to given keys
    handleSortMenu = () => {
      const currentMenu = this.state.menu;
      var sortedMenu = currentMenu.sort(function(a, b){
        var keyA = a.key,
            keyB = b.key;
        // Compare the 2 dates
        if(keyA < keyB) return -1;
        if(keyA > keyB) return 1;
        return 0;
      });
      this.setState({
        menu: sortedMenu
      });
    }

    // update menu array
    updateMenuArray = () => {
      const newMenu = this.state.menu;
      newMenu[this.state.editIndex] = cloneDeep(this.state.editForm);
      this.setState({
        menu: newMenu
      })
    }

    // set keys
    async setKeys() {
      var newMenu = cloneDeep(this.state.menu);

      // sort
      newMenu.sort(function(a, b){
        if (a.parent === b.parent) {
          return 0
        }
        else {
          return a.parent.localeCompare(b.parent)
        }
      });

      newMenu.sort(function(a, b){
        if (a.parent !== b.parent) {
          return 0
        }
        else {
          return a.key-b.key
        }
      });

      // update keys
      var idKeyAssignment = {}
      for (var i=0; i < newMenu.length; i++) {
        newMenu[i].key = i;
        idKeyAssignment[newMenu[i].id] = i;
      }

      // pass menu to server
      fetch('/updateKeys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(idKeyAssignment)
      }).then( (response) => {
        console.log('Keys updated')
      });

      this.setState({
        menu: newMenu
      });
    }

    // handle save edit
    async handleSaveEdit() {

      // check if edit form can be updated / added to database
      var allCheckedIn = await this.checkEditForm();

      // safe old menu
      var oldMenu = cloneDeep(this.state.menu);

      if (allCheckedIn) {
        this.setState({
          isSaving: true
        })
        // handle upload pdfs
        await this.handleNewPdfs();

        // pass editForm to server and handle everything there
        await this.updateEditForm();

        // update menu array
        await this.updateMenuArray();

        // fetch menu table again
        await this.fetchMenuTable();

        // set keys
        await this.setKeys();

        // clear all
        await this.clearEditForm();

        // sort menu by keys
        //await this.handleSortMenu();


        // update keys
        //this.updateKeys();

        // sort menu
       // await this.handleSortMenu();

        // pass menu to server in order so update keys in database
        //await this.updateOrder();

        
      }
    }

    // delete entry
    async handleDelete(i) {

      let menuUpdated = this.state.menu;
      // check wheather child exists -> prevent deleting parent!
      let isParent = false;
      for (var l = 0; l < menuUpdated.length; l++) {
        if ((menuUpdated[l].parent===menuUpdated[i].id)&&(l!==i)) {
          isParent = true;
          break;
        }
      }

      if (!isParent) {
        // handle all delete in database     
        await fetch('/deleteRow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.state.menu[i])
        }).then((response) => {
          response.json().then((body) => {
            console.log(body)
          });
        });
        // fetch new menu after delete
        await this.fetchMenuTable();
        // set keys
        await this.setKeys();
      }     
    }

    // add new table row
    handleAdd() {
      if (!this.state.formSetting.isNew) {
        // add empty object to menu array
        let newEditForm = {
          title: '',
          parent: '',
          description: '',
          id: '',
          pdfpath: [],
          key: this.state.menu.length
        }

        let newMenu = cloneDeep(this.state.menu);
        newMenu.push(cloneDeep(newEditForm));

        // set formSetting isNew = true
        let newFormSetting = this.state.formSetting;
        newFormSetting.isNew = true;
        newFormSetting.wasNew = true;
        newFormSetting.isParent = false;

        // find possible parents
        // if selected row has '' as parent and it is only row with '' --> prevent from changing
        let parents = [];
        parents.push(
          {
            value: 0,
            label: '',
            id: null
          }
        );
        // count ''
        const numberFlatChilds = this.state.menu.filter(item => item.parent === '').length;
        if ((numberFlatChilds>=1)||(newMenu[this.state.menu.length].parent!=='')){
          var run = 1;
          for (var l = 0; l < this.state.menu.length; l++) {
              if (this.state.menu[l].pdfpath.length===0) {
              parents.push(
                {
                  value: run,
                  label: this.state.menu[l].title,
                  id: this.state.menu[l].id
                }
              );
              run++;
            }
          }
        }

        newFormSetting.parentValue = 0;
        newMenu[this.state.menu.length].parent = 'none';

        // set state
        this.setState({
          menu: newMenu,
          parents: parents,
          editIndex: newMenu.length-1,
          editForm: cloneDeep(newEditForm),
          formSetting: newFormSetting
        });
      }
    }

    // fetch menu
    async componentDidMount() {
      // fetch menu table
      await this.fetchMenuTable();
      // await until fetched and then sort menu
      this.handleSortMenu();
      this.props.onClick();
    }

    /* --> HANDLE REORDERING <-- */

    moveUpwards(i, isActiveUp) {

      if (isActiveUp) {
         var newMenu = cloneDeep(this.state.menu);

         //console.log(newMenu[i].key, newMenu[i].key -= 1);

         newMenu[i].key -= 1;
         newMenu[i-1].key += 1;

         var sortedMenu = newMenu.sort(function(a, b){
          var keyA = a.key,
              keyB = b.key;
          // Compare the 2 dates
          if(keyA < keyB) return -1;
          if(keyA > keyB) return 1;
          return 0;
        });

        this.setState({
          menu: sortedMenu
        });

        // update keys
        var idKeyAssignment = {}
        for (var i=0; i < newMenu.length; i++) {
          newMenu[i].key = i;
          idKeyAssignment[newMenu[i].id] = i;
        }

         // pass menu to server
        fetch('/updateKeys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(idKeyAssignment)
        }).then( (response) => {
          console.log('Keys updated')
        });
      }

    }

    moveDownwards(i, isActiveDown) {

      if (isActiveDown) {
        var newMenu = cloneDeep(this.state.menu);

        newMenu[i].key += 1;
        newMenu[i+1].key -= 1;

        var sortedMenu = newMenu.sort(function(a, b){
          var keyA = a.key,
              keyB = b.key;
          // Compare the 2 dates
          if(keyA < keyB) return -1;
          if(keyA > keyB) return 1;
          return 0;
        });

        this.setState({
          menu: sortedMenu
        });

        // update keys
        var idKeyAssignment = {}
        for (var i=0; i < newMenu.length; i++) {
          newMenu[i].key = i;
          idKeyAssignment[newMenu[i].id] = i;
        }

         // pass menu to server
        fetch('/updateKeys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(idKeyAssignment)
        }).then( (response) => {
          console.log('Keys updated')
        });
      }

    }

    /* --> ################### <-- */


    /* -->       RENDER        <-- */
    render() { 
      const { classes } = this.props;
      // create pdf file list
      const createPdfFileTable = () => {
        var found = false;
        for(var i = 0; i < this.state.editForm.pdfpath.length; i++) {
            if (this.state.editForm.pdfpath[i].status !== 'delete') {
                found = true;
                break;
            }
        };
        if (this.state.formSetting.pdfpathError&&(!found)) {
          return(
            <div className='pdfpathError'> Keine PDF ausgewählt</div>
          );
        }
        else {
          if (found) {
            return (
              <div className='pdfFileWraper'>
                <Paper className={classes.paper}>
                  <Table className={classes.table}>
                    <TableBody>
                      {createPdfFileTableRow(this.state.editForm.pdfpath)}
                    </TableBody>
                  </Table>
                </Paper>
              </div>
            );
          }
        }
      }

      const createPdfFileTableRow = (pdfFiles) => {
        return pdfFiles.map( (file, i) => {
          if (file.status!='delete') {
            return(
              <TableRow style={{ height: 29 }} key={'tableRow-'+i}>
                <TableCell colSpan={2} align="left" style={{paddingLeft:5, paddingRight:5}}>
                  {file.title}
                </TableCell>
                <TableCell colSpan={2} align="left" style={{paddingLeft:5, paddingRight:5}}>
                  {file.path}
                </TableCell>
                <TableCell colSpan={1} align="right" style={{paddingLeft:5, paddingRight:5}}>
                  {<i className="material-icons" onClick={this.handleClearPdfTableRow.bind(this, i)}>clear</i>}
                </TableCell>
              </TableRow>
            );
          }
        })
      }

      // edit form
      const editForm = () => {
        return(
          <MuiThemeProvider theme={theme}>
          <div className='editWraper'>
            <div className='leftEdit'>
              <div className='leftEditInput'>
                <TextField
                  id="outlined-title"
                  label="Titel"
                  className={`${classes.textField} without-padding`}
                  defaultValue={this.state.editForm.title}
                  onChange={this.handleChangeInput.bind(this, 'title')}
                  error={this.state.formSetting.titleError}
                  margin="normal"
                  variant="outlined"
                  fullWidth
                />
                <FormControl fullWidth className={classes.formControl}>
                  <TextField
                    id="outlined-parent"
                    label='Parent'
                    variant="outlined"
                    value={this.state.formSetting.parentValue}
                    onChange={this.handleChangeSelect.bind(this)}
                    SelectProps={{MenuProps: { classes: { paper: classes.dropdownStyle } }}}
                    select
                    fullWidth
                  >
                    {
                      this.state.parents.map(option => {
                        if (option.value===0) {
                          return(
                          <MenuItem key={'deep'} value={0} dense={true} >
                            <em>Kein Parent</em>
                          </MenuItem>
                          )
                        }
                        else {
                          return(
                          <MenuItem key={option.value} value={option.value} dense={true} /**classes={{select: {height:80, boxSizing: 'content-box'}}}**/>
                            {option.label}
                          </MenuItem>
                          )
                        }
                      })
                    }
                  </TextField>
                </FormControl>
              </div>
              <div className='controlEndpage'>
                <FormControlLabel
                  control={
                    <Switch
                      className={classes.switch}
                      style={{marginTop:"0px"}}
                      defaultChecked={this.state.formSetting.isEndpage}
                      onChange={this.handleSwitch.bind(this)}
                      disabled={this.state.formSetting.isParent}
                      color='primary'
                      value="Endmenu"
                    />
                  }
                  className={classes.switchLabel}
                  labelPlacement="start"
                  label="Endseite"
                />
              </div>
            </div>
            <div className='centerEdit'>
              <TextField
                value={this.state.editForm.description}
                onChange={this.handleChangeInput.bind(this, 'description')}
                disabled={!this.state.formSetting.isEndpage}
                error={this.state.formSetting.descriptionError}
                id="outlined-multiline-static"
                label="Beschreibung"
                multiline
                rows="9"
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </div>
            <div className='rightEdit'>
              <div className='selectFileWraper'>
                <TextField
                  className={`${classes.disabledTextField} without-padding`}
                  InputProps={{
                    className: classes.disabledTextField,
                    endAdornment: <InputAdornment position="start">
                                    <i className="material-icons" onClick={this.handleClearFile.bind(this)}>
                                      clear
                                    </i>
                                  </InputAdornment>
                  }}
                  id="outlined-pdftitle"
                  label="PDF"
                  value={this.state.formSetting.fileName}
                  margin="normal"
                  variant="outlined"
                  disabled={true}
                  fullWidth
                />
                <input
                  id="outlined-button-file"
                  type="file"
                  className={classes.input}
                  onChange={this.handleFileName.bind(this)}
                  ref={this.fileInput}
                  accept='application/pdf'
                  disabled={!this.state.formSetting.isEndpage}
                />
                <label htmlFor="outlined-button-file">
                  <Button
                    variant="outlined"
                    component="span"
                    className={classes.button}
                    disabled={!this.state.formSetting.isEndpage}
                  >
                    File
                  </Button>
                </label>
              </div>
              <div className='selectFileWraper'>
                <TextField
                  className={`${classes.textField} without-padding`}
                  onChange={this.handleFileTitle.bind(this)}
                  disabled={!this.state.formSetting.isEndpage}
                  value={this.state.formSetting.fileTitle}
                  style={{marginTop: 0}}
                  id="outlined-pdftitle"
                  label="PDF Titel"
                  margin="normal"
                  variant="outlined"
                  error={false}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  component="span"
                  className={classes.button}
                  style={{marginTop: 0}}
                  onClick={this.handleUploadFile.bind(this)}
                  disabled={(!this.state.formSetting.isEndpage)||(!this.state.formSetting.fileIsSelected)||(this.state.formSetting.fileTitle==='')}
                >
                  Upload
                </Button>
              </div>
              {createPdfFileTable()}
            </div>
            <div className='saveEdit'>
              <i className="material-icons clear" onClick={this.handleClear.bind(this)}> clear </i>
              {savingState()}
            </div>
          </div>
          </MuiThemeProvider>
        );
      }

      var savingState = () => {
        if (this.state.isSaving) {
          return(
            <div className='savingState'>
              <CircularProgress
                size={20}
                thickness={4}
                className={classes.bottom}
              />
            </div>
          );
        }
        else {
          return(
            <i className="material-icons done" onClick={this.handleSaveEdit.bind(this)}> done </i>
          );
        }
      }

      // find title of id
      var findTitle = (data, id) => {
        if (id!==''){
          if (id!=='none') {
            var title = data.find(x => x.id === id).title
            return (
              <div className='parentHeader'>
                <div className='parentName'>
                  {title}
                </div>
              </div>
            )
          }
          else {
            return(
              <div className='parentHeader'>
                <div className='parentName'>
                  Neu
                </div>
              </div>
            )
          }
        }
      }

      // map over whole table
      let createTable = (data) => {
        // get unique parents
        var parents = [];
        for (var i=0; i< data.length; i++) {
          parents.push(data[i].parent);
        }
        parents = [... new Set(parents)];

        return parents.map( (par, k) => {
            return(
              <div id={par} key={par} className='parentContainer'>
              {findTitle(data, par)}
              {data.map( (row, i) => {
                if (row.parent === par) {
                  if (this.state.editIndex===i) {
                    let toggleClass = ((i%2)===0) ? "tableRowEdit even" : "tableRowEdit odd";
                    return(
                      <div className={toggleClass} key={row.id}>
                        {editForm(row)}
                      </div>
                    );
                  }
                  else {
                    let toggleClass = ((i%2)===0) ? "tableRow even" : "tableRow odd";
                    // get parent title
                    var parent = 'None';
                    if (row.parent === '') {
                      parent = '';
                    }
                    else {
                      for (var k=0; k < data.length; k++) {
                        if (data[k].id === row.parent) {
                          parent = data[k].title;
                          break;
                        }
                      }
                    }
                    return(
                      <div className={toggleClass} key={row.id} id={row.id}>
                        {rowTemplate(row.title, parent, row.description, row.pdfpath, row.parent, i)}
                      </div>
                    );
                  }
                }
              })}
              </div>
            )
        });            
      }

      var pdfTitles = (pdfpath) => {
        return pdfpath.map( (file, i)  => {
          return(
            <div className="pdfTitle" key={file.title+i}>
              <i className="material-icons pdfFile">description</i>
              <a>{file.title}</a>
            </div>
          );
        }
        )
      }

      const rowTemplate = (title, parent, description, pdfs, parentId, i) => {
        // active class for delete
        let activeClassBin = 'material-icons';
        for (var l = 0; l < this.state.menu.length; l++) {
          if ((this.state.menu[l].parent===this.state.menu[i].id)&&(l!==i)) {
            activeClassBin = 'material-icons isNotActive';
            break;
          }
        }

        // active class for moving upwards
        var activeClassMoveUpwards = 'material-icons move';
        var isActiveUp = true;
        if(i===0) {
          activeClassMoveUpwards = 'material-icons move isNotActive';
          isActiveUp = false;
        }
        else {
          if (this.state.menu[i-1].parent!==parentId) {
            activeClassMoveUpwards = 'material-icons move isNotActive';
            isActiveUp = false;
          }
        }

        // active class for moving downwards
        var activeClassMoveDownwards = 'material-icons move';
        var isActiveDown = true;
        if(i===this.state.menu.length-1) {
          activeClassMoveDownwards = 'material-icons move isNotActive';
          isActiveDown = false;
        }
        else {
          if (this.state.menu[i+1].parent!==parentId) {
            activeClassMoveDownwards = 'material-icons move isNotActive';
            isActiveDown = false;
          }
        }

        return(
            [<div className="titleRow" key={title+i}>
              <a>{title}</a>
            </div>,
            //<div className="parentRow" key={title+i+1}>
            //  <a>{parent}</a>
            //</div>,
            <div className="descriptionRow" key={title+i+3}>
              <a>{description}</a>
            </div>,
            <div className="pdfsRow" key={title+i+4}>
              <div className="pdfWraper">{pdfTitles(pdfs)}</div>
            </div>,
            <div className="editRow" key={title+i+5}>
              <a>
                <i className="material-icons" onClick={this.handleEdit.bind(this, i)}>edit</i>
                <i className={activeClassBin} onClick={this.handleDelete.bind(this, i)}>delete</i>
                <i className={activeClassMoveDownwards} onClick={this.moveDownwards.bind(this, i, isActiveDown)}>arrow_drop_down</i>
                <i className={activeClassMoveUpwards} onClick={this.moveUpwards.bind(this, i, isActiveUp)}>arrow_drop_up</i>
              </a>
            </div>]
        )
      }

      const tableHead = () => {
        return(
          <div className="tableHead">
            <div className="title">
              <a>Titel</a>
            </div>
            {//<div className="parent">
            //  <a>Parent</a>
            //</div>
            }
            <div className="description">
              <a>Beschreibung</a>
            </div>
            <div className="pdfs">
              <a>Pdfs</a>
            </div>
            <div className="edit">
              <a>Edit</a>
            </div>
          </div>
        )
      }

      if (this.state.loading) {
        return(
          <div className="head">
            <a>Inhalt</a>
            <div>
              <a>Loading...</a>
            </div>
          </div>
        )
      }
      else {
        if (this.state.state===false) {
          return(
            <div className="head">
              <a>Inhalt</a>
              <div>
                <a>Momentan existiert noch kein Menü.</a>
              </div>
            </div>
          )
        }
        else {
          return(
            <div className="head">
              <a>Inhalt</a>
                <div className="table">
                  {tableHead()}
                  <div id='tableRows'>
                    {createTable(this.state.menu)}
                  </div>
                </div>
                <div className="addTableRow">
                  <i className="material-icons" onClick={this.handleAdd.bind(this)}>
                    add_circle_outline
                  </i>
                </div>
            </div>
          )
        }
      }
    }
  }

  Maintenance.propTypes = {
    classes: PropTypes.object.isRequired,
  };

  export default withStyles(styles)(Maintenance);