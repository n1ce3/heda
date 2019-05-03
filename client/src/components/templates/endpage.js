import React, { Component }      from 'react';
import { Document, Page, pdfjs } from "react-pdf";
import ParentPath                from '../createParentPath.js'
import ViewPDF                   from '../viewPDF.js'
import PdfFooter                 from '../createPdfFooter.js'


import sizeMe                    from 'react-sizeme';

import '../../style/endPage.scss'

const togglePdf = (pdfPaths, handlePdf, active) => {
  if (pdfPaths.length === 1) {
    return(
      null
    );
  }
  else {
    return(
      <div className="pdfOptionWrapper">
        {pdfPaths.map(( paths, index ) => {
          let activeStyle = (active===index) ? "pdfBox active" : "pdfBox";
          return<div className={activeStyle} onClick={()=>handlePdf(paths.path, index)} key={paths.title}><a>{paths.title}</a></div>})}
      </div>
    );
  }
}


class EndPage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      paths:      this.props.parentPath,
      titles:     this.props.parentTitle,
      pdfpath:    this.props.values.pdfpath[0].path,
      pdfPaths:   this.props.values.pdfpath,
      width:      null,
      numPages:   null,
      pageNumber: 1,
      active:     0
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.paths !== this.props.paths){
      this.setState({
        pdfpath:nextProps.values.pdfpath
      });
    }
  }

  componentDidMount () {
    this.setDivSize()
    window.addEventListener("resize", this.setDivSize)
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.setDivSize)
  }

  setDivSize = () => {
    this.setState({width: this.endContainer.getBoundingClientRect().width})
  }

  pdfCallbackNumPages = (childNumPages) => {
    this.setState({
      numPages:   childNumPages,
    })
  }

  pdfCallbackPageNumber = (childPageNumber) => {
    this.setState({
      pageNumber:   childPageNumber,
    })
  }

  handlePdf = (pdfpath, index) => {
    this.setState({
      pdfpath:    pdfpath,
      pageNumber: 1,
      active:     index
    })
  }

  render() {
    const { width, pdfpath, pageNumber, numPages, pdfPaths, active} = this.state;
      return(
        <div id="endContainer" className="endContainer" ref={(ref) => this.endContainer = ref}>
          <div className="parentPathContainer">
            {ParentPath(this.state.titles, this.state.paths)}
          </div>
          <div className="endDescription">
            {this.props.values.description}
          </div>
          {togglePdf(pdfPaths, this.handlePdf, active)}
          <ViewPDF pdfpath={pdfpath}
                   width={width}
                   callbackNumPages={this.pdfCallbackNumPages}
                   callbackPageNumber={this.pdfCallbackPageNumber}>
          </ViewPDF>
          <PdfFooter pageNumber={pageNumber}
                     numPages={numPages}
                     pdfpath={pdfpath}>
          </PdfFooter>
        </div>
    )
  }
}

export default sizeMe({ monitorWidth: true })(EndPage);
