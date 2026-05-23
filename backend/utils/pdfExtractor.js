const PDFParser = require('pdf2json');

function extractTextFromPDF(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on('pdfParser_dataError', (err) => {
      reject(new Error('Failed to parse PDF: ' + err.parserError));
    });

    pdfParser.on('pdfParser_dataReady', () => {
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });

    pdfParser.parseBuffer(buffer);
  });
}

module.exports = { extractTextFromPDF };