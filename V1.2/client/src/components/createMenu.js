import React    from 'react';
import { Link } from 'react-router-dom'

// import Style
import '../style/box.scss'


// create Menu
var createMenu = (submenus) => {
  var sortedSubMenu = submenus.sort(function(a, b){
    var keyA = a.values.key,
        keyB = b.values.key;
    // Compare the 2 dates
    if(keyA < keyB) return -1;
    if(keyA > keyB) return 1;
    return 0;
  });
  return(
    sortedSubMenu.map(( submenu ) => {
      // no link if nothing to follow
      if (!((submenu.submenu.length===0)&&(submenu.values.pdfpath.length===0))) {
        return(
          <Link to={`/${submenu.values.path}`} key={submenu.values.title}>
            <div className="box" key={submenu.values.id} id={submenu.values.id}>
              <div className="content" key={submenu.values.key}>
                {submenu.values.title}
              </div>
            </div>
          </Link>
        );
      }
    else {
      return (
        <div className="box" key={submenu.values.title}>
          <div className="content" key={submenu.values.id}>
            {submenu.values.title}
          </div>
        </div>
        );
      }
    })
  );
}

export default createMenu;
