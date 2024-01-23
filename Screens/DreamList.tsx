import {
  Firestore,
  Query,
  QueryDocumentSnapshot,
  collection,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  startAt,
} from 'firebase/firestore';
import React, {useCallback} from 'react';
import {useEffect, useContext, useRef, useState} from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Button,
  ActivityIndicator
} from 'react-native';
import {Log, RootStackParamsList, TabParamsList} from '../types';
import {AuthContext} from '../firebase/authContext';
import {fb} from '../firebase/firebaseConfig';
import appColors from '../colors';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

type DreamListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamsList, 'Logs'>,
  NativeStackScreenProps<RootStackParamsList>
>;

const DreamList = ({navigation}: DreamListScreenProps) => {
  const user = useContext(AuthContext);
  const db = useRef<Firestore>(getFirestore(fb));
  const [logs, setLogs] = useState<Log[]>([]);
  //const [nextFetch, setNextFetch] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshingList, setIsRefreshingList] = useState<boolean>(false)
  const lastFetch = useRef<QueryDocumentSnapshot>();
  const fetchesRemaining = useRef<boolean>(true);

  const fetch = async () => {
    if (user && fetchesRemaining.current) {
      setIsLoading(true);
      let q: Query;
      if (!lastFetch.current) {
        //the first fetch, start at the beginning
        q = query(
          collection(db.current, 'users', user.uid, 'dreams'),
          orderBy('date', 'desc'),
          limit(10)
        );
      } else {
        //a subsequent fetch, start after the last fetched log
        q = query(
          collection(db.current, 'users', user.uid, 'dreams'),
          orderBy('date', 'desc'),
          startAfter(lastFetch.current),
          limit(10)
        );
      }
      try {
        const docSnapshot = await getDocs(q);
        if (docSnapshot.empty) {
          fetchesRemaining.current = false;
        } else {
          const data: Log[] = [];
          lastFetch.current = docSnapshot.docs[docSnapshot.docs.length - 1];
          docSnapshot.forEach((x) =>
            data.push({
              ...(x.data() as Log),
              id: x.id,
              date: x.data().date.seconds,
            })
          );
          //console.log(data)
          setLogs([...logs, ...data]);
        }
      } catch (e) {
        console.log(e instanceof Error ? e.message : 'Error');
      }
      setIsLoading(false)
      setIsRefreshingList(false)
    }
  };
  const refresh = ()=>{
    lastFetch.current = undefined;
    fetchesRemaining.current = true;
    setIsRefreshingList(true);
    setLogs([]);
    fetch();

  }
  useEffect(()=>{
    if(logs.length === 0){
      setIsLoading(true);
    }
  },[])
  useEffect(() => {
    if (user) {
      fetch();
    }
  }, [user]);
  return (
    <View>
      <FlatList
        onEndReached={()=>fetch()}
        onRefresh={()=>refresh()}
        refreshing = {isRefreshingList}
        contentContainerStyle={styles.list}
        ListFooterComponent={<View>{isLoading && <ActivityIndicator size = 'large' />}</View>}
        data={logs}
        ItemSeparatorComponent={() => <View style={styles.border}></View>}
        renderItem={({item, index}) => (
          <Pressable
            onPress={() => navigation.navigate('Dream', {dream: item})}
            style={styles.box}
          >
            <View style={styles.dateContainer}>
              <Text style={styles.date}>
                {new Intl.DateTimeFormat('en-US', {dateStyle: 'short'}).format(
                  new Date(item.date * 1000)
                )}
              </Text>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.secondary,
    height: 80,
  },
  title: {
    fontSize: 30,
    color: 'black',
  },
  date: {
    fontSize: 22,
    color: 'black',
    alignSelf: 'center',
  },
  dateContainer: {
    width: '30%',
    height: '100%',
    //backgroundColor: appColors.tertiary,
    justifyContent: 'center',
    borderRightWidth: 2,
    borderRightColor: 'black',
  },
  titleContainer: {
    flex: 1,
    // backgroundColor: "orange",
    alignItems: 'center',
  },
  list: {
    paddingBottom: 50,
    paddingTop: 50,
    marginLeft: 5,
    marginRight: 5,
  },
  border: {
    backgroundColor: 'black',
    height: 2.5,
  },
  button: {},
});

export default DreamList;
