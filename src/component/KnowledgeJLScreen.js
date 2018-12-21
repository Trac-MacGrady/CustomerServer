import React, {Component} from 'react';
import Global from '../utils/Global';
import Utils from '../utils/Utils';
import TimeUtils from '../utils/TimeUtil';
import TimeUtil from '../utils/TimeUtil';
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
import HTMLView from 'react-native-htmlview';
import HttpClient from '../network/HttpClient'
import Toast from '../widget/Toast'
import HttpCode from '../network/HttpCode'
import Host from "../network/Config";

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
      showHistory:false,
    };

    // 初始化聊天记录
    ConversationUtil.getConversations("knowledge", (data) => {
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
    StorageUtil.set('username', {'username': "knowledge"});
  }

  componentDidMount() {
    //获取通道信息
    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBack) ;
  }

  receiveTextMessage = (msg) => {

      this.concatMessage({
        'conversationId':ConversationUtil.generateConversationId("knowledge", "knowledge"),
        'receiveMessage': msg,
        'sendMessage': "",
        'messageTime': TimeUtil.currentTime(),
        'messageState': "receive",
        'messageType': 'txt'
      })
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
    // 模拟数据，【00004】为用户自定义输入
    let data = {'app':'hhw', 'ask':'【00004】'+ msg, 'user':'{"level":12,"vip":0,"uid":20996000001,"app_channel":"","sch":"弓箭手","iz":"蒲家村"}'};
    // let data = {'app':'hhw', 'ask':'【system】精灵热点', 'user':'{"level":1,"vip":0,"uid":20996000001,"app_channel":"","sch":"弓箭手","iz":"蒲家村"}'};
    HttpClient.doPost(Host.ask, data, (code, response) => {
      switch (code) {
        case HttpCode.SUCCESS:
          let codeStatus = response.code;
          if (codeStatus === 0) {
            console.log("successful" + JSON.stringify(response.result.result));
            this.receiveTextMessage(response.result.result);
          } else {
            Toast.show(response.msg, Toast.SHORT);
          }
          break;
        case HttpCode.ERROR:
          Toast.show("网络问题，请重试", Toast.SHORT);
          console.log("http请求失败");
          break;
        default:
          break;
      }
    });

    // 还需要将本条消息添加到当前会话中
    this.concatMessage({
      'conversationId':ConversationUtil.generateConversationId("knowledge", "knowledge"),
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

  /**
   * 点击消息条目设置message给input
   * @param item
   */
  showSendHistoryMsg(item) {
    this.setState({
      inputMsg:item.item.sendMessage,
    });
  }

  render() {
    var historyMessage = [];      // 截取最近5条问答历史
    if (this.state.messagessss.length < 5) {
      historyMessage = this.state.messagessss.slice(0, 5).reverse();
    } else {
      historyMessage = this.state.messagessss.slice(this.state.messagessss.length - 5, this.state.messagessss.length).reverse();
    }
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

            {/* 是否显示历史提问框*/}
            {this.state.showHistory &&
            <View style={{width:'100%', alignItems:'center'}}>
              <View style={{width:'100%', height:200, backgroundColor:'#ffffff', marginBottom:10,  borderRadius: 6,}}>
                <FlatList
                  ref="flatlist_history"
                  data={historyMessage}  // 历史记录只显示前5条数据
                  renderItem={this.renderHistoryItem}
                  keyExtractor={this._keyExtractor}
                  showsVerticalScrollIndicator = {false}    //隐藏垂直滚动条
                  extraData={this.state}
                />
              </View>
            </View>}



          <View style={styles.textContainer}>
            <View style={styles.inputHistory}>
              <TextInput
                ref="textInputss"
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
                  {
                    this.state.showHistory ?
                      <Image source={require('../../images/ic_arrow_drop_down_black_24dp.png')} style={{width:30, height:30, }}/>
                      :
                      <Image source={require('../../images/ic_arrow_drop_up_black_24dp.png')} style={{width:30, height:30, }}/>
                  }

                </TouchableOpacity>
              </View>
            </View>
            
            {
              Utils.isEmpty(this.state.inputMsg) ? (
                <View style={{marginLeft: 10, marginRight:10}}>
                  <Button color={'#bababf'} title={"发送"} onPress={this.sendEmptyMsg.bind(this)}/>
                </View>
              ) : (
                <View style={{marginLeft: 10, marginRight:10}}>
                  <Button color={'#49BC1C'} title={"发送"} onPress={() => this.sendMsg()}/>
                </View>
              )
            }
          </View>

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
         <TouchableOpacity onPress={()=>this.showSendHistoryMsg(item)}>
           <View style={listItemStyle.msgHistorySend}>
             <View style={styles.mojicontainer}>
               <Text>{item.item.sendMessage}</Text>
             </View>
           </View>
         </TouchableOpacity>
       );
  }

  renderReceivedTextMsg(item) { // 接收的文本消息
    let contactAvatar = require('../../images/avatar.png');
    let receiveMessage = item.item.receiveMessage.toString();
    if (receiveMessage.includes('<p')) {
      receiveMessage = "<p>" + receiveMessage.replace(/<p/g, "<nobr").replace(/p>/g, "nobr>").replace("ui=", "href=") + "</p>";  // 使用正则替换所有的字符，否则只替换第一个
      console.log("============" + receiveMessage)
    }
    
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
          <View style={{width: '80%',alignItems: 'flex-start', justifyContent: 'center',}}>
          <View style={listItemStyle.msgContainer}>
            <View style={styles.mojicontainer}>
              <HTMLView              // 显示后台返回的包含html标签的数据
                value={receiveMessage}
                stylesheet={styles}
                onLinkPress={(url) => Toast.show(url, Toast.SHORT)}
              />
              {/*<Text style={{color:'#000000'}}>{item.item.receiveMessage}</Text>*/}
            </View>
            {/* 显示是否解决问题菜单*/}
            <View style={{width:'100%', marginTop:8, flexDirection:'row',height:40, justifyContent: 'flex-end', alignItems:'center', backgroundColor:'#F9FFB1'}}>
              <Text style={{position:'absolute', left:5, fontSize:13}}>此次回答是否解决了你的问题</Text>
              <View  style={{flexDirection:'row'}}>
                <View style={{marginRight:5}}>
                  <Button color={'#49BC1C'} title={"未解决"}/>
                </View>
                <View style={{marginRight:5}}>
                  <Button  color={'#49BC1C'} title={"解决"}/>
                </View>
                <View>
                  <Button color={'#49BC1C'} title={"工单"}/>
                </View>
              </View>
            </View>

          </View>
        </View>
      </View>
      </View>
    );
  }

  renderSendTextMsg(item) { // 发送出去的文本消息
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
          <View style={{width: '80%',alignItems: 'flex-end', justifyContent: 'center',}}>
            <View style={listItemStyle.msgContainerSend}>
              <View style={styles.mojicontainer}>
                <Text style={{color:'#000000'}}>{item.item.sendMessage}</Text>
              </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },

  msgHistorySend: {
    backgroundColor: '#E3FFE5',
    borderRadius: 12,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop:10,
    paddingBottom:10,
    justifyContent: 'center',
   margin:5,
    alignItems: 'center',
  },

  msgContainerSend: {
    backgroundColor: '#9FE658',
    borderRadius: 3,
    padding:10,
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
    position: 'relative',
    bottom: 48,
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
    paddingTop:10,
    paddingLeft:10,
    paddingRight:10,
  },

  subEmojiStyle:{
    width:25,
    height:25,
  },
  
  input: {
    flex:1,
    paddingTop:8,
    paddingBottom:5,
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
  },

  // 标签样式
  nobr: {
    fontWeight: '300',
    color: '#8b00ff', // make links coloured pink
  },
});
