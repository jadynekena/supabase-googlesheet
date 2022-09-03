/********* SET YOUR GLOBAL PARAMETERS HERE ********/
//change them with yours
const SUPABASE_PROJECT = 'https://YOURPROJECTID.supabase.co'
const SUPABASE_API_KEY = 'YOURANONORSERVICEROLEAPIKEY'

const ID_SHEET = 'YOURSHEETID'
const NAME_TABLE = 'YOURTABLEORVIEW'
const WHERE_CONDITION = 'field=eq.fieldvalue'//check out the where condition in supabase API docs : https://supabase.com/docs/guides/api
/********* END OF YOUR GLOBAL PARAMETERS ********/







/********** OTHER VARIABLES YOU DON'T HAVE TO CHANGE ***********/
const TARGET_SHEET = SpreadsheetApp.openById(ID_SHEET)
const TARGET_SHEET_TAB = TARGET_SHEET.getSheets()[0] //this pulls datas into the first tab of your sheet. You can also use : TARGET_SHEET.getSheetByName('nameofyoursheettab') 
const SUPABASE_URL = SUPABASE_PROJECT + '/rest/v1/' 
/********** END OF OTHER VARIABLES YOU DON'T HAVE TO CHANGE ***********/









//run this manually first before creating your trigger
function main() {
  datas = get_datas(NAME_TABLE,WHERE_CONDITION)  
  insert_datas(TARGET_SHEET_TAB,datas)
}




/***************************************************** USEFUL FUNCTIONS DOWN BELOW **************************************************/
//depending on the where condition of your query, we use '?' or '&' in the fetched URL
function apikey(symbol){
  return symbol + 'apikey=' + SUPABASE_API_KEY
}

function get_datas(name_table,where_condition) {
  symbol = where_condition ? '&' : '?'
  url = SUPABASE_URL +  name_table + (where_condition ? "?" + where_condition : '') + apikey(symbol)
  
  //check in the logger if the url is ok
  console.log({url})

  //fetching with the right headers
  response = UrlFetchApp.fetch(url)

  //uncomment this if you want to monitor your datas
  /*
  console.log({response})
  console.log(response.getAllHeaders())
  */

  return response.getContentText();
}

function insert_datas(sh,jsondatas){
  //always clear previous versions
  sh.clear()

  var all_rows = [[]]
  if(JSON.parse(jsondatas).length > 0){
    all_rows = json2arrays(jsondatas)
    sh.getRange(1,1,all_rows.length,all_rows[0].length).setValues(all_rows)
  }
  console.log('INSERTED '+(all_rows.length)+' ROWS ' + ' WITH ' + all_rows[0].length + ' COLUMNS.' )
  return all_rows;
}

function json2arrays(jsoncontent){  
  var json_list = JSON.parse(jsoncontent)
  var array = [];
  var headers = []
  var firstline = json_list[0]
  if(firstline){
    headers =  Object.keys(firstline)
    array.push(headers)
  }  
  for(var i = 0; i < json_list.length; i++) {
    var obj = json_list[i];
    var temp = []
    Object.keys(obj).map((key) => temp.push(obj[key]))
    array.push(temp);
  }
  return array 
}





