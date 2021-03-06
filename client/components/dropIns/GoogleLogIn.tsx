/* eslint-disable no-console */
import * as Google from 'expo-google-app-auth';
import React from 'react';
import {
  View,
  StyleSheet,
  AsyncStorage,
  Image,
  Text,
} from 'react-native';
import { Button } from 'react-native-elements';
import axios from 'axios';

export default function GoogleLogIn({
  setIsUserLoggedIn,
  setIsTruckOwnerLoggedIn,
  setOwnerGoogleId,
  setAccessToken,
}) {
  const userConfig = {
    iosClientId: process.env.EXPO_iosClientId,
    androidClientId: process.env.EXPO_androidClientId,
    scopes: ['profile', 'email'],
  };

  const truckConfig = {
    iosClientId: process.env.EXPO_iosClientId,
    androidClientId: process.env.EXPO_androidClientId,
    scopes: ['profile', 'email'],
  };

  const storeData = async (dataKey, dataValue) => {
    try {
      await AsyncStorage.setItem(dataKey, dataValue);
    } catch (error) {
      console.error(error);
    }
  };

  async function signUserInWithGoogleAsync(configuration: Object) {
    try {
      const result = await Google.logInAsync(configuration);
      if (result.type === 'success') {
        storeData('userData', JSON.stringify(result));
        setIsUserLoggedIn(true);

        axios.post(`${process.env.EXPO_LocalLan}/user/new`, {
          fullName: result.user.name,
          googleId: result.user.id,
          profilePhotoUrl: result.user.photoUrl,
        })
          .then((response) => {
            if (!response.data[1]) {
              console.log('You have logged in. Welcome Back!');
            } else {
              console.log('Account successfully registered');
            }
          })
          .catch((err) => console.error(err));

        return result.accessToken;
      }
      return { cancelled: true };
    } catch (e) {
      return { error: true };
    }
  }

  async function signTruckInWithGoogleAsync(configuration: Object) {
    try {
      const result = await Google.logInAsync(configuration);
      if (result.type === 'success') {
        storeData('ownerData', JSON.stringify(result));
        setAccessToken(result.accessToken);
        setIsTruckOwnerLoggedIn(true);
        setOwnerGoogleId(result.user.id);
        console.log('truckLogged in true');

        axios.post(`${process.env.EXPO_LocalLan}/truck/register`, {
          googleId: result.user.id,
        })
          .then((response) => {
            if (!response.data[1]) {
              console.log('You have logged in. Welcome Back!');
            } else {
              console.log('Truck successfully registered');
            }
          })
          .catch((err) => console.error(err));

        return result.accessToken;
      }
      return { cancelled: true };
    } catch (e) {
      return { error: true };
    }
  }

  const userSignIn = () => {
    signUserInWithGoogleAsync(userConfig);
  };

  const truckSignIn = () => {
    signTruckInWithGoogleAsync(truckConfig);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Truck Forager</Text>
      <Image source={require('../../../assets/foodtruckstill256.png')} />
      <View>
        <Button title="User Sign In" onPress={userSignIn} buttonStyle={styles.buttonUser} />
      </View>
      <View>
        <Button title="Truck Owner Sign In" onPress={truckSignIn} buttonStyle={styles.buttonOwner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    position: 'absolute',
    top: 130,
    fontWeight: 'bold',
  },
  buttonUser: {
    borderRadius: 30,
    padding: 15,
    marginBottom: 5,
    width: 300,
  },
  buttonOwner: {
    borderRadius: 30,
    padding: 15,
    marginTop: 25,
    width: 310,
  },
});
