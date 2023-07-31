import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import appColors from '../colors';
import {useContext, useEffect, useRef, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamsList} from '../types';
import {fb} from '../firebaseConfig';
import {Auth, createUserWithEmailAndPassword, getAuth} from 'firebase/auth';
import {AuthContext} from '../App';

type Props = NativeStackScreenProps<RootStackParamsList, 'SignUp'>;

const SignUp = ({navigation}: Props) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');
  const [error, setError] = useState<string>('');
  const authRef = useRef<Auth>(getAuth(fb));
  const user = useContext(AuthContext);
  const submit = async () => {
    setError('');
    if (password !== confirm) {
      Alert.alert('Passwords do not match');
      setError('passwords do not match.');
    } else {
      createUserWithEmailAndPassword(authRef.current, email, password).then(()=>Alert.alert('Account Created Successfully!')).catch(
        (e) => {
          if (e instanceof Error) {
            console.log(e);
            const errorCode = e.message.match(/\(.+\)/);
            const errorMessage = e.message.replace(/\(.+\)/, '').replace('Firebase:', '');
            const [titleRaw] = errorCode ? errorCode : [''];
            const title = titleRaw
              .replace(/\(.+\//g, '')
              .replace(/-/g, ' ')
              .replace(')', '');
            Alert.alert(`Error: ${title}`, errorMessage);
            setError(title)
          }
        }
      );
    }
  };
  useEffect(() => {
    if (user) {
      navigation.navigate('Home');
    }
  }, []);
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Create Account</Text>
      </View>
      <View style={styles.form}>
        <View style={styles.error}>
          {error && <Text style={styles.errorText}>Error: {error}</Text>}
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            textContentType="emailAddress"
            value={email}
            inputMode="email"
            style={[
              styles.input,
              error.includes('email') ? styles.inputError : {},
            ]}
            onChangeText={(text) => setEmail(text)}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            textContentType="password"
            secureTextEntry
            style={[
              styles.input,
              error.includes('password') ? styles.inputError : {},
            ]}
            onChangeText={(text) => setPassword(text)}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            value={confirm}
            textContentType="password"
            secureTextEntry
            style={[
              styles.input,
              error.includes('password') ? styles.inputError : {},
            ]}
            onChangeText={(text) => setConfirm(text)}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={submit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    color: appColors.secondary,
    margin: 10,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 25,
    color: appColors.primary,
    //width: '35%',
  },
  input: {
    height: 54,
    borderWidth: 2,
    padding: 12,
    backgroundColor: 'white',
    fontSize: 25,
  },
  inputError: {
    borderColor: 'red',
  },

  inputContainer: {
    margin: 6,
  },
  button: {
    width: 125,
    height: 60,
    backgroundColor: appColors.secondary,
    alignSelf: 'center',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonText: {
    fontSize: 25,
  },
  error: {
    alignSelf: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default SignUp;
