import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { auth } from './firebase';
import { getUserProfile } from './services/firestoreService';

// Import screens
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import RoleSelectScreen from './screens/RoleSelectScreen';
import StudentDashboard from './screens/StudentDashboard';
import CounselorDashboard from './screens/CounselorDashboard';
import MoodSelector from './components/MoodSelector';
import StudentStats from './screens/StudentStats';
import MoodGraphs from './screens/MoodGraphs';
import TrustedFriends from './screens/TrustedFriends';
import NotificationScreen from './screens/NotificationScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import ProfileScreen from './screens/ProfileScreen';
import ConcernAlerts from './screens/ConcernAlerts';
import WordleScreen from './screens/WordleScreen';
import MeditationScreen from './screens/MeditationScreen';
import MoodAnalyticsScreen from './screens/MoodAnalyticsScreen';
import CommunityGroupsScreen from './screens/CommunityGroupsScreen';
import DirectChatScreen from './screens/DirectChatScreen';
import CrisisReportsScreen from './screens/CrisisReportsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        setProfileLoading(true);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile.success) {
            setUserProfile(profile.data);
          } else {
            // Profile doesn't exist, user needs to select role
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
        setProfileLoading(false);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleRoleSelected = (role, userData) => {
    setUserProfile(userData);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        {user ? (
          profileLoading ? (
            // Loading user profile
            <View style={[styles.container, styles.centered]}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Setting up your profile...</Text>
            </View>
          ) : !userProfile || !userProfile.role ? (
            // User needs to select role
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="RoleSelect">
                {(props) => <RoleSelectScreen {...props} onRoleSelected={handleRoleSelected} />}
              </Stack.Screen>
            </Stack.Navigator>
          ) : (
            // User has profile, show appropriate dashboard
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {userProfile.role === 'student' ? (
                <>
                  <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
                  <Stack.Screen name="MoodSelector" component={MoodSelector} />
                  <Stack.Screen name="StudentStats" component={StudentStats} />
                  <Stack.Screen name="TrustedFriends" component={TrustedFriends} />
                  <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
                  <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
                  <Stack.Screen name="WordleScreen" component={WordleScreen} />
                  <Stack.Screen name="MeditationScreen" component={MeditationScreen} />
                  <Stack.Screen name="MoodAnalyticsScreen" component={MoodAnalyticsScreen} />
                  <Stack.Screen name="CommunityGroupsScreen" component={CommunityGroupsScreen} />
                  <Stack.Screen name="DirectChatScreen" component={DirectChatScreen} />
                  <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                </>
              ) : (
                <>
                  <Stack.Screen name="CounselorDashboard" component={CounselorDashboard} />
                  <Stack.Screen name="MoodGraphs" component={MoodGraphs} />
                  <Stack.Screen name="CounselorNotifications" component={require('./screens/CounselorNotifications').default} />
                  <Stack.Screen name="ConcernAlerts" component={ConcernAlerts} />
                  <Stack.Screen name="CrisisReportsScreen" component={CrisisReportsScreen} />
                  <Stack.Screen name="DirectChatScreen" component={DirectChatScreen} />
                  <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
                </>
              )}
            </Stack.Navigator>
          )
        ) : (
          // User is not signed in - show auth screens
          <Stack.Navigator 
            screenOptions={{ 
              headerShown: false,
              gestureEnabled: false 
            }}
            initialRouteName="SignIn"
          >
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
