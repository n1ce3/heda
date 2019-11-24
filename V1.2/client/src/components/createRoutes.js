import React      from 'react';
import { Route }  from 'react-router-dom'
import SubMenu    from './templates/submenu'
import EndPage    from './templates/endpage'
import MaiPage    from './templates/maintenance'
import cloneDeep  from 'lodash/cloneDeep';

// create routes for menu
// sub menu routes
var subMenuRoute = (route, parentPath, parentTitle) => {
  return (
    <Route
    exact path={`/${route.values.path}`}
    key       ={route.values.id}
    render    ={(props) => <SubMenu {...props}  values     ={route.values}
                                                submenus   ={route.submenu}
                                                parentPath ={parentPath}
                                                parentTitle={parentTitle}
                                           />}
    />
  );
}

// end page routes
var endPageRoute = (route, parentPath, parentTitle) => {
  return (
    <Route
    exact path={`/${route.values.path}`}
    key       ={route.values.id}
    render    ={(props) => <EndPage {...props}  values     ={route.values}
                                                parentPath ={parentPath}
                                                parentTitle={parentTitle}
                                           />}
    />
  );
}

// maintenance route
var maintenanceRoute = (route, onClick) => {
  return (
    <Route
      exact path={`/${route.path}`}
      key       ={route.id}
      render    ={(props) => <MaiPage {...props} onClick={onClick}/>}
    />
  );
}

// creates routes for all using subMenuRoute and endPageRoute
var createRoutes = (menus, tempArray, tempPath, tempTitle) => {

    var lastDeleted = false

    menus.map(( link ) => {
      if (link.values.pdfpath.length === 0) {

        var tempParentPathInner  = cloneDeep(tempPath)
        var tempParentTitleInner = cloneDeep(tempTitle)

        // add parent path and title in array to remember later
        tempParentPathInner.push(link.values.path)
        tempParentTitleInner.push(link.values.title)

        // put current route in array to loop over in Switch
        tempArray.push(subMenuRoute(link, tempParentPathInner, tempParentTitleInner))

        // do the same again
        createRoutes(link.submenu, tempArray, tempParentPathInner, tempParentTitleInner)
        return null
      }
      // if submenu doesnt has submenu recursion is at end
      else {

        var tempParentPath  = cloneDeep(tempPath)
        var tempParentTitle = cloneDeep(tempTitle)

        // push both temp arrays with values of current link to pass them to the subroute
        tempParentPath.push(link.values.path)
        tempParentTitle.push(link.values.title)

        // create route
        tempArray.push(endPageRoute(link, tempParentPath, tempParentTitle))

        return null
      }
    }
  )
}

// returns a array containing the routes
var routesArray = (menus, onClick) => {
  var tempArray = []
  var tempPath  = [""]
  var tempTitle = ["Home"]

  var menu = cloneDeep(menus.slice(0,-1))

  // create routes for submenus and endpages
  createRoutes(cloneDeep(menu), tempArray, cloneDeep(tempPath), cloneDeep(tempTitle))

  console.log('ROUTES: ', tempArray)

  // create and add route for maintenance page
  tempArray.push(maintenanceRoute(menus.slice(-1)[0], onClick))

  return tempArray
}

export default routesArray;
