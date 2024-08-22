/*eslint-disable*/
importScripts('https://www.gstatic.com/firebasejs/10.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBPAGClRDq_tSoYObl5gpLzyF4gx6AZAl8",
  authDomain: "medsafe-67a48.firebaseapp.com",
  projectId: "medsafe-67a48",
  storageBucket: "medsafe-67a48.appspot.com",
  messagingSenderId: "507503158272",
  appId: "1:507503158272:web:a14cea429822ded3d9a4e5",
  measurementId: "G-7KZHR6PF8F"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/icon.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});