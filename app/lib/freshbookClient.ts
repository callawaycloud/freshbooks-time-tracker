const FreshBooks = require('freshbooks-api');

export interface FreshbookClient {
  token: string;
}

export interface FreshbookXMLRequest {
  xmlString: string;
}

export const testThis: FreshbookXMLRequest = { xmlString: '' };

const apiUrl = 'https://callawaycloudconsulting.freshbooks.com/api/2.1/xml-in';
const apiToken = 'asfsdas';

export function testIntegration() {
  /* var freshbooks = new FreshBooks(apiUrl, apiToken),
    timeEntryList = new freshbooks.Time_Entry(); */
  // console.log(timeEntryList.list);

  /* invoice.get(invoice_id, function (err, invoice) {
    if (err) {
      //returns if an error has occured, ie invoice_id doesn't exist.
      console.log(err);
    } else {
      console.log("Invoice Number:" + invoice.number);
    }
  }); */

  const freshbooks = new FreshBooks(apiUrl, apiToken);

  freshbooks.estimate.list(function(error: any, estimates: any) {
    console.log(error);
    console.log(estimates);
    /* do things */
  });
}
