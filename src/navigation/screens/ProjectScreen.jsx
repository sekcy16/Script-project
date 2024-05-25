import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProjectManagementPage from './ProjectManagementPage';
import AddProjectPage from './AddProjectPage';
import EditProjectPage from './EditProjectPage';
import QRScanner from '../../../components/QRScanner';

const Stack = createStackNavigator();

export default function ProjectScreen() {
  return (
    <Stack.Navigator initialRouteName="ProjectManagement">
      <Stack.Screen
        name="Project List"
        component={ProjectManagementPage}
        options={{
          headerTitleStyle: {
            fontWeight: 'bold', 
            fontSize: 20, 
            color: 'blue',
          },
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen name="Add Project" component={AddProjectPage} />
      <Stack.Screen name="Project Management" component={EditProjectPage} />
      <Stack.Screen name="QRScanner" component={QRScanner} />
    </Stack.Navigator>
  );
}
