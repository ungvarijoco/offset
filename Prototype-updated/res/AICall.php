<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$words = isset($_POST['words']) ? $_POST['words'] : '';
if (!$words) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing words parameter']);
    exit;
}

$apiUrl = 'https://exxite.hu/faa4/poet_dummy/index.php?words=' . urlencode($words);

$ctx = stream_context_create([
    'http' => [
        'method'  => 'GET',
        'timeout' => 30,
        'header'  => "Accept: application/json\r\n"
    ],
    'ssl' => [
        'verify_peer'      => true,
        'verify_peer_name' => true
    ]
]);

$response = file_get_contents($apiUrl, false, $ctx);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Upstream API request failed']);
    exit;
}

// Strip UTF-8 BOM if present
$response = ltrim($response, "\xEF\xBB\xBF");

// Strip markdown code fences that AI models sometimes wrap around JSON
$response = trim($response);
$response = preg_replace('/^```(?:json)?\s*/i', '', $response);
$response = preg_replace('/\s*```$/', '', $response);
$response = trim($response);

function fixJsLiteral($str) {
    // Quote unquoted object keys: { key: or , key:
    $str = preg_replace_callback(
        '/([{,])\s*(\p{L}[\p{L}\d_]*)\s*:/u',
        fn($m) => $m[1] . ' "' . $m[2] . '":',
        $str
    );
    $str = preg_replace_callback(
        '/:\s*(\p{L}[\p{L}\d ]*)(?=\s*[,}\n])/u',
        function($m) {
            $v = trim($m[1]);
            return in_array(strtolower($v), ['true', 'false', 'null'])
                ? ': ' . $v
                : ': "' . $v . '"';
        },
        $str
    );
    return $str;
}

$decoded = json_decode($response, true);
if ($decoded === null) {
    $fixed   = fixJsLiteral($response);
    $decoded = json_decode($fixed, true);
}
if ($decoded === null) {
    error_log('[AICall] json_decode failed: ' . json_last_error_msg() . ' | raw: ' . substr($response, 0, 500));
    http_response_code(502);
    echo json_encode([
        'error'  => 'Upstream API returned invalid JSON',
        'detail' => json_last_error_msg(),
        'raw'    => substr($response, 0, 500)
    ]);
    exit;
}

echo json_encode($decoded, JSON_UNESCAPED_UNICODE);
