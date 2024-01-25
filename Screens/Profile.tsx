import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { RootStackParamsList, TabParamsList } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Button, Touchable, TouchableOpacity } from 'react-native';
import { AuthContext } from '../firebase/authContext';
import { useContext } from 'react';
import appColors from '../colors';
import { fb } from '../firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';




const Profile = ()=>{
  const user = useContext(AuthContext);
  const authRef = getAuth(fb)
  return <View style = {styles.container}>
    <Text style = {styles.title}>Profile Info</Text>
    <TouchableOpacity onPress={()=>authRef.signOut()} style = {styles.button}>
      <Text style = {styles.buttonText}>Log Out</Text>
    </TouchableOpacity>
  </View>
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    alignItems: 'center',
    
  },
  title:{
    fontSize: 25,
    color: 'white'
  },
  button: {
    width: 125,
    height: 60,
    backgroundColor: appColors.secondary,
    alignSelf: 'center',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 25,
  },
})

export default Profile