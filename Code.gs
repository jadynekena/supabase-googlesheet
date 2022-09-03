/********* SET YOUR GLOBAL PARAMETERS HERE ********/
//change them with yours
const SUPABASE_PROJECT = 'https://YOURPROJECTID.supabase.co'
const SUPABASE_API_KEY = 'YOURANONORSERVICEROLEAPIKEY'

const ID_SHEET = 'YOURSHEETID'
const NAME_TABLE = 'YOURTABLEORVIEW'
const WHERE_CONDITION = 'field=eq.fieldvalue'//check out the where condition in supabase API docs : https://supabase.com/docs/guides/api
const BATCH_SIZE = 2500 //Set this to a number SMALLER than your supabase max row limits (https://data-addict.jadynekena.com/pull-datas-from-supabase-to-google-sheets/#:~:text=Your%20supabase%20max%20rows%20limit,%20which%20can%20be%20changed%20here)
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

function localTest(){
  const res = get_datas(NAME_TABLE,'')
  console.log(res)
}

function get_datas(name_table,where_condition){
  var finalDatas = []

  //get 1st data to know the exact amount of datas
  const content_range = get_datas_chunk(name_table,where_condition,0,1,true)
  const number_of_records = content_range.split('/')[1]
  console.log({number_of_records})
  
  for(var optionalOffset = 0 ; optionalOffset <= number_of_records ; optionalOffset = optionalOffset+BATCH_SIZE ){
    console.log('\n\n\n\noptionalOffset',optionalOffset + ' / ' + number_of_records)
    const temp = get_datas_chunk(name_table,where_condition,optionalOffset,BATCH_SIZE)    
    const sizeCharLog = 500
    console.log('     '+sizeCharLog+' last characters = ',temp.slice(temp.length - sizeCharLog))
    const tempJSONarray = JSON.parse(temp)
    
    finalDatas.push.apply(finalDatas, tempJSONarray);
    console.log('     current retrieved datas size = ' + finalDatas.length )
  }

  return JSON.stringify(finalDatas)
}

function get_datas_chunk(name_table,where_condition,optionalOffset,optionalBatchsize,content_range_mode) {
  symbol = where_condition ? '&' : '?'
  url = SUPABASE_URL +  name_table + (where_condition ? "?" + where_condition : '') + apikey(symbol)
  
  url += optionalOffset ? '&offset='+optionalOffset : ""
  url += optionalBatchsize ?  '&limit=' + optionalBatchsize :
          BATCH_SIZE ? '&limit=' + BATCH_SIZE : ""
  

  //check in the logger if the url is ok
  console.log({url})

  //fetching with the right headers
  response = UrlFetchApp.fetch(url, {
    headers : content_range_mode ?	{Prefer: 'count=exact'} : {}
  })

  const content_range = response.getAllHeaders()['Content-Range'] //'Content-Range': '0-0/29131',
  //uncomment this if you want to monitor your datas
  /*
  console.log({content_range})
  console.log({response})
  console.log(response.getAllHeaders())
  */




  return content_range_mode ? content_range : response.getContentText();
}

async function insert_async(sh, all_rows){
  sh.getRange(1,1,all_rows.length,all_rows[0].length).setValues(all_rows)
  return all_rows
}

function insert_datas(sh,jsondatas){
  //always clear previous versions
  sh.clear()

  var all_rows = [[]]
  if(JSON.parse(jsondatas).length > 0){
    all_rows = json2arrays(jsondatas)
    insert_async(sh, all_rows) //async function => it doesn't wait for the function to end
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