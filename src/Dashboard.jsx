import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Screens
import MainScreen from './navigation/screens/MainScreen';
import ProjectScreen from './navigation/screens/ProjectScreen';
import ProfileScreen from './navigation/screens/ProfileScreen';

// Screen names
const mainName = "Main";
const projectName = "Project";
const profileName = "Profile";

const Tab = createBottomTabNavigator();

function Dashboard() {
  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 10 }}>
      <Tab.Navigator
        initialRouteName={mainName}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            let rn = route.name;

            if (rn === mainName) {
              iconName = focused ? 'home' : 'home-outline';
            } else if (rn === projectName) {
              iconName = focused ? 'list' : 'list-outline';
            } else if (rn === profileName) {
              iconName = focused ? 'person-outline' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarLabel: ({ focused, color, size }) => (
            <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
              {route.name}
            </Text>
          ),
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'grey',
          tabBarStyle: { padding: 10, height: 70 },
          tabBarLabelStyle: styles.tabLabel,
        })}
      >
        <Tab.Screen
          name={mainName}
          component={MainScreen}
        />
        <Tab.Screen
          name={projectName}
          component={ProjectScreen}
        />
        <Tab.Screen
          name={profileName}
          component={ProfileScreen}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 12,
  },
  tabLabelFocused: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Dashboard;
