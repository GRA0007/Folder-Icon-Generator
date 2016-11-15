<?php
  $files = glob("../temp/*");
  $now   = time();

  if (count($files) != 0) {
	  foreach ($files as $file)
		if (is_file($file))
		  if ($now - filemtime($file) >= 60 * 60 * 3) // 3 hours
			unlink($file);
  } else {
	  die('Nothing to clean.');
  }
?>