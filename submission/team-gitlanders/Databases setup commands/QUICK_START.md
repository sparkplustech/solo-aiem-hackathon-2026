# 🚀 Quick Start Guide

## What's Been Fixed

### ✅ Upvote System
- **Problem**: The upvote buttons weren't working because the database tables didn't exist
- **Solution**: Created complete database schema with upvote tables and functions
- **What you need to do**: Run the SQL setup (see below)

### ✅ Profile Picture Upload
- **Problem**: Profile pictures weren't implemented
- **Solution**: Added full upload functionality with Supabase Storage
- **What you need to do**: Run the SQL setup (see below)

---

## 📋 Step-by-Step Setup

### Step 1: Open Supabase SQL Editor

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"+ New query"**

### Step 2: Run the Database Setup

1. Open the file `DATABASE_COMPLETE_SETUP.sql` from this project
2. Copy **ALL** the SQL code (Ctrl+A, then Ctrl+C)
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** or press `Ctrl+Enter`
5. Wait for confirmation message

### Step 3: Verify Setup Worked

Check if these tables exist in **Table Editor**:
- ✅ `community_posts`
- ✅ `post_upvotes`
- ✅ `post_comments`
- ✅ `report_responses`
- ✅ `profiles` (should have new columns: `avatar_url`, `bio`, `role`)

Check if storage bucket exists in **Storage**:
- ✅ `avatars` bucket

### Step 4: Test Everything

#### Test Upvote System:
1. Go to the app → Community Feed
2. Find any post
3. Click the thumbs up icon 👍
4. The number should increase
5. Click again → number should decrease

#### Test Profile Picture:
1. Go to User Profile
2. Click "Edit Profile"
3. Click the camera icon on your avatar
4. Choose an image (JPG, PNG, etc. - max 2MB)
5. Wait for upload (spinner will show)
6. Your new profile picture should appear!

---

## 🎯 What Each Feature Does

### Upvote System
```
User clicks thumbs up
↓
Checks if already upvoted
↓
If yes: Remove upvote, decrease count
If no: Add upvote, increase count
↓
Update shown on screen immediately
```

### Profile Picture
```
User uploads image
↓
Image saved to Supabase Storage (avatars bucket)
↓
Public URL generated
↓
URL saved to user profile (avatar_url column)
↓
Image displays everywhere user appears
```

---

## 🔧 Technical Details (For Reference)

### Database Tables Created:

1. **community_posts**: Stores all community posts
   - `id`, `user_id`, `user_name`, `content`, `image_url`
   - `upvotes` (counter), `comments_count` (counter)
   - `created_at`

2. **post_upvotes**: Tracks who upvoted what
   - `post_id`, `user_id`
   - Unique constraint (one upvote per user per post)

3. **post_comments**: Stores comments on posts
   - `id`, `post_id`, `user_id`, `user_name`, `content`

4. **report_responses**: Official responses to reports
   - `id`, `report_id`, `user_id`, `user_name`, `response`, `status`

### RPC Functions Created:

1. **increment_post_upvotes(post_id)**: Increases upvote count
2. **decrement_post_upvotes(post_id)**: Decreases upvote count
3. **increment_post_comments(post_id)**: Increases comment count
4. **decrement_post_comments(post_id)**: Decreases comment count
5. **update_report_status(...)**: Updates report status and creates response

All functions use `SECURITY DEFINER` to bypass Row Level Security (RLS) for proper counting.

### Storage Bucket:

- **Name**: `avatars`
- **Public**: Read-only public access
- **Upload**: Only authenticated users can upload to their own folder
- **Path structure**: `avatars/{user_id}/avatar-{timestamp}.{ext}`

---

## ❓ Troubleshooting

### "Failed to update upvote"
- **Cause**: Database setup not run yet
- **Fix**: Run `DATABASE_COMPLETE_SETUP.sql` in Supabase SQL Editor

### "Failed to upload profile picture"
- **Cause**: Storage bucket doesn't exist
- **Fix**: Run `DATABASE_COMPLETE_SETUP.sql` (creates the bucket)

### "Image must be less than 2MB"
- **Cause**: Image file is too large
- **Fix**: Compress the image or choose a smaller one

### Profile picture doesn't show
- **Cause**: Browser cache
- **Fix**: Hard refresh (Ctrl+Shift+R) or clear cache

### SQL execution errors
- **Cause**: Some tables might already exist
- **Fix**: The SQL uses `IF NOT EXISTS` so it's safe to run multiple times

---

## 🎉 You're All Set!

After running the database setup, your app will have:

✅ Fully functional upvote system  
✅ Profile picture uploads  
✅ AI chatbot with voice features  
✅ Report tracking and status updates  
✅ Community feed with posts and comments  
✅ Role-based access (Admin/Official/Citizen)  
✅ Mobile-responsive design  

Enjoy your civic engagement platform! 🏙️
