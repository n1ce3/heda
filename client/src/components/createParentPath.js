import React    from 'react';
import { Link } from 'react-router-dom'

import '../style/menuContent.css'

var createParentPath = (titles, paths) => {
     return titles.map( (title, i) => {
      if (i < titles.length-1) {
        return(
          <div className="subTitleContainer" key={title}>
            <div className="subTitle" title={title}>
              <Link to={`/${paths[i]}`}>{title}</Link>
            </div>
            <div>
             <i className="material-icons style">chevron_right</i>
            </div>
          </div>
        );
      }
      else {
        return(
          <div className="subTitleContainer" key={title}>
            <div className="subTitle isActive">
              {title}
            </div>
          </div>
        );
      }
    }
  );
}

export default createParentPath;
