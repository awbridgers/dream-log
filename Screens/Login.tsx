import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import appColors from '../colors';
import {useState} from 'react';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const submit = () => {
    console.log(email, password);
  };
  const signUp = ()=>{
    console.log('sign up!')
  }
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Login</Text>
      </View>
      <View style={styles.form}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setEmail(text)}
            //placeholder='Email'
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            textContentType="password"
            secureTextEntry
            onChangeText={(text) => setPassword(text)}
            //placeholder='password'
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={submit}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.signUpContainer}>
        <Text style={styles.noAccount}>Don't have an account? </Text>
        <TouchableOpacity onPress = {()=>signUp()}><Text style={styles.signUp} >Sign Up!</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    color: appColors.secondary,
  },
  input: {
    height: 50,
    borderWidth: 1,
    padding: 10,
    backgroundColor: 'white',
    fontSize: 25,
  },
  label: {
    fontSize: 25,
    color: appColors.primary,
  },
  form: {
    width: '100%',
  },
  textContainer: {
    margin: 12,
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
  noAccount: {
    fontSize: 22,
    color: appColors.primary,
  },
  signUp: {
    fontSize: 25,
    color: appColors.secondary,
    textDecorationLine: 'underline',
  },
  signUpContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
});
export default Login;
