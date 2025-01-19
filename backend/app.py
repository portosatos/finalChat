
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import re

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Base configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    avatar_url = db.Column(db.String(255), default="")
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)


class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


class ChatMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)


# Helper Functions
def sanitize_input(input_str):
    return re.sub(r"[;'\"]", '', input_str)


# User Routes
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = sanitize_input(data.get('username'))
    password = sanitize_input(data.get('password'))

    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required.'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Username already exists.'}), 400

    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'success': True, 'message': 'User registered successfully.'})


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = sanitize_input(data.get('username'))
    password = sanitize_input(data.get('password'))

    user = User.query.filter_by(username=username, password=password).first()
    if not user:
        return jsonify({'success': False, 'message': 'Invalid username or password.'}), 401

    return jsonify({'success': True, 'userId': user.id, 'message': 'Login successful.'})


@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{'id': user.id, 'username': user.username, 'avatar_url': user.avatar_url} for user in users])


@app.route('/profile/update', methods=['POST'])
def update_profile():
    data = request.json
    user_id = data.get('user_id')
    avatar_url = data.get('avatar_url')
    username = data.get('username')

    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found.'}), 404

    if avatar_url:
        user.avatar_url = avatar_url
    if username:
        user.username = username

    db.session.commit()
    return jsonify({'success': True, 'message': 'Profile updated successfully.'})


@app.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found.'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username,
        'avatar_url': user.avatar_url,
        'joined_at': user.joined_at
    })


# Chat Routes
@app.route('/chats', methods=['GET', 'POST'])
def chats():
    if request.method == 'POST':
        data = request.json
        chat_name = sanitize_input(data.get('chat_name'))
        user_ids = data.get('user_ids', [])

        if not chat_name:
            return jsonify({'success': False, 'message': 'Chat name is required.'}), 400

        new_chat = Chat(name=chat_name)
        db.session.add(new_chat)
        db.session.commit()

        for user_id in user_ids:
            chat_member = ChatMember(chat_id=new_chat.id, user_id=user_id)
            db.session.add(chat_member)

        db.session.commit()
        return jsonify({'success': True, 'message': 'Chat created successfully.', 'chat_id': new_chat.id})

    chats = Chat.query.all()
    return jsonify([{'id': chat.id, 'name': chat.name, 'created_at': chat.created_at} for chat in chats])


@app.route('/chats/<int:chat_id>/add_user', methods=['POST'])
def add_user_to_chat(chat_id):
    data = request.json
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'success': False, 'message': 'User ID is required.'}), 400

    chat_member = ChatMember(chat_id=chat_id, user_id=user_id)
    db.session.add(chat_member)
    db.session.commit()
    return jsonify({'success': True, 'message': 'User added to chat.'})


@app.route('/chats/<int:chat_id>/remove_user', methods=['POST'])
def remove_user_from_chat(chat_id):
    data = request.json
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'success': False, 'message': 'User ID is required.'}), 400

    chat_member = ChatMember.query.filter_by(chat_id=chat_id, user_id=user_id).first()
    if chat_member:
        db.session.delete(chat_member)
        db.session.commit()
        return jsonify({'success': True, 'message': 'User removed from chat.'})

    return jsonify({'success': False, 'message': 'User not found in chat.'}), 404


@app.route('/user/<int:user_id>/chats', methods=['GET'])
def get_user_chats(user_id):
    user_chats = db.session.query(Chat).join(ChatMember).filter(ChatMember.user_id == user_id).all()
    return jsonify([{'id': chat.id, 'name': chat.name, 'created_at': chat.created_at} for chat in user_chats])


@app.route('/chats/<int:chat_id>/messages', methods=['GET', 'POST'])
def chat_messages(chat_id):
    if request.method == 'GET':
        user_id = request.args.get('user_id')

        if not user_id:
            return jsonify({'success': False, 'message': 'User ID is required.'}), 400

        is_member = ChatMember.query.filter_by(chat_id=chat_id, user_id=user_id).first()
        if not is_member:
            return jsonify({'success': False, 'message': 'Access denied.'}), 403

        messages = db.session.query(
            Message.id,
            Message.content,
            Message.timestamp,
            User.username,
            User.avatar_url
        ).join(User, Message.user_id == User.id).filter(Message.chat_id == chat_id).all()

        return jsonify([
            {
                'id': message.id,
                'username': message.username,
                'avatar_url': message.avatar_url,
                'content': message.content,
                'timestamp': message.timestamp
            } for message in messages
        ])

    if request.method == 'POST':
        data = request.json
        user_id = data.get('user_id')
        content = sanitize_input(data.get('content'))

        # Ensure the user is a member of the chat
        is_member = ChatMember.query.filter_by(chat_id=chat_id, user_id=user_id).first()
        if not is_member:
            return jsonify({'success': False, 'message': 'Access denied. Only chat members can send messages.'}), 403

        if not content or len(content) > 100:
            return jsonify({'success': False, 'message': 'Invalid message content.'}), 400

        new_message = Message(chat_id=chat_id, user_id=user_id, content=content)
        db.session.add(new_message)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Message sent successfully.'})


@app.route('/chats/<int:chat_id>/members', methods=['GET'])
def get_chat_members(chat_id):
    members = db.session.query(User.id, User.username).join(ChatMember, User.id == ChatMember.user_id).filter(ChatMember.chat_id == chat_id).all()
    member_list = [{'id': member.id, 'username': member.username} for member in members]
    return jsonify({
        'member_count': len(member_list),
        'members': member_list
    })


@app.route('/analytics/top-users', methods=['GET'])
def top_users():
    top_users = db.session.query(
        User.username,
        db.func.count(Message.id).label('message_count')
    ).join(Message, User.id == Message.user_id).group_by(User.username).order_by(db.desc('message_count')).limit(10).all()

    return jsonify([{'username': user.username, 'message_count': user.message_count} for user in top_users])


@app.route('/analytics/user-activity', methods=['GET'])
def user_activity():
    user_id = request.args.get('user_id')
    activity_type = request.args.get('type')  # 'daily', 'hourly', 'minutely'

    if not user_id or not activity_type:
        return jsonify({'success': False, 'message': 'Missing parameters'}), 400

    base_query = db.session.query(
        db.func.strftime('%Y-%m-%d', Message.timestamp).label('time_group'),
        db.func.count(Message.id).label('message_count')
    ).filter(Message.user_id == user_id)

    if activity_type == 'daily':
        base_query = base_query.group_by('time_group')
    elif activity_type == 'hourly':
        base_query = base_query.group_by(db.func.strftime('%Y-%m-%d %H', Message.timestamp))
    elif activity_type == 'minutely':
        base_query = base_query.group_by(db.func.strftime('%Y-%m-%d %H:%M', Message.timestamp))
    else:
        return jsonify({'success': False, 'message': 'Invalid type'}), 400

    results = base_query.order_by('time_group').all()
    return jsonify([{'time_group': row[0], 'message_count': row[1]} for row in results])


@app.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found.'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username,
        'avatar_url': user.avatar_url,
        'joined_at': user.joined_at
    })


@app.route('/chat/<int:chat_id>', methods=['GET'])
def get_chat(chat_id):
    chat = Chat.query.get(chat_id)
    if not chat:
        return jsonify({'success': False, 'message': 'Chat not found.'}), 404

    return jsonify({
        'id': chat.id,
        'name': chat.name,
        'created_at': chat.created_at
    })


# Initialize Database and Run App
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)