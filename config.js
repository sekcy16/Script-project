import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCo730zkk3KuZByiY2DfxIGuEXAyxfLByE",
  authDomain: "testprojectmanagement-app.firebaseapp.com",
  projectId: "testprojectmanagement-app",
  storageBucket: "testprojectmanagement-app.appspot.com",
  messagingSenderId: "595236156873",
  appId: "1:595236156873:web:a41cacba4fd76ffb616418",
  measurementId: "G-1DLG10NG14"
};

// Check if Firebase is not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
