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
var connected = false;
var userRef;
var connectedRef;
var timer;
var time =0;
var gameRef;
var roundTime = 15;


function startGame(){
time = roundTime;
gameRef  = database.ref("GameOne/TableOne/GameData").update({
started:true,
round: 1,
p1score:0,
p2score: 0,
p1Choice:'',
p2Choice:''

})
$(".scoreBoard").css('display', 'block');
timer = setInterval(count, 1000);
}
function count(){
    time--;
    let res = timeConverter(time);
    $('.timerPanel').text(res);
    if (time == 0)
    endRound();
}

function endRound(){
    
    clearInterval(timer);
    if (round == 5){
        endGame();
    } else {
        round ++;
        database.ref("GameOne/TableOne/GameData").update({
        round: round
        });
        nextRound();
    }

}

function nextRound(){
    timer = setInterval(count, 1000);
}
function endGame(){

}
function loadUserData() {
    let id = localStorage.userId;
    if (id) {
        let name = localStorage.name;
        if (name) {
            alert("Welcome back, " + name);
            $("#welcomeName").text(name + ", ")        
            popDb(name);            
            initializeSeats();            
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
    setConnection();

}
function setConnection() {
    userRef = database.ref(`GameOne/users/${playerdbid}`);
    connectedRef = database.ref(".info/connected");
    connectedRef.on("value", function (snap) {

        // If they are connected..
        if (snap.val()) {
            userRef.update({ connected: true })
        }
    })
    userRef.onDisconnect().remove();
}

function reBuildWatcherList() {
    $("#nameList").empty();
    database.ref("GameOne/users").once('value', function (snapshot) {
        snapshot.forEach(function (snapshot) {
            let uKey = snapshot.val().key;
            let uName = snapshot.val().name;
            addToWatcher(uKey, uName)
        })
    })

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
    let playerSitting = ele.attr("data-playerid");
    if (playerSitting == playerdbid) {
        let seatNum = ele.attr("data-seatnum");
        emptySeat(seatNum);
              
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
    });

}
function emptySeat(seat){
    console.log(seat);
 database.ref(`GameOne/TableOne/${seat}`).remove();
 if (seat == "SeatOne") {
    seatoneUser = ""
} else {
    seattwoUser = ""
}
}

//Became frustrated trying to watch for the dc event, decided to just wipe their profile eachtime.

database.ref(`GameOne/users/`).on("child_removed", function (snapshot) {
    let userId = snapshot.val().key;
    let seat = snapshot.val().seat;
    if (seat != '' && seat != undefined){
        emptySeat(seat);
    }
    

    reBuildWatcherList();
})
database.ref("GameOne/TableOne/GameData").on("child_added", function (snapshot) {
    
})
database.ref("GameOne/TableOne/SeatOne").on("child_removed", function (snapshot) {
    let ele = $("#p1t1");
    ele.text("Click to Join");
    ele.attr("data-playerid", '');
    seatoneUser = '';
    resetGameData();
})
database.ref("GameOne/TableOne/SeatTwo").on("child_removed", function (snapshot) {

    let ele = $("#p2t1");
    ele.text("Click to Join");
    ele.attr("data-playerid", '');
    seattwoUser = '';
    resetGameData();
})

function resetGameData(){
    database.ref("GameOne/TableOne/GameData").update({
        started: false,
        round: 1,
        p1Choice:'',
        p2Choice: '',
        p1score:0,
        p2score: 0
    })
}

function initializeSeats() {

    $(".playerSeat").css("display", "block");

}

function timeConverter(t) {

    //  Takes the current time in seconds and convert it to minutes and seconds (mm:ss).
    var minutes = Math.floor(t / 60);
    var seconds = t - (minutes * 60);
  
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
  
    if (minutes === 0) {
      minutes = "00";
    }
  
    else if (minutes < 10) {
      minutes = "0" + minutes;
    }
  
    return minutes + ":" + seconds;
  }
  
$(document).ready(function () {

    //loadWatchers();
    database.ref("GameOne/users").on('child_added', function (snapshot) {
        if (snapshot.val().name != undefined)
            addToWatcher(snapshot.key, snapshot.val().name);
    })
    database.ref("GameOne/TableOne/SeatOne").on('child_added', function (snapshot) {
        if (snapshot.val().name != undefined) {
            let sitterId = snapshot.val().id;
            // console.log(snapshot.val())
            $("#p1t1").text(snapshot.val().name);
            // console.log(snapshot.val().id);
            $("#p1t1").attr("data-playerid", sitterId);
            seatoneUser = sitterId;
            if (seattwoUser == seatoneUser) {
                database.ref("GameOne/TableOne").child("SeatTwo").remove();
                let emptySeat = $("#p2t1")
                emptySeat.text("Click to Join");
                emptySeat.attr("data-playerid", '');
                seattwoUser = ''

            } else if (seattwoUser != '' && seattwoUser != undefined){
                startGame();
            }
            database.ref(`GameOne/users/${sitterId}`).update({
                seat: "SeatOne"
            })
        }

    })
    database.ref("GameOne/TableOne/SeatTwo").on('child_added', function (snapshot) {
        if (snapshot.val().name != undefined) {
            let sitterId = snapshot.val().id;
            $("#p2t1").text(snapshot.val().name);
            $("#p2t1").attr("data-playerid", sitterId);
            seattwoUser = sitterId;
            if (seattwoUser == seatoneUser) {
                database.ref("GameOne/TableOne").child("SeatOne").remove();
                let emptySeat = $("#p1t1")
                emptySeat.text("Click to Join");
                emptySeat.attr("data-playerid", '');
                seatoneUser = '';
            } else if (seatoneUser != '' && seatoneUser != undefined){
                startGame();
            }
            database.ref(`GameOne/users/${sitterId}`).update({
                seat: "SeatTwo"
            })
        }

    })
    loadUserData();

    $('#nameSub').on('click', addNewUserToList);
    $(document.body).on('click', ".playerSeat", checkSeat);
});
