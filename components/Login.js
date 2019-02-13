import React from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView} from 'react-native'
import {firebase, firestore} from "../Firebase"
import {Permissions,Notifications} from "expo"

export default class Loading extends React.Component {
    constructor() {
        super()
        this.state = {
          userName: "",
          password: ""
        }
        this.usersRef = firestore.collection("players");
        this.userInput = React.createRef();
        this.pWInput = React.createRef();
    }

    logIn = () => {
      firebase
      .auth()
      .signInWithEmailAndPassword(this.state.userName+"@nickspa.cat", this.state.password)
      .then(() => {
        let userId = firebase.auth().currentUser.uid;
        this.registerForPushNotificationsAsync(userId);
        this.userInput.current.clear();
        this.pWInput.current.clear();
        this.props.navigation.navigate('App');
      })
      .catch(error => alert("No s'ha pogut iniciar sessió.\n\nError: "+error.message))
    }

    registerForPushNotificationsAsync = async (uid) => {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
    
      // only ask if permissions have not already been determined, because
      // iOS won't necessarily prompt the user a second time.
      if (existingStatus !== 'granted') {
        // Android remote notification permissions are granted during the app
        // install, so this will only ask on iOS
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
    
      // Stop here if the user did not grant permissions
      if (finalStatus !== 'granted') {
        return;
      }
    
      // Get the token that uniquely identifies this device
      let token = await Notifications.getExpoPushTokenAsync();

      let updates = {};
      updates["expoToken"] = token;
      this.usersRef.doc(uid).update(updates);
  
    }

  render() {
    return (
      <ImageBackground style = {{flex:1}} source={require("../assets/bg.jpg")}>
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <View style={styles.logInForm}>
          <View style={styles.welcomeView}>
            <Text style={styles.welcomeText}>Benvingut/da!</Text>
          </View>
          <View style={styles.instructionView}>
            <Text style={styles.instructionText}>Introdueix les teves dades</Text>
          </View>
          <View style={styles.inputFieldRow}>
            <View style={styles.fieldDescriptionView}>
              <Text style={styles.fieldDescriptionText}>Usuari:</Text>
            </View>
            <TextInput placeholder="Usuari" ref={this.userInput} style={styles.inputField} onChangeText={(userName)=>this.setState({userName})}/>
          </View>
          <View style={styles.inputFieldRow}>
            <View style={styles.fieldDescriptionView}>
              <Text style={styles.fieldDescriptionText}>Contrasenya:</Text>
            </View>
            <TextInput placeholder="Contrasenya" ref={this.pWInput} style={styles.inputField} secureTextEntry={true} onChangeText={(password)=>this.setState({password})}/>
          </View>
          <TouchableOpacity style={styles.logInButton} onPress={this.logIn}>
            <Text style={styles.logInText} >Inicia sessió</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </ImageBackground>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffec8b33",
    justifyContent: "center",
  },
  logInForm:{
    paddingVertical:50,
    paddingHorizontal:20,
    justifyContent: 'center',
    backgroundColor: "#ffffffA6"
  },
  welcomeView:{
    paddingBottom: 10,
    alignItems:"center",
    justifyContent: "center"
  },
  welcomeText:{
    fontSize: 25,
    fontFamily: "bold",
    color:"black"
  },
  instructionView:{
    paddingBottom: 20,
    alignItems:"center",
    justifyContent: "center"
  },
  instructionText:{
    fontSize: 16,
    color:"black"
  },
  inputFieldRow:{
    paddingVertical: 10,
    paddingRight: 30,
    flexDirection: "row"
  },
  fieldDescriptionView:{
    flex:1,
    alignItems:"flex-end",
    paddingRight: 30,
    justifyContent: "center"
  },
  fieldDescriptionText:{
    fontSize: 15,
  },
  inputField:{
    flex:1,
    backgroundColor: "white",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 3,
  },
  logInButton:{
    alignItems:"center",
    justifyContent: "center",
    paddingTop: 20
  },
  logInText:{
    color: "darkblue",
    fontSize: 17
  }
})