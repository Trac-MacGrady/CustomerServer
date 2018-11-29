/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import Home from "./src/component/Home";
import {ActionConst, Router, Scene, Tabs, Drawer} from 'react-native-router-flux';
import ChattingScreen from './src/component/ChattingScreen'

class App extends Component {
    componentDidMount() {

    }

    render() {

        return (
            <Router>
                <Scene  key={'root'}>
                    <Scene key="home" component={ChattingScreen} hideNavBar={true}/>

                    {/*<Tabs key="tabbar" swipeEnabled tabBarPosition="bottom" showLabel={false}*/}
                          {/*tabBarStyle={styles.tabBarStyle}*/}
                    {/*>*/}
                        {/*<Scene key="home" component={Home} hideNavBar={true} title="收款"*/}
                               {/*icon={TabIcon}*/}
                               {/*iconDefaultImage={require('./image/iv_receipt_default.png')}*/}
                               {/*iconSelectImage={require('./image/iv_receipt_select.png')}*/}
                               {/*type={ActionConst.RESET}*/}
                               {/*panHandlers={null}*/}
                        {/*/>*/}
                        {/*<Scene key="pay" component={ PayPage } hideNavBar={true} title="支付"*/}
                               {/*iconDefaultImage={require('./image/iv_pay_default.png')}*/}
                               {/*iconSelectImage={require('./image/iv_pay_select.png')}*/}
                               {/*icon={TabIcon}/>*/}
                        {/*<Scene key="shopping" component={ShoppingPage} hideNavBar={true} title="商城"*/}
                               {/*iconDefaultImage={require('./image/iv_mall_default.png')}*/}
                               {/*iconSelectImage={require('./image/iv_mall_select.png')}*/}
                               {/*icon={TabIcon}*/}
                        {/*/>*/}
                        {/*<Scene key="user" component={UserPage} hideNavBar={true} title="用户"*/}
                               {/*iconDefaultImage={require('./image/iv_user_default.png')}*/}
                               {/*iconSelectImage={require('./image/iv_user_select.png')}*/}
                               {/*icon={TabIcon}*/}
                        {/*/>*/}

                    {/*</Tabs>*/}


                </Scene>
            </Router>
        );
    }
}


export default App;

const styles = StyleSheet.create({
    tabBarStyle: {
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabStyle: {
        fontSize: 20,
        color: 'black',
        textAlign: 'center'
    }
})
