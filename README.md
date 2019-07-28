# robot_deployer



const mysql = require('mysql');
const connection = mysql.createConnection({
host: '34.77.222.32',
user: 'root',
password: 'root',
database: 'db_nuclear_analisys'
});




    let $table = jQuery('#table-hover-main');

    connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
    });

    connection.query('select (ID_Aquired_Tubes) from Aquired_Tubes;', function (error, qResults, fields) {
        if (error) throw error;
        console.log('The solution is: ', qResults[0].ID_Aquired_Tubes);

        for(var i=0; i<Object.keys(qResults).length; i++) {
            $table.append('<tr class="table-secondary-tube" id="'+qResults[i].ID_Aquired_Tubes+'">'+'<th scope="row">Tube '+qResults[i].ID_Aquired_Tubes+'</th>'+'<td></td>'+'</tr>');
        }

    });

    connection.end();