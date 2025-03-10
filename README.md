# 🍕 Slice Streaming Platform

Slice is a video streaming platform with a unique "slice" allocation system that allows users to support their favorite content creators by allocating slices of their subscription.

## Features

### 🍕 Interactive Slice Allocation
- **Pizza Slice Visualization**: Allocate "slices" of your subscription represented as pizza slices
- **Animated Slices**: Visual feedback with animations when allocating slices
- **Dynamic Allocation**: Adjust your support for content creators in real-time

### 👤 User Profiles
- **Pizza Avatar**: Profile picture shows available slices as a pizza
- **Slice History**: Track your allocation history with detailed statistics
- **Impact Dashboard**: See the impact of your slice allocations

### 🎬 Brand Management
- **Brand Discovery**: Explore content creator brands in various categories
- **Brand Profiles**: Detailed brand pages with content, stats, and following functionality
- **Brand Dashboard**: Analytics, content management, and settings for brands

### 👔 Partnership System
- **Partnership Applications**: Apply to become a verified partner
- **Application Status**: Track your application progress
- **Partner Benefits**: Access to analytics and brand management tools

## Project Structure

### Backend
- **Models**: Mongoose schemas for User, Video, Subscription, Brand, etc.
- **Routes**: API endpoints for all features
- **Middleware**: Authentication and other utilities
- **Database**: MongoDB with Mongoose ODM

### Frontend
- **React Components**: Modular UI components
- **Context API**: State management
- **CSS Modules**: Styling with component-scoped CSS
- **Vite**: Build tool and development server

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/slice.git
cd slice
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../streaming-platform
npm install
```

4. Set up environment variables
Create a `.env` file in the `backend` directory with:
```
MONGODB_URI=mongodb://localhost:27017/slice
JWT_SECRET=your_jwt_secret
PORT=3002
```

### Running the Application

1. Start MongoDB (if using local installation)

2. Run the setup and test script
```bash
cd backend
./setup-and-test.sh
```

3. Start the backend server
```bash
node start-server.js
```

4. Start the frontend development server
```bash
cd ../streaming-platform
npm run dev
```

5. Open your browser to `http://localhost:5173`

## Testing the Features

### Slice Allocation
1. Browse videos on the home page
2. Click on a video to view it
3. Use the pizza slice allocator to allocate slices to the video

### User Profile
1. Click on your profile avatar in the navbar
2. Go to your profile page to see your slice history
3. View statistics about your slice allocations

### Brands
1. Navigate to the Brands page from the navbar
2. Browse brands by category
3. Click on a brand to view their profile
4. Follow brands you're interested in

### Brand Dashboard
1. Apply for partnership on the Partnership page
2. Once approved, access your brand dashboard
3. View analytics, manage content, and adjust settings

## Technical Implementation

### Slice Allocation System
The slice allocation system uses a subscription model where users have a certain number of "slices" they can allocate to videos. This is visualized as a pizza, with each slice representing a portion of the user's subscription.

### Pizza Avatar
The pizza avatar component dynamically renders a pizza where each slice represents an available slice the user can allocate. The number of slices is determined by the user's subscription level.

### Brand System
Brands represent content creators on the platform. They have profiles, can upload videos, and receive slice allocations from users. Verified brands have access to the brand dashboard with analytics and content management tools.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Pizza emoji for inspiration 🍕
- React Team for the awesome UI library
- MongoDB Team for the database
