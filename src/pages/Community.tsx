import React from 'react';
import { Youtube, Instagram, MessageSquare, Twitter } from 'lucide-react';

const SOCIAL_LINKS = [
  {
    name: 'YouTube',
    icon: Youtube,
    color: 'primary',
    url: 'https://youtube.com/@fittrack',
    followers: '50K',
    description: 'Watch workout tutorials and success stories'
  },
  {
    name: 'Instagram',
    icon: Instagram,
    color: 'primary',
    url: 'https://instagram.com/fittrack',
    followers: '100K',
    description: 'Daily motivation and community highlights'
  },
  {
    name: 'Discord',
    icon: MessageSquare,
    color: 'primary',
    url: 'https://discord.gg/fittrack',
    members: '25K',
    description: 'Join our community chat and find workout partners'
  },
  {
    name: 'X (Twitter)',
    icon: Twitter,
    color: 'primary',
    url: 'https://x.com/fittrack',
    followers: '75K',
    description: 'Latest updates and fitness tips'
  }
];

const FEATURED_POSTS = [
  {
    id: 1,
    author: 'John Smith',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800',
    likes: 1234,
    description: 'Just hit a new PR on deadlifts! 💪 #FitnessGoals'
  },
  {
    id: 2,
    author: 'Lebron James',
    image: 'https://images.unsplash.com/photo-1517267667008-3b8018f4b4f7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 856,
    description: 'Morning workout routine with FitTron 🏋️‍♀️'
  },
  {
    id: 3,
    author: 'Mike Johnson',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800',
    likes: 2045,
    description: 'From beginner to advanced in 6 months! #Transformation'
  }
];

export default function Community() {
  return (
    <div className="space-y-8">
      {/* Social Media Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SOCIAL_LINKS.map((platform) => {
          const Icon = platform.icon;
          return (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-dark-card rounded-lg shadow-lg p-6 hover:bg-dark-lighter transition-all
                border border-gray-800 group"
            >
              <div className="flex items-center mb-4">
                <Icon className="h-6 w-6 text-primary-500 mr-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg text-white">{platform.name}</h3>
              </div>
              <p className="text-gray-400 mb-3">{platform.description}</p>
              <div className="text-sm text-primary-500">
                {platform.followers || platform.members} followers
              </div>
            </a>
          );
        })}
      </div>

      {/* Featured Community Posts */}
      <div className="bg-dark-card rounded-lg shadow-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-6">Featured Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_POSTS.map((post) => (
            <div key={post.id} className="bg-dark-lighter rounded-lg overflow-hidden border border-gray-800">
              <img
                src={post.image}
                alt={`Post by ${post.author}`}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="font-medium text-white mb-2">{post.author}</div>
                <p className="text-gray-400 text-sm mb-3">{post.description}</p>
                <div className="flex items-center text-gray-400 text-sm">
                  <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                    <span>❤️</span>
                    <span>{post.likes.toLocaleString()}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Guidelines */}
      <div className="bg-dark-card rounded-lg shadow-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-4">Community Guidelines</h2>
        <div className="prose max-w-none">
          <ul className="list-disc list-inside space-y-2 text-gray-400">
            <li>Be respectful and supportive of all community members</li>
            <li>Share your progress and celebrate others' achievements</li>
            <li>Keep content family-friendly and appropriate</li>
            <li>No spam or self-promotion without permission</li>
            <li>Report any violations to our moderators</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const BODY_FAT_RANGES = [
  {
    range: '5-8%',
    description: 'Competition Ready',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
    value: 6.5
  },
  {
    range: '9-12%',
    description: 'Very Lean',
    image: 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?q=80&w=1000&auto=format&fit=crop',
    value: 10.5
  },
  {
    range: '13-15%',
    description: 'Lean Athletic',
    image: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?q=80&w=1000&auto=format&fit=crop',
    value: 14
  },
  {
    range: '16-18%',
    description: 'Fit',
    image: 'https://images.unsplash.com/photo-1534438097545-a584f2c31b98?q=80&w=1000&auto=format&fit=crop',
    value: 17
  },
  {
    range: '19-23%',
    description: 'Average',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop',
    value: 21
  },
  {
    range: '24-28%',
    description: 'Above Average',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop',
    value: 26
  },
  {
    range: '29-33%',
    description: 'High',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop',
    value: 31
  },
  {
    range: '34-40%',
    description: 'Very High',
    image: 'https://images.unsplash.com/photo-1573879541250-58ae8b322b40?q=80&w=1000&auto=format&fit=crop',
    value: 37
  },
  {
    range: '40+%',
    description: 'Extremely High',
    image: 'https://images.unsplash.com/photo-1559963110-71b394e7494d?q=80&w=1000&auto=format&fit=crop',
    value: 43
  }
];