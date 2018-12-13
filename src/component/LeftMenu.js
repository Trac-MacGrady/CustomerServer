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
      <View style={{justifyContent:'center', flex:1}}>
        <TouchableOpacity style={styles.itemTextView} onPress={() => {this._onClickItem(item)}}>
          <Text style={[styles.leftText , this.state.itemSelected === item && styles.itemSelectedColor]}  >
            {item}
          </Text>
        </TouchableOpacity>
      </View>

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
    width: window.width / 4,
    justifyContent: 'center',
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
    backgroundColor: '#00bfff',
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 3,
    color: '#000000',
    textAlign:'center', // 文字居中
    fontSize: 15,
  },

  leftText: {
    backgroundColor: '#D4D4D4',
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 3,
    color: '#000000',
    // marginTop: 10,
    textAlign:'center', // 文字居中
    fontSize: 15,
  },
});