import React, { Component }      from 'react';
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// handle pages
const changePages = (numPages, pageNumber, goNextPage, goPrevPage) => {
  if (pageNumber===1) {
    if (numPages===1) {
      return null
    }
    else {
      return(
        <div className="buttonForward" onClick={goNextPage} key="forwards">
          <i className="material-icons style" id="iconright">chevron_right</i>
        </div>
      );
    }
  }
  if (numPages===pageNumber) {
    if (numPages===1) {
      return null
    }
    return(
      <div className="buttonBack" onClick={goPrevPage} key="backwards">
        <i className="material-icons style" id="iconleft">chevron_left</i>
      </div>
    );
  }
  if (pageNumber!==1 && numPages!==pageNumber) {
    return(
      [<div className="buttonBack" onClick={goPrevPage} key="forwards">
        <i className="material-icons style" id="iconleft">chevron_left</i>
      </div>,
      <div className="buttonForward" onClick={goNextPage} key="backwards">
        <i className="material-icons style" id="iconright">chevron_right</i>
      </div>]
    );
  }
}

class ViewPDF extends Component {

  constructor(props) {
    super(props)
    this.state = {
      numPages:   null,
      pageNumber: 1,
      width:      null,
      pdfpath:    this.props.pdfpath
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.pdfpath !== this.props.pdfpath ){
      this.setState({
        pdfpath:    nextProps.pdfpath,
        numPages:   null,
        pageNumber: 1
      });
    }
    if(nextProps.width !== this.props.width ){
      this.setState({
        width: nextProps.width
      });
    }
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages: numPages });
    this.props.callbackNumPages(numPages);
  };

  goToPrevPage = () => {
    this.setState(state => ({ pageNumber: state.pageNumber - 1 }));
    this.props.callbackPageNumber(this.state.pageNumber - 1);
  }

  goToNextPage = () => {
    this.setState(state => ({ pageNumber: state.pageNumber + 1 }));
    this.props.callbackPageNumber(this.state.pageNumber + 1);
  }


  render() {
    const { pageNumber, numPages, width, pdfpath } = this.state;
      return(
        <div className="pdfWrapper">
          {changePages(numPages, pageNumber, this.goToNextPage, this.goToPrevPage)}
          <div>
            <Document
              className    ="pdfSheet"
              file         ={require('./../../../pdfs/'+`${pdfpath}`)}
              onLoadSuccess={this.onDocumentLoadSuccess}
            >
              <Page pageNumber={pageNumber} width={width}/>
            </Document>
          </div>
        </div>
    )
  }
}

export default (ViewPDF);
