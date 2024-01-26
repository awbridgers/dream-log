import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Log, RootStackParamsList} from '../types';
import {View, StyleSheet, Text, ScrollView, TextInput, Alert} from 'react-native';
import {Feather} from '@expo/vector-icons';
import appColors from '../colors';
import {useContext, useState} from 'react';
import Create from './Create';
import {doc, getFirestore, updateDoc } from 'firebase/firestore';
import { AuthContext } from '../firebase/authContext';
import { fb } from '../firebase/firebaseConfig';
import { removeStopwords } from 'stopword';

type Nav = NativeStackScreenProps<RootStackParamsList, 'Dream'>;

const Dream = ({route, navigation}: Nav) => {
  const {dream} = route.params;
  const [edit, setEdit] = useState<boolean>(false);
  const user = useContext(AuthContext)
  const updateDream = async (title:string, date: Date, plot: string)=>{
    if(user){
      const dreamRef = doc(getFirestore(fb), `/users/${user.uid}/dreams/${dream.id}`)
      const newKeywords = removeStopwords(`${title} ${plot}`.toLowerCase().split(' ').filter(x=>x!==''))
      try{
        await updateDoc(dreamRef, {date, dreamPlot: plot, title, keywords: newKeywords})
        setEdit(false);
        Alert.alert('Success', 'Dream has been updated.')
      }
      catch(e){
        console.log(e);
        Alert.alert('Error', 'There was an error updating your dream.')
      }
    }
    
  }
  return (
    <View style = {styles.container}>
      {edit ? (
        <View style = {{flex:1}}>
          <Feather
              style={{position: 'absolute', right: 5}}
              name="x-square"
              size={45}
              color={"red"}
              onPress={() => setEdit(false)}
            />
          <Create prevDate={new Date(dream.date)} prevTitle={dream.title} prevPlot={dream.dreamPlot} onSubmit={updateDream}/>
        </View>
      ) : (
        <View>
          <View style={styles.title}>
            <Text style={styles.titleText}>{dream.title}</Text>
            <Feather
              style={{position: 'absolute', right: 5}}
              name="edit"
              size={25}
              color={appColors.primary}
              onPress={() => setEdit(true)}
            />
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{paddingBottom: 50}}
          >
            <Text style={styles.plot}>{dream.dreamPlot}</Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
  },
  titleText: {
    color: 'white',
    alignSelf: 'center',
    fontSize: 30,
    margin: 20,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  plot: {
    color: 'white',
    fontSize: 20,
    // paddingBottom: 200
  },
  scroll: {},
});

export default Dream;
