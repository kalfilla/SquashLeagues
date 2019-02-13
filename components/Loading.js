import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import {firebase, firestore} from "../Firebase"

export default class Loading extends React.Component {
    constructor() {
        super()

        this.usersRef = firestore.collection("players");
    }

    componentDidMount() {
      
      const unsub = firebase.auth().onAuthStateChanged(user => {
        this.props.navigation.navigate(user? 'App' : 'Login')    
      });
      
      //ranking=["David Febrer","Pol Febrer","Albert Robleda","Dani Ramírez","Óliver Haldon","Laszlo Kubala","Quim Martínez","Martín Sombra","Miguel Aranda","Pol Rami","Marc Sabadell","David Biern","Ángel González","David Ordeig","Quim Torrents","Miquel Juan","Jan González","Xavier Rami","Maribel Calabozo","Enric Calafell","Carlos Tomás","Robert del Canto","Claudio Sánchez","Guilleume","Álex Miravalles","August Tanari","Víctor Uruel","Javier Artigas","Joseph Uguet","Javi Hernando","Sergio Uruel","Gerard Torres"]

      

      /*function registerUser(player,that) {
        let playerName = player.slice()
        let splitted = playerName.normalize('NFD').replace(/[\u0300-\u036f]/g, "").split(" ");
        let name = splitted[0];
        let surName = splitted[1]? (splitted[1]+ (splitted[2] ? splitted[2] : "")): "";
        let email;
        if (surName){
          email = name.toLowerCase()[0]+surName.toLowerCase()+"@nickspa.cat";
        } else {
          email = name.toLowerCase()+"@nickspa.cat"
        }
        let password = name+"0123";
          firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
          const userId = firebase.auth().currentUser.uid
          that.usersRef.doc(userId).set({
            playerName: player
          });
        })
        .catch(error => alert(error.message));
      }*/  

      /*ranking.forEach((player,index)=> {
        setTimeout(()=> {registerUser(player,this)},2000*index)  
      })*/

  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Comprovant usuari</Text>
        <ActivityIndicator size="large" />
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})