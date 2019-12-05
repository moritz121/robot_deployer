const ipcRenderer = require('electron').ipcRenderer;


//My SQL Connection and Queries

console.log(`$ this: ${$.this}`);

$(() => { 

    let $table = jQuery('#table-hover-main');

    // Event listener
    jQuery(document).ready(function() {
        $table.on('click', 'tr', function() {
            console.log('Resquesting simulation with id: '+$(this).attr('id'));
            ipcRenderer.send('requestSimulation', $(this).attr('id'));
        });
    });

});