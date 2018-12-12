import React, { Component } from 'react';
import {
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity, View,

} from 'react-native'

const window = Dimensions.get('window');


export default class LeftMenu extends Component {


  constructor(props) {
    super(props);

    this.state = {
      itemSelected: '热点推荐',
    };
    this._onClickItem = this._onClickItem.bind(this);

  }


  render() {


    return (
      <View style={styles.contantStyle}>

        {/*选项菜单*/}
        {this._selectItem('热点推荐')}
        {this._selectItem('小精灵')}
        {this._selectItem('人工客服')}

      </View>
    );
  }

  _selectItem(item) {
    return (
      <TouchableOpacity style={styles.itemTextView} onPress={() => {this._onClickItem(item)}}>

        <Text style={[styles.itemDefaultColor, this.state.itemSelected === item && styles.itemSelectedColor]}  >
          {item}
        </Text>
      </TouchableOpacity>
    )
  }
  
  _onClickItem(itemTextContant) {
    this.setState({
      itemSelected: itemTextContant,
    });
    //传递数据到右边显示组件
    this.props.onItemSelected(itemTextContant);
  }


};


const styles = StyleSheet.create({

  contantStyle: {
    height:'100%',
    backgroundColor: 'white',
  },
  itemTextView: {
    flex:1,
    height: 30,
    width: window.width / 4,
    justifyContent: 'center',
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    marginLeft: 10,
    marginRight: 10,

  },
  item: {
    fontSize: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  itemDefaultColor: {
    color: 'gray',
  },
  itemSelectedColor: {
    color: '#00bfff'
  }
});