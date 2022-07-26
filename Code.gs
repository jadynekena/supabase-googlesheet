/********* SET YOUR GLOBAL PARAMETERS HERE (check main() function afterwards) ********/
//change them to yours
const SUPABASE_PROJECT = 'https://YOURPROJECTID.supabase.co'
const SUPABASE_API_KEY = 'YOURANONORSERVICEROLEAPIKEY'
const ID_SHEET = 'YOURIDSHEETFROMGOOGLESHEETS'

//in french version, google sheet delimiter is semi colon (;)
//You can adapt it to yours BUT BE AWARE OF THAT IF YOUR GOOGLE SHEET DELIMITER IS CONTAINED IN YOUR PULLED DATAS, INSERTING DATAS TO YOUR SHEET MIGHT WORK IMPROPERLY. SEE THE NEXT PARAMETER TO HELP WITH IT.
const SHEET_DELIMITER = ';'

//You can disable column split (and do it manually) by setting this to false
const COLUMN_SPLIT = true
/********* END OF YOUR GLOBAL PARAMETERS (check main() function afterwards) ********/







/********** OTHER VARIABLES YOU DON'T HAVE TO CHANGE ***********/
//pulls datas into the first tab of your sheet 
const TARGET_SHEET = SpreadsheetApp.openById(ID_SHEET)
const TARGET_SHEET_TAB = TARGET_SHEET.getSheets()[0] //or use TARGET_SHEET.getSheetByName('nameofyoursheettab') 

//this is important to get datas as CSV and NOT json from supabase API
const opt = {
    'headers': {
      'Accept':	'text/csv'
    }
}
const SUPABASE_URL = SUPABASE_PROJECT + '/rest/v1/' 
/********** END OF OTHER VARIABLES YOU DON'T HAVE TO CHANGE ***********/









//run this manually first before creating your trigger
function main() {
  //change the nametable to whatever you want
  const NAME_TABLE = 'dernieres_donnees'
  const WHERE_CONDITION = 'Departement=eq.Informatique'//check out the where condition in supabase API docs : https://supabase.com/docs/guides/api
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
  response = UrlFetchApp.fetch(url, opt)

  //uncomment this if you want to monitor your datas
  /*
  console.log({response})
  console.log(response.getAllHeaders())
  */

  return response.getContentText();
}

function empty_sheet(sh){
  sh.clear()
}

function insert_datas(sh,val,split_with){
  //always clear previous versions
  empty_sheet(sh)

  all_rows = rearrangecsv(val)
  nb_rows = all_rows.length
  nb_col = all_rows[0].length

  sh.getRange(1,1,nb_rows,nb_col).setValues(all_rows)

  if(COLUMN_SPLIT){
    if(split_with){
      sh.getRange('A:A').splitTextToColumns(split_with);
    }else{
      sh.getRange('A:A').splitTextToColumns();
    }
  }

  console.log('INSERTED '+nb_rows+' ROWS.')

}

function rearrangecsv(csvContent){
  console.log('\n\nREARRANGING CSV...')

	res = csvContent.split('\n').map(e => e.split(SHEET_DELIMITER))
  console.log(res[100])
	initial_rows = res.length
	res = res.map(row => row.map(e => e.trim()))
  console.log(res[100])

	console.log('Keeping '+res.length+' / '+initial_rows+' rows.')
  return res
}

