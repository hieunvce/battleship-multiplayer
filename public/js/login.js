
$(document).ready(function () {
    var logedInUser = "";

    var failHtml = '<div class="alert alert-danger">' +
        '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
        '<strong> Có lỗi xảy ra:</strong> Tên đăng nhập hoặc mật khẩu không đúng' +
        '</div>';

    var userIsOnline = '<div class="alert alert-danger">' +
        '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
        '<strong> Có lỗi xảy ra:</strong> Tài khoản đang được đăng nhập' +
        '</div>';

    $('#submit').on('click', function () {

        var usn = $('#username').val(),
            pw = $('#password').val();

        $.ajax({
            type: 'POST',
            url: '/login',
            data: { username: usn, password: pw },
            dataType: 'json',
            async: false,
            success: function (response) {
                if (response.loginStatus == "success") {
                    alert('Đăng nhập thành công');
                    logedInUser = usn;
                    document.cookie = "username="+logedInUser+";path=/"; 
                    window.location = '/room';
                } else if (response.loginStatus == "onlined")
                    $("#errors").html(userIsOnline);
                else
                    $("#errors").html(failHtml);
            }
        });
    });

    $('#register').on('click', function () {
        window.location = '/register';
    });
});