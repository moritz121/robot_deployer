const ipcRenderer = require('electron').ipcRenderer;

let nWorkers = 0;
let tMin = 0;
let tMax = 0;



$(() => { 

    let $div = jQuery('#res');
    let $workersSelect = jQuery('#workersSelect');
    let $tMinInput = jQuery('#tMinInput');
    let $tMaxInput = jQuery('#tMaxInput');
    let $submit = jQuery('#submit');
    let $alert = jQuery('#alert');

    // Event listener
    jQuery(document).ready(function() {

        $submit.on('click', () => {

            nWorkers = $workersSelect.val();
            tMin = $tMinInput.val();
            tMax = $tMaxInput.val();

            if(nWorkers>0 && tMin>0 && tMax>tMin) {
                $alert.attr("style", "display: none;");
                ipcRenderer.send('requestAnalysisSimulation', [nWorkers, tMin, tMax]); 
                $submit.attr("style", "display: none");        
            } else {
                $alert.setAttribute("style", "display: block;");
            }
        });

        ipcRenderer.on('analysisSimulationResult', (e, res)=> {
            $div.empty();
            $div.attr("class", "alert alert-dismissible alert-info");  
            $div.attr("style", "margin-top: 50px;")
            $div.append(`<button type="button" class="close" data-dismiss="alert">&times;</button>
            <strong>${JSON.stringify(res)}</strong>`);

        });

    });

});