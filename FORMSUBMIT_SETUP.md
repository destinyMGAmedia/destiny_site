# FormSubmit Setup Guide

This document explains how to set up and manage the FormSubmit email forms for Destiny Mission Global Assembly website.

## 📧 Email Addresses Required

You'll need three dedicated email addresses for the church:

1. **info@dmga.org** - General contact inquiries
2. **prayer@dmga.org** - Prayer requests
3. **testimonies@dmga.org** - Testimony submissions

## 🚀 First-Time Setup (Required)

FormSubmit requires email verification on the **first submission** to each email address. Here's how to complete the setup:

### Step 1: Submit Test Forms

After deploying the website, visit each page and submit a test form:

1. Navigate to `/prayer` and submit a test prayer request
2. Navigate to `/testimonies` and submit a test testimony
3. Navigate to `/contact` and submit a test contact message

### Step 2: Verify Email Addresses

1. Check the inbox for each email address (info@, prayer@, testimonies@)
2. You'll receive an email from FormSubmit with subject: **"Activate Your Form"**
3. Click the activation link in each email
4. Once activated, the form will start working immediately

**⚠️ Important:** Until you click the activation link, forms will NOT work for that email address.

## 📋 How It Works

### For Prayer Requests (`/prayer`)
- **Destination:** prayer@dmga.org
- **Subject Line:** "New Prayer Request from DMGA Website"
- **Fields Collected:**
  - Name (required)
  - Email (optional)
  - Phone (optional)
  - Prayer Category (required)
  - Prayer Request (required)
  - Urgent flag (optional)
- **Success Redirect:** `/prayer?success=true`

### For Testimonies (`/testimonies`)
- **Destination:** testimonies@dmga.org
- **Subject Line:** "New Testimony Submission from DMGA Website"
- **Fields Collected:**
  - Name (required)
  - Email (required for verification)
  - Category (required)
  - Testimony (required)
  - Permission to publish (required checkbox)
  - Anonymous option (optional)
- **Success Redirect:** `/testimonies?success=true`

### For Contact Messages (`/contact`)
- **Destination:** info@dmga.org
- **Subject Line:** "New Contact Form Submission from DMGA Website"
- **Fields Collected:**
  - First Name (required)
  - Last Name (required)
  - Email (required)
  - Phone (optional)
  - Subject (required)
  - Message (required)
- **Success Redirect:** `/contact?success=true`

## 🛡️ Security Features

All forms include:
- **Honeypot field** (`_honey`) - Hidden field to catch spam bots
- **Captcha disabled** - Using honeypot instead for better UX
- **Custom subject lines** - Easy to identify which form was submitted

## 📨 Managing Submissions

### Recommended Email Setup

1. **Create Email Filters/Rules:**
   - Tag "Urgent" for prayer requests marked as urgent
   - Separate folders for each form type
   - Auto-forward to team members as needed

2. **Assign Team Members:**
   - Prayer Team → Monitor prayer@dmga.org
   - Admin/Pastor → Monitor testimonies@dmga.org for approval
   - Church Office → Monitor info@dmga.org

3. **Response Templates:**
   - Create template responses for common inquiries
   - Prayer confirmation template
   - Testimony approval/rejection templates

### Processing Testimonies

1. Review testimony submission email
2. Verify authenticity (email/phone follow-up if needed)
3. If approved:
   - Copy testimony text
   - Edit `src/pages/Testimonies.jsx`
   - Add to `featuredTestimonies` array
   - Use first name only if marked anonymous
4. Redeploy website to show new testimony

**Example:**
```javascript
const featuredTestimonies = [
  {
    name: "John D.", // or "Anonymous" if requested
    testimony: "Copy the testimony text here",
    date: "February 2025"
  },
  // ... existing testimonies
]
```

## 🔄 Switching to Backend Later

When you're ready to add a database:

1. **Export Emails:**
   - Download all emails from each inbox
   - Parse and import into database

2. **Update Forms:**
   - Change `action` URL from FormSubmit to your API endpoint
   - Keep the same field names for compatibility

3. **Add Admin Panel:**
   - Build approval workflow for testimonies
   - Auto-display approved testimonies
   - Prayer request management dashboard

## ❓ Troubleshooting

### Form Not Working
- **Check:** Did you activate the email address via the verification link?
- **Check:** Is the email address spelled correctly in the form action?
- **Check:** Are you testing from the deployed URL (not localhost)?

### Emails Going to Spam
- **Solution:** Add FormSubmit to your email whitelist
- **Solution:** Check spam folder after first activation
- **Domain:** formsubmit.co

### Success Message Not Showing
- **Check:** Is the redirect URL correct in the `_next` hidden field?
- **Check:** Is the website deployed at the expected domain?

## 🔗 FormSubmit Documentation

For more information: https://formsubmit.co/

## 📞 Support

If you encounter issues:
1. Check FormSubmit's documentation
2. Verify email activation status
3. Test with a different email service if needed
4. Consider alternatives: Formspree, Netlify Forms, or EmailJS

---

**Last Updated:** January 2025

