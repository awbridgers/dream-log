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
  deleteDoc,
  doc,
  updateDoc
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
  Alert,
} from 'react-native';
import {Log, RootStackParamsList, TabParamsList} from '../types';
import {AuthContext} from '../firebase/authContext';
import {fb} from '../firebase/firebaseConfig';
import appColors from '../colors';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Feather} from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { removeStopwords } from 'stopword';

type DreamListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamsList, 'Logs'>,
  NativeStackScreenProps<RootStackParamsList>
>;

type trashCan = {
  onPress: ()=>Promise<void>
}
const rightSwipeActions = ({onPress} : trashCan) => {
  return (
    <TouchableOpacity
      style={styles.delete}
      onPress={()=>Alert.alert('Confirm', 'Are you sure you want to delete this dream?', [{
        text: 'Delete',
        onPress: onPress,

      },{
        text: 'Cancel',
      }], {cancelable: true})}
    >
      <Feather name="trash-2" size={25} color="black" />
    </TouchableOpacity>
  );
};

const DreamList = ({navigation}: DreamListScreenProps) => {
  const user = useContext(AuthContext);
  const db = useRef<Firestore>(getFirestore(fb));
  const [logs, setLogs] = useState<Log[]>([]);
  //const [nextFetch, setNextFetch] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshingList, setIsRefreshingList] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const lastFetch = useRef<QueryDocumentSnapshot>();
  const fetchesRemaining = useRef<boolean>(true);
  const searchBarRef = useRef<TextInput | null>(null);
  const callOnScrollEnd = useRef<boolean>(false);
  useEffect(() => {
    const fetch = async () => {
      if (user && fetchesRemaining.current && isRefreshingList) {
        setIsLoading(true);
        const searchKeywords =
          searchTerms.length > 0
            ? where('keywords', 'array-contains-any', searchTerms)
            : where('date', '!=', null);
        let q: Query;
        if (!lastFetch.current) {
          //the first fetch, start at the beginning of the database
          q = query(
            collection(db.current, 'users', user.uid, 'dreams'),
            orderBy('date', 'desc'),
            limit(10),
            searchKeywords
          );
        } else {
          //a subsequent fetch, start after the last fetched log
          q = query(
            collection(db.current, 'users', user.uid, 'dreams'),
            orderBy('date', 'desc'),
            startAfter(lastFetch.current),
            limit(10),
            searchKeywords
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
                date: x.data().date.toMillis(),
              })
            );
            //console.log(data)
            setLogs((prev) => [...prev, ...data]);
          }
        } catch (e) {
          console.log(e instanceof Error ? e.message : 'Error');
        }
        setIsLoading(false);
        setIsRefreshingList(false);
      }
    };
    fetch();
  }, [searchTerms, user, isRefreshingList]);

  const search = () => {
    setLogs([]);
    setSearchTerms(
      searchText
        .toLowerCase()
        .split(' ')
        .filter((x) => x !== '')
    );
    setIsRefreshingList(true);
    fetchesRemaining.current = true;
    lastFetch.current = undefined;
  };
  const removeDream = async(id: string)=>{
    const document = doc(db.current, `users/${user?.uid}/dreams/${id}`)
    try{
      //delete the document from the databse
      await deleteDoc(document);
      //remove the document from the state list, so we don't have to refresh to show it is deleted
      setLogs(prev=>prev.filter(x=>x.id!==id))
    }catch(e){
      Alert.alert('Error', 'there was an issue deleting the dream.')
    }
  }
  const editDream = async(id:string, title: string, date: Date, plot: string ) =>{
    if (user) {
      const dreamRef = doc(
        getFirestore(fb),
        `/users/${user.uid}/dreams/${id}`
      );
      const newKeywords = removeStopwords(
        `${title} ${plot}`
          .toLowerCase()
          .split(' ')
          .filter((x) => x !== '')
      );
      try {
        await updateDoc(dreamRef, {
          date,
          dreamPlot: plot,
          title,
          keywords: newKeywords,
        });
        
        setLogs(prev=>prev.map((dream)=>{
          if(dream.id === id) return {...dream, title, dreamPlot: plot, keywords: newKeywords, date: date.getMilliseconds() }
          return dream
        }))
        Alert.alert('Success', 'Dream has been updated.');
      } catch (e) {
        console.log(e);
        Alert.alert('Error', 'There was an error updating your dream.');
      }
    }
  }
  const test = (id: string)=>{
    setLogs(prev=>prev.map((x)=>{
      if(x.id === id) return {...x, dreamPlot: 'does this update?'}
      return x
    }))
  }
  const refresh = () => {
    fetchesRemaining.current = true;
    lastFetch.current = undefined;
    setLogs([]);
    setIsRefreshingList(true);
  };
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
              setSearchTerms([]);
              Keyboard.dismiss();
              refresh();
            }}
          />
        )}
      </View>
      <FlatList
        onEndReached={() => (callOnScrollEnd.current = true)}
        onMomentumScrollEnd={() => {
          if (callOnScrollEnd.current && fetchesRemaining.current) {
            setIsRefreshingList(true);
          }
          callOnScrollEnd.current = false;
        }}
        onRefresh={() => refresh()}
        refreshing={false}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <View style={{marginBottom: 50}}>
            {isLoading && <ActivityIndicator size="large" />}
          </View>
        }
        data={logs}
        ItemSeparatorComponent={() => <View style={styles.border}></View>}
        renderItem={({item, index}) => (
          <GestureHandlerRootView>
            <Swipeable
              renderRightActions={()=>rightSwipeActions({onPress:()=>removeDream(item.id)})}
              overshootRight={false}
            >
              <View>
                <Pressable
                  onPress={() => navigation.navigate('Dream', {dream: item})}
                  style={styles.box}
                >
                  <View style={styles.dateContainer}>
                    <Text style={styles.date}>
                      {new Intl.DateTimeFormat('en-US', {
                        dateStyle: 'short',
                      }).format(new Date(item.date))}
                    </Text>
                  </View>
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                  </View>
                </Pressable>
              </View>
            </Swipeable>
          </GestureHandlerRootView>
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
    fontSize: 27,
    color: 'black',
  },
  date: {
    fontSize: 22,
    color: 'black',
    alignSelf: 'center',
  },
  dateContainer: {
    width: '34%',
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
  delete: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 25,
    paddingRight: 25,
  },
});

export default DreamList;
