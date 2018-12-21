--server_link = "https://battleshipp.herokuapp.com/registerdevice" -- set server URL
token=''
srv = net.createConnection(net.TCP, 0)
srv:connect(443,"battleshipp.herokuapp.com")
print("Sending POST")
-- Waits for connection befor of sending values
srv:on("connection", function(sck, c) token = c return token end)
function sendValue(key,token)
var = '{"device_number":"1234","key":"'..key..'"}';
num = string.len(var);
local cadenaPOST = "POST /device"
.."HTTP/1.1\r\n"
.."Content-Type: application/json\r\n"
.."Content-Length: "..num.."\r\n"
.."X-Auth-Token: "..token .."\r\n"
.."Host: battleshipp.herokuapp.com\r\n\n"
..var.."\r\n";
sck:send(cadenaPOST)
end)

uart.on("data", "!",
  function(data)
    print("receive from uart:", data)
    if data=="U!" then
      sendValue('U',token);
    end
    if data=="D!" then
      sendValue('D',token);
    end
    if data=="L!" then
      sendValue('L',token);
    end
    if data=="R!" then
      sendValue('R',token);
    end
    if data=="O!" then
      sendValue('O',token);
    end
end, 0)

while (true) do
end

srv:close();
end
