var datefield = document.createElement("input")
datefield.setAttribute("type", "date")
if (datefield.type != "date") { //if browser doesn't support input type="date", load files for jQuery UI Date Picker
    document.write('<link href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/base/jquery-ui.css" rel="stylesheet" type="text/css" />\n')
    document.write('<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"><\/script>\n') 
    console.log('doesnt support date input type. initializing jquery ui. . .');
} else {
  console.log('date input type supported. jquery ui omitted.');  
}
