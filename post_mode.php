<?php

//require_once( '../../../wp-load.php' );

$path = preg_replace('/wp-content(?!.*wp-content).*/','',__DIR__);
include($path.'wp-load.php');

$data=file_get_contents('php://input');

/*file_put_contents('postback_result_'.$id.'_'.date("Y-m-d H:i:s") .'log', $data);*/

$obj=json_decode($data);
$id=$obj->ref;


    $wpdb->query( $wpdb->prepare("UPDATE wp_plagia_rapports 
                SET reponse = %s , received_at = %s
             WHERE id = %s",$data, date('Y-m-d H:i:s'),$id)
    );


