import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Dimensions,
  View, TouchableOpacity,
} from 'react-native'

import LeftMenu from './LeftMenu.js';
import CustomerChattingScreen from './CustomerChattingScreen'
import KnowledgeJLScreen from './KnowledgeJLScreen'
import RecommendScreen from './RecommendScreen'
//导入 菜单 组件


const window = Dimensions.get('window');


export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemSelected : '热点推荐',
      showRightContant: '热点推荐',
    };

    // this._onMenuItemSelected = this._onMenuItemSelected.bind(this);
    this._onClickItem = this._onClickItem.bind(this);
  }

  /**
   * 点击工单，调转到人工客服界面
   **/
  jumpWorkOlder(workOlder) {
     console.log("workOlder: " + workOlder);
    this.setState({
      showRightContant: '人工客服',
      itemSelected : '人工客服',
    });
  }

  render() {

    var showView = [];
    if (this.state.showRightContant === '热点推荐') {
      showView.push(
        <RecommendScreen/>
      )
    }

    if (this.state.showRightContant === '小精灵') {
      showView.push(
        <KnowledgeJLScreen workolder={this.jumpWorkOlder.bind(this)}/>
      )
    }

    if (this.state.showRightContant === '人工客服') {
      showView.push(
        <CustomerChattingScreen/>
      )
    }

    return (
      <View style={styles.flex}>

        {/*内容*/}
        <View style={styles.container}>

          {/*右侧显示内容*/}
          {showView}
          {/*左侧选择栏*/}
          <View style={styles.leftMenuStyle}>
            <View style={styles.contantStyle}>

              {/*选项菜单*/}
              {this._selectItem('热点推荐')}
              {this._selectItem('小精灵')}
              {this._selectItem('人工客服')}

            </View>
          </View>
        </View>

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
      showRightContant: itemTextContant,
    });
  }

  // _onMenuItemSelected(leftContant) {
  //   this.setState({
  //     showRightContant: leftContant,
  //   });
  //
  // }
}

const styles = StyleSheet.create({

  flex: {
    flex: 1,
  },
  flexDirection: {
    flexDirection: 'row',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftMenuStyle: {

    borderRightColor: 'grey',
    borderRightWidth: 1,
  },
  rightContantSyle: {
    flex: 1,

  },

  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    flexDirection: 'row-reverse', // 主轴水平方向，起点在右
  },

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