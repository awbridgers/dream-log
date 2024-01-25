import {StatusBar} from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  Touchable,
  TouchableOpacity,
} from 'react-native';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Log, RootStackParamsList} from './types';
import Login from './Screens/Login';
import SignUp from './Screens/SignUp';
import {initializeApp} from 'firebase/app';
import {Auth, User, getAuth, onAuthStateChanged, signOut} from 'firebase/auth';
import {createContext, useEffect, useRef, useState} from 'react';
import {
  Firestore,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import {fb} from './firebase/firebaseConfig';
import {AuthContext} from './firebase/authContext';
import Home from './Screens/Home';
import Dream from './Screens/Dream';

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: 'rgb(0, 148, 255)',
    background: 'rgb(5,26,76)',
  },
};

// const Home = () => {
//   const auth = getAuth(fb);
//   console.log(auth.currentUser);
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.tsx to start working on your app!</Text>
//       <TouchableOpacity
//         onPress={() =>
//           signOut(auth).then(() => console.log('signedOut'))
//         }
//       >
//         <Text>Logout</Text>
//       </TouchableOpacity>
//       <StatusBar style="auto" />
//     </View>
//   );
// };

const Stack = createNativeStackNavigator<RootStackParamsList>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const navigationRef = useNavigationContainerRef<RootStackParamsList>();
  const [navReady, setNavReady] = useState<boolean>(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const authRef = useRef<Auth>(getAuth(fb));
  const db = useRef<Firestore>(getFirestore(fb));

  useEffect(() => {
    if (navReady) {
      return onAuthStateChanged(authRef.current, (loggedUser) => {
        if (loggedUser) {
          //user is logged in!
          setUser(loggedUser);

          navigationRef.navigate('Home');
        } else {
          //console.log(user);

          //user is logged out
          if (user) {
            console.log('logging out ' + user);
            setUser(null);
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
      <AuthContext.Provider value={user}>
        <StatusBar style="light"></StatusBar>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Home"
            component={Home}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Login"
            component={Login}
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
            options={({route}) => ({headerTitle: new Intl.DateTimeFormat('en-US', {dateStyle: 'short'}).format(
              new Date(route.params.dream.date * 1000)), headerTitleAlign: 'center'})}
          />
        </Stack.Navigator>
      </AuthContext.Provider>
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
