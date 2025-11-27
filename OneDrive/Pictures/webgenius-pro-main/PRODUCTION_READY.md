# AtherWeb Agency - Production Deployment Guide

## Recent Updates

### 1. Live Projects Section ✅
- **Removed:** WorkFlowX project
- **Showing:** Only Watch Store PK (http://watchstorepk.onrender.com)
- **Layout:** Single centered column with 400px iframe
- **Section Title:** "Live Projects" with description
- **Live URL:** Directly embedded for instant viewing

### 2. Meeting Booking System ✅
- **Email Integration:** Now sends meeting requests via EmailJS
- **Same Credentials:** Uses OrderForm's EmailJS setup
  - Service ID: `service_bopwq39`
  - Template ID: `template_1ubs0z8`
  - Public Key: `NP2Sat5tqcJqQqoQ2`
- **Success Flow:** Redirects to home after 3 seconds
- **Email Fields Mapped:**
  - from_name → Name
  - from_email → Email
  - phone → WhatsApp Number
  - company → Company/Business
  - service → Service Interested In
  - budget → Package
  - description → Message
  - deadline → Preferred Date/Time
  - meeting_type → "Consultation Meeting Request"

### 3. Portfolio Integration ✅
- **Added to Portfolio Constants:**
  - WorkFlowX (Web Application)  
  - Watch Store PK (E-commerce)
- **Images Generated:** Preview images for both projects

## Production Checklist

### Environment Setup
- ✅ EmailJS configured with hardcoded credentials
- ✅ No .env variables needed (credentials in code)
- ✅ All dependencies installed via pnpm

### Build & Deploy
```bash
# Test build
npm run build

# Start production server
npm start
```

### GitHub Repository
- **Remote:** https://github.com/ather123970/webgenius-pro.git
- **Branch:** main
- **Status:** Ready to push

### Render Deployment
1. Connect GitHub repository to Render
2. Build command: `npm run build`
3. Start command: `npm start`
4. No environment variables needed

## Page Structure
1. Hero
2. Services
3. Deals
4. Team
5. Pricing
6. Process
7. Testimonials
8. **Live Projects** (Watch Store only)
9. Order Form (EmailJS ✅)
10. Contact

## Special Pages
- **/book-meeting** - Consultation booking with EmailJS ✅
- **/order** - Order form with EmailJS ✅

## Contact Information
- **Email:** muhammadather212437@gmail.com
- **WhatsApp:** +92 343 4153736
- **GitHub:** ather123970

## Notes
- Portfolio page may need testing (user reported it "didn't work")
- All EmailJS emails go to: muhammadather212437@gmail.com
- Watch Store may load slowly (hosted on Render free tier)
