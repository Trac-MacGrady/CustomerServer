import React, {Component} from 'react';
import {Dimensions, Text, View, StyleSheet, FlatList, TextInput, TouchableOpacity, Button, DeviceEventEmitter} from "react-native";
import NativeCustomerServerSet from "../native/NativeCustomerServerSet";
import NativeDealMessage from "../native/NativeDealMessage";

// 取得屏幕的宽高Dimensions
const { width, height } = Dimensions.get('window');

export default class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message:[],
            isLoginServer:'',
            textInput: '',
        };
    }

    /**
     * 初始化数据
     */
    componentDidMount() {
       // 注册账号
        this.createAccount();
        DeviceEventEmitter.addListener('receiveMessage', (e) => {
            let data = [];
            console.log("receiverMessage: " + e);
            data.push({
                 receiveMessage:e,
            })

            this.setState({message: data}) ;
        });

    }

    /**
     * 设置账号，注册
     * @returns {Promise<void>}
     */
    createAccount = async () => {
        let login = await NativeCustomerServerSet.setCustomerAccout("wanghong", "123456");
        console.log("isLogin: " + login.isLogin);
        this.setState({isLoginServer:login.isLogin});
    };

    onChangeMobile = (textInput) => {
        this.setState({textInput: textInput});
        console.log("textInput: " + textInput);
    };

    _renderItem = ({item}) => {
        return(
            <TouchableOpacity style={{flex:1,
                height:60,
                backgroundColor:'orange',
            }}
                              onPress={()=>{this.Cellheader(item)}}
            >
                <View style={{backgroundColor:'green',
                    height:59,justifyContent: 'center',
                    alignItems: 'center'}}>
                    <Text>{item.receiveMessage}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    Cellheader = (data) =>{
        alert(data.receiveMessage);
    };

    //此函数用于为给定的item生成一个不重复的key
    _keyExtractor = (item) => item.key;

    sendMessage = async () => {
        let sendMessage = await NativeDealMessage.sendMessage(this.state.textInput);
        console.log("isLogin: " + sendMessage.sendMessages);
        // this.setState({isLoginServer:login.isLogin});
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={{}}>
                    <FlatList
                        style={styles.flatlist}
                        data={this.state.message}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem.bind(this)}>
                    </FlatList>

                    <View style={{width: width * 0.9, height: 50, flexDirection: 'row', marginBottom:20}}>
                        <TextInput style={styles.textInput}
                                   placeholder="请输入"
                                   placeholderTextColor="#A0A0A0"
                                   underlineColorAndroid='transparent'
                                   onChangeText={this.onChangeMobile}
                        />
                        <Button
                            title={"SEND"}
                            onPress={this.sendMessage}
                            color="#841584"/>
                    </View>

                </View>
            </View>
        );
    }
}

const
    styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: '#F5FCFF',
        },

        flatlist: {
            width:width,
            height:height-200,
        },

        textInput: {
            height: 40,
            width:width - 100,
            //内边距
            paddingLeft: 10,
            paddingRight: 10,
            color: '#000000'
        },
    });
