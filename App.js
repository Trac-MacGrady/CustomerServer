/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import { Router, Scene} from 'react-native-router-flux';
import ChattingScreen from './src/component/ChattingScreen'

class App extends Component {
    componentDidMount() {

    }

    render() {

        return (
            <Router>
                <Scene  key={'root'}>
                    <Scene key="home" component={ChattingScreen} hideNavBar={true}/>
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
