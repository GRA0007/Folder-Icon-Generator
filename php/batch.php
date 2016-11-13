<?php
//To allow for image downloading and such
ini_set('max_execution_time', 600); //10 minutes

//A better colorize filter
function duotone_image($image, $rplus, $gplus, $bplus, $pcnt) {
  // Adapted from http://www.tuxradar.com/practicalphp/11/2/21
  
  $imagex = imagesx($image);
  $imagey = imagesy($image);
  
  $image2 = imagecreatetruecolor($imagex, $imagey);
  imagesavealpha($image2, true);
  imagealphablending($image2, false);
  
  for ($x = 0; $x <$imagex; ++$x) {
    for ($y = 0; $y <$imagey; ++$y) {
      $rgb = imagecolorat($image, $x, $y);
      $color = imagecolorsforindex($image, $rgb);
      $grey = floor(($color['red']+$color['green']+$color['blue'])/3);
      if ($pcnt) {
        $red = $grey + $grey*($rplus/150);
        $green = $grey + $grey*($gplus/150);
        $blue = $grey + $grey*($bplus/150);
      } else {
        $red = $grey + $rplus;
        $green = $grey + $gplus;
        $blue = $grey + $bplus;
      }
      
      if ($red > 255) $red = 255;
      if ($green > 255) $green = 255;
      if ($blue > 255) $blue = 255;
      if ($red < 0) $red = 0;
      if ($green < 0) $green = 0;
      if ($blue < 0) $blue = 0;
      
      $newcol = imagecolorallocatealpha($image2, $red,$green,$blue,$color['alpha']);
      imagesetpixel ($image2, $x, $y, $newcol);
    }
  }
  imagealphablending($image2, true);
  return $image2;
}

//Thanks David Walsh
function create_zip($files = array(),$destination = '',$overwrite = false) {
	//if the zip file already exists and overwrite is false, return false
	if(file_exists($destination) && !$overwrite) { return false; }
	//vars
	$valid_files = array();
	//if files were passed in...
	if(is_array($files)) {
		//cycle through each file
		foreach($files as $file) {
			//make sure the file exists
			if(file_exists($file)) {
				$valid_files[] = $file;
			}
		}
	}
	//if we have good files...
	if(count($valid_files)) {
		//create the archive
		$zip = new ZipArchive();
		if($zip->open($destination,($overwrite && file_exists($destination)) ? ZIPARCHIVE::OVERWRITE : ZIPARCHIVE::CREATE) !== true) {
			return false;
		}
		//add the files
		foreach($valid_files as $file) {
			$zip->addFile($file, basename($file));
		}
		//debug
		//echo 'The zip archive contains ',$zip->numFiles,' files with a status of ',$zip->status;
		
		//close the zip -- done!
		$zip->close();
		
		//check to make sure the file exists
		return file_exists($destination);
	}
	else
	{
		return false;
	}
}

//Output a human-readable file size
function FileSizeConvert($bytes) {
    $bytes = floatval($bytes);
        $arBytes = array(
            0 => array(
                "UNIT" => "TB",
                "VALUE" => pow(1024, 4)
            ),
            1 => array(
                "UNIT" => "GB",
                "VALUE" => pow(1024, 3)
            ),
            2 => array(
                "UNIT" => "MB",
                "VALUE" => pow(1024, 2)
            ),
            3 => array(
                "UNIT" => "KB",
                "VALUE" => 1024
            ),
            4 => array(
                "UNIT" => "B",
                "VALUE" => 1
            ),
        );

    foreach($arBytes as $arItem)
    {
        if($bytes >= $arItem["VALUE"])
        {
            $result = $bytes / $arItem["VALUE"];
            $result = str_replace(".", "." , strval(round($result, 1)))." ".$arItem["UNIT"];
            break;
        }
    }
    return $result;
}

if (!empty($_POST)) {

	$unique_id = uniqid(); //Generate a unique id for this batch job
	mkdir('../temp/' . $unique_id); //Make a folder
	$path = '../temp/' . $unique_id . '/'; //The save path for everything

	require 'class-php-ico.php';
	$files_to_zip = array();

	//turn base64'd and json'd array into a php array
	$imageArray = json_decode(base64_decode($_POST['images']), true);
	//die( json_encode($imageArray, true));
	
	//Script settings
	$cover_enabled = true; //Whether or not the cover image is enabled (true)
	//$cover_width = 325; //Width of cover (325px)
	$cover_height = 460; //Width of cover (325px)
	$rotation = -3; //Rotation of cover (-3deg)
	$cover_x = 170; //X Position of cover in image (170px)
	$cover_y = 50; //Y Position of cover in image (50px)
	
	$sizes = array(
		array(16, 16),
		array(32, 32),
		array(48, 48),
		array(64, 64),
		array(128, 128),
		array(256, 256)
	);

	if (isset($_POST['coverWidth']))
		$cover_height = $_POST['coverHeight'];
	if (isset($_POST['rotation']))
		$rotation = $_POST['rotation'];
	if (isset($_POST['coverX']))
		$cover_x = $_POST['coverX'];
	if (isset($_POST['coverY']))
		$cover_y = $_POST['coverY'];
	if (isset($_POST['sizes']) && count($_POST['sizes']) > 0)
		$sizes = json_decode(base64_decode($_POST['sizes']));
	if (isset($_POST['coverEnabled']))
		$cover_enabled = $_POST['coverEnabled'];
	
	//die(json_encode($sizes));

	$i = 0;
	foreach ($imageArray as $curImage) {
		//$cover_url = '../res/misc/80271.jpg';
		$cover_url = /*'https://crossorigin.me/' . */$curImage['image'];
		
		//Folder images/cover
		$folder_front = imagecreatefrompng('../res/front.png');
		$folder_back = imagecreatefrompng('../res/back.png');
		//$cover = imagecreatefromjpeg($cover_url);
		if ($cover_enabled) {
			$cover_ext = pathinfo($cover_url, PATHINFO_EXTENSION);
			switch ($cover_ext) {
				case "webp":
					$cover = imagecreatefromwebp($cover_url);
					break;
				case "jpg":
					$cover = imagecreatefromjpeg($cover_url);
					break;
				case "jpeg":
					$cover = imagecreatefromjpeg($cover_url);
					break;
				case "png":
					$cover = imagecreatefrompng($cover_url);
					break;
				case "gif":
					$cover = imagecreatefromgif($cover_url);
					break;
				default:
					$cover = imagecreatefromstring($cover_url);
					break;
			}
		}

		//Set folder transparency
		imageAlphaBlending($folder_front, true);
		imageSaveAlpha($folder_front, true);
		if ($cover_enabled) {
			imageAlphaBlending($cover, true);
			imageSaveAlpha($cover, true);
		}
		imageAlphaBlending($folder_back, true);
		imageSaveAlpha($folder_back, true);

		$red = $curImage['red'];
		$green = $curImage['green'];
		$blue = $curImage['blue'];

		//Recolour folder
		//imagefilter($folder_front, IMG_FILTER_COLORIZE, $red, $green, $blue);
		//imagefilter($folder_back, IMG_FILTER_COLORIZE, $red, $green, $blue);
		$folder_front = duotone_image($folder_front, $red, $green, $blue, false);
		$folder_back = duotone_image($folder_back, $red, $green, $blue, false);

		if ($cover_enabled) {
			//Calculate the ratio
			$ratio = imagesx($cover) / imagesy($cover);
			$cover_width = $cover_height * $ratio;
			
			//Resize and rotate the cover
			$cover = imagescale($cover, $cover_width, $cover_height); //Set the width of the cover
			$cover = imagerotate($cover, $rotation, imageColorAllocateAlpha($cover, 0, 0, 0, 127)); //Rotate cover
		}

		//Merge layers
		if ($cover_enabled) {
			imagecopy($folder_back, $cover, $cover_x, $cover_y, 0, 0, imagesx($cover), imagesy($cover));
			imagedestroy($cover);
		}
		imagecopy($folder_back, $folder_front, 0, 0, 0, 0, 570, 570);
		imagedestroy($folder_front);
		
		$imgTitle = $curImage['title'];
		$imgTitle = str_replace("-", " ", $imgTitle);

		//Save
		imagepng($folder_back, $path . $imgTitle . '.png', 0); //compression 0-9

		//Convert to ico
		$ico_lib = new PHP_ICO($path . $imgTitle . '.png', $sizes);
		$ico_lib->save_ico($path . $imgTitle . '.ico');
		
		unlink($path . $imgTitle . '.png'); //Delete png version

		array_push($files_to_zip, $path . $imgTitle . '.ico');

		$i++;
	}

	//Zip ico's together
	$result = create_zip($files_to_zip, '../temp/' . $unique_id . '.zip', true);
	foreach ($files_to_zip as $ico) {
		unlink($ico);
	}
	rmdir($path);
	if ($result) {
		echo 'success: |' . $unique_id . '.zip|';
		echo '*' . FileSizeConvert(filesize('../temp/' . $unique_id . '.zip')) . '*';
	} else {
		echo 'Something went wrong';
	}
} else {
	die('No data was sent');
}