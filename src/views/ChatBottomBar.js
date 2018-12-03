import React, {Component} from 'react';
import Utils from '../utils/Utils';

import {
    Button, Dimensions,
    Image, KeyboardAvoidingView,
    PixelRatio,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity, TouchableWithoutFeedback,
    View,
} from 'react-native';
import Global from "../utils/Global";
import EmotionsView from "../widget/moji/EmotionsView";
import {EMOTIONS_ZHCN} from "../widget/moji/DataSource";
import MoreView from "./MoreView";
const {width} = Dimensions.get('window');
let emojiReg = new RegExp('\\[[^\\]]+\\]','g'); //表情符号正则表达式

export default class ChatBottomBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEmojiView: false,
      showMoreView: false,
      inputMsg: ''
    };
  }

  render() {

      var moreView = [];
      if (this.state.showEmojiView) {
          moreView.push(
              <View key={"emoji-view-key"}>
                  <View style={{width: width, height: 1 / PixelRatio.get(), backgroundColor: Global.dividerColor}}/>
                  <View style={{height: Global.emojiViewHeight}}>
                      <EmotionsView onSelected={(code) => this._onEmojiSelected(code)}/>
                  </View>
              </View>
          );
      }
      if (this.state.showMoreView) {
          moreView.push(
              <View key={"more-view-key"}>
                  <View style={{width: width, height: 1 / PixelRatio.get(), backgroundColor: Global.dividerColor}}/>
                  <View style={{height: Global.emojiViewHeight}}>
                      <MoreView
                          sendImageMessage={this.props.sendImageMessage}
                      />
                  </View>
              </View>
          );
      }

      return (

          <View style={styles.inputContainer}>

              <View style={styles.textContainer}>
                  <TouchableOpacity activeOpacity={0.5} onPress={this.handlePress.bind(this, "emojiBtn")}>
                      <Image style={styles.icon} source={require('../../images/ic_chat_emoji.png')}/>
                  </TouchableOpacity>
                  <TextInput
                      ref="textInput"
                      style={styles.input}
                      underlineColorAndroid="transparent"
                      multiline = {true}
                      autoFocus={true}
                      editable={true}
                      placeholder={'说点什么'}
                      placeholderTextColor={'#bababf'}
                      onSelectionChange={(event) => this._onSelectionChange(event)}
                      onChangeText={(text) => this._onInputChangeText(text)}
                      defaultValue={this.state.inputMsg}/>

                  {
                      Utils.isEmpty(this.state.inputMsg) ? (
                          <TouchableOpacity activeOpacity={0.5} onPress={this.handlePress.bind(this, "moreBtn")}>
                              <Image style={[styles.icon, {marginLeft: 10}]} source={require('../../images/ic_chat_add.png')}/>
                          </TouchableOpacity>
                      ) : (
                          <View style={{marginLeft: 10}}>
                              <Button color={'#49BC1C'} title={"发送"} onPress={() => this.sendMsg()}/>
                          </View>
                      )
                  }
              </View>
              {/*<Line lineColor={'#bababf'}/>*/}

              {
                 moreView
              }
          </View>
                );
  }

    _onEmojiSelected(code){

        if (code === '' ){
            return;
        }

        console.log("code: " + code);
        let lastText = '';
        let currentTextLength = this.state.inputMsg.length;

        if (code === '/{del'){ //删除键

            if (currentTextLength === 0){
                return;
            }

            if (this.state.cursorIndex < currentTextLength){ //光标在字符串中间

                let emojiReg = new RegExp('\\[[^\\]]+\\]'); //表情符号正则表达式

                let emojiIndex = this.state.inputMsg.search(emojiReg); //匹配到的第一个表情符位置

                if (emojiIndex === -1){ //没有匹配到表情符
                    let preStr = this.state.inputMsg.substring(0,this.state.cursorIndex);
                    let nextStr = this.state.inputMsg.substring(this.state.cursorIndex);
                    lastText = preStr.substring(0,preStr.length - 1) + nextStr;

                    this.setState({
                        cursorIndex:preStr.length - 1,
                    });
                }
                else {

                    let preStr = this.state.inputMsg.substring(0,this.state.cursorIndex);
                    let nextStr = this.state.inputMsg.substring(this.state.cursorIndex);

                    let lastChar = preStr.charAt(preStr.length - 1);
                    if (lastChar === ']'){

                        let castArray = preStr.match(emojiReg);

                        if(!castArray){
                            let cast = castArray[castArray.length - 1];

                            lastText = preStr.substring(0,preStr.length - cast.length) + nextStr;

                            this.setState({
                                cursorIndex:preStr.length - cast.length,
                            });
                        }
                        else{
                            lastText = preStr.substring(0,preStr.length - 1) + nextStr;

                            this.setState({
                                cursorIndex:preStr.length - 1,
                            });
                        }

                    } else {

                        lastText = preStr.substring(0,preStr.length - 1) + nextStr;
                        this.setState({
                            cursorIndex:preStr.length - 1,
                        });
                    }
                }

            }
            else {  //光标在字符串最后

                let lastChar = this.state.inputMsg.charAt(currentTextLength - 1);
                if (lastChar === ']'){
                    let castArray = this.state.inputMsg.match(emojiReg);

                    if(castArray){
                        let cast = castArray[castArray.length - 1];
                        lastText = this.state.inputMsg.substring(0,this.state.inputMsg.length - cast.length);

                        this.setState({
                            cursorIndex:this.state.inputMsg.length - cast.length,
                        });
                    }
                    else{
                        lastText = this.state.inputMsg.substring(0,this.state.inputMsg.length - 1);

                        this.setState({
                            cursorIndex:this.state.inputMsg.length - 1,
                        });
                    }

                }
                else {

                    lastText = this.state.inputMsg.substring(0,currentTextLength - 1);
                    this.setState({
                        cursorIndex:currentTextLength - 1,
                    });
                }
            }


        }
        else {

            if (this.state.cursorIndex >= currentTextLength) {
                lastText = this.state.inputMsg + EMOTIONS_ZHCN[code];

                this.setState({
                    cursorIndex:lastText.length
                });

            }
            else {
                let preTemp = this.state.inputMsg.substring(0,this.state.cursorIndex);
                let nextTemp = this.state.inputMsg.substring(this.state.cursorIndex,currentTextLength);
                lastText = preTemp + EMOTIONS_ZHCN[code] + nextTemp;

                this.setState({
                    cursorIndex:this.state.cursorIndex + EMOTIONS_ZHCN[code].length
                });
            }
        }

        this.setState({
            inputMsg:lastText,
        });
        this._onInputChangeText(lastText);

    }

    _onInputChangeText(text){

        //设值
        this.setState({
            inputMsg:text,
        });

    }

    _onSelectionChange(event){

        this.setState({
            cursorIndex:event.nativeEvent.selection.start,
        });
    }

  sendMsg() {
    let onSendBtnClickListener = this.props.handleSendBtnClick;
    if (!Utils.isEmpty(onSendBtnClickListener)) {
      onSendBtnClickListener(this.state.inputMsg);
    }
    this.setState({inputMsg: ''});
  }

    // sendImageMessage() {
    //     this.props.handleSendBtnClick
    // }

  handlePress = (tag) => {
   if ("emojiBtn" === tag) {
      var showEmojiView = this.state.showEmojiView;
      this.props.updateView(!showEmojiView, false);
      this.setState({
        showEmojiView: !showEmojiView,
        showMoreView: false,
      })
    } else if ("moreBtn" === tag) {
      var showMoreView = this.state.showMoreView;
      var showEmojiView = this.state.showEmojiView;
      this.props.updateView(false, !showMoreView);
      this.setState({
        showEmojiView: false,
        showMoreView: !showMoreView
      });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    paddingLeft: 10,
    paddingRight: 10,
  },
  input: {
    flex: 1,
  },
  icon: {
    width: 40,
    height: 40,
    padding: 5,
  },
  recorder: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1 / PixelRatio.get(),
    borderColor: '#6E7377',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

    inputContainer: {
        width:'100%',
        position:'absolute',
        bottom:0,

    },

    textContainer: {
        width:'100%',
        height:48,
        flexDirection:'row',
        backgroundColor: '#F4F4F4',
        alignItems:'center',
    },
});
