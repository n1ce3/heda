import React    from 'react';
import { Link } from 'react-router-dom'
import '../style/footer.scss'

// creates a footer
const footer = (maintenance, status, handleHide) => {
  if (status) {
    return(
      <footer className="footer" onClick={handleHide}>
        <div className="leftFooter"></div>
        <div className="centerFooter">
          <div className="mainFooter">
            {'ARUNDIO \u00A9 Ute Arnold'}
          </div>
          <div className="subFooter">
            {'designed and created by Elias Arnold'}
          </div>
        </div>
        <Link to={`/${maintenance.path}`} key={maintenance.id}>
          <div className="rightFooter">
            <div className="maintenance">
              {'Bearbeiten'}
            </div>
          </div>
        </Link>
      </footer>
    )
  }
  else {
    return(
      <footer className="footer" onClick={handleHide}>
        <div className="leftFooter"></div>
        <div className="centerFooter">
          <div className="mainFooter">
            {'ARUNDIO \u00A9 Ute Arnold'}
          </div>
          <div className="subFooter">
            {'designed and created by Elias Arnold'}
          </div>
        </div>
        <div className="rightFooter">
            <div className="maintenance">
            </div>
          </div>
      </footer>
    )
  }
}

export default footer;
