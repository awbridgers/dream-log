import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Log, RootStackParamsList, UploadLog} from '../types';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  BackHandler,
} from 'react-native';
import {Feather} from '@expo/vector-icons';
import appColors from '../colors';
import {useCallback, useContext, useState} from 'react';
import Create from './Create';
import {Timestamp, doc, getFirestore, updateDoc,} from 'firebase/firestore';
import {AuthContext} from '../firebase/authContext';
import {fb} from '../firebase/firebaseConfig';
import {removeStopwords} from 'stopword';
import {TouchableOpacity} from 'react-native';
import {useAppDispatch, useAppSelector} from '../Store/hooks';
import {editLog} from '../Store/logs';
import { useFocusEffect } from '@react-navigation/native';

type Nav = NativeStackScreenProps<RootStackParamsList, 'Dream'>;



const Dream = ({route, navigation}: Nav) => {
  const {index} = route.params;
  const [edit, setEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false)        
  const user = useAppSelector((state) => state.user);
  const dream = useAppSelector((state) => state.logs[index]);
  const dispatch = useAppDispatch();

  useFocusEffect(useCallback(()=>{
    const onBackPress = ()=>{
      if(edit){
        setEdit(false);
        return true;
      }
      return false
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return ()=>subscription.remove();
  },[edit]))
  const editDream = (log: UploadLog) => {
    
    Alert.alert(
      'Confirm',
      'Are you sure you want to make these changes to the dream?',
      [
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            if (user) {
              const dreamRef = doc(
                getFirestore(fb),
                `/users/${user.uid}/dreams/${dream.id}`
              );
              try {
                await updateDoc(dreamRef, log);
                //after updating it in the database, update it locally so it changes
                //without needing a refresh
                dispatch(editLog({...log, date: log.date.toMillis()}))
                setEdit(false);
                setLoading(false)
                Alert.alert('Success', 'Dream has been updated.');
              } catch (e) {
                console.log(e);
                Alert.alert('Error', 'There was an error updating your dream.');
                setLoading(false)
              }
            }
          },
        },
        {
          text: 'Cancel',
          onPress:()=>setLoading(false)
        },
      ],
      {cancelable: false}
    );
  };
  return (
    <View style={styles.container}>
      <Modal visible = {loading} transparent = {true} animationType = 'fade'>
      <View style={styles.loading}>
          <ActivityIndicator
            testID="spinner"
            size={Platform.OS === 'android' ? 75 : 'large'}
          />
        </View>
      </Modal>
      {edit ? (
        <View style={{flex: 1}}>
          <Feather
            style={{position: 'absolute', right: 5}}
            name="x-square"
            size={45}
            color={'red'}
            onPress={() => setEdit(false)}
          />

          <Create index={index} onSubmit={editDream} />
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
  button: {
    width: 125,
    height: 60,
    backgroundColor: appColors.secondary,
    alignSelf: 'center',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});

export default Dream;
