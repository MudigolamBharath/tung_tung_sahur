# FitTron - AI-Powered Fitness Platform

FitTron is a modern, AI-powered fitness platform that provides personalized workout experiences, real-time form correction, and a global fitness community.

## Features

- AI-powered workout analysis and form correction
- Real-time pose detection and feedback
- Personalized training programs
- Progress tracking and analytics
- Global fitness community and leaderboards
- Nutrition tracking and recommendations

## Tech Stack

- Frontend: React + TypeScript + Vite
- Styling: TailwindCSS
- Animation: Framer Motion
- 3D Visualization: Spline
- Authentication: Supabase Auth
- Database: Supabase
- AI Integration: Python backend with pose detection

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/fittron.git
cd fittron
```

2. Install frontend dependencies
```bash
npm install
```

3. Install Python backend dependencies
```bash
pip install -r requirements.txt
```

4. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

5. Start the development server
```bash
# Start frontend
npm run dev

# Start backend
python main.py
```

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── lib/           # Utility functions and configurations
│   ├── pages/         # Page components
│   └── types/         # TypeScript type definitions
├── supabase/          # Supabase migrations and configurations
└── main.py           # Python backend for AI processing
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.