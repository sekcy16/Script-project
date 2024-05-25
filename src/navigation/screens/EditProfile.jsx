import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { firebase } from '../../../config';

const EditProfile = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Function to fetch user data from Firebase
  const fetchUserData = async () => {
    const user = firebase.auth().currentUser;
    if (user) {
      try {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        if (userData) {
          setFirstName(userData.firstName);
          setLastName(userData.lastName);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  // Fetch user data on initial component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Listen for focus event on the screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const handleSave = async () => {
    const user = firebase.auth().currentUser;
    if (user) {
      try {
        await firebase.firestore().collection('users').doc(user.uid).update({
          firstName,
          lastName,
        });
        // Update state immediately after successful update
        setFirstName(firstName);
        setLastName(lastName);
        // Refresh the screen by navigating back
        navigation.goBack();
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.label}>First Name:</Text>
      <TextInput 
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />
      <Text style={styles.label}>Last Name:</Text>
      <TextInput 
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />
      <TouchableOpacity 
        onPress={handleSave}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  button: {
    height: 50,
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
