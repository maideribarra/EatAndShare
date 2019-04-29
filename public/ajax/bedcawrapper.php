 <?php
 use StaticKidz\BedcaAPI\BedcaClient;
function add(){
  $client = new BedcaClient();

  $foodGroups = $client->getFoodGroups();
  return $foodGroups;
}

    header('Content-Type: application/json');

    $aResult = array();

    if( !isset($_POST['functionname']) ) { $aResult['error'] = 'No function name!'; }

    if( !isset($aResult['error']) ) {

        switch($_POST['functionname']) {
            case 'add':
               echo add();
               break;
               }        
           }

    

    

?>