import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import {firebase , firestore} from "../Firebase"
import EndingPeriodModal from "./editingComponents/EndingPeriodModal"

export default class EditingScreen extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            endingPeriodModal: false,
        }
        this.playersRef = firestore.collection("players");
        this.userId = firebase.auth().currentUser.uid;
        this.matchesRef = firestore.collection("matches");
        this.rankingRef = firestore.collection("rankings");
    }

    componentDidMount () {
        
        this.rankingRef.onSnapshot((querySnapshot) => {
            querySnapshot.forEach((doc)=>{
                let {ranking} = doc.data()
                this.setState ({
                    ranking: ranking,
                })
            }
        )});
    }

    toggleEndingPeriodModal = () => {
        this.setState({
            endingPeriodModal:!this.state.endingPeriodModal
        })
    }

    render() {

        let endingPeriodModal = this.state.endingPeriodModal ? (
            <EndingPeriodModal toggleEndingPeriodModal={this.toggleEndingPeriodModal}/>
        ) : null;

        return (
        <View style= {styles.container}>
            <View style = {styles.titleView}>
                <Text style = {styles.titleText}>GESTIÓ COMPETICIÓ</Text>
            </View>
            <View style = {styles.questionView}>
                <Text style = {styles.questionText}>Estàs a la pantalla d'edició de la competició. Què vols fer?</Text>
            </View>
            <TouchableOpacity style = {styles.editingOptionView} onPress = {()=>{}}>
                <Text style = {styles.editingOptionText}>Editar el ranking manualment</Text>
            </TouchableOpacity>
            <TouchableOpacity style = {styles.editingOptionView} onPress = {()=>{}}>
                <Text style = {styles.editingOptionText}>Afegir/treure jugadors</Text>
            </TouchableOpacity>
            <TouchableOpacity style = {styles.editingOptionView} onPress = {this.toggleEndingPeriodModal}>
                <Text style = {styles.editingOptionText}>Finalitzar periode de competició</Text>
            </TouchableOpacity>
            <TouchableOpacity style = {styles.editingOptionView} onPress = {()=>{}}>
                <Text style = {styles.editingOptionText}>Modificar partits</Text>
            </TouchableOpacity>
            {endingPeriodModal}
        </View>
        );
    }
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingHorizontal:20,
    backgroundColor: "white",
    paddingTop: 30,
  },
  titleView: {
      justifyContent: "center",
      alignItems: "center"
  },
  titleText:{
      fontSize: 30,
      fontFamily: "bold"
  }
});