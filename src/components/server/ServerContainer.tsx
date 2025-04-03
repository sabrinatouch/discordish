import ServerChatView from "./ServerChatView";
import ServerChannelList from "./ServerChannelList";
import ServerUserList from "./ServerUserList";

const ServerContainer: React.FC = () => {
    return (
        <div className="flex h-full w-full">
            <div className="min-w-72 border-r border-t border-discord-darkest">
                <ServerChannelList />
            </div>
            <div className="flex-1 border-t border-discord-darkest">     
                <ServerChatView />
            </div>
            <div className="w-72 border-r border-t border-discord-darkest">
                <ServerUserList />
            </div>
        </div>
    )
}

export default ServerContainer;