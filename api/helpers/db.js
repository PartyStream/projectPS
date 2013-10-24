/**
+   \brief doesIdExist
+
+       This function will check any table for a given ID
+
+   \author Salvatore D'Agostino
+   \date  2013-10-22
+   \param tableName   The name of the table to check
+   \param id     The ID of interest
+   \param client Database connection
+   \param func   The callback function
+
+   \return True if exists, False otherwise
**/
function doesIdExist(tableName,id,client,func)
{
  console.log('Checking for ID: '+id+' in table: '+tableName);
  query = client.query({
      name: 'Check for ID on table',
      text: "SELECT COUNT(id) FROM " + tableName + " WHERE id = $1",
      values: [id]
  });
  query.on('row', function(row, result) {
    result.addRow(row);
  });

  query.on('error', function(err) {
    console.dir(err);
  });

  query.on('end',function(result){
    console.dir(result);
    if (result === false) {
      func(false);
    } else if (result.rowCount === 0 || result.rowCount === null) {
      func(false);
    } else {
      if (result.rowCount > 0) {
        func(true);
      } else {
        func(false);
      }
    }
  });

}// END function doesIdExist
exports.doesIdExist = doesIdExist;