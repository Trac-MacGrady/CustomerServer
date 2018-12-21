import React, { Component } from 'react';
import {
  StyleSheet,
  Dimensions,
  View, WebView,

} from 'react-native'

const window = Dimensions.get('window');


export default class RecommendScreen extends Component {


  constructor(props) {
    super(props);
  }


  render() {
    return (
      <View style={styles.contantStyle}>
        <WebView
          source={{uri:'http://www.baidu.com'}}
          style={{width:'100%',height:'100%'}}
        />

      </View>
    );
  }
};


const styles = StyleSheet.create({

  contantStyle: {
    flex:1,
    backgroundColor: 'white',
  },
});