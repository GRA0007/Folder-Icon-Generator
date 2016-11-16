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
	if ($i > 0) {
		echo "Cleaned " . $i . " files from the temp folder.";
	} else {
		die('Found files, but none over 3 hours.');
	}
} else {
	die('Nothing to clean, folder empty.');
}
?>