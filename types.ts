import { User } from 'firebase/auth';
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamsList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
  Dream: {dream: Log}
}
export type TabParamsList = {
  Logs : NavigatorScreenParams<RootStackParamsList>;
  Create: undefined;
  Profile: undefined;

}

export type Log = {
  title: string;
  date: number;
  dreamPlot: string;
  keywords: string[];
  id: string;

}

