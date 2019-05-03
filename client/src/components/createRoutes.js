import React      from 'react';
import { Route }  from 'react-router-dom'
import SubMenu    from './templates/submenu'
import EndPage    from './templates/endpage'

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

// creates routes for all using subMenuRoute and endPageRoute
var createRoutes = (menus, tempArray, tempPath, tempTitle) => {

    var lastDeleted     = false
    var tempParentPath  = tempPath.slice()
    var tempParentTitle = tempTitle.slice()

    menus.map(( link ) => {
      if (Object.keys(link.submenu).length > 0) {

        // add parent path and title in array to remember later
        tempPath.push(link.values.path)
        tempTitle.push(link.values.title)

        // put current route in array to loop over in Switch
        tempArray.push(subMenuRoute(link, tempPath.slice(), tempTitle.slice()))

        // do the same again
        createRoutes(link.submenu, tempArray, tempPath, tempTitle)
        return null
      }
      // if submenu doesnt has submenu recursion is at end
      else {
        // put last elements out of the arrays
        // but just once
        if(!lastDeleted) {
          tempPath.pop()
          tempTitle.pop()
          lastDeleted = true
        }

        // push both temp arrays with values of current link to pass them to the subroute
        tempParentPath.push(link.values.path)
        tempParentTitle.push(link.values.title)

        // create route
        tempArray.push(endPageRoute(link, tempParentPath.slice(), tempParentTitle.slice()))

        // pop them out again to not remember them in the next loop
        tempParentPath.pop()
        tempParentTitle.pop()

        return null
      }
    }
  )
}

// returns a array containing the routes
var routesArray = (menus) => {
  var tempArray = []
  var tempPath  = [""]
  var tempTitle = ["Home"]
  createRoutes(menus, tempArray, tempPath, tempTitle)
  return tempArray
}

export default routesArray;
