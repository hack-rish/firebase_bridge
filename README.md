Small node server to handle interactions with Firebase via server.
Originally was just handling FCM to invite a user who is your friend.
The delete user functionality was problematic with the UX on Unity's side so we piggy backed this functionality off the FCM Bridge, since it already would have access to firebase resources, instead of the main server. 

Two endpoints that accept JSON POST requests:
/sendMessageToUser
/deleteUser
