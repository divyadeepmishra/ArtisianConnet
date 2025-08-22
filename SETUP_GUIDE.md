# 🚀 Setup Guide

## **Environment Variables Setup**

To run the app without errors, you need to set up environment variables. Create a `.env` file in your project root:

### **1. Create `.env` file**
```bash
# In your project root directory
touch .env
```

### **2. Add the following variables to `.env`:**
```env
# Clerk Authentication (Required for user authentication)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Google Gemini AI (Optional - for AI features)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (Optional - if you're using Supabase)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## **🔑 How to Get API Keys**

### **Clerk Authentication:**
1. Go to [clerk.com](https://clerk.com)
2. Create an account and a new application
3. Copy your **Publishable Key** from the dashboard
4. Replace `your_clerk_publishable_key_here` with your actual key

### **Google Gemini AI (Optional):**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Replace `your_gemini_api_key_here` with your actual key

## **✅ What's Fixed:**

1. **CartContext Export** ✅ - Added default export
2. **AI Component** ✅ - Handles missing API key gracefully
3. **Root Layout** ✅ - Shows helpful message instead of crashing
4. **Environment Variables** ✅ - Proper error handling

## **🚀 Run the App:**

```bash
# Clear cache and start
npx expo start --clear
```

## **📱 App Features:**

- ✅ **Modern UI Design** - Beautiful, clean interface
- ✅ **Product Browsing** - Browse and search products
- ✅ **Shopping Cart** - Add/remove items, manage quantities
- ✅ **User Authentication** - Sign up, login, profile management
- ✅ **AI Chat** - Gemini AI integration (with API key)
- ✅ **Responsive Design** - Works on all screen sizes

## **🔧 If You Still See Errors:**

1. **Restart the development server:**
   ```bash
   npx expo start --clear
   ```

2. **Check your `.env` file exists and has the correct format**

3. **Verify API keys are valid**

## **🎨 Your Modern App is Ready!**

The app will work perfectly with or without the API keys. Features that require API keys will show helpful messages instead of crashing. 