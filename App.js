/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import { Router, Scene, Tabs, ActionConst} from 'react-native-router-flux'
import ChattingScreen from './src/component/ChattingScreen'
import TabIcon from './src/widget/TabIcon'
import Home from './src/component/Home'
import LeftMenu from './src/component/LeftMenu'

class App extends Component {
    componentDidMount() {

    }

    render() {

        return (
            <Router>
                <Scene  key={'root'}>
                    <Scene key="chatting" component={ChattingScreen} hideNavBar={true}/>
                    <Scene key="home" component={Home} hideNavBar={true} initial={true}/>
                    <Scene key="leftmenu" component={LeftMenu} hideNavBar={true}/>
                  {/*<Tabs key="tabbar" swipeEnabled tabBarPosition="bottom" showLabel={false}*/}
                        {/*tabBarStyle={styles.tabBarStyle}*/}
                  {/*>*/}
                    {/*<Scene key="home" component={ChattingScreen} hideNavBar={true} title="热 点"*/}
                      {/*icon={TabIcon}*/}
                      {/*iconDefaultImage={require('./images/ic_pop_add_friends.png')}*/}
                      {/*iconSelectImage={require('./images/ic_pop_add_friends.png')}*/}
                           {/*type={ActionConst.RESET}*/}
                           {/*panHandlers={null}*/}
                    {/*/>*/}
                    {/*<Scene key="pay" component={ ChattingScreen } hideNavBar={true} title="小精灵"*/}
                      {/*iconDefaultImage={require('./images/ic_pop_add_friends.png')}*/}
                      {/*iconSelectImage={require('./images/ic_pop_add_friends.png')}*/}
                      {/*icon={TabIcon}*/}
                    {/*/>*/}
                    {/*<Scene key="shopping" component={ChattingScreen} hideNavBar={true} title="人工客服"*/}
                      {/*iconDefaultImage={require('./images/ic_pop_add_friends.png')}*/}
                      {/*iconSelectImage={require('./images/ic_pop_add_friends.png')}*/}
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
