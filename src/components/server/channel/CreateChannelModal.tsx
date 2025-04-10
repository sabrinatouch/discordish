import React, { useState } from 'react';

const CreateChannelModal: React.FC = () => {
    const [newChannelName, setNewChannelName] = useState('');

    const handleCreateChannel = () => {
        console.log("handleCreateChannel");
    }

    return (
        <>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto px-4">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="bg-[#2B2D31] p-8 rounded-md shadow-2xl w-full max-w-[480px]">
                        <div className="text-left mb-8">
                            <h2 className="text-2xl font-bold text-white">Create Channel</h2>
                            <p className="text-[#B5BAC1] mt-1">(ex. "introductions", "server info", "memes")</p>
                        </div>
                        <form onSubmit={handleCreateChannel} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="uppercase block text-xs text-left font-bold text-[#B5BAC1] mb-2">
                                    Channel Name
                                </label>
                                <input
                                id="email"
                                type="email"
                                value={newChannelName}
                                onChange={(e) => setNewChannelName(e.target.value)}
                                className="w-full px-3 py-2 bg-[#1E1F22] text-[#DBDEE1] placeholder-[#949BA4] rounded-[3px] border border-[#1E1F22] focus:border-[#5865F2] focus:ring-0 text-sm"
                                placeholder="new-channel"
                                />
                            </div>
                            <div className="mt-2 text-right">
                                <button
                                    type="submit"
                                    className="w-35"
                                >
                                    <div className="py-2.5 px-4 text-discord-accent rounded-[3px] font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </div>
                                </button>
                                <button
                                    type="submit"
                                    className="w-35"
                                >
                                    <div className="py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-[3px] font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Create Channel
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateChannelModal;