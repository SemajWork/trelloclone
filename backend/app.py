from tarfile import data_filter
from flask import Flask, render_template, request, redirect, url_for, jsonify, make_response, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import bcrypt
import jwt
import uuid
from datetime import datetime, timezone, timedelta
from functools import wraps
from flask_cors import CORS
from flask_jwt_extended import JWTManager, set_access_cookies,set_refresh_cookies,unset_jwt_cookies,create_refresh_token,create_access_token, jwt_required, get_jwt_identity, get_jwt
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app,
     resources={r"/api/*":{"origins":"http://localhost:5173"}},
     supports_credentials=True)

#JWT initialization
jwt = JWTManager(app)

# Configuration - UPDATED
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = False  # False for development
app.config['JWT_COOKIE_CSRF_PROTECT'] = False
app.config['JWT_ACCESS_COOKIE_PATH'] = '/api/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/api/'
app.config['JWT_COOKIE_SAMESITE'] = 'Lax'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Database setup
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True)
    username = db.Column(db.String(100) ,nullable=False)
    email = db.Column(db.String(70), unique=True)
    password = db.Column(db.String(80) ,nullable=False)

    board=db.relationship('Board',backref='user',lazy=True)
    board_memberships=db.relationship('BoardMember',backref='user',lazy=True)

class BoardMember(db.Model):
    user_id=db.Column(db.Integer,db.ForeignKey('user.id'),primary_key=True)
    board_id=db.Column(db.Integer,db.ForeignKey('board.id'),primary_key=True)
    role=db.Column(db.String(20))

class Board(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30),nullable=False)
    user_id= db.Column(db.Integer, db.ForeignKey('user.id'))
    column = db.relationship('Column',backref='board',lazy=True)
    board_memberships=db.relationship('BoardMember',backref='board',lazy=True)

class Column(db.Model):
    id= db.Column(db.Integer,primary_key=True)
    name= db.Column(db.String(30),nullable=False)
    board_id = db.Column(db.Integer,db.ForeignKey('board.id'))
    task = db.relationship('Task',backref='column', lazy=True)

class Task(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(200),nullable=False)
    column_id = db.Column(db.Integer, db.ForeignKey('column.id'))
    comment = db.relationship('Comment',backref='task',lazy=True)

class Comment(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    name=db.Column(db.String(150))
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'))

with app.app_context():
    db.create_all()

# Authentication Routes
@app.route('/api/signup',methods=['POST'])
def register():
    if request.method == 'POST':
        data=request.get_json()
        username=data['username']
        password=data['password']
        email = data['email']

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'message':'User already exists. Please login.'}), 400
        
        hashed_password = generate_password_hash(password)
        new_user = User(public_id=str(uuid.uuid4()),username=username,email=email,password=hashed_password)

        try:
            db.session.add(new_user)
            db.session.commit()
            return jsonify({'message':'User successfully created'}), 201
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message':'User creation failed'}), 501
    
@app.route('/api/login',methods=['POST'])
def login():
    data=request.get_json()
    inputUsername=data['username'] 
    inputPassword=data['password']

    user=User.query.filter_by(username=inputUsername).first()

    if(user and check_password_hash(user.password,inputPassword)):
        refresh_token = create_refresh_token(identity=user.id,expires_delta=(timedelta(minutes=30)))
        access_token = create_access_token(identity=user.id,expires_delta=timedelta(minutes=5))
        
        response = make_response(jsonify({
            "message": "Successful Login!",
            "username": user.username
        }))
        
        set_refresh_cookies(response, refresh_token)
        set_access_cookies(response, access_token)

        print(f"Login successful for user: {user.username}")
        return response
    else:
        print(f"Login failed for username: {inputUsername}")
        return jsonify({'message':'Login Failed'}), 401

@app.route('/api/logout',methods=['POST'])
def logout():
    response = make_response(jsonify({
        "message": "Logged out successfully"
    }))
    
    unset_jwt_cookies(response)
    return response

@app.route('/api/get_name',methods=['GET'])
@jwt_required()
def get_name():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()
    if user: 
        return jsonify({'message': 'User found', 'name': user.username})    
    else:
        return jsonify({'message':'User not found'}), 404

@app.route('/api/refresh',methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    newAccessToken = create_access_token(identity=user_id, expires_delta=(timedelta(minutes=5)))

    response= make_response(jsonify({
        "message":"Token refreshed successfully"
    }))
    set_access_cookies(response,newAccessToken)
    
    print(f"Token refreshed for user: {user_id}")
    return response

# Board Routes
@app.route('/api/board',methods=['POST','GET'])
@jwt_required()
def board():
    user_id = get_jwt_identity()
    
    if request.method == "POST":
        data = request.get_json()
        new_board = Board(name=data['name'], user_id=user_id)
        try:
            db.session.add(new_board)
            db.session.commit()
            return jsonify({
                'message': 'Board created successfully!',
                'board': {
                    'id': new_board.id,
                    'name': new_board.name,
                    'user_id': new_board.user_id
                }
            }), 201
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message':'Board creation failed'}), 500
    
    elif request.method == "GET":
        # Get all boards for the current user
        user_boards = Board.query.filter_by(user_id=user_id).all()
        boards_data = []
        for board in user_boards:
            boards_data.append({
                'id': board.id,
                'name': board.name,
                'user_id': board.user_id
            })
        return jsonify({
            'message': 'Boards retrieved successfully',
            'boards': boards_data
        }), 200

@app.route('/api/board/<int:board_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def board_detail(board_id):
    user_id = get_jwt_identity()
    board = Board.query.filter_by(id=board_id, user_id=user_id).first()
    
    if not board:
        return jsonify({'message': 'Board not found or access denied'}), 404
    
    if request.method == "GET":
        return jsonify({
            'id': board.id,
            'name': board.name,
            'user_id': board.user_id
        }), 200
    
    elif request.method == "PUT":
        data = request.get_json()
        board.name = data.get('name', board.name)
        try:
            db.session.commit()
            return jsonify({'message': 'Board updated successfully'}), 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message': 'Board update failed'}), 500
    
    elif request.method == "DELETE":
        try:
            db.session.delete(board)
            db.session.commit()
            return jsonify({'message': 'Board deleted successfully'}), 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message': 'Board deletion failed'}), 500

# Column Routes
@app.route('/api/column', methods=['POST', 'GET'])
@jwt_required()
def column():
    user_id = get_jwt_identity()
    
    if request.method == "POST":
        data = request.get_json()
        board_id = data['board_id']
        
        # Verify user owns the board
        board = Board.query.filter_by(id=board_id, user_id=user_id).first()
        if not board:
            return jsonify({'message': 'Board not found or access denied'}), 404
        
        new_column = Column(name=data['name'], board_id=board_id)
        try:
            db.session.add(new_column)
            db.session.commit()
            return jsonify({
                'message': 'Column created successfully!',
                'column': {
                    'id': new_column.id,
                    'name': new_column.name,
                    'board_id': new_column.board_id
                }
            }), 201
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message': 'Column creation failed'}), 500
    
    elif request.method == "GET":
        board_id = request.args.get('board_id')
        if not board_id:
            return jsonify({'message': 'board_id parameter required'}), 400
        
        # Verify user owns the board
        board = Board.query.filter_by(id=board_id, user_id=user_id).first()
        if not board:
            return jsonify({'message': 'Board not found or access denied'}), 404
        
        columns = Column.query.filter_by(board_id=board_id).all()
        columns_data = []
        for column in columns:
            columns_data.append({
                'id': column.id,
                'name': column.name,
                'board_id': column.board_id
            })
        return jsonify({
            'message': 'Columns retrieved successfully',
            'columns': columns_data
        }), 200

@app.route('/api/column/<int:column_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def column_detail(column_id):
    user_id = get_jwt_identity()
    column = Column.query.get(column_id)
    
    if not column:
        return jsonify({'message': 'Column not found'}), 404
    
    # Verify user owns the board that contains this column
    board = Board.query.filter_by(id=column.board_id, user_id=user_id).first()
    if not board:
        return jsonify({'message': 'Access denied'}), 403
    
    if request.method == "GET":
        return jsonify({
            'id': column.id,
            'name': column.name,
            'board_id': column.board_id
        }), 200
    
    elif request.method == "PUT":
        data = request.get_json()
        column.name = data.get('name', column.name)
        try:
            db.session.commit()
            return jsonify({'message': 'Column updated successfully'}), 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message': 'Column update failed'}), 500
    
    elif request.method == "DELETE":
        try:
            db.session.delete(column)
            db.session.commit()
            return jsonify({'message': 'Column deleted successfully'}), 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message': 'Column deletion failed'}), 500

# Task Routes
@app.route('/api/task', methods=['POST', 'GET'])
@jwt_required()
def task():
    user_id = get_jwt_identity()
    
    if request.method == "POST":
        data = request.get_json()
        column_id = data['column_id']
        
        # Verify user owns the board that contains this column
        column = Column.query.get(column_id)
        if not column:
            return jsonify({'message': 'Column not found'}), 404
        
        board = Board.query.filter_by(id=column.board_id, user_id=user_id).first()
        if not board:
            return jsonify({'message': 'Access denied'}), 403
        
        new_task = Task(name=data['name'], column_id=column_id)
        try:
            db.session.add(new_task)
            db.session.commit()
            return jsonify({
                'message': 'Task created successfully!',
                'task': {
                    'id': new_task.id,
                    'name': new_task.name,
                    'column_id': new_task.column_id
                }
            }), 201
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message': 'Task creation failed'}), 500
    
    elif request.method == "GET":
        column_id = request.args.get('column_id')
        if not column_id:
            return jsonify({'message': 'column_id parameter required'}), 400
        
        # Verify user owns the board that contains this column
        column = Column.query.get(column_id)
        if not column:
            return jsonify({'message': 'Column not found'}), 404
        
        board = Board.query.filter_by(id=column.board_id, user_id=user_id).first()
        if not board:
            return jsonify({'message': 'Access denied'}), 403
        
        tasks = Task.query.filter_by(column_id=column_id).all()
        tasks_data = []
        for task in tasks:
            tasks_data.append({
                'id': task.id,
                'name': task.name,
                'column_id': task.column_id
            })
        return jsonify({
            'message': 'Tasks retrieved successfully',
            'tasks': tasks_data
        }), 200

@app.route('/api/task/<int:task_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def task_detail(task_id):
    user_id = get_jwt_identity()
    task = Task.query.get(task_id)
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    # Verify user owns the board that contains this task
    column = Column.query.get(task.column_id)
    board = Board.query.filter_by(id=column.board_id, user_id=user_id).first()
    if not board:
        return jsonify({'message': 'Access denied'}), 403
    
    if request.method == "GET":
        return jsonify({
            'id': task.id,
            'name': task.name,
            'column_id': task.column_id
        }), 200
    
    elif request.method == "PUT":
        data = request.get_json()
        task.name = data.get('name', task.name)
        # Allow moving task to different column if specified
        if 'column_id' in data:
            new_column = Column.query.get(data['column_id'])
            if new_column and Board.query.filter_by(id=new_column.board_id, user_id=user_id).first():
                task.column_id = data['column_id']
        try:
            db.session.commit()
            return jsonify({'message': 'Task updated successfully'}), 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message': 'Task update failed'}), 500
    
    elif request.method == "DELETE":
        try:
            db.session.delete(task)
            db.session.commit()
            return jsonify({'message': 'Task deleted successfully'}), 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message': 'Task deletion failed'}), 500

# Comment Routes
@app.route('/api/comment', methods=['POST', 'GET'])
@jwt_required()
def comment():
    user_id = get_jwt_identity()
    
    if request.method == "POST":
        data = request.get_json()
        task_id = data['task_id']
        
        # Verify user owns the board that contains this task
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'message': 'Task not found'}), 404
        
        column = Column.query.get(task.column_id)
        board = Board.query.filter_by(id=column.board_id, user_id=user_id).first()
        if not board:
            return jsonify({'message': 'Access denied'}), 403
        
        new_comment = Comment(name=data['name'], task_id=task_id)
        try:
            db.session.add(new_comment)
            db.session.commit()
            return jsonify({
                'message': 'Comment created successfully!',
                'comment': {
                    'id': new_comment.id,
                    'name': new_comment.name,
                    'task_id': new_comment.task_id
                }
            }), 201
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message': 'Comment creation failed'}), 500
    
    elif request.method == "GET":
        task_id = request.args.get('task_id')
        if not task_id:
            return jsonify({'message': 'task_id parameter required'}), 400
        
        # Verify user owns the board that contains this task
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'message': 'Task not found'}), 404
        
        column = Column.query.get(task.column_id)
        board = Board.query.filter_by(id=column.board_id, user_id=user_id).first()
        if not board:
            return jsonify({'message': 'Access denied'}), 403
        
        comments = Comment.query.filter_by(task_id=task_id).all()
        comments_data = []
        for comment in comments:
            comments_data.append({
                'id': comment.id,
                'name': comment.name,
                'task_id': comment.task_id
            })
        return jsonify({
            'message': 'Comments retrieved successfully',
            'comments': comments_data
        }), 200

@app.route('/api/comment/<int:comment_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def comment_detail(comment_id):
    user_id = get_jwt_identity()
    comment = Comment.query.get(comment_id)
    
    if not comment:
        return jsonify({'message': 'Comment not found'}), 404
    
    # Verify user owns the board that contains this comment
    task = Task.query.get(comment.task_id)
    column = Column.query.get(task.column_id)
    board = Board.query.filter_by(id=column.board_id, user_id=user_id).first()
    if not board:
        return jsonify({'message': 'Access denied'}), 403
    
    if request.method == "GET":
        return jsonify({
            'id': comment.id,
            'name': comment.name,
            'task_id': comment.task_id
        }), 200
    
    elif request.method == "PUT":
        data = request.get_json()
        comment.name = data.get('name', comment.name)
        try:
            db.session.commit()
            return jsonify({'message': 'Comment updated successfully'}), 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message': 'Comment update failed'}), 500
    
    elif request.method == "DELETE":
        try:
            db.session.delete(comment)
            db.session.commit()
            return jsonify({'message': 'Comment deleted successfully'}), 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message': 'Comment deletion failed'}), 500

# Board Member Routes (for sharing boards)
@app.route('/api/board-member', methods=['POST', 'GET'])
@jwt_required()
def board_member():
    user_id = get_jwt_identity()
    
    if request.method == "POST":
        data = request.get_json()
        board_id = data['board_id']
        member_username = data['username']
        role = data.get('role', 'member')
        
        # Verify user owns the board
        board = Board.query.filter_by(id=board_id, user_id=user_id).first()
        if not board:
            return jsonify({'message': 'Board not found or access denied'}), 404
        
        # Find the user to add as member
        member_user = User.query.filter_by(username=member_username).first()
        if not member_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Check if already a member
        existing_member = BoardMember.query.filter_by(user_id=member_user.id, board_id=board_id).first()
        if existing_member:
            return jsonify({'message': 'User is already a member of this board'}), 400
        
        new_member = BoardMember(user_id=member_user.id, board_id=board_id, role=role)
        try:
            db.session.add(new_member)
            db.session.commit()
            return jsonify({
                'message': 'Board member added successfully!',
                'member': {
                    'user_id': new_member.user_id,
                    'board_id': new_member.board_id,
                    'role': new_member.role,
                    'username': member_user.username
                }
            }), 201
        except Exception as e:
            print(e)
            db.session.rollback()
            return jsonify({'message': 'Failed to add board member'}), 500
    
    elif request.method == "GET":
        board_id = request.args.get('board_id')
        if not board_id:
            return jsonify({'message': 'board_id parameter required'}), 400
        
        # Verify user owns the board or is a member
        board = Board.query.filter_by(id=board_id, user_id=user_id).first()
        is_member = BoardMember.query.filter_by(user_id=user_id, board_id=board_id).first()
        
        if not board and not is_member:
            return jsonify({'message': 'Access denied'}), 403
        
        members = db.session.query(BoardMember, User).join(User).filter(BoardMember.board_id == board_id).all()
        members_data = []
        for member, user in members:
            members_data.append({
                'user_id': member.user_id,
                'board_id': member.board_id,
                'role': member.role,
                'username': user.username
            })
        return jsonify({
            'message': 'Board members retrieved successfully',
            'members': members_data
        }), 200

# Debug route - remove in production
@app.route('/api/debug', methods=['GET'])
def debug():
    return jsonify({
        'cookies': dict(request.cookies),
        'headers': dict(request.headers)
    })

# JWT Error Handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_data):
    return jsonify({"message":"Token has expired","error":"token_expired"}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"message":"Signature verification failed", "error":"invalid_token"}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({"message":"Request does not contain an access token","error":"authorization_required"}), 401

if __name__ == "__main__":
    app.run(debug=True)