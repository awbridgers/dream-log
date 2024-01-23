import {
  TextInput,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import appColors from '../colors';
import {removeStopwords} from 'stopword';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {useContext, useRef, useState} from 'react';
import {AuthContext} from '../firebase/authContext';
import {
  Firestore,
  addDoc,
  collection,
  doc,
  getFirestore,
  setDoc,
} from 'firebase/firestore';
import {fb} from '../firebase/firebaseConfig';

const Create = () => {
  const [showDate, setShowDate] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [title, setTitle] = useState<string>('Test');
  const [dreamPlot, setDreamPlot] = useState<string>('This is a test');
  const user = useContext(AuthContext);
  const db = useRef<Firestore>(getFirestore(fb));

  const submit = async () => {
    try {
      const keywords = removeStopwords(`${title} ${dreamPlot}`.split(' '));
      console.log(keywords);
      const newDream = {
        title,
        date,
        dreamPlot,
        keywords,
      };
      const dreamCol = collection(db.current, `users/${user!.uid}`, 'dreams');
      await addDoc(dreamCol, newDream);
      Alert.alert('Success', 'Your dream was saved to the log.');
      setDate(new Date());
      setTitle('');
      setDreamPlot('');
    } catch (e) {
      console.log(e);
      Alert.alert(
        'Error',
        'There was an issue saving your dream. Please try again.'
      );
    }
  };

  const changeDate = (
    e: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    setDate(selectedDate ? selectedDate : new Date());
    setShowDate(false);
  };
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={0}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.form}
      >
        <View style={styles.formLine}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDate(true)}
          >
            <Text style={styles.date}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.formLine}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={(text) => {
              if (text.length <= 20) setTitle(text);
            }}
          />
        </View>
        <View style={[styles.formLine]}>
          <Text style={styles.label}>Dream Synopsis</Text>
          <TextInput
            numberOfLines={8}
            multiline
            value={dreamPlot}
            onChangeText={(text) => setDreamPlot(text)}
            style={[styles.input, styles.textBody]}
          ></TextInput>
        </View>
        <View style={styles.formLine}>
          <TouchableOpacity onPress={submit} style={styles.button}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {showDate && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          is24Hour={true}
          onChange={changeDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  form: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {},
  label: {
    fontSize: 22,
    color: appColors.secondary,
  },
  date: {
    color: 'white',
    fontSize: 25,
  },
  formLine: {
    margin: 2,
  },
  input: {
    height: 50,
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'white',
    fontSize: 25,
  },
  dateButton: {
    backgroundColor: '#147EFB',
    borderRadius: 6,
    padding: 10,
    minWidth: 160,
    alignItems: 'center',
    alignSelf: 'center',
  },
  textBody: {
    textAlignVertical: 'top',
    height: 325,
    fontSize: 20
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
});
export default Create;
