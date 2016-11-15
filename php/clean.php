<?php
  $files = glob("../temp/*");
  $now   = time();

  if (count($files) != 0) {
	  $i = 0;
	  foreach ($files as $file) {
		if (is_file($file)) {
		  if ($now - filemtime($file) >= 60 * 60 * 3) { // 3 hours
			unlink($file);
			$i++;
		  }
		}
	  }
	  echo "Cleaned " . $i . " files from the temp folder.";
  } else {
	  die('Nothing to clean.');
  }
?>