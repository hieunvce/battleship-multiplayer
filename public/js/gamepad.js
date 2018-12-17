$(document).ready(function () {
    var device_id;
    $('#registerdevice').on('click', function () {
        device_id = $('#device_id').val();
        $.ajax({
            type: 'POST',
            url: '/registerdevice',
            data: { "device_id": device_id },
            dataType: 'json',
            async: false,
            success: function (response) {
                if (response.registerdevice == "success") {
                    $('#device_id').hide();
                    $("#key").html(device_id);
                }else{
                    $("#key").html("Register Device Failed");
                }
            }
        });
    });
    $('#left').on('click', function () {
        device_id = $('#device_id').val();
        $.ajax({
            type: 'POST',
            url: '/device',
            data: { "device_id": device_id, "key":"L" },
            dataType: 'json',
            async: false,
            success: function (response) {
                if (response.status == "success") {
                    $('#device_id').hide();
                    $("#sent").html("Left");
                }else{
                    $("#sent").html("Sent Failed");
                }
            }
        });
    });
    $('#right').on('click', function () {
        device_id = $('#device_id').val();
        $.ajax({
            type: 'POST',
            url: '/device',
            data: { "device_id": device_id, "key":"R" },
            dataType: 'json',
            async: false,
            success: function (response) {
                if (response.status == "success") {
                    $('#device_id').hide();
                    $("#sent").html("Right");
                }else{
                    $("#sent").html("Sent Failed");
                }
            }
        });
    });
    $('#up').on('click', function () {
        device_id = $('#device_id').val();
        $.ajax({
            type: 'POST',
            url: '/device',
            data: { "device_id": device_id, "key":"U" },
            dataType: 'json',
            async: false,
            success: function (response) {
                if (response.status == "success") {
                    $('#device_id').hide();
                    $("#sent").html("Up");
                }else{
                    $("#sent").html("Sent Failed");
                }
            }
        });
    });
    $('#down').on('click', function () {
        device_id = $('#device_id').val();
        $.ajax({
            type: 'POST',
            url: '/device',
            data: { "device_id": device_id, "key":"D" },
            dataType: 'json',
            async: false,
            success: function (response) {
                if (response.status == "success") {
                    $('#device_id').hide();
                    $("#sent").html("Down");
                }else{
                    $("#sent").html("Sent Failed");
                }
            }
        });
    });
    $('#ok').on('click', function () {
        device_id = $('#device_id').val();
        $.ajax({
            type: 'POST',
            url: '/device',
            data: { "device_id": device_id, "key":"O" },
            dataType: 'json',
            async: false,
            success: function (response) {
                if (response.status == "success") {
                    $('#device_id').hide();
                    $("#sent").html("OK");
                }else{
                    $("#sent").html("Sent Failed");
                }
            }
        });
    });
});