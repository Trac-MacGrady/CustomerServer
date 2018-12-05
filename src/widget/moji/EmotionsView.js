/**
 * Desc: 表情选择view
 *
 * Created by WangGanxin on 2018/1/31
 * Email: mail@wangganxin.me
 */

import React, {Component,PureComponent} from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

import PropTypes from 'prop-types';
import {IndicatorViewPager, PagerDotIndicator} from 'rn-viewpager';
import EmotionsChildView from './EmotionsChildView';
import {EMOTIONS_DATA} from './DataSource';

export default class EmotionsView extends PureComponent {

  constructor(props){
    super(props);

    this.state = ({

    });
  }

  _objToStrMap(obj) {
    let strMap = new Map();
    for (let key of Object.keys(obj)) {
      strMap.set(key, obj[key]);
    }
    return strMap;
  }

  _renderDotIndicator() {
    return <PagerDotIndicator pageCount={2} dotStyle={styles.dotStyle} selectedDotStyle={styles.selectedDotStyle}/>;
  }

  _renderPagerView(){
    let viewItems = [];
    let dataMaps = this._objToStrMap(EMOTIONS_DATA);
    let dataKeys = [];

    //抽取代表符
    let index = 0;
    for (let data of dataMaps.keys()) {
      dataKeys.push({
        key:index,
        value:data,
      });
      index++;
    }

    //分页
    let page0 = dataKeys.slice(0,20);
    let page1 = dataKeys.slice(20,40);

    //添加删除键
    page0.push({
      key:100,
      value:'/{del'
    });
    page1.push({
      key:101,
      value:'/{del'
    });

    viewItems.push(<View key={0}><EmotionsChildView key={0} dataSource={page0} onPress={(code) => this.props.onSelected(code)}/></View>);
    viewItems.push(<View key={1}><EmotionsChildView key={1} dataSource={page1} onPress={(code) => this.props.onSelected(code)}/></View>);
    return viewItems;
  }

  render() {
    return (
      <IndicatorViewPager
        style={styles.wrapper}
        indicator={this._renderDotIndicator()}>
        { this._renderPagerView() }
      </IndicatorViewPager>
    );
  }

}

EmotionsView.propTypes = {
  onSelected:PropTypes.func,
};

const styles = StyleSheet.create({

  wrapper: {
    width:'100%',
    height:200,
    paddingTop:10,
    backgroundColor:'white'
  },

  dotStyle:{
    backgroundColor:'#f5f5f5',
  },

  selectedDotStyle:{
    backgroundColor:'#BBBBBB',
  },

});
