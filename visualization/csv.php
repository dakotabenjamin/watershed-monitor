<html>
<head>
    <title>Convert JSON to CSV</title>
    <script type="text/javascript" src="//code.jquery.com/jquery-latest.js"></script>
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/json2/20121008/json2.min.js"></script>

    <script type="text/javascript">
        // JSON to CSV Converter
        function ConvertToCSV(objArray) {
            var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
            var str = '';

            for (var i = 0; i < array.length; i++) {
                var line = '';
                for (var index in array[i]) {
                    if (line != '') line += ','

                    line += array[i][index];
                }

                str += line + '\r\n';
            }

            return str;
        }

        // Example
        $(document).ready(function () {

            // Create Object
            var items = <?=json_encode($_POST['data'],JSON_NUMERIC_CHECK)?>;

            // Convert Object to JSON
            var jsonObject = JSON.stringify(items);

            // Display JSON
            $('#json').text(jsonObject);

            // Convert JSON to CSV & Display CSV
            $('#csv').text(ConvertToCSV(jsonObject));
        });
    </script>
</head>
<body>
    <h1>
        JSON</h1>
    <pre id="json"></pre>
    <h1>
        CSV</h1>
    <pre id="csv"></pre>
</body>
</html>
