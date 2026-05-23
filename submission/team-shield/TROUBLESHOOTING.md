# AI Counselor System Troubleshooting Guide

## Common Error: "Error notifying counselors"

### Most Likely Causes:

1. **No counselors in database**
   - The system can't find any users with role: 'counselor' in Firestore
   - **Solution**: Create at least one counselor user

2. **Firebase permissions**
   - Firestore security rules may be blocking writes to 'notifications' or 'concernAlerts' collections
   - **Solution**: Check/update Firebase security rules

3. **Missing user authentication**
   - User not properly authenticated when trying to create notifications
   - **Solution**: Ensure user is signed in before using chatbot

### Quick Fixes:

#### 1. Create a test counselor user:
```javascript
// In your app or Firebase console, add a document to the 'users' collection:
{
  id: "counselor-test-001",
  email: "counselor@test.com", 
  displayName: "Test Counselor",
  role: "counselor",
  createdAt: [timestamp],
  updatedAt: [timestamp]
}
```

#### 2. Update Firebase Security Rules:
```javascript
// In Firebase Console > Firestore > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to create concern alerts and notifications
    match /concernAlerts/{alertId} {
      allow read, write: if request.auth != null;
    }
    
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 3. Check Console Logs:
Look for these debug messages in your console:
- "Starting counselor notification process..."
- "Found X counselors to notify"
- "Creating concern alert..."
- "Notification created with ID: ..."

### Testing the System:

1. **Open the AI Counselor chat**
2. **Type a concerning message** like "I feel worthless"
3. **Check console output** for detailed logging
4. **Expected behavior**:
   - Detection logs should show concern level
   - Counselor fetch should show number of counselors found
   - Notifications should be created successfully

### Manual Test Commands:

In your React Native app console, you can test individual components:

```javascript
// Test concern detection
import { detectConcernLevel } from './utils/aiConcernDetection';
console.log(detectConcernLevel("I want to hurt myself"));

// Test counselor fetch
import { getAllCounselors } from './services/counselorNotificationService';
getAllCounselors().then(console.log);
```

### Error Codes:

- **"Missing required parameters"**: Check if user, concernLevel, or message is undefined
- **"No counselors found"**: Add counselors to your Firestore database
- **"Permission denied"**: Update Firebase security rules
- **"Collection error"**: Check Firebase project configuration

### Contact Support:

If the issue persists:
1. Check the full console log output
2. Verify Firebase project configuration
3. Ensure all imports are correct
4. Test with a simple concerning message

The system includes comprehensive logging to help diagnose issues quickly.