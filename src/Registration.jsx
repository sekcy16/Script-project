import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { firebase } from '../config';

const Registration = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const registerUser = async (email, password, firstName, lastName) => {
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = firebase.auth().currentUser;
      await user.sendEmailVerification({
        handleCodeInApp: true,
        url: 'http://testprojectmanagement-app.firebaseapp.com',
      });
      await firebase.firestore().collection('users').doc(user.uid).set({
        firstName,
        lastName,
        email,
      });
      alert('User registered successfully! Please check your email for verification.');
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: 'bold', fontSize: 30 }}>
        สมัครสมาชิก 
      </Text>
      <View style={{ marginTop: 40 }}>
        <TextInput
          style={styles.TextInput}
          placeholder="ชื่อ"
          onChangeText={(firstName) => setFirstName(firstName)}
          autoCorrect={false}
        />
        <TextInput
          style={styles.TextInput}
          placeholder="นามสกุล"
          onChangeText={(lastName) => setLastName(lastName)}
          autoCorrect={false}
        />
        <TextInput
          style={styles.TextInput}
          placeholder="อีเมล"
          onChangeText={(email) => setEmail(email)}
          autoCapitalize='none'
          autoCorrect={false}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.TextInput}
          placeholder="รหัสผ่าน"
          onChangeText={(password) => setPassword(password)}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
        />
      </View>
      <TouchableOpacity onPress={() => registerUser(email, password, firstName, lastName)}
        style={styles.button}
      >
        <Text style={{fontWeight: 'bold', fontSize: 22}}>ยืนยัน</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Registration

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 100,
  },
  TextInput: {
    paddingTop: 20,
    paddingBottom: 10,
    width: 300,
    fontSize: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 5,
    textAlign: 'center'
  },
  button: {
    marginTop: 50,
    height: 70,
    width: 400,
    backgroundColor: '#FFC300',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  }
});
