const functions = require('firebase-functions');
var fetch = require('node-fetch')

const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

//send the push notification 
exports.messageNotification = functions.firestore.document('groups/{iGroup}/chatMessages/{id}').onCreate((event,context) => {

    const {playerName, message} = event.data();
    let iGroup = context.params.iGroup;
    iGroup = /^\d+$/.test(iGroup) ? Number(context.params.iGroup) : iGroup;
    const authorName = playerName;
    const root = event.ref.firestore
    var messages = []
    //return the main promise 
    return root.collection('players').where("currentGroup","==",iGroup).get().then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            
            var {expoToken, playerName} = childSnapshot.data();
            let title = /^\d+$/.test(iGroup) ? "Xat del grup "+iGroup : "Xat general";
            if (expoToken && playerName!=authorName){
                messages.push({
                    "to": expoToken,
                    "sound": "default",
                    "title": title,
                    "body": authorName+": "+message
                });
            }
        });
        //firebase.database then() respved a single promise that resolves
        //once all the messages have been resolved 
        return Promise.all(messages)

    })
        .then(messages => {
            
            fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messages)

            });
        })
        .catch(reason => {
            console.log(reason)
        })
});

//Enviar notificacions quan s'afegeixen partits
exports.matchNotification = functions.firestore.document('matches/{id}').onCreate((event,context) => {

    const {iGroup, matchPlayers,matchResult} = event.data();
    const iWinner = matchResult.indexOf(3);
    const setsLoser = iWinner == 1 ? matchResult[0] : matchResult[1];
    const winnerName = matchPlayers[iWinner];
    const loserName = iWinner == 1 ? matchPlayers[0] : matchPlayers[1];
    const iGroupFaked = iGroup == "Torneig" ? "Reptes" : iGroup;

    const root = event.ref.firestore
    var messages = []
    //return the main promise 
    return root.collection('players').where("currentGroup","==",iGroupFaked).get().then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            
            var {expoToken, playerName} = childSnapshot.data();
            

            if (expoToken){
                let message;
                if (matchPlayers.indexOf(playerName) != -1){
                    message = winnerName == playerName ? "Has guanyat a "+loserName+" 3-"+setsLoser : "Has perdut contra "+winnerName+"3-"+setsLoser;
                } else {
                    message = winnerName+" ha guanyat a "+loserName+ " 3-"+setsLoser;
                }
                let title;
                if (/^\d+$/.test(iGroup)){
                    title = "Partit afegit al grup "+iGroup
                } else if(iGroup == "Reptes") {
                    title = "Nou repte afegit"
                } else if (iGroup == "Torneig"){
                    title = "S'ha jugat un partit dels campionats"
                }
                
                messages.push({
                    "to": expoToken,
                    "sound": "default",
                    "title": title,
                    "body": message
                });
            }
        });

        root.collection('players').doc("xYenRrtoisOZEvpuRJm0h6FOOe42").get().then((docSnapshot) => {

            var {expoToken,playerName} = docSnapshot.data();
            if (expoToken && matchPlayers.indexOf(playerName) == -1){
                let title;
                if (/^\d+$/.test(iGroup)){
                    title = "Partit afegit al grup "+iGroup
                } else if(iGroup == "Reptes") {
                    title = "Nou repte afegit"
                } else if (iGroup == "Torneig"){
                    title = "S'ha jugat un partit dels campionats"
                }
                messages.push({
                    "to": expoToken,
                    "sound": "default",
                    "title": title,
                    "body": winnerName+" ha guanyat a "+loserName+ " 3-"+setsLoser
                });
            } 
        }).catch(reason => console.log(reason))
        
        //firebase.database then() respved a single promise that resolves
        //once all the messages have been resolved 
        return Promise.all(messages) 
    })
        .then(messages => {
            
            fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messages)

            });
        })
        .catch(reason => {
            console.log(reason)
        })
});

exports.newChallenge1 = functions.firestore.document('Reptes/{id}').onCreate((event,context) => {

    const {matchPlayers,matchResult} = event.data();
    let iWinner = matchResult.indexOf(3);
    const winnerName = matchPlayers[iWinner];
    const loserName = iWinner == 1 ? matchPlayers[0] : matchPlayers[1];

    const root = event.ref.firestore
    var messages = []
    //return the main promise 
    return root.collection('rankings').doc("squashRanking").get().then((docSnapshot) => {
            
        var {ranking,wentUp,wentDown,oneWon} = docSnapshot.data();
        if (!oneWon){oneWon = []}

        let iLoser;
        [iLoser,iWinner] = [ranking.indexOf(loserName),ranking.indexOf(winnerName)];
        if (iWinner < iLoser){
            //Guanyador puja una posició i perdedor baixa una
            if (iWinner != 0 && oneWon.indexOf(winnerName) >= 0){
                ranking[iWinner] = ranking[iWinner-1];
                ranking[iWinner-1] = winnerName;
                oneWon.splice(oneWon.indexOf(winnerName),1)
            } else if (oneWon.indexOf(winnerName) == -1){
                oneWon.push(winnerName)
            }
            if (iLoser != ranking.length-1){
                ranking[iLoser] = ranking[iLoser+1];
                ranking[iLoser+1] = loserName;
            }
        } else {
            ranking.splice(iLoser,0,winnerName);
            ranking.splice(iWinner+1,1);
        }

        if (!wentUp){
            wentUp = [];
        }
        if (!wentDown){
            wentDown = [];
        }
        if (wentDown.indexOf(loserName) == -1){
            wentDown.push(loserName);
        }
        if (wentUp.indexOf(loserName) >= 0){
            wentUp.splice(wentUp.indexOf(loserName),1);
        }
        if (oneWon.indexOf(winnerName) == -1){
            if (wentUp.indexOf(winnerName) ==-1){
                wentUp.push(winnerName);
            }
            if (wentDown.indexOf(winnerName) >= 0){
                wentDown.splice(wentDown.indexOf(winnerName),1);
            }
        }

        return root.collection('rankings').doc("squashRanking").set({ranking,wentUp,wentDown,oneWon})
    }).then(()=>{
        console.log("Succesfully changed ranking")
    }).catch((reason) => {
        console.log(reason)
    })
});

exports.updateRanking = functions.firestore.document('monthInfo/updateRanking').onCreate((event,context) => {

    const root = event.ref.firestore
    let things = {}
    //return the main promise 
    return root.collection('groups').get().then((snapshot) => {
        
        let sortedGroups = [];

        snapshot.forEach((docSnapshot) => {
            let {results} = docSnapshot.data();
            let iGroup = Number(docSnapshot.id);
            let size = Math.sqrt(results.length);
            let totals = [];
            for (let i = 0; i < size; i++){
                let total = results.slice(i*4,(i+1)*4).reduce((a,b) => a + b , 0);
                totals.push([total,i]);
            }

            let sortedGroup = totals.sort((a,b) => { 
                let pointsDif = b[0] - a[0];
                if(pointsDif != 0) {
                    return pointsDif;
                }
                return a[1] - b[1] })
                .map(([_,i]) =>  i+(iGroup-1)*4)
            
            sortedGroups.push(sortedGroup)
            
        });

        let sortedRanking = []
        sortedGroups.forEach((group,i) => {
            if ( i < sortedGroups.length-1){
                let lastOfGroup = group[group.length-1];
                let firstOfNextGroup = sortedGroups[i+1][0];
                group[group.length-1] = firstOfNextGroup;
                sortedGroups[i+1][0] = lastOfGroup;
            }
            sortedRanking = sortedRanking.concat(group)
        })

        things.sortedRanking = sortedRanking;

        return root.collection('rankings').doc("squashRanking").get()
    }).then((docSnapshot)=>{
        let {ranking} = docSnapshot.data();

        let newRanking = things.sortedRanking.map((playerPos) => {return ranking[playerPos]})

        root.collection("rankings").doc("squashRanking").set({ranking:newRanking})
    }).catch((reason) => {
        console.log(reason)
    })
});

//Funció de prova
exports.addMessage = functions.https.onCall((data, context) => {
    return {
        text: "La funció ha funcionat!:)"
      };
      
});