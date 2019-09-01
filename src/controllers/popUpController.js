const ipcRenderer = require('electron').ipcRenderer;

let nWorkers = 0;
let tMin = 0;
let tMax = 0;

$(() => { 

    let $workersSelect = jQuery('$workersSelect');
    let $tMinInput = jQuery('$tMinInput');
    let $tMaxInput = jQuery('$tMaxInput');
    let $submit = jQuery('$submit');
    let $alert = jQuery('$alert');

    // Event listener
    jQuery(document).ready(function() {
        nWorkers = $workersSelect.val();
        tMin = $tMinInput.val();
        tMax = $tMaxInput.val();

        $submit.on('click', 'button', () => {
            if(nWorkers!=0 && tMin!=0 && tMax!=0) {
                ipcRenderer.send('requestAdquisitionSimulation', [nWorkers, tMin, tMax]);         
            } else {
                $alert.setAttribute("style", "display: block;");
            }
        });

    });

});
