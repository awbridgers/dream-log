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
  where,
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
  ActivityIndicator,
  Keyboard,
  TextInput,
} from 'react-native';
import {Log, RootStackParamsList, TabParamsList} from '../types';
import {AuthContext} from '../firebase/authContext';
import {fb} from '../firebase/firebaseConfig';
import appColors from '../colors';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Feather} from '@expo/vector-icons';

type DreamListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamsList, 'Logs'>,
  NativeStackScreenProps<RootStackParamsList>
>;

const DreamList = ({navigation}: DreamListScreenProps) => {
  const user = useContext(AuthContext);
  const db = useRef<Firestore>(getFirestore(fb));
  const [logs, setLogs] = useState<Log[]>([]);
  //const [nextFetch, setNextFetch] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshingList, setIsRefreshingList] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [searchTerms, setSearchTerms] = useState<string[]>([])
  const lastFetch = useRef<QueryDocumentSnapshot>();
  const fetchesRemaining = useRef<boolean>(true);
  const searchBarRef = useRef<TextInput | null>(null);
  const callOnScrollEnd = useRef<boolean>(false)
  useEffect(()=>{
    const fetch = async () => {
      console.log(isRefreshingList)
      if (user && fetchesRemaining.current && isRefreshingList) {
        console.log('fetch initiated')
        setIsLoading(true);
        const searchKeywords =
          searchTerms.length > 0
            ? where(
                'keywords',
                'array-contains-any',
                searchTerms
              )
            : where('date', '!=', null);
            console.log('where:  ' + searchText)
            console.log(searchKeywords)
        let q: Query;
        if (!lastFetch.current) {
          //the first fetch, start at the beginning of the database
          q = query(
            collection(db.current, 'users', user.uid, 'dreams'),
            orderBy('date', 'desc'),
            limit(10),
            searchKeywords
          );
          console.log('first fetch')
        } else {
          //a subsequent fetch, start after the last fetched log
          q = query(
            collection(db.current, 'users', user.uid, 'dreams'),
            orderBy('date', 'desc'),
            startAfter(lastFetch.current),
            limit(10),
            searchKeywords
            
          );
          console.log('subsequent fetch')
        }
        try {
          const docSnapshot = await getDocs(q);
          if (docSnapshot.empty) {
            fetchesRemaining.current = false
          } else {
            const data: Log[] = [];
            lastFetch.current = docSnapshot.docs[docSnapshot.docs.length - 1]
            docSnapshot.forEach((x) =>
              data.push({
                ...(x.data() as Log),
                id: x.id,
                date: x.data().date.seconds,
              })
            );
            //console.log(data)
            setLogs(prev=>[...prev, ...data]);
            console.log('\n')
          }
        } catch (e) {
          console.log(e instanceof Error ? e.message : 'Error');
        }
        setIsLoading(false);
        setIsRefreshingList(false);
      }
    };
    fetch();
  },[searchTerms, user, isRefreshingList ])
  
 const search = () =>{
  setLogs([])
  setSearchTerms(searchText.split(' ').filter(x=>x!== ''))
  setIsRefreshingList(true);
  fetchesRemaining.current = true;
  lastFetch.current = undefined;
 }
 const refresh = () =>{
  fetchesRemaining.current = true;
  lastFetch.current = undefined;
  setLogs([]);
  setIsRefreshingList(true)
  
 }
  return (
    <View style={{marginLeft: 5, marginRight: 5}}>
      <View style={styles.searchBar}>
        <Feather name="search" size={30} color="black" />
        <TextInput
          style={styles.searchText}
          placeholder="Search Keywords"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
          ref={searchBarRef}
          onSubmitEditing={search}
        />
        {searchText && (
          <Feather
            style={{margin: 5}}
            name="x-square"
            size={24}
            color="black"
            onPress={() => {
              setSearchText('');
              setSearchTerms([])
              Keyboard.dismiss();
              refresh();
            }}
          />
        )}
      </View>
      <FlatList
        onEndReached={() => callOnScrollEnd.current = true}
        onMomentumScrollEnd = {()=>{
          if(callOnScrollEnd.current && fetchesRemaining.current){
            setIsRefreshingList(true)
          }
          callOnScrollEnd.current = false;
        }}
        onRefresh={() => refresh()}
        refreshing={isRefreshingList}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <View style = {{marginBottom:50}}>
            {isLoading && (
              <ActivityIndicator size="large" />
            )}
          </View>
        }
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
  },
  border: {
    backgroundColor: 'black',
    height: 2.5,
  },
  button: {},
  searchBar: {
    backgroundColor: '#cecece',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
  },
  searchText: {
    height: 50,
    padding: 5,
    backgroundColor: '#cecece',
    fontSize: 22,
    flex: 1,
  },
});

export default DreamList;
