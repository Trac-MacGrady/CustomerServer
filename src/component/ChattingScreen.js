import React, {Component} from 'react';
import CommonTitleBar from '../views/CommonTitleBar';
import Global from '../utils/Global';
import Utils from '../utils/Utils';
import TimeUtils from '../utils/TimeUtil';
import TimeUtil from '../utils/TimeUtil';
import ChatBottomBar from '../views/ChatBottomBar';
import EmojiView from '../views/EmojiView';
import MoreView from '../views/MoreView';
import LoadingView from '../views/LoadingView';
import StorageUtil from '../utils/StorageUtil';
import CountEmitter from '../event/CountEmitter';
import ConversationUtil from '../utils/ConversationUtil';

import {
  Dimensions,
  FlatList,
  Image,
  PixelRatio,
  StyleSheet,
  Text,
  View,
  ToastAndroid,
  DeviceEventEmitter, TouchableOpacity, TextInput, Button
} from 'react-native'
import NativeDealMessage from '../native/NativeDealMessage'
import NativeCustomerServerSet from '../native/NativeCustomerServerSet'
import ZoomImage from '../widget/ZoomImage'
import EmotionsView from '../widget/moji/EmotionsView'
import { EMOTIONS_DATA, EMOTIONS_ZHCN, invertKeyValues } from '../widget/moji/DataSource'

const {width} = Dimensions.get('window');
const MSG_LINE_MAX_COUNT = 15;
const BAR_STATE_SHOW_KEYBOARD = 1;
const BAR_STATE_SHOW_RECORDER = 2;
let emojiReg = new RegExp('\\[[^\\]]+\\]','g'); //表情符号正则表达式

export default class ChattingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showEmojiView: false,
      showMoreView: false,
      showProgress: false,
      isSessionStarted: false,
      conversation: null,
      isLoginServer:'',
      messagessss: [],
      tempSendTxtArray:[],
      cursorIndex:0,
      barState: BAR_STATE_SHOW_KEYBOARD,
      inputMsg: ''
    };

    ConversationUtil.getConversations("hongwang", (data) => {
      console.log(JSON.stringify(data));
      if (data != null && data.length !==0) {
        this.setState({conversation: data, messagessss: data[0].messages});
        console.log(this.state.messagessss);
      }
    })
  }

  componentWillMount() {

    CountEmitter.addListener('notifyChattingRefresh', () => {
      // 刷新消息
      ConversationUtil.getConversations("hongwang", (data) => {
        if (data != null) {
          this.setState({conversation: data, messagessss: data.messagessss}, ()=>{
            console.log('result: ' + JSON.stringify(data).toString());
            this.scroll();
          });
        }
      });

    });

    this.createAccount();
    this.receiveTextMessage();
    this.receiveImageMessage();
  }



  /**
   * 设置账号，注册
   * @returns {Promise<void>}
   */
  createAccount = async () => {
    let login = await NativeCustomerServerSet.setCustomerAccout("hongwang", "123456");
    console.log("isLogin: " + login.isLogin);
    this.setState({isLoginServer:login.isLogin});
    if (this.state.isLoginServer === "true"){
      StorageUtil.set('hasLogin', {'hasLogin': true});
      StorageUtil.set('username', {'username': "hongwang"});
      StorageUtil.set('password', {'password': "123456"});
    }
  };

  receiveTextMessage = () => {
    DeviceEventEmitter.addListener('receiveTextMessage', (e) => {
      console.log("receiveTextMessage: " + e.textMessage + "======" + e.messageId);
      if (Utils.isEmpty(e)) {
        return;
      }
      
      let message  = e.textMessage;
      let meesageId  = e.messageId;

      this.concatMessage({
        'conversationId':ConversationUtil.generateConversationId("hongwang", "hongwang"),
        'id': meesageId,
        'receiveMessage': message,
        'sendMessage': "",
        'messageTime': TimeUtil.currentTime(),
        'messageState': "receive",
        'messageType': 'txt'
      })
    });
  }

  receiveImageMessage = () => {
    DeviceEventEmitter.addListener('receiveImageMessage', (e) => {
      console.log("receiveImageMessage: " + e);
      if (Utils.isEmpty(e)) {
        return;
      }

      let message  = e.imageMessage;
      let meesageId  = e.messageId;
      let imageWidth = e.imageWidth;
      let imageHeight = e.imageHeight;


      this.concatMessage({
        'conversationId':ConversationUtil.generateConversationId("hongwang", "hongwang"),
        'id': meesageId,
        'receiveMessage': message,
        'sendMessage': "",
        'messageTime': TimeUtil.currentTime(),
        'messageState': "receive",
        'attribute':{imageWidth: imageWidth, imageHeight: imageHeight},
        'messageType': 'image'
      })
    });
  }

  handleSendBtnClick = (msg) => {

    console.log("msg: " + msg);
    this.setState({
      tempSendTxtArray:[],
    });

    let finalMsg = '';
    if (this.state.inputMsg !== '' && this.state.inputMsg.length > 0) {
      this._matchContentString(this.state.inputMsg);
      console.log("this.state.tempSendTxtArray: " + this.state.tempSendTxtArray.toString());
      console.log("this.state.tempSendTxtArray.length: " + this.state.tempSendTxtArray.length);
      for (let i = 0; i < this.state.tempSendTxtArray.length; i++){
        finalMsg += this.state.tempSendTxtArray[i];
      }

      this._onInputChangeText('');
      this.sendTextMessage(finalMsg);
    }


    // this.sendTextMessage(msg);
    // this.setState({inputMsg: ''});
  }

  sendTextMessage = async (msg) =>{ // 发送文本消息
    let sendMessage = await NativeDealMessage.sendTextMessage(msg);
    console.log("isLogin: " + sendMessage.sendMessages);
    // 还需要将本条消息添加到当前会话中
    this.concatMessage({
      'conversationId':ConversationUtil.generateConversationId("hongwang", "hongwang"),
      'id': sendMessage.sendMessages,
      'receiveMessage': "",
      'sendMessage': msg,
      'messageTime': TimeUtil.currentTime(),
      'messageState': "send",
      'messageType': 'txt'
    })
  }

  sendImageMessage = async (image) => { // 发送图片消息
    let imagePath = image.path;
    let imageWidth = image.width;
    let imageHeight = image.height;
    console.log("imagePath: " + imagePath);
    let sendMessage = await NativeDealMessage.sendImageMessage(imagePath);
    console.log("isLogin: " + sendMessage.sendMessages);

    // 还需要将本条消息添加到当前会话中
    this.concatMessage({
      'conversationId':ConversationUtil.generateConversationId("hongwang", "hongwang"),
      'id': sendMessage.sendMessages,
      'receiveMessage': "",
      'sendMessage': imagePath,
      'messageTime': TimeUtil.currentTime(),
      'messageState': "send",
      'attribute':{imageWidth: imageWidth, imageHeight: imageHeight},
      'messageType': 'image'
    })
  }
  
  scroll() {
    this.scrollTimeout = setTimeout(() => this.refs.flatList.scrollToEnd(), 0);
  }

  concatMessage(message) {
    ConversationUtil.addMessage(message, () => {
      // 发送完消息，还要通知会话列表更新
      CountEmitter.emit('notifyConversationListRefresh');
    });
    let msgs = this.state.messagessss;
    msgs.push(message);
    console.log(msgs);
    console.log("msgs result: " + JSON.stringify(msgs));
    this.setState({messagessss: msgs}, ()=>{
      this.scroll();
    });
  }

  componentWillUnmount() {
    this.scrollTimeout && clearTimeout(this.scrollTimeout);
    CountEmitter.removeListener('notifyChattingRefresh', ()=>{});
    // 通知会话列表刷新未读数
    if (this.conversationId) {
      ConversationUtil.clearUnreadCount(this.conversationId, ()=>{
        CountEmitter.emit('notifyConversationListRefresh');
      })
    }
  }

  _matchContentString(textContent){

    console.log("textContext: " + textContent);
    // 匹配得到index并放入数组中
    let currentTextLength = textContent.length;

    let emojiIndex = textContent.search(emojiReg);

    let checkIndexArray = [];
    console.log("emojiIndex: " + emojiIndex);
    // 若匹配不到，则直接返回一个全文本
    if (emojiIndex === -1) {

      this.state.tempSendTxtArray.push(textContent.substring(0,currentTextLength));

    } else {

      if (emojiIndex !== -1) {
        checkIndexArray.push(emojiIndex);
      }

      // 取index最小者
      console.log("111111111111111111111111");
      let minIndex = Math.min(...checkIndexArray);
      console.log("2222222222222222222222222");
      console.log("minIndex: " + minIndex);
      // 将0-index部分返回文本
      this.state.tempSendTxtArray.push(textContent.substring(0, minIndex));

      // 将index部分作分别处理
      this._matchEmojiString(textContent.substring(minIndex));
    }
  }

  _matchEmojiString(emojiStr) {
    console.log("emojiStr: " + emojiStr);
    let castStr = emojiStr.match(emojiReg);
    console.log("castStr: " + castStr.toString());
    let emojiLength = castStr[0].length;

    let emotoins_code = invertKeyValues(EMOTIONS_ZHCN);
    console.log("castStr[0]: " + castStr[0]);
    this.state.tempSendTxtArray.push(emotoins_code[castStr[0]]);
    console.log("emotoins_code[castStr[0]: " + emotoins_code[castStr[0]]);
    this._matchContentString(emojiStr.substring(emojiLength));

  }

  updateView = (emoji, more) => {
    this.setState({
      showEmojiView: emoji,
      showMoreView: more,
    })
  }

  _keyExtractor = (item, index) => index

  shouldShowTime(item) { // 该方法判断当前消息是否需要显示时间
    let index = item.index;
    if (index === 0) {
      // 第一条消息，显示时间
      return true;
    }
    if (index > 0) {
      let messages = this.state.messagessss;
      if (!Utils.isEmpty(messages) && messages.length > 0) {
        let preMsg = messages[index - 1];
        let delta = item.item.time - preMsg.time;
        if (delta > 3 * 60) {
          return true;
        }
      }
      return false;
    }
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

  _matchContentMessageString(Views, textContent){

    // 匹配得到index并放入数组中
    let emojiIndex = textContent.search(emojiReg);

    let checkIndexArray = [];
    console.log("textContent: " + textContent) ;
    // 若匹配不到，则直接返回一个全文本
    if (emojiIndex === -1) {
      console.log("emojiIndex === -1") ;
      Views.push(<Text key ={'emptyTextView'+(Math.random()*100)}>{textContent}</Text>);

    } else {
      console.log("emojiIndex !== -1") ;
      if (emojiIndex !== -1) {
        checkIndexArray.push(emojiIndex);
      }

      // 取index最小者
      let minIndex = Math.min(...checkIndexArray);

      // 将0-index部分返回文本
      Views.push(<Text key ={'firstTextView'+(Math.random()*100)}>{textContent.substring(0, minIndex)}</Text>);

      // 将index部分作分别处理
      this._matchEmojiMessageString(Views, textContent.substring(minIndex));
    }
  }

  _matchEmojiMessageString(Views, emojiStr) {

    let castStr = emojiStr.match(emojiReg);
    let emojiLength = castStr[0].length;

    let emojiImg=EMOTIONS_DATA[castStr[0]];

    if(emojiImg){
       Views.push(<Image key={emojiStr} style={styles.subEmojiStyle} resizeMethod={'auto'} source={emojiImg}/>);
    }
    this._matchContentString(emojiStr.substring(emojiLength));

  }

  _onSelectionChange(event){

    this.setState({
      cursorIndex:event.nativeEvent.selection.start,
    });
  }

  _onInputChangeText(text){

    //设值
    this.setState({
      inputMsg:text,
    });

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
              sendImageMessage={this.sendImageMessage.bind(this)}
            />
          </View>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <CommonTitleBar title={this.chatUsername} nav={this.props.navigation}/>
        {
          this.state.showProgress ? (
            <LoadingView cancel={() => this.setState({showProgress: false})}/>
          ) : (null)
        }
        <View style={styles.content}>
          <FlatList
            ref="flatList"
            data={this.state.messagessss}
            renderItem={this.renderItem}
            keyExtractor={this._keyExtractor}
            extraData={this.state}
          />
        </View>
        <View style={styles.divider}/>
        <View style={styles.bottomBar}>
          {/*<ChatBottomBar updateView={this.updateView} handleSendBtnClick={this.handleSendBtnClick}/>*/}
          {this.state.barState === BAR_STATE_SHOW_KEYBOARD ?
          <View style={styles.bottomView}>
            <TouchableOpacity activeOpacity={0.5} onPress={this.handlePress.bind(this, "soundBtn")}>
              <Image style={styles.icon} source={require('../../images/ic_chat_sound.png')}/>
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
            <TouchableOpacity activeOpacity={0.5} onPress={this.handlePress.bind(this, "emojiBtn")}>
              <Image style={styles.icon} source={require('../../images/ic_chat_emoji.png')}/>
            </TouchableOpacity>
            {
              Utils.isEmpty(this.state.inputMsg) ? (
                <TouchableOpacity activeOpacity={0.5} onPress={this.handlePress.bind(this, "moreBtn")}>
                  <Image style={[styles.icon, {marginLeft: 10}]} source={require('../../images/ic_chat_add.png')}/>
                </TouchableOpacity>
              ) : (
                <View style={{marginLeft: 10}}>
                  <Button color={'#49BC1C'} title={"发送"} onPress={() => this.handleSendBtnClick(this.state.inputMsg)}/>
                </View>
              )
            }
          </View>
            : <View style={styles.bottomView}>
              <TouchableOpacity activeOpacity={0.5} onPress={this.handlePress.bind(this, "soundBtn")}>
                <Image style={styles.icon} source={require('../../images/ic_chat_keyboard.png')}/>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} style={{flex: 1}}>
                <View style={styles.recorder}><Text>按住 说话</Text></View>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} onPress={this.handlePress.bind(this, "emojiBtn")}>
                <Image style={styles.icon} source={require('../../images/ic_chat_emoji.png')}/>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.5} onPress={this.handlePress.bind(this, "moreBtn")}>
                <Image style={[styles.icon, {marginLeft: 10}]} source={require('../../images/ic_chat_add.png')}/>
              </TouchableOpacity>
            </View>}
        </View>
        {moreView}
      </View>
    );
  }

  handlePress = (tag) => {
    if ("soundBtn" == tag) {
      if (this.state.barState === BAR_STATE_SHOW_KEYBOARD) {
        this.setState({
          barState: BAR_STATE_SHOW_RECORDER,
          showEmojiView: false,
          showMoreView: false,
        });
      } else if (this.state.barState === BAR_STATE_SHOW_RECORDER) {
        this.setState({
          barState: BAR_STATE_SHOW_KEYBOARD,
          showEmojiView: false,
          showMoreView: false,
        });
      }
      this.updateView(false, false);
    } else if ("emojiBtn" == tag) {
      var showEmojiView = this.state.showEmojiView;
      this.updateView(!showEmojiView, false);
      this.setState({
        showEmojiView: !showEmojiView,
        showMoreView: false,
      })
    } else if ("moreBtn" == tag) {
      var showMoreView = this.state.showMoreView;
      var showEmojiView = this.state.showEmojiView;
      this.updateView(false, !showMoreView);
      this.setState({
        showEmojiView: false,
        showMoreView: !showMoreView
      });
    }
  }

  renderItem = (item) => {
    let msgType = item.item.messageType;
    if (msgType === 'txt') {
      // 文本消息
      if (item.item.messageState ==="receive") {
        return this.renderReceivedTextMsg(item);
      } else {
        return this.renderSendTextMsg(item);
      }
    } else if (msgType === 'image') {
      // 图片消息
      if (item.item.messageState === "receive") {
        return this.renderReceivedImgMsg(item);
      } else {
        return this.renderSendImgMsg(item);
      }
    }
  }

  renderReceivedTextMsg(item) { // 接收的文本消息
    let contactAvatar = require('../../images/avatar.png');
    let Views = []
    this._matchContentMessageString(Views, item.item.receiveMessage)
    // if (!Utils.isEmpty(this.chatWithAvatar)) {
    //   contactAvatar = this.chatWithAvatar;
    // }
    return (
      <View style={{flexDirection: 'column', alignItems: 'center'}}>
        {
          this.shouldShowTime(item) ? (
            <Text style={listItemStyle.time}>{TimeUtils.formatChatTime(parseInt(item.item.messageTime))}</Text>
          ) : (null)
        }
        <View style={listItemStyle.container}>
          <Image style={listItemStyle.avatar} source={contactAvatar}/>
          <View style={listItemStyle.msgContainer}>
            <View style={styles.mojicontainer}>
              {Views}
            </View>
          </View>
        </View>
      </View>
    );
  }

  renderSendTextMsg(item) { // 发送出去的文本消息
    let avatar = require('../../images/avatar.png');
    let Views = []
    this._matchContentMessageString(Views, item.item.sendMessage)
    // if (!Utils.isEmpty(this.state.userInfo.avatar)) {
    //   avatar = {uri: this.state.userInfo.avatar};
    // }
    // 发送出去的消息
    return (
      <View style={{flexDirection: 'column', alignItems: 'center'}}>
        {
          this.shouldShowTime(item) ? (
            <Text style={listItemStyle.time}>{TimeUtils.formatChatTime(parseInt(item.item.messageTime))}</Text>
          ) : (null)
        }
        <View style={listItemStyle.containerSend}>
          <View style={listItemStyle.msgContainerSend}>
            <View style={styles.mojicontainer}>
              {Views}
            </View>
          </View>
          <Image style={listItemStyle.avatar} source={avatar}/>
        </View>
      </View>
    );
  }

  renderReceivedImgMsg(item) { // 接收的图片消息
    let contactAvatar = require('../../images/avatar.png');
    // if (!Utils.isEmpty(this.chatWithAvatar)) {
    //   contactAvatar = this.chatWithAvatar;
    // }
    return (
      <View style={{flexDirection: 'column', alignItems: 'center'}}>
        {
          this.shouldShowTime(item) ? (
            <Text style={listItemStyle.time}>{TimeUtils.formatChatTime(parseInt(item.item.messageTime))}</Text>
          ) : (null)
        }
        <View style={listItemStyle.container}>
          <Image style={listItemStyle.avatar} source={contactAvatar}/>
          <View style={[listItemStyle.msgContainer, {paddingLeft: 0, paddingRight: 0}]}>
            <ZoomImage
              source={{uri: item.item.receiveMessage}}
              style={{borderRadius: 3}}
              imgStyle={{width: 150, height: 150  * (item.item.attribute.imageHeight / item.item.attribute.imageWidth)}}
              enableScaling={true}
            />
          </View>
        </View>
      </View>
    );
  }

  renderSendImgMsg(item) { // 发送的图片消息
    let avatar = require('../../images/avatar.png');
    // if (!Utils.isEmpty(this.state.userInfo.avatar)) {
    //   avatar = {uri: this.state.userInfo.avatar};
    // }
    // 发送出去的消息
    return (
      <View style={{flexDirection: 'column', alignItems: 'center'}}>
        {
          this.shouldShowTime(item) ? (
            <Text style={listItemStyle.time}>{TimeUtils.formatChatTime(parseInt(item.item.messageTime))}</Text>
          ) : (null)
        }
        <View style={listItemStyle.containerSend}>
          <View style={[listItemStyle.msgContainerSend, {paddingLeft: 0, paddingRight: 0}]}>
            <ZoomImage
              source={{uri: item.item.sendMessage}}
              style={{borderRadius: 3}}
              imgStyle={{width: 150, height: 150  * (item.item.attribute.imageHeight / item.item.attribute.imageWidth)}}
              enableScaling={true}
            />
          </View>
          <Image style={listItemStyle.avatar} source={avatar}/>
        </View>
      </View>
    );
  }

}


const listItemStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    flexDirection: 'row',
    padding: 5,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  msgContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    paddingLeft: 8,
    paddingRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  msgContainerSend: {
    backgroundColor: '#9FE658',
    borderRadius: 3,
    paddingLeft: 8,
    paddingRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 24,
  },
  containerSend: {
    flex: 1,
    width: width,
    flexDirection: 'row',
    padding: 5,
    justifyContent: 'flex-end',
  },
  time: {
    backgroundColor: '#D4D4D4',
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 5,
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 11,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: Global.pageBackgroundColor
  },
  bottomBar: {
    height: 50,
  },
  divider: {
    width: width,
    height: 1 / PixelRatio.get(),
    backgroundColor: Global.dividerColor,
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
  bottomView:{
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

  mojicontainer: {
    flexDirection:'row',
    alignItems:'center',
    flexWrap:'wrap',
  },

  subEmojiStyle:{
    width:25,
    height:25,
  }
});
