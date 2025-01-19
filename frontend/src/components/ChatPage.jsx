import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import CreateChatModal from './CreateChatModal';

function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [showCreateChatModal, setShowCreateChatModal] = useState(false);

  const openCreateChatModal = () => setShowCreateChatModal(true);
  const closeCreateChatModal = () => setShowCreateChatModal(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Верхняя панель */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#2A2F33', color: '#fff' }}>
        <h2>Chat App</h2>
        <div>
          <button onClick={() => (window.location.href = '/analytics')} style={{ marginRight: '10px' }}>
            Analytics
          </button>
          <button onClick={() => (window.location.href = '/profile')} style={{ marginRight: '10px' }}>
            Profile
          </button>
          <button onClick={openCreateChatModal}>Create Chat</button>
        </div>
      </header>

      {/* Контент */}
      <div style={{ display: 'flex', flexGrow: 1 }}>
        {/* Левая панель */}
        <div style={{ width: '300px', borderRight: '1px solid #ccc', background: '#1E1E1E', color: '#fff', overflowY: 'auto' }}>
          <ChatList onSelectChat={(chatId) => setSelectedChatId(chatId)} />
        </div>

        {/* Правая панель */}
        <div style={{ flexGrow: 1, overflowY: 'auto', background: '#121212', color: '#fff' }}>
          {selectedChatId ? (
            <ChatWindow chatId={selectedChatId} />
          ) : (
            <div style={{ textAlign: 'center', paddingTop: '20px' }}>Select a chat to start messaging</div>
          )}
        </div>
      </div>

      {/* Модальное окно создания чата */}
      {showCreateChatModal && <CreateChatModal onClose={closeCreateChatModal} />}
    </div>
  );
}

export default ChatPage;
