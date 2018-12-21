function fromJson(MSG)
   local hashMap = {}
   for k,v in string.gmatch(MSG,'"(%w+)":"(%w+)",') do
      hashMap[k] = v;
   end
   for k,v in string.gmatch(MSG,'"(%w+)":"(%w+)"}') do
      hashMap[k] = v;
   end
   return hashMap
end

sk=net.createConnection(net.TCP, 0)
sk:on("receive", function(sck, c)
    print(c)
    if c == "Thank you" then
      print("Great!")
    end 
end )
sk:connect(8000,"192.168.1.9")
sk:on("connection", function(sck,c)
  -- Wait for connection before sending.
  sk:send("HELLO")
end)