<?php

$files = [];

if (!isset($_FILES['file']))
    $files = ['error' => 'No files'];
else {
    for ($i = 0; $i < count($_FILES['file']['name']); $i++) {
        $files[] = makeFile($_FILES['file']['name'][$i], $_FILES['file']['tmp_name'][$i], $_FILES['file']['size'][$i]);
    }
}
function makeFile($name, $filename, $size) {
        $file = ['name' => $name];

        if ($size > 40 * 1024) {
            $file['state'] = 'invalid';
            $file['reason'] = 'Size too large';
            $file['filesize'] = $size;
        } else {
            if (($dimensions = getimagesize($filename, $info)) === false) {
                $file['state'] = 'invalid';
                $file['reason'] = 'Invalid image';
            }
            else {
                $file['data'] = 'data:' . image_type_to_mime_type(exif_imagetype($filename)) . ';base64,' . base64_encode(file_get_contents($filename));
                $file['filesize'] = $size;
                $file['size'] = $dimensions[0] . 'x' . $dimensions[1];
            }
        }

        return $file;
}

header('Content-type: text/html; charset=utf-8');
die('<!DOCTYPE html><html lang=en><head><meta charset=utf-8><script type="text/javascript">window.response = \''.json_encode(['files' => $files]).'\';</script></head><body></body></html>');
