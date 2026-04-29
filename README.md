# Alumni Connect V2 - Client

The frontend for the Alumni Connect V2 platform, a modern and responsive web application designed for professional networking between alumni and students. Built with Next.js 15 and Tailwind CSS 4.

##  Features

- **Modern UI/UX**: Premium design with glassmorphism, smooth animations (Framer Motion), and a sleek dark/light mode.
- **Real-time Chat**: Interactive messaging interface with live updates and notifications.
- **AI Career Hub**: 
  - Interactive AI Chat Assistant for career guidance.
  - Resume extraction and analysis dashboard.
- **Dynamic Feed**: Social feed for posts, likes, and comments.
- **Profile Management**: Detailed user profiles for students and alumni.
- **State Management**: Robust state handling using Redux Toolkit.

##  Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **API Client**: [Axios](https://axios-http.com/)
- **Real-time**: [Socket.io-client](https://socket.io/)

##  Getting Started

### Prerequisites

- Node.js (v18+)
- Backend server running (see [Server README](../server/README.md))

### Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root of the `client` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

##  Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components (Buttons, Inputs, Modals, etc.).
- `lib/`: Helper functions, Redux slices, and API configurations.
- `assets/`: Static files and images.
- `public/`: Publicly accessible static assets.

##  License

This project is private and for educational purposes.
