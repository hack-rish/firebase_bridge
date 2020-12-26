var admin = require('firebase-admin');
var express = require('express');
var bodyParser = require('body-parser')

const defaultTitle = "Tarot Talk Session Invite";
const defaultBody = "You've been invited to join a session";

var serviceAccount = require("./tarottalk-firebase-adminsdk-40bqg-2aef4f1a13.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://tarottalk.firebaseio.com"
});

var app = express();

var port = process.env.PORT || 8080;
app.use(bodyParser.json())

app.listen(port, function(){
    console.log(`FCM Bridge Listening on port ${port}`);
});

app.post("/sendMessageToUser", function(req, res){
    if(!req.body.user || !req.body.room || !req.body.fromId){
        res.sendStatus(400);
        return;
    }

    var db = admin.database();
    var ref = db.ref(`users/${req.body.user}`);
    ref.once("value", function(snapshot){
        var user = snapshot.val();
        console.log(user.messageToken);
        if(user != null){
            var msg = {
                data: {
                    room: req.body.room,
                    invite : 'true',
                    fromId: req.body.fromId
                },
                token: user.messageToken
            }

            if(user.profile && user.profile.notificationsInvite){
                msg.notification = {
                    title: req.body.messageTitle ? req.body.messageTitle : defaultTitle,
                    body: req.body.messageBody ? req.body.messageBody : defaultBody
                }
            }
            console.log(msg);
            admin.messaging().send(msg).then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    });
});

app.post('/deleteUser', function(req, res){
    if(!req.body.user){
        res.sendStatus(400);
        return;
    }

    admin.auth().deleteUser(req.body.user).then(function(){
        console.log("User Deleted!");
        res.sendStatus(200);
    }).catch(function (error){
        console.log(error);
        res.sendStatus(500);
    });
});


