import React, {Component} from 'react';
import Global from '../utils/Global';
import Utils from '../utils/Utils';
import TimeUtils from '../utils/TimeUtil';
import TimeUtil from '../utils/TimeUtil';
import ChatBottomBar from '../views/ChatBottomBar';
import StorageUtil from '../utils/StorageUtil';
import ConversationUtil from '../utils/ConversationUtil';

import {
  Dimensions,
  FlatList,
  Image,
  PixelRatio,
  StyleSheet,
  Text,
  View,
  DeviceEventEmitter,
  BackHandler
} from 'react-native'
import NativeDealMessage from '../native/NativeDealMessage'
import NativeCustomerServerSet from '../native/NativeCustomerServerSet'
import ZoomImage from '../widget/ZoomImage'
import { EMOTIONS_DATA, EMOTIONS_ZHCN, invertKeyValues } from '../widget/moji/DataSource'
import {Actions} from 'react-native-router-flux';

const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');
let emojiReg = new RegExp('\\[[^\\]]+\\]','g'); //表情符号正则表达式

export default class ChattingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      conversation: null,
      isLoginServer:'',
      messagessss: [],
      tempSendTxtArray:[],
      cursorIndex:0,
    };

    // 初始化聊天记录
    ConversationUtil.getConversations("hongwang", (data) => {
      console.log(JSON.stringify(data));
      if (data != null && data.length !==0) {
        this.setState({conversation: data, messagessss: data[0].messages}, ()=>{
          this.scrollTimeout = setTimeout(() => this.refs.flatList.scrollToEnd(), 1000);
        });
        console.log(this.state.messagessss);
      }
    })
  }

  componentWillMount() {
    this.createAccount();
    this.receiveTextMessage();
    this.receiveImageMessage();
  }

  componentDidMount() {
    //获取通道信息
    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBack) ;
    DeviceEventEmitter.addListener('onResume', (e) => {
      this.scroll();
    })
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
      console.log("receiveImageMessage: " + e.imageWidth + "-------" + e.imageHeight);
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

  /**
   * 发送文字及表情消息
   * @param msg
   */
  handleSendBtnClick = (msg) => {
    console.log("msg: " + msg);
    this.setState({
      tempSendTxtArray:[],
    });

    this.state.tempSendTxtArray = [];
      console.log("tempSendTxtArray: " + this.state.tempSendTxtArray.toString());
    let finalMsg = '';
    if (msg !== '' && msg.length > 0) {
      this._matchContentString(msg);
      console.log("this.state.tempSendTxtArray: " + this.state.tempSendTxtArray.toString());
      console.log("this.state.tempSendTxtArray.length: " + this.state.tempSendTxtArray.length);
      for (let i = 0; i < this.state.tempSendTxtArray.length; i++){
        finalMsg += this.state.tempSendTxtArray[i];
      }

      this.sendTextMessage(finalMsg);
    }

    // 消息发送后状态置空
    this.setState({
        tempSendTxtArray:[],
    });
    this.state.tempSendTxtArray = [];
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

  /**
   * 发送图片消息
   * @param image
   * @returns {Promise<void>}
   */
  sendImageMessage = async (image) => { // 发送图片消息
    let imagePath = image.path;
    let imageWidth = image.width;
    let imageHeight = image.height;
    console.log("imagePath: " + imagePath);
    let sendMessage = await NativeDealMessage.sendImageMessage(imagePath);
    console.log("isLogin: " + sendMessage.sendMessages);

    // 还需要将本条消息添加到当前会话中
    this.concatImageMessage({
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
    this.scrollTimeout = setTimeout(() => this.refs.flatList.scrollToEnd(), 200);
  }

  concatMessage(message) {
    ConversationUtil.addMessage(message, () => {

    });
    let msgs = this.state.messagessss;
    msgs.push(message);
    console.log(msgs);
    console.log("msgs result: " + JSON.stringify(msgs));
    this.setState({messagessss: msgs}, ()=>{
      this.scroll();
    });
  }

  concatImageMessage(message) {
    ConversationUtil.addMessage(message, () => {

    });
    let msgs = this.state.messagessss;
    msgs.push(message);
    console.log(msgs);
    console.log("msgs result: " + JSON.stringify(msgs));
    this.setState({messagessss: msgs}, ()=>{
      this.scrollTimeout = setTimeout(() => this.refs.flatList.scrollToEnd(), 500);
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBack)
    this.scrollTimeout && clearTimeout(this.scrollTimeout);
  }

  _matchContentString(textContent){
    // 匹配得到index并放入数组中
    let currentTextLength = textContent.length;
    let emojiIndex = textContent.search(emojiReg);
    let checkIndexArray = [];
    // 若匹配不到，则直接返回一个全文本
    if (emojiIndex === -1) {
      if (!Utils.isEmpty(textContent.substring(0,currentTextLength))) {
          this.state.tempSendTxtArray.push(textContent.substring(0,currentTextLength));
      }
    } else {

      if (emojiIndex !== -1) {
        checkIndexArray.push(emojiIndex);
      }
      // 取index最小者
      let minIndex = Math.min(...checkIndexArray);
      // 将0-index部分返回文本
        if (!Utils.isEmpty(textContent.substring(0, minIndex))) {
            this.state.tempSendTxtArray.push(textContent.substring(0, minIndex));
        }
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
    if (!Utils.isEmpty(emotoins_code[castStr[0]])) {
        this.state.tempSendTxtArray.push(emotoins_code[castStr[0]]);
        this._matchContentString(emojiStr.substring(emojiLength));
    }

  }

  _keyExtractor = (item, index) => index.toString();

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
        let delta = item.item.messageTime - preMsg.messageTime;
        if (delta > 3 * 60) {
          return true;
        }
      }
      return false;
    }
  }

  _matchContentMessageString(Views, textContent){

    // 匹配得到index并放入数组中
    let emojiIndex = textContent.search(emojiReg);

    let checkIndexArray = [];
    // 若匹配不到，则直接返回一个全文本
    if (emojiIndex === -1) {
      Views.push(<Text style={{color:'#000000'}} key ={'emptyTextView'+(Math.random()*100)}>{textContent}</Text>);

    } else {
      if (emojiIndex !== -1) {
        checkIndexArray.push(emojiIndex);
      }

      // 取index最小者
      let minIndex = Math.min(...checkIndexArray);

      // 将0-index部分返回文本
      Views.push(<Text style={{color:'#000000'}} key ={'firstTextView'+(Math.random()*100)}>{textContent.substring(0, minIndex)}</Text>);

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
    this._matchContentMessageString(Views, emojiStr.substring(emojiLength));

  }

  _onSelectionChange(event){

    this.setState({
      cursorIndex:event.nativeEvent.selection.start,
    });
  }

  test() {
     Actions.hometest();
  }

  render() {
    return (
      <View style={styles.container}>
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
        <ChatBottomBar handleSendBtnClick={this.handleSendBtnClick} sendImageMessage={this.sendImageMessage}/>
      </View>
    );
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
              imgStyle={{width: 80, height: 80  * (item.item.attribute.imageHeight / item.item.attribute.imageWidth)}}
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
              imgStyle={{width: 80, height: 80  * (item.item.attribute.imageHeight / item.item.attribute.imageWidth)}}
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
    width: '100%',
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
    width: '100%',
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
    // marginTop: 10,
    fontSize: 11,
    marginTop:58
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    // position:'absolute',
    // right:0
  },
  content: {
    width:'100%',
    flex: 1,
    flexDirection: 'column',
    // alignItems: 'flex-start',
    backgroundColor: Global.pageBackgroundColor,
    position: 'relative',
    bottom: 48,
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
