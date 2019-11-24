import React, { Component }      from 'react';

class PdfFooter extends Component {

  constructor(props) {
    super(props)
    this.state = {
      pdfpath:    this.props.pdfpath,
      numPages:   this.props.numPages,
      pageNumber: this.props.pageNumber,
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.pageNumber !== this.props.pageNumber ||
      nextProps.numPages !== this.props.numPages ||
      nextProps.pdfpath !== this.props.pdfpath){
      this.setState({
        pageNumber: nextProps.pageNumber,
        numPages:   nextProps.numPages,
        pdfpath:    nextProps.pdfpath
      });
    }
  }


  render() {
    const { pdfpath, pageNumber, numPages } = this.state;
      return(
        <div className="pdfFooter">
          <div className="pageNumber">
            <a>Seite {pageNumber} von {numPages}</a>
          </div>
          <div className="downloadContainer">
            <a href={require('./../../../pdfs/'+`${pdfpath}`)} target="_blank">Download</a>
            <i className="material-icons">vertical_align_bottom</i>
          </div>
        </div>
    )
  }
}

export default (PdfFooter);
