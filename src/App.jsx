import React, { useState, useEffect } from 'react';

// --- Mock Data ---
// In a real application, this would come from your API


// --- Helper Components ---
var initialUsers = [];
// SVG Icon for the Crown
const CrownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
        <path d="M12 2L9.23 8.24 2 9.27l5.45 5.32L6.22 22 12 18.27 17.78 22l-1.23-7.41L22 9.27l-7.23-1.03L12 2z" />
    </svg>
);

// Component for the top 3 users
const TopUserCard = ({ user, rank }) => {
    const rankStyles = {
        1: {
            container: 'bg-yellow-400/20 border-yellow-500 scale-110 z-10',
            rankCircle: 'bg-yellow-500',
            crown: 'text-yellow-400',
        },
        2: {
            container: 'bg-slate-300/20 border-slate-400',
            rankCircle: 'bg-slate-400',
        },
        3: {
            container: 'bg-orange-400/20 border-orange-500',
            rankCircle: 'bg-orange-500',
        },
    };

    const style = rankStyles[rank];

    return (
        <div className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${style.container}`}>
            {rank === 1 && <div className="absolute -top-4"><CrownIcon /></div>}
            <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg ${style.rankCircle}`}>
                {rank}
            </div>
            <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x150/e2e8f0/64748b?text=${user.username.charAt(0)}`; }}
            />
            <p className="mt-3 font-bold text-gray-800 text-center truncate w-full">{user.username}</p>
            <p className="text-sm text-yellow-600 font-semibold">{user.points.toLocaleString()}</p>
        </div>
    );
};


// Component for users ranked 4 and below
const UserRow = ({ user, rank, onClaimPoints, onSelectUser, isSelected }) => (
    <div 
        className={`flex items-center p-3 my-2 rounded-lg transition-all duration-200 cursor-pointer ${isSelected ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-white hover:bg-gray-50'}`}
        onClick={() => onSelectUser(user._id)}
    >
        <div className="w-8 text-center text-gray-500 font-bold">{rank}</div>
        <img 
            src={user.avatar} 
            alt={user.username} 
            className="w-12 h-12 rounded-full mx-4 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/48x48/e2e8f0/64748b?text=${user.username.charAt(0)}`; }}
        />
        <div className="flex-grow">
            <p className="font-semibold text-gray-800">{user.username}</p>
            <p className="text-sm text-gray-500">{user.points.toLocaleString()} points</p>
        </div>
        <button 
            onClick={(e) => {
                e.stopPropagation();
                onClaimPoints(user._id);
            }}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-2 px-4 rounded-full hover:from-green-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
        >
            Claim
        </button>
    </div>
);

// Add User Form Component
const AddUserForm = ({ onAddUser }) => {
    const [username, setUsername] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            onAddUser(username.trim(), imageUrl.trim());
            setUsername('');
            setImageUrl('');
        }
        
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-gray-100 rounded-lg mb-4">
            <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter new user's name"
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
            />
          
            <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                Add User
            </button>
        </form>
    );
};


// --- Main App Component ---
export default function App() {


     

 const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://server-a9bp.onrender.com/');
        const data = await res.json();

        const transformedUsers = data.map(user => ({
          _id: user._id,
          username: user.username,
          points: user.points,
          avatar: `https://i.pravatar.cc/150?u=${user._id}`
        }));

        // Sort the transformed users by points in descending order
        const sortedUsers = transformedUsers.sort((a, b) => b.points - a.points);

        // Save to state
        setUsers(sortedUsers);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchData();
  }, []);

  const handleClaimPoints = async (userId) => {
  console.log(`Claiming points for user: ${userId}`);

  try {
    const response = await fetch('https://server-a9bp.onrender.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }), // sending userId in the body
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Points claimed:", data);

      // Optional: Update UI
      const updatedUsers = users.map(user =>
        user._id === userId ? { ...user, points: data.updatedPoints } : user
      );
      updatedUsers.sort((a, b) => b.points - a.points);
      setUsers(updatedUsers);
    } else {
      console.error("Failed to claim points:", data.message);
    }
  } catch (error) {
    console.error("Error during fetch:", error);
  }
};


    const handleAddUser = async (username, imageUrl) => {
    const newUser = {
        username,
        points: 0,
        avatar: imageUrl 
    };

    try {
        const res = await fetch('https://server-a9bp.onrender.com/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        });

        const data = await res.json();
        console.log('User added:', data);

        // ✅ After success, update users state
        setUsers(prevUsers => {
            const updatedUsers = [
                ...prevUsers,
                {
                    _id: data._id, // Make sure backend returns _id
                    username: data.username,
                    points: data.points,
                    avatar: `https://i.pravatar.cc/150?u=${data._id}`,
                }
            ];
            return updatedUsers.sort((a, b) => b.points - a.points);
        });

    } catch (error) {
        console.error('Error adding user:', error);
    }
};


    const topThree = users.slice(0, 3);
    const restOfUsers = users.slice(3);




    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md mx-auto bg-gradient-to-b from-yellow-50 to-orange-50 rounded-3xl shadow-2xl overflow-hidden">
                <header className="p-6 bg-gradient-to-r from-yellow-300 to-orange-300">
                    <h1 className="text-3xl font-bold text-white text-center text-shadow">Weekly Rankings</h1>
                    <p className="text-center text-white/80 text-sm mt-1">Settlement time: 2 days 01:45:29</p>
                </header>

                <main className="p-4">
                    {/* Top 3 Users */}
                    {topThree.length > 0 && (
                        <div className="grid grid-cols-3 items-end gap-2 mb-8">
                            {topThree[1] && <TopUserCard user={topThree[1]} rank={2} />}
                            {topThree[0] && <TopUserCard user={topThree[0]} rank={1} />}
                            {topThree[2] && <TopUserCard user={topThree[2]} rank={3} />}
                        </div>
                    )}
                    
                    {/* Add User Form */}
                    <AddUserForm onAddUser={handleAddUser} />

                    {/* Rest of the Leaderboard */}
                    <div className="space-y-2">
                        {restOfUsers.map((user, index) => (
                            <UserRow 
                                key={user._id} 
                                user={user} 
                                rank={index + 4}
                                onClaimPoints={handleClaimPoints}
                                onSelectUser={setSelectedUserId}
                                isSelected={user._id === selectedUserId}
                            />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
