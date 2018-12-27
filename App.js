/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import { Router, Scene} from 'react-native-router-flux'
import CustomerChattingScreen from './src/component/CustomerChattingScreen'
import Home from './src/component/Home'
import LeftMenu from './src/component/LeftMenu'
import RecommendScreen from './src/component/RecommendScreen'
import KnowledgeJLScreen from './src/component/KnowledgeJLScreen'

class App extends Component {
    componentDidMount() {
    }


    render() {

        return (
            <Router>
                <Scene  key={'root'}>
                    <Scene key="chatting" component={CustomerChattingScreen} hideNavBar={true}/>
                    <Scene key="home" component={Home} hideNavBar={true} initial={true}/>
                    <Scene key="leftmenu" component={LeftMenu} hideNavBar={true}/>
                    <Scene key="knowledge" component={KnowledgeJLScreen} hideNavBar={true}/>
                    <Scene key="recommend" component={RecommendScreen} hideNavBar={true}/>
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
