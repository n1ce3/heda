import React, { Component }        from 'react';
import { BrowserRouter as Router } from 'react-router-dom'
import MainMenu                    from './components/templates/menu'

class App extends Component {
  render() {
    return (
      <Router>
        <MainMenu/>
      </Router>
    )
  }
}

export default App
