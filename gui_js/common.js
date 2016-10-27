/**
 * Created by ludo on 25-10-16.
 */

//Rest client to VSM: URL, call method, structures.
var vsm_uri = "http://ec2-52-29-254-9.eu-central-1.compute.amazonaws.com:11220/";

var vsm_start = { "cmd":"start"};
var vsm_reset = { "cmd":"reset"};
var vsm_load =  { "cmd":"load", "arg":"res/prj/vsm" };

var vsm_set  =  function(field,val){ return { "cmd": "set", "arg":{ "var":field, "val":JSON.stringify(val)}}};

var doVSMCall = function(body){
  $.ajax({
    type: "POST",
    url: vsm_uri,
    data: body,
    success: function(data){
      console.log("Successfull VSM call:", data);
    },
    error: function(data){
      console.log("VSM call encountered an error:", data);
    },
    contentType: "application/json"
  });
}

