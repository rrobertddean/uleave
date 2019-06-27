

$(document).ready(function(){
    //Check connection
    checkConnectionLocal()


    //Capture ajax request and show loading modal
    $.ajaxSetup({
        beforeSend: function() {
            //check connection string
            // show progress spinner
            $("body").addClass("loading"); 
        },
        complete: function() {
            // hide progress spinner
            $("body").removeClass("loading"); 
        }
    });
})


setInterval(function(){
    
},3000)




//Remove display label error username and password on keyup
$("#txtUsername, #txtPasskey").keyup(function(){
    $("#notif-account").css("display","none");
})


//Tab Effectss
$('#myTab a').on('click', function (e) {
    e.preventDefault()
    $(this).tab('show')
})


function UrlExists(url, cb){

    jQuery.ajax({
        url:      url,
        dataType: 'text',
        type:     'GET',
        complete:  function(xhr){
            $("body").removeClass("loading"); 

            if(typeof cb === 'function') {
               cb.apply(this, [xhr.status]);
            }
        }
    });
}

function checkConnectionLocal() {
    
    UrlExists(config.connStringLocal, function(status) {
        if(status === 200) {
            // -- Execute code if successful --
            config.connString = config.connStringLocal;
            // console.log(config.connString);
            $("#lbl-constatus").html("Local").css("color","green");
        } else if(status === 404) {
            // -- Execute code if not successful --
        }else{
            // -- Execute code if status doesn't match above --
            //Use connection string public
            checkConnectionPublic();
        }
    });
}


function checkConnectionPublic(){
    UrlExists(config.connStringPublic, function(status) {
        if(status === 200) {
            // -- Execute code if successful --
            config.connString = config.connStringPublic;
            // console.log(config.connString);
            $("#lbl-constatus").html("Internet").css("color","green");
        }else{
            // -- Execute code if status doesn't match above --
            //Use connection string public
            $("#lbl-constatus").html("No Connection").css("color","red");
            console.log("Please make sure you are connected in Unifrutti Network or in the Internet");
        }
    });
}




//Popup modal leave action
function showModalLeave(transcode) {
    $.post(config.connString+"post",{action:"getLeaveInfo",transcode:transcode},function(response,status) {

        console.log(response);
        var result = JSON.parse(response);
        $.each(result,function(i,field) {
            $("#leaveinfoName").html(field["firstname"] + " " + field["lastname"]);
            $("#leaveinfoReason").html(field["reasons"]);
            $("#leaveTranscode").val(field["transcode"]);
        })
    })


    $("#modalLeave").modal();
}

//Popup modal obt action
function showModalObt(transcode) {
    $.post(config.connString+"post",{action:"getObtInfo",transcode:transcode},function(response,status) {
        var result = JSON.parse(response);
        $.each(result,function(i,field) {
            $("#obtinfoName").html(field["firstname"] + " " + field["lastname"]);
            $("#obtinfoDestination").html(field["destination"]);
            $("#obtinfoPurpose").html(field["purpose"]);
            $("#obtTranscode").val(field["transcode"]);

        })
    })

    $("#modalObt").modal();
}



//Show records leave and obt
function showRecords() {
    // $("body").addClass("loading"); 
    var username = $("#txtUsername").val();
    var passkey = $("#txtPasskey").val();
    $("#tblEmployeesLeaves tbody").empty();
    $("#tblEmployeesObt tbody").empty();



    $.post(config.connString+"post",{action:"validateUser",username:username,passkey:passkey})
    .done(function(response,status){
       
        if (status == "success") {
            
            if (response == "invalidaccount") {
                // $("body").removeClass("loading"); 
                $("#notif-account").css("display","block");
            }else {
                console.log(response);
                if (response.length > 1) {
                    var result = JSON.parse(response);
                    $("#tblEmployeesLeaves tbody").empty();

                    $.each(result,function(i,field) {
                        $("#tblEmployeesLeaves tbody").append('<tr>'+
                        '<td><input type="checkbox" class="form-control" /></td>'+
                        '<td>'+field["firstname"]+' '+field["lastname"]+'</td>'+
                        '<td>'+field["appliedleave"]+'</td>'+
                        '<td style="text-align:center;"><a href="javascript:void(0)" onclick="showModalLeave(\''+field["transcode"]+'\')" class="btn btn-sm btn-primary" ><i class="fa fa-bars"></i></a></td>'+    
                        '</tr>');
                        
                    })
                }
                //Load Official Business Trips
                loadObt(username);
            }
        }
        
    })
    .fail(function() {
        $("#lbl-constatus").html("No Connection").css("color","red");
        $("#modalCheckConnection").modal();
    }
    )


}

//Load leave pending records
function loadRecords() {
    var username = $("#txtUsername").val();
    var passkey = $("#txtPasskey").val();
    $("#tblEmployeesLeaves tbody").empty();
    $("#tblEmployeesObt tbody").empty();

    $.post(config.connString+"post",{action:"loadLeavePending",username:username,passkey:passkey},function(response,status){
        console.log(response);
        var result = JSON.parse(response);
        $("#tblEmployeesLeaves tbody").empty();

        $.each(result,function(i,field) {
            $("#tblEmployeesLeaves tbody").append('<tr>'+
            '<td><input type="checkbox" class="form-control" /></td>'+
            '<td>'+field["firstname"]+' '+field["lastname"]+'</td>'+
            '<td>'+field["appliedleave"]+'</td>'+
            '<td style="text-align:center;"><a href="javascript:void(0)" onclick="showModalLeave(\''+field["transcode"]+'\')" class="btn btn-sm btn-primary" ><i class="fa fa-bars"></i></a></td>'+    
            '</tr>');
            
        })
    })

    $("#modalLeave").modal('toggle');
}

// Load Official Business Trips
function loadObt(username) {
    
    $.post(config.connString+"post",{action:"loadObt",username:username},function(response,status){
        if (status == "success") {
            // $("body").removeClass("loading"); 
            $("#tblEmployeesObt tbody").empty();
            if (response.length > 1) {

                var result = JSON.parse(response);
                $.each(result,function(i,field) {
                    $("#tblEmployeesObt tbody").append('<tr>'+
                    '<td><input type="checkbox" class="form-control" /></td>'+
                    '<td>'+field["firstname"]+' '+field["lastname"]+'</td>'+
                    '<td>'+field["destination"]+'</td>'+
                    '<td><a href="javascript:void(0)" onclick="showModalObt(\''+field["transcode"]+'\')" class="btn btn-sm btn-primary" ><i class="fa fa-bars"></i></a> </td>'+
                    '</tr>');
                })
            }
        }
    })
}

//Update leave transaction
function updateLeaveTrans() {
    var approved = $("#selectLeaveAction").val();
    var transcode = $("#leaveTranscode").val();
    var notesreason = $("#leavenote").val();

    $.post(config.connString+"post",{action:"updateLeaveTrans",approved:approved,transcode:transcode,notesreason:notesreason},function(response,status){
        $("#leavenote").val("");
        loadRecords();
    })
}

//Update OBT Transaction
function updateObtTrans() {
    var username = $("#txtUsername").val();
    var approved = $("#selectObtAction").val();
    var transcode = $("#obtTranscode").val();
    var notesreason = $("#obtnote").val();

    $.post(config.connString+"post",{action:"updateObtTrans",approved:approved,transcode:transcode,notesreason:notesreason},function(response,status) {
        loadObt(username);
        $("#modalObt").modal('toggle');
    })

}

function togglePassword() {
    var input = document.getElementById("txtPasskey");
    if (input.type === "password") {
        input.type="text";
    }else {
        input.type="password";
    }

}






