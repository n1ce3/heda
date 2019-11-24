import React    from 'react';
import { Link } from 'react-router-dom'

import '../style/menuContent.scss'

var createParentPath = (titles, paths) => {
    return titles.map( (title, i) => {
      if (titles.length>1) {
        if (i===0) {
          return(
            <div className="subTitleContainer" key={title}>
              <div className="subTitle isActive">
                <Link to={`/${paths[i]}`}>{title}</Link>
              </div>
            </div>
          );
        }
        else {
          if (i < titles.length-1) {
            return(
              <div className="subTitleContainer" key={title}>
                <div>
                 <i className="material-icons style">chevron_right</i>
                </div>
                <div className="subTitle" title={title}>
                  <Link to={`/${paths[i]}`}>{title}</Link>
                </div>
              </div>
            );
          }
          else {
            return(
              <div className="subTitleContainer" key={title}>
                <div>
                 <i className="material-icons style">chevron_right</i>
                </div>
                <div className="subTitle isActive">
                  {title}
                </div>
              </div>
            );
          }
        }
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
      /* 
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
      }*/

    }
  );
}

export default createParentPath;
