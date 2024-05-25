import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useState, useEffect } from 'react';
import { firebase } from "./config";

import Login from "./src/Login";
import Registration from "./src/Registration";
import Dashboard from "./src/Dashboard";
import Header from "./components/Header";
import ProfileInfo from "./components/ProfileInfo";
import EditProfile from "./src/navigation/screens/EditProfile"; 
import ChangePassword from "./src/navigation/screens/ChangePassword"; 
import QRScanner from "./components/QRScanner";

const Stack = createStackNavigator();

function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ firstName: '', lastName: '', profilePicture: '' });

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const db = firebase.firestore();
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setUserData(userDoc.data());
        }
      };
      fetchUserData();
    }
  }, [user]);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{
                headerTitle: () => <Header name='Welcome' />,
                headerStyle: {
                  height: 150,
                  borderBottomLeftRadius: 50,
                  borderBottomRightRadius: 50,
                  backgroundColor: '#F39010',
                  shadowColor: '#000',
                  elevation: 25
                },
                headerTitleAlign: 'left',
              }}
            />
            <Stack.Screen
              name="Registration"
              component={Registration}
              options={{
                headerTitle: () => <Header name='ย้อนกลับ' />,
                headerStyle: {
                  height: 150,
                  borderBottomLeftRadius: 50,
                  borderBottomRightRadius: 50,
                  backgroundColor: '#F39010',
                  shadowColor: '#000',
                  elevation: 25 
                },
                headerTitleAlign: 'left',
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Dashboard"
              component={Dashboard}
              options={{
                headerTitle: () => <Header name='Project Management' />,
                headerStyle: {
                  height: 100,
                  backgroundColor: '#F39010',
                  shadowColor: '#000',
                  elevation: 20
                },
                headerTitleAlign: 'left',
                headerRight: () => (
                  <ProfileInfo
                    firstName={userData.firstName}
                    lastName={userData.lastName}
                    profilePicture={userData.profilePicture}
                    userId={user.uid}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfile}
              options={{
                headerTitle: () => <Header name='Edit Profile' />,
                headerStyle: {
                  height: 100,
                  backgroundColor: '#F39010',
                  shadowColor: '#000',
                  elevation: 20
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePassword}
              options={{
                headerTitle: () => <Header name='Change Password' />,
                headerStyle: {
                  height: 100,
                  backgroundColor: '#F39010',
                  shadowColor: '#000',
                  elevation: 20
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="QRScanner"
              component={QRScanner}
              options={{
                headerTitle: () => <Header name='Scan QR Code' />,
                headerStyle: {
                  height: 100,
                  backgroundColor: '#F39010',
                  shadowColor: '#000',
                  elevation: 20
                },
                headerTitleAlign: 'center',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
