import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Dimensions,
  View,
} from 'react-native';

import LeftMenu from './LeftMenu.js';
import ChattingScreen from './ChattingScreen'
import KnowledgeJL from './KnowledgeJL'
import Recommend from './Recommend'
//导入 菜单 组件


const window = Dimensions.get('window');


export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItem: '热点推荐',
      showRightContant: '热点推荐',
    };


    this._onMenuItemSelected = this._onMenuItemSelected.bind(this);


  }

  render() {

    var showView = [];
    if (this.state.showRightContant === '热点推荐') {
      showView.push(
        <Recommend/>
      )
    }

    if (this.state.showRightContant === '小精灵') {
      showView.push(
        <KnowledgeJL/>
      )
    }

    if (this.state.showRightContant === '人工客服') {
      showView.push(
        <ChattingScreen/>
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
            <LeftMenu onItemSelected={this._onMenuItemSelected} />
          </View>
        </View>

      </View>
    );
  }

  _onMenuItemSelected(leftContant) {
    this.setState({
      showRightContant: leftContant,
    });

  }
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

});