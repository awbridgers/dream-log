import { User } from 'firebase/auth';
import { NavigatorScreenParams } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';

export type RootStackParamsList = {
  Home: undefined;
  Login: undefined;
  SignUp: undefined;
  Dream: {index: number}
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

export type UploadLog = Omit<Log, 'date'> & {date: Timestamp}
