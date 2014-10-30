<?php
 //$mailto="받는주소";
 $song = $_GET["songTitle"];
 $charset='UTF-8';
 $mailto="iam@syung.kr";
 $fromName="셩뮤직";
 $subject="[음악수정요청] $song";
 $body=$song;
 $body = iconv('utf-8', 'euc-kr', $body);  //본문 내용 UTF-8화
 $encoded_subject="=?".$charset."?B?".base64_encode($subject)."?=\n"; // 인코딩된 제목
 if($song){	
	$result=mail($mailto, $encoded_subject, $body);
 }
 if($result){
  echo true;
  }else  {
  echo false;
 }

?>