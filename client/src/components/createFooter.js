import React from 'react';
import '../style/footer.css'

// creates a footer
const footer = () => {
  return(
    <footer className="footer">
      <div className="mainFooter">
        {'ARUNDIO \u00A9 Ute Arnold'}
      </div>
      <div className="subFooter">
        {'designed and created by Elias Arnold'}
      </div>
    </footer>

  )
}

export default footer;
