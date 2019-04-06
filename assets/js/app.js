var config = {
    apiKey: "AIzaSyBPgsgpPCpRRT_je1X92SVy7WiaXckgisY",
    authDomain: "rpsmulti-8bc6c.firebaseapp.com",
    databaseURL: "https://rpsmulti-8bc6c.firebaseio.com",
    projectId: "rpsmulti-8bc6c",
    storageBucket: "rpsmulti-8bc6c.appspot.com",
    messagingSenderId: "508537165615"
};
firebase.initializeApp(config);

var database = firebase.database();
//globals
var playerdbid = '';
var playerNameGl = '';
var seatoneUser = '';
var seattwoUser = '';
var connected  = false;
function loadUserData() {
    let id = localStorage.userId;
    if (id) {
        let name = localStorage.name;
        if (name) {
            alert("Welcome back, " + name);
            $("#welcomeName").text(name + ", ")
            // database.ref(`GameOne/users/${id}`).once("value", snapshot => {
            //     if (snapshot.exists()) {
            //         //const userData = snapshot.val();
            //         console.log("Player Found");                   
                    //playerdbid = id;
                    // playerNameGl = name;
                // } else {
                    popDb(name);
                // }
                initializeSeats();
            // });
            $("#nameSub").css("display", "none");
            $("#nameEnter").css("display", "none");
            $("#nameLab").css("display", "none");
        }
       
    }
}

function resetUser(uKey) {
    firebase.database().ref('users/' + userId).set({
    });
}
function addNewUserToList() {
    let userName = $("#nameEnter").val();
    if (userName != '') {

        Swal.fire({
            title: 'Enter as name: ' + userName + " ?",
            text: "This will be your public name",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, LET US PLAY!'
        }).then((result) => {
            if (result.value) {
                Swal.fire({
                    text: "Welcome, " + userName
                })
                popDb(userName);
                $("#nameSub").css("display", "none");
                $("#nameEnter").css("display", "none");
                $("#nameLab").css("display", "none");
                initializeSeats();
            } else {
                Swal.fire("Ok submit when ready");
            }
        })


    } else {
        alert('noname');
    }

}
function popDb(name) {


    var newUser = database.ref("GameOne/users").push({
        name: name,
        table: '',
        seat: '',
        gamesWon: ''

    })
    localStorage.setItem("userId", newUser.key);
    localStorage.setItem("name", name);
    playerNameGl = name;
    playerdbid = newUser.key;

    var connectionsRef = database.ref(`GameOne/users/${playerdbid}/connections`);
  var connectedRef = database.ref(".info/connected");
  connectedRef.on("value", function(snap) {

      // If they are connected..
      if (snap.val()) {
    
        // Add user to the connections list.
        var con = connectionsRef.push(true);
    
        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();

      }
    });
  
}

function addToWatcher(uKey, uName) {
    let nameEle = $("<li>");
    nameEle.attr("data-id", uKey);
    nameEle.addClass("watcherLi");
    nameEle.text(uName);

    $("#nameList").append(nameEle);
}

function checkSeat() {
    let ele = $(this);

    console.log(ele);
    console.log(ele.data("playerid"));
    let playerSitting = ele.attr("data-playerid");
    if (playerSitting == playerdbid){
        let seatNum = ele.attr("data-seatnum");
        database.ref("GameOne/TableOne/"+seatNum).remove();
               
      if (seatNum =="SeatOne"){
            seatoneUser = ""
      } else {
        seattwoUser = ""
      }
    }
    else if (playerSitting) {
        alert("Someone is already sitting there!");
    } else {
        console.log("Empty");
        sitInSeat(ele);
    }
}

function sitInSeat(ele) {
    console.log(ele);
    let seatNum = ele.data("seatnum");

    console.log(seatNum);

    database.ref(`GameOne/TableOne/${seatNum}`).push({
        id: playerdbid,
        name: playerNameGl,
        seat: seatNum
    },function(){
    if (seatoneUser != '' && seattwoUser != ''){

    }
    })

}


  // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
  
  database.ref(`GameOne/users/${playerdbid}`).on("child_removed", function(snapshot){
      console.log(snapshot.val().seat);
if (seatoneUser == playerdbid){

    seatoneUser = '';
} else if( seattwoUser == playerdbid){

    // haltGame();
}
})

database.ref("GameOne/TableOne/SeatOne").on("child_removed", function(snapshot){
    let ele = $("#p1t1");
    ele.text("Click to Join");
    ele.attr("data-playerid",'');
})
database.ref("GameOne/TableOne/SeatTwo").on("child_removed", function(snapshot){
   
    let ele = $("#p2t1");
    ele.text("Click to Join");
       ele.attr("data-playerid",'');
})

function initializeSeats() {

    $(".playerSeat").css("display", "block");

}
$(document).ready(function () {

    //loadWatchers();
    database.ref("GameOne/users").on('child_added', function (snapshot) {
        if (snapshot.val().name != undefined)
            addToWatcher(snapshot.key, snapshot.val().name);
    })
    database.ref("GameOne/TableOne/SeatOne").on('child_added', function (snapshot) {
        if (snapshot.val().name != undefined) {
            let sitterId  = snapshot.val().id;
            console.log(snapshot.val())
            $("#p1t1").text(snapshot.val().name);
            console.log(snapshot.val().id);
            $("#p1t1").attr("data-playerid",sitterId);
            seatoneUser = sitterId;
            if (seattwoUser == seatoneUser){
                database.ref("GameOne/TableOne").child("SeatTwo").remove();
               let emptySeat = $("#p2t1")
               emptySeat.text("Click to Join");
               emptySeat.attr("data-playerid",'');
               seattwoUser = ''

            }
            database.ref(`GameOne/users/${sitterId}`).update({
                seat:"SeatOne"
            })
        }

    })
    database.ref("GameOne/TableOne/SeatTwo").on('child_added', function (snapshot) {
        if (snapshot.val().name != undefined) {
            let sitterId  = snapshot.val().id;
            $("#p2t1").text(snapshot.val().name);
            $("#p2t1").attr("data-playerid", sitterId);
            seattwoUser = sitterId;
            if (seattwoUser == seatoneUser){
                database.ref("GameOne/TableOne").child("SeatOne").remove();
                let emptySeat = $("#p1t1")
               emptySeat.text("Click to Join");
               emptySeat.attr("data-playerid",'');
               seatoneUser= '';
            }
            database.ref(`GameOne/users/${sitterId}`).update({
                seat:"SeatTwo"
            })
        }

    })
    loadUserData();
   
    $('#nameSub').on('click', addNewUserToList);
    $(document.body).on('click', ".playerSeat", checkSeat);
});
