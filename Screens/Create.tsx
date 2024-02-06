import {
  TextInput,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
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
  Timestamp,
} from 'firebase/firestore';
import {fb} from '../firebase/firebaseConfig';
import {useAppDispatch, useAppSelector} from '../Store/hooks';
import {Log, UploadLog} from '../types';

type Props = {
  index?: number;
  onSubmit?: (log: UploadLog) => void;
};

const Create = ({index, onSubmit}: Props) => {
  const dream: Log | null =
    index !== undefined ? useAppSelector((state) => state.logs[index]) : null;
  const [showDate, setShowDate] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(
    dream ? new Date(dream.date) : new Date()
  );
  const [title, setTitle] = useState<string>(dream ? dream.title : 'Test');
  const [dreamPlot, setDreamPlot] = useState<string>(
    dream ? dream.dreamPlot : 'This is a test'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const user = useAppSelector((state) => state.user);
  const db = useRef<Firestore>(getFirestore(fb));
  const dispatch = useAppDispatch();

  const getKeywords = () => {
    const target = `${title} ${dreamPlot}`
      .toLowerCase()
      .replace('\n', ' ')
      .split(' ')
      .filter((x) => x !== ' ');
    const keywords = removeStopwords(target);
    const set = new Set(keywords);
    return [...set];
  };

  const submit = async () => {
    setLoading(true);
    try {
      const keywords = getKeywords();
      const newDream = {
        title,
        date: Timestamp.fromDate(date),
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
    setLoading(false);
  };
  const edit = () => {
    if (dream && onSubmit) {
      const newDream = {
        title: title,
        date: Timestamp.fromDate(date),
        dreamPlot: dreamPlot,
        keywords: getKeywords(),
        id: dream.id,
      };
      onSubmit(newDream);
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
      <Modal visible={loading} transparent={true} animationType="fade">
        <View style={styles.loading}>
          <ActivityIndicator
            testID="spinner"
            size={Platform.OS === 'android' ? 75 : 'large'}
          />
        </View>
      </Modal>
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
          <TouchableOpacity
            onPress={onSubmit && dream ? edit : submit}
            style={styles.button}
          >
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
    fontSize: 20,
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
  loading: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
export default Create;
