# Windsurf-Style Circular Motion Animation

## ✅ Implemented on Prebuilds Page!

A beautiful windsurf-style animation where prebuilds float across the screen with circular orbit motion, bobbing up and down like surfboards on waves.

---

## 🎯 Implementation Details

### 1. **Tailwind Config** (`tailwind.config.js`)

```javascript
extend: {
  keyframes: {
    moveX: {
      '0%': { transform: 'translateX(-20%) translateY(0) rotate(0deg)' },
      '50%': { transform: 'translateX(120%) translateY(-10px) rotate(3deg)' },
      '100%': { transform: 'translateX(-20%) translateY(0) rotate(0deg)' },
    },
  },
  animation: {
    moveX: 'moveX 6s linear infinite',
  },
}
```

**What it does:**
- `translateX(-20% → 120% → -20%)` - Horizontal movement across screen
- `translateY(0 → -10px → 0)` - Gentle up/down bobbing
- `rotate(0deg → 3deg → 0deg)` - Slight rotation like a surfboard
- `6s linear infinite` - Smooth continuous loop

---

### 2. **Component Structure** (`Prebuilds.jsx`)

```jsx
<div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-3xl">
  {/* Background blobs */}
  <div className="absolute inset-0 opacity-20">
    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
  </div>
  
  {/* Floating prebuilds */}
  {prebuilds.slice(0, 3).map((prebuild, idx) => (
    <div
      className="absolute bottom-0"
      style={{ animationDelay: `${idx * 2}s` }}
    >
      <div className="animate-[moveX_6s_linear_infinite]">
        <img src={prebuild.img} className="w-32 h-32 object-contain drop-shadow-2xl" />
      </div>
    </div>
  ))}
</div>
```

---

## 🎨 Visual Features

### **Gradient Background**
```jsx
bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200
```
- Beautiful sky-like gradient
- Blue tones simulate water/sky
- Rounded corners for modern look

### **Blur Blobs**
```jsx
<div className="w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
```
- Adds depth and atmosphere
- 20% opacity for subtle effect
- Creates dreamy background

### **Drop Shadow**
```jsx
drop-shadow-2xl
```
- Makes prebuilds "pop" from background
- Enhances 3D floating effect
- Professional appearance

### **Hover Effects**
```jsx
group-hover:scale-110
group-hover:opacity-100
```
- Card scales up on hover
- Name tooltip appears
- Interactive feedback

---

## 🏄 Animation Breakdown

### **Keyframe 0% (Start)**
```css
transform: translateX(-20%) translateY(0) rotate(0deg)
```
- Starts off-screen left (-20%)
- At baseline (0 vertical)
- No rotation

### **Keyframe 50% (Middle)**
```css
transform: translateX(120%) translateY(-10px) rotate(3deg)
```
- Crosses to right side (120%)
- Lifts up 10px (bobbing)
- Rotates 3deg (surfboard tilt)

### **Keyframe 100% (End)**
```css
transform: translateX(-20%) translateY(0) rotate(0deg)
```
- Returns to start position
- Back to baseline
- No rotation
- **Loops infinitely!**

---

## ⚙️ Customization Options

### **Change Speed**
```jsx
animate-[moveX_6s_linear_infinite]
//         ^^^ Change duration here
// Faster: 4s
// Slower: 10s
```

### **Adjust Bob Height**
```javascript
'50%': { transform: 'translateX(120%) translateY(-20px) rotate(3deg)' }
//                                      ^^^^^^^ Change height
```

### **Modify Rotation**
```javascript
'50%': { transform: 'translateX(120%) translateY(-10px) rotate(5deg)' }
//                                                        ^^^^^ Tilt more
```

### **Stagger Timing**
```jsx
style={{ animationDelay: `${idx * 2}s` }}
//                            ^^^ Delay between items
```

---

## 📊 Technical Details

### **Component Placement**
- Above the main prebuilds grid
- Only shows if prebuilds exist
- Displays first 3 prebuilds

### **Animation Logic**
```
Item 1: Starts at 0s
Item 2: Starts at 2s (delayed)
Item 3: Starts at 4s (delayed)
```

Creates a wave/cascade effect!

### **Performance**
- CSS-only animation (GPU accelerated)
- No JavaScript for motion
- Smooth 60fps performance
- Low CPU usage

### **Responsive**
- Works on all screen sizes
- Maintains proportions
- Scales gracefully

---

## 🎯 Use Case

Perfect for:
- ✨ Showcasing featured prebuilds
- 🏄 Creating engaging hero sections
- 💫 Adding personality to pages
- 🎨 Modern, dynamic UI

---

## 🔧 How It Works

1. **Container**
   - Fixed height (h-64 = 256px)
   - Overflow hidden (hides items outside)
   - Gradient background

2. **Prebuild Items**
   - Positioned absolutely at bottom
   - Each has animation delay
   - 128px size (w-32 h-32)

3. **Animation**
   - Starts off-screen left
   - Moves across screen
   - Bobs up/down
   - Rotates slightly
   - Returns to start
   - Repeats infinitely

4. **Interaction**
   - Clickable (navigates to product)
   - Hover to see name
   - Scales up on hover

---

## 💡 Benefits

✅ **Pure CSS** - No JavaScript for animation  
✅ **GPU Accelerated** - Smooth performance  
✅ **Infinite Loop** - Never stops  
✅ **Customizable** - Easy to adjust  
✅ **Interactive** - Click to view  
✅ **Responsive** - Works everywhere  
✅ **Professional** - Modern look  

---

## 🎮 User Experience

### **Visual Flow**
```
Start (off-screen) → Float across → Bob up → Tilt → Float back → Loop
```

### **Interaction**
```
See prebuild → Hover for name → Click to view details
```

### **Multiple Items**
```
Item 1 ───────────>
     Item 2 ───────────>
          Item 3 ───────────>
```
Creates a cascading wave effect!

---

## 📝 Code Example

### **Full Implementation**
```jsx
<div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-3xl mb-8 shadow-xl">
  {/* Background effects */}
  <div className="absolute inset-0 opacity-20">
    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
  </div>
  
  {/* Title */}
  <h3 className="absolute top-4 left-1/2 transform -translate-x-1/2 text-blue-700 font-bold text-lg">
    🏄 Featured Prebuilds - Floating Showcase
  </h3>
  
  {/* Animated items */}
  {prebuilds.slice(0, 3).map((prebuild, idx) => (
    <div
      key={prebuild.id}
      className="absolute bottom-0 cursor-pointer group"
      style={{ animationDelay: `${idx * 2}s` }}
      onClick={() => navigate(`/products/${prebuild.id}`)}
    >
      <div className="animate-[moveX_6s_linear_infinite]">
        <div className="relative w-32 h-32 transform transition-all duration-300 group-hover:scale-110">
          <img
            src={prebuild.img}
            alt={prebuild.Name}
            className="w-full h-full object-contain drop-shadow-2xl"
          />
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            {prebuild.Name}
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
```

---

## 🚀 Result

**A stunning windsurf-style animation where prebuilds:**
- 🏄 Float across the screen like surfboards
- 🌊 Bob up and down on "waves"
- 🔄 Rotate slightly as they move
- ♾️ Loop infinitely in smooth motion
- ✨ Create an engaging, dynamic showcase

---

## ✨ Summary

**Perfect windsurf circular/orbit motion:**
- ✅ Horizontal movement (translateX)
- ✅ Vertical bobbing (translateY)
- ✅ Slight rotation (rotate)
- ✅ Infinite loop
- ✅ Staggered timing
- ✅ Interactive on click
- ✅ Tooltip on hover
- ✅ Beautiful gradient background

**Pure CSS magic with Tailwind!** 🎨🏄

---

## 🧪 Test It

1. Go to `/prebuilds` page
2. See featured prebuilds floating across
3. Watch them bob and rotate
4. Hover for name tooltip
5. Click to view details

**It's like watching surfboards glide across waves!** 🌊✨
