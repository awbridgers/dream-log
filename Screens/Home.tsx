import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {View} from 'react-native';
import {RootStackParamsList, TabParamsList} from '../types';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Create from './Create';
import DreamList from './DreamList';

type Props = NativeStackScreenProps<RootStackParamsList, 'Home'>;
const Tab = createBottomTabNavigator<TabParamsList>();

const Home = ({navigation}: Props) => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Logs" component={DreamList} />
      <Tab.Screen name="Create" component={Create} />
    </Tab.Navigator>
  );
};

export default Home;
