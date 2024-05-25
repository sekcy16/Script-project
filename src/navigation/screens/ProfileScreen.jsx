import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { firebase } from '../../../config';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({ firstName: '', lastName: '', profilePicture: '' });

  useEffect(() => {
    const fetchData = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        try {
          const snapshot = await firebase.firestore().collection('users').doc(user.uid).get();
          if (snapshot.exists) {
            setUserData(snapshot.data());
          } else {
            console.log('User does not exist');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    // Fetch data initially
    fetchData();

    // Add listener for navigation changes to refetch data
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    return unsubscribe;
  }, [navigation]); // Fetch data whenever navigation changes

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: userData.profilePicture || 'https://via.placeholder.com/150' }}
        style={styles.profileImage}
      />
      <Text style={styles.greetingText}>
        Hello, {userData.firstName} {userData.lastName}
      </Text>
      <TouchableOpacity 
        onPress={() => navigation.navigate('EditProfile')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          Change Name
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => navigation.navigate('ChangePassword')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          Change Password
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => firebase.auth().signOut()}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    height: 50,
    width: 200,
    backgroundColor: '#FFC300',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});
