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
var isPlaying = false;
var seatoneUser = '';
var inSeat = '';
var seattwoUser = '';
var seatRef;
var connected = false;
var userRef;
var connectedRef;
var timer;
var nextTimer;
var round = 1;
var time =0;
var nextRoundTime = 0;
var gameRef;
var roundTime = 15;
var gameIP = false;
var roundIP = false;


function startGame(){
    console.log("Starting Game");
    $("#gameStatus").text("Time to Play ROCK PAPER SCISSORS!!!");
    if (isPlaying){
        $('.buttonPanel').css("display", 'block');
    } else {
        $(".resultPanel").css("display", "block");
    }
    gameIP = true;
    roundIP = true;
time = roundTime;
gameRef  = database.ref("GameOne/TableOne/GameData").update({
started:true,
roundIP: true,
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
    
    if (roundIP){
    let res = timeConverter(time);
    $('.timerPanel').text(res);
    if (time == 0)
    endRound();
  
} else {
    let res = timeConverter(time);
    $('#nextRoundTimer').text(res);
    if (time == 0){
        nextRound();
    }
}
}

function endRound(){
    roundIP = false;
    clearInterval(timer);
    
    // time = roundTime;
    if (round >= 5){
        endGame();
    } else {

        evalOutcome();
        $("#nextRoundTimer").text(timeConverter(10))
        $("#nextRoundCont").css("display","block");
        time = 10;
        nextTimer  = setInterval(count, 1000);
    }

}

function subChoice(){
    if (isPlaying){
        
        var val = $(this).attr("id");
        console.log(inSeat);
        if (inSeat == "SeatOne"){
            database.ref("GameOne/TableOne/GameData").update({
                p1Choice: val
            })
        } else if (inSeat =="SeatTwo"){
            database.ref("GameOne/TableOne/GameData").update({
                p2Choice: val
            })
        }

        $(".buttonPanel").css("display", "none");
        $(".resultPanel").css("display", "inline-block");

    }

}
function evalOutcome(){
 
    database.ref('GameOne/TableOne/GameData').once("value",  function (snapshot) {
        let winner = '';
      let p1c = snapshot.val().p1Choice;
      let p2c = snapshot.val().p2Choice;
      let p1score = snapshot.val().p1score;
      let p2score = snapshot.val().p2score;
      let ties = snapshot.val().ties;
        $("#p1Choice").text(p1c);
        $("#p2Choice").text(p2c);
    if (p1c == undefined && p2c != undefined){
        winner = "p2";
    } else if (p1c != undefined && p2c == undefined){
        winner = "p1";
    } else if (p1c === p2c){
            winner = 'tie';
            
    } else {
        if ((p1c == "rock" && p2c =="paper") || (p1c == "paper" && p2c == "rock") ||(p1c == "scissors" && p2c == "paper")) {
            winner = "p1";
        }else {
            winner = 'p2';
        }       
    }

    if (winner == "p1"){
        p1score++;
    } else if (winner =="p2"){
        p2score++;
    } else {
        ties++;
    }
        database.ref("GameOne/TableOne/GameData").update({
            p1score:p1score,
            p1Choice: '',
            p2Choice: '',
            p2score: p2score,
            ties:ties,
            Winner: winner,
            roundIP: false
        })

   
    })
}


function nextRound(){
    if (isPlaying){
        $(".buttonPanel").css("display", "block");
        $(".resultPanel").css("display", "none");
    }
    clearInterval(nextTimer);
    roundIP = true;
    $("#roundOutcome").css("display", "none" )
    $("#nextRoundCont").css("display","none");
    $("#p1Choice").text("Waiting for Input");
$("#p2Choice").text("Waiting for Input");
    round++;   
    database.ref("GameOne/TableOne/GameData").update({
    round: round,
    roundIP: true
    });
    time=roundTime;
    $(".timerPanel").text(timeConverter(time));
    timer = setInterval(count, 1000);
}
function endGame(){
gameIP = false;
roundIP = false;
resetGameData();
}
function loadUserData() {
    let id = localStorage.userId;
    if (id) {
        let name = localStorage.name;
        if (name) {
        //    alert("Welcome back, " + name);

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
            confirmButtonText: 'Yes, LET ME PLAY!'
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
     //   alert('noname');
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

            if (userRef)
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
        isPlaying = false;
    inSeat = '';

              
    }
    else if (playerSitting) {
       // alert("Someone is already sitting there!");
    } else {
        console.log("Empty");
        sitInSeat(ele);
    }
}

function sitInSeat(ele) {
    console.log(ele);
    isPlaying = true;
    let seatNum = ele.data("seatnum");
    inSeat = seatNum;
    console.log(seatNum);

    seatRef =  database.ref(`GameOne/TableOne/${seatNum}`).push({
        id: playerdbid,
        name: playerNameGl,
        seat: seatNum
    });
    seatRef.onDisconnect().remove();
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

database.ref(`GameOne/users`).on("child_removed", function (snapshot) {
    console.log('user-left');
    let userId = snapshot.val().key;
    let seat = snapshot.val().seat;
    if (seat != '' && seat != undefined){
        emptySeat(seat);
    }
    

    reBuildWatcherList();
})


database.ref("GameOne/TableOne/GameData").on("value", function (snapshot) {
    if (snapshot.val().roundIP){
 let vals = snapshot.val();
 console.log(vals.round);   
 if (vals.p1Choice != '' && vals.p2Choice != ''){
     clearInterval(timer);
     endRound();   
    
} else if (vals.p1Choice =='' && vals.p2Choice == ''){
    $("#p1Choice").text("Waiting for Input");
    $("#p2Choice").text("Waiting for Input");
} else{
 if (vals.p1Choice != '' ){
     if (isPlaying && inSeat == "SeatOne"){
        $("#p1Choice").text("You Chose: " +vals.p1Choice)
     }else{
    $("#p1Choice").text("Choice Submitted! Waiting for Player 2")
     }
 } 
 if (vals.p2Choice != ''){
    if (isPlaying && inSeat == "SeatTwo"){
        $("#p2Choice").text("You Chose: " +vals.p2Choice)
     }else{
    $("#p2Choice").text("Choice Submitted! Waiting for Player 1")
 }
}
}

} else if (snapshot.val().started) {
    let winner = snapshot.val().Winner;
    if (winner == "p1"){
        winner = "Player One Wins!"
    } else if (winner == "p2"){
        winner = "Player Two Wins!"
    } else{
        winner = "TIE!"
    }
    $("#roundOutcome").css("display", "block" )
    $("#roundOutcome").text("ROUND OVER: "+ winner);
     $("#roundCount").text(snapshot.val().round);
    $("#p1Score").text(snapshot.val().p1score);
    $("#p2Score").text(snapshot.val().p2score);
} else {
    $("#roundOutcome").css("display", "none" )

}
})

database.ref("GameOne/TableOne/SeatOne").on("child_removed", function (snapshot) {
    let ele = $("#p1t1");
    ele.text("Click to Join");
    ele.attr("data-playerid", '');
    seatoneUser = '';
    if (gameIP){
        endGame();
    resetGameData();
    }
})
database.ref("GameOne/TableOne/SeatTwo").on("child_removed", function (snapshot) {

    let ele = $("#p2t1");
    ele.text("Click to Join");
    ele.attr("data-playerid", '');
    seattwoUser = '';
    if (gameIP){
        endGame();
    resetGameData();
    }
})

function resetGameData(){
    clearInterval(timer);
    clearInterval(nextTimer);
    database.ref("GameOne/TableOne/GameData").update({
        started: false,
        roundIP: false,
        Winner: '',
        ties: 0,
        round: 1,
        p1Choice:'',
        p2Choice: '',
        p1score:0,
        p2score: 0
    })
    round = 1;
    $("#gameStatus").text("Waiting for Players");
    // $(".scoreBoard").css("display", 'none');
    
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
           
            $("#p1t1").text(snapshot.val().name);           
            $("#p1t1").attr("data-playerid", sitterId);
            seatoneUser = sitterId;
            if (seatoneUser == playerdbid){
                isPlaying = true;
                
            }
            if (seattwoUser == seatoneUser) {
                database.ref("GameOne/TableOne").child("SeatTwo").remove();
                let emptySeat = $("#p2t1")
                emptySeat.text("Click to Join");
                emptySeat.attr("data-playerid", '');
                seattwoUser = ''

            } else if (seattwoUser != '' && seattwoUser != undefined && !gameIP){
                startGame();
            }
            database.ref(`GameOne/users/${sitterId}`).once('value', function (snapshot) {
                if (snapshot.exists()){
                    database.ref(`GameOne/users/${sitterId}`).update({
                        seat: "SeatOne"
                    })
                }
                });
        
           
        }

    })
    database.ref("GameOne/TableOne/SeatTwo").on('child_added', function (snapshot) {
        if (snapshot.val().name != undefined) {
            let sitterId = snapshot.val().id;
            $("#p2t1").text(snapshot.val().name);
            $("#p2t1").attr("data-playerid", sitterId);
            seattwoUser = sitterId;
            if (seattwoUser == playerdbid){
                isPlaying = true;
                
            }
            if (seattwoUser == seatoneUser) {
                database.ref("GameOne/TableOne").child("SeatOne").remove();
                let emptySeat = $("#p1t1")
                emptySeat.text("Click to Join");
                emptySeat.attr("data-playerid", '');
                seatoneUser = '';
            } else if (seatoneUser != '' && seatoneUser != undefined && !gameIP){
                startGame();
            }
            database.ref(`GameOne/users/${sitterId}`).once('value', function (snapshot) {
                if (snapshot.exists()){
                    database.ref(`GameOne/users/${sitterId}`).update({
                        seat: "SeatTwo"
                    })
                }
                });
        }

    })
    loadUserData();

    $('#nameSub').on('click', addNewUserToList);
    $(document.body).on('click', ".playerSeat", checkSeat);
    $(document.body).on('click', ".rpsB", subChoice);
});
