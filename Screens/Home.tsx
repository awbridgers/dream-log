import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {View} from 'react-native';
import {RootStackParamsList, TabParamsList} from '../types';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Create from './Create';
import DreamList from './DreamList';
import Profile from './Profile';
import {Feather} from '@expo/vector-icons';
import appColors from '../colors';

type Props = NativeStackScreenProps<RootStackParamsList, 'Home'>;
const Tab = createBottomTabNavigator<TabParamsList>();

const Home = ({navigation}: Props) => {
  return (
    <Tab.Navigator screenOptions={{tabBarActiveTintColor: appColors.primary}}>
      <Tab.Screen name="Logs" component={DreamList} options={{
          tabBarIcon: ({color, size}) => (
            <Feather name="list" size={size} color={color} />
          ),
        }}/>
      <Tab.Screen
        name="Create"
        component={Create}
        options={{
          tabBarIcon: ({color, size}) => (
            <Feather name="plus-square" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen name="Profile" component={Profile} options={{
          tabBarIcon: ({color, size}) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}/>
    </Tab.Navigator>
  );
};

export default Home;
