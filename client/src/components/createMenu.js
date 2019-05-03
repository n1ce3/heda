import React    from 'react';
import { Link } from 'react-router-dom'

// import Style
import '../style/box.scss'



// create Menu
var createMenu = (submenus) => {
  return(
    submenus.map(( submenu ) => (
        <Link to={`/${submenu.values.path}`} key={submenu.values.id}>
          <div className="box">
            <div className="content">
              <a>{submenu.values.title}</a>
            </div>
          </div>
        </Link>
    ))
  );
}

export default createMenu;
