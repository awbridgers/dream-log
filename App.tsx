import {StatusBar} from 'expo-status-bar';
import {StyleSheet} from 'react-native';
import {
  NavigationContainer,
  DarkTheme,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Log, RootStackParamsList} from './types';
import Login from './Screens/Login';
import SignUp from './Screens/SignUp';
import {Auth, User, getAuth, onAuthStateChanged} from 'firebase/auth';
import {useEffect, useRef, useState} from 'react';
import {Firestore, getFirestore} from 'firebase/firestore';
import {fb} from './firebase/firebaseConfig';
import Home from './Screens/Home';
import Dream from './Screens/Dream';
import {Provider} from 'react-redux';
import {store} from './Store/store';
import {useAppDispatch, useAppSelector} from './Store/hooks';
import {RootState} from './Store/store';
import {changeUser} from './Store/user';

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: 'rgb(0, 148, 255)',
    background: 'rgb(5,26,76)',
  },
};

const Stack = createNativeStackNavigator<RootStackParamsList>();

export default function App() {
  return(
  <Provider store={store}>
    <Routes />
  </Provider>)
}

export function Routes() {
  //const [user, setUser] = useState<User | null>(null);
  const navigationRef = useNavigationContainerRef<RootStackParamsList>();
  const [navReady, setNavReady] = useState<boolean>(false);
  //const [logs, setLogs] = useState<Log[]>([]);
  const authRef = useRef<Auth>(getAuth(fb));
  const db = useRef<Firestore>(getFirestore(fb));
  const dispatch = useAppDispatch();
  const user = useAppSelector(state=>state.user)
  const logs = useAppSelector(state=>state.logs)

  useEffect(() => {
    if (navReady) {
      return onAuthStateChanged(authRef.current, (loggedUser) => {
        if (loggedUser && !user) {
          //user is logged in!
          //console.log(loggedUser)
          dispatch(changeUser({
            uid: loggedUser.uid,
            displayName: loggedUser.displayName,
            photoURL: loggedUser.photoURL,
            phoneNumber: loggedUser.phoneNumber,
            email: loggedUser.email,
            providerId: loggedUser.providerId
          }));

          navigationRef.navigate('Home');
        } else if(!loggedUser) {
          //user is logged out
          if (user) {
            console.log('logging out ' + user);
            dispatch(changeUser(null));
            navigationRef.navigate('Login');
          }
        }
      });
    }
  }, [navReady, user]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => setNavReady(true)}
      theme={MyTheme}
    >
      <StatusBar style="light"></StatusBar>
      <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          // options={{headerShown: false}}
        />
        <Stack.Screen
          name="Dream"
          component={Dream}
          initialParams={{}}
          options={({route}) => ({
            headerTitle: new Intl.DateTimeFormat('en-US', {
              dateStyle: 'short',
            }).format(new Date(logs[route.params.index].date)),
            headerTitleAlign: 'center',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
