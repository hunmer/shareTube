<?php
	header('Access-Control-Allow-Origin: *');
	if(!file_exists('data.json')){
		$json = [];
	}else{
		$json = json_decode(file_get_contents('data.json'), true);
	}
	if($_GET['key']){
		$key = $_GET['key'];
		if($json[$key]){
			echo json_encode($json[$key]);
		}
		exit();
	}
	$data = $_POST['data'];
	if(!$data) return;
	$ip = getString_left(getIp(), ',');
	$key = md5($data);
	$json[$key] = [
		'data' => $data,
		'ip' => $id];
		file_put_contents('data.json', json_encode($json));
	echo json_encode([key => $key]);
	exit();
	
function getString_left($s_text, $s_search){
	if(($i_start = strpos($s_text, $s_search, $i_start)) !== false){
		return substr($s_text, 0, $i_start);
	}
	return $s_text;
}

function getIp()
{
    if ($_SERVER["HTTP_CLIENT_IP"] && strcasecmp($_SERVER["HTTP_CLIENT_IP"], "unknown")) {
        $ip = $_SERVER["HTTP_CLIENT_IP"];
    } else {
        if ($_SERVER["HTTP_X_FORWARDED_FOR"] && strcasecmp($_SERVER["HTTP_X_FORWARDED_FOR"], "unknown")) {
            $ip = $_SERVER["HTTP_X_FORWARDED_FOR"];
        } else {
            if ($_SERVER["REMOTE_ADDR"] && strcasecmp($_SERVER["REMOTE_ADDR"], "unknown")) {
                $ip = $_SERVER["REMOTE_ADDR"];
            } else {
                if (isset ($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'],
                        "unknown")
                ) {
                    $ip = $_SERVER['REMOTE_ADDR'];
                }
            }
        }
    }
    return $ip;
}

