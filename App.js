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
import Home from './src/component/Home'
import LeftMenu from './src/component/LeftMenu'
import KnowledgeJL from './src/component/KnowledgeJL'
import Recommend from './src/component/Recommend'

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
                    <Scene key="knowledge" component={KnowledgeJL} hideNavBar={true}/>
                    <Scene key="recommend" component={Recommend} hideNavBar={true}/>
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
