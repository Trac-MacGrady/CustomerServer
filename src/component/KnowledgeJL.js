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
  BackHandler, Button, TextInput, TouchableOpacity
} from 'react-native'
import NativeDealMessage from '../native/NativeDealMessage'

const {width} = Dimensions.get('window');
const {height} = Dimensions.get('window');

export default class ChattingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      conversation: null,
      isLoginServer:'',
      messagessss: [],
      historyMessage:[],
      tempSendTxtArray:[],
      cursorIndex:0,
      inputMsg:'',
      showHistory:false
    };

  }

  componentWillMount() {

  }

  componentDidMount() {
    //获取通道信息
    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBack) ;
  }

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

  /**
   * 发送文字
   * @param msg
   */
  sendMsg (){
    this.sendTextMessage(this.state.inputMsg);
    this.setState({
      inputMsg:'',
    })
  }

  sendEmptyMsg() {

  }

  showHistory() {
    this.setState({
      showHistory:!this.state.showHistory
    })
  }

  sendTextMessage = async (msg) =>{ // 发送文本消息
    // let sendMessage = await NativeDealMessage.sendTextMessage(msg);
    // console.log("isLogin: " + sendMessage.sendMessages);
    // 还需要将本条消息添加到当前会话中
    this.concatMessage({
      'conversationId':ConversationUtil.generateConversationId("hongwang", "hongwang"),
      // 'id': sendMessage.sendMessages,
      'receiveMessage': "",
      'sendMessage': msg,
      'messageTime': TimeUtil.currentTime(),
      'messageState': "send",
      'messageType': 'txt'
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

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBack)
    this.scrollTimeout && clearTimeout(this.scrollTimeout);
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

  _onInputChangeText(text){
    //设值
    this.setState({
      inputMsg:text,
    });

  }

  /**
   * 关闭打开的HistoryView
   */
  closeInputBar() {
    this.setState({
      showHistory: false,
    })
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
          <View style={styles.inputContainer}>
            {
              (this.state.showHistory) &&
              <TouchableOpacity onPress={this.closeInputBar.bind(this)}>
                <View style={{height:height-265, width:'100%', backgroundColor: 'transparent'}}/>
              </TouchableOpacity>

            }
          <View style={styles.textContainer}>
            <View style={styles.inputHistory}>
              <TextInput
                ref="textInput"
                style={styles.input}
                underlineColorAndroid="transparent"
                multiline = {true}
                autoFocus={false}
                editable={true}
                placeholder={'请输入'}
                placeholderTextColor={'#bababf'}
                onChangeText={(text) => this._onInputChangeText(text)}
                defaultValue={this.state.inputMsg}/>
              <View style={styles.iconHistory}>
                <TouchableOpacity onPress={this.showHistory.bind(this)}>
                  <Image source={require('../../images/ic_arrow_drop_down_black_24dp.png')} style={{width:30, height:30, }}/>
                </TouchableOpacity>
              </View>
            </View>
            
            {
              Utils.isEmpty(this.state.inputMsg) ? (
                <View style={{marginLeft: 10, marginRight:10}}>
                  <Button color={'#bababf'} title={"发送"} onPress={() => this.sendEmptyMsg()}/>
                </View>
              ) : (
                <View style={{marginLeft: 10, marginRight:10}}>
                  <Button color={'#49BC1C'} title={"发送"} onPress={() => this.sendMsg()}/>
                </View>
              )
            }
          </View>
          {this.state.showHistory &&
          <View style={{width:'100%', height:200}}>
            <FlatList
              ref="flatList_history"
              data={this.state.messagessss}
              renderItem={this.renderHistoryItem}
              keyExtractor={this._keyExtractor}
              extraData={this.state}
            />
          </View>}
        </View>
        </View>

    );
  }

  renderItem = (item) => {
    if (item.item.messageState ==="receive") {
      return this.renderReceivedTextMsg(item);
    } else {
      return this.renderSendTextMsg(item);
    }
  }

  renderHistoryItem = (item) => {
       return (
         <TouchableOpacity>
           <View style={listItemStyle.msgContainer}>
             <View style={styles.mojicontainer}>
               <Text>{item.item.sendMessage}</Text>
             </View>
           </View>
         </TouchableOpacity>
       );
  }

  renderReceivedTextMsg(item) { // 接收的文本消息
    let contactAvatar = require('../../images/avatar.png');
    // if (!Utils.i sEmpty(this.chatWithAvatar)) {
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
              <Text style={{color:'#000000'}}>{item.item.receiveMessage}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  renderSendTextMsg(item) { // 发送出去的文本消息
    let avatar = require('../../images/avatar.png');
    let Views = []
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
              <Text style={{color:'#000000'}}>{item.item.sendMessage}</Text>
            </View>
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

  textContainer: {
    width:'100%',
    height:48,
    flexDirection:'row',
    backgroundColor: '#F4F4F4',
    alignItems:'center',
  },

  mojicontainer: {
    flexDirection:'row',
    alignItems:'center',
    flexWrap:'wrap',
  },

  subEmojiStyle:{
    width:25,
    height:25,
  },
  
  input: {
    flex:1,
    paddingTop:8,
    paddingBottom:8,
    paddingLeft:10,
    paddingRight:10,
    height:32,
    marginLeft:10,
    backgroundColor:'#ffffff',
    borderWidth:0,
    borderRadius:20,
    fontSize:15,
  },

  inputContainer: {
    width:'100%',
    position:'absolute',
    bottom:0,
  },

  inputHistory: {
    flex:1,
    paddingTop:8,
    paddingBottom:8,
    paddingLeft:10,
    paddingRight:10,
  },

  iconHistory: {
    width:60,
    position:'absolute',
    right:0,
    paddingTop:8,
    paddingBottom:8,
  }

});
