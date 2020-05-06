const FreshBooks = require("freshbooks-api");

export interface freshbookClient {
  token: string;
}

export interface freshbookXMLRequest {
  xmlString: string;
}

export const testThis: freshbookXMLRequest = { xmlString: "" };

const api_url = "https://callawaycloudconsulting.freshbooks.com/api/2.1/xml-in";
const api_token = "84ab11cf81ffd7f7d3dd2e65d085a7bf";

export function testIntegration() {
  /*var freshbooks = new FreshBooks(api_url, api_token),
    timeEntryList = new freshbooks.Time_Entry();*/

  console.log("test");
  //console.log(timeEntryList.list);

  /*invoice.get(invoice_id, function (err, invoice) {
    if (err) {
      //returns if an error has occured, ie invoice_id doesn't exist.
      console.log(err);
    } else {
      console.log("Invoice Number:" + invoice.number);
    }
  });*/

  var freshbooks = new FreshBooks(api_url, api_token);

  freshbooks.estimate.list(function (error: any, estimates: any) {
    console.log(error);
    console.log(estimates);
    /* do things */
  });
}
