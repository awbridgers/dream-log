import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Log, RootStackParamsList} from '../types';
import {View, StyleSheet, Text, ScrollView} from 'react-native';

type Nav = NativeStackScreenProps<RootStackParamsList, 'Dream'>;

const Dream = ({route, navigation}: Nav) => {
  const {dream} = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {dream.title}
      </Text>
      <ScrollView style = {styles.scroll} contentContainerStyle={{paddingBottom: 50}} >
        <Text style = {styles.plot}>
          {dream.dreamPlot}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 20,
    marginRight: 20,
    flex:1
  },
  title: {
    color: 'white',
    alignSelf: 'center',
    fontSize: 30,
    margin: 20
  },
  plot:{
    color: 'white',
    fontSize: 20,
    // paddingBottom: 200

  },
  scroll:{
    
  }
});

export default Dream;
