const ipcRenderer = require('electron').ipcRenderer;

let nWorkers = 0;



$(() => { 

    let $div = jQuery('#res');
    let $workersSelect = jQuery('#workersSelect');
    let $submit = jQuery('#submit');
    let $alert = jQuery('#alert');

    // Event listener
    jQuery(document).ready(function() {

        $submit.on('click', () => {

            nWorkers = $workersSelect.val();

            if(nWorkers>0) {
                $alert.attr("style", "display: none;");
                ipcRenderer.send('requestResolutionSimulation', [nWorkers]); 
                $submit.attr("style", "display: none");

            } else {
                $alert.setAttribute("style", "display: block;");
            }
        });

        ipcRenderer.on('resolutionSimulationResult', (e, res)=> {
            console.log("Hello world");
            console.log(`Res: ${res}`);
            $div.empty();
            $div.attr("class", "alert alert-dismissible alert-info");  
            $div.attr("style", "margin-top: 50px;")
            $div.append(`<button type="button" class="close" data-dismiss="alert">&times;</button>
            <strong>${JSON.stringify(res)}</strong>`);

        });

    });

});